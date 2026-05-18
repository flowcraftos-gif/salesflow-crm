const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'qa-screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);

const BASE_URL = 'https://tamdee.space';

async function auditPage(page, label, url, width, height) {
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', err => errors.push('[pageerror] ' + err.message));

  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // wait a bit for lazy load / animations
  await page.waitForTimeout(2000);

  const screenshotPath = path.join(SCREENSHOTS_DIR, `${label}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Check body text
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 3000));

  // Check for horizontal overflow
  const overflowInfo = await page.evaluate(() => {
    const body = document.body;
    const scrollWidth = body.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const overflowElements = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > clientWidth + 5) {
        overflowElements.push({
          tag: el.tagName,
          id: el.id || '',
          cls: (el.className || '').toString().slice(0, 60),
          right: Math.round(rect.right),
          clientWidth
        });
      }
    });
    return {
      scrollWidth,
      clientWidth,
      hasOverflow: scrollWidth > clientWidth,
      overflowElements: overflowElements.slice(0, 10)
    };
  });

  // Check for overlapping / z-index issues (spot check key elements)
  const zOverlap = await page.evaluate(() => {
    const results = [];
    const els = Array.from(document.querySelectorAll('h1, h2, button, a, input, form'));
    for (let i = 0; i < els.length; i++) {
      const r = els[i].getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        results.push({ tag: els[i].tagName, text: els[i].innerText.slice(0, 40), issue: 'zero-size' });
      }
    }
    return results;
  });

  return {
    label,
    url,
    screenshotPath,
    errors,
    warnings,
    overflowInfo,
    zeroSizeElements: zOverlap,
    bodyTextSnippet: bodyText.slice(0, 500)
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const results = [];

  // 1. Landing page — mobile 390px
  {
    const page = await context.newPage();
    const r = await auditPage(page, 'landing-mobile-390', BASE_URL, 390, 844);
    results.push(r);
    await page.close();
  }

  // 2. Sign-in page — mobile 390px
  {
    const page = await context.newPage();
    const r = await auditPage(page, 'signin-mobile-390', `${BASE_URL}/sign-in`, 390, 844);
    results.push(r);
    await page.close();
  }

  // 3. Landing page — desktop 1440px
  {
    const page = await context.newPage();
    const r = await auditPage(page, 'landing-desktop-1440', BASE_URL, 1440, 900);
    results.push(r);
    await page.close();
  }

  await browser.close();

  // Print report
  console.log('\n========== TAMDEE MOBILE QA AUDIT ==========\n');
  for (const r of results) {
    console.log(`--- ${r.label} ---`);
    console.log(`URL: ${r.url}`);
    console.log(`Screenshot: ${r.screenshotPath}`);
    console.log(`Console Errors (${r.errors.length}):`);
    r.errors.forEach(e => console.log('  [ERROR]', e));
    if (r.errors.length === 0) console.log('  none');
    console.log(`Horizontal Overflow: ${r.overflowInfo.hasOverflow ? 'YES — scrollWidth=' + r.overflowInfo.scrollWidth + ' clientWidth=' + r.overflowInfo.clientWidth : 'no'}`);
    if (r.overflowInfo.overflowElements.length > 0) {
      console.log('  Overflow elements:');
      r.overflowInfo.overflowElements.forEach(e => console.log(`    <${e.tag}> id="${e.id}" class="${e.cls}" right=${e.right} (viewport=${e.clientWidth})`));
    }
    console.log(`Zero-size interactive elements: ${r.zeroSizeElements.length === 0 ? 'none' : ''}`);
    r.zeroSizeElements.forEach(e => console.log(`  [ZERO-SIZE] <${e.tag}> "${e.text}"`));
    console.log(`Body text snippet:\n  ${r.bodyTextSnippet.replace(/\n/g, ' ').slice(0, 200)}`);
    console.log('');
  }

  // Save JSON
  const jsonPath = path.join(SCREENSHOTS_DIR, 'audit-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`Full results saved to: ${jsonPath}`);
})();
