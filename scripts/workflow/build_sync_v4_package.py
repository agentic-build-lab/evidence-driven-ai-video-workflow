from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "outputs"
REMOTION_SRC = ROOT / "apps" / "remotion_director" / "src"
SYNC_OUTPUT = OUTPUT / "mainline_v4_sync"
FPS = 30


def with_frames(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    output = []
    for event in events:
        item = dict(event)
        item["startFrame"] = round(float(item["startSec"]) * FPS)
        item["endFrame"] = round(float(item["endSec"]) * FPS)
        item["durationFrame"] = item["endFrame"] - item["startFrame"]
        output.append(item)
    return output


def build_events() -> list[dict[str, Any]]:
    return with_frames(
        [
            {
                "id": "official_source_context",
                "startSec": 0.0,
                "endSec": 3.2,
                "narration": "真正重要的是来源",
                "visualTarget": "cnninc_xinhua_full_view",
                "action": "show_full_source",
            },
            {
                "id": "official_pages_visible",
                "startSec": 3.2,
                "endSec": 8.42,
                "narration": "镜头先把官方页面摆出来，让观众知道这是新华网和CNNIC报告",
                "visualTarget": "cnnic_report_and_xinhua_page",
                "action": "hold_source_identity",
            },
            {
                "id": "official_zoom_to_key_sentence",
                "startSec": 8.56,
                "endSec": 9.8,
                "narration": "然后再推近到关键句",
                "visualTarget": "cnnic_short_video_sentence",
                "action": "zoom_to_focus",
            },
            {
                "id": "official_highlight_key_sentence",
                "startSec": 9.8,
                "endSec": 11.76,
                "narration": "短视频用户已经超过十亿",
                "visualTarget": "short_video_users_1040_million",
                "action": "red_box_and_underline",
            },
            {
                "id": "platform_not_perfect",
                "startSec": 11.96,
                "endSec": 14.5,
                "narration": "不是说AI视频已经完美了",
                "visualTarget": "platform_warning_card",
                "action": "show_caution",
            },
            {
                "id": "platform_tool_landscape",
                "startSec": 14.64,
                "endSec": 17.6,
                "narration": "Sora、Veo、Runway这些官网",
                "visualTarget": "veo_runway_capcut_panels",
                "action": "reveal_platform_sources",
            },
            {
                "id": "platform_available_stage",
                "startSec": 17.6,
                "endSec": 20.4,
                "narration": "视频生成进入了可用阶段",
                "visualTarget": "veo_runway_active_panels",
                "action": "focus_active_platform_panel",
            },
            {
                "id": "platform_control_problem",
                "startSec": 20.4,
                "endSec": 23.84,
                "narration": "真正难的是稳定、可控、可复用",
                "visualTarget": "stable_control_reusable_card",
                "action": "show_conclusion_card",
            },
            {
                "id": "workflow_not_button",
                "startSec": 24.04,
                "endSec": 26.0,
                "narration": "方向不是做一个按钮",
                "visualTarget": "director_system_card",
                "action": "show_director_system",
            },
            {
                "id": "workflow_research_script_voice",
                "startSec": 26.0,
                "endSec": 29.0,
                "narration": "调研、脚本、声音",
                "visualTarget": "flow_nodes_0_to_2",
                "action": "reveal_flow_nodes",
            },
            {
                "id": "workflow_avatar_assets_packaging_qc",
                "startSec": 29.0,
                "endSec": 34.4,
                "narration": "数字人、素材、包装和质检",
                "visualTarget": "flow_nodes_3_to_6",
                "action": "reveal_flow_nodes",
            },
            {
                "id": "workflow_director_system",
                "startSec": 34.54,
                "endSec": 39.54,
                "narration": "能反复生产视频的导演系统",
                "visualTarget": "cited_video_and_system_summary",
                "action": "switch_cited_clip_and_hold",
            },
            {
                "id": "system_source_capture",
                "startSec": 39.74,
                "endSec": 42.4,
                "narration": "官网截图、报告页推近",
                "visualTarget": "capability_check_0_1",
                "action": "reveal_capability_checks",
            },
            {
                "id": "system_external_video_voice",
                "startSec": 42.4,
                "endSec": 44.8,
                "narration": "外部视频素材拉取、本地训练声音",
                "visualTarget": "capability_check_2_4",
                "action": "reveal_capability_checks",
            },
            {
                "id": "system_product_demo",
                "startSec": 44.8,
                "endSec": 46.4,
                "narration": "产品页面演示",
                "visualTarget": "studio_assets_zoom",
                "action": "product_zoom_lock",
            },
            {
                "id": "issue_asset_license",
                "startSec": 46.54,
                "endSec": 47.5,
                "narration": "素材授权",
                "visualTarget": "issue_0",
                "action": "reveal_issue",
            },
            {
                "id": "issue_motion_realism",
                "startSec": 47.5,
                "endSec": 48.5,
                "narration": "动作真实感",
                "visualTarget": "issue_1",
                "action": "reveal_issue",
            },
            {
                "id": "issue_long_rhythm",
                "startSec": 48.5,
                "endSec": 49.5,
                "narration": "长视频节奏",
                "visualTarget": "issue_2",
                "action": "reveal_issue",
            },
            {
                "id": "issue_lip_sync",
                "startSec": 49.5,
                "endSec": 50.5,
                "narration": "口型一致性",
                "visualTarget": "issue_3",
                "action": "reveal_issue",
            },
            {
                "id": "issue_review_gate",
                "startSec": 50.5,
                "endSec": 51.86,
                "narration": "发布前审核",
                "visualTarget": "issue_4",
                "action": "reveal_issue",
            },
            {
                "id": "close_next_iteration",
                "startSec": 52.06,
                "endSec": 54.38,
                "narration": "这才是下一版要继续打磨的地方",
                "visualTarget": "closing_summary",
                "action": "hold_next_iteration",
            },
        ]
    )


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_ts(path: Path, events: list[dict[str, Any]]) -> None:
    payload = json.dumps(events, ensure_ascii=False, indent=2)
    path.write_text(
        "export type SyncEvent = {\n"
        "  id: string;\n"
        "  startSec: number;\n"
        "  endSec: number;\n"
        "  startFrame: number;\n"
        "  endFrame: number;\n"
        "  durationFrame: number;\n"
        "  narration: string;\n"
        "  visualTarget: string;\n"
        "  action: string;\n"
        "};\n\n"
        f"export const syncEventsV4 = {payload} satisfies SyncEvent[];\n\n"
        "export const syncEventById = Object.fromEntries(\n"
        "  syncEventsV4.map((event) => [event.id, event]),\n"
        ") as Record<string, SyncEvent>;\n",
        encoding="utf-8",
    )


def main() -> int:
    SYNC_OUTPUT.mkdir(parents=True, exist_ok=True)
    events = build_events()
    payload = {
        "fps": FPS,
        "source": "examples/mainline_v4_sync/sync_event_timeline.json",
        "timingMethod": "manual phrase cues derived from existing trained-voice narration segments",
        "events": events,
    }
    (SYNC_OUTPUT / "sync_event_timeline.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_csv(SYNC_OUTPUT / "sync_event_timeline.csv", events)
    write_ts(REMOTION_SRC / "sync_events_v4.ts", events)
    print(
        json.dumps(
            {
                "output": str(SYNC_OUTPUT),
                "events": len(events),
                "generatedTs": str(REMOTION_SRC / "sync_events_v4.ts"),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
