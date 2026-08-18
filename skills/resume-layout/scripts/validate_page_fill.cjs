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
  const defaults = await page.evaluate(() => ({
    lineHeight: document.querySelector("#lineHeight")?.value,
    fontScale: document.querySelector("#fontScale")?.value,
  }));
  const interaction = await page.evaluate(() => {
    const lineHeight = document.querySelector("#lineHeight");
    const fontScale = document.querySelector("#fontScale");
    const portrait = document.querySelector(".portrait-frame img");
    if (!lineHeight || !fontScale || !portrait) return { controls: false };
    lineHeight.value = "1.55";
    lineHeight.dispatchEvent(new Event("input", { bubbles: true }));
    fontScale.value = "0.97";
    fontScale.dispatchEvent(new Event("input", { bubbles: true }));
    const key = Object.keys(localStorage).find(item => {
      try { return JSON.parse(localStorage.getItem(item)).html; } catch (_) { return false; }
    });
    if (!key) return { controls: true, saved: false };
    const payload = JSON.parse(localStorage.getItem(key));
    const currentPortrait = portrait.getAttribute("src");
    payload.html = payload.html
      .replace(currentPortrait, "stale-portrait.png")
      .replace(/\sdata-static-asset="[^"]*"/, "")
      .replace("<h1", '<h1 data-migration-test="kept"');
    return { controls: true, saved: true, currentPortrait, payload };
  });
  const importDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-layout-import-"));
  const importPath = path.join(importDir, "stale-backup.json");
  fs.writeFileSync(importPath, JSON.stringify(interaction.payload), "utf8");
  await page.setInputFiles("#importInput", importPath);
  await page.waitForFunction(() => document.querySelector("h1")?.dataset.migrationTest === "kept");
  await page.reload({ waitUntil: "networkidle" });
  const persisted = await page.evaluate(expectedPortrait => ({
    lineHeight: document.querySelector("#lineHeight")?.value,
    fontScale: document.querySelector("#fontScale")?.value,
    portrait: document.querySelector(".portrait-frame img")?.getAttribute("src"),
    textEdit: document.querySelector("h1")?.dataset.migrationTest,
    expectedPortrait,
  }), interaction.currentPortrait);
  fs.unlinkSync(importPath);
  fs.rmdirSync(importDir);
  await page.evaluate(values => {
    const lineHeight = document.querySelector("#lineHeight");
    const fontScale = document.querySelector("#fontScale");
    lineHeight.value = values.lineHeight;
    fontScale.value = values.fontScale;
    document.documentElement.style.setProperty("--line-height", values.lineHeight);
    document.documentElement.style.setProperty("--font-scale", values.fontScale);
  }, defaults);
  await page.emulateMedia({ media: "print" });
  const metrics = await page.evaluate(() => {
    const sheet = document.querySelector("#resume");
    const meaningful = [...sheet.querySelectorAll("h1, h2, .contact, .entry-head, li")].filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0 && node.textContent.trim().length > 0;
    });
    const sheetRect = sheet.getBoundingClientRect();
    const identity = sheet.querySelector(".identity").getBoundingClientRect();
    const portrait = sheet.querySelector(".portrait-frame").getBoundingClientRect();
    const portraitImage = sheet.querySelector(".portrait-frame img");
    const portraitRect = portraitImage.getBoundingClientRect();
    const entryMetrics = [...sheet.querySelectorAll(".entry")].map(entry => {
      const title = entry.querySelector(".entry-head strong");
      const body = entry.querySelector("li");
      if (!title || !body) return null;
      const titleStyle = getComputedStyle(title);
      const bodyStyle = getComputedStyle(body);
      const titleSize = parseFloat(titleStyle.fontSize);
      const bodySize = parseFloat(bodyStyle.fontSize);
      return { ratio: titleSize / bodySize, delta: titleSize - bodySize, titleColor: titleStyle.color, bodyColor: bodyStyle.color };
    }).filter(Boolean);
    const entryGaps = [...sheet.querySelectorAll(".resume-section")].flatMap(section => {
      const entries = [...section.querySelectorAll(":scope > .entry")];
      return entries.slice(1).map((entry, index) => entry.getBoundingClientRect().top - entries[index].getBoundingClientRect().bottom);
    });
    const bulletGaps = [...sheet.querySelectorAll(".entry ul")].flatMap(list => {
      const items = [...list.children];
      return items.slice(1).map((item, index) => item.getBoundingClientRect().top - items[index].getBoundingClientRect().bottom);
    });
    const dividerGaps = [...sheet.querySelectorAll(".resume-section")].map(section => {
      const heading = section.querySelector("h2")?.getBoundingClientRect();
      const content = section.querySelector(".entry, ul")?.getBoundingClientRect();
      return heading && content ? content.top - heading.bottom : 0;
    });
    const firstSectionGap = sheet.querySelector(".resume-section").getBoundingClientRect().top - sheet.querySelector(".resume-header").getBoundingClientRect().bottom;
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
      headerCenterDelta: Math.abs((identity.top + identity.height / 2) - (portrait.top + portrait.height / 2)),
      firstSectionGap,
      titleRatioMin: Math.min(...entryMetrics.map(item => item.ratio)),
      titleDeltaMin: Math.min(...entryMetrics.map(item => item.delta)),
      detailContrastOK: entryMetrics.every(item => item.bodyColor !== item.titleColor),
      entryGapMin: entryGaps.length ? Math.min(...entryGaps) : Infinity,
      bulletGapMax: bulletGaps.length ? Math.max(...bulletGaps) : 0,
      portraitRatio: portraitRect.width / portraitRect.height,
      naturalPortraitRatio: portraitImage.naturalWidth / portraitImage.naturalHeight,
      dividerGapMin: Math.min(...dividerGaps),
    };
  });
  await browser.close();

  const fill = metrics.ratio * 100;
  const overflow = metrics.scrollHeight > metrics.clientHeight + 1 || metrics.scrollWidth > metrics.clientWidth + 1 || metrics.sheetHeight > metrics.a4HeightPx + 2;
  const interactionOK = interaction.controls && interaction.saved
    && persisted.lineHeight === "1.55" && persisted.fontScale === "0.97"
    && persisted.portrait === persisted.expectedPortrait && persisted.textEdit === "kept";
  const hierarchyOK = metrics.headerCenterDelta <= 11.5 && metrics.firstSectionGap >= 2 && metrics.firstSectionGap <= 20
    && metrics.titleRatioMin >= 1.12 && metrics.titleDeltaMin >= 1.3 && metrics.detailContrastOK
    && metrics.entryGapMin >= metrics.bulletGapMax * 1.25 && metrics.dividerGapMin >= 4
    && Math.abs(metrics.portraitRatio - metrics.naturalPortraitRatio) <= 0.01;
  console.log(`A4 fill: ${fill.toFixed(1)}%; overflow: ${overflow ? "yes" : "no"}`);
  console.log(`Hierarchy: title ${metrics.titleRatioMin.toFixed(2)}x/+${metrics.titleDeltaMin.toFixed(1)}px; header delta ${metrics.headerCenterDelta.toFixed(1)}px; entry/bullet gap ${metrics.entryGapMin.toFixed(1)}/${metrics.bulletGapMax.toFixed(1)}px; divider gap ${metrics.dividerGapMin.toFixed(1)}px; portrait ratio ${metrics.portraitRatio.toFixed(3)}`);
  console.log(`Persistence: ${interactionOK ? "ok" : "failed"}`);
  if (overflow || metrics.ratio < 0.94 || metrics.ratio > 0.985 || !hierarchyOK || !interactionOK) {
    console.error("failed: require 94%–98.5% A4 fill, no overflow, readable hierarchy, uncropped portrait, and persistent independent controls/static assets");
    process.exit(1);
  }
  console.log("OK: A4 page fill validated");
})().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
