# Render CI Environment

This project uses GitHub Actions and a devcontainer for reproducible evidence
video rendering. The runner owns the heavy runtime setup; Codex task containers
should not be expected to provide browser binaries, `ffmpeg`, or CJK fonts.

## Runtime Dependencies

- Python 3.12
- Node.js 22
- `ffmpeg`
- Chrome or Chromium
- browser runtime libraries for headless rendering
- `fonts-noto-cjk`
- `fonts-noto-color-emoji`
- Python packages from `requirements.txt`
- Remotion packages from `apps/remotion_director/package-lock.json`

## CI Contract

The workflow at `.github/workflows/render-preview.yml` runs:

1. dependency installation;
2. Python dependency installation;
3. Remotion dependency installation;
4. TypeScript typecheck;
5. demo still render;
6. demo MP4 render;
7. artifact upload.

The generated still and MP4 are uploaded as GitHub Actions artifacts with short
retention. They are not committed to Git by default.

## Local Devcontainer

Open the repository in the devcontainer and run:

```bash
cd apps/remotion_director
npm run still:demo
npm run render:demo
```

## Artifact Policy

Commit source configs, source manifests, asset manifests, sync timelines,
privacy checks, recipes, and quality reports. Keep large videos, local browser
state, cookies, raw public video downloads, private avatars, and failed render
experiments out of Git unless a specific reviewed artifact is intentionally
published through Releases, Git LFS, or external object storage.
