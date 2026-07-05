import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = path.resolve(process.cwd());
const assetDir = path.join(workspaceRoot, 'work', 'v5_sample', 'assets');
const outputDir = path.join(workspaceRoot, 'outputs', 'v5_sample_45s');
const captureDir = path.join(outputDir, 'source_capture');
const targetId = process.env.TARGET_ID || '';
const manualMode = process.env.MANUAL_CAPTURE === '1';
const manualWaitMs = Number(process.env.MANUAL_WAIT_MS || 180000);
const deviceScaleFactor = Number(process.env.DEVICE_SCALE_FACTOR || 2);

const allTargets = [
  {
    id: 'xinhua_av_2026',
    label: '新华社网络视听报告',
    url: 'https://www.news.cn/politics/20260415/d6bcb493ce874914a5a4904706eca27b/c.html',
    primaryNeedle: '网络视听用户规模达10.99亿人',
    needles: ['10.99亿', '10.99亿人', '网络视听用户规模达10.99亿人'],
  },
  {
    id: 'xinhua_av_visual_2026',
    label: '新华社数览中国脉动',
    url: 'https://www.news.cn/fortune/20260415/5c3fa1ad75244d4ba9e7372646c11d74/c.html',
    primaryNeedle: '10.99亿',
    needles: ['人均单日使用时长超200分钟', 'AI生成视音频内容超20亿条', '10.99亿'],
  },
  {
    id: 'xinhua_ai_video_ecology',
    label: '新华社AI重塑网络视听生态',
    url: 'https://www.news.cn/politics/20260417/c329c27f06514782be53c9e5dbdb0946/c.html',
    needles: ['AI', '生成', '网络视听'],
  },
  {
    id: 'pubmed_notification',
    label: 'PubMed通知干扰研究',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26121498/',
    needles: ['The attentional cost of receiving a cell phone notification', 'notification'],
  },
];
const targets = allTargets.filter((target) => !targetId || target.id === targetId);

const dismissButtonTexts = [
  '同意',
  '接受',
  'Accept all',
  'Reject all',
  'I agree',
  '关闭',
  '知道了',
  '确定',
];

const challengePatterns = ['captcha', 'Cloudflare', 'Verifying', '安全验证', '真人验证', '请完成验证'];
challengePatterns.push('reCAPTCHA', '正在检查', '验证');

const compactWithMap = (value) => {
  let compact = '';
  const map = [];
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (/\s/.test(char)) continue;
    compact += char.toLowerCase();
    map.push(index);
  }
  return {compact, map};
};

const findRangeInText = (text, needle) => {
  const directIndex = text.indexOf(needle);
  if (directIndex >= 0) {
    return {start: directIndex, end: directIndex + needle.length};
  }

  const source = compactWithMap(text);
  const target = compactWithMap(needle);
  const compactIndex = source.compact.indexOf(target.compact);
  if (compactIndex < 0 || target.compact.length === 0) {
    return null;
  }

  return {
    start: source.map[compactIndex],
    end: source.map[compactIndex + target.compact.length - 1] + 1,
  };
};

const findTextRects = async (page, needles) =>
  page.evaluate(
    ({needleTexts, compactSource}) => {
      const makeCompact = (value) => {
        let compact = '';
        const map = [];
        for (let index = 0; index < value.length; index += 1) {
          const char = value[index];
          if (/\s/.test(char)) continue;
          compact += char.toLowerCase();
          map.push(index);
        }
        return {compact, map};
      };

      const findRange = (text, needle) => {
        const directIndex = text.indexOf(needle);
        if (directIndex >= 0) {
          return {start: directIndex, end: directIndex + needle.length};
        }

        const source = makeCompact(text);
        const target = makeCompact(needle);
        const compactIndex = source.compact.indexOf(target.compact);
        if (compactIndex < 0 || target.compact.length === 0) return null;
        return {
          start: source.map[compactIndex],
          end: source.map[compactIndex + target.compact.length - 1] + 1,
        };
      };

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const matches = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent || '';
        for (const needle of needleTexts) {
          const rangeMatch = findRange(text, needle);
          if (!rangeMatch) continue;
          const range = document.createRange();
          range.setStart(node, rangeMatch.start);
          range.setEnd(node, rangeMatch.end);
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
              pageX: rect.x + window.scrollX,
              pageY: rect.y + window.scrollY,
            }))
            .filter((rect) => rect.width > 1 && rect.height > 1);
          if (rects.length > 0) {
            matches.push({
              needle,
              matchedText: text.trim().slice(0, 260),
              rects,
            });
          }
        }
      }
      return matches;
    },
    {needleTexts: needles, compactSource: compactWithMap.toString()},
  );

const selectPrimaryMatches = (matches, target) => {
  if (matches.length === 0) return [];
  const exactPrimary = matches.filter((match) => match.needle === target.primaryNeedle);
  if (exactPrimary.length > 0) {
    return [exactPrimary.sort((a, b) => a.rects[0].pageY - b.rects[0].pageY)[0]];
  }

  const ranked = [...matches].sort((a, b) => {
    const lengthDelta = b.needle.length - a.needle.length;
    if (lengthDelta !== 0) return lengthDelta;
    return a.rects[0].pageY - b.rects[0].pageY;
  });
  return [ranked[0]];
};

