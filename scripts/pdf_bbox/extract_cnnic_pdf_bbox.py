from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import pdfplumber
from PIL import Image, ImageDraw


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract a target text bbox from the CNNIC PDF and map it to PNG pixels.")
    parser.add_argument("--pdf", default="examples/source_capture/official_sources/cnnic_55_statistical_report.pdf")
    parser.add_argument("--page-number", type=int, default=40, help="1-based PDF page number.")
    parser.add_argument("--image", default="apps/remotion_director/public/sample_assets/official_cnnic_page_40.png")
    parser.add_argument(
        "--target",
        default="short video users amounted to 1,040 million, making up 93.8% of all Internet users.",
    )
    parser.add_argument("--output-json", default="outputs/mainline_v4_sync/cnnic_pdf_bbox.json")
    parser.add_argument("--output-ts", default="apps/remotion_director/src/cnnic_pdf_bbox_v4.ts")
    parser.add_argument("--debug-image", default="outputs/mainline_v4_sync/cnnic_pdf_bbox_debug.png")
    return parser.parse_args()


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower()).strip()


def normalize_token(value: str) -> str:
    return re.sub(r"(^[^\w\d]+|[^\w\d]+$)", "", value.lower())


def words_to_text(words: list[dict[str, Any]]) -> str:
    return normalize_text(" ".join(str(word["text"]) for word in words))


def find_target_words(words: list[dict[str, Any]], target: str) -> list[dict[str, Any]]:
    target_tokens = [normalize_token(token) for token in target.split()]
    source_tokens = [normalize_token(str(word["text"])) for word in words]
    for start in range(len(source_tokens) - len(target_tokens) + 1):
        current = source_tokens[start : start + len(target_tokens)]
        if current == target_tokens:
            return words[start : start + len(target_tokens)]

    normalized_target = normalize_text(target)
    best: list[dict[str, Any]] = []
    for start in range(len(words)):
        current_words: list[dict[str, Any]] = []
        for end in range(start, min(len(words), start + 24)):
            current_words.append(words[end])
            text = words_to_text(current_words)
            if normalized_target in text:
                return current_words
            if len(text) > len(normalized_target) + 80:
                break
        if len(current_words) > len(best):
            best = current_words
    raise RuntimeError(f"Could not find target text: {target}")


def union_bbox(words: list[dict[str, Any]]) -> dict[str, float]:
    return {
        "x0": min(float(word["x0"]) for word in words),
        "top": min(float(word["top"]) for word in words),
        "x1": max(float(word["x1"]) for word in words),
        "bottom": max(float(word["bottom"]) for word in words),
    }


def group_words_by_line(words: list[dict[str, Any]], tolerance: float = 3.0) -> list[list[dict[str, Any]]]:
    lines: list[list[dict[str, Any]]] = []
    sorted_words = sorted(words, key=lambda word: (float(word["top"]), float(word["x0"])))
    for word in sorted_words:
        word_top = float(word["top"])
        placed = False
        for line in lines:
            line_top = sum(float(item["top"]) for item in line) / len(line)
            if abs(word_top - line_top) <= tolerance:
                line.append(word)
                placed = True
                break
        if not placed:
            lines.append([word])

    for line in lines:
        line.sort(key=lambda word: float(word["x0"]))
    return lines


def inflate_bbox(bbox: dict[str, float], pad_x: float, pad_y: float) -> dict[str, float]:
    return {
        "x0": bbox["x0"] - pad_x,
        "top": bbox["top"] - pad_y,
        "x1": bbox["x1"] + pad_x,
        "bottom": bbox["bottom"] + pad_y,
    }


def scale_bbox(bbox: dict[str, float], scale_x: float, scale_y: float) -> dict[str, int]:
    left = round(bbox["x0"] * scale_x)
    top = round(bbox["top"] * scale_y)
    right = round(bbox["x1"] * scale_x)
    bottom = round(bbox["bottom"] * scale_y)
    return {
        "x": left,
        "y": top,
        "width": right - left,
        "height": bottom - top,
        "right": right,
        "bottom": bottom,
    }


def make_underlines(boxes: list[dict[str, int]], gap: int = 9, height: int = 9) -> list[dict[str, int]]:
    return [
        {
            "x": box["x"],
            "y": box["y"] + box["height"] + gap,
            "width": box["width"],
            "height": height,
        }
        for box in boxes
    ]


def make_background_segments(boxes: list[dict[str, int]], pad_x: int = 2, pad_y: int = 2) -> list[dict[str, int]]:
    return [
        {
            "x": box["x"] - pad_x,
            "y": box["y"] - pad_y,
            "width": box["width"] + pad_x * 2,
            "height": box["height"] + pad_y * 2,
        }
        for box in boxes
    ]


