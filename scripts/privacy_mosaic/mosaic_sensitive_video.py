from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from typing import Any

import cv2
import numpy as np


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Apply pixel mosaic to faces and/or configured sensitive regions in a video."
    )
    parser.add_argument("--input", required=True, help="Input video path.")
    parser.add_argument("--output", required=True, help="Output video path.")
    parser.add_argument(
        "--mode",
        choices=["faces", "regions", "both"],
        default="faces",
        help="What to mosaic.",
    )
    parser.add_argument(
        "--regions-json",
        help=(
            "Optional JSON file with regions. Format: "
            "[{\"x\":0,\"y\":0,\"width\":100,\"height\":80}] or normalized values with normalized=true."
        ),
    )
    parser.add_argument("--mosaic-cell", type=int, default=18, help="Pixel block size for mosaic.")
    parser.add_argument(
        "--effect",
        choices=["mosaic", "blur", "blur_mosaic", "solid"],
        default="mosaic",
        help="Privacy effect. Use blur_mosaic for face anonymization with better visual continuity.",
    )
    parser.add_argument(
        "--mask-shape",
        choices=["rectangle", "ellipse"],
        default="rectangle",
        help="Shape for blur or solid masks.",
    )
    parser.add_argument(
        "--solid-color",
        default="#171512",
        help="Solid mask color as hex RGB, used with --effect solid.",
    )
    parser.add_argument("--face-padding", type=float, default=0.18, help="Padding around detected face boxes.")
    parser.add_argument("--sample-every", type=int, default=1, help="Run face detection every N frames.")
    parser.add_argument("--min-neighbors", type=int, default=5, help="OpenCV Haar minNeighbors.")
    parser.add_argument("--scale-factor", type=float, default=1.08, help="OpenCV Haar scaleFactor.")
    parser.add_argument("--min-face-size", type=int, default=70, help="Minimum face size in pixels.")
    parser.add_argument("--yunet-score", type=float, default=0.62, help="YuNet face score threshold.")
    parser.add_argument(
        "--yunet-model",
        default="scripts/privacy_mosaic/models/face_detection_yunet_2023mar.onnx",
        help="YuNet ONNX model path. Downloaded automatically if missing.",
    )
    parser.add_argument("--debug-json", help="Write detection summary JSON.")
    parser.add_argument("--keep-video-only", action="store_true", help="Keep the intermediate video-only file.")
    return parser.parse_args()


def clamp_box(x: int, y: int, width: int, height: int, frame_width: int, frame_height: int) -> tuple[int, int, int, int]:
    left = max(0, x)
    top = max(0, y)
    right = min(frame_width, x + width)
    bottom = min(frame_height, y + height)
    return left, top, max(0, right - left), max(0, bottom - top)


def padded_box(
    box: tuple[int, int, int, int], padding: float, frame_width: int, frame_height: int
) -> tuple[int, int, int, int]:
    x, y, width, height = box
    pad_x = int(width * padding)
    pad_y = int(height * padding)
    return clamp_box(x - pad_x, y - pad_y, width + pad_x * 2, height + pad_y * 2, frame_width, frame_height)


