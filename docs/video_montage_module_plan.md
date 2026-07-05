# Theme-to-Video Montage Module Plan

This module extends the evidence workflow from static source screenshots to topic-driven public-video montage packages. It must remain review-gated and rights-aware.

## Module interfaces

### 1. source_discovery

Input: topic, language, orientation, risk tolerance, provider adapters.

Output: candidate public/official video sources with source page URL, video URL if public, license notes, semantic role, and risk level.

Default providers: official/public-frontdoor sources, Internet Archive, Wikimedia Commons, Pexels/Pixabay with API keys if available, YouTube Data API metadata if an API key is available.

### 2. video_acquisition

Input: reviewed source candidates.

Output: remote preview URLs or local cached files in `work/`/private storage. Large media should not be committed.

Policy: do not bypass login, captcha, paywalls, access controls, robots restrictions, or platform terms. Non-official scraping is isolated and disabled by default.

### 3. clip_selection

Input: source candidates, script beats, semantic roles, duration target.

Output: selected clips with source in/out, caption, crop, source credit, risk note, and review status.

### 4. montage_timeline

Input: selected clips and script beats.

Output: `montage_timeline.json` with `clip_id`, `source_id`, `start_ms`, `end_ms`, `source_in_sec`, `source_out_sec`, `crop`, `caption`, `source_credit`, `risk_note`, and `visual_action`.

### 5. preview/render

Input: validated montage package.

Output: `preview.html` with real `<video>` tags in constrained environments; MP4/contact sheet in a render worker with ffmpeg and browser support.

## Risk levels

- `green`: public reproducible source, license and privacy reviewed.
- `yellow`: public source candidate, human license/privacy review required before publication.
- `red`: do not enter automatic montage; keep only as review-gated lead.

## Current fixture package

`examples/production_packages/ice_water_stomach_video_montage_20260705T000000Z` validates the module with five real remote public-video URLs and one generated review gate card. The package does not download or commit large media.
