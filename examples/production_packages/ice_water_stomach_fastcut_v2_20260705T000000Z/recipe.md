# Recipe: Ice Water and Stomach Public-Video Montage

- Topic: 喝冰水伤胃吗？冰水背了多少年的锅？
- Structure: 引入主题 -> 场景/生活经验 -> 日常语境 -> 机理解释 -> 个体差异 -> review gate.
- Source discovery: public-frontdoor Wikimedia Commons URLs from `configs/video_montage/ice_water_stomach_commons_sources.json`.
- Clip count: 5 real public video URL clips plus one generated review gate card.
- Preview command: `python scripts/video_pipeline/build_video_montage_package.py --force`.
- Validation command: `python scripts/workflow/validate_video_montage_package.py examples/production_packages/ice_water_stomach_video_montage_20260705T000000Z`.
- Full MP4 command future: run in a render worker with ffmpeg and Chrome/Chromium after licenses are reviewed.
- Risk: all external video clips are `yellow` until license/privacy review.
