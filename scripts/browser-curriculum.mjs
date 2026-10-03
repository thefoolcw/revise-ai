/** Focused real-browser smoke, not full release QA.
 * Optional tooling: npm install --no-save --package-lock=false playwright @sparticuz/chromium
 * Run against the local preview: node scripts/browser-curriculum.mjs
 * Temporary accounts are removed, screenshots stay in ignored data/qa.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import chromium, { inflate } from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright';

const journeys = {
  university: { stage: 'UNIVERSITY', stageName: /^University/, yearName: /^Year 1\b/, year: 'uni-year-1', subject: 'law', name: 'Law', topics: 8, topic: /Legal institutions and precedent/, lesson: 'Identify the ratio in an appellate judgment', search: 'judicial review', hit: /Distinguish review of legality from a merits appeal/ },
  college: { stage: 'SIXTH_FORM', stageName: /^Sixth Form/, yearName: /^Year 12\b/, year: 'year-12', subject: 'further-maths', name: 'Further Mathematics', topics: 6, topic: /Complex numbers and Cartesian arithmetic/, lesson: 'Calculate with the imaginary unit', search: 'induction', hit: /Prove a finite sum by induction/ },
  secondary: { stage: 'SECONDARY', stageName: /^Secondary/, yearName: /^Year 10\b/, year: 'year-10', subject: 'maths', name: 'Mathematics', topics: 9, topic: /Exact values and numerical bounds/, lesson: 'Simplify surds while retaining exactness', search: 'surds', hit: /Simplify surds while retaining exactness/ }
};
const journey = journeys[process.argv[2] ?? 'university'];
assert(journey, 'Use university, college or secondary.');
await mkdir('data/qa', { recursive: true });
await inflate('node_modules/@sparticuz/chromium/bin/al2023.tar.br');
const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args.filter(arg => !['--disable-web-security', '--allow-running-insecure-content'].includes(arg)),
  env: { ...process.env, LD_LIBRARY_PATH: join(tmpdir(), 'al2023', 'lib') }, headless: true
});
const context = await browser.newContext({ baseURL: 'http://127.0.0.1:3000', viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
let signedIn = false;
try {
  await page.goto('/signup');
  await page.getByLabel('What should we call you?').fill('Browser verification');
  await page.getByLabel('Email', { exact: true }).fill(`browser-${randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill(`Check-${randomUUID()}!9`);
  const signupResponse = page.waitForResponse(response => response.url().endsWith('/api/auth/signup') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  const signup = await signupResponse;
  assert.equal(signup.status(), 200, `Signup failed (${signup.status()}); respect the signup throttle and retry after its window, without changing production limits.`);
  signedIn = true;
  await page.waitForURL('**/onboarding', { timeout: 60000 }); signedIn = true;
  const stageButton = page.getByRole('button', { name: journey.stageName });
  if (await stageButton.getAttribute('aria-expanded') !== 'true') await stageButton.click();
  await page.locator(`#stage-panel-${journey.stage}`).getByRole('button', { name: journey.yearName }).click();
  await page.getByRole('button', { name: /Continue to Subjects/i }).click();
  await page.getByRole('button', { name: journey.name, exact: true }).click();
  await page.getByRole('button', { name: /Continue to/ }).click();
  await page.getByRole('button', { name: /Finish & open My Subjects/ }).click();
  await page.waitForURL('**/app/dashboard', { timeout: 60000 });
  const profile = await (await context.request.get('/api/me')).json();
  assert.equal(profile.data.user.yearGroup, journey.year);
  assert.deepEqual(profile.data.user.subjectIds, [journey.subject]);
  await page.locator(`a[href^="/app/subjects/${journey.subject}"]`).click();
  await page.getByRole('heading', { name: journey.name, exact: true }).waitFor();
  assert.equal(await page.locator('a[href^="/app/topics/"]').count(), journey.topics);
  await page.getByRole('link', { name: journey.topic }).click();
  await page.getByRole('link', { name: journey.lesson }).click();
  await page.getByRole('heading', { name: journey.lesson, exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Memory aids', exact: true }).waitFor();
  for (const [label, width, height] of [['desktop', 1920, 1080], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `horizontal overflow at ${label}`);
    const layout = await page.locator('main#main').boundingBox();
    assert(layout && layout.width >= Math.min(width, 600) * 0.8 && layout.x >= 0 && layout.x + layout.width <= width + 2, `main clipped or collapsed at ${label}`);
    if (width < 980) {
      await page.locator('.app-topbar').waitFor({ state: 'visible' });
      await page.locator('.app-rail').waitFor({ state: 'hidden' });
    }
    await page.screenshot({ path: `data/qa/${journey.subject}-${label}.png`, fullPage: true });
    if (label === 'mobile') await page.screenshot({ path: `data/qa/${journey.subject}-mobile-viewport.png` });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/app/dashboard');
  await page.getByRole('button', { name: '+ Add Subject', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('checkbox', { name: journey.name, exact: true }).uncheck();
  await dialog.getByRole('button', { name: /Save/ }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.deepEqual((await (await context.request.get('/api/me')).json()).data.user.subjectIds, []);
  await page.reload();
  await page.getByRole('button', { name: '+ Add Subject', exact: true }).click();
  await dialog.getByRole('checkbox', { name: journey.name, exact: true }).check();
  await dialog.getByRole('button', { name: /Save/ }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.deepEqual((await (await context.request.get('/api/me')).json()).data.user.subjectIds, [journey.subject]);
  await page.goto('/app/learn');
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(journey.search);
  await page.getByRole('button', { name: 'Find lessons', exact: true }).click();
  await page.getByRole('link', { name: journey.hit }).waitFor();
  assert.deepEqual(errors, [], 'browser console/runtime errors');
  console.log(`PASS browser: signup → ${journey.year} → ${journey.name} → dashboard → ${journey.topics} topics → Free lesson; desktop/tablet/mobile layout; remove/re-add; specialist search; no runtime/console errors. Not full release QA.`);
} finally {
  if (signedIn) {
    const response = await context.request.delete('/api/me');
    assert.equal(response.status(), 200, 'temporary account cleanup');
  }
  await browser.close();
}
