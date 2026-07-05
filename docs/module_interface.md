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
