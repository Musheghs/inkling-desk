import { brushShape, BRUSHES } from "../core/brushes.js";
import { sameColour } from "../core/colour.js";
import { BUBBLES } from "../core/bubbles.js";
import { FIGURE_STYLES, FIGURES, figureOf, figureStrokes, isOpenFigure } from "../core/figures.js";
import { mergeShapes, shapePath } from "../core/geometry.js";
import { hatchLines } from "../core/hatch.js";
import { ANGLES, centerline, INKS, PAINTS, PENS, penShape, TONES } from "../core/pens.js";
import { noise } from "../core/random.js";
import { bubbleArt, el, typeNode } from "../core/scene.js";
import { PASSES, STEADY_LEVELS, Steady } from "../core/steady.js";
import { INKED, INSERTS, LIBRARY_TABS, TEXT_MODES, toolMeta } from "../core/tools.js";
import { fontFor, TYPEFACES } from "../core/type.js";
import { ART } from "./art.js";
import { animate, dip, EASE, EASE_IN, EASE_IN_OUT, EASE_OUT, h, morph, popIn, reducedMotion, segmented, spring, SPRING } from "./dom.js";
import { icon } from "./icons.js";
import { Phone } from "./phone.js";

const ANGLE_ICONS = {
  right: `<svg class="icon" data-icon="hatch-right" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><path data-n="0" pathLength="1" d="M3 11 11 3M6 14 14 6M9.5 15.5 15.5 9.5M2.5 7.5 7.5 2.5" stroke="currentColor" stroke-width="1.69" stroke-linecap="round"/></svg>`,
  left: `<svg class="icon" data-icon="hatch-left" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><path data-n="0" pathLength="1" d="M7 3l8 8M4 6l8 8M2.5 9.5l6 6M10.5 2.5l5 5" stroke="currentColor" stroke-width="1.69" stroke-linecap="round"/></svg>`,
  cross: `<svg class="icon" data-icon="hatch-cross" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><path data-n="0" pathLength="1" d="M3 11 11 3M7 15 15 7M7 3l8 8M3 7l8 8" stroke="currentColor" stroke-width="1.69" stroke-linecap="round"/></svg>`,
};

const FILL_ICONS = {
  none: `<svg class="icon" data-icon="fill-none" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><circle data-n="0" pathLength="1" cx="9" cy="9" r="6.25" fill="none" stroke="currentColor" stroke-width="1.69"/><path data-n="1" pathLength="1" d="M4.6 13.4 13.4 4.6" stroke="currentColor" stroke-width="1.69" stroke-linecap="round"/></svg>`,
  wash: `<svg class="icon" data-icon="fill-wash" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><circle data-n="0" pathLength="1" cx="9" cy="9" r="6.25" fill="var(--fill-wash-color, currentColor)" fill-opacity=".38" stroke="currentColor" stroke-width="1.69"/></svg>`,
  solid: `<svg class="icon" data-icon="fill-solid" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><circle data-n="0" pathLength="1" cx="9" cy="9" r="6.25" fill="currentColor" stroke="currentColor" stroke-width="1.69"/></svg>`,
};

const FRAMES = [
  { id: "wash", label: "Wash" },
  { id: "line", label: "Line" },
  { id: "none", label: "None" },
];

const SAMPLE_SIZE = { nib: 3.4, fineliner: 2.4, brush: 6.5, pencil: 2.4 };
const STEADY_NOTES = ["Every wobble stays", "Smooths small shakes", "Glides on a string"];

const W = 132;
const H = 28;

function shakyLine() {
  const n = noise(31);
  const pts = [];
  for (let i = 0; i <= 150; i++) {
    const x = 8 + (i / 150) * (W - 16);
    const y = H / 2 + Math.sin(i / 21) * 5.5 + n(i / 2.2) * 2.6 + n(i / 0.9 + 9) * 1.2;
    pts.push({ x, y, p: 0.55 + 0.35 * Math.sin(i / 40) });
  }
  return pts;
}

function sample(attrs = {}) {
  return el("svg", { class: "sample", viewBox: `0 0 ${W} ${H}`, width: W, height: H, "aria-hidden": "true", ...attrs });
}

function steadySample(tool, level, brush) {
  const svg = sample();
  const raw = shakyLine();
  const steady = new Steady(level, 1);
  const pts = [];
  for (const p of raw) {
    const s = steady.push(p);
    if (s) pts.push(s);
  }
  pts.push(...steady.finish(raw[raw.length - 1]));
  const shape =
    tool === "brush"
      ? brushShape(brush, pts, SAMPLE_SIZE.brush, { passes: PASSES[level], seed: 5 })
      : penShape(tool, pts, SAMPLE_SIZE[tool] || 3, { passes: PASSES[level] });
  el("path", { d: shapePath(shape), fill: tool === "pencil" ? "#6aa6e0" : "currentColor" }, svg);
  return svg;
}

function brushSample(id) {
  const svg = sample();
  const pts = [];
  for (let i = 0; i <= 60; i++) pts.push({ x: 12 + (i / 60) * (W - 24), y: H / 2 + Math.sin(i / 9.5) * 4.5, p: 0.6 + 0.3 * Math.sin(i / 19) });
  const brush = BRUSHES.find((b) => b.id === id);
  el("path", { d: shapePath(brushShape(id, pts, brush.scatter ? 9 : 8, { passes: 1, seed: 11 })), fill: "currentColor" }, svg);
  return svg;
}

function hatchSample(tone, angle) {
  const svg = sample();
  const pts = [];
  for (let i = 0; i <= 40; i++) pts.push({ x: 18 + (i / 40) * (W - 36), y: H / 2, p: 0.8 });
  const line = centerline(pts, 22, 1);
  const angles = ANGLES.find((a) => a.id === angle).angles;
  const strokes = hatchLines(line, 11, { spacing: tone.hatch * 0.62, angles, seed: 7 });
  for (const s of strokes) el("path", { d: shapePath(penShape("fineliner", s, 1.1, { passes: 0 })), fill: "currentColor" }, svg);
  return svg;
}

function figureSample(style, figure, opts = {}) {
  const svg = sample();
  const open = figure === "line" || figure === "arrow";
  const square = !open && !["rect", "ellipse", "cloud"].includes(figure);
  const frame = open ? { a: { x: 34, y: 22 }, b: { x: 98, y: 6 } } : square ? { x: 54, y: 3, w: 24, h: 22 } : { x: 46, y: 4, w: 40, h: 20 };
  const strokes = figureStrokes(figure, frame, { style, seed: 9, size: 1.6, sides: 6, points: 5, ...opts });
  el("path", { d: shapePath(mergeShapes(strokes.map((s) => penShape("nib", s, 1.7, { passes: 0 })))), fill: "currentColor" }, svg);
  return svg;
}

function faceSample(face, families) {
  const svg = sample();
  typeNode({ font: fontFor(face, 17, families), lines: [{ text: "Hello there", x: W / 2, y: H / 2 + 6 }] }, "currentColor", svg);
  return svg;
}

