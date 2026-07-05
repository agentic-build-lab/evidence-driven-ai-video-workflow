# Recipe: CNNIC Short-Video Users Offline Evidence Fixture

## Selection input

- Direction: `ai_video_tools`
- Topic brief command: `python scripts/topic_discovery/build_topic_brief.py --direction ai_video_tools --timestamp 20260705T000000Z`
- Narrative goal: use official short-video scale evidence to explain why AI video workflows need proof trails, not just faster editing.

## Source material

- PDF fixture: `examples/source_capture/official_sources/cnnic_55_statistical_report.pdf`
- Screenshot fixture: `examples/source_capture/official_source_screenshots/cnnic_55_report_page_40.png`
- Bbox fixture: `examples/mainline_v4_sync/cnnic_pdf_bbox.json`
- Topic brief: `examples/topic_briefs/short-video-scale-makes-evidence-first-ai-video-workflows-necessary_20260705T000000Z.json`

## Highlight and zoom parameters

- Composition target: `EvidenceSourceZoomDemo`
- Intended video spec: 1080x1920, 30 fps, 59 seconds.
- Evidence event: `source_zoom`, 3000-9500 ms.
- Bbox path: `examples/mainline_v4_sync/cnnic_pdf_bbox.json`
- Camera action: `zoom_to_pdf_line_and_highlight`.

## Privacy and public-video policy

- Public-reference video: none.
- Face/account/comment/QR/logo masking: not needed for this fixture.
- If public-video insert is added later, run privacy mosaic first and record mask regions before rendering.

## Audio-visual sync

- Timeline: `sync_timeline.json`
- Events: hook, source zoom, interpretation.
- Review gate: all voiceover claims must remain tied to the source manifest and bbox evidence before publish.

## Preview and render commands

Offline review package:

```bash
python scripts/workflow/build_offline_production_package.py \
  --topic-brief examples/topic_briefs/short-video-scale-makes-evidence-first-ai-video-workflows-necessary_20260705T000000Z.json \
  --package-id cnnic_short_video_users_offline_cli_20260705T000000Z \
  --git-commit fixture-generated-from-35dcda1 \
  --force
python scripts/workflow/validate_production_package.py examples/production_packages/cnnic_short_video_users_offline_cli_20260705T000000Z
```

Real Remotion render once dependencies exist:

```bash
cd apps/remotion_director
npm run still:demo
npm run render:demo
```

## Quality judgment

- Recommended retention: keep as offline review fixture.
- Grade: B.
- Why not A: no real MP4/contact sheet was produced in this container because Chrome Headless Shell download and ffmpeg availability are blocked.

## Failure history

- Remotion still failed when Chrome Headless Shell download from `remotion.media` returned DNS `EAI_AGAIN`.
- `ffmpeg` is not installed in this container.
- No secrets, cookies, browser cache, raw public-video file, or large generated media should be committed.

## Evidence timing grammar applied

| Time | Event | source_id | visual_action | zoom_or_highlight | privacy_action | voiceover_density | comfort_note |
|---:|---|---|---|---|---|---|---|
| 0-3s | hook | `topic_brief_fixture` | conflict subtitle + source teaser | no zoom yet | no people/accounts/comments shown | high | do not overclaim before evidence appears |
| 3-8s | first official evidence | `cnnic_55th_statistical_report_page_40_fixture` | wide PDF screenshot | quick target-line hint | no masking needed for official PDF | medium | show provenance before interpretation |
| 8-18s | evidence zoom | `cnnic_55th_statistical_report_page_40_fixture` | push in to bbox and lock | line-box + underline synced to narration | no masking needed | medium-low | leave reading space |
| 18-35s | second evidence/context | `xinhua_network_av_2026_fixture` | split-screen context/chart placeholder | gentle Ken Burns + label highlight | future public-video insert must be masked first | medium | context supports, not replaces, the source |
| 35-55s | synthesis | `cnnic_55th_statistical_report_page_40_fixture` | source label + manifest path | subtle source-path highlight | no public-video data | medium | conclusion must point back to evidence |
| 55-59s | review gate | `package_manifest` | review checklist card | static checklist highlight | confirm no secrets/raw public video | low | end with review, not auto-publish |
