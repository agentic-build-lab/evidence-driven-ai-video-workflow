# Codex Skill Plan

后续可以整理成 `evidence-driven-ai-video-workflow` skill。

## Skill Capabilities

- `source_capture`: 从官方网页、PDF、报告页采集证据截图。
- `text_bbox_highlight`: 从 DOM/PDF/OCR 提取逐行 bbox。
- `reference_video_usage`: 拉取必要公开视频片段并生成来源说明。
- `privacy_mosaic`: 对人脸和敏感信息打码。
- `sync_timeline`: 根据旁白生成音画同步事件表。
- `remotion_director`: 用 Remotion 合成证据镜头、标注、字幕、数字人和转场。
- `quality_gate`: 生成抽帧检查、资产清单和发布前复核表。

## Skill Rules

- 不绕过验证码。
- 不默认下载受限正片。
- 不提交 cookies 或登录态。
- 引用视频必须写明授权风险。
- 发布前保留人工 review gate。

## Script Driven Montage Track

- Plan: `docs/script_driven_video_montage_module_plan.md`
- Reference target: user-provided Douyin creator `张见识`, resolved page
  `https://www.douyin.com/video/7637080847639678259`.
- The skill should evolve toward script-aware source discovery, clip matching,
  rights review, edit-plan generation, Remotion rendering, and artifact upload
  through GitHub Actions.
- Do not frame this as unrestricted video copying. The durable module is
  rights-aware, privacy-aware, and review-gated.
