import { n1 } from "../core/geometry.js";
import { labelPadding, labelPath } from "../core/label.js";
import { el } from "../core/scene.js";
import { h, segmented } from "./dom.js";
import { icon } from "./icons.js";

export const SIZES = { s: 0.84, m: 1, l: 1.16 };
const SIZE_ORDER = ["s", "m", "l"];
const OPENERS = /[\s([{“‘\-—]/;

const smartQuotes = (s) =>
  s
    .replace(/(^|[\s([{“‘-])"/g, "$1“")
    .replace(/"/g, "”")
    .replace(/(^|[\s([{“-])'/g, "$1‘")
    .replace(/'/g, "’")
    .replace(/--/g, "—")
    .replace(/\.\.\./g, "…");

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function runsFromNode(root) {
  const runs = [];
  const walk = (node, flags) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        if (child.data) runs.push({ text: child.data, ...flags });
      } else if (child.nodeType === 1) {
        const tag = child.tagName;
        if (tag === "BR") {
          runs.push({ text: " ", ...flags });
          continue;
        }
        const next = { ...flags };
        if (tag === "B" || tag === "STRONG" || tag === "I" || tag === "EM") next.b = true;
        if (tag === "U") next.u = true;
        walk(child, next);
      }
    }
  };
  walk(root, {});
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    const t = { text: r.text.replace(/\s+/g, " "), b: !!r.b, u: !!r.u };
    if (last && last.b === t.b && last.u === t.u) last.text += t.text;
    else merged.push(t);
  }
  return merged;
}

function htmlFromRuns(runs) {
  return runs
    .map((r) => {
      let s = escapeHtml(r.text);
      if (r.u) s = `<u>${s}</u>`;
      if (r.b) s = `<b>${s}</b>`;
      return s;
    })
    .join("");
}

function runsFromHtml(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html || "";
  return runsFromNode(tpl.content);
}

function trimRuns(runs) {
  const out = runs.map((r) => ({ ...r }));
  while (out.length && !out[0].text.trim()) out.shift();
  while (out.length && !out[out.length - 1].text.trim()) out.pop();
  if (out.length) {
    out[0].text = out[0].text.replace(/^\s+/, "");
    out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, "");
  }
  return out;
}

export class Caption {
  constructor(desk) {
    this.desk = desk;
    this.style = { italic: false, size: "m", label: true };
    const readonly = desk.options.readonly;
    this.text = h("span", {
      class: "caption-text",
      contenteditable: readonly ? "false" : "true",
      role: readonly ? null : "textbox",
      "aria-label": "Caption",
      "aria-multiline": "false",
      spellcheck: "true",
      "data-placeholder": readonly ? "" : desk.options.placeholder,
    });
    this.backing = el("svg", { class: "caption-backing", "aria-hidden": "true" });
    this.backingPath = el("path", {}, this.backing);
    this.el = h(
      "p",
      { class: "caption" },
      this.backing,
      h("span", { class: "quote", "aria-hidden": "true", text: "“" }),
      this.text,
      h("span", { class: "quote", "aria-hidden": "true", text: "”" }),
    );
    if (readonly) return;
    this.bar = this.buildBar();
    this.el.addEventListener("pointerdown", (e) => {
      if (!this.text.contains(e.target)) {
        e.preventDefault();
        this.focus();
      }
    });
    this.text.addEventListener("beforeinput", (e) => {
      if (e.inputType === "insertParagraph" || e.inputType === "insertLineBreak") e.preventDefault();
    });
    this.text.addEventListener("input", (e) => this.onInput(e));
    this.text.addEventListener("keydown", (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === "Enter") {
        e.preventDefault();
        this.text.blur();
      } else if (e.key === "Escape") this.text.blur();
      else if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        this.format("bold");
      } else if (mod && e.key.toLowerCase() === "u") {
        e.preventDefault();
        this.format("underline");
      }
      e.stopPropagation();
    });
    this.text.addEventListener("paste", (e) => {
      const text = e.clipboardData?.getData("text/plain");
      if (text == null) return;
      e.preventDefault();
      document.execCommand("insertText", false, smartQuotes(text.replace(/\s*\n\s*/g, " ")));
    });
    this.text.addEventListener("focus", () => this.showBar());
    this.text.addEventListener("blur", () => setTimeout(() => this.maybeHide(), 0));
    document.addEventListener("selectionchange", (this.onSelection = () => this.refreshMarks()));
  }

  selection() {
    return this.desk.shadow.getSelection?.() || window.getSelection();
  }

  buildBar() {
    const keep = (node) => {
      node.addEventListener("pointerdown", (e) => e.preventDefault());
      node.addEventListener("mousedown", (e) => e.preventDefault());
      return node;
    };
    const button = (name, label, key, fn) =>
      keep(
        h("button", {
          type: "button",
          class: "icon-button",
          "aria-label": label,
          "data-tip": label,
          "data-key": key,
          "aria-pressed": "false",
          html: icon(name),
          onclick: fn,
        }),
      );
    this.quotesButton = button("quote", "Quote marks", "", () => this.desk.toggleQuotes());
    this.boldButton = button("bold", "Bold", "⌘B", () => this.format("bold"));
    this.underlineButton = button("underline", "Underline", "⌘U", () => this.format("underline"));
    this.smaller = button("a-arrow-down", "Smaller", "", () => this.resize(-1));
    this.larger = button("a-arrow-up", "Larger", "", () => this.resize(1));
    this.styleControl = keep(
      segmented(
        [
          { id: "roman", label: "Roman" },
          { id: "italic", label: "Italic" },
        ],
        this.style.italic ? "italic" : "roman",
        (id) => this.setStyle({ italic: id === "italic" }),
        { label: "Caption style" },
      ),
    );
    this.styleControl.classList.add("caption-style");
    const divider = () => h("span", { class: "divider", "aria-hidden": "true" });
    return h(
      "div",
      { class: "caption-bar", role: "toolbar", "aria-label": "Caption", hidden: true },
      this.quotesButton,
      divider(),
      this.styleControl,
      divider(),
      this.boldButton,
      this.underlineButton,
      divider(),
      this.smaller,
      this.larger,
    );
  }

  showBar() {
    if (!this.bar) return;
    this.leaving?.cancel();
    this.leaving = null;
    this.bar.hidden = false;
    this.refreshMarks();
    this.place();
    this.styleControl.place?.(true);
    this.bar.animate(
      [
        { opacity: 0, transform: "translateY(4px) scale(0.97)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 200, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
    );
  }

  maybeHide() {
    if (!this.bar) return;
    const active = this.desk.shadow.activeElement;
    if (active === this.text || this.bar.contains(active)) return;
    if (this.bar.hidden || this.leaving) return;
    this.leaving = this.bar.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(4px) scale(0.97)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" },
    );
    const done = () => {
      const anim = this.leaving;
      this.leaving = null;
      anim?.cancel();
      const now = this.desk.shadow.activeElement;
      if (now !== this.text && !this.bar.contains(now)) {
        this.bar.hidden = true;
        this.desk.root.removeAttribute("data-captioning");
      }
    };
    this.leaving.onfinish = done;
    this.leaving.oncancel = () => (this.leaving = null);
  }

  place() {
    if (!this.bar || this.bar.hidden) return;
    const docked = this.desk.compact;
    this.bar.toggleAttribute("data-docked", docked);
    this.desk.root.toggleAttribute("data-captioning", docked);
    if (docked) {
      this.bar.style.left = "";
      this.bar.style.top = "";
      return;
    }
    const sheet = this.desk.sheet.getBoundingClientRect();
    const host = this.desk.root.getBoundingClientRect();
    const cap = this.el.getBoundingClientRect();
    const margin = parseFloat(getComputedStyle(this.desk.root).getPropertyValue("--layout-margin")) || 16;
    const half = this.bar.offsetWidth / 2;
    const center = sheet.left - host.left + sheet.width / 2;
    this.bar.style.left = `${Math.min(host.width - margin - half, Math.max(margin + half, center))}px`;
    this.bar.style.top = `${cap.top - host.top - 52}px`;
  }

  focus() {
    this.text.focus();
    const range = document.createRange();
    range.selectNodeContents(this.text);
    range.collapse(false);
    const sel = this.selection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  format(command) {
    if (this.desk.shadow.activeElement !== this.text) this.text.focus();
    document.execCommand("styleWithCSS", false, false);
    document.execCommand(command, false, null);
    this.normalize();
    this.commit();
    this.refreshMarks();
  }

  refreshMarks() {
    if (!this.bar || this.bar.hidden) return;
    const sel = this.selection();
    let node = sel?.anchorNode;
    let i = false;
    let u = false;
    while (node && node !== this.text) {
      if (node.nodeType === 1) {
        if (node.tagName === "B" || node.tagName === "STRONG") i = true;
        if (node.tagName === "U") u = true;
      }
      node = node.parentNode;
    }
    if (!node) return;
    this.boldButton.setAttribute("aria-pressed", String(i));
    this.underlineButton.setAttribute("aria-pressed", String(u));
  }

  resize(direction) {
    const i = SIZE_ORDER.indexOf(this.style.size);
    const next = SIZE_ORDER[Math.max(0, Math.min(SIZE_ORDER.length - 1, i + direction))];
    this.setStyle({ size: next });
  }

  setStyle(change, { silent } = {}) {
    Object.assign(this.style, change);
    this.el.toggleAttribute("data-italic", !!this.style.italic);
    this.el.toggleAttribute("data-plain", this.style.label === false);
    this.desk.host.style.setProperty("--caption-scale", String(SIZES[this.style.size] || 1));
    if (this.bar) {
      this.styleControl.set?.(this.style.italic ? "italic" : "roman");
      this.smaller.disabled = this.style.size === "s";
      this.larger.disabled = this.style.size === "l";
    }
    this.desk.captionLines = 0;
    this.desk.layout();
    requestAnimationFrame(() => this.place());
    if (!silent) this.desk.changed();
  }

  onInput(e) {
    this.fixTyping(e);
    this.normalize();
    this.commit();
    this.fitBacking();
  }

  fitBacking() {
    if (!this.desk.root?.hasAttribute("data-bleed")) return;
    const p = this.el.getBoundingClientRect();
    const rects = [this.text, ...this.el.querySelectorAll(".quote")].map((n) => n.getBoundingClientRect()).filter((r) => r.width);
    if (!p.width || !rects.length) return;
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const pad = labelPadding(parseFloat(getComputedStyle(this.el).fontSize));
    const w = right - left + pad.x * 2;
    const hgt = bottom - top + pad.y * 2;
    Object.assign(this.backing.style, {
      left: `${Math.round(left - p.left - pad.x)}px`,
      top: `${Math.round(top - p.top - pad.y)}px`,
      width: `${Math.round(w)}px`,
      height: `${Math.round(hgt)}px`,
    });
    this.backing.setAttribute("viewBox", `0 0 ${n1(w)} ${n1(hgt)}`);
    this.backingPath.setAttribute("d", labelPath(0, 0, w, hgt));
  }

  fixTyping(e) {
    if (e?.inputType !== "insertText" || !e.data) return;
    const sel = this.selection();
    const node = sel?.anchorNode;
    if (!node || node.nodeType !== 3 || !sel.isCollapsed) return;
    let offset = sel.anchorOffset;
    let data = node.data;
    const ch = data[offset - 1];
    const prev = offset >= 2 ? data[offset - 2] : this.charBefore(node);
    let replaced = false;
    if (ch === '"') {
      const open = !prev || OPENERS.test(prev);
      data = data.slice(0, offset - 1) + (open ? "“" : "”") + data.slice(offset);
      replaced = true;
    } else if (ch === "'") {
      const open = !prev || /[\s([{“]/.test(prev);
      data = data.slice(0, offset - 1) + (open ? "‘" : "’") + data.slice(offset);
      replaced = true;
    } else if (ch === "-" && data[offset - 2] === "-") {
      data = data.slice(0, offset - 2) + "—" + data.slice(offset);
      offset -= 1;
      replaced = true;
    } else if (ch === "." && data.slice(offset - 3, offset) === "...") {
      data = data.slice(0, offset - 3) + "…" + data.slice(offset);
      offset -= 2;
      replaced = true;
    }
    if (!replaced) return;
    node.data = data;
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  charBefore(node) {
    const walker = document.createTreeWalker(this.text, NodeFilter.SHOW_TEXT);
    let prev = null;
    while (walker.nextNode()) {
      if (walker.currentNode === node) break;
      prev = walker.currentNode;
    }
    return prev ? prev.data[prev.data.length - 1] : "";
  }

  normalize() {
    const bad = this.text.querySelector(":not(i):not(u):not(em)");
    if (!bad) {
      if (!this.text.textContent.trim() && this.text.childNodes.length) this.text.replaceChildren();
      return;
    }
    const sel = this.selection();
    const caret = this.offset(sel);
    this.text.innerHTML = htmlFromRuns(runsFromNode(this.text));
    if (caret != null) this.setOffset(caret);
  }

  offset(sel) {
    if (!sel?.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!this.text.contains(range.endContainer)) return null;
    const pre = range.cloneRange();
    pre.selectNodeContents(this.text);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
  }

  setOffset(offset) {
    const walker = document.createTreeWalker(this.text, NodeFilter.SHOW_TEXT);
    let left = offset;
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (left <= n.data.length) {
        const range = document.createRange();
        range.setStart(n, left);
        range.collapse(true);
        const sel = this.selection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      left -= n.data.length;
    }
  }

  commit() {
    this.desk.caption = this.plain();
    this.desk.refreshQuotes();
    this.desk.layout();
    this.place();
    this.desk.changed();
  }

  plain() {
    return this.text.textContent.replace(/\s+/g, " ");
  }

  html() {
    return htmlFromRuns(runsFromNode(this.text));
  }

  runs() {
    return trimRuns(runsFromNode(this.text));
  }

  set(html, text) {
    if (html) this.text.innerHTML = htmlFromRuns(runsFromHtml(html));
    else this.text.textContent = smartQuotes(text || "");
    if (!this.text.textContent.trim()) this.text.replaceChildren();
  }

  destroy() {
    document.removeEventListener("selectionchange", this.onSelection);
  }
}