function bubbleSample(style, families) {
  const svg = sample();
  const art = bubbleArt({ x: 58, y: 13, text: "", style, size: 6.4, tail: { x: 92, y: 27 }, seed: 4, weight: 1.3 }, families);
  el("path", { d: art.fill, fill: "var(--bg-paper)", "fill-opacity": "0" }, svg);
  el("path", { d: art.ink, fill: "currentColor" }, svg);
  return svg;
}

const TIP = spring({ stiffness: 520, damping: 40 });

function fill(chip, colour, spread) {
  const before = chip.style.getPropertyValue("--swatch-color");
  chip.querySelector(".chip-paint")?.remove();
  if (!spread || !before || before === colour || reducedMotion()) return chip.style.setProperty("--swatch-color", colour);
  const paint = h("span", { class: "chip-paint", style: { background: colour } });
  chip.append(paint);
  const anim = paint.animate([{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)" }], {
    duration: 420,
    easing: EASE_OUT,
    fill: "forwards",
  });
  anim.onfinish = () => {
    chip.style.setProperty("--swatch-color", colour);
    paint.remove();
  };
}

export class Dock {
  constructor(desk) {
    this.desk = desk;
    this.prefix = desk.prefix;
    this.tip = h("div", { class: "tip", role: "tooltip" });
    this.buildBar();
    this.props = h("div", { class: "props", role: "toolbar", "aria-label": "Tool settings", "data-empty": "" });
    this.phone = new Phone(this);
    this.el = h("div", { class: "dock" }, this.props, this.bar, this.phone.el);
    this.buildCorners();
    this.disc = h("button", {
      type: "button",
      class: "disc",
      hidden: true,
      "data-still": "",
      "aria-label": "Show the tools",
      "data-tip": "Show the tools",
      "data-key": "⌘\\",
      onclick: () => desk.setChrome(true),
    });
    this.bindTips();
  }

  get o() {
    return this.desk.options;
  }

  button(name, label, key, onclick, extra = {}) {
    return h("button", {
      type: "button",
      class: "icon-button",
      "aria-label": label,
      "data-tip": label,
      "data-key": key || null,
      html: icon(name),
      onclick,
      ...extra,
    });
  }

  buildBar() {
    const d = this.desk;
    const keys = this.o.shortcuts;
    this.handButton = this.button("mouse-pointer-2", "Move", keys ? "V" : "", () => d.setTool("hand"), {
      class: "icon-button icon-button-lg",
      "aria-pressed": "false",
    });
    this.tray = h("div", { class: "tray", role: "radiogroup", "aria-label": "Pens" });
    this.toolButtons = {};
    for (const id of this.o.tools) {
      const pen = PENS[id];
      const b = h("button", {
        type: "button",
        class: "tool",
        role: "radio",
        "aria-checked": "false",
        "aria-label": pen.label,
        "data-tip": pen.label,
        "data-key": keys ? pen.key.toUpperCase() : null,
        html: ART[id](`${this.prefix}${id}`),
        onclick: () => d.setTool(id),
      });
      this.toolButtons[id] = b;
      this.tray.append(b);
    }
    this.tray.addEventListener("keydown", (e) => {
      const ids = this.o.tools;
      const i = ids.indexOf(d.state.tool);
      let next = -1;
      if (e.key === "ArrowRight") next = (i + 1) % ids.length;
      if (e.key === "ArrowLeft") next = (i - 1 + ids.length) % ids.length;
      if (next < 0) return;
      e.preventDefault();
      d.setTool(ids[next]);
      this.toolButtons[ids[next]].focus();
    });

    const lg = { class: "icon-button icon-button-lg", "aria-pressed": "false" };
    const more = (label, fn) =>
      h("button", {
        type: "button",
        class: "split-more",
        "aria-label": label,
        "data-tip": label,
        "aria-haspopup": "menu",
        "aria-expanded": "false",
        html: icon("chevron-up"),
        onclick: (e) => fn(e.currentTarget),
      });
    const inserts = [];
    this.insertButtons = {};
    if (this.o.shapes) {
      const f = figureOf(d.state.figure);
      this.shapeButton = this.button(f.icon, f.label, keys ? this.figureKey(f) : "", () => d.setTool("shape"), lg);
      this.insertButtons.shape = this.shapeButton;
      inserts.push(
        h(
          "div",
          { class: "split" },
          this.shapeButton,
          more("Shapes", (b) => this.toggleShapes(b)),
        ),
      );
    }
    if (this.o.text) {
      this.textButton = this.button("type", "Text", keys ? "T" : "", () => d.setTool("text"), lg);
      this.insertButtons.text = this.textButton;
      inserts.push(
        h(
          "div",
          { class: "split" },
          this.textButton,
          more("Text options", (b) => this.toggleText(b)),
        ),
      );
    }
    if (this.o.bubbles) {
      this.bubbleButton = this.button("message-circle", "Speech bubble", keys ? "C" : "", () => d.setTool("bubble"), lg);
      this.insertButtons.bubble = this.bubbleButton;
      inserts.push(this.bubbleButton);
    }

    this.libraryButtons = {};
    const library = [];
    if (this.o.cast) {
      this.castMark = h("span", { class: "cast-mark", "aria-hidden": "true" });
      const group = h("div", { class: "cast-group" }, this.castMark);
      for (const tab of LIBRARY_TABS) {
        const b = this.button(tab.icon, tab.label, "", () => d.library.toggle(tab.id), lg);
        this.libraryButtons[tab.id] = b;
        group.append(b);
      }
      library.push(group);
    }
    const divider = () => h("span", { class: "divider", "aria-hidden": "true" });
    this.hideButton = this.button("chevron-down", "Hide the tools", "⌘\\", () => d.setChrome(false), { class: "icon-button icon-button-lg" });
    this.rulerButton = h("button", {
      type: "button",
      class: "tool",
      "aria-pressed": "false",
      "aria-label": "Ruler",
      "data-tip": "Ruler",
      html: ART.ruler(),
      onclick: () => d.toggleRuler(),
    });
    this.bar = h(
      "div",
      { class: "bar", role: "toolbar", "aria-label": "Tools" },
      this.handButton,
      divider(),
      this.tray,
      h("div", { class: "tray" }, this.rulerButton),
      inserts.length ? divider() : null,
      ...inserts,
      library.length ? divider() : null,
      ...library,
      divider(),
      this.hideButton,
    );
    this.refreshTint();
  }

  figureKey(f) {
    if (!f.key) return "";
    return f.shift ? `⇧${f.key.toUpperCase()}` : f.key.toUpperCase();
  }

