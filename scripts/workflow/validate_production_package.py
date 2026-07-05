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
    "sync_timeline.json",
    "privacy_check.md",
    "render_report.md",
]
REQUIRED_EVENT_FIELDS = [
    "source_id",
    "visual_action",
    "zoom_or_highlight",
    "privacy_action",
    "voiceover_density",
    "comfort_note",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate an offline evidence-driven production package.")
    parser.add_argument("package_dir", help="Package directory to validate.")
    return parser.parse_args()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_package(package_dir: Path) -> list[str]:
    errors: list[str] = []
    for name in REQUIRED_FILES:
        require((package_dir / name).exists(), f"missing required file: {name}", errors)
    if errors:
        return errors

    run_manifest = read_json(package_dir / "run_manifest.json")
    source_manifest = read_json(package_dir / "source_manifest.json")
    sync = read_json(package_dir / "sync_timeline.json")

    require(bool(run_manifest.get("package_id")), "run_manifest.package_id is required", errors)
    require(run_manifest.get("review_gate") == "human_review_required_before_publish", "run_manifest.review_gate must require human review", errors)
    require(source_manifest.get("package_id") == run_manifest.get("package_id"), "source_manifest package_id mismatch", errors)
    require(isinstance(source_manifest.get("sources"), list) and len(source_manifest["sources"]) > 0, "source_manifest.sources must be non-empty", errors)

    events = sync.get("events")
    require(isinstance(events, list) and len(events) > 0, "sync_timeline.events must be non-empty", errors)
    last_end = -1
    for index, event in enumerate(events or []):
        start = event.get("start_ms")
        end = event.get("end_ms")
        require(isinstance(start, int) and isinstance(end, int), f"event {index} start_ms/end_ms must be integers", errors)
        if isinstance(start, int) and isinstance(end, int):
            require(start >= 0 and end > start, f"event {index} must have positive duration", errors)
            require(start >= last_end, f"event {index} overlaps or is out of order", errors)
            last_end = end
        require(bool(event.get("voiceover_text")), f"event {index} voiceover_text is required", errors)
        require(bool(event.get("review_status")), f"event {index} review_status is required", errors)
        for field in REQUIRED_EVENT_FIELDS:
            require(bool(event.get(field)), f"event {index} {field} is required", errors)

    with (package_dir / "asset_manifest.csv").open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    require(len(rows) > 0, "asset_manifest.csv must contain at least one asset", errors)
    for index, row in enumerate(rows):
        require(bool(row.get("asset_id")), f"asset row {index} asset_id is required", errors)
        require(row.get("public_commit_allowed") in {"true", "false"}, f"asset row {index} public_commit_allowed must be true/false", errors)
        require(bool(row.get("risk_notes")), f"asset row {index} risk_notes is required", errors)

    return errors


def main() -> int:
    args = parse_args()
    errors = validate_package(Path(args.package_dir))
    if errors:
        print(json.dumps({"status": "invalid", "errors": errors}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps({"status": "ok", "package_dir": args.package_dir}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
