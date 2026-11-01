import { Desk } from "./ui/desk.js";

const LISTS = new Set(["tools"]);
const FLAGS = ["cast", "shapes", "text", "bubbles", "trace", "caption", "signature", "shortcuts", "quotes", "contain"];

function readOptions(el) {
  const o = {};
  const board = el.getAttribute("board");
  if (board) {
    const [w, h] = board.split(/[x×, ]+/).map(Number);
    if (w && h) o.board = { w, h };
  }
  for (const name of ["theme", "paper", "desk", "placeholder", "storage-key", "caption-font", "inset", "frame"]) {
    const v = el.getAttribute(name);
    if (v == null) continue;
    const key = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[key] = key === "inset" ? Number(v) : v;
  }
  for (const name of LISTS) {
    const v = el.getAttribute(name);
    if (v) o[name] = v.split(/[\s,]+/).filter(Boolean);
  }
  for (const flag of FLAGS) {
    const v = el.getAttribute(flag);
    if (v != null) o[flag] = v !== "false";
  }
  return o;
}

export function defineInkling(tag = "inkling-desk") {
  if (customElements.get(tag)) return customElements.get(tag);
  class InklingDesk extends HTMLElement {
    connectedCallback() {
      if (this.desk) return;
      if (!this.style.display) this.style.display = "block";
      this.desk = new Desk(this, { ...readOptions(this), ...(this.options || {}) });
    }
    disconnectedCallback() {
      this.desk?.destroy();
      this.desk = null;
    }
    toSvg(...a) {
      return this.desk.toSvg(...a);
    }
    toPng(...a) {
      return this.desk.toPng(...a);
    }
    download(...a) {
      return this.desk.download(...a);
    }
    undo() {
      this.desk.undo();
    }
    redo() {
      this.desk.redo();
    }
    clear() {
      this.desk.clear();
    }
    getDrawing() {
      return this.desk.getDrawing();
    }
    setDrawing(doc) {
      this.desk.setDrawing(doc);
    }
  }
  customElements.define(tag, InklingDesk);
  return InklingDesk;
}
