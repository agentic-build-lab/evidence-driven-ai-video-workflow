from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPIC_BRIEF = ROOT / "examples" / "topic_briefs" / "short-video-scale-makes-evidence-first-ai-video-workflows-necessary_20260705T000000Z.json"
PACKAGE = ROOT / "examples" / "production_packages" / "cnnic_short_video_users_offline_cli_20260705T000000Z"
VIDEO_MONTAGE_PACKAGE = ROOT / "examples" / "production_packages" / "ice_water_stomach_video_montage_20260705T000000Z"
FASTCUT_PACKAGE = ROOT / "examples" / "production_packages" / "ice_water_stomach_fastcut_v2_20260705T000000Z"
PRIVACY_PRESET = ROOT / "scripts" / "privacy_mosaic" / "presets" / "douyin_bottom_caption_and_logo.json"
GALLERY = ROOT / "docs" / "sample_gallery.md"
PROVIDER_ADAPTERS = ROOT / "configs" / "topic_discovery" / "provider_adapters.json"


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
    for event in events:
        for key in ["source_id", "visual_action", "zoom_or_highlight", "privacy_action", "voiceover_density", "comfort_note"]:
            assert event.get(key), key


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


def test_provider_adapter_policy_contract() -> None:
    data = json.loads(PROVIDER_ADAPTERS.read_text(encoding="utf-8"))
    assert data["default_mode"] == "official_and_public_frontdoor_first"
    assert data["review_gate"] == "human_topic_review_required_before_capture_or_render"
    providers = {provider["id"]: provider for provider in data["providers"]}
    assert "offline_fixture" in providers
    assert providers["offline_fixture"]["status"] == "enabled"
    assert providers["social_comment_or_trend_adapter"]["status"] == "isolated_low_priority_fallback"
    for provider in data["providers"]:
        assert provider["compliance_boundary"]
        assert provider["output"]


def test_video_montage_package_contract() -> None:
    result = run(["python", "scripts/workflow/validate_video_montage_package.py", str(VIDEO_MONTAGE_PACKAGE)])
    assert '"status": "ok"' in result.stdout
    timeline = json.loads((VIDEO_MONTAGE_PACKAGE / "montage_timeline.json").read_text(encoding="utf-8"))
    real_clips = [clip for clip in timeline["timeline"] if clip["source_id"] != "package_manifest"]
    assert len(real_clips) >= 4
    preview = (VIDEO_MONTAGE_PACKAGE / "preview.html").read_text(encoding="utf-8")
    assert "<video" in preview
    assert "Review gate" in preview


def test_fastcut_video_montage_style_contract() -> None:
    result = run(["python", "scripts/workflow/validate_video_montage_package.py", str(FASTCUT_PACKAGE)])
    assert '"status": "ok"' in result.stdout
    timeline = json.loads((FASTCUT_PACKAGE / "montage_timeline.json").read_text(encoding="utf-8"))
    transitions = [clip["transition"] for clip in timeline["timeline"]]
    assert all(value == "hard_cut" or value.startswith("chapter_") for value in transitions)
    assert transitions.count("hard_cut") >= 5
    preview = (FASTCUT_PACKAGE / "preview.html").read_text(encoding="utf-8")
    assert "class=\"caption\"" in preview
    assert "<span>" in preview
