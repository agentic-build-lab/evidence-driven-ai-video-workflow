# Contact Sheet Fallback

Bitmap contact sheet is not generated in this Codex container because ffmpeg and Chrome/Chromium are unavailable.

Review entry point:

- `preview.html`
- `montage_timeline.json`
- `source_manifest.json`
- `quality_review.md`

Future render/contact-sheet path:

```bash
python scripts/video_pipeline/build_video_montage_package.py --config configs/video_montage/ice_water_stomach_fastcut_modern_sources.json --force
python scripts/workflow/validate_video_montage_package.py examples/production_packages/ice_water_stomach_fastcut_v2_20260705T000000Z
# Then run a render worker with ffmpeg + Chrome/Chromium to cache reviewed videos and compose MP4/contact sheet.
```
