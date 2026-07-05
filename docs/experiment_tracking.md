# Experiment Tracking and Versioned Production Packages

This project must never overwrite a useful prior sample, screenshot, sync table, asset list, or render. Every evidence-driven video experiment gets a unique package directory and a manifest before it can pass review.

## Package identity

Use a stable slug plus UTC timestamp:

```text
outputs/production_runs/<topic-slug>_<YYYYMMDDTHHMMSSZ>/
examples/production_packages/<topic-slug>_<YYYYMMDDTHHMMSSZ>/
```

Use `outputs/` for local or large render artifacts and `examples/` only for small, redistributable fixtures. A package should include:

- `run_manifest.json`: package id, git commit, commands, environment, dependencies, source and asset manifest paths.
- `source_manifest.json`: source URLs, capture timestamps, access method, license notes, quote/cue mapping, evidence screenshot paths.
- `asset_manifest.csv` or `.json`: every image, audio, video, generated image, local-only item, and derived clip.
- `sync_timeline.json` and optionally `.csv`: voiceover cue timing, evidence target, bbox/highlight, zoom, subtitle, and review status.
- `privacy_check.md`: faces, accounts, comments, QR codes, platform logos, subtitles, and residual risk.
- `render_report.md`: composition id, resolution, fps, duration, command, output path, checksums, failures, and fixes.
- `quality_review.md`: evidence-review gate, factuality notes, copyright/privacy review, and publish recommendation.

## Required logging discipline

For each run, record:

1. Why the experiment was started and the intended audience hook.
2. Exact commands and relevant output, including failed commands.
3. Missing dependencies such as ffmpeg, Playwright browsers, Chrome for Remotion, or Python packages.
4. Material gaps and whether a fallback fixture was used.
5. Copyright, privacy, consent, and platform-policy risks.
6. Reviewer decisions: approve, revise, hold, or reject.

## Review gate

The workflow may generate auditable material and internal samples, but it must not auto-publish. A publish decision requires a human-readable `publish_decisions` record and must reference the package manifest, evidence manifests, privacy check, and quality review.

## Current cloud audit on 2026-07-05

- `cd apps/remotion_director && npm run typecheck` passed.
- `npm run still:demo` attempted to download Remotion Chrome Headless Shell from `remotion.media` and failed with DNS `EAI_AGAIN`; render did not start because the still command failed first.
- `ffmpeg` was not installed in the current container (`ffmpeg: command not found`).
- Python smoke check: `cv2` and `numpy` import. A later dependency review confirmed the current PDF bbox script uses `pdfplumber` and Pillow, not PyMuPDF.
- `python scripts/pdf_bbox/extract_cnnic_pdf_bbox.py` completed and rewrote the same tracked bbox TypeScript content.
- `python scripts/privacy_mosaic/mosaic_sensitive_video.py --help` completed.
- `node scripts/source_capture/build_zoom_lock_plan.mjs` previously failed when only example capture fixtures existed and `outputs/chinese_source_capture` was absent; the script now falls back to `examples/source_capture/chinese_source_capture` unless `CAPTURE_DIR` is set. Follow-up setup details are in `docs/cloud_environment_setup.md`.

## Follow-up audit on 2026-07-05 after offline module work

- Git state before this milestone: branch `work`, HEAD `35dcda1`, working tree clean, and no configured `git remote` was reported by `git remote -v` in this container.
- PR status: this environment cannot push to a remote because no git remote is configured, but the PR-record tool is available and was used after committing the previous milestone. The same tool should be used after each new commit.
- New offline package command: `python scripts/workflow/build_offline_production_package.py --topic-brief examples/topic_briefs/short-video-scale-makes-evidence-first-ai-video-workflows-necessary_20260705T000000Z.json --package-id cnnic_short_video_users_offline_cli_20260705T000000Z \
  --git-commit fixture-generated-from-35dcda1 --force`.
- New validator command: `python scripts/workflow/validate_production_package.py examples/production_packages/cnnic_short_video_users_offline_cli_20260705T000000Z` returned `{"status": "ok"}`.
- New test command: `python -m pytest tests/test_workflow_contracts.py` passed 5 tests covering topic brief generation, production package validation, sync timeline ordering, and privacy mask preset structure.
- Remotion check: `cd apps/remotion_director && npm run typecheck` passed; `npm run still:demo` still failed at Chrome Headless Shell download with DNS `EAI_AGAIN` for `remotion.media`.
- Fallback artifact: `examples/production_packages/cnnic_short_video_users_offline_cli_20260705T000000Z/preview.html` was generated for review when browser/ffmpeg are unavailable.
- Material risk: no new public-reference videos, original large videos, browser caches, cookies, API keys, or digital-avatar assets were committed.
- Agent command correction: `python -m pytest tests/test_workflow_contracts.py && npm run typecheck` and `npm run typecheck && python scripts/workflow/audit_environment.py` were mistakenly attempted from `apps/remotion_director`, causing repository-root paths to fail. The commands were rerun from the correct working directories: pytest/audit from repository root and npm typecheck from `apps/remotion_director`.

