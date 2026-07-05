from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = ROOT / "configs" / "video_montage" / "ice_water_stomach_commons_sources.json"
DEFAULT_OUTPUT_ROOT = ROOT / "examples" / "production_packages"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a review-gated video montage package from public video source URLs without downloading large media.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG))
    parser.add_argument("--output-root", default=str(DEFAULT_OUTPUT_ROOT))
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def created_at_from_package(package_id: str) -> str:
    ts = package_id.rsplit("_", 1)[-1]
    try:
        return datetime.strptime(ts, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    except ValueError:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def build_source_manifest(config: dict[str, Any]) -> dict[str, Any]:
    return {
        "package_id": config["package_id"],
        "topic": config["topic"],
        "source_discovery_mode": "public_frontdoor_urls_from_config",
        "review_gate": config["review_gate"],
        "sources": [
            {
                "source_id": source["source_id"],
                "title": source["title"],
                "source_page_url": source["source_page_url"],
                "video_url": source["video_url"],
                "license_review": source["license_review"],
                "risk_level": source["risk_level"],
                "semantic_role": source["semantic_role"],
                "download_policy": "do_not_download_in_codex_container; remote_preview_or_review_only",
                "human_review_required": True,
            }
            for source in config["sources"]
        ],
    }


def write_asset_manifest(path: Path, config: dict[str, Any]) -> None:
    rows = [
        {
            "asset_id": source["source_id"],
            "asset_type": "remote_public_video_url",
            "path": source["video_url"],
            "origin": source["source_page_url"],
            "public_commit_allowed": "true",
            "license_notes": source["license_review"],
            "risk_notes": source["risk_level"],
        }
        for source in config["sources"]
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def build_timeline(config: dict[str, Any]) -> dict[str, Any]:
    timeline = []
    for item in config["timeline"]:
        normalized = dict(item)
        normalized.setdefault("duration_ms", normalized["end_ms"] - normalized["start_ms"])
        normalized.setdefault("transition", "hard_cut" if normalized.get("source_id") != "package_manifest" else "chapter_flash_3_frames_allowed")
        timeline.append(normalized)
    return {
        "package_id": config["package_id"],
        "topic": config["topic"],
        "orientation": config["orientation"],
        "style_profile": config.get("style_profile", "review_preview"),
        "duration_ms": max(item["end_ms"] for item in timeline),
        "review_gate": config["review_gate"],
        "timeline": timeline,
    }

def caption_html(caption: str, keywords: list[str] | None) -> str:
    output = caption
    for keyword in keywords or []:
        output = output.replace(keyword, f"<span>{keyword}</span>")
    return output


def write_preview(path: Path, config: dict[str, Any]) -> None:
    source_by_id = {source["source_id"]: source for source in config["sources"]}
    body = [
        "<!doctype html>",
        "<meta charset=\"utf-8\">",
        f"<title>{config['package_id']} video montage preview</title>",
        "<style>body{font-family:system-ui,sans-serif;max-width:1180px;margin:32px auto;background:#111;color:#eee;line-height:1.45}.clip{margin:18px 0;padding:10px 0}.frame{position:relative;background:#000;overflow:hidden;border-radius:10px}video{width:100%;max-height:560px;background:#000;display:block}.caption{position:absolute;left:5%;right:5%;bottom:7%;text-align:center;font-size:40px;font-weight:900;line-height:1.08;color:#fff;-webkit-text-stroke:1.5px #000;text-shadow:0 4px 0 #000,0 0 12px #000}.caption span{color:#ffd529}.credit,.risk,.transition{font-size:14px;color:#bbb;margin:6px 0}.gate{border:2px solid #f6c343;padding:16px;border-radius:10px;background:#211b05}</style>",
        f"<h1>{config['topic']}</h1>",
        "<p>Landscape 16:9 review preview. Remote public video URLs are embedded for review; no large source videos are committed.</p>",
    ]
    timeline = build_timeline(config)["timeline"]
    for item in timeline:
        source = source_by_id.get(item["source_id"])
        body.append("<section class=\"clip\">")
        body.append(f"<h2>{item['clip_id']} · {item['start_ms']/1000:.0f}-{item['end_ms']/1000:.0f}s</h2>")
        body.append("<div class=\"frame\">")
        if source:
            body.append(f"<video controls preload=\"metadata\" src=\"{source['video_url']}#t={item['source_in_sec']},{item['source_out_sec']}\"></video>")
        else:
            body.append("<div class=\"gate\"><strong>Review gate card</strong></div>")
        body.append(f"<div class=\"caption\">{caption_html(item['caption'], item.get('caption_keywords'))}</div>")
        body.append("</div>")
        if source:
            body.append(f"<p class=\"credit\">Source: <a href=\"{source['source_page_url']}\">{source['title']}</a></p>")
        body.append(f"<p class=\"transition\">Transition: {item.get('transition', 'hard_cut')}</p>")
        body.append(f"<p class=\"risk\">Risk: {item['risk_note']} · Action: {item['visual_action']}</p>")
        body.append("</section>")
    body.append("<section class=\"gate\"><strong>Review gate:</strong> Verify source licenses, medical claims, subtitle meaning, privacy, and copyright before rendering or publishing.</section>")
    path.write_text("\n".join(body) + "\n", encoding="utf-8")


def write_reports(package_dir: Path, config: dict[str, Any]) -> None:
    (package_dir / "privacy_check.md").write_text(
        "# Privacy Check\n\n"
        "- Public source type: Wikimedia Commons/public-frontdoor video URLs.\n"
        "- No platform-login, captcha, paywall, or private user content is accessed.\n"
        "- Identifiable people may appear in some source videos; every clip remains `yellow` until license/privacy review.\n"
        "- If any faces/accounts/comments/logos become prominent in a final render, add masks or replace the clip.\n"
        "- Review gate: human approval required before publication.\n",
        encoding="utf-8",
    )
    (package_dir / "render_report.md").write_text(
        "# Render Report\n\n"
        f"- Package: `{config['package_id']}`\n"
        "- Render mode: HTML video montage preview using remote public video URLs.\n"
        "- MP4 not generated in this container because ffmpeg and Chrome/Chromium/Remotion browser are unavailable.\n"
        "- Fallback artifact: `preview.html`.\n"
        "- Future full render: download/cache reviewed sources in `work/` or private storage, then compose with Remotion/ffmpeg.\n",
        encoding="utf-8",
    )
    (package_dir / "quality_review.md").write_text(
        "# Quality Review\n\n"
        "- Quality grade: `B-`\n"
        "- Retention recommendation: `retain_as_remote_video_montage_review_fixture`\n"
        "- Strength: validates real-video source URL selection, montage timeline, captions, source credits, and risk notes without committing large media.\n"
        "- Gap: no local MP4; all video URLs require final license/privacy review and resilient local caching before publication.\n"
        "- Publish decision: not approved.\n",
        encoding="utf-8",
    )
    (package_dir / "recipe.md").write_text(
        "# Recipe: Ice Water and Stomach Public-Video Montage\n\n"
        "- Topic: 喝冰水伤胃吗？冰水背了多少年的锅？\n"
        "- Structure: 引入主题 -> 场景/生活经验 -> 日常语境 -> 机理解释 -> 个体差异 -> review gate.\n"
        "- Source discovery: public-frontdoor Wikimedia Commons URLs from `configs/video_montage/ice_water_stomach_commons_sources.json`.\n"
        "- Clip count: 5 real public video URL clips plus one generated review gate card.\n"
        "- Preview command: `python scripts/video_pipeline/build_video_montage_package.py --force`.\n"
        "- Validation command: `python scripts/workflow/validate_video_montage_package.py examples/production_packages/ice_water_stomach_video_montage_20260705T000000Z`.\n"
        "- Full MP4 command future: run in a render worker with ffmpeg and Chrome/Chromium after licenses are reviewed.\n"
        "- Risk: all external video clips are `yellow` until license/privacy review.\n",
        encoding="utf-8",
    )


def main() -> int:
    args = parse_args()
    config = read_json(Path(args.config))
    package_dir = Path(args.output_root) / config["package_id"]
    if package_dir.exists() and not args.force:
        raise FileExistsError(f"Package exists: {package_dir}. Use --force to regenerate fixture outputs.")
    package_dir.mkdir(parents=True, exist_ok=True)
    write_json(package_dir / "run_manifest.json", {
        "package_id": config["package_id"],
        "created_at": created_at_from_package(config["package_id"]),
        "topic": config["topic"],
        "orientation": config["orientation"],
        "review_gate": config["review_gate"],
        "paths": {
            "source_manifest": "source_manifest.json",
            "asset_manifest": "asset_manifest.csv",
            "montage_timeline": "montage_timeline.json",
            "preview": "preview.html",
            "privacy_check": "privacy_check.md",
            "render_report": "render_report.md",
            "quality_review": "quality_review.md",
            "recipe": "recipe.md"
        },
        "large_or_local_video_assets_committed": False,
        "remote_video_urls_only": True,
    })
    write_json(package_dir / "source_manifest.json", build_source_manifest(config))
    write_asset_manifest(package_dir / "asset_manifest.csv", config)
    write_json(package_dir / "montage_timeline.json", build_timeline(config))
    write_preview(package_dir / "preview.html", config)
    write_reports(package_dir, config)
    print(json.dumps({"event": "video_montage_package_written", "package_dir": str(package_dir), "clips": len(config["timeline"])}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
