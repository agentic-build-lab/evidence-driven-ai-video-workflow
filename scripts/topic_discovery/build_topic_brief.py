from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_FIXTURES = ROOT / "configs" / "topic_discovery" / "offline_fixture_topics.json"
DEFAULT_OUTPUT_DIR = ROOT / "examples" / "topic_briefs"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "topic"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a reviewable topic brief from offline fixtures or user-supplied direction.")
    parser.add_argument("--direction", required=True, help="Broad topic direction, for example ai_video_tools.")
    parser.add_argument("--fixtures", default=str(DEFAULT_FIXTURES), help="Offline fixture JSON file.")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Directory for generated topic brief JSON.")
    parser.add_argument("--timestamp", help="UTC timestamp override for reproducible tests, format YYYYMMDDTHHMMSSZ.")
    return parser.parse_args()


def load_fixtures(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    items = data.get("items")
    if not isinstance(items, list):
        raise ValueError(f"Fixture file must contain an items array: {path}")
    return items


def choose_fixture(items: list[dict[str, Any]], direction: str) -> dict[str, Any]:
    normalized = direction.lower().strip()
    for item in items:
        if str(item.get("direction", "")).lower() == normalized:
            return item
    available = ", ".join(sorted(str(item.get("direction")) for item in items))
    raise ValueError(f"No offline fixture for direction '{direction}'. Available directions: {available}")


def timestamp_to_created_at(timestamp: str) -> str:
    try:
        return datetime.strptime(timestamp, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    except ValueError:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def build_brief(item: dict[str, Any], timestamp: str) -> dict[str, Any]:
    return {
        "brief_id": f"{slugify(str(item['topic']))}_{timestamp}",
        "created_at": timestamp_to_created_at(timestamp),
        "discovery_mode": "offline_fixture",
        "review_gate": "human_topic_review_required_before_capture_or_render",
        "topic": item["topic"],
        "hook": item["hook"],
        "why_now": item["why_now"],
        "source_candidates": item["source_candidates"],
        "video_angle": item["video_angle"],
        "evidence_needed": item["evidence_needed"],
        "risk_notes": item["risk_notes"],
        "risk_level": item.get("risk_level", "unknown"),
    }


def main() -> int:
    args = parse_args()
    fixtures_path = Path(args.fixtures)
    output_dir = Path(args.output_dir)
    timestamp = args.timestamp or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    item = choose_fixture(load_fixtures(fixtures_path), args.direction)
    brief = build_brief(item, timestamp)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{brief['brief_id']}.json"
    output_path.write_text(json.dumps(brief, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"event": "topic_brief_written", "output": str(output_path), "brief_id": brief["brief_id"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
