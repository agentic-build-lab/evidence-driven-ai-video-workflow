from __future__ import annotations

import importlib.util
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "apps" / "remotion_director"


def run(command: list[str], cwd: Path = ROOT) -> dict[str, object]:
    try:
        proc = subprocess.run(command, cwd=cwd, text=True, capture_output=True, timeout=30, check=False)
        return {
            "command": " ".join(command),
            "returncode": proc.returncode,
            "stdout": proc.stdout.strip()[-2000:],
            "stderr": proc.stderr.strip()[-2000:],
        }
    except Exception as exc:  # noqa: BLE001 - audit output should report unexpected environment errors.
        return {"command": " ".join(command), "error": repr(exc)}


def module_status(name: str) -> dict[str, object]:
    spec = importlib.util.find_spec(name)
    return {"module": name, "available": spec is not None}


def main() -> int:
    report = {
        "node": run(["node", "--version"]),
        "npm": run(["npm", "--version"]),
        "python": run(["python", "--version"]),
        "binaries": {
            "ffmpeg": shutil.which("ffmpeg"),
            "chromium": shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome"),
        },
        "python_modules": [module_status(name) for name in ["pdfplumber", "PIL", "cv2", "numpy"]],
        "remotion_package": run(["npm", "pkg", "get", "dependencies.@remotion/cli"], cwd=APP),
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    missing = []
    if not report["binaries"]["ffmpeg"]:
        missing.append("ffmpeg")
    if not report["binaries"]["chromium"]:
        missing.append("chromium_or_cached_remotion_chrome")
    missing.extend(item["module"] for item in report["python_modules"] if not item["available"])
    if missing:
        print(json.dumps({"status": "missing_dependencies", "missing": missing}, ensure_ascii=False))
        return 2
    print(json.dumps({"status": "ok"}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
