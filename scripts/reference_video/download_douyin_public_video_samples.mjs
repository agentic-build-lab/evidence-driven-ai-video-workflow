import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const targetsPath = path.join(workspaceRoot, 'configs', 'source_targets', 'douyin_video_probe_targets.json');
const outputDir = path.join(workspaceRoot, 'outputs', 'reference_video_probe');
const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const targetId = process.env.TARGET_ID || '';
const targets = JSON.parse(await fs.readFile(targetsPath, 'utf8')).filter((target) => !targetId || target.id === targetId);
const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  userAgent,
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
    status: 'pending',
    title: '',
    rawVideo: path.join(targetDir, 'raw_public_video.mp4'),
    bytes: 0,
    contentType: '',
    error: null,
  };

  try {
    await page.goto(target.url, {waitUntil: 'domcontentloaded', timeout: 65000});
    await page.waitForTimeout(8000);
    result.title = await page.title().catch(() => '');
    const currentSrc = await page
      .locator('video')
      .first()
      .evaluate((video) => video.currentSrc || video.src || '')
      .catch(() => '');

    if (!currentSrc || !currentSrc.startsWith('http')) {
      result.status = currentSrc ? 'unsupported_src' : 'no_src';
      throw new Error(`No downloadable http video source. sourceType=${currentSrc.split(':')[0] || 'empty'}`);
    }

    const response = await context.request.get(currentSrc, {
      timeout: 65000,
      headers: {
        Referer: target.url,
        'User-Agent': userAgent,
        Accept: '*/*',
      },
    });
    result.contentType = response.headers()['content-type'] || '';
    if (!response.ok()) {
      result.status = 'http_failed';
      throw new Error(`Video request failed: ${response.status()} ${response.statusText()}`);
    }

    const body = await response.body();
    await fs.writeFile(result.rawVideo, body);
    result.bytes = body.length;
    result.status = 'downloaded';
  } catch (error) {
    if (result.status === 'pending') result.status = 'failed';
    result.error = String(error);
  }
  results.push(result);
  console.log(JSON.stringify({event: 'douyin_public_video_download_probe', ...result, rawVideo: result.rawVideo}));
}

await browser.close();
await fs.writeFile(path.join(outputDir, 'douyin_public_video_download_results.json'), JSON.stringify(results, null, 2), 'utf8');
