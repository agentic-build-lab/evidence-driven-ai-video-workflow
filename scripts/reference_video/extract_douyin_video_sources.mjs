import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const targetsPath = path.join(workspaceRoot, 'configs', 'source_targets', 'douyin_video_probe_targets.json');
const outputDir = path.join(workspaceRoot, 'outputs', 'reference_video_probe');

const targetId = process.env.TARGET_ID || '';
const targets = JSON.parse(await fs.readFile(targetsPath, 'utf8')).filter((target) => !targetId || target.id === targetId);
await fs.mkdir(outputDir, {recursive: true});
const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
});
const page = await context.newPage();
const results = [];

for (const target of targets) {
  const result = {
    id: target.id,
    url: target.url,
    topic: target.topic,
    title: '',
    status: 'pending',
    currentSrc: '',
    mediaUrlType: '',
    error: null,
  };
  try {
    await page.goto(target.url, {waitUntil: 'domcontentloaded', timeout: 60000});
    await page.waitForTimeout(7000);
    result.title = await page.title().catch(() => '');
    result.currentSrc = await page
      .locator('video')
      .first()
      .evaluate((video) => video.currentSrc || video.src || '')
      .catch(() => '');
    if (!result.currentSrc) {
      result.status = 'no_video_src';
    } else if (result.currentSrc.startsWith('blob:')) {
      result.status = 'blob_src';
      result.mediaUrlType = 'blob';
    } else if (result.currentSrc.startsWith('http')) {
      result.status = 'http_src';
      result.mediaUrlType = 'http';
    } else {
      result.status = 'unknown_src';
      result.mediaUrlType = result.currentSrc.split(':')[0] || 'unknown';
    }
  } catch (error) {
    result.status = 'failed';
    result.error = String(error);
  }
  results.push(result);
  console.log(JSON.stringify({event: 'douyin_video_source_probe', ...result, currentSrc: result.currentSrc ? '[redacted]' : ''}));
}

await browser.close();
await fs.writeFile(path.join(outputDir, 'douyin_video_current_srcs.json'), JSON.stringify(results, null, 2), 'utf8');
