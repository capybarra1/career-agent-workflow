#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const playwrightCandidates = [
  process.env.PLAYWRIGHT_PATH,
  "playwright",
  path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"),
].filter(Boolean);
let playwright;
for (const candidate of playwrightCandidates) {
  try {
    playwright = require(candidate);
    break;
  } catch (_) {}
}
if (!playwright) {
  console.error("Playwright was not found. Set PLAYWRIGHT_PATH to its package directory and retry.");
  process.exit(1);
}
const { chromium } = playwright;

const root = path.resolve(process.argv[2] || ".");
const html = path.join(root, "index.html");
if (!fs.existsSync(html)) {
  console.error(`missing index.html at ${root}`);
  process.exit(1);
}

const candidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  chromium.executablePath(),
].filter(Boolean);
const executablePath = candidates.find(candidate => fs.existsSync(candidate));
if (!executablePath) {
  console.error("No Chromium executable found. Set CHROME_PATH and retry.");
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
  await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  const metrics = await page.evaluate(() => {
    const sheet = document.querySelector("#resume");
    const meaningful = [...sheet.querySelectorAll("h1, h2, .contact, .entry-head, li")].filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0 && node.textContent.trim().length > 0;
    });
    const sheetRect = sheet.getBoundingClientRect();
    const contentBottom = Math.max(...meaningful.map(node => node.getBoundingClientRect().bottom - sheetRect.top));
    const a4HeightPx = 297 / 25.4 * 96;
    return {
      ratio: contentBottom / sheet.clientHeight,
      sheetHeight: sheet.getBoundingClientRect().height,
      a4HeightPx,
      scrollHeight: sheet.scrollHeight,
      clientHeight: sheet.clientHeight,
      scrollWidth: sheet.scrollWidth,
      clientWidth: sheet.clientWidth,
    };
  });
  await browser.close();

  const fill = metrics.ratio * 100;
  const overflow = metrics.scrollHeight > metrics.clientHeight + 1 || metrics.scrollWidth > metrics.clientWidth + 1 || metrics.sheetHeight > metrics.a4HeightPx + 2;
  console.log(`A4 fill: ${fill.toFixed(1)}%; overflow: ${overflow ? "yes" : "no"}`);
  if (overflow || metrics.ratio < 0.94 || metrics.ratio > 0.985) {
    console.error("failed: the final meaningful text must end at 94%–98.5% of A4 sheet height without overflow");
    process.exit(1);
  }
  console.log("OK: A4 page fill validated");
})().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
