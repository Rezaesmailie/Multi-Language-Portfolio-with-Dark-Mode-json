import {test, expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('three languages, RTL and shareable language links work', async ({page}) => {
  await page.goto('/?lang=fa');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#hero-title')).toContainText('رضا اسماعیل گل');
  await expect(page.locator('.brand')).toHaveAttribute('aria-label', 'رضا اسماعیل گل — خانه');
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fa_IR');
  await page.locator('[data-lang="de"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page).toHaveURL(/\?lang=de/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#hero-title')).toContainText('Full-Stack-Entwickler');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('theme selection persists across reload', async ({page}) => {
  await page.goto('/?lang=en');
  const original = await page.locator('html').getAttribute('data-theme');
  const next = original === 'dark' ? 'light' : 'dark';
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
});

test('project filters update cards and announce number of results', async ({page}) => {
  await page.goto('/?lang=en');
  await expect(page.locator('.project-card:visible')).toHaveCount(6);
  await page.locator('[data-filter="ai"]').click();
  await expect(page.locator('.project-card:visible')).toHaveCount(2);
  await expect(page.locator('[data-filter="ai"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#status-message')).toContainText('2 projects shown');
  await page.locator('[data-filter="web"]').click();
  await expect(page.locator('.project-card:visible')).toHaveCount(4);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator('.project-card:visible')).toHaveCount(6);
});

test('mobile menu supports open, Escape focus and anchor navigation', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/?lang=en');
  const toggle = page.locator('#menu-toggle');
  const nav = page.locator('#main-nav');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await nav.locator('a[href="#projects"]').click();
  await expect(nav).toBeHidden();
  await expect(page).toHaveURL(/#projects$/);
});

test('content fits desktop, tablet and small mobile widths across all languages', async ({page}) => {
  for (const lang of ['en', 'fa', 'de']) {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({width, height: 800});
      await page.goto('/?lang=' + lang);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      const metrics = await page.evaluate(() => ({
        viewport: window.innerWidth,
        page: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        offenders: [...document.querySelectorAll('body *')]
          .map((element) => ({element, bounds:element.getBoundingClientRect()}))
          .filter(({bounds}) => bounds.width && bounds.right > window.innerWidth + 2)
          .slice(0, 12)
          .map(({element, bounds}) => ({
            node: element.tagName.toLowerCase(),
            selector: element.id ? '#' + element.id : '.' + String(element.className || '').replace(/\s+/g,'.').slice(0,60),
            right: Math.round(bounds.right)
          }))
      }));
      expect(metrics.page, lang + ' at ' + width + 'px overflows: ' + JSON.stringify(metrics.offenders))
        .toBeLessThanOrEqual(metrics.viewport + 2);
    }
  }
});

test('core content loads without JavaScript exceptions', async ({page}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/?lang=en');
  expect(response.status()).toBe(200);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('#contact')).toContainText('rezadigital@gmail.com');
  await expect(page.locator('h1')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('capture real Chromium desktop and mobile previews for QA artifacts', async ({page}) => {
  mkdirSync('artifacts/screenshots', {recursive:true});
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/?lang=en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.screenshot({path:'artifacts/screenshots/desktop-en.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/?lang=fa');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await page.screenshot({path:'artifacts/screenshots/mobile-fa.png',fullPage:true,animations:'disabled'});
});
