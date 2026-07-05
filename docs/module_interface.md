# Evidence Workflow Module Interface

This repository should be usable as an independently connected evidence-driven video production module. The module boundary is intentionally file/CLI-first so it can later be wrapped by an API service or SQL-backed orchestrator.

## CLI entry points

### Topic discovery

```bash
python scripts/topic_discovery/build_topic_brief.py \
  --direction ai_video_tools \
  --timestamp 20260705T000000Z
```

Input: a direction and an offline fixture/provider config. Output: `examples/topic_briefs/<topic>_<timestamp>.json` with `topic`, `hook`, `why_now`, `source_candidates`, `video_angle`, `evidence_needed`, `risk_notes`, and review gate fields.

### Offline production package builder

```bash
python scripts/workflow/build_offline_production_package.py \
  --topic-brief examples/topic_briefs/short-video-scale-makes-evidence-first-ai-video-workflows-necessary_20260705T000000Z.json \
  --package-id cnnic_short_video_users_offline_cli_20260705T000000Z \
  --git-commit fixture-generated-from-35dcda1
```

Input: a topic brief JSON and unique `package_id`. Output: a non-overwriting production package directory containing `run_manifest.json`, `source_manifest.json`, `asset_manifest.csv`, `sync_timeline.json`, `privacy_check.md`, `render_report.md`, and `preview.html`.

### Package validator

```bash
python scripts/workflow/validate_production_package.py \
  examples/production_packages/cnnic_short_video_users_offline_cli_20260705T000000Z
```

Input: package directory. Output: JSON status. The validator checks required files, human review gate, package id consistency, non-empty source/asset manifests, ordered sync events, and asset risk fields.

### Environment audit

```bash
python scripts/workflow/audit_environment.py
```

Input: current runtime environment. Output: JSON report for Node/npm/Python, key Python modules, `ffmpeg`, and Chrome/Chromium. Exit code `2` means runtime/render dependencies are missing.

## API-shaped contract

A future service wrapper can expose the same stages as API operations:

1. `POST /topic-briefs` with `{direction, locale, providers, risk_tolerance}`.
2. `POST /production-packages` with `{topic_brief_id, package_id, output_root}`.
3. `POST /production-packages/{id}/validate`.
4. `POST /captures` for official webpage/PDF capture adapters.
5. `POST /privacy-masks` for public-video masking adapters.
6. `POST /render-runs` for Remotion still/render after environment audit passes.
7. `POST /quality-reviews` and `POST /publish-decisions` as human review gates.

## Manifest and SQL mapping

- `topic_brief.json` maps to `video_topics` and candidate `source_targets`.
- `source_manifest.json` maps to `source_targets` and `captured_sources`.
- `asset_manifest.csv` maps to `assets`.
- `sync_timeline.json` maps to `sync_events`.
- `privacy_check.md` and mask debug JSON map to `privacy_masks` and `quality_reviews`.
- `render_report.md` maps to `render_runs`.
- `run_manifest.json` is the package-level audit envelope and references the current git commit.

## Review gate

Automation may generate briefs, manifests, preview HTML, stills, contact sheets, and draft videos. It must not approve publication. Publication requires a human `publish_decisions` record after source, factuality, privacy, copyright, and sync review.


## Productized package contract

A reusable host system should treat this repository as a deterministic package builder with explicit inputs and outputs.

### Inputs

- `topic_brief.json`: topic, hook, why_now, source candidates, evidence needed, risk notes, and discovery mode.
- `source_candidates`: official URLs/PDFs, public report pages, user-provided files, or public-video leads.
- `capture_targets`: screenshot/PDF page targets, selectors, bbox targets, and recapture notes.
- `privacy_policy`: masking requirements for faces, accounts, comments, QR codes, subtitles, logos, and platform UI.
- `rhythm_profile`: timing grammar such as `docs/reference_style_rhythm_study.md#evidence-timing-grammar`.
- `render_profile`: Remotion composition id, resolution, fps, duration, and fallback preview mode.

### Outputs

- `source_manifest.json`: source ids, type, capture mode, provenance, expected evidence, and review status.
- `asset_manifest.csv`: assets with origin, path, public-commit policy, license notes, and risk notes.
- `capture_plan.json` or future equivalent: official webpage/PDF screenshot plan, DOM/PDF bbox plan, and recapture instructions.
- `privacy_mask_plan.json` or future equivalent: regions/detectors/effects/review status for public-video or sensitive UI.
- `sync_timeline.json`: event timing, source id, visual action, zoom/highlight, privacy action, voiceover density, and comfort notes.
- `preview.html`: lightweight review entry point when Remotion rendering is unavailable.
- `run_manifest.json`: package id, timestamp, git commit/source, paths, and no-large-media flags.
- `render_report.md`, `quality_review.md`, `recipe.md`: review, reproducibility, and retention records.

### Host integration modes

1. CLI mode: a host calls scripts directly and reads package files.
2. API wrapper mode: a host wraps these scripts behind HTTP endpoints.
3. SQL-backed mode: a host writes the manifests into the SQL schema planned in `docs/sql_schema_plan.md`.
4. Render-agent mode: a separate worker with ffmpeg and Chrome/Chromium reads a validated package and produces MP4/stills/contact sheets.

### Review gates

- Topic review before capture.
- Source/factual review before render approval.
- Privacy/copyright review before public-video insertion.
- Render quality review before retention/publish decision.
- Human publish decision; automation must not publish.


## Public-video montage extension

The module can also operate as a theme-to-video montage builder.

Additional pipeline outputs:

- `montage_timeline.json`: clip source, in/out, crop, caption, duration, source credit, risk note, and semantic visual action.
- `video_source_manifest.json` or `source_manifest.json`: public video source page, remote video URL, license review note, risk level, and human review flag.
- `preview.html`: HTML review page with real `<video>` elements when MP4 rendering is unavailable.

Required submodules:

1. `source_discovery`: find official/public-frontdoor video sources.
2. `video_acquisition`: keep remote URLs or cache reviewed files outside Git.
3. `clip_selection`: choose semantically aligned clips for script beats.
4. `montage_timeline`: assemble caption-synchronized clip sequence.
5. `preview/render`: HTML preview first; MP4 only in a render-capable worker.

All public-video clips default to `yellow` risk until license, privacy, and source-credit review are complete.
