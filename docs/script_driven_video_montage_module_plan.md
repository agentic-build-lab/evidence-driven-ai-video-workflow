# Script Driven Video Montage Module Plan

This document defines the next evidence/video workflow direction: given a topic
or script, the system should find relevant visual material, choose precise
segments, align them to narration, and render a coherent explainer video.

## Reference

- User-provided creator label: `张见识`
- User-provided title: `喝冰水伤胃吗？ 冰水背了多少年的锅？`
- Share URL: `https://v.douyin.com/dQ15pTm-NgQ/`
- Resolved public page: `https://www.douyin.com/video/7637080847639678259`
- Capture status: browser page resolved; detailed frame/timing study still
  needs manual or browser-based capture.

Do not commit downloaded reference videos, watermarked source clips, cookies, or
private browser state. Commit only manifests, review notes, source URLs, timing
tables, and small approved diagnostic thumbnails.

## Product Claim

Yes, this can become a high-value module, but it must be built as a rights-aware
production pipeline rather than an unrestricted "copy any video" crawler.

Target workflow:

topic -> script -> beat table -> asset queries -> candidate clips -> rights
check -> segment selection -> edit timeline -> Remotion/ffmpeg render -> review.

## Core Capabilities

### 1. Script Segmentation

Break the narration into visual beats:

- claim;
- entity;
- action;
- emotion;
- evidence source;
- visual metaphor;
- required realism level;
- preferred clip length;
- transition type.

Example beat contract:

```json
{
  "beat_id": "cold_water_stomach_001",
  "start_ms": 4200,
  "end_ms": 7800,
  "voiceover": "People often say ice water hurts the stomach.",
  "visual_need": {
    "subject": "person drinking cold water",
    "action": "drinking",
    "setting": "daily life",
    "realism": "real footage preferred",
    "fallback": "generated image with subtle motion"
  },
  "rights_requirement": "licensed_or_user_owned",
  "privacy_risk": "low"
}
```

### 2. Asset Source Providers

Default safe sources:

- user-owned asset library;
- licensed stock APIs;
- Wikimedia Commons or public-domain archives;
- official brand/government/science media with clear reuse terms;
- AI-generated images or video when real footage is unavailable;
- YouTube or platform metadata for research only unless license/reuse is clear.

Restricted fallback:

- public video pages can be inspected for topic research and shot inspiration;
- downloading or reusing third-party video needs an explicit rights review;
- platform cookies, login state, private comments, and raw videos must stay out
  of Git.

### 3. Clip Understanding

Candidate clips should be indexed by:

- source URL and license;
- transcript or caption text;
- detected objects/actions;
- scene type;
- people/privacy flags;
- visual quality;
- duration;
- safe crop areas;
- semantic embedding against the script beat.

### 4. Edit Planning

The system should output a machine-readable edit plan:

- clip source;
- selected in/out time;
- crop and scale;
- speed adjustment;
- subtitle or label overlays;
- transition;
- voiceover alignment;
- confidence score;
- rights status;
- fallback if the clip is rejected.

### 5. Render Integration

The edit plan should feed:

- Remotion compositions for evidence-style videos;
- ffmpeg concat/filter pipelines for simpler drafts;
- contact sheets for fast review;
- source and asset manifests for audit.

## Review Gates

Before a clip reaches a final render, require:

1. license or allowed-use status;
2. no visible private account data, QR code, comments, or sensitive faces unless
   approved and masked;
3. source URL in the asset manifest;
4. exact reason why this clip matches the narration beat;
5. fallback plan if rights or quality fails;
6. no auto-publishing until the user explicitly approves the channel.

## Roadmap

### Phase 0: Manual Reference Study

- Build a reference timing table from the user-provided Douyin example.
- Record how narration maps to real footage, generated imagery, screenshots,
  labels, and transitions.
- Store only notes and small diagnostic stills.

### Phase 1: Semi-Automated Asset Briefs

- Given a script, generate a beat table and asset query list.
- Search safe sources first.
- Produce a candidate asset manifest.
- Let a human approve clips before render.

### Phase 2: Automated Draft Assembly

- Use caption/object/embedding matching to select clip ranges.
- Generate a Remotion timeline.
- Render MP4 and contact sheet through GitHub Actions.
- Store artifacts outside Git by default.

### Phase 3: Productizable Module

- Web UI for topic/script input.
- Provider connectors for stock libraries, official sources, user assets, and
  generated media.
- Review queue for rights, privacy, and quality.
- Exportable edit plans that other systems can consume.

## Commercial Boundary

This can become a standalone paid tool for creators, but the commercial version
must be strong on:

- source licensing;
- asset provenance;
- privacy masking;
- reproducible edit plans;
- review and approval workflows;
- easy integration API.

The valuable product is not raw scraping. The valuable product is script-aware,
rights-aware, high-quality video assembly.
