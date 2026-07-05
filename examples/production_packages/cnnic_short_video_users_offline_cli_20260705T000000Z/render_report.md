# Render Report

- Package: `cnnic_short_video_users_offline_cli_20260705T000000Z`
- Render mode: offline package preview; no mp4 render attempted by this builder.
- Intended Remotion composition: `EvidenceSourceZoomDemo`, 1080x1920, 30 fps, 59 seconds.
- Rhythm grammar: `docs/reference_style_rhythm_study.md#evidence-timing-grammar`.
- Fallback output: `preview.html` and manifests for review when browser/ffmpeg are unavailable.
- Review gate: human approval required before publish or live-source recapture.

## Rhythm preview status

- The package now follows `docs/reference_style_rhythm_study.md#evidence-timing-grammar`.
- `preview.html` is the review entry point while mp4/still rendering is blocked.
- Real video generation should happen in an environment with ffmpeg and Chrome/Chromium or Remotion Chrome Headless Shell available.