def pixelate_region(frame: np.ndarray, box: tuple[int, int, int, int], cell: int) -> None:
    x, y, width, height = box
    if width <= 0 or height <= 0:
        return
    roi = frame[y : y + height, x : x + width]
    small_width = max(1, width // max(1, cell))
    small_height = max(1, height // max(1, cell))
    small = cv2.resize(roi, (small_width, small_height), interpolation=cv2.INTER_LINEAR)
    mosaic = cv2.resize(small, (width, height), interpolation=cv2.INTER_NEAREST)
    frame[y : y + height, x : x + width] = mosaic


def parse_hex_color(value: str) -> tuple[int, int, int]:
    text = value.strip().lstrip("#")
    if len(text) != 6:
        raise ValueError(f"Expected 6-digit hex color, got: {value}")
    red = int(text[0:2], 16)
    green = int(text[2:4], 16)
    blue = int(text[4:6], 16)
    return blue, green, red


def apply_masked_region(
    frame: np.ndarray,
    box: tuple[int, int, int, int],
    effect: str,
    mask_shape: str,
    cell: int,
    solid_color: tuple[int, int, int],
) -> None:
    x, y, width, height = box
    if width <= 0 or height <= 0:
        return

    roi = frame[y : y + height, x : x + width]
    if effect == "mosaic":
        replacement = roi.copy()
        pixelate_region(replacement, (0, 0, width, height), cell)
    elif effect == "blur":
        kernel = max(21, (cell * 2) | 1)
        replacement = cv2.GaussianBlur(roi, (kernel, kernel), 0)
    elif effect == "blur_mosaic":
        replacement = roi.copy()
        pixelate_region(replacement, (0, 0, width, height), cell)
        kernel = max(7, ((cell // 2) * 2) | 1)
        replacement = cv2.GaussianBlur(replacement, (kernel, kernel), 0)
    elif effect == "solid":
        replacement = np.zeros_like(roi)
        replacement[:, :] = solid_color
    else:
        raise ValueError(f"Unsupported effect: {effect}")

    if mask_shape == "rectangle":
        frame[y : y + height, x : x + width] = replacement
        return

    mask = np.zeros((height, width), dtype=np.uint8)
    cv2.ellipse(
        mask,
        (width // 2, height // 2),
        (max(1, width // 2), max(1, height // 2)),
        0,
        0,
        360,
        255,
        -1,
    )
    mask_3 = cv2.merge([mask, mask, mask])
    blended = np.where(mask_3 == 255, replacement, roi)
    frame[y : y + height, x : x + width] = blended


def load_regions(path: str | None, frame_width: int, frame_height: int) -> list[tuple[int, int, int, int]]:
    if not path:
        return []
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    regions = data.get("regions", data) if isinstance(data, dict) else data
    output: list[tuple[int, int, int, int]] = []
    for item in regions:
        normalized = bool(item.get("normalized", False))
        if normalized:
            x = int(float(item["x"]) * frame_width)
            y = int(float(item["y"]) * frame_height)
            width = int(float(item["width"]) * frame_width)
            height = int(float(item["height"]) * frame_height)
        else:
            x = int(item["x"])
            y = int(item["y"])
            width = int(item["width"])
            height = int(item["height"])
        output.append(clamp_box(x, y, width, height, frame_width, frame_height))
    return output


def has_audio(input_path: Path) -> bool:
    if not shutil.which("ffprobe"):
        return False
    command = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "a:0",
        "-show_entries",
        "stream=codec_type",
        "-of",
        "csv=p=0",
        str(input_path),
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    return "audio" in result.stdout


def mux_audio(original: Path, video_only: Path, output: Path) -> bool:
    if not shutil.which("ffmpeg"):
        shutil.copyfile(video_only, output)
        return False

    if has_audio(original):
        command = [
            "ffmpeg",
            "-y",
            "-v",
            "warning",
            "-i",
            str(video_only),
            "-i",
            str(original),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-shortest",
            str(output),
        ]
    else:
        command = [
            "ffmpeg",
            "-y",
            "-v",
            "warning",
            "-i",
            str(video_only),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-an",
            str(output),
        ]
    result = subprocess.run(command, check=False)
    if result.returncode != 0:
        shutil.copyfile(video_only, output)
        return False
    return True


def ensure_yunet_model(model_path: Path) -> Path:
    if model_path.exists() and model_path.stat().st_size > 100_000:
        return model_path
    model_path.parent.mkdir(parents=True, exist_ok=True)
    url = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
    urllib.request.urlretrieve(url, model_path)
    return model_path


def create_face_detector(args: argparse.Namespace, frame_width: int, frame_height: int) -> tuple[str, Any]:
    if hasattr(cv2, "FaceDetectorYN_create"):
        model_path = ensure_yunet_model(Path(args.yunet_model))
        detector = cv2.FaceDetectorYN_create(
            str(model_path),
            "",
            (frame_width, frame_height),
            score_threshold=float(args.yunet_score),
            nms_threshold=0.3,
            top_k=5000,
        )
        return "yunet", detector

    if hasattr(cv2, "CascadeClassifier"):
        cascade_path = Path(cv2.data.haarcascades) / "haarcascade_frontalface_alt2.xml"
        detector = cv2.CascadeClassifier(str(cascade_path))
        if detector.empty():
            raise RuntimeError(f"Cannot load face cascade: {cascade_path}")
        return "haar", detector

    raise RuntimeError("This OpenCV build has neither FaceDetectorYN nor CascadeClassifier.")


def detect_faces(
    detector_kind: str,
    detector: Any,
    frame: np.ndarray,
    args: argparse.Namespace,
    frame_width: int,
    frame_height: int,
) -> list[tuple[int, int, int, int]]:
    if detector_kind == "yunet":
        detector.setInputSize((frame_width, frame_height))
        _, faces = detector.detect(frame)
        if faces is None:
            return []
        boxes = []
        for face in faces:
            x, y, width, height = [int(value) for value in face[:4]]
            if width < args.min_face_size or height < args.min_face_size:
                continue
            boxes.append(padded_box((x, y, width, height), args.face_padding, frame_width, frame_height))
        return boxes

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    raw_faces = detector.detectMultiScale(
        gray,
        scaleFactor=args.scale_factor,
        minNeighbors=args.min_neighbors,
        minSize=(args.min_face_size, args.min_face_size),
    )
    return [
        padded_box((int(x), int(y), int(w), int(h)), args.face_padding, frame_width, frame_height)
        for x, y, w, h in raw_faces
    ]


def main() -> int:
    args = parse_args()
    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    capture = cv2.VideoCapture(str(input_path))
    if not capture.isOpened():
        raise RuntimeError(f"Cannot open input video: {input_path}")

    fps = capture.get(cv2.CAP_PROP_FPS) or 30
    frame_width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))

    regions = load_regions(args.regions_json, frame_width, frame_height)
    solid_color = parse_hex_color(args.solid_color)
    detector_kind = "none"
    face_detector = None
    if args.mode in {"faces", "both"}:
        detector_kind, face_detector = create_face_detector(args, frame_width, frame_height)

    temp_dir = Path(tempfile.mkdtemp(prefix="mosaic_video_", dir=str(output_path.parent)))
    video_only_path = temp_dir / f"{output_path.stem}_video_only.mp4"
    writer = cv2.VideoWriter(
        str(video_only_path),
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (frame_width, frame_height),
    )
    if not writer.isOpened():
        raise RuntimeError(f"Cannot create output video: {video_only_path}")

    frame_index = 0
    last_faces: list[tuple[int, int, int, int]] = []
    detected_frames = 0
    total_faces = 0

    while True:
        ok, frame = capture.read()
        if not ok:
            break

        boxes: list[tuple[int, int, int, int]] = []
        if args.mode in {"faces", "both"}:
            if frame_index % max(1, args.sample_every) == 0:
                last_faces = detect_faces(detector_kind, face_detector, frame, args, frame_width, frame_height)
                if last_faces:
                    detected_frames += 1
                    total_faces += len(last_faces)
            boxes.extend(last_faces)

        if args.mode in {"regions", "both"}:
            boxes.extend(regions)

        for box in boxes:
            apply_masked_region(
                frame,
                box,
                args.effect,
                args.mask_shape,
                max(2, args.mosaic_cell),
                solid_color,
            )

        writer.write(frame)
        frame_index += 1

    capture.release()
    writer.release()

    audio_muxed = mux_audio(input_path, video_only_path, output_path)
    if args.keep_video_only:
        kept = output_path.with_name(f"{output_path.stem}_video_only.mp4")
        shutil.copyfile(video_only_path, kept)
    shutil.rmtree(temp_dir, ignore_errors=True)

    summary: dict[str, Any] = {
        "input": str(input_path),
        "output": str(output_path),
        "mode": args.mode,
        "face_detector": detector_kind,
        "effect": args.effect,
        "mask_shape": args.mask_shape,
        "solid_color": args.solid_color,
        "frame_width": frame_width,
        "frame_height": frame_height,
        "fps": fps,
        "input_frame_count": frame_count,
        "processed_frame_count": frame_index,
        "static_region_count": len(regions),
        "frames_with_faces": detected_frames,
        "total_face_detections": total_faces,
        "audio_muxed": audio_muxed,
    }
    if args.debug_json:
        Path(args.debug_json).write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
