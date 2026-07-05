import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const targetsPath = path.join(workspaceRoot, 'configs', 'source_targets', 'douyin_video_probe_targets.json');
const outputDir = path.join(workspaceRoot, 'outputs', 'reference_video_probe');
const manualMode = process.env.MANUAL_CAPTURE === '1';
const manualWaitMs = Number(process.env.MANUAL_WAIT_MS || 120000);

const targetId = process.env.TARGET_ID || '';
const targets = JSON.parse(await fs.readFile(targetsPath, 'utf8')).filter((target) => !targetId || target.id === targetId);
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
const results = [];

for (const target of targets) {
  const targetDir = path.join(outputDir, target.id);
  await fs.mkdir(targetDir, {recursive: true});
  const result = {
    id: target.id,
    url: target.url,
    topic: target.topic,
    screenshot: path.join(targetDir, 'page_probe.png'),
    status: 'pending',
    title: null,
    hasVideoElement: false,
    videoSrcCount: 0,
    bodySample: '',
    error: null,
  };
  try {
    await page.goto(target.url, {waitUntil: 'domcontentloaded', timeout: 60000});
    await page.waitForTimeout(6000);
    if (manualMode) {
      console.log(JSON.stringify({event: 'manual_window_ready', id: target.id, url: target.url, waitMs: manualWaitMs}));
      await page.waitForTimeout(manualWaitMs);
    }
    await page.screenshot({path: result.screenshot, fullPage: false});
    result.title = await page.title().catch(() => '');
    result.hasVideoElement = await page.locator('video').count().then((count) => count > 0).catch(() => false);
    result.videoSrcCount = await page
      .locator('video')
      .evaluateAll((nodes) => nodes.map((node) => node.currentSrc || node.src).filter(Boolean).length)
      .catch(() => 0);
    result.bodySample = await page.locator('body').innerText({timeout: 5000}).then((text) => text.slice(0, 500)).catch(() => '');
    result.status = 'ok';
  } catch (error) {
    result.status = 'failed';
    result.error = String(error);
  }
  results.push(result);
  console.log(JSON.stringify({event: 'douyin_video_page_probe', ...result}));
}

await browser.close();
await fs.writeFile(path.join(outputDir, 'douyin_page_probe_results.json'), JSON.stringify(results, null, 2), 'utf8');
