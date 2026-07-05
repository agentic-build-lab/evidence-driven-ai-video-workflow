export type SyncEvent = {
  id: string;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  durationFrame: number;
  narration: string;
  visualTarget: string;
  action: string;
};

export const syncEventsV4 = [
  {
    "id": "official_source_context",
    "startSec": 0.0,
    "endSec": 3.2,
    "narration": "真正重要的是来源",
    "visualTarget": "cnninc_xinhua_full_view",
    "action": "show_full_source",
    "startFrame": 0,
    "endFrame": 96,
    "durationFrame": 96
  },
  {
    "id": "official_pages_visible",
    "startSec": 3.2,
    "endSec": 8.42,
    "narration": "镜头先把官方页面摆出来，让观众知道这是新华网和CNNIC报告",
    "visualTarget": "cnnic_report_and_xinhua_page",
    "action": "hold_source_identity",
    "startFrame": 96,
    "endFrame": 253,
    "durationFrame": 157
  },
  {
    "id": "official_zoom_to_key_sentence",
    "startSec": 8.56,
    "endSec": 9.8,
    "narration": "然后再推近到关键句",
    "visualTarget": "cnnic_short_video_sentence",
    "action": "zoom_to_focus",
    "startFrame": 257,
    "endFrame": 294,
    "durationFrame": 37
  },
  {
    "id": "official_highlight_key_sentence",
    "startSec": 9.8,
    "endSec": 11.76,
    "narration": "短视频用户已经超过十亿",
    "visualTarget": "short_video_users_1040_million",
    "action": "red_box_and_underline",
    "startFrame": 294,
    "endFrame": 353,
    "durationFrame": 59
  },
  {
    "id": "platform_not_perfect",
    "startSec": 11.96,
    "endSec": 14.5,
    "narration": "不是说AI视频已经完美了",
    "visualTarget": "platform_warning_card",
    "action": "show_caution",
    "startFrame": 359,
    "endFrame": 435,
    "durationFrame": 76
  },
  {
    "id": "platform_tool_landscape",
    "startSec": 14.64,
    "endSec": 17.6,
    "narration": "Sora、Veo、Runway这些官网",
    "visualTarget": "veo_runway_capcut_panels",
    "action": "reveal_platform_sources",
    "startFrame": 439,
    "endFrame": 528,
    "durationFrame": 89
  },
  {
    "id": "platform_available_stage",
    "startSec": 17.6,
    "endSec": 20.4,
    "narration": "视频生成进入了可用阶段",
    "visualTarget": "veo_runway_active_panels",
    "action": "focus_active_platform_panel",
    "startFrame": 528,
    "endFrame": 612,
    "durationFrame": 84
  },
  {
    "id": "platform_control_problem",
    "startSec": 20.4,
    "endSec": 23.84,
    "narration": "真正难的是稳定、可控、可复用",
    "visualTarget": "stable_control_reusable_card",
    "action": "show_conclusion_card",
    "startFrame": 612,
    "endFrame": 715,
    "durationFrame": 103
  },
  {
    "id": "workflow_not_button",
    "startSec": 24.04,
    "endSec": 26.0,
    "narration": "方向不是做一个按钮",
    "visualTarget": "director_system_card",
    "action": "show_director_system",
    "startFrame": 721,
    "endFrame": 780,
    "durationFrame": 59
  },
  {
    "id": "workflow_research_script_voice",
    "startSec": 26.0,
    "endSec": 29.0,
    "narration": "调研、脚本、声音",
    "visualTarget": "flow_nodes_0_to_2",
    "action": "reveal_flow_nodes",
    "startFrame": 780,
    "endFrame": 870,
    "durationFrame": 90
  },
  {
    "id": "workflow_avatar_assets_packaging_qc",
    "startSec": 29.0,
    "endSec": 34.4,
    "narration": "数字人、素材、包装和质检",
    "visualTarget": "flow_nodes_3_to_6",
    "action": "reveal_flow_nodes",
    "startFrame": 870,
    "endFrame": 1032,
    "durationFrame": 162
  },
  {
    "id": "workflow_director_system",
    "startSec": 34.54,
    "endSec": 39.54,
    "narration": "能反复生产视频的导演系统",
    "visualTarget": "cited_video_and_system_summary",
    "action": "switch_cited_clip_and_hold",
    "startFrame": 1036,
    "endFrame": 1186,
    "durationFrame": 150
  },
  {
    "id": "system_source_capture",
    "startSec": 39.74,
    "endSec": 42.4,
    "narration": "官网截图、报告页推近",
    "visualTarget": "capability_check_0_1",
    "action": "reveal_capability_checks",
    "startFrame": 1192,
    "endFrame": 1272,
    "durationFrame": 80
  },
  {
    "id": "system_external_video_voice",
    "startSec": 42.4,
    "endSec": 44.8,
    "narration": "外部视频素材拉取、本地训练声音",
    "visualTarget": "capability_check_2_4",
    "action": "reveal_capability_checks",
    "startFrame": 1272,
    "endFrame": 1344,
    "durationFrame": 72
  },
  {
    "id": "system_product_demo",
    "startSec": 44.8,
    "endSec": 46.4,
    "narration": "产品页面演示",
    "visualTarget": "studio_assets_zoom",
    "action": "product_zoom_lock",
    "startFrame": 1344,
    "endFrame": 1392,
    "durationFrame": 48
  },
  {
    "id": "issue_asset_license",
    "startSec": 46.54,
    "endSec": 47.5,
    "narration": "素材授权",
    "visualTarget": "issue_0",
    "action": "reveal_issue",
    "startFrame": 1396,
    "endFrame": 1425,
    "durationFrame": 29
  },
  {
    "id": "issue_motion_realism",
    "startSec": 47.5,
    "endSec": 48.5,
    "narration": "动作真实感",
    "visualTarget": "issue_1",
    "action": "reveal_issue",
    "startFrame": 1425,
    "endFrame": 1455,
    "durationFrame": 30
  },
  {
    "id": "issue_long_rhythm",
    "startSec": 48.5,
    "endSec": 49.5,
    "narration": "长视频节奏",
    "visualTarget": "issue_2",
    "action": "reveal_issue",
    "startFrame": 1455,
    "endFrame": 1485,
    "durationFrame": 30
  },
  {
    "id": "issue_lip_sync",
    "startSec": 49.5,
    "endSec": 50.5,
    "narration": "口型一致性",
    "visualTarget": "issue_3",
    "action": "reveal_issue",
    "startFrame": 1485,
    "endFrame": 1515,
    "durationFrame": 30
  },
  {
    "id": "issue_review_gate",
    "startSec": 50.5,
    "endSec": 51.86,
    "narration": "发布前审核",
    "visualTarget": "issue_4",
    "action": "reveal_issue",
    "startFrame": 1515,
    "endFrame": 1556,
    "durationFrame": 41
  },
  {
    "id": "close_next_iteration",
    "startSec": 52.06,
    "endSec": 54.38,
    "narration": "这才是下一版要继续打磨的地方",
    "visualTarget": "closing_summary",
    "action": "hold_next_iteration",
    "startFrame": 1562,
    "endFrame": 1631,
    "durationFrame": 69
  }
] satisfies SyncEvent[];

export const syncEventById = Object.fromEntries(
  syncEventsV4.map((event) => [event.id, event]),
) as Record<string, SyncEvent>;