def write_ts(path: Path, data: dict[str, Any]) -> None:
    highlight = data["imageBboxPadded"]
    line_boxes = json.dumps(data["imageLineBboxesPadded"], ensure_ascii=False, indent=2)
    underline_segments = json.dumps(data["imageUnderlineSegments"], ensure_ascii=False, indent=2)
    background_segments = json.dumps(data["imageBackgroundSegments"], ensure_ascii=False, indent=2)
    path.write_text(
        "export const cnnicPdfHighlightV4 = {\n"
        f"  x: {highlight['x']},\n"
        f"  y: {highlight['y']},\n"
        f"  width: {highlight['width']},\n"
        f"  height: {highlight['height']},\n"
        f"  lineBoxes: {line_boxes},\n"
        f"  underlineSegments: {underline_segments},\n"
        f"  backgroundSegments: {background_segments},\n"
        "  preferredStyle: \"line_box\",\n"
        f"  target: {json.dumps(data['target'], ensure_ascii=False)},\n"
        f"  pageNumber: {data['pageNumber']},\n"
        "} as const;\n",
        encoding="utf-8",
    )


def main() -> int:
    args = parse_args()
    pdf_path = Path(args.pdf)
    image_path = Path(args.image)
    output_json = Path(args.output_json)
    output_ts = Path(args.output_ts)
    debug_image = Path(args.debug_image)

    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[args.page_number - 1]
        words = page.extract_words(keep_blank_chars=False, use_text_flow=True)
        matched = find_target_words(words, args.target)
        matched_lines = group_words_by_line(matched)
        bbox = union_bbox(matched)
        line_bboxes = [union_bbox(line) for line in matched_lines]
        padded = inflate_bbox(bbox, pad_x=2.0, pad_y=2.2)
        line_bboxes_padded = [inflate_bbox(line_bbox, pad_x=2.0, pad_y=2.2) for line_bbox in line_bboxes]
        page_width = float(page.width)
        page_height = float(page.height)

    with Image.open(image_path) as image:
        image_width, image_height = image.size
        scale_x = image_width / page_width
        scale_y = image_height / page_height
        image_bbox = scale_bbox(bbox, scale_x, scale_y)
        image_bbox_padded = scale_bbox(padded, scale_x, scale_y)
        image_line_bboxes = [scale_bbox(line_bbox, scale_x, scale_y) for line_bbox in line_bboxes]
        image_line_bboxes_padded = [scale_bbox(line_bbox, scale_x, scale_y) for line_bbox in line_bboxes_padded]
        image_underline_segments = make_underlines(image_line_bboxes_padded)
        image_background_segments = make_background_segments(image_line_bboxes_padded)

        annotated = image.copy()
        draw = ImageDraw.Draw(annotated)
        for rect in image_background_segments:
            draw.rectangle(
                [rect["x"], rect["y"], rect["x"] + rect["width"], rect["y"] + rect["height"]],
                fill=(198, 40, 40, 32),
            )
        for rect in image_line_bboxes_padded:
            draw.rectangle(
                [rect["x"], rect["y"], rect["right"], rect["bottom"]],
                outline=(198, 40, 40),
                width=8,
            )
        for segment in image_underline_segments:
            draw.rectangle(
                [segment["x"], segment["y"], segment["x"] + segment["width"], segment["y"] + segment["height"]],
                fill=(198, 40, 40),
            )
        debug_image.parent.mkdir(parents=True, exist_ok=True)
        annotated.save(debug_image)

    data = {
        "pdf": str(pdf_path),
        "image": str(image_path),
        "target": args.target,
        "pageNumber": args.page_number,
        "pageSize": {"width": page_width, "height": page_height},
        "imageSize": {"width": image_width, "height": image_height},
        "scale": {"x": scale_x, "y": scale_y},
        "pdfBbox": bbox,
        "pdfBboxPadded": padded,
        "pdfLineBboxes": line_bboxes,
        "pdfLineBboxesPadded": line_bboxes_padded,
        "imageBbox": image_bbox,
        "imageBboxPadded": image_bbox_padded,
        "imageLineBboxes": image_line_bboxes,
        "imageLineBboxesPadded": image_line_bboxes_padded,
        "imageUnderlineSegments": image_underline_segments,
        "imageBackgroundSegments": image_background_segments,
        "preferredStyle": "line_box",
        "fallbackStyles": ["underline", "background"],
        "matchedText": " ".join(str(word["text"]) for word in matched),
    }

    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    output_ts.parent.mkdir(parents=True, exist_ok=True)
    write_ts(output_ts, data)
    print(json.dumps({"outputJson": str(output_json), "outputTs": str(output_ts), "debugImage": str(debug_image)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
