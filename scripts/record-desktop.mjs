// Records the ?tour=1 walkthrough in a desktop browser window to tmp/desktop.webm.
import { chromium } from "playwright";
const BASE = process.env.BASE_URL ?? "https://nextjs-weight-care-monitor.vercel.app";
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "en-US", timezoneId: "America/Chicago", recordVideo: { dir: "tmp", size: { width: 1280, height: 800 } } });
const page = await ctx.newPage();
await page.goto(`${BASE}/sign-in?tour=1`);
await page.waitForTimeout(28000);
const v = page.video();
await ctx.close();
console.log(await v.path());
await browser.close();
