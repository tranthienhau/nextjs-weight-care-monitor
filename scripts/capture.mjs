// Captures real screenshots of the running app (phone + desktop) into screenshots/.
// Usage: BASE_URL=http://localhost:3100 node scripts/capture.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = process.env.OUT ?? "screenshots";
await mkdir(OUT, { recursive: true });

const phoneShots = [
  { user: null, path: "/sign-in", name: "01-sign-in" },
  { user: "s-lee", path: "/today", name: "02-ma-today" },
  { user: "s-lee", path: "/patients", name: "03-patients" },
  { user: "s-lee", path: "/patients/p-alvarez", name: "04-patient-record" },
  { user: "s-lee", path: "/patients/p-alvarez/measure", name: "05-new-measurement", values: ["202.8", "38.0", "71.4", "125.7"] },
  { user: "s-lee", path: "/patients/p-alvarez/bp/new", name: "06-blood-pressure-entry", fill: true },
  { user: "s-lee", path: "/patients/p-alvarez/body", name: "07-weight-trends" },
  { user: "s-lee", path: "/patients/p-alvarez/bp", name: "08-bp-history" },
  { user: "s-lee", path: "/patients/p-alvarez/labs", name: "09-labs" },
  { user: "s-lee", path: "/patients/p-alvarez/meds", name: "10-medications" },
  { user: "s-marsh", path: "/review", name: "11-review-queue" },
  { user: "s-marsh", path: "/review/p-alvarez", name: "12-sign-review" },
  { user: "s-lee", path: "/tasks", name: "13-tasks" },
  { user: "s-becker", path: "/more/reports", name: "14-reports" },
  { user: "s-becker", path: "/more/users", name: "15-users-roles" },
  { user: "s-marsh", path: "/more/audit", name: "16-audit-log" },
  { user: "p-alvarez", path: "/portal", name: "17-patient-home" },
  { user: "p-kim", path: "/portal", name: "18-patient-first-visit" },
  { user: "p-alvarez", path: "/portal/check-in", name: "19-monthly-check-in", clicks: ["Send an update", "A bit better", "Next", "Yes, mild", "Next", "About the same"] },
  { user: "p-alvarez", path: "/portal/messages", name: "20-patient-messages" },
];

const desktopShots = [
  { user: null, path: "/sign-in", name: "d1-desktop-sign-in" },
  { user: "s-lee", path: "/today", name: "d2-desktop-ma-today" },
  { user: "s-lee", path: "/patients/p-alvarez", name: "d3-desktop-patient-record" },
  { user: "s-lee", path: "/patients/p-alvarez/body", name: "d4-desktop-weight-trends" },
  { user: "s-marsh", path: "/review", name: "d5-desktop-review-queue" },
  { user: "s-marsh", path: "/review/p-alvarez", name: "d6-desktop-sign-review" },
  { user: "s-becker", path: "/more/reports", name: "d7-desktop-reports" },
  { user: "p-alvarez", path: "/portal", name: "d8-desktop-patient-portal" },
];

/** Persisted zustand state with the chosen demo user signed in. */
const seedUser = async (page, user) => {
  await page.goto(`${BASE}/sign-in`);
  await page.evaluate((u) => {
    localStorage.clear();
    if (u) localStorage.setItem("steadfast-demo-v1", JSON.stringify({ state: { userId: u }, version: 1 }));
  }, user);
};

const run = async (shots, ctxOpts, fullPage) => {
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome", args: ["--lang=en-US"] });
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  for (const s of shots) {
    await seedUser(page, s.user);
    await page.goto(`${BASE}${s.path}`, { waitUntil: "networkidle" });
    if (s.fill) {
      const inputs = page.locator("input[inputmode=decimal], input[inputmode=numeric]");
      if ((await inputs.count()) >= 3) {
        await inputs.nth(0).fill("146");
        await inputs.nth(1).fill("94");
        await inputs.nth(2).fill("78");
      }
    }
    if (s.values) {
      const inputs = page.locator("input[inputmode=decimal]");
      for (let i = 0; i < s.values.length && i < (await inputs.count()); i++) await inputs.nth(i).fill(s.values[i]);
    }
    for (const label of s.clicks ?? []) {
      const byText = page.getByText(label, { exact: true });
      const target = (await byText.count()) ? byText.first() : page.getByRole("button", { name: new RegExp(label) }).first();
      await target.click();
      await page.waitForTimeout(250);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage });
    console.log("shot", s.name);
  }
  await browser.close();
};

if (process.env.ONLY !== "desktop") await run(phoneShots, { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "en-US", timezoneId: "America/Chicago" }, false);
if (process.env.ONLY !== "phone") await run(desktopShots, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "en-US", timezoneId: "America/Chicago" }, false);
