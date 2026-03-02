/**
 * Screenshot utility for PB-014 visual QA workflow
 * Usage: npx tsx scripts/screenshot.ts [url] [name]
 * Example: npx tsx scripts/screenshot.ts http://localhost:4321 homepage-hero-v1
 *
 * Captures both desktop (1440px) and mobile (390px) viewports.
 * Saves to temporary-screenshots/ directory.
 */
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = join(process.cwd(), 'temporary-screenshots');

async function takeScreenshots(url: string, name: string) {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();

  // Desktop viewport (1440px)
  const desktopPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await desktopPage.goto(url, { waitUntil: 'networkidle' });
  await desktopPage.screenshot({
    path: join(SCREENSHOT_DIR, `${name}-desktop.png`),
    fullPage: true,
  });
  console.log(`Saved: ${name}-desktop.png`);

  // Mobile viewport (iPhone 14 Pro - 390px)
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await mobilePage.goto(url, { waitUntil: 'networkidle' });
  await mobilePage.screenshot({
    path: join(SCREENSHOT_DIR, `${name}-mobile.png`),
    fullPage: true,
  });
  console.log(`Saved: ${name}-mobile.png`);

  await browser.close();
}

const url = process.argv[2] || 'http://localhost:4321';
const name = process.argv[3] || 'screenshot';

takeScreenshots(url, name).catch(console.error);
