from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any

REQUIRED_FILES = [
    "run_manifest.json",
    "source_manifest.json",
    "asset_manifest.csv",
    "montage_timeline.json",
    "preview.html",
    "privacy_check.md",
    "render_report.md",
    "quality_review.md",
    "recipe.md",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate a public-video montage production package.")
    parser.add_argument("package_dir")
    return parser.parse_args()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate(package_dir: Path) -> list[str]:
    errors: list[str] = []
    for name in REQUIRED_FILES:
        require((package_dir / name).exists(), f"missing required file: {name}", errors)
    if errors:
        return errors

    run = read_json(package_dir / "run_manifest.json")
    source_manifest = read_json(package_dir / "source_manifest.json")
    timeline = read_json(package_dir / "montage_timeline.json")
    require(run.get("review_gate") == "human_review_required_before_publish", "run_manifest review gate is required", errors)
    require(run.get("remote_video_urls_only") is True, "package must declare remote_video_urls_only", errors)
    sources = {source["source_id"]: source for source in source_manifest.get("sources", [])}
    require(len(sources) >= 4, "at least 4 real video sources are required", errors)

    clips = timeline.get("timeline", [])
    real_clips = [clip for clip in clips if clip.get("source_id") != "package_manifest"]
    require(len(real_clips) >= 4, "at least 4 real video clips are required", errors)
    last_end = -1
    for index, clip in enumerate(clips):
        start = clip.get("start_ms")
        end = clip.get("end_ms")
        require(isinstance(start, int) and isinstance(end, int) and end > start, f"clip {index} has invalid timing", errors)
        if isinstance(start, int):
            require(start >= last_end, f"clip {index} is out of order or overlaps", errors)
            last_end = end
        for field in ["clip_id", "source_id", "duration_ms", "caption", "source_credit", "risk_note", "visual_action", "crop", "transition"]:
            require(bool(clip.get(field)), f"clip {index} missing {field}", errors)
        if isinstance(start, int) and isinstance(end, int) and isinstance(clip.get("duration_ms"), int):
            require(clip["duration_ms"] == end - start, f"clip {index} duration_ms must equal end_ms-start_ms", errors)
        transition = clip.get("transition")
        require(transition == "hard_cut" or str(transition).startswith("chapter_"), f"clip {index} transition must be hard_cut or chapter-level", errors)
        if clip.get("source_id") != "package_manifest":
            source = sources.get(clip["source_id"])
            require(source is not None, f"clip {index} references unknown source", errors)
            if source:
                require(source.get("video_url", "").startswith("https://"), f"clip {index} source video_url must be https", errors)
                require(source.get("risk_level") in {"green", "yellow", "red"}, f"clip {index} risk level invalid", errors)
                require(source.get("risk_level") != "red", f"clip {index} red source cannot enter automatic montage", errors)

    with (package_dir / "asset_manifest.csv").open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    require(len(rows) >= len(sources), "asset manifest must include source assets", errors)
    preview = (package_dir / "preview.html").read_text(encoding="utf-8")
    require("<video" in preview, "preview must contain real video tags", errors)
    require("Review gate" in preview, "preview must show review gate", errors)
    return errors


def main() -> int:
    args = parse_args()
    errors = validate(Path(args.package_dir))
    if errors:
        print(json.dumps({"status": "invalid", "errors": errors}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps({"status": "ok", "package_dir": args.package_dir}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
