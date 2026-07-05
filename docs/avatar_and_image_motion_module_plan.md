# Avatar and Image Motion Module Plan

Digital avatars and generated images are optional production aids, not evidence. They may explain, bridge, or add presence, but claim-bearing shots must still point back to captured sources.

## Digital avatar module

- Store non-commercial or restricted avatar assets only in `apps/remotion_director/public/local_assets/` or private storage unless licensing allows redistribution.
- Track avatar license, allowed usage, consent, voice model, and whether the render is internal-only in `asset_manifest` and the future `assets` SQL table.
- Prefer transparent WebM or alpha PNG sequences for picture-in-picture explainers.
- Align mouth movement with voiceover cues through VTT/phoneme timing when available; otherwise mark lip sync as approximate.
- Avoid implying the avatar is a real person unless identity and consent are explicit.

## Image generation and motion fallback

When direct footage is unavailable or high-risk, use generated or diagrammatic images with clear labels such as `illustration` or `generated visual`.

Motion patterns:

- Ken Burns slow push/pull for context images.
- Parallax layers for topic transitions.
- Local highlight boxes for source screenshots and diagrams.
- Push-in to quote/data regions using DOM/PDF bbox.
- Split-screen: source evidence on one side, generated conceptual image on the other.

## Manifest requirements

Generated images must record prompt summary, model/tool, seed if available, creation timestamp, intended use, and whether the image depicts a real person, logo, or copyrighted style. Generated or avatar assets should never replace source citations in the sync timeline.
