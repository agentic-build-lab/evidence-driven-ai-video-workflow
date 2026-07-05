import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const captureDir = path.join(workspaceRoot, 'outputs', 'chinese_source_capture');
const outputPath = path.join(captureDir, 'zoom_lock_plan.json');

const viewport = {width: 1440, height: 900};
const display = {width: 1120, height: 620};

const unionRects = (rects) => {
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  return {x: left, y: top, width: right - left, height: bottom - top, right, bottom};
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const files = (await fs.readdir(captureDir)).filter((name) => name.endsWith('_boxes.json'));
const plans = [];

for (const file of files) {
  const data = JSON.parse(await fs.readFile(path.join(captureDir, file), 'utf8'));
  const visibleMatches = (data.boxes || []).filter((match) =>
    match.rects?.some((rect) => rect.y >= 0 && rect.y <= viewport.height && rect.x >= 0 && rect.x <= viewport.width),
  );
  if (visibleMatches.length === 0) {
    plans.push({
      id: data.id,
      label: data.label,
      url: data.url,
      status: 'no_visible_match',
      reason: 'No highlighted text box was visible in the captured viewport. Recapture with scroll or a better focus target.',
    });
    continue;
  }

  const primary = visibleMatches[0];
  const focusRect = unionRects(primary.rects.filter((rect) => rect.width > 0 && rect.height > 0));
  const focusCenter = {
    x: focusRect.x + focusRect.width / 2,
    y: focusRect.y + focusRect.height / 2,
  };
  const desiredTextWidth = display.width * 0.56;
  const focusScale = clamp(desiredTextWidth / Math.max(focusRect.width, 120), 1.15, 2.8);
  const translate = {
    x: Math.round(display.width / 2 - focusCenter.x * focusScale),
    y: Math.round(display.height * 0.45 - focusCenter.y * focusScale),
  };

  plans.push({
    id: data.id,
    label: data.label,
    url: data.url,
    status: 'ok',
    primaryText: primary.text,
    focusRect,
    remotion: {
      viewport,
      display,
      fullView: {
        scale: 0.74,
        translateX: 0,
        translateY: 0,
        durationFrames: 70,
      },
      zoomToFocus: {
        scale: Number(focusScale.toFixed(3)),
        translateX: translate.x,
        translateY: translate.y,
        durationFrames: 42,
        easing: 'cameraEase',
      },
      lockedHold: {
        durationFrames: 85,
        allowCameraMotion: false,
        allowedMotion: ['marker_draw', 'underline_draw', 'dim_non_focus'],
      },
      marker: {
        x: Math.round(focusRect.x),
        y: Math.round(focusRect.y),
        width: Math.round(focusRect.width),
        height: Math.round(focusRect.height),
        delayAfterZoomFrames: 8,
      },
    },
  });
}

await fs.writeFile(outputPath, JSON.stringify({generatedAt: new Date().toISOString(), plans}, null, 2), 'utf8');
console.log(JSON.stringify({event: 'zoom_lock_plan_done', output: outputPath, count: plans.length}));
