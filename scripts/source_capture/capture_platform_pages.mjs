import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'outputs', 'platform_source_screenshots');
await fs.mkdir(outputDir, {recursive: true});

const pages = [
  {
    name: 'google_deepmind_veo_page_clean.png',
    url: 'https://deepmind.google/models/veo/',
    wait: 4500,
    dismiss: ['Reject all', 'Accept all', 'I agree'],
  },
  {
    name: 'runway_gen4_page_clean.png',
    url: 'https://runwayml.com/research/introducing-runway-gen-4',
    wait: 4500,
    dismiss: ['Reject All', 'Reject all', 'Deny', 'Accept All', 'Accept all'],
  },
  {
    name: 'openai_sora_page_probe.png',
    url: 'https://openai.com/index/sora/',
    wait: 4500,
    dismiss: ['Reject all', 'Accept all'],
  },
];

const browser = await chromium.launch({headless: true});
const page = await browser.newPage({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
});

for (const item of pages) {
  try {
    await page.goto(item.url, {waitUntil: 'domcontentloaded', timeout: 45000});
    await page.waitForTimeout(item.wait);
    for (const label of item.dismiss) {
      const locator = page.getByRole('button', {name: label});
      if (await locator.first().isVisible({timeout: 900}).catch(() => false)) {
        await locator.first().click({timeout: 2000}).catch(() => {});
        await page.waitForTimeout(900);
        break;
      }
    }
    await page.screenshot({path: path.join(outputDir, item.name), fullPage: false});
    console.log(JSON.stringify({event: 'screenshot_done', name: item.name, url: item.url}));
  } catch (error) {
    console.log(JSON.stringify({event: 'screenshot_failed', name: item.name, url: item.url, error: String(error)}));
  }
}

await browser.close();
