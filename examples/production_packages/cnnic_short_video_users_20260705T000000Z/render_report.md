# Render Report

- Package: `cnnic_short_video_users_20260705T000000Z`
- Composition: `EvidenceSourceZoomDemo`
- Intended spec: 1080x1920, 30 fps, 20 seconds.
- Commands attempted on 2026-07-05:
  - `cd apps/remotion_director && npm run typecheck` — passed.
  - `cd apps/remotion_director && npm run still:demo` — failed before rendering because Remotion attempted to download Chrome Headless Shell and DNS lookup for `remotion.media` returned `EAI_AGAIN`.
  - `cd apps/remotion_director && npm run render:demo` — not reached in the combined command after the still failure.
- Environment gaps: `ffmpeg` is not installed; Remotion browser binary is not cached; no system Chromium/Chrome was found. Current PDF bbox dependencies are satisfied by `pdfplumber` and Pillow; PyMuPDF is not required by the checked-in script.
- Output video: not generated in this run due to environment limitations.
- Follow-up attempt: `apt-get update && apt-get install -y ffmpeg` and `python -m pip install PyMuPDF` were blocked by proxy HTTP `403 Forbidden`; PyMuPDF was confirmed unnecessary for the current PDF bbox script. Next fix: use a base image or CI environment with ffmpeg and Chrome/Chromium preinstalled or package mirrors enabled, then rerun still and render.
