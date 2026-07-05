from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPIC_BRIEF = ROOT / "examples" / "topic_briefs" / "short-video-scale-makes-evidence-first-ai-video-workflows-necessary_20260705T000000Z.json"
PACKAGE = ROOT / "examples" / "production_packages" / "cnnic_short_video_users_offline_cli_20260705T000000Z"
PRIVACY_PRESET = ROOT / "scripts" / "privacy_mosaic" / "presets" / "douyin_bottom_caption_and_logo.json"
GALLERY = ROOT / "docs" / "sample_gallery.md"


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=True)


def test_topic_brief_fixture_contract() -> None:
    data = json.loads(TOPIC_BRIEF.read_text(encoding="utf-8"))
    for key in ["topic", "hook", "why_now", "source_candidates", "video_angle", "evidence_needed", "risk_notes"]:
        assert data.get(key), key
    assert data["discovery_mode"] == "offline_fixture"
    assert data["review_gate"] == "human_topic_review_required_before_capture_or_render"


def test_build_topic_brief_cli_smoke() -> None:
    result = run([
        "python",
        "scripts/topic_discovery/build_topic_brief.py",
        "--direction",
        "ai_video_tools",
        "--timestamp",
        "20260705T000000Z",
    ])
    assert "topic_brief_written" in result.stdout


def test_production_package_validator() -> None:
    result = run(["python", "scripts/workflow/validate_production_package.py", str(PACKAGE)])
    assert '"status": "ok"' in result.stdout


def test_sync_timeline_basic_contract() -> None:
    sync = json.loads((PACKAGE / "sync_timeline.json").read_text(encoding="utf-8"))
    events = sync["events"]
    assert events == sorted(events, key=lambda event: event["start_ms"])
    assert all(event["end_ms"] > event["start_ms"] for event in events)
    assert all(event.get("voiceover_text") for event in events)


def test_privacy_mask_preset_contract() -> None:
    preset = json.loads(PRIVACY_PRESET.read_text(encoding="utf-8"))
    assert preset["regions"]
    for region in preset["regions"]:
        assert region["label"]
        assert region["normalized"] is True
        for key in ["x", "y", "width", "height"]:
            assert 0 <= region[key] <= 1
        assert region["width"] > 0
        assert region["height"] > 0


def test_sample_gallery_lists_review_fixture() -> None:
    text = GALLERY.read_text(encoding="utf-8")
    assert "cnnic_short_video_users_offline_cli_20260705T000000Z" in text
    assert "retain_as_offline_review_fixture" in text
    assert "preview.html" in text
    assert "recipe.md" in text