  buildCorners() {
    const d = this.desk;
    const below = { "data-tip-below": "" };
    this.undoButton = this.button("undo-2", "Undo", "⌘Z", () => d.undo(), below);
    this.redoButton = this.button("redo-2", "Redo", "⇧⌘Z", () => d.redo(), below);
    this.clearButton = this.button("trash-2", "Start over", "", () => d.clear(), below);
    this.historyDivider = h("span", { class: "divider", "aria-hidden": "true" });
    this.historyBar = h(
      "div",
      { class: "top-bar history-bar", role: "toolbar", "aria-label": "History" },
      this.undoButton,
      this.redoButton,
      this.historyDivider,
      this.clearButton,
    );
    this.saveButton = this.button("arrow-down-to-line", "Save as PNG", "", () => d.download(), below);
    this.moreButton = this.button("ellipsis", "More", "", () => this.toggleMenu(), { ...below, "aria-haspopup": "menu", "aria-expanded": "false" });
    this.actionsBar = h("div", { class: "top-bar actions-bar", role: "toolbar", "aria-label": "File" }, this.saveButton, this.moreButton);
  }

  refreshTool() {
    const d = this.desk;
    const tool = d.state.tool;
    const hand = tool === "hand";
    this.handButton.setAttribute("aria-pressed", String(hand));
    for (const [id, b] of Object.entries(this.toolButtons)) {
      const on = id === tool;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on || (!this.toolButtons[tool] && id === this.o.tools[0]) ? 0 : -1;
    }
    for (const [id, b] of Object.entries(this.insertButtons)) b.setAttribute("aria-pressed", String(id === tool));
    if (this.shapeButton) {
      const f = figureOf(d.state.figure);
      this.shapeButton.innerHTML = icon(f.icon);
      this.shapeButton.setAttribute("aria-label", f.label);
      this.shapeButton.dataset.tip = f.label;
      this.shapeButton.dataset.key = this.o.shortcuts ? this.figureKey(f) : "";
    }
    if (this.textButton) {
      const m = TEXT_MODES.find((x) => x.id === d.state.textMode) || TEXT_MODES[0];
      this.textButton.innerHTML = icon(m.icon);
      this.textButton.setAttribute("aria-label", m.label);
      this.textButton.dataset.tip = m.label;
      this.textButton.dataset.key = this.o.shortcuts ? "T" : "";
    }
    this.refreshWashTip();
    this.refreshTint();
    this.renderProps();
    this.disc.replaceChildren(...this.discArt());
  }