## Media review milestone on 2026-07-05

- Added `docs/media_retention_policy.md` to separate keep-in-Git artifacts from large/risky/unclear-rights media that should only leave manifests and diagnostics.
- Added `scripts/workflow/build_sample_gallery.py` and generated `docs/sample_gallery.md` with package paths, preview availability, quality grade, and retention recommendation.
- Promoted `examples/production_packages/cnnic_short_video_users_offline_cli_20260705T000000Z` to a B-grade offline review fixture with `quality_review.md`, `contact_sheet.md`, and `recipe.md`.
- Kept `examples/production_packages/cnnic_short_video_users_20260705T000000Z` as a C-grade historical baseline: keep manifest-only until preview/recipe coverage exists.
- Real MP4 remains blocked in this container by missing ffmpeg and Remotion Chrome/Chromium, so `preview.html`, package manifests, quality review, contact-sheet placeholder, and render report are the review artifacts for this milestone.

## Reference rhythm milestone on 2026-07-05

- Added `docs/reference_style_rhythm_study.md` to study explanatory-video pacing without copying footage, graphics, wording, or branding.
- Applied the evidence timing grammar to `examples/production_packages/cnnic_short_video_users_offline_cli_20260705T000000Z/sync_timeline.json` with required fields: `source_id`, `visual_action`, `zoom_or_highlight`, `privacy_action`, `voiceover_density`, and `comfort_note`.
- Updated `preview.html`, `render_report.md`, `privacy_check.md`, and `recipe.md` for the 59-second rhythm grammar fallback package.
- Updated `validate_production_package.py` and tests so rhythm fields are enforced and cannot silently disappear from future package generation.
- Real mp4/still remains blocked in this container by missing ffmpeg and Chrome/Chromium/Remotion Chrome cache; `preview.html` remains the review entry point.

## Sync/productization audit on 2026-07-05

- Strict GitHub sync audit found branch `work`, local HEAD `291e57f` at the start of the milestone, clean working tree, no configured git remote, no upstream branch config, and no `gh` CLI. Therefore this container cannot verify or push PR #1's remote head.
- Added `docs/github_sync_audit.md` to distinguish local commits, PR metadata recorded by tool, and actual remote push verification.
- Added productized package contract details to `docs/module_interface.md`, covering inputs, outputs, host integration modes, and review gates.
- Added `configs/topic_discovery/provider_adapters.json` plus topic discovery docs for official/public-frontdoor-first discovery, isolated low-priority crawling fallback, and human review gates.
- Added `docs/source_to_render_boundaries.md` to define topic, capture, manifest, privacy, sync, preview/render, and publish boundaries.

## Video montage milestone on 2026-07-05

- Added `configs/video_montage/ice_water_stomach_commons_sources.json` with five public Wikimedia Commons video URL candidates for a 16:9 science explainer about ice water and stomach discomfort.
- Added `scripts/video_pipeline/build_video_montage_package.py` to generate a review-gated HTML video montage package without downloading or committing large videos.
- Added `scripts/workflow/validate_video_montage_package.py` and tests so real video URL clips, captions, credits, risk notes, and review gate are validated.
- Generated `examples/production_packages/ice_water_stomach_video_montage_20260705T000000Z` with `preview.html`, `source_manifest.json`, `asset_manifest.csv`, `montage_timeline.json`, `privacy_check.md`, `render_report.md`, `quality_review.md`, and `recipe.md`.
- Added `.github/workflows/render-preview.yml` and improved `.github/workflows/environment-audit.yml` with Chrome setup. Current Codex container still lacks ffmpeg/Chrome, so MP4 generation remains delegated to GitHub Actions/devcontainer/render worker.

## Fast-cut montage v2 milestone on 2026-07-05

- Current branch/commit at milestone start: branch `work`, local HEAD `b87f280`, clean working tree; remote/PR/Actions status still cannot be verified from this container because no git remote and no `gh` CLI are configured.
- Added `configs/video_montage/ice_water_stomach_fastcut_modern_sources.json` for a 54-second 16:9 fast-cut package: opening question -> ice close-up -> drinking speed -> daily water context -> digestive mechanism -> individual difference -> review gate.
- Regenerated `examples/production_packages/ice_water_stomach_fastcut_v2_20260705T000000Z` with real remote public-video URLs, `hard_cut` transitions, bottom large captions, black stroke/shadow, yellow keyword highlights, source credits, and risk notes.
- Updated `build_video_montage_package.py` and `validate_video_montage_package.py` so `duration_ms` and `transition` are required, with hard cuts by default and only chapter-level transitions allowed.
- Added quality/review notes and `contact_sheet.md` fallback because this Codex container still lacks ffmpeg and Chrome/Chromium. MP4 generation remains delegated to GitHub Actions render-preview/devcontainer/render worker.
- Added fast-cut public-video montage pattern to `docs/codex_skill_plan.md`.
