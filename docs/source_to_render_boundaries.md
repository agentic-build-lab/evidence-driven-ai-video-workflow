# Source-to-Render Pipeline Boundaries

This document defines module boundaries so the workflow can be embedded into other video systems without collapsing everything into one script.

## Boundary 1: Topic discovery

Input: direction, locale, risk tolerance, provider adapter configuration.

Output: `topic_brief.json` with source candidates and risk notes.

Review gate: human topic/angle review before capture.

## Boundary 2: Source capture planning

Input: source candidates.

Output: capture plan for official webpage screenshots, PDF pages, DOM/PDF bbox, and quote snippets.

Review gate: source provenance and rights review.

## Boundary 3: Asset and evidence manifests

Input: captured screenshots/PDFs/generated illustrations/public-reference leads.

Output: `source_manifest.json` and `asset_manifest.csv`.

Review gate: license, public-commit policy, and material risk review.

## Boundary 4: Privacy mask planning

Input: public-reference clips or sensitive screenshots.

Output: privacy mask regions, detector settings, debug JSON, and `privacy_check.md`.

Review gate: faces, accounts, comments, QR codes, subtitles, logos, and residual risk.

## Boundary 5: Sync timeline and rhythm grammar

Input: topic brief, evidence manifests, bbox/highlight data, rhythm profile.

Output: `sync_timeline.json` with timing, source ids, visual actions, zoom/highlight, privacy action, voiceover density, and comfort notes.

Review gate: cue-to-evidence factuality review.

## Boundary 6: Preview/render

Input: validated package.

Output: `preview.html` in constrained environments; MP4/stills/contact sheets when ffmpeg and Chrome/Chromium/Remotion browser are available.

Review gate: render quality and retention decision.

## Boundary 7: Publish decision

Input: source manifest, privacy check, quality review, render report, final package.

Output: human `publish_decision` record.

Review gate: publication is never automatic.
