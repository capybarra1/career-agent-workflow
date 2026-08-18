(() => {
  const STORAGE_KEY = "editable-resume-v1";
  const resume = document.querySelector("#resume");
  const editButton = document.querySelector("#editButton");
  const lineHeight = document.querySelector("#lineHeight");
  const fontScale = document.querySelector("#fontScale");
  const importInput = document.querySelector("#importInput");
  let editing = false;

  const staticAssets = [...resume.querySelectorAll("[data-static-asset]")].map(node => ({
    key: node.dataset.staticAsset,
    selector: node.dataset.staticAsset === "portrait" ? ".portrait-frame img" : `[data-static-asset="${node.dataset.staticAsset}"]`,
    attributes: Object.fromEntries(["src", "srcset", "alt"].filter(name => node.hasAttribute(name)).map(name => [name, node.getAttribute(name)])),
  }));

  const refreshStaticAssets = () => {
    for (const asset of staticAssets) {
      const node = resume.querySelector(`[data-static-asset="${asset.key}"]`) || resume.querySelector(asset.selector);
      if (!node) continue;
      node.dataset.staticAsset = asset.key;
      for (const [name, value] of Object.entries(asset.attributes)) node.setAttribute(name, value);
    }
  };

  const save = () => {
    const payload = { html: resume.innerHTML, lineHeight: lineHeight.value, fontScale: fontScale.value, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const apply = payload => {
    if (!payload || typeof payload.html !== "string") return;
    resume.innerHTML = payload.html;
    refreshStaticAssets();
    if (payload.lineHeight) lineHeight.value = payload.lineHeight;
    if (payload.fontScale) fontScale.value = payload.fontScale;
    document.documentElement.style.setProperty("--line-height", lineHeight.value);
    document.documentElement.style.setProperty("--font-scale", fontScale.value);
  };

  try { apply(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch (_) {}

  editButton.addEventListener("click", () => {
    editing = !editing;
    document.body.classList.toggle("is-editing", editing);
    document.querySelectorAll(".editable").forEach(node => node.contentEditable = String(editing));
    editButton.textContent = editing ? "完成编辑" : "开始编辑";
    if (!editing) save();
  });

  resume.addEventListener("input", () => { if (editing) save(); });
  lineHeight.addEventListener("input", () => {
    document.documentElement.style.setProperty("--line-height", lineHeight.value);
    save();
  });
  fontScale.addEventListener("input", () => {
    document.documentElement.style.setProperty("--font-scale", fontScale.value);
    save();
  });

  document.querySelector("#printButton").addEventListener("click", () => window.print());
  document.querySelector("#resetButton").addEventListener("click", () => {
    if (!confirm("确定恢复模板并清除当前浏览器中的修改吗？")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
  document.querySelector("#exportButton").addEventListener("click", () => {
    save();
    const blob = new Blob([localStorage.getItem(STORAGE_KEY)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume-content-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  importInput.addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      apply(payload);
      save();
    } catch (_) { alert("无法恢复：请选择由本简历导出的 JSON 文件。"); }
    event.target.value = "";
  });
})();
