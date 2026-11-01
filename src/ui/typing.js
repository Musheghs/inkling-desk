import { LEADING } from "../core/type.js";
import { animate, EASE, h } from "./dom.js";

export class TypeEditor {
  constructor(desk) {
    this.desk = desk;
    this.session = null;
  }

  get open() {
    return !!this.session;
  }

  start({ mode, item, font, color, text = "", maxWidth = null, anchor, placeholder, onInput, onDone }) {
    this.finish();
    const inline = mode !== "path";
    const field = inline
      ? h("div", {
          class: "type-editor",
          contenteditable: "true",
          role: "textbox",
          "aria-label": placeholder,
          "aria-multiline": "true",
          spellcheck: "true",
          "data-placeholder": placeholder,
        })
      : h("input", { class: "type-field", type: "text", value: text, placeholder, "aria-label": placeholder, autocomplete: "off", spellcheck: "true" });
    if (inline) field.textContent = text;
    const session = { mode, item, font, color, maxWidth, anchor, field, onInput, onDone, inline };
    this.session = session;
    field.addEventListener("input", () => {
      if (inline && !field.textContent && field.childNodes.length) field.replaceChildren();
      session.onInput?.(this.value());
      this.place();
    });
    field.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        this.finish();
      }
    });
    if (inline) {
      field.addEventListener("paste", (e) => {
        const plain = e.clipboardData?.getData("text/plain");
        if (plain == null) return;
        e.preventDefault();
        document.execCommand("insertText", false, plain);
      });
    }
    field.addEventListener("blur", () => setTimeout(() => this.session === session && this.desk.shadow.activeElement !== field && this.finish(), 0));
    this.desk.root.append(field);
    this.place();
    animate(field, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: EASE });
    field.focus();
    if (inline) {
      const range = document.createRange();
      range.selectNodeContents(field);
      range.collapse(false);
      const sel = this.desk.shadow.getSelection?.() || window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else field.select();
  }

  value() {
    const s = this.session;
    if (!s) return "";
    return s.inline ? s.field.innerText.replace(/ /g, " ").replace(/\n$/, "") : s.field.value;
  }

  place() {
    const s = this.session;
    if (!s) return;
    const d = this.desk;
    const panel = d.panel.getBoundingClientRect();
    const host = d.root.getBoundingClientRect();
    const k = (panel.width / d.board.w) * (s.anchor.s ?? 1);
    const x = panel.left - host.left + (s.anchor.x / d.board.w) * panel.width;
    const y = panel.top - host.top + (s.anchor.y / d.board.h) * panel.height;
    const f = s.field;
    if (s.inline) {
      Object.assign(f.style, {
        left: `${x}px`,
        top: `${y}px`,
        fontFamily: s.font.family,
        fontSize: `${s.font.size * k}px`,
        fontStyle: s.font.style,
        fontWeight: String(s.font.weight),
        lineHeight: String(LEADING),
        textTransform: s.font.upper ? "uppercase" : "none",
        color: s.color,
        caretColor: s.color,
        maxWidth: s.maxWidth ? `${s.maxWidth * k}px` : "none",
      });
    } else {
      f.style.left = `${Math.min(host.width - 140, Math.max(140, x))}px`;
      f.style.top = `${Math.min(host.height - 52, y + 18)}px`;
    }
  }

  finish() {
    const s = this.session;
    if (!s) return;
    const text = this.value().replace(/\s+$/, "");
    this.session = null;
    s.field.remove();
    s.onDone?.(text);
  }
}
