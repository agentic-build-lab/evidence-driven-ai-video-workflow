import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const targetsPath = path.join(workspaceRoot, 'configs', 'source_targets', 'chinese_source_targets.json');
const screenshotDir = path.join(workspaceRoot, 'outputs', 'chinese_source_screenshots');
const captureDir = path.join(workspaceRoot, 'outputs', 'chinese_source_capture');
const manualMode = process.env.MANUAL_CAPTURE === '1';
const manualWaitMs = Number(process.env.MANUAL_WAIT_MS || 120000);

const dismissButtonTexts = [
  '同意',
  '同意并继续',
  '接受',
  '接受全部',
  '我知道了',
  '知道了',
  '稍后再说',
  '关闭',
  '跳过',
  '确认',
  '允许全部',
  '仅浏览',
];

const challengePatterns = [
  '请验证',
  '验证您是真人',
  '安全验证',
  '滑动验证',
  'captcha',
  'Cloudflare',
  'Verifying',
  '请完成验证',
  '环境异常',
];

const normalize = (value) => value.replace(/\s+/g, '');

const findTextRects = async (page, highlights) =>
  page.evaluate((needles) => {
    const normalizedNeedles = needles.map((text) => ({raw: text, compact: text.replace(/\s+/g, '')}));
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const matches = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent || '';
      const compact = text.replace(/\s+/g, '');
      for (const needle of normalizedNeedles) {
        if (!needle.compact || !compact.includes(needle.compact)) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = Array.from(range.getClientRects())
          .map((rect) => ({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
          }))
          .filter((rect) => rect.width > 0 && rect.height > 0);
        if (rects.length > 0) {
          matches.push({
            text: needle.raw,
            matchedText: text.trim().slice(0, 240),
            rects,
          });
        }
      }
    }
    return matches;
  }, highlights);

const overlayRects = async (page, boxes) =>
  page.evaluate((matches) => {
    const layer = document.createElement('div');
    layer.setAttribute('data-codex-marker-layer', '1');
    Object.assign(layer.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      right: '0',
      bottom: '0',
      pointerEvents: 'none',
      zIndex: '2147483647',
    });

    for (const match of matches) {
      const rect = match.rects[0];
      if (!rect) continue;
      const box = document.createElement('div');
      Object.assign(box.style, {
        position: 'fixed',
        left: `${Math.max(0, rect.x - 6)}px`,
        top: `${Math.max(0, rect.y - 4)}px`,
        width: `${rect.width + 12}px`,
        height: `${rect.height + 8}px`,
        border: '3px solid rgba(198,40,40,0.95)',
        background: 'rgba(198,40,40,0.08)',
        boxSizing: 'border-box',
      });
      layer.appendChild(box);
    }
    document.body.appendChild(layer);
  }, boxes);

const removeOverlay = async (page) =>
  page.evaluate(() => {
    document.querySelectorAll('[data-codex-marker-layer]').forEach((node) => node.remove());
  });

const targetId = process.env.TARGET_ID || '';
const targets = JSON.parse(await fs.readFile(targetsPath, 'utf8')).filter((target) => !targetId || target.id === targetId);
await fs.mkdir(screenshotDir, {recursive: true});
await fs.mkdir(captureDir, {recursive: true});
const browser = await chromium.launch({headless: !manualMode});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
});
const page = await context.newPage();
const manifest = [];

for (const target of targets) {
  const record = {
    id: target.id,
    label: target.label,
    url: target.url,
    kind: target.kind,
    status: 'pending',
    screenshot: null,
    annotatedScreenshot: null,
    boxes: null,
    challengeDetected: false,
    title: null,
    error: null,
  };
  try {
    await page.goto(target.url, {waitUntil: 'domcontentloaded', timeout: 60000});
    await page.waitForTimeout(4500);

    for (const text of dismissButtonTexts) {
      const locator = page.getByRole('button', {name: text});
      if (await locator.first().isVisible({timeout: 400}).catch(() => false)) {
        await locator.first().click({timeout: 1500}).catch(() => {});
        await page.waitForTimeout(700);
      }
    }

    if (manualMode) {
      console.log(JSON.stringify({event: 'manual_window_ready', id: target.id, url: target.url, waitMs: manualWaitMs}));
      await page.waitForTimeout(manualWaitMs);
    }

    const bodyText = await page.locator('body').innerText({timeout: 5000}).catch(() => '');
    const title = await page.title().catch(() => '');
    record.title = title;
    record.challengeDetected = challengePatterns.some((pattern) => `${title}\n${bodyText}`.includes(pattern));

    const screenshotPath = path.join(screenshotDir, `${target.id}.png`);
    await page.screenshot({path: screenshotPath, fullPage: false});
    record.screenshot = screenshotPath;

    const boxes = await findTextRects(page, target.highlights || []);
    const boxesPath = path.join(captureDir, `${target.id}_boxes.json`);
    await fs.writeFile(
      boxesPath,
      JSON.stringify(
        {
          id: target.id,
          label: target.label,
          url: target.url,
          viewport: {width: 1440, height: 900},
          challengeDetected: record.challengeDetected,
          highlights: target.highlights,
          boxes,
        },
        null,
        2,
      ),
      'utf8',
    );
    record.boxes = boxesPath;

    if (boxes.length > 0) {
      await overlayRects(page, boxes);
      const annotatedPath = path.join(screenshotDir, `${target.id}_annotated.png`);
      await page.screenshot({path: annotatedPath, fullPage: false});
      await removeOverlay(page);
      record.annotatedScreenshot = annotatedPath;
    }

    record.status = 'ok';
  } catch (error) {
    record.status = 'failed';
    record.error = String(error);
  }
  manifest.push(record);
  console.log(JSON.stringify({event: 'capture_result', ...record}));
}

await browser.close();
await fs.writeFile(path.join(captureDir, 'chinese_source_capture_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