  reveal() {
    const pens = [...Object.values(this.toolButtons), this.rulerButton].map((b) => b.querySelector(".tool-art"));
    pens.forEach((art, i) =>
      animate(
        art,
        [
          { transform: "translateY(72px)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration: SPRING.duration, delay: 80 + i * 34, easing: SPRING.easing, fill: "backwards" },
      ),
    );
    const rest = [...this.bar.querySelectorAll(".icon-button, .split-more")].filter((n) => !n.closest(".tray"));
    rest.forEach((n, i) =>
      animate(
        n,
        [
          { transform: "scale(0.5)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration: SPRING.duration * 0.8, delay: 160 + i * 22, easing: SPRING.easing, fill: "backwards" },
      ),
    );
    popIn(this.phone.rail, 120);
  }

  turn(button, angle) {
    if (reducedMotion()) return;
    button.querySelector(".icon")?.animate([{ rotate: "0deg" }, { rotate: angle, offset: 0.45 }, { rotate: "0deg" }], { duration: 420, easing: EASE });
  }

  refreshTint() {
    for (const [id, b] of Object.entries(this.toolButtons)) {
      const c = this.desk.colourFor(id);
      if (c && b.style.getPropertyValue("--tool-color") && b.style.getPropertyValue("--tool-color") !== c) dip(b);
      if (c) b.style.setProperty("--tool-color", c);
    }
    this.phone?.refresh();
  }

  refreshWashTip() {
    const d = this.desk;
    this.bar.style.setProperty("--wash-tip", d.state.washColor);
  }

  refreshLibrary(tab) {
    for (const [id, b] of Object.entries(this.libraryButtons)) b.setAttribute("aria-pressed", String(id === tab));
    const b = this.libraryButtons[tab];
    if (!this.castMark) return;
    this.castMark.toggleAttribute("data-on", !!b);
    if (!b) return;
    const jump = !this.castMark.style.width;
    if (jump) this.castMark.style.transition = "none";
    this.castMark.style.width = `${b.offsetWidth}px`;
    this.castMark.style.translate = `${b.offsetLeft}px 0`;
    if (jump) {
      void this.castMark.offsetWidth;
      this.castMark.style.transition = "";
    }
  }

  refreshHistory(canUndo, canRedo, canClear) {
    this.undoButton.disabled = !canUndo;
    this.redoButton.disabled = !canRedo;
    const shown = !this.clearButton.hidden && !this.clearLeaving;
    if (shown === canClear) return;
    const bar = this.historyBar;
    const nodes = [this.historyDivider, this.clearButton];
    const resize = (from) => {
      const to = bar.offsetWidth;
      if (bar.isConnected && Math.abs(to - from) > 1)
        animate(bar, [{ width: `${from}px` }, { width: `${to}px` }], { duration: SPRING.duration * 0.8, easing: SPRING.easing });
    };
    this.clearLeaving?.anim.cancel();
    this.clearLeaving = null;
    if (canClear) {
      const from = bar.offsetWidth;
      for (const n of nodes) n.hidden = false;
      resize(from);
      if (bar.isConnected)
        animate(
          this.clearButton,
          [
            { opacity: 0, transform: "scale(0.6)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: SPRING.duration * 0.8, delay: 60, easing: SPRING.easing, fill: "backwards" },
        );
      return;
    }
    if (!bar.isConnected) {
      for (const n of nodes) n.hidden = true;
      return;
    }
    const out = animate(
      this.clearButton,
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "scale(0.6)" },
      ],
      { duration: 200, easing: EASE_IN, fill: "forwards" },
    );
    this.clearLeaving = out;
    out.done.then(() => {
      if (this.clearLeaving !== out) return;
      this.clearLeaving = null;
      const from = bar.offsetWidth;
      for (const n of nodes) n.hidden = true;
      out.anim.cancel();
      resize(from);
    });
  }

  fullHistoryWidth() {
    const nodes = [this.historyDivider, this.clearButton];
    const was = nodes.map((n) => n.hidden);
    for (const n of nodes) n.hidden = false;
    const w = this.historyBar.offsetWidth;
    nodes.forEach((n, i) => (n.hidden = was[i]));
    return w;
  }

  renderProps() {
    this.phone.refresh();
    const d = this.desk;
    const tool = d.state.tool;
    const sel = tool === "hand" ? d.editableSelection() : null;
    d.propsKey = sel ? `${sel.kind}:${d.selection.join()}` : "";
    const meta = sel ? { size: [1, 1] } : toolMeta(tool);
    const had = !this.props.hasAttribute("data-empty");
    if (this.desk.popovers?.current?.el.dataset.owner === "props") this.desk.popovers.close(true);
    this.propsMotion?.anim.cancel();
    if (!meta) {
      if (!had) return;
      const leaving = animate(
        this.props,
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(70%) scale(0.92)" },
        ],
        { duration: 300, easing: EASE_IN_OUT, fill: "forwards" },
      );
      this.propsMotion = leaving;
      leaving.done.then(() => {
        if (this.propsMotion !== leaving) return;
        leaving.anim.cancel();
        this.props.toggleAttribute("data-empty", true);
        this.desk.placeToast();
      });
      return;
    }
    const from = had ? this.props.offsetWidth : 0;
    const parts = d.compact ? this.phone.strip(tool, sel, meta) : this.controls(tool, sel, meta);
    this.props.replaceChildren(...parts);
    this.props.toggleAttribute("data-empty", false);
    this.desk.placeToast();
    const enter = (delay) =>
      parts.forEach((part, i) =>
        animate(
          part,
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: SPRING.duration * 0.8, delay: delay + i * 26, easing: SPRING.easing, fill: "backwards" },
        ),
      );
    if (!had || !this.desk.chrome) {
      this.propsMotion = animate(
        this.props,
        [
          { opacity: 0, transform: "translateY(70%) scale(0.92)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: SPRING.duration, easing: SPRING.easing },
      );
      enter(70);
      return;
    }
    const to = this.props.offsetWidth;
    if (Math.abs(to - from) > 1) animate(this.props, [{ width: `${from}px` }, { width: `${to}px` }], { duration: SPRING.duration, easing: SPRING.easing });
    enter(20);
  }

  controls(tool, sel, meta, { inline = false, stacked = false } = {}) {
    const d = this.desk;
    const parts = [];
    this.inline = inline;
    this.stacked = stacked;
    if (sel) parts.push(...this.selectionProps(sel));
    else {
      if (INKED.has(tool) || tool === "wash") parts.push(this.colourControl(tool));
      if (parts.length) parts.push(this.divider());
      parts.push(this.sizeControl(tool, meta));
      if (tool === "pencil")
        parts.push(
          this.divider(),
          h(
            "span",
            { class: "props-note" },
            h("span", { class: "props-note-icon", html: icon("eye-off") }),
            h("span", { text: "Guide only, won't print or save" }),
          ),
        );
      if (tool === "brush")
        parts.push(
          this.divider(),
          this.select(
            "Brush",
            BRUSHES.map((b) => ({ id: b.id, label: b.label, art: () => brushSample(b.id) })),
            d.state.brush,
            (id) => d.setBrush(id),
          ),
        );
      if (PENS[tool]?.steady && !PENS[tool].tones)
        parts.push(
          this.divider(),
          this.select(
            "Steady hand",
            STEADY_LEVELS.map((s, i) => ({ id: s.id, label: s.label, note: STEADY_NOTES[i], art: () => steadySample(tool, s.id, d.state.brush) })),
            d.state.steady,
            (id) => d.setSteady(id),
            { narrow: tool === "brush" },
          ),
        );
      if (tool === "hatch") {
        parts.push(
          this.divider(),
          this.select(
            "Density",
            TONES.map((t) => ({ id: t.id, label: t.label, art: () => hatchSample(t, d.state.angle) })),
            d.state.tones.hatch,
            (id) => d.setTone(id),
            { narrow: true },
          ),
        );
        parts.push(
          segmented(
            ANGLES.map((a) => ({ id: a.id, label: a.label, icon: ANGLE_ICONS[a.id] })),
            d.state.angle,
            (id) => d.setAngle(id),
            { label: "Direction", icons: true },
          ),
        );
      }
      if (tool === "shape") parts.push(...this.shapeProps());
      if (tool === "text")
        parts.push(
          this.divider(),
          this.select(
            "Font",
            TYPEFACES.map((f) => ({ id: f.id, label: f.label, art: () => faceSample(f.id, d.families) })),
            d.state.face,
            (id) => d.setFace(id),
          ),
        );
      if (tool === "bubble") {
        parts.push(
          this.divider(),
          this.select(
            "Bubble",
            BUBBLES.map((b) => ({ id: b.id, label: b.label, art: () => bubbleSample(b.id, d.families) })),
            d.state.bubble,
            (id) => d.setBubbleStyle(id),
          ),
        );
        parts.push(
          this.select(
            "Font",
            TYPEFACES.map((f) => ({ id: f.id, label: f.label, art: () => faceSample(f.id, d.families) })),
            d.state.bubbleFace,
            (id) => d.setFace(id),
            { narrow: true },
          ),
        );
      }
    }
    this.inline = false;
    this.stacked = false;
    return parts;
  }

  fillControl(value, onPick, wash) {
    const options = [
      { id: "none", label: this.inline ? "None" : "No fill", icon: FILL_ICONS.none },
      { id: "wash", label: this.inline ? "Wash" : "Wash fill", icon: FILL_ICONS.wash },
      { id: "solid", label: this.inline ? "Solid" : "Solid fill", icon: FILL_ICONS.solid },
    ];
    const fill = segmented(options, value, onPick, { label: "Fill", icons: !this.inline });
    fill.style.setProperty("--fill-wash-color", wash);
    return fill;
  }

  count(label, value, min, max, onChange) {
    if (!this.inline) return this.stepper(label, value, min, max, onChange);
    return this.numberControl({ label, min, max, value, integer: true, kind: "count", onInput: onChange, onCommit: onChange });
  }

  figureChoice(value, onPick, style) {
    const d = this.desk;
    if (!this.inline)
      return this.select(
        "Shape",
        FIGURES.map((x) => ({ id: x.id, label: x.label, art: () => figureSample(style, x.id) })),
        value,
        onPick,
      );
    const cells = FIGURES.map((f) => {
      const b = h("button", {
        type: "button",
        class: "icon-button",
        role: "radio",
        "aria-label": f.label,
        "data-tip": f.label,
        "aria-checked": String(f.id === value),
        html: icon(f.icon),
        onclick: () => {
          for (const c of cells) c.setAttribute("aria-checked", String(c === b));
          onPick(f.id);
        },
      });
      return b;
    });
    return h("div", { class: "figure-grid", role: "radiogroup", "aria-label": "Shape", "data-label": "Shape" }, ...cells);
  }

  shapeProps() {
    const d = this.desk;
    const s = d.state;
    const parts = [this.divider()];
    if (s.figure !== "line" && s.figure !== "arrow") parts.push(this.fillControl(s.fill, (id) => d.setShapeOption("fill", id), s.washColor));
    parts.push(
      this.select(
        "Style",
        FIGURE_STYLES.map((st) => ({ id: st.id, label: st.label, art: () => figureSample(st.id, s.figure) })),
        s.figureStyle,
        (id) => d.setShapeOption("figureStyle", id),
      ),
    );
    if (s.figure === "star")
      parts.push(
        this.divider(),
        this.count("Points", s.points, 3, 16, (v) => d.setShapeOption("points", v)),
      );
    if (s.figure === "polygon")
      parts.push(
        this.divider(),
        this.count("Sides", s.sides, 3, 12, (v) => d.setShapeOption("sides", v)),
      );
    if (s.figure === "rect")
      parts.push(
        this.divider(),
        this.cornersControl(s.corners, (id) => d.setShapeOption("corners", id)),
      );
    if (s.figure === "arrow")
      parts.push(
        this.divider(),
        this.endsControl(s.ends, (id) => d.setShapeOption("ends", id)),
      );
    return parts;
  }

  stepper(label, value, min, max, onChange) {
    const out = h("output", { class: "stepper-value", text: String(value) });
    let v = value;
    const set = (next) => {
      v = Math.max(min, Math.min(max, next));
      out.textContent = String(v);
      minus.disabled = v <= min;
      plus.disabled = v >= max;
      onChange(v);
    };
    const minus = h("button", {
      type: "button",
      class: "icon-button icon-button-sm",
      "aria-label": `Fewer ${label.toLowerCase()}`,
      html: icon("minus"),
      onclick: () => set(v - 1),
    });
    const plus = h("button", {
      type: "button",
      class: "icon-button icon-button-sm",
      "aria-label": `More ${label.toLowerCase()}`,
      html: icon("plus"),
      onclick: () => set(v + 1),
    });
    minus.disabled = v <= min;
    plus.disabled = v >= max;
    return h("div", { class: "stepper", role: "group", "aria-label": label, "data-tip": label }, minus, out, plus);
  }

  divider() {
    return h("span", { class: "divider", "aria-hidden": "true" });
  }

  selectionProps(sel) {
    const d = this.desk;
    const f = sel.first;
    const edit = (fn) => d.editSelection(fn);
    const parts = [];
    const label = sel.kind === "shape" ? "Line colour" : "Text colour";
    parts.push(
      this.swatchButton({ label, colour: f.color || INKS[0].color, list: INKS, onPick: (c, live) => d.recolourSelected("ink", c, { live }) }),
      this.divider(),
    );
    const range = sel.kind === "shape" ? INSERTS.shape.size : INSERTS[sel.kind].size;
    parts.push(
      this.numberControl({
        label: sel.kind === "shape" ? "Line weight" : "Size",
        min: range[0],
        max: range[1],
        value: f.size || range[2],
        onInput: (v) => d.editSelection((i) => ({ ...i, size: v }), { live: true }),
        onCommit: (v) => edit((i) => ({ ...i, size: v })),
      }),
    );
    if (sel.kind === "shape") {
      const all = sel.items;
      const open = all.every((i) => isOpenFigure(i.figure));
      const same = all.every((i) => i.figure === f.figure);
      parts.push(
        this.divider(),
        this.figureChoice(
          f.figure,
          (id) => {
            edit((i) => d.reframe(i, id));
            this.renderProps();
          },
          f.style,
        ),
      );
      if (!open) {
        parts.push(
          this.fillControl(
            f.fill || "none",
            (id) => {
              edit((i) =>
                isOpenFigure(i.figure)
                  ? i
                  : { ...i, fill: id, fillColor: id === i.fill ? i.fillColor : id === "wash" ? d.state.washColor : undefined, tone: undefined },
              );
              this.renderProps();
            },
            f.fillColor || PAINTS[0].color,
          ),
        );
        if (f.fill && f.fill !== "none") {
          const wash = f.fill === "wash";
          const list = wash ? PAINTS : INKS;
          const colour = f.fillColor || (wash ? PAINTS[0].color : f.color || INKS[0].color);
          const recolour = (c, live) => d.recolourSelected("fill", c, { live });
          if (this.inline) {
            const [, grid] = this.swatches({ title: "Fill colour", list, wash, current: colour, onPick: recolour, keep: true });
            grid.dataset.label = "Fill colour";
            parts.push(grid);
          } else parts.push(this.swatchButton({ label: "Fill colour", title: "Fill", wash, colour, list, onPick: recolour }));
        }
      }
      parts.push(
        this.divider(),
        this.select(
          "Style",
          FIGURE_STYLES.map((st) => ({ id: st.id, label: st.label, art: () => figureSample(st.id, f.figure) })),
          f.style || "hand",
          (id) => edit((i) => ({ ...i, style: id })),
          { narrow: true },
        ),
      );
      if (same && f.figure === "star")
        parts.push(
          this.divider(),
          this.count("Points", f.points || 5, 3, 16, (v) => edit((i) => ({ ...i, points: v }))),
        );
      if (same && f.figure === "polygon")
        parts.push(
          this.divider(),
          this.count("Sides", f.sides || 6, 3, 12, (v) => edit((i) => ({ ...i, sides: v }))),
        );
      if (same && f.figure === "rect")
        parts.push(
          this.divider(),
          this.cornersControl(f.corners || "square", (id) => edit((i) => ({ ...i, corners: id }))),
        );
      if (same && f.figure === "arrow")
        parts.push(
          this.divider(),
          this.endsControl(f.ends || "end", (id) => edit((i) => ({ ...i, ends: id }))),
        );
    }
    if (sel.kind === "bubble")
      parts.push(
        this.divider(),
        this.select(
          "Bubble",
          BUBBLES.map((b) => ({ id: b.id, label: b.label, art: () => bubbleSample(b.id, d.families) })),
          f.style || "speech",
          (id) => edit((i) => ({ ...i, style: id })),
        ),
      );
    if (sel.kind !== "shape")
      parts.push(
        sel.kind === "text" ? this.divider() : null,
        this.select(
          "Font",
          TYPEFACES.map((x) => ({ id: x.id, label: x.label, art: () => faceSample(x.id, d.families) })),
          f.face || "serif",
          (id) => edit((i) => ({ ...i, face: id })),
          { narrow: sel.kind === "bubble" },
        ),
      );
    return parts.filter(Boolean);
  }

  cornersControl(value, onPick) {
    return segmented(
      [
        { id: "square", label: "Square corners", icon: icon("square") },
        { id: "round", label: "Round corners", icon: icon("squircle") },
      ],
      value,
      onPick,
      { label: "Corners", icons: true },
    );
  }

  endsControl(value, onPick) {
    return segmented(
      [
        { id: "end", label: "One head", icon: icon("move-right") },
        { id: "both", label: "Both ends", icon: icon("move-horizontal") },
      ],
      value,
      onPick,
      { label: "Arrowheads", icons: true },
    );
  }

  colourControl(tool) {
    const d = this.desk;
    const wash = tool === "wash";
    const label = wash ? "Wash colour" : tool === "text" || tool === "bubble" ? "Text colour" : "Ink colour";
    const button = this.swatchButton({ label, wash, colour: d.colourFor(tool), list: wash ? PAINTS : INKS, onPick: (c) => d.setColour(c) });
    this.syncColour = () => button.sync(d.colourFor(tool));
    return button;
  }

  swatchButton({ label, colour, wash = false, list, onPick, title }) {
    const d = this.desk;
    const chip = h("span", { class: "colour-chip", style: { "--swatch-color": colour } });
    const b = h(
      "button",
      { type: "button", class: "colour-button", "aria-label": label, "data-tip": label, "aria-haspopup": "dialog", "aria-expanded": "false" },
      chip,
    );
    b.addEventListener("click", () =>
      d.popovers.toggle(
        b,
        (pop) => {
          pop.dataset.owner = "props";
          return this.swatches({
            title: title || (wash ? "Wash" : "Ink"),
            list,
            wash,
            current: colour,
            onPick: (c, live) => {
              colour = c;
              onPick(c, live);
              fill(chip, c, !live);
            },
          });
        },
        { label, className: "pop-palette" },
      ),
    );
    b.sync = (c) => {
      colour = c;
      fill(chip, c, false);
    };
    return b;
  }

  swatches({ title, list, wash, current, onPick, keep = false }) {
    const d = this.desk;
    let latest = current;
    const group = h("div", { class: "swatch-grid", role: "radiogroup", "aria-label": title });
    for (const c of list) {
      group.append(
        h(
          "button",
          {
            type: "button",
            class: "swatch",
            role: "radio",
            "data-kind": wash ? "wash" : "ink",
            "data-colour": c.color,
            "aria-checked": String(sameColour(current, c.color)),
            "aria-label": c.label,
            "data-tip": c.label,
            style: { "--swatch-color": c.color },
            onclick: (e) => {
              latest = c.color;
              onPick(c.color);
              if (!keep) return d.popovers.close();
              for (const b of group.querySelectorAll("[role=radio]")) b.setAttribute("aria-checked", String(b === e.currentTarget));
            },
          },
          h("span"),
        ),
      );
    }
    group.append(
      d.customSwatch({
        title,
        current: () => latest,
        onInput: (c) => onPick(c, true),
        onCommit: (c) => {
          latest = c;
          onPick(c);
          for (const b of group.querySelectorAll("[role=radio]")) b.setAttribute("aria-checked", String(sameColour(b.dataset.colour, c)));
        },
      }),
    );
    popIn(group);
    return [h("p", { class: "pop-title", text: title }), group];
  }

  numberControl({ label, name = label, min, max, value, onInput, onCommit, onNudge = null, key = null, kind = null, integer = false }) {
    const fine = !integer && max - min <= 40;
    const fmt = (v) => (fine ? (Math.round(v * 10) / 10).toString() : Math.round(v).toString());
    const pct = (v) => `${((v - min) / (max - min)) * 100}%`;
    const clampV = (v) => Math.min(max, Math.max(min, v));
    const field = h("input", {
      class: "size-field",
      type: "text",
      inputmode: fine ? "decimal" : "numeric",
      maxlength: String(Math.round(max)).length + (fine ? 2 : 0),
      value: fmt(value),
      "aria-label": label,
      "data-tip": label,
      "data-key": key,
    });
    field.addEventListener("input", () => {
      let text = field.value.replace(fine ? /[^0-9.]/g : /[^0-9]/g, "");
      const dot = text.indexOf(".");
      if (dot >= 0)
        text =
          text.slice(0, dot + 1) +
          text
            .slice(dot + 1)
            .replace(/\./g, "")
            .slice(0, 1);
      if (parseFloat(text) > max) text = fmt(max);
      if (text !== field.value) field.value = text;
    });
    const range = h("input", {
      type: "range",
      min: String(min),
      max: String(max),
      step: String(fine ? 0.1 : 1),
      value: String(value),
      "aria-label": label,
      tabindex: this.stacked ? "0" : "-1",
    });
    range.style.setProperty("--slider-progress", pct(value));
    const shown = this.stacked ? h("span", { class: "slider-value", text: fmt(value) }) : null;
    const sync = (v) => {
      field.value = fmt(v);
      range.value = String(v);
      range.style.setProperty("--slider-progress", pct(v));
      if (shown) shown.textContent = fmt(v);
    };
    range.addEventListener("input", () => {
      const v = clampV(+range.value);
      onInput(v);
      sync(v);
    });
    range.addEventListener("change", () => onCommit(clampV(+range.value)));
    const commit = () => {
      const v = parseFloat(field.value);
      if (Number.isFinite(v)) {
        onCommit(clampV(v));
        sync(clampV(v));
      } else sync(+range.value);
    };
    field.addEventListener("change", commit);
    field.addEventListener("focus", () => field.select());
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        commit();
        field.blur();
      } else if (e.key === "Escape") {
        sync(+range.value);
        field.blur();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? 1 : -1;
        if (onNudge) sync(onNudge(dir));
        else {
          const v = clampV(Math.round((+range.value + dir * Math.max((max - min) / 20, +range.value * 0.12)) * 10) / 10);
          onCommit(v);
          sync(v);
        }
      }
    });
    const el = this.stacked
      ? h(
          "div",
          { class: "slider-field", "data-kind": kind, "data-label": name },
          h("div", { class: "slider-head" }, h("span", { text: name }), shown),
          h("div", { class: "slider" }, range),
        )
      : h("div", { class: "size", "data-kind": kind, "data-label": name }, field, h("div", { class: "slider" }, range));
    el.sync = sync;
    return el;
  }

  sizeControl(tool, pen) {
    const d = this.desk;
    const [min, max] = pen.size;
    const control = this.numberControl({
      label: `${pen.label} size`,
      name: tool === "shape" ? "Line weight" : "Size",
      min,
      max,
      value: d.state.sizes[tool],
      key: "[ ]",
      onInput: (v) => d.setSize(v),
      onCommit: (v) => d.setSize(v),
      onNudge: (dir) => {
        d.nudgeSize(dir);
        return d.state.sizes[tool];
      },
    });
    this.syncSize = () => control.sync(d.state.sizes[tool]);
    return control;
  }

  select(title, options, value, onPick, { narrow = false } = {}) {
    if (this.inline) return this.choice(title, options, value, onPick);
    const d = this.desk;
    const current = () => options.find((o) => o.id === value) || options[0];
    const face = h("span", { class: "select-face" });
    const paint = () => face.replaceChildren(narrow ? h("span", { class: "select-label", text: current().label }) : current().art());
    paint();
    const b = h(
      "button",
      {
        type: "button",
        class: `select${narrow ? " select-narrow" : ""}`,
        "aria-haspopup": "menu",
        "aria-expanded": "false",
        "aria-label": `${title}: ${current().label}`,
        "data-tip": title,
      },
      face,
      h("span", { class: "select-chevron", html: icon("chevron-up") }),
    );
    b.addEventListener("click", () =>
      d.popovers.toggle(
        b,
        (pop) => {
          pop.dataset.owner = "props";
          const rows = options.map((o) =>
            h(
              "button",
              {
                type: "button",
                class: "option",
                role: "menuitemradio",
                "aria-checked": String(o.id === value),
                onclick: () => {
                  value = o.id;
                  onPick(o.id);
                  paint();
                  b.setAttribute("aria-label", `${title}: ${o.label}`);
                  d.popovers.close();
                },
              },
              h("span", { class: "option-check", html: icon("check") }),
              h(
                "span",
                { class: "option-text" },
                h("span", { class: "option-label", text: o.label }),
                o.note ? h("span", { class: "option-note", text: o.note }) : null,
              ),
              h("span", { class: "option-art" }, o.art()),
            ),
          );
          pop.addEventListener("keydown", (e) => {
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
            e.preventDefault();
            const i = rows.indexOf(d.shadow.activeElement);
            rows[(i + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length].focus();
          });
          return [
            h("p", { class: "pop-title", text: title }),
            h("div", { class: `options${options.length > 8 ? " options-scroll" : ""}`, role: "menu", "aria-label": title }, ...rows),
          ];
        },
        { label: title, role: "dialog", className: "pop-select" },
      ),
    );
    return b;
  }

  menuRow(name, label, action, extra = {}) {
    const { key, checked, ...rest } = extra;
    return h(
      "button",
      {
        type: "button",
        class: "menu-row",
        role: checked == null ? "menuitem" : "menuitemradio",
        "aria-checked": checked == null ? null : String(checked),
        onclick: () => action(),
        ...rest,
      },
      h("span", { class: "menu-icon", html: icon(name) }),
      h("span", { class: "menu-label", text: label }),
      key ? h("kbd", { text: key }) : null,
    );
  }

  arrowKeys(menu) {
    menu.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const rows = [...menu.querySelectorAll(".menu-row, button.menu-field")];
      const i = rows.indexOf(this.desk.shadow.activeElement);
      rows[(i + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length].focus();
    });
    return menu;
  }

  toggleShapes(anchor) {
    const d = this.desk;
    d.popovers.toggle(
      anchor,
      () => {
        const rows = FIGURES.map((f) =>
          this.menuRow(
            f.icon,
            f.label,
            () => {
              d.popovers.close();
              d.setFigure(f.id);
            },
            { key: this.o.shortcuts ? this.figureKey(f) : null, checked: d.state.figure === f.id },
          ),
        );
        return this.arrowKeys(h("div", { class: "menu menu-narrow", role: "menu", "aria-label": "Shapes" }, ...rows));
      },
      { placement: "top", align: "start", role: "menu", label: "Shapes", className: "pop-menu", anchorFor: this.shapeButton },
    );
  }

  toggleText(anchor) {
    const d = this.desk;
    d.popovers.toggle(
      anchor,
      () => {
        const rows = TEXT_MODES.map((m) =>
          this.menuRow(
            m.icon,
            m.label,
            () => {
              d.popovers.close();
              d.setTextMode(m.id);
            },
            { key: this.o.shortcuts && m.key ? m.key : null, checked: d.state.tool === "text" && d.state.textMode === m.id },
          ),
        );
        if (this.o.caption) rows.push(h("div", { class: "menu-sep", role: "separator" }), this.captionSwitch());
        return this.arrowKeys(h("div", { class: "menu menu-narrow", role: "menu", "aria-label": "Text" }, ...rows));
      },
      { placement: "top", align: "start", role: "menu", label: "Text", className: "pop-menu", anchorFor: this.textButton },
    );
  }

  captionSwitch() {
    const d = this.desk;
    const toggle = h("span", { class: "switch", role: "switch", "aria-checked": String(d.captionShown), "aria-hidden": "true" });
    return h(
      "button",
      {
        type: "button",
        class: "menu-field",
        role: "menuitemcheckbox",
        "aria-checked": String(d.captionShown),
        onclick: (e) => {
          d.setCaptionShown(!d.captionShown);
          toggle.setAttribute("aria-checked", String(d.captionShown));
          e.currentTarget.setAttribute("aria-checked", String(d.captionShown));
        },
      },
      h("span", { class: "menu-field-label" }, h("span", { class: "menu-icon", html: icon("captions") }), h("span", { text: "Caption" })),
      toggle,
    );
  }

  choice(title, options, value, onPick) {
    const group = h("div", {
      class: "choice",
      role: "radiogroup",
      "aria-label": title,
      "data-label": title,
      style: { "--columns": String(options.length <= 3 ? options.length : options.length === 4 ? 2 : 3) },
    });
    const buttons = options.map((o) => {
      const b = h(
        "button",
        {
          type: "button",
          class: "choice-option",
          role: "radio",
          "aria-checked": String(o.id === value),
          onclick: () => {
            for (const other of buttons) other.setAttribute("aria-checked", String(other === b));
            onPick(o.id);
          },
        },
        h("span", { class: "choice-art" }, o.art()),
        h("span", { class: "choice-label", text: o.label }),
      );
      return b;
    });
    group.append(...buttons);
    return group;
  }

  menuAnchor() {
    return this.desk.compact
      ? { anchor: this.phone.moreButton, placement: "left", align: "start" }
      : { anchor: this.moreButton, placement: "bottom", align: "end" };
  }

  toggleMenu() {
    const { anchor, placement, align } = this.menuAnchor();
    this.desk.popovers.toggle(anchor, () => this.menu(), { placement, align, role: "menu", label: "More", className: "pop-menu" });
  }

  menu() {
    const d = this.desk;
    const row = (name, label, action, extra) => this.menuRow(name, label, action, extra);
    const sep = () => h("div", { class: "menu-sep", role: "separator" });
    const then = (fn) => () => {
      d.popovers.close();
      fn();
    };
    const items = [
      row(
        "arrow-down-to-line",
        "Save as PNG",
        then(() => d.download("cartoon", "png", 2)),
      ),
      row(
        "code-xml",
        "Save as SVG",
        then(() => d.download("cartoon", "svg")),
      ),
      sep(),
    ];
    if (this.o.trace) {
      items.push(
        row(
          "image-plus",
          d.trace ? "Change the photo" : "Trace a photo",
          then(() => d.pickTrace()),
        ),
      );
      if (d.trace)
        items.push(
          row(
            "x",
            "Stop tracing",
            then(() => d.clearTrace()),
          ),
        );
    }
    if (this.o.signature) items.push(row("signature", "Sign it", () => (d.signature ? then(() => d.sign())() : this.showSignPad())));
    if (d.compact && this.o.caption) items.push(sep(), this.captionSwitch());
    if (!d.compact) items.push(sep(), ...this.frameRows());
    return this.arrowKeys(h("div", { class: "menu" }, ...items));
  }

  frameRows() {
    const d = this.desk;
    const switchRow = (name, label, get, set) => {
      const toggle = h("span", { class: "switch", role: "switch", "aria-hidden": "true" });
      const row = h(
        "button",
        {
          type: "button",
          class: "menu-field",
          role: "menuitemcheckbox",
          onclick: () => {
            set(!get());
            refresh();
          },
        },
        h("span", { class: "menu-field-label" }, h("span", { class: "menu-icon", html: icon(name) }), h("span", { text: label })),
        toggle,
      );
      row.sync = () => {
        toggle.setAttribute("aria-checked", String(get()));
        row.setAttribute("aria-checked", String(get()));
      };
      return row;
    };
    const contain = switchRow(
      "crop",
      "Keep inside the frame",
      () => d.contained,
      (on) => d.setContained(on),
    );
    const label = switchRow(
      "captions",
      "Caption background",
      () => d.captionUi.style.label !== false,
      (on) => d.setCaptionLabel(on),
    );
    const show = () => {
      contain.hidden = d.frameMode === "none";
      label.hidden = !d.bleeds || !d.options.caption;
      contain.sync();
      label.sync();
    };
    const refresh = () => {
      const pop = contain.closest(".pop");
      if (!pop) return show();
      morph(pop, () => {
        show();
        d.popovers.place();
      });
    };
    const frame = segmented(
      FRAMES,
      d.frameMode,
      (id) => {
        d.setFrame(id);
        refresh();
      },
      { label: "Frame" },
    );
    show();
    return [
      h(
        "div",
        { class: "menu-field" },
        h("span", { class: "menu-field-label" }, h("span", { class: "menu-icon", html: icon("frame") }), h("span", { text: "Frame" })),
        frame,
      ),
      contain,
      label,
    ];
  }

  showSignPad() {
    const d = this.desk;
    const { anchor, placement, align } = this.menuAnchor();
    d.popovers.show(anchor, () => d.buildSignPad(), { placement, align, label: "Your signature", className: "pop-card" });
  }

  discArt() {
    const id = this.desk.state.tool;
    const wrap = document.createElement("div");
    const glyph =
      id === "hand"
        ? this.desk.compact
          ? "hand"
          : "mouse-pointer-2"
        : id === "shape"
          ? figureOf(this.desk.state.figure).icon
          : id === "text"
            ? "type"
            : id === "bubble"
              ? "message-circle"
              : null;
    wrap.innerHTML = glyph ? `<span class="disc-icon">${icon(glyph)}</span>` : ART[id](`${this.prefix}disc${id}`);
    if (!glyph && this.desk.colourFor(id)) wrap.firstElementChild?.style.setProperty("--tool-color", this.desk.colourFor(id));
    return [...wrap.childNodes];
  }

  bindTips() {
    const tip = this.tip;
    let timer = 0;
    let shown = null;
    let warmUntil = 0;
    let motion = [];
    const stop = () => {
      for (const m of motion) m.anim.cancel();
      motion = [];
    };
    const write = (nodes, delay, step, duration) =>
      nodes.forEach((n, i) =>
        motion.push(
          animate(
            n,
            [
              { opacity: 0, transform: "translateY(5px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration, delay: delay + i * step, easing: EASE_OUT, fill: "backwards" },
          ),
        ),
      );
    const hide = () => {
      clearTimeout(timer);
      if (!shown) return;
      shown = null;
      warmUntil = performance.now() + 400;
      stop();
      const sink = tip.hasAttribute("data-below") ? -3 : 3;
      const out = animate(
        tip,
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: `translateY(${sink}px) scale(0.94)` },
        ],
        { duration: 150, easing: EASE_IN, fill: "forwards" },
      );
      motion.push(
        out,
        animate(tip, [{ filter: "blur(0px)" }, { filter: "blur(3px)" }], { duration: 150, easing: EASE_IN, fill: "forwards", pseudoElement: "::before" }),
      );
      out.done.then(() => {
        if (shown || !motion.includes(out)) return;
        stop();
        tip.removeAttribute("data-show");
      });
    };
    const show = (target) => {
      if (this.desk.compact) return;
      const label = target.dataset.tip;
      if (!label || target.getAttribute("aria-expanded") === "true") return;
      const key = target.dataset.key;
      const from = tip.hasAttribute("data-show") ? tip.getBoundingClientRect() : null;
      const was = { below: tip.hasAttribute("data-below"), top: tip.offsetTop };
      stop();
      const chars = Array.from(label, (c) => h("span", { class: "tip-char", text: c }));
      const kbd = key ? h("kbd", { text: key }) : null;
      tip.replaceChildren(...[h("span", { class: "tip-label" }, ...chars), kbd].filter(Boolean));
      tip.toggleAttribute("data-key", !!key);
      const host = this.desk.root.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      const below = !!target.closest("[data-tip-below]") || r.top - host.top < 48;
      tip.toggleAttribute("data-below", below);
      tip.setAttribute("data-show", "");
      const half = tip.offsetWidth / 2;
      tip.style.left = `${Math.min(host.width - half - 8, Math.max(half + 8, r.left + r.width / 2 - host.left))}px`;
      tip.style.top = `${below ? r.bottom - host.top + 8 : r.top - host.top - tip.offsetHeight - 8}px`;
      shown = target;
      const to = tip.getBoundingClientRect();
      if (from && was.below === below && Math.abs(was.top - tip.offsetTop) < 4) {
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        motion.push(
          animate(
            tip,
            [
              { transform: `translateX(${dx}px)`, width: `${from.width}px` },
              { transform: "none", width: `${to.width}px` },
            ],
            { duration: TIP.duration, easing: TIP.easing },
          ),
        );
        write(chars, 40, 16, 280);
      } else {
        const rise = below ? -6 : 6;
        motion.push(
          animate(
            tip,
            [
              { opacity: 0, transform: `translateY(${rise}px) scale(0.86)` },
              { opacity: 1, transform: "none" },
            ],
            { duration: TIP.duration, easing: TIP.easing },
          ),
        );
        motion.push(animate(tip, [{ filter: "blur(4px)" }, { filter: "blur(0px)" }], { duration: 240, easing: EASE_OUT, pseudoElement: "::before" }));
        write(chars, 40, 16, 280);
      }
      if (kbd)
        motion.push(
          animate(
            kbd,
            [
              { opacity: 0, transform: "scale(0.6)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: TIP.duration, delay: 80 + chars.length * 16, easing: TIP.easing, fill: "backwards" },
          ),
        );
    };
    const root = this.desk.root;
    root.addEventListener("pointerover", (e) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target.closest?.("[data-tip]");
      if (target === shown) return;
      clearTimeout(timer);
      if (!target || this.desk.gesture) return hide();
      const warm = !!shown || performance.now() < warmUntil;
      timer = setTimeout(() => show(target), warm ? 0 : 200);
    });
    root.addEventListener("pointerdown", hide);
    root.addEventListener("pointerleave", hide);
    root.addEventListener("scroll", hide, true);
    root.addEventListener("wheel", hide, { passive: true });
    root.addEventListener("focusin", (e) => {
      const target = e.target.closest?.("[data-tip]");
      if (target && this.desk.engagedByKeyboard) show(target);
    });
    root.addEventListener("focusout", hide);
  }
}
