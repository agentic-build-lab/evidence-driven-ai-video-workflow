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


## Fast-Cut Public-Video Montage Pattern

Use this pattern for short science/explainer samples when real video clips are required but the current environment cannot render MP4 yet.

- Start from a topic and build a `source_discovery` list of public/official/frontdoor video URLs.
- Keep all external clips `yellow` until license, attribution, privacy, and medical/legal/financial context are reviewed.
- Use 16:9 landscape for science/explainer material unless the product explicitly needs vertical.
- Use hard cuts by default; only chapter-level boundaries may use a 2-4 frame flash/dark transition.
- Use short bottom captions with strong black stroke/shadow and yellow keyword highlights.
- Do not use large explanatory black cards between clips; reserve cards for final review gates.
- Do not use static images as fake videos.
- Keep large videos out of Git; use remote preview URLs or cache reviewed files under `work/`/private storage.
- Required package files: `source_manifest.json`, `asset_manifest.csv`, `montage_timeline.json`, `preview.html`, `privacy_check.md`, `render_report.md`, `quality_review.md`, `recipe.md`.
- Validate with `python scripts/workflow/validate_video_montage_package.py <package_dir>` before review.
