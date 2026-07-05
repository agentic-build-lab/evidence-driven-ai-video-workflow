# Cloud Environment Setup Notes

This repository can run documentation, manifest, bbox, and privacy-helper checks without large local media. Full Remotion rendering additionally needs a browser binary and ffmpeg.

## What the agent can usually solve

The cloud agent can update repository code, manifests, docs, package scripts, and setup instructions. If package/network access is open, it can also install:

```bash
apt-get update && apt-get install -y ffmpeg chromium-browser
cd apps/remotion_director && npm install
cd apps/remotion_director && npx remotion browser ensure
python -m pip install -r requirements.txt
```

## Current limitation observed on 2026-07-05

The current container blocks external package downloads through the configured proxy:

- `apt-get update && apt-get install -y ffmpeg` failed with HTTP `403 Forbidden` from the proxy for Ubuntu repositories.
- `python -m pip install PyMuPDF` failed with proxy `403 Forbidden`; PyMuPDF is not required by the current `scripts/pdf_bbox/extract_cnnic_pdf_bbox.py`, which uses `pdfplumber`, `Pillow`, `opencv-python-headless`, and `numpy`.
- `npm run still:demo` failed because Remotion attempted to download Chrome Headless Shell from `remotion.media` and DNS returned `EAI_AGAIN`.
- No system Chromium/Chrome binary was found in `/usr` or `PATH`.

## What needs user or platform help

If the proxy remains locked down, a human/platform owner should provide one of these:

1. A base image with `ffmpeg` and Chromium/Chrome already installed.
2. A working package mirror/proxy for Ubuntu apt, PyPI, npm, and Remotion browser downloads.
3. A cached Remotion Chrome Headless Shell mounted in the expected cache location.
4. A CI job with network egress to `remotion.media` and Ubuntu/PyPI mirrors.

## Audit command

Run this from the repository root:

```bash
python scripts/workflow/audit_environment.py
```

Exit codes:

- `0`: required binaries/modules are present.
- `2`: one or more render/runtime dependencies are missing.

## Repository-level mitigation added on 2026-07-05

The current Codex container still cannot install system packages because apt/PyPI/Remotion downloads are blocked by proxy/DNS behavior. To avoid stopping the project, the repository now includes:

- `.github/workflows/environment-audit.yml` for GitHub-hosted environment checks and dependency installation.
- `.devcontainer/devcontainer.json` for a reproducible devcontainer with `ffmpeg`, Chromium, Python requirements, and Remotion dependencies.
- `scripts/workflow/build_offline_production_package.py` and `scripts/workflow/validate_production_package.py` so manifest/review workflows can run without browser rendering.

User/platform action is only required for account authorization, external material authorization, API keys, public-video copyright/commercial-use confirmation, real publishing decisions, or if a runner/base image must be changed to allow `ffmpeg` and Chrome/Chromium installation.

## Preview fallback when real video render is unavailable

When `npm run still:demo` or `npm run render:demo` cannot run because browser or ffmpeg dependencies are missing, the acceptable cloud fallback is:

1. Generate or update the offline production package.
2. Open/review `preview.html`.
3. Review `sync_timeline.json`, `source_manifest.json`, `asset_manifest.csv`, `privacy_check.md`, `quality_review.md`, and `render_report.md`.
4. Record whether the package should be retained, cleaned, or rerun after environment repair.

The real MP4 should be generated in a GitHub runner, devcontainer, or local/CI environment with ffmpeg and Chrome/Chromium or Remotion Chrome Headless Shell available.

## GitHub render preview workflow

A dedicated `.github/workflows/render-preview.yml` workflow now attempts to install Chrome and ffmpeg, rebuild offline packages, validate packages, typecheck Remotion, render the default still/mp4 demo, and upload preview artifacts. If it fails, the uploaded logs should be treated as the render diagnostic record; the offline HTML previews remain the fallback review artifacts.
