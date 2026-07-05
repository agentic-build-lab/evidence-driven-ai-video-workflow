# Reference Style Rhythm Study for Evidence-Driven Videos

This document studies pacing, shot language, and information organization from well-known explanatory-video patterns. It must not copy any creator's footage, graphics, scripts, jokes, maps, or visual identity. Use it only to learn timing, evidence staging, and review-safe narrative structure.

## Guardrails

- Do not reuse reference videos, screenshots, maps, thumbnails, titles, wording, or visual templates.
- Treat public videos as rhythm references only unless rights and use are explicitly reviewed.
- Evidence-first videos must show source context before interpretation.
- Every claim-bearing shot should map to a source id, bbox/highlight, manifest row, or privacy-reviewed reference clip.
- Review gate remains mandatory; no automatic publishing.

## 1. Vox / Johnny Harris-style explanatory rhythm

Useful patterns to adapt:

- Evidence layering: source screenshot, map, chart, article/PDF, and annotation can be layered sequentially instead of dumping all proof at once.
- Narration drives camera movement: the camera often pushes in as the voiceover narrows from context to a specific claim.
- Highlight grammar: use a fast marker or underline only after the viewer has seen the full source context.
- Chapter rhythm: short chapters reset attention with a new question, map, source, or contradiction.
- Web/PDF treatment: show enough browser/PDF frame to establish provenance, then zoom to the exact line or number.

Evidence-safe adaptation:

- Use official screenshots and PDF captures already listed in `source_manifest.json`.
- Use neutral typography and project-specific overlays, not reference-channel branding.
- Keep URL/source label visible in wide shots or manifest overlays.

## 2. Veritasium / Wendover / PolyMatter-style explanation rhythm

Useful patterns to adapt:

- Opening conflict: begin with a precise question, paradox, or tension rather than a broad topic statement.
- Suspense through staged evidence: reveal the answer in steps, with each source lowering uncertainty.
- Chart pauses: after showing a graph or number, pause camera motion briefly so viewers can read.
- Conceptual bridge: use simple diagrams or generated illustrations only to explain relationships, never to replace evidence.
- Argument structure: problem -> evidence -> mechanism -> consequence -> caveat.

Evidence-safe adaptation:

- The first evidence should arrive early enough to prove the video is not just opinion.
- Any diagram should reference the source event that justified it.
- If a surprising conclusion is presented, immediately name the source and caveat.

## 3. Chinese knowledge/finance/AI vertical-video rhythm

Observed platform-friendly patterns to adapt without copying assets or scripts:

- 0-3s hook: high-density subtitles, direct conflict, and a concrete viewer benefit/question.
- Screenshot evidence duration: source screenshots usually need 2-5 seconds in vertical video, longer if dense text is shown.
- Subtitle density: short lines, high contrast, and no more than one dense idea per beat.
- Comment/data/web evidence: comments, account names, avatars, IDs, QR codes, logos, and sensitive subtitles must be masked before use.
- Highlight pacing: quick rectangle/underline first, then hold or zoom; avoid moving the camera while text is too small to read.
- AI/finance caution: claims should be framed as evidence-backed interpretation, not investment/legal/medical advice.

Evidence-safe adaptation:

- Public social comments are high-risk: use only when necessary, mask identity, and keep source/risk notes in the manifest.
- For finance/AI claims, avoid certainty language unless the cited source supports it.
- Do not use platform UI footage as decoration; it must have a purpose and a privacy action.

## 4. Optional innovation patterns

- Digital avatar picture-in-picture: use as a guide layer only; keep evidence full-size when claim-bearing text appears.
- Ken Burns generated images: useful for bridges when no rights-safe footage exists; label as illustration and keep it separate from evidence.
- Evidence reversal: start with a common belief, show a source that complicates it, then resolve with a more precise claim.
- Public-video small window: use sparingly, crop/mask identities, and keep it secondary to official evidence unless the public video is itself the evidence.
- Vertical rhythm: use quick hook, readable source zoom, subtitle restraint, and frequent reviewable source labels.

## Evidence timing grammar

| Time | Purpose | Visual action | Evidence/privacy rule |
|---:|---|---|---|
| 0-3s | Conflict/problem hook; why now | Big subtitle + source teaser | No unsupported conclusion; signal that evidence is coming. |
| 3-8s | First official evidence appears | Wide official screenshot/PDF with quick highlight | Show provenance before interpretation. |
| 8-18s | Key evidence proof beat | Dynamic zoom to bbox; synchronized underline/highlight | Voiceover and highlight must match exact source text. |
| 18-35s | Second evidence, chart, or public-reference insert | Split-screen chart/source or masked public-video window | Apply privacy masks for faces, accounts, comments, QR codes, logos, and sensitive subtitles. |
| 35-55s | Evidence-backed synthesis | Return to source label; summarize implications | Opinion must explicitly point back to source ids. |
| Final 2-4s | Audit/review reminder | Source manifest/review gate card | Do not auto-publish; invite review/verification. |

## Event fields required in sync timelines

Every rhythm-aware event should include:

- `start_ms`
- `end_ms`
- `source_id`
- `visual_action`
- `zoom_or_highlight`
- `privacy_action`
- `voiceover_density`
- `comfort_note`

These fields are in addition to the existing voiceover text, event type, evidence id, and review status.
