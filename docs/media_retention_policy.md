# Media Retention Policy

This project prioritizes evidence traceability over accumulating media files. Keep enough artifacts to audit and reproduce good samples; do not keep large, weak, risky, or unclear-rights media in Git.

## Keep in Git

Small, reviewable, rights-aware artifacts may be committed when they are needed for reproducible tests or documentation:

- `run_manifest.json`, `source_manifest.json`, `asset_manifest.csv`, `sync_timeline.json`, `privacy_check.md`, `quality_review.md`, and `render_report.md`.
- Small HTML previews such as `preview.html` that do not embed large binary media.
- Small contact sheets or diagnostic images only when they are essential to review and have clear rights/fixture status.
- Small official-source screenshots/PDF page fixtures already approved for internal reproducibility.
- Recipes/skills for good samples, including commands, source paths, bbox/highlight parameters, privacy notes, and failure history.

## Keep outside Git

Use `outputs/`, `work/`, private storage, Git LFS, or release assets for:

- MP4 renders, WebM overlays, generated voiceover, large contact sheets, and long frame sequences.
- Public-reference video originals or derived clips whose copyright/commercial-use status is not confirmed.
- Digital-avatar assets, voice models, non-commercial demo assets, or anything containing biometric/identity risk.
- Browser caches, Playwright/Remotion browser binaries, cookies, HAR files, tokens, API keys, and login state.

## Bad sample cleanup strategy

A bad sample should not occupy long-term repository space. Keep only:

1. `run_manifest.json` or a short failure manifest.
2. `render_report.md` with command, failure, environment, and root cause.
3. Optional tiny screenshot/contact frame if it is necessary to explain a visual bug.
4. A cleanup decision: `delete_large_media`, `keep_manifest_only`, `rerun_with_fix`, or `archive_private_storage`.

Delete or avoid committing the large MP4, raw public-video file, generated audio, browser cache, and frame sequence.

## Good sample retention strategy

A good sample may be promoted to a reproducible fixture only if it has:

- Reviewable source manifest and asset manifest.
- Explicit privacy check.
- Sync timeline with cue-to-evidence mapping.
- Render report or preview report.
- Quality review with a retention recommendation.
- Recipe/skill record explaining how to reproduce the result and what failed before.

## Quality grades

- `A`: retain as canonical internal fixture; evidence, privacy, sync, and preview/render are strong.
- `B`: retain as useful review fixture; minor gaps must be listed.
- `C`: keep manifest and diagnostics only; do not promote as sample.
- `D`: delete large artifacts; keep failure summary only.