const injectOverlay = async (page, matches, mode = 'underline') =>
  page.evaluate(
    ({items, overlayMode}) => {
      document.querySelectorAll('[data-codex-v5-marker]').forEach((node) => node.remove());
      const layer = document.createElement('div');
      layer.setAttribute('data-codex-v5-marker', 'layer');
      Object.assign(layer.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        zIndex: '2147483647',
      });

      for (const match of items) {
        for (const rect of match.rects) {
          const marker = document.createElement('div');
          const base = {
            position: 'fixed',
            left: `${Math.max(0, rect.x - 4)}px`,
            boxSizing: 'border-box',
          };
          if (overlayMode === 'background') {
            Object.assign(marker.style, base, {
              top: `${Math.max(0, rect.y - 3)}px`,
              width: `${rect.width + 8}px`,
              height: `${rect.height + 6}px`,
              background: 'rgba(198,40,40,0.16)',
              borderBottom: '4px solid rgba(198,40,40,0.9)',
            });
          } else {
            Object.assign(marker.style, base, {
              top: `${Math.max(0, rect.y + rect.height + 3)}px`,
              width: `${rect.width + 8}px`,
              height: '7px',
              background: 'rgba(198,40,40,0.82)',
            });
          }
          layer.appendChild(marker);
        }
      }
      document.body.appendChild(layer);
    },
    {items: matches, overlayMode: mode},
  );

const removeOverlay = async (page) =>
  page.evaluate(() => {
    document.querySelectorAll('[data-codex-v5-marker]').forEach((node) => node.remove());
  });

await fs.mkdir(assetDir, {recursive: true});
await fs.mkdir(captureDir, {recursive: true});

const browser = await chromium.launch({headless: !manualMode});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor,
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
    status: 'pending',
    title: null,
    challengeDetected: false,
    topScreenshot: null,
    focusScreenshot: null,
    annotatedScreenshot: null,
    boxesJson: null,
    matches: 0,
    error: null,
  };

  try {
    await page.goto(target.url, {waitUntil: 'domcontentloaded', timeout: 60000});
    await page.waitForLoadState('networkidle', {timeout: 12000}).catch(() => {});
    await page.waitForTimeout(2500);

    for (const label of dismissButtonTexts) {
      const button = page.getByRole('button', {name: label});
      if (await button.first().isVisible({timeout: 450}).catch(() => false)) {
        await button.first().click({timeout: 1500}).catch(() => {});
        await page.waitForTimeout(600);
      }
    }

    let title = await page.title().catch(() => '');
    let bodyText = await page.locator('body').innerText({timeout: 6000}).catch(() => '');
    record.title = title;
    record.challengeDetected = challengePatterns.some((pattern) => `${title}\n${bodyText}`.includes(pattern));

    if (record.challengeDetected && manualMode) {
      console.log(
        JSON.stringify({
          event: 'manual_verification_required',
          id: target.id,
          url: target.url,
          waitMs: manualWaitMs,
          message: 'Please complete the visible browser verification. Capture will resume automatically.',
        }),
      );
      await page.waitForTimeout(manualWaitMs);
      title = await page.title().catch(() => '');
      bodyText = await page.locator('body').innerText({timeout: 6000}).catch(() => '');
      record.title = title;
      record.challengeDetected = challengePatterns.some((pattern) => `${title}\n${bodyText}`.includes(pattern));
    }

    const topPath = path.join(assetDir, `${target.id}_top.png`);
    await page.screenshot({path: topPath, fullPage: false});
    record.topScreenshot = topPath;

    let allMatches = await findTextRects(page, target.needles);
    let selectedMatches = selectPrimaryMatches(allMatches, target);
    if (selectedMatches.length > 0) {
      const firstRect = selectedMatches[0].rects[0];
      await page.evaluate((pageY) => window.scrollTo({top: Math.max(0, pageY - 290), behavior: 'instant'}), firstRect.pageY);
      await page.waitForTimeout(900);
      allMatches = await findTextRects(page, target.needles);
      selectedMatches = selectPrimaryMatches(allMatches, target);
    }

    const focusPath = path.join(assetDir, `${target.id}_focus.png`);
    await page.screenshot({path: focusPath, fullPage: false});
    record.focusScreenshot = focusPath;

    if (selectedMatches.length > 0) {
      await injectOverlay(page, selectedMatches, target.id.includes('xinhua') ? 'background' : 'underline');
      const annotatedPath = path.join(assetDir, `${target.id}_annotated.png`);
      await page.screenshot({path: annotatedPath, fullPage: false});
      await removeOverlay(page);
      record.annotatedScreenshot = annotatedPath;
    }

    const boxes = {
      id: target.id,
      label: target.label,
      url: target.url,
      title,
      challengeDetected: record.challengeDetected,
      viewport: {width: 1440, height: 900},
      deviceScaleFactor,
      needles: target.needles,
      primaryNeedle: target.primaryNeedle,
      selectedMatches,
      allMatches,
      bodyTextSample: bodyText.slice(0, 1200),
    };
    const boxesPath = path.join(captureDir, `${target.id}_boxes.json`);
    await fs.writeFile(boxesPath, JSON.stringify(boxes, null, 2), 'utf8');
    record.boxesJson = boxesPath;
    record.matches = selectedMatches.length;
    record.status = 'ok';
  } catch (error) {
    record.status = 'failed';
    record.error = String(error);
  }

  manifest.push(record);
  console.log(JSON.stringify({event: 'v5_capture_result', ...record}));
}

await browser.close();
await fs.writeFile(path.join(captureDir, 'v5_source_capture_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
