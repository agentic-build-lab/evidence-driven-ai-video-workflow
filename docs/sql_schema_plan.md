# SQL Schema Plan for Evidence-Driven Video Workflows

This schema is a normalized plan for unifying evidence-driven videos, mathematical animation explainers, and AI-assisted edit projects under one auditable production database.

## Core tables

### projects
Tracks the reusable production line or client/workstream.

Key fields: `id`, `slug`, `name`, `project_type`, `owner`, `repo_url`, `default_review_policy`, `created_at`, `updated_at`.

### video_topics
Tracks candidate and approved topics.

Key fields: `id`, `project_id`, `topic`, `hook`, `why_now`, `video_angle`, `status`, `risk_level`, `created_by`, `created_at`.

### source_targets
Candidate URLs, PDFs, reports, public video pages, social leads, or offline files to capture.

Key fields: `id`, `topic_id`, `source_type`, `title`, `url`, `publisher`, `is_official`, `expected_evidence`, `access_notes`, `license_notes`, `priority`, `status`.

### captured_sources
Immutable capture records for pages, PDFs, DOM ranges, screenshots, and quote snippets.

Key fields: `id`, `source_target_id`, `capture_version`, `captured_at`, `capture_tool`, `artifact_path`, `screenshot_path`, `pdf_page`, `dom_selector`, `bbox_json`, `quoted_text`, `checksum`, `review_status`.

### assets
Every visual/audio/video asset, including generated images and local-only clips.

Key fields: `id`, `project_id`, `topic_id`, `asset_type`, `origin`, `source_id`, `path`, `public_commit_allowed`, `license`, `rights_notes`, `checksum`, `duration_ms`, `width`, `height`, `created_at`.

### privacy_masks
Face, account, comment, QR, subtitle, logo, and manual region masks applied to public or sensitive footage.

Key fields: `id`, `asset_id`, `mask_version`, `mask_type`, `regions_json`, `detector`, `effect`, `reviewer`, `review_status`, `residual_risk`, `output_asset_id`.

### sync_events
The event table consumed by Remotion or other renderers.

Key fields: `id`, `topic_id`, `event_version`, `start_ms`, `end_ms`, `voiceover_text`, `subtitle_text`, `evidence_capture_id`, `asset_id`, `bbox_json`, `camera_action`, `highlight_style`, `review_status`.

### render_runs
Versioned render attempts and outputs.

Key fields: `id`, `topic_id`, `render_version`, `composition_id`, `resolution`, `fps`, `duration_ms`, `command`, `git_commit`, `output_path`, `contact_sheet_path`, `logs_path`, `status`, `created_at`.

### quality_reviews
Evidence, factuality, sync, privacy, copyright, accessibility, and technical quality gates.

Key fields: `id`, `render_run_id`, `reviewer`, `review_type`, `score`, `findings`, `required_fixes`, `status`, `reviewed_at`.

### publish_decisions
Human publish/release gate. Automation can prepare this record but must not mark it approved without review.

Key fields: `id`, `render_run_id`, `decision`, `decision_by`, `decision_at`, `channels`, `conditions`, `notes`.

### decision_logs
Append-only history for model, script, and human choices.

Key fields: `id`, `project_id`, `topic_id`, `actor`, `decision_type`, `input_context`, `decision`, `rationale`, `artifacts`, `created_at`.

## Cross-project unification

- Mathematical animation projects use `source_targets` for textbooks, papers, derivations, and datasets; `sync_events` drive equations and camera movements.
- Evidence-driven news/video projects use `captured_sources` for official webpages, PDFs, and quote-level screenshots; `privacy_masks` governs public-reference footage.
- AI-editing projects use `assets`, `privacy_masks`, `render_runs`, and `quality_reviews` for generated images, digital avatars, voiceover, and edit variants.

The common invariant is: every renderable claim or shot references a topic, a source/asset, a sync event, a render run, and a review decision.
