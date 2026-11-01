import css from "./styles.css?inline";
import { brushOf, brushShape, BRUSHES } from "../core/brushes.js";
import { alphaOf, sameColour, splitColour, withAlpha } from "../core/colour.js";
import { BUBBLES, mouthOf } from "../core/bubbles.js";
import { applyEraser, History, prune, uid } from "../core/doc.js";
import { assemble, quoteRuns, saveBlob, sheetMetrics, SHEET, svgImage, wrapRuns } from "../core/export.js";
import { maskRings, regionAt } from "../core/fill.js";
import { bounds, clamp, dist, lerp, mergeShapes, n1, overlaps, pointInRing, resample, ringPath, shapeBounds, shapePath, union } from "../core/geometry.js";
import { hatchLines } from "../core/hatch.js";
import { ANGLES, centerline, INKS, PAINTS, paintFor, PEN_ORDER, PENS, penShape, pressureFromSpeed, TONES, WASHES } from "../core/pens.js";
import { newSeed, noise } from "../core/random.js";
import { bubbleArt, COLORS, el, paintAttrs, Scene } from "../core/scene.js";
import { FIGURE_STYLES, FIGURES, FILLS, frameFor, isOpenFigure, shapeArt } from "../core/figures.js";
import { centroid, recognize, scaleShape, sketchShape } from "../core/shapes.js";
import { PASSES, Steady } from "../core/steady.js";
import { drawCover, inkLines } from "../core/trace.js";
import { INKED, INSERT_ORDER, INSERTS, OPACITY, toolMeta } from "../core/tools.js";
import { moveBy, relative, rotateAbout, scaleAbout, tfBox, tfInverse, tfPoint, turn } from "../core/transform.js";
import { loadFonts, SERIF } from "../core/fonts.js";
import { fontFor, SANS, textItemLayout, TYPEFACES } from "../core/type.js";
import { partSize, pieceFromBoard, pieceGeometry, pieceToBoard, toPieceLocal } from "../parts/geometry.js";
import { placement } from "../parts/index.js";
import { ageOf, kindOf, randomPerson } from "../parts/people.js";
import { PLACES } from "../parts/places.js";
import { THINGS } from "../parts/things.js";
import { Dock } from "./bar.js";
import { Caption, SIZES } from "./caption.js";
import { Library, optionName } from "./library.js";
import { colourPicker, drillIn } from "./picker.js";
import { Popovers } from "./popover.js";
import { animate, EASE, EASE_IN, EASE_IN_OUT, EASE_OUT, h, popIn, reducedMotion, segmented, SPRING, travel } from "./dom.js";
import { icon } from "./icons.js";
import { TypeEditor } from "./typing.js";

const TRACE_FADE = { duration: 280, easing: EASE_IN_OUT };

const turnCursor = (pt, c) => {
  const step = Math.round(((Math.atan2(pt.y - c.y, pt.x - c.x) * 180) / Math.PI + 45) / 45) * 45;
  return `turn-${(step + 360) % 360}`;
};

const TOPS = { suit: "Jacket", tuxedo: "Jacket", overalls: "Shirt", ghost: "Sheet", death: "Robe", witch: "Robe" };
const BOTTOMS = { overalls: "Overalls" };

const DEFAULTS = {
  board: { w: 1000, h: 800 },
  tools: PEN_ORDER,
  cast: true,
  shapes: true,
  text: true,
  bubbles: true,
  trace: true,
  caption: true,
  signature: true,
  frame: "wash",
  shortcuts: true,
  theme: "auto",
  paper: "#fffefa",
  desk: null,
  ink: COLORS.ink,
  pencil: COLORS.pencil,
  wash: COLORS.wash,
  captionFont: SERIF,
  placeholder: "Write the caption",
  quotes: true,
  exportPencils: false,
  storageKey: null,
  rememberTools: true,
  initial: null,
  inset: null,
  onChange: null,
  readonly: false,
  contain: true,
  minSize: { width: 375, height: 640 },
};

const LIBRARY_MOTION = { open: { duration: SPRING.duration, easing: SPRING.easing }, close: { duration: 300, easing: EASE_IN } };

const SNAPPABLE = new Set(["nib", "fineliner", "brush", "pencil"]);
const TYPED = new Set(["text", "bubble"]);
const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
const PREF_KEYS = {
  figure: FIGURES.map((f) => f.id),
  figureStyle: FIGURE_STYLES.map((f) => f.id),
  fill: FILLS.map((f) => f.id),
  corners: ["square", "round"],
  ends: ["end", "both"],
  textMode: ["text", "path"],
  face: TYPEFACES.map((f) => f.id),
  bubble: BUBBLES.map((b) => b.id),
  bubbleFace: TYPEFACES.map((f) => f.id),
  brush: BRUSHES.map((b) => b.id),
};
const HOLD_MS = 520;
const LIBRARY_WIDTH = 336;
const COMPACT_WIDTH = 819;
const TAP_SELECT = new Set(["nib", "fineliner", "brush", "pencil", "hatch"]);
let instances = 0;

const frameMode = (f) => (f === false || f === "none" ? "none" : f === "line" ? "line" : "wash");

const storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

const lengthOf = (pts) => {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
  return total;
};

const inside = (p, b, pad = 0) => !!b && p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;

function coverage(area, box, board) {
  const x0 = Math.max(0, box.x);
  const y0 = Math.max(0, box.y);
  const x1 = Math.min(board.w, box.x + box.w);
  const y1 = Math.min(board.h, box.y + box.h);
  const own = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
  if (!own) return 0;
  const ix = Math.max(0, Math.min(x1, area.x + area.w) - Math.max(x0, area.x));
  const iy = Math.max(0, Math.min(y1, area.y + area.h) - Math.max(y0, area.y));
  return (ix * iy) / own;
}

function vignette(board, seed) {
  const { w, h } = board;
  const ix = w * 0.035;
  const iy = h * 0.045;
  const r = Math.min(w, h) * 0.11;
  const n = noise(seed);
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let k = 0; k <= 10; k++) {
      const a = a0 + (k / 10) * (Math.PI / 2);
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
  };
  corner(w - ix - r, iy + r, -Math.PI / 2);
  corner(w - ix - r, h - iy - r, 0);
  corner(ix + r, h - iy - r, Math.PI / 2);
  corner(ix + r, iy + r, Math.PI);
  const ring = resample(pts.concat([pts[0]]), 6);
  ring.pop();
  let s = 0;
  return ring.map((p, i) => {
    if (i) s += dist(ring[i - 1], p);
    const a = ring[(i - 1 + ring.length) % ring.length];
    const b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const off = n(s / 90) * 6 + n(s / 23 + 40) * 1.6;
    return { x: p.x - (dy / len) * off, y: p.y + (dx / len) * off };
  });
}

export class Desk {
  constructor(target, options = {}) {
    this.options = { ...DEFAULTS, ...options, board: { ...DEFAULTS.board, ...(options.board || {}) } };
    this.options.tools = (this.options.tools || PEN_ORDER).filter((id) => PENS[id]);
    if (!this.options.tools.length) this.options.tools = PEN_ORDER;
    this.board = this.options.board;
    this.prefix = `ik${++instances}-`;
    this.colors = { ink: this.options.ink, pencil: this.options.pencil, wash: this.options.wash };
    this.frameMode = frameMode(this.options.frame);
    this.contained = this.options.contain !== false;

    this.families = { serif: this.options.captionFont, sans: this.options.uiFont || SANS };
    if (this.options.captionFont === SERIF) loadFonts();
    this.state = {
      tool: this.options.tools[0],
      sizes: Object.fromEntries([...PEN_ORDER.map((id) => [id, PENS[id].size[2]]), ...INSERT_ORDER.map((id) => [id, INSERTS[id].size[2]])]),
      steady: 1,
      tones: { hatch: "mid" },
      angle: "right",
      inks: Object.fromEntries([...INKED].map((id) => [id, INKS[0].color])),
      washColor: PAINTS[0].color,
      quotes: this.options.quotes,
      brush: "ink",
      figure: "rect",
      figureStyle: "hand",
      fill: "none",
      sides: 6,
      points: 5,
      corners: "square",
      ends: "end",
      textMode: "text",
      face: "serif",
      bubble: "speech",
      bubbleFace: "serif",
    };
    if (this.options.rememberTools) {
      const prefs = storage.get("inkling:prefs");
      if (prefs) {
        if (this.isTool(prefs.tool)) this.state.tool = prefs.tool;
        if ([0, 1, 2].includes(prefs.steady)) this.state.steady = prefs.steady;
        if (TONES.some((t) => t.id === prefs.tones?.hatch)) this.state.tones.hatch = prefs.tones.hatch;
        if (ANGLES.some((a) => a.id === prefs.angle)) this.state.angle = prefs.angle;
        if (prefs.inks) for (const [k, v] of Object.entries(prefs.inks)) if (INKED.has(k) && HEX.test(v || "")) this.state.inks[k] = v;
        if (!prefs.inks && HEX.test(prefs.ink || "")) for (const k of INKED) this.state.inks[k] = prefs.ink;
        if (prefs.opacity)
          for (const [k, v] of Object.entries(prefs.opacity))
            if (INKED.has(k) && Number.isFinite(v) && v < 1 && alphaOf(this.state.inks[k]) === 1)
              this.state.inks[k] = withAlpha(this.state.inks[k], clamp(v, OPACITY[0], 1));
        if (HEX.test(prefs.washColor || "")) this.state.washColor = paintFor(prefs.washColor);
        for (const [k, allowed] of Object.entries(PREF_KEYS)) if (allowed.includes(prefs[k])) this.state[k] = prefs[k];
        if (Number.isInteger(prefs.sides)) this.state.sides = clamp(prefs.sides, 3, 12);
        if (Number.isInteger(prefs.points)) this.state.points = clamp(prefs.points, 3, 16);
      }
    }

    this.history = new History([]);
    this.compact = false;
    this.caption = "";
    this.selection = [];
    this.chrome = true;
    this.captionShown = true;
    this.gesture = null;
    this.penSeen = false;
    this.trace = null;
    this.signature = this.options.signature ? storage.get("inkling:signature") : null;
    this.hints = new Set(storage.get("inkling:hints") || []);

    this.mountHost(target);
    this.buildDom();
    this.scene = new Scene({
      panel: this.panel,
      board: this.board,
      prefix: this.prefix,
      geometry: pieceGeometry,
      colors: this.colors,
      paper: this.options.paper,
      families: this.families,
    });
    this.drawFrame();
    if (this.options.readonly) {
      this.root.dataset.readonly = "";
    } else {
      this.popovers = new Popovers(this);
      this.typing = new TypeEditor(this);
      this.library = new Library(this);
      this.dock = new Dock(this);
      this.root.append(
        this.library.el,
        this.dock.el,
        this.dock.historyBar,
        this.dock.actionsBar,
        this.dock.phone.rail,
        this.dock.phone.doneBar,
        this.dock.disc,
        this.dock.tip,
      );
      this.bindPointer();
      this.bindKeys();
      this.bindDrop();
      this.dock.reveal();
    }
    this.applyTheme();

    const saved = this.options.storageKey ? storage.get(this.options.storageKey) : null;
    const start = saved || this.options.initial;
    if (start) this.setDrawing(start, { silent: true });
    const width = this.host.getBoundingClientRect().width;
    this.compact = width > 0 && width <= COMPACT_WIDTH;
    if (this.compact && this.state.tool !== "hand") this.deskTool = this.state.tool;
    this.setTool(this.compact ? "hand" : this.state.tool, { silent: true });
    this.dock?.phone.reset();
    this.sync();

    this.resize = new ResizeObserver(() => this.layout());
    this.resize.observe(this.host);
    this.layout();
    document.fonts?.ready?.then(() => this.layout());
  }

  get selected() {
    return this.selection.length === 1 ? this.selection[0] : null;
  }

  mountHost(target) {
    if (target.shadowRoot === null && target.tagName?.includes("-")) {
      this.host = target;
    } else {
      this.host = document.createElement("div");
      this.host.className = "inkling";
      this.host.style.cssText = "width:100%;height:100%;";
      target.appendChild(this.host);
    }
    this.shadow = this.host.shadowRoot || this.host.attachShadow({ mode: "open" });
    this.shadow.innerHTML = "";
    const style = document.createElement("style");
    style.textContent = css;
    this.shadow.append(style);
    if (this.options.desk) this.host.style.setProperty("--bg-desk", this.options.desk);
    this.host.style.setProperty("--bg-paper", this.options.paper);
    this.host.style.setProperty("--font-family-caption", this.options.captionFont);
    if (this.options.uiFont) this.host.style.setProperty("--font-family", this.options.uiFont);
    this.host.style.setProperty("--board-ratio", `${this.board.w} / ${this.board.h}`);
  }

  buildDom() {
    this.root = h("div", { class: "root", "data-cursor-off": "" });
    if (this.options.inset != null) this.root.style.setProperty("--layout-margin", `${this.options.inset}px`);
    this.panel = h("div", { class: "panel", role: "img", "aria-label": "Drawing paper" });
    this.traceImage = h("canvas", { class: "trace", hidden: true, "aria-hidden": "true" });
    this.reach = h("div", { class: "reach", "aria-hidden": "true" });
    this.panel.append(this.reach, this.traceImage);

    this.captionUi = new Caption(this);
    this.captionEl = this.captionUi.el;
    this.sheet = h("div", { class: "sheet" }, this.panel, this.options.caption ? this.captionEl : null);
    this.stage = h("div", { class: "stage" }, this.sheet);

    this.float = h("div", { class: "float", role: "toolbar", "aria-label": "Selection", hidden: true });

    this.traceMode = "photo";
    this.traceBar = h("div", { class: "trace-bar", hidden: true, role: "group", "aria-label": "Tracing" });
    this.traceModes = segmented(
      [
        { id: "photo", label: "Photo" },
        { id: "lines", label: "Lines" },
      ],
      "photo",
      (id) => this.setTraceMode(id),
      { label: "Show the photo as" },
    );
    this.traceToggle = h("button", {
      type: "button",
      class: "icon-button",
      "aria-label": "Hide the photo",
      "data-tip": "Hide the photo",
      "aria-pressed": "false",
      html: icon("eye-off"),
      onclick: () => this.hideTrace(!this.traceImage.hasAttribute("data-hidden")),
    });
    this.traceBar.append(
      this.traceModes,
      h("span", { class: "divider", "aria-hidden": "true" }),
      this.traceToggle,
      h("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "Stop tracing",
        "data-tip": "Stop tracing",
        html: icon("x"),
        onclick: () => this.clearTrace(),
      }),
    );
    this.traceBar.addEventListener("pointerdown", (e) => e.stopPropagation());

    this.toastText = h("span");
    this.toastAction = h("button", { type: "button", class: "toast-action", hidden: true });
    this.toastEl = h("div", { class: "toast", role: "status", "aria-live": "polite" }, this.toastText, this.toastAction);
    this.fileInput = h("input", { type: "file", accept: "image/*", class: "file", tabindex: "-1", "aria-hidden": "true" });
    this.fileInput.addEventListener("change", () => {
      const file = this.fileInput.files?.[0];
      if (file) this.setTrace(file);
      this.fileInput.value = "";
    });

    this.root.append(this.stage, this.traceBar, this.float, this.toastEl, this.fileInput);
    if (this.captionUi.bar && this.options.caption) this.root.append(this.captionUi.bar);
    this.shadow.append(this.root);
  }

  get items() {
    return this.history.items;
  }

  applyTheme() {
    const mode = this.options.theme;
    const set = (dark) => this.host.setAttribute("data-theme", dark ? "dark" : "light");
    this.themeQuery?.removeEventListener?.("change", this.themeListener);
    if (mode === "auto") {
      this.themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.themeListener = (e) => set(e.matches);
      this.themeQuery.addEventListener("change", this.themeListener);
      set(this.themeQuery.matches);
    } else set(mode === "dark");
  }

  get captionView() {
    return this.captionScale * (this.compact ? 1.35 : 1);
  }

  get captionScale() {
    return SIZES[this.captionUi?.style.size] || 1;
  }

  placeChrome() {
    if (!this.dock) return;
    const host = this.root.getBoundingClientRect();
    const W = host.width;
    const H = host.height;
    if (!W || !H) return;
    this.fitsScreen(W, H);
    const compact = W <= COMPACT_WIDTH;
    if (compact !== this.compact) {
      this.compact = compact;
      this.popovers?.close();
      this.typing?.finish();
      if (compact) {
        this.select([]);
        if (this.state.tool !== "hand") this.deskTool = this.state.tool;
        this.setTool("hand", { silent: true });
        this.dock.phone.reset();
      } else if (this.state.tool === "hand" && this.deskTool) this.setTool(this.deskTool, { silent: true });
      this.dock.renderProps();
    }
    this.host.style.setProperty("--caption-view", String(this.captionView / this.captionScale));
    const css = getComputedStyle(this.root);
    const inset = parseFloat(css.getPropertyValue("--layout-margin")) || 20;
    const gap = parseFloat(css.getPropertyValue("--space-sm")) || 8;
    const lib = this.library;
    const panelW = LIBRARY_WIDTH;
    const docked = W - (inset + panelW + inset) >= 440;
    if (this.chrome) {
      this.chromeMetrics = {
        dock: this.dock.el.offsetHeight,
        bar: this.dock.bar.offsetHeight,
        dockW: this.dock.el.offsetWidth,
        historyW: this.chromeMetrics?.historyW || this.dock.fullHistoryWidth(),
        actionsW: this.dock.actionsBar.offsetWidth,
        topBarH: this.dock.historyBar.offsetHeight,
      };
    }
    const m = this.chromeMetrics || { dock: 100, bar: 56, dockW: 600, historyW: 130, actionsW: 90, topBarH: 44 };
    const phone = this.dock.phone;
    const tight = !this.compact && lib.isOpen && !docked && this.dock.props.hasAttribute("data-empty");
    const covers = this.compact && lib.isOpen && !docked;
    const shown = this.chrome;
    const toolBar = parseFloat(getComputedStyle(phone.el).minHeight) || 56;
    const dockTop = !this.compact
      ? inset + (tight ? m.bar : m.dock)
      : shown
        ? inset + this.dock.props.offsetHeight + gap + toolBar
        : inset + (this.dock.disc.offsetHeight || 52);
    let bottom = covers ? inset : dockTop;
    let left = 0;
    const side = this.compact ? 0 : inset;
    const fits = (L) => {
      const availW = W - L - side * 2;
      const availH = H - bottom - inset * 2;
      const width = Math.min(availW, availH / this.sheetRatio());
      return { left: L + side + (availW - width) / 2, width };
    };
    if (lib.isOpen) {
      lib.el.dataset.mode = docked ? "dock" : "sheet";
      if (docked) {
        lib.el.style.cssText = `left:${inset}px;top:${inset + m.topBarH + gap}px;width:${panelW}px;right:auto;height:auto;`;
        const edge = inset + panelW;
        for (let L = 0; L <= edge; L += 4) {
          left = L;
          if (fits(L).left >= edge + inset - 1) break;
        }
      } else {
        const sheetH = Math.round(covers ? H * 0.58 : Math.min(420, Math.max(260, H * 0.48)));
        const sheetBottom = covers ? inset : dockTop + gap;
        lib.el.style.cssText = `left:${inset}px;right:${inset}px;bottom:${sheetBottom}px;height:${sheetH}px;top:auto;width:auto;`;
        bottom = sheetBottom + sheetH;
      }
    }
    const paper = fits(left);
    const beside = lib.isOpen && docked;
    const lo = (beside ? inset + panelW + inset : inset) + m.dockW / 2;
    const hi = W - inset - m.dockW / 2;
    const dockX = this.compact || lo > hi ? W / 2 : clamp(paper.left + paper.width / 2, lo, hi);
    this.host.style.setProperty("--dock-x", `${Math.round(dockX)}px`);
    if (beside) lib.el.style.bottom = `${dockX - m.dockW / 2 > inset + panelW + gap ? inset : dockTop + gap}px`;
    const hitsHistory = !(lib.isOpen && docked) && paper.left < inset + m.historyW + inset;
    const hitsActions = paper.left + paper.width > W - inset - m.actionsW - inset;
    const traced = shown && !this.traceBar.hidden;
    const top = this.compact
      ? shown
        ? inset + m.topBarH + (traced ? gap + this.traceBar.offsetHeight : 0)
        : 0
      : hitsHistory || hitsActions || traced
        ? inset + m.topBarH
        : 0;
    if (this.compact && shown && !lib.isOpen && phone.mode === "home") {
      bottom = top;
      const half = phone.rail.offsetHeight / 2;
      this.host.style.setProperty("--rail-y", `${Math.round(clamp(H / 2, inset + m.topBarH + gap + half, H - inset - half))}px`);
    }
    this.host.style.setProperty("--stage-top", `${Math.round(top)}px`);
    this.host.style.setProperty("--stage-left", `${Math.round(left)}px`);
    this.host.style.setProperty("--stage-bottom", `${Math.round(bottom)}px`);
  }

  fitsScreen(W, H) {
    const min = this.options.minSize;
    const small = !!min && (W < min.width || H < min.height);
    if (small === this.small) return;
    this.small = small;
    if (small && !this.tooSmall) {
      const art = h("span", { class: "too-small-art", "aria-hidden": "true" });
      art.append(
        this.library.personArt(
          { ...randomPerson(5, { kind: "human", body: "standing" }), mood: "worried", arms: "shrug", holding: "nothing", glasses: "none", hat: "none" },
          "figure",
        ),
      );
      this.tooSmall = h(
        "div",
        { class: "too-small", role: "status" },
        art,
        h("p", { class: "too-small-title", text: "Not enough room to draw" }),
        h("p", { class: "too-small-note", text: "Your browser window is smaller than Inkling supports. Try resizing it to keep drawing." }),
      );
      this.root.append(this.tooSmall);
    }
    if (this.tooSmall) this.tooSmall.hidden = !small;
    this.root.toggleAttribute("data-too-small", small);
  }

  sheetRatio() {
    const ratio = this.board.h / this.board.w;
    const lines = this.hasCaption ? Math.max(1, this.captionLines || 1) : 0;
    const font = SHEET.font * this.captionView;
    return SHEET.pad * 2 + (1 - SHEET.pad * 2) * ratio + (lines ? SHEET.gap + lines * font * SHEET.leading : 0);
  }

  layout() {
    this.placeChrome();
    this.placeToast();
    const rect = this.stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const style = getComputedStyle(this.stage);
    const availW = rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const availH = rect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const font = SHEET.font * this.captionView;
    const width = Math.max(120, Math.floor(Math.min(availW, availH / this.sheetRatio())));
    this.host.style.setProperty("--sheet-width", `${width}px`);
    if (this.hasCaption) {
      const lh = width * font * SHEET.leading;
      const measured = Math.max(1, Math.round(this.captionEl.offsetHeight / lh));
      if (measured !== (this.captionLines || 1)) {
        this.captionLines = measured;
        requestAnimationFrame(() => this.layout());
      }
    }
    this.placeReach();
    if (this.selection.length) this.renderSelection();
    this.captionUi?.place();
    this.captionUi?.fitBacking();
    this.popovers?.place();
    this.typing?.place();
  }

  drawFrame() {
    const mode = this.frameMode;
    const { w, h } = this.board;
    const inset = 9;
    const wash = mode === "wash" ? ringPath(vignette(this.board, 11)) : "";
    this.root?.toggleAttribute("data-bleed", this.bleeds);
    this.captionUi?.fitBacking();
    this.placeReach();
    this.scene.setBackdrop(wash, 0.085);
    this.scene.setClip(!this.contained ? "" : mode === "wash" ? wash : mode === "line" ? `M${inset} ${inset}H${w - inset}V${h - inset}H${inset}Z` : "");
    if (mode !== "line") return this.scene.setFrame("");
    const pts = sketchShape(
      {
        type: "polygon",
        corners: [
          { x: inset, y: inset },
          { x: w - inset, y: inset },
          { x: w - inset, y: h - inset },
          { x: inset, y: h - inset },
        ],
      },
      7,
      { bow: 0.25, wobble: 0.5 },
    ).map((p) => ({ ...p, p: 0.7 }));
    this.scene.setFrame(shapePath(penShape("fineliner", pts, 2.4, { passes: 1 })));
  }

  placeReach() {
    if (!this.reach || !this.sheet) return;
    Object.assign(this.reach.style, {
      top: `${-this.panel.offsetTop}px`,
      left: `${-this.panel.offsetLeft}px`,
      width: `${this.sheet.clientWidth}px`,
      height: `${this.sheet.clientHeight}px`,
    });
  }

  setCaptionLabel(on) {
    this.captionUi.setStyle({ label: on });
    this.captionUi.fitBacking();
  }

  get bleeds() {
    return this.frameMode === "none" || !this.contained;
  }

  setFrame(mode) {
    this.frameMode = frameMode(mode);
    this.drawFrame();
    this.changed();
  }

  setContained(on) {
    this.contained = !!on;
    this.drawFrame();
    this.changed();
  }

  sync({ animate = false, hold = null, leave, soft = false, wipe = false, paint = false } = {}) {
    this.scene.sync(this.items, { animate, hold, leave, soft, wipe, paint });
    this.dock?.refreshHistory(this.history.past.length > 0, this.history.future.length > 0, this.items.length > 0 || !!this.caption);
    this.selection = this.selection.filter((id) => this.items.some((i) => i.id === id));
    this.renderSelection();
    this.refreshSelectionProps?.();
    this.library?.syncSelection();
  }

  commit(items, { select, animate = false, hold = null, leave, paint = false } = {}) {
    if (!this.history.commit(items)) return false;
    if (select !== undefined) this.selection = select ? [].concat(select) : [];
    this.sync({ animate, hold, leave, paint });
    this.changed();
    return true;
  }

  changed() {
    clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      if (this.options.storageKey) storage.set(this.options.storageKey, this.getDrawing());
    }, 350);
    this.options.onChange?.(this.getDrawing());
    this.host.dispatchEvent(new CustomEvent("change", { detail: this.getDrawing() }));
  }

  savePrefs() {
    if (!this.options.rememberTools) return;
    const { tool, steady, tones, angle, inks, washColor } = this.state;
    const extra = Object.fromEntries([...Object.keys(PREF_KEYS), "sides", "points"].map((k) => [k, this.state[k]]));
    storage.set("inkling:prefs", { tool, steady, tones, angle, inks, washColor, ...extra });
  }

  hint(id, text) {
    if (this.hints.has(id)) return;
    this.hints.add(id);
    storage.set("inkling:hints", [...this.hints]);
    this.toast(text, { ms: 2800 });
  }

  toast(text, { ms = 1900, action, onAction } = {}) {
    this.placeToast();
    this.toastText.textContent = text;
    this.toastAction.hidden = !action;
    this.toastEl.toggleAttribute("data-action", !!action);
    if (action) {
      this.toastAction.textContent = action;
      this.toastAction.onclick = () => {
        this.toastEl.removeAttribute("data-show");
        onAction?.();
      };
    }
    this.toastEl.setAttribute("data-show", "");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastEl.removeAttribute("data-show"), action ? Math.max(ms, 5000) : ms);
  }

  placeToast(timing = null) {
    const css = getComputedStyle(this.root);
    const inset = parseFloat(css.getPropertyValue("--layout-margin")) || 20;
    const gap = parseFloat(css.getPropertyValue("--space-sm")) || 8;
    const height = this.root.clientHeight;
    const tops = [];
    const dock = this.dock;
    if (dock) {
      for (const n of [dock.props, dock.bar, dock.phone.el]) if (n.offsetParent && !n.hasAttribute("data-empty")) tops.push(dock.el.offsetTop + n.offsetTop);
      if (!dock.disc.hidden && dock.disc.offsetParent) tops.push(dock.disc.offsetTop);
    }
    if (this.library?.isOpen && this.library.el.dataset.mode === "sheet") tops.push(this.library.el.offsetTop);
    const bottom = Math.round(height - (tops.length ? Math.min(...tops) : height - inset) + gap);
    const was = parseFloat(this.toastEl.style.bottom);
    this.toastEl.style.bottom = `${bottom}px`;
    if (Number.isFinite(was) && Math.abs(was - bottom) > 1 && this.toastEl.hasAttribute("data-show"))
      animate(this.toastEl, [{ bottom: `${was}px` }, { bottom: `${bottom}px` }], timing || { duration: SPRING.duration, easing: SPRING.easing });
  }

  get handMode() {
    return this.state.tool === "hand";
  }

  isTool(id) {
    if (id === "hand") return true;
    if (PENS[id]) return this.options.tools.includes(id);
    if (id === "shape") return !!this.options.shapes;
    if (id === "text") return !!this.options.text;
    if (id === "bubble") return !!this.options.bubbles;
    return false;
  }

  setTool(id, { silent, keepSelection } = {}) {
    if (!this.isTool(id)) return;
    if (id === this.state.tool && !silent) return;
    if (this.typing?.open && id !== this.state.tool) this.typing.finish();
    if (id !== "hand") this.toolBeforeTap = null;
    this.state.tool = id;
    this.panel.dataset.tool = id;
    this.panel.toggleAttribute("data-hand", this.handMode);
    this.dock?.refreshTool();
    this.setHover(null);
    if (this.library?.isOpen && this.library.el.dataset.mode === "sheet") this.reflow();
    if (!silent) this.savePrefs();
    this.hideRing();
    if (id !== "hand" && !silent && !keepSelection) this.select([]);
    if (id === "hand" && !silent) this.hint("hand", "Drag to move. Drag on empty paper to select several");
  }

  setSize(value) {
    const meta = toolMeta(this.state.tool);
    if (!meta) return;
    const [min, max] = meta.size;
    this.state.sizes[this.state.tool] = clamp(value, min, max);
    this.savePrefs();
    this.updateRing();
  }

  nudgeSize(direction) {
    const tool = this.state.tool;
    const meta = toolMeta(tool);
    if (!meta) return;
    const [min, max] = meta.size;
    const now = this.state.sizes[tool];
    const step = Math.max((max - min) / 20, now * 0.12);
    this.setSize(Math.round((now + direction * step) * 10) / 10);
    this.dock?.syncSize?.();
  }

  opacityFor(tool) {
    return alphaOf(this.colourFor(tool));
  }

  setOpacity(value) {
    const colour = this.colourFor(this.state.tool);
    if (colour) this.setColour(withAlpha(colour, clamp(Math.round(value * 100) / 100, OPACITY[0], 1)));
  }

  inkAlpha(g) {
    const a = this.opacityFor(g.tool);
    return a < 1 ? Math.round(a * 1000) / 1000 : undefined;
  }

  setSteady(level) {
    this.state.steady = level;
    this.savePrefs();
  }

  setTone(id) {
    this.state.tones.hatch = id;
    this.savePrefs();
  }

  setAngle(id) {
    this.state.angle = id;
    this.savePrefs();
  }

  colourFor(tool = this.state.tool) {
    if (tool === "wash") return this.state.washColor;
    if (INKED.has(tool)) return this.state.inks[tool];
    return null;
  }

  inkFor(tool) {
    const c = this.colourFor(tool);
    return c === INKS[0].color ? undefined : c;
  }

  strokeInk(tool) {
    const { hex } = splitColour(this.colourFor(tool));
    return hex === INKS[0].color ? undefined : hex;
  }

  setColour(colour) {
    const tool = this.state.tool;
    if (tool === "wash") this.state.washColor = colour;
    else if (INKED.has(tool)) this.state.inks[tool] = colour;
    this.dock?.refreshWashTip();
    this.dock?.refreshTint();
    this.savePrefs();
  }

  setBrush(id) {
    this.state.brush = brushOf(id).id;
    this.savePrefs();
  }

  setFigure(id) {
    this.state.figure = id;
    this.savePrefs();
    if (this.state.tool === "shape") this.dock?.refreshTool();
    else this.setTool("shape");
  }

  setShapeOption(key, value) {
    this.state[key] = value;
    this.savePrefs();
  }

  setTextMode(mode) {
    this.state.textMode = mode;
    this.savePrefs();
    if (this.state.tool === "text") this.dock?.refreshTool();
    else this.setTool("text");
  }

  setFace(id) {
    if (this.state.tool === "bubble") this.state.bubbleFace = id;
    else this.state.face = id;
    this.savePrefs();
  }

  setBubbleStyle(id) {
    this.state.bubble = id;
    this.savePrefs();
  }

  recolourSelected(kind, colour, { live = false } = {}) {
    const ids = this.editable();
    if (!ids.size) return;
    const items = this.items.map((i) => {
      if (!ids.has(i.id)) return i;
      if (kind === "ink") {
        if (i.kind === "piece") return { ...i, ink: colour === INKS[0].color ? undefined : colour };
        if (i.kind === "ink" || i.kind === "hatch") {
          const { hex, alpha } = splitColour(colour);
          return { ...i, color: hex === INKS[0].color ? undefined : hex, alpha: alpha < 1 ? alpha : undefined };
        }
        if (i.kind === "shape" || TYPED.has(i.kind)) return { ...i, color: colour === INKS[0].color ? undefined : colour };
      } else if (kind === "skin") {
        if (i.kind === "piece") return { ...i, skin: colour === WASHES[0].color ? undefined : colour };
      } else if (kind === "fill") {
        if (i.kind === "shape") return { ...i, fillColor: colour, tone: undefined };
      } else if (kind.startsWith("part:")) {
        if (i.kind !== "piece") return i;
        const part = kind.slice(5);
        const tints = { ...(i.tints || {}) };
        if (colour === WASHES[0].color && (part === "hair" || part === "held" || !i.tint)) delete tints[part];
        else tints[part] = colour;
        return { ...i, tints: Object.keys(tints).length ? tints : undefined };
      } else {
        if (i.kind === "piece") return { ...i, tint: colour === WASHES[0].color ? undefined : colour };
        if (i.kind === "wash") return { ...i, color: colour, tone: undefined };
      }
      return i;
    });
    if (live) {
      this.liveBase ??= this.items;
      this.history.replace(items);
      this.scene.sync(items);
      this.renderSelection();
      return;
    }
    const settled = !!this.liveBase;
    if (settled) {
      this.history.replace(this.liveBase);
      this.liveBase = null;
    }
    this.commit(items, { animate: !settled, paint: true });
  }

  bindPointer() {
    const p = this.panel;
    p.addEventListener("pointerdown", (e) => this.onDown(e));
    p.addEventListener("pointermove", (e) => this.onMove(e));
    p.addEventListener("pointerup", (e) => this.onUp(e));
    p.addEventListener("pointercancel", (e) => this.onCancel(e));
    p.addEventListener("pointerleave", () => {
      if (this.gesture) return;
      this.hideRing();
      this.setHover(null);
    });
    p.addEventListener("lostpointercapture", (e) => {
      if (this.gesture && this.gesture.pointer === e.pointerId) this.onUp(e);
    });
    const caption = this.captionUi?.el;
    caption?.addEventListener("pointermove", (e) => this.overRuler(e));
    caption?.addEventListener(
      "pointerdown",
      (e) => {
        if (!this.overRuler(e)) return;
        e.preventDefault();
        e.stopPropagation();
        this.onDown(e);
      },
      true,
    );
    p.addEventListener("dblclick", (e) => {
      if (!this.handMode) return;
      const piece = this.items.find((i) => i.id === this.selected);
      if (piece?.locked) return;
      if (piece?.kind === "piece" && piece.part.type === "person") this.editSelected();
      else if (piece && TYPED.has(piece.kind)) this.editType(piece);
      e.preventDefault();
    });
    this.host.addEventListener("pointerenter", (e) => (this.hovering = e.pointerType !== "touch"));
    this.host.addEventListener("pointerleave", () => (this.hovering = false));
    this.onPress = (e) => {
      this.pressed = e.composedPath().includes(this.host);
      if (this.pressed) this.engagedByKeyboard = false;
    };
    document.addEventListener("pointerdown", this.onPress, true);
    this.shadow.addEventListener("focusin", () => (this.focused = true));
    this.shadow.addEventListener("focusout", () => (this.focused = false));
  }

  point(e) {
    const r = this.rect;
    return {
      x: ((e.clientX - r.left) / r.width) * this.board.w,
      y: ((e.clientY - r.top) / r.height) * this.board.h,
      p: 0.7,
      t: e.timeStamp,
    };
  }

  get unitsPerPx() {
    const w = this.rect?.width || this.panel.getBoundingClientRect().width || this.board.w;
    return this.board.w / w;
  }

  boxOf(item) {
    return item.kind === "piece" ? pieceGeometry(item).box : tfBox(item.box, item.t);
  }

  selectionBox() {
    let box = null;
    for (const id of this.selection) {
      const item = this.items.find((i) => i.id === id);
      if (item) box = union(box, this.boxOf(item));
    }
    return box;
  }

  onDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType === "pen") this.penSeen = true;
    if (e.pointerType === "touch" && this.penSeen) return;
    if (this.gesture) {
      if (e.pointerType === "touch" && this.gesture.type === "draw") this.cancelGesture();
      return;
    }
    if (this.popovers.dismissedAt === e.timeStamp) return;
    if (this.typing.open) {
      e.preventDefault();
      this.typing.finish();
      return;
    }
    if (this.shadow.activeElement === this.captionUi.text) this.captionUi.text.blur();
    e.preventDefault();
    this.rect = this.panel.getBoundingClientRect();
    const pt = this.point(e);
    try {
      this.panel.setPointerCapture(e.pointerId);
    } catch {}
    this.setHover(null);

    const grip = this.rulerHit(pt);
    if (grip) return this.startRuler(e, pt, grip);
    const tail = this.tailHandle();
    if (tail && dist(tail.at, pt) < 14 * this.unitsPerPx) return this.startTail(e, tail.item);
    const box = this.selectionLocked ? null : this.selectionBox();
    if (box) {
      const reach = 14 * this.unitsPerPx;
      const corners = this.corners(box);
      const handle = corners.findIndex((c) => dist(c, pt) < reach);
      if (handle >= 0) return this.startScale(e, pt, box);
      if (this.rotateZone(box, pt)) return this.startRotate(e, pt, box);
      if (inside(pt, box, 6 * this.unitsPerPx) && !e.shiftKey) return this.startMove(e, pt);
      if (!this.handMode) {
        this.select([]);
        this.gesture = { type: "dismiss", pointer: e.pointerId };
        return;
      }
    }
    if (this.handMode) {
      const hit = this.itemAt(pt);
      if (hit) {
        if (e.shiftKey) {
          const has = this.selection.includes(hit.id);
          const mates = new Set(this.expandGroups([hit.id]));
          this.select(has ? this.selection.filter((id) => !mates.has(id)) : [...this.selection, hit.id]);
          this.gesture = { type: "dismiss", pointer: e.pointerId };
          return;
        }
        if (hit.place && !this.selection.includes(hit.id)) {
          this.select([]);
          return this.startMarquee(e, pt, hit);
        }
        this.select([hit.id]);
        if (hit.locked) {
          this.gesture = { type: "dismiss", pointer: e.pointerId };
          return;
        }
        return this.startMove(e, pt);
      }
      if (!e.shiftKey) this.select([]);
      return this.startMarquee(e, pt);
    }
    const tool = this.state.tool;
    if (tool === "shape") return this.startFigure(e, pt);
    if (tool === "text") return this.state.textMode === "path" ? this.startTextPath(e, pt) : this.startTap(e, pt, "text");
    if (tool === "bubble") return this.startTap(e, pt, "bubble");
    this.startDraw(e, pt);
  }

  onMove(e) {
    if (!this.gesture) return this.hover(e);
    if (e.pointerId !== this.gesture.pointer) return;
    const g = this.gesture;
    if (g.type === "draw") this.moveDraw(e);
    else if (g.type === "figure" || g.type === "tap") this.moveTap(e);
    else if (g.type === "textpath") this.moveTextPath(e);
    else if (g.type === "tail") this.moveTail(e);
    else if (g.type === "move") this.moveMove(e);
    else if (g.type === "scale") this.moveScale(e);
    else if (g.type === "rotate") this.moveRotate(e);
    else if (g.type === "ruler") this.moveRuler(e);
    else if (g.type === "marquee") this.moveMarquee(e);
  }

  onUp(e) {
    const g = this.gesture;
    if (!g || (e.pointerId !== undefined && e.pointerId !== g.pointer)) return;
    clearTimeout(this.holdTimer);
    this.gesture = null;
    delete this.panel.dataset.dragging;
    if (g.type === "draw") this.finishDraw(g, e);
    else if (g.type === "figure") this.finishFigure(g);
    else if (g.type === "tap") this.finishTap(g);
    else if (g.type === "textpath") this.finishTextPath(g);
    else if (g.type === "tail") this.finishTransform(g);
    else if (g.type === "move" || g.type === "scale" || g.type === "rotate") this.finishTransform(g);
    else if (g.type === "marquee") this.finishMarquee(g);
  }

  onCancel(e) {
    if (this.gesture && e.pointerId === this.gesture.pointer) this.cancelGesture();
  }

  cancelGesture() {
    const g = this.gesture;
    clearTimeout(this.holdTimer);
    this.gesture = null;
    this.scene.live.replaceChildren();
    this.scene.setLiveErase(null);
    this.marqueeNode?.remove();
    if (g && (g.type === "move" || g.type === "scale" || g.type === "rotate" || g.type === "tail")) {
      this.history.replace(g.before);
      this.sync();
    }
  }

  hover(e) {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    this.rect = this.panel.getBoundingClientRect();
    const pt = this.point(e);
    this.hoverPoint = pt;
    let mode = "";
    const box = this.selectionBox();
    const tail = this.tailHandle();
    const grip = this.rulerHit(pt);
    this.root.toggleAttribute("data-ruler-over", !!grip);
    if (grip) mode = grip === "turn" ? turnCursor(pt, this.ruler) : "ruler";
    else if (tail && dist(tail.at, pt) < 14 * this.unitsPerPx) mode = "tail";
    else if (box) {
      const reach = 14 * this.unitsPerPx;
      if (!this.selectionLocked && this.corners(box).some((c) => dist(c, pt) < reach)) mode = "handle";
      else if (!this.selectionLocked && this.rotateZone(box, pt)) mode = turnCursor(pt, { x: box.x + box.w / 2, y: box.y + box.h / 2 });
      else if (inside(pt, box)) mode = "piece";
    }
    let hovered = null;
    if (!mode && this.handMode) {
      hovered = this.itemAt(pt);
      if (hovered) mode = "piece";
    }
    this.setHover(hovered);
    if (mode) this.panel.dataset.hover = mode;
    else delete this.panel.dataset.hover;
    if (!this.handMode && !mode) this.updateRing(pt);
    else this.hideRing();
  }

  setHover(item) {
    if (item?.id === this.hoverId) return;
    this.hoverId = item?.id || null;
    this.hoverNode?.remove();
    this.hoverNode = null;
    if (!item || this.selection.includes(item.id)) return;
    const b = this.boxOf(item);
    const pad = 4 * this.unitsPerPx;
    this.hoverNode = el(
      "rect",
      { class: "hover", x: n1(b.x - pad), y: n1(b.y - pad), width: n1(b.w + pad * 2), height: n1(b.h + pad * 2), rx: n1(4 * this.unitsPerPx) },
      this.scene.ui,
    );
  }

  itemAt(pt) {
    const tol = 6 * this.unitsPerPx;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.kind === "erase") continue;
      if (!inside(pt, this.boxOf(item), tol)) continue;
      if (this.hits(item, pt, tol)) return item;
    }
    return null;
  }

  hits(item, pt, tol) {
    const entry = this.scene.entries.get(item.id);
    if (item.kind === "piece") {
      const g = pieceGeometry(item);
      const local = pieceFromBoard(item, pt);
      if (g.knockRings?.some((ring) => pointInRing(local, ring)) && !this.erasedAt(item, pt)) return true;
      return this.pathHit(entry?.hit, local, tol, (p) => !this.erasedAt(item, pieceToBoard(item, p)));
    }
    return this.pathHit(entry?.hit, tfInverse(pt, item.t), tol / (item.t?.s ?? 1), (p) => !this.erasedAt(item, tfPoint(p, item.t)));
  }

  pathHit(path, p, tol, visible = () => true) {
    if (!path?.isPointInFill) return true;
    const k = tol * 0.7;
    const probes = [
      [0, 0],
      [tol, 0],
      [-tol, 0],
      [0, tol],
      [0, -tol],
      [k, k],
      [-k, k],
      [k, -k],
      [-k, -k],
    ];
    try {
      return probes.some(([dx, dy]) => {
        const q = { x: p.x + dx, y: p.y + dy };
        return path.isPointInFill(new DOMPoint(q.x, q.y)) && visible(q);
      });
    } catch {
      return true;
    }
  }

  insideShape(d, p) {
    this.probe ??= el("path", {}, this.scene.defs);
    this.probe.setAttribute("d", d);
    try {
      return this.probe.isPointInFill(new DOMPoint(p.x, p.y));
    } catch {
      return false;
    }
  }

  erasedAt(item, pt, items = this.items) {
    if (!item.erase?.length) return false;
    if (item.kind === "piece") {
      const q = pieceFromBoard(item, pt);
      const local = { x: q.x / (item.scale * (item.flip ? -1 : 1)), y: q.y / item.scale };
      return item.erase.some((ref) => ref?.d && this.insideShape(ref.d, local));
    }
    return item.erase.some((ref) => {
      const id = typeof ref === "string" ? ref : ref?.id;
      const eraser = id && items.find((i) => i.id === id);
      return !!eraser && this.insideShape(eraser.d, tfInverse(pt, relative(typeof ref === "string" ? null : ref.t, item.t)));
    });
  }

  erasedAway(item, items) {
    const path = this.scene.entries.get(item.id)?.hit;
    if (!path?.getTotalLength) return false;
    const length = path.getTotalLength();
    const count = clamp(Math.ceil(length / 4), 16, 240);
    const toBoard = (p) => (item.kind === "piece" ? pieceToBoard(item, p) : tfPoint(p, item.t));
    for (let i = 0; i < count; i++) {
      const p = path.getPointAtLength((length * i) / count);
      if (!this.erasedAt(item, toBoard(p), items)) return false;
    }
    return true;
  }

  updateRing(pt = this.hoverPoint) {
    const tool = this.state.tool;
    if (!pt || !["wash", "hatch", "eraser"].includes(tool) || this.handMode) return this.hideRing();
    const r = this.state.sizes[tool] / 2;
    if (!this.ring) {
      this.ring = el("g", { "aria-hidden": "true" }, this.scene.ui);
      this.ringHalo = el("circle", { class: "brush-ring-halo" }, this.ring);
      this.ringLine = el("circle", { class: "brush-ring" }, this.ring);
    }
    for (const c of [this.ringHalo, this.ringLine]) {
      c.setAttribute("cx", n1(pt.x));
      c.setAttribute("cy", n1(pt.y));
      c.setAttribute("r", n1(r));
    }
    this.ring.style.display = "";
  }

  hideRing() {
    if (this.ring) this.ring.style.display = "none";
  }

  startDraw(e, pt) {
    const tool = this.state.tool;
    const pen = PENS[tool];
    const level = pen.steady ? this.state.steady : 0;
    const steady = new Steady(level, this.unitsPerPx);
    const g = {
      type: "draw",
      pointer: e.pointerId,
      touch: e.pointerType === "touch",
      tool,
      size: this.state.sizes[tool],
      steady,
      passes: PASSES[level],
      line: [],
      start: pt,
      last: pt,
      lastT: e.timeStamp,
      speed: 0,
      pressure: 0.85,
      travel: 0,
      client: { x: e.clientX, y: e.clientY },
      still: { x: e.clientX, y: e.clientY },
      shape: null,
      seed: newSeed(),
      shift: e.shiftKey && SNAPPABLE.has(tool),
      t0: e.timeStamp,
    };
    pt.p = e.pointerType === "pen" && e.pressure > 0 ? 0.15 + e.pressure * 0.85 : 0.85;
    g.snap = this.rulerEdge(pt, g.size);
    if (g.snap) Object.assign(pt, g.snap(pt));
    const first = steady.push(pt);
    if (first) g.line.push(first);
    if (g.shift) g.shape = { type: "line", a: { x: pt.x, y: pt.y }, b: { x: pt.x, y: pt.y } };
    this.gesture = g;
    this.armHold();
    this.updateRing(pt);
    this.scheduleLive();
  }

  moveDraw(e) {
    const g = this.gesture;
    const events = e.getCoalescedEvents?.().length ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      const pt = this.point(ev);
      const dt = Math.max(1, ev.timeStamp - g.lastT);
      const v = dist(g.last, pt) / dt;
      g.speed = g.speed * 0.6 + v * 0.4;
      const target = ev.pointerType === "pen" && ev.pressure > 0 ? 0.15 + ev.pressure * 0.85 : pressureFromSpeed(g.speed);
      g.pressure = g.pressure * 0.72 + target * 0.28;
      pt.p = g.pressure;
      g.last = pt;
      g.lastT = ev.timeStamp;
      if (e.shiftKey && SNAPPABLE.has(g.tool) && !g.shape) g.shape = { type: "line", a: { x: g.start.x, y: g.start.y }, b: pt };
      if (g.shape) {
        this.adjustShape(g, pt, e.shiftKey);
        continue;
      }
      if (g.snap) Object.assign(pt, g.snap(pt));
      const s = g.steady.push(pt);
      if (s) g.line.push(s);
    }
    g.travel += Math.hypot(e.clientX - g.client.x, e.clientY - g.client.y);
    g.client = { x: e.clientX, y: e.clientY };
    if (Math.hypot(e.clientX - g.still.x, e.clientY - g.still.y) > 3) {
      g.still = { x: e.clientX, y: e.clientY };
      this.armHold();
    }
    this.updateRing(g.last);
    this.scheduleLive();
  }

  armHold() {
    clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => this.onHold(), HOLD_MS);
  }

  onHold() {
    const g = this.gesture;
    if (!g || g.type !== "draw") return;
    if (g.travel < 6) {
      const hit = this.itemAt(g.start);
      if (hit) {
        this.scene.live.replaceChildren();
        this.select([hit.id]);
        this.startMove({ pointerId: g.pointer }, g.last);
        navigator.vibrate?.(8);
      }
      return;
    }
    if (!SNAPPABLE.has(g.tool) || g.shape) return;
    const shape = recognize(g.line.length > 4 ? g.line : [g.start, g.last]);
    if (!shape) return;
    g.morphFrom = g.line.slice();
    g.morphAt = performance.now();
    g.shape = shape;
    g.base = shape;
    g.anchor = { x: g.last.x, y: g.last.y };
    g.center = centroid(shape);
    navigator.vibrate?.(8);
    this.scheduleLive();
    this.hint("snap", "Keep holding and move to resize it");
  }

  adjustShape(g, pt, shift) {
    if (g.shape.type === "line") {
      const a = g.shape.a;
      let angle = Math.atan2(pt.y - a.y, pt.x - a.x);
      const len = dist(a, pt);
      const step = Math.PI / 4;
      const snapped = Math.round(angle / step) * step;
      if (shift || Math.abs(angle - snapped) < 0.08) angle = snapped;
      g.shape = { ...g.shape, b: { x: a.x + Math.cos(angle) * len, y: a.y + Math.sin(angle) * len } };
      return;
    }
    if (!g.base) return;
    const d0 = dist(g.center, g.anchor);
    if (d0 < 1) return;
    g.shape = scaleShape(g.base, g.center, clamp(dist(g.center, pt) / d0, 0.15, 6));
  }

  scheduleLive() {
    if (this.liveFrame) return;
    this.liveFrame = requestAnimationFrame(() => {
      this.liveFrame = 0;
      this.renderLive();
    });
  }

  gesturePoints(g, final = false) {
    if (g.shape) {
      const pts = sketchShape(g.shape, g.seed);
      if (!final && g.morphFrom && g.morphFrom.length > 1) {
        const t = clamp((performance.now() - g.morphAt) / 200, 0, 1);
        if (t < 1) {
          const e = 1 - (1 - t) ** 3;
          const n = 72;
          const a = resample(g.morphFrom, Math.max(0.5, lengthOf(g.morphFrom) / n));
          const b = resample(pts, Math.max(0.5, lengthOf(pts) / n));
          const m = Math.min(a.length, b.length);
          const out = [];
          for (let i = 0; i < m; i++) {
            const ai = a[Math.round((i / (m - 1)) * (a.length - 1))];
            const bi = b[Math.round((i / (m - 1)) * (b.length - 1))];
            out.push({ x: lerp(ai.x, bi.x, e), y: lerp(ai.y, bi.y, e), p: lerp(ai.p ?? 0.7, bi.p ?? 0.7, e) });
          }
          this.scheduleLive();
          return out;
        }
      }
      return pts;
    }
    if (final) return g.line.concat(g.steady.finish(g.last));
    return g.line;
  }

  renderLive() {
    const g = this.gesture;
    const live = this.scene.live;
    if (g?.type === "figure") return live.replaceChildren(...this.figureNodes(g));
    if (g?.type === "tap" && g.action === "bubble") return live.replaceChildren(...this.bubblePreview(g));
    if (g?.type === "textpath") return live.replaceChildren(this.guideNode(g.line));
    if (!g || g.type !== "draw") return;
    const pts = this.gesturePoints(g);
    const nodes = [];
    if (!pts.length) {
      live.replaceChildren();
      return;
    }
    if (g.tool === "wash") {
      const shape = penShape("wash", pts, g.size, { passes: g.passes });
      const host = el("g", { filter: `url(#${this.prefix}wash)` });
      el("path", { d: shapePath(shape), ...paintAttrs("nonzero", this.state.washColor) }, host);
      nodes.push(host);
    } else if (g.tool === "hatch") {
      const shape = penShape("hatch", pts, g.size, { passes: g.passes });
      nodes.push(el("path", { d: shapePath(shape), fill: this.colors.ink, "fill-opacity": "0.07" }));
    } else if (g.tool === "eraser") {
      const shape = penShape("eraser", pts.length > 1 ? pts : [pts[0], { ...pts[0], x: pts[0].x + 0.5 }], g.size, { passes: 1 });
      this.scene.setLiveErase(shapePath(shape));
    } else {
      const shape =
        pts.length < 2
          ? { rings: [], dots: [{ ...pts[0], r: g.size * 0.5 }] }
          : g.tool === "brush" && !g.shape
            ? brushShape(this.state.brush, pts, g.size, { passes: g.passes, seed: g.seed })
            : penShape(g.tool, pts, g.size, { passes: g.passes });
      const color = g.tool === "pencil" ? this.colors.pencil : splitColour(this.colourFor(g.tool)).hex;
      nodes.push(el("path", { d: shapePath(shape), fill: color, "fill-opacity": this.inkAlpha(g) }));
    }
    if (g.steady.level === 2 && !g.shape && g.steady.smooth) {
      nodes.push(el("line", { class: "tether", x1: n1(g.steady.smooth.x), y1: n1(g.steady.smooth.y), x2: n1(g.last.x), y2: n1(g.last.y) }));
    }
    live.replaceChildren(...nodes);
  }

  finishDraw(g) {
    const live = this.scene.live;
    const duration = performance.now() - g.t0;
    if (g.tool === "wash" && g.travel < 5 && duration < 450 && !g.shape) {
      live.replaceChildren();
      this.fillAt(g.start);
      return;
    }
    if ((this.compact || g.touch) && TAP_SELECT.has(g.tool) && g.travel < 6 && duration < 300 && !g.shape) {
      const hit = this.itemAt(g.start);
      if (hit && !hit.place) {
        live.replaceChildren();
        this.toolBeforeTap = g.tool;
        this.setTool("hand", { keepSelection: true, silent: true });
        this.select([hit.id]);
        return;
      }
    }
    const pts = this.gesturePoints(g, true);
    const size = g.size;
    let item = null;

    if (g.tool === "eraser") {
      live.replaceChildren();
      this.scene.setLiveErase(null);
      if (!pts.length) return;
      const shape = penShape("eraser", pts.length > 1 ? pts : [pts[0], { ...pts[0], x: pts[0].x + 0.5 }], size, { passes: 1 });
      const eraser = { id: uid("e"), kind: "erase", d: shapePath(shape), box: shapeBounds(shape) };
      const next = applyEraser(
        this.items,
        eraser,
        (piece) => ({ d: toPieceLocal(piece, shape) }),
        (it) => this.boxOf(it),
      ).map((it, i) => (TYPED.has(this.items[i].kind) || this.items[i].locked ? this.items[i] : it));
      if (next.every((it, i) => it === this.items[i])) return;
      const all = [...next, eraser];
      this.commit(prune(all.filter((it, i) => it === this.items[i] || it === eraser || !this.erasedAway(it, all))));
      return;
    }

    if (g.tool === "hatch") {
      live.replaceChildren();
      const line = centerline(pts.length > 1 ? pts : [pts[0], { ...pts[0], x: pts[0].x + 0.5 }], size, g.passes);
      const tone = TONES.find((t) => t.id === this.state.tones.hatch);
      const angles = ANGLES.find((a) => a.id === this.state.angle).angles;
      const strokes = hatchLines(line, size / 2, { spacing: tone.hatch, angles, seed: g.seed });
      if (!strokes.length) return;
      const shape = mergeShapes(strokes.map((s) => penShape("nib", s, 2.6, { passes: 0 })));
      item = { id: uid("h"), kind: "hatch", d: shapePath(shape), box: shapeBounds(shape), color: this.strokeInk("hatch"), alpha: this.inkAlpha(g) };
      this.commit([...this.items, item]);
      this.reveal(item.id);
      return;
    }

    if (!pts.length) {
      live.replaceChildren();
      return;
    }
    let shape;
    if (pts.length < 2 || (g.travel < 2 && !g.shape)) {
      const r = g.tool === "wash" ? size * 0.42 : size * (g.tool === "brush" ? 0.32 : 0.55);
      shape = { rings: [], dots: [{ x: pts[0].x, y: pts[0].y, r }] };
    } else if (g.tool === "brush" && !g.shape) {
      shape = brushShape(this.state.brush, pts, size, { passes: g.passes, seed: g.seed });
    } else {
      shape = penShape(g.tool, pts, size, { passes: g.passes });
    }
    const d = shapePath(shape);
    const box = shapeBounds(shape);
    if (g.tool === "wash") {
      item = { id: uid("w"), kind: "wash", d, box, color: this.state.washColor };
    } else if (g.tool === "pencil") {
      item = { id: uid("p"), kind: "pencil", d, box };
      this.hint("pencil", "Pencil lines are only a guide. They don't show when you save");
    } else {
      item = { id: uid("s"), kind: "ink", pen: g.tool, d, box, color: this.strokeInk(g.tool), alpha: this.inkAlpha(g) };
    }
    this.commit([...this.items, item]);
    live.replaceChildren();
    if (!g.shape && SNAPPABLE.has(g.tool) && g.travel > 160) this.hint("hold", "Tip: hold at the end of a line to straighten it");
  }

  startTap(e, pt, action) {
    this.gesture = { type: "tap", action, pointer: e.pointerId, start: pt, last: pt, travel: 0, client: { x: e.clientX, y: e.clientY } };
  }

  moveTap(e) {
    const g = this.gesture;
    g.last = this.point(e);
    g.shift = e.shiftKey;
    g.alt = e.altKey;
    g.travel = Math.max(g.travel, Math.hypot(e.clientX - g.client.x, e.clientY - g.client.y));
    this.scheduleLive();
  }

  finishTap(g) {
    this.scene.live.replaceChildren();
    const hit = g.travel < 6 ? this.itemAt(g.start) : null;
    if (hit && hit.kind === g.action) return this.editType(hit);
    if (g.action === "text") return this.newText(g.start);
    if (g.action === "bubble") return this.newBubble(g);
  }

  startFigure(e, pt) {
    this.gesture = {
      type: "figure",
      pointer: e.pointerId,
      start: pt,
      last: pt,
      seed: newSeed(),
      shift: e.shiftKey,
      alt: e.altKey,
      travel: 0,
      client: { x: e.clientX, y: e.clientY },
    };
    this.scheduleLive();
  }

  figurePlan(g, final = false) {
    const s = this.state;
    const id = s.figure;
    let a = g.start;
    let b = g.last;
    if (final && g.travel < 4) {
      const open = isOpenFigure(id);
      const hw = open ? 110 : 90;
      const hh = open ? 0 : id === "rect" || id === "ellipse" || id === "cloud" ? 68 : 90;
      a = { x: g.start.x - hw, y: g.start.y - hh };
      b = { x: g.start.x + hw, y: g.start.y + hh };
    }
    const frame = frameFor(id, a, b, { shift: g.shift, alt: g.alt });
    return { id, frame, opts: { style: s.figureStyle, sides: s.sides, points: s.points, corners: s.corners, ends: s.ends, seed: g.seed, size: s.sizes.shape } };
  }

  shapeItem(plan) {
    const s = this.state;
    const r = (v) => Math.round(v * 10) / 10;
    const f = plan.frame;
    const frame = f.a ? { a: { x: r(f.a.x), y: r(f.a.y) }, b: { x: r(f.b.x), y: r(f.b.y) } } : { x: r(f.x), y: r(f.y), w: r(f.w), h: r(f.h) };
    const fill = isOpenFigure(plan.id) ? "none" : s.fill;
    return {
      kind: "shape",
      figure: plan.id,
      frame,
      ...plan.opts,
      fill,
      color: this.inkFor("shape"),
      fillColor: fill === "wash" ? s.washColor : undefined,
    };
  }

  figureNodes(g) {
    const item = this.shapeItem(this.figurePlan(g));
    const art = shapeArt(item);
    const nodes = [];
    if (art.fill && item.fill === "wash") {
      const host = el("g", { filter: `url(#${this.prefix}wash)` });
      el("path", { d: art.fill, ...paintAttrs("nonzero", item.fillColor) }, host);
      nodes.push(host);
    } else if (art.fill) nodes.push(el("path", { d: art.fill, fill: item.color || this.colors.ink }));
    nodes.push(el("path", { d: art.ink, fill: item.color || this.colors.ink }));
    return nodes;
  }

  finishFigure(g) {
    this.scene.live.replaceChildren();
    const item = this.withBox({ id: uid("s"), ...this.shapeItem(this.figurePlan(g, true)) });
    if (!shapeArt(item).ink) return;
    this.commit([...this.items, item], { select: [item.id], animate: true });
    this.setTool("hand", { keepSelection: true, silent: true });
  }

  startTextPath(e, pt) {
    const steady = new Steady(1, this.unitsPerPx);
    const first = steady.push(pt);
    this.gesture = { type: "textpath", pointer: e.pointerId, steady, line: first ? [first] : [], start: pt, last: pt };
    this.scheduleLive();
  }

  moveTextPath(e) {
    const g = this.gesture;
    const events = e.getCoalescedEvents?.().length ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      const p = this.point(ev);
      g.last = p;
      const s = g.steady.push(p);
      if (s) g.line.push(s);
    }
    this.scheduleLive();
  }

  finishTextPath(g) {
    this.scene.live.replaceChildren();
    let pts = g.line.concat(g.steady.finish(g.last));
    if (lengthOf(pts) < 40) {
      const r = this.board.w * 0.24;
      pts = [];
      for (let i = 0; i <= 32; i++) {
        const a = Math.PI * (1.18 + (0.64 * i) / 32);
        pts.push({ x: g.start.x + Math.cos(a) * r, y: g.start.y + r * 0.88 + Math.sin(a) * r });
      }
    }
    let path = centerline(pts, 8, 3).map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));
    if (path[0].x > path[path.length - 1].x) path = path.reverse();
    const item = { id: uid("t"), kind: "text", text: "", path, size: this.state.sizes.text, face: this.state.face, color: this.inkFor("text") };
    this.typeSession(this.withBox(item), { fresh: true });
  }

  guideNode(line) {
    return el("path", { class: "guide", d: ringPath(line, false) });
  }

  newText(at) {
    const item = { id: uid("t"), kind: "text", text: "", x: at.x, y: at.y, size: this.state.sizes.text, face: this.state.face, color: this.inkFor("text") };
    this.typeSession(this.withBox(item), { fresh: true });
  }

  newBubble(g) {
    const s = this.state;
    const size = s.sizes.bubble;
    const dragged = g.travel > 8;
    let center = dragged ? g.last : g.start;
    let tail = dragged ? g.start : null;
    if (!dragged) {
      const aim = this.speakerNear(g.start);
      if (aim) {
        if (aim.over) center = aim.spot;
        const d = dist(aim.mouth, center) || 1;
        tail = { x: lerp(aim.mouth.x, center.x, clamp(34 / d, 0.04, 0.3)), y: lerp(aim.mouth.y, center.y, clamp(34 / d, 0.04, 0.3)) };
      } else tail = { x: center.x - size * 2.4, y: center.y + size * 4.6 };
    }
    const item = {
      id: uid("b"),
      kind: "bubble",
      text: "",
      x: center.x,
      y: center.y,
      tail,
      style: s.bubble,
      face: s.bubbleFace,
      size,
      color: this.inkFor("bubble"),
      seed: newSeed(),
      weight: 3,
    };
    this.typeSession(this.withBox(item), { fresh: true });
  }

  speakerNear(pt) {
    let best = null;
    for (const item of this.items) {
      if (item.kind !== "piece" || item.part.type !== "person") continue;
      const mouth = mouthOf(item);
      if (!mouth) continue;
      const box = pieceGeometry(item).box;
      const over = inside(pt, box);
      const d = dist(pt, mouth);
      if (!over && d > this.board.w * 0.45) continue;
      if (!best || (over && !best.over) || (over === best.over && d < best.d)) best = { mouth, over, d, box };
    }
    if (best?.over) {
      const side = best.mouth.x > this.board.w / 2 ? -1 : 1;
      best.spot = {
        x: clamp(best.mouth.x + side * this.board.w * 0.17, this.board.w * 0.15, this.board.w * 0.85),
        y: clamp(best.box.y - this.board.h * 0.09, this.board.h * 0.13, best.mouth.y - this.board.h * 0.12),
      };
    }
    return best;
  }

  bubblePreview(g) {
    if (g.travel <= 8) return [];
    const item = {
      x: g.last.x,
      y: g.last.y,
      tail: g.start,
      style: this.state.bubble,
      face: this.state.bubbleFace,
      size: this.state.sizes.bubble,
      text: "",
      seed: 7,
      weight: 3,
    };
    const art = bubbleArt(item, this.families);
    return [el("path", { d: art.fill, fill: this.options.paper, "fill-opacity": "0.92" }), el("path", { d: art.ink, fill: this.colourFor("bubble") })];
  }

  withBox(item) {
    if (item.kind === "shape") return { ...item, box: shapeArt(item).box };
    if (item.kind === "text") return { ...item, box: textItemLayout(item, this.families).box };
    if (item.kind === "bubble") {
      const art = bubbleArt(item, this.families);
      return { ...item, box: item.tail ? union(art.box, { x: item.tail.x, y: item.tail.y, w: 0, h: 0 }) : art.box };
    }
    return item;
  }

  showType(id, visible) {
    const entry = this.scene.entries.get(id);
    for (const node of Object.values(entry?.nodes || {})) for (const t of node.querySelectorAll("[data-type]")) t.style.visibility = visible ? "" : "hidden";
  }

  editType(item) {
    if (!item || !TYPED.has(item.kind)) return;
    this.select([]);
    this.typeSession(item);
  }

  typeSession(item, { fresh = false } = {}) {
    const before = this.items;
    const base = fresh ? [...before, item] : before;
    this.history.replace(base);
    this.scene.sync(base);
    const path = !!item.path;
    const bubble = item.kind === "bubble";
    const font = fontFor(item.face, item.size, this.families);
    const mid = path ? item.path[Math.floor(item.path.length / 2)] : { x: item.x, y: item.y };
    const at = tfPoint(mid, item.t);
    const guide = () => this.scene.live.replaceChildren(this.guideNode(item.path.map((p) => tfPoint(p, item.t))));
    if (path) guide();
    else this.showType(item.id, false);
    let current = item;
    this.typing.start({
      mode: path ? "path" : bubble ? "bubble" : "text",
      item,
      font,
      color: item.color || this.colors.ink,
      text: item.text,
      maxWidth: bubble ? font.size * 10.5 : null,
      anchor: { x: at.x, y: at.y, s: item.t?.s ?? 1 },
      placeholder: path ? "Type along the line" : bubble ? "What do they say?" : "Type something",
      onInput: (text) => {
        current = this.withBox({ ...current, text });
        const items = this.items.map((i) => (i.id === item.id ? current : i));
        this.history.replace(items);
        this.scene.sync(items);
        if (path) guide();
        else this.showType(item.id, false);
      },
      onDone: (text) => {
        this.scene.live.replaceChildren();
        const kept = text.trim() ? this.withBox({ ...current, text }) : null;
        this.history.replace(before);
        this.scene.sync(before);
        this.showType(item.id, true);
        let next = null;
        if (fresh) next = kept ? [...before, kept] : null;
        else if (!kept) next = prune(before.filter((i) => i.id !== item.id));
        else if (kept.text !== item.text) next = before.map((i) => (i.id === item.id ? kept : i));
        if (next) this.commit(next, { select: kept ? [kept.id] : [], animate: fresh || !kept });
        else this.sync();
        if (kept && !next) this.select([kept.id]);
        if (kept && TYPED.has(this.state.tool)) {
          const tool = this.state.tool;
          this.setTool("hand", { keepSelection: true, silent: true });
          if (this.compact) this.toolBeforeTap = tool;
        }
      },
    });
  }

  tailHandle() {
    if (this.selection.length !== 1) return null;
    const item = this.items.find((i) => i.id === this.selection[0]);
    if (item?.kind !== "bubble" || !item.tail) return null;
    return { item, at: tfPoint(item.tail, item.t) };
  }

  startTail(e, item) {
    this.gesture = { type: "tail", pointer: e.pointerId, id: item.id, before: this.items };
    this.panel.dataset.dragging = "";
    this.float.hidden = true;
  }

  moveTail(e) {
    const g = this.gesture;
    const pt = this.point(e);
    const items = this.items.map((i) => (i.id === g.id ? this.withBox({ ...i, tail: tfInverse(pt, i.t) }) : i));
    this.history.replace(items);
    this.scene.sync(items);
    this.renderSelection();
    this.float.hidden = true;
  }

  async paintType(ctx, scale, pad) {
    const typed = this.items.filter((i) => TYPED.has(i.kind) && i.text);
    if (!typed.length) return;
    const fonts = new Set(typed.map((i) => fontFor(i.face, i.size, this.families).css));
    try {
      await Promise.all([...fonts].map((f) => document.fonts?.load?.(f, "A")));
    } catch {}
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(pad, pad);
    ctx.beginPath();
    ctx.rect(0, 0, this.board.w, this.board.h);
    ctx.clip();
    for (const item of typed) {
      ctx.save();
      if (item.t) {
        ctx.translate(item.t.x, item.t.y);
        ctx.rotate(item.t.r ?? 0);
        ctx.scale(item.t.s ?? 1, item.t.s ?? 1);
      }
      const layout = item.kind === "bubble" ? bubbleArt(item, this.families) : textItemLayout(item, this.families);
      ctx.fillStyle = item.color || this.colors.ink;
      ctx.font = layout.font.css;
      ctx.textBaseline = "alphabetic";
      if (layout.glyphs) {
        ctx.textAlign = "left";
        for (const g of layout.glyphs) {
          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.rotate(g.a);
          ctx.fillText(g.ch, 0, 0);
          ctx.restore();
        }
      } else {
        ctx.textAlign = "center";
        for (const line of layout.lines) ctx.fillText(line.text, line.x, line.y);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  reveal(id) {
    const entry = this.scene.entries.get(id);
    const node = entry && Object.values(entry.nodes)[0];
    if (node) animate(node, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: EASE });
  }

  async rasterInk() {
    const markup = this.toSvg({ sheet: false, background: false, pencils: false, washes: false, caption: false });
    const img = await svgImage(markup);
    const canvas = document.createElement("canvas");
    canvas.width = this.board.w;
    canvas.height = this.board.h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, this.board.w, this.board.h);
    return ctx.getImageData(0, 0, this.board.w, this.board.h).data;
  }

  async fillAt(pt) {
    if (this.filling) return;
    this.filling = true;
    try {
      const { w, h } = this.board;
      const alpha = await this.rasterInk();
      const region = regionAt(alpha, w, h, pt, { gap: 3, grow: 2 });
      if (!region) {
        this.toast("Tap inside a shape to fill it");
        return;
      }
      const rings = maskRings(region.mask, w, h);
      if (!rings.length) return;
      const d = rings.map((r) => ringPath(r)).join("");
      let box = null;
      for (const r of rings) box = union(box, bounds(r));
      const item = { id: uid("f"), kind: "wash", fill: true, d, box, color: this.state.washColor };
      await this.bloom(item, pt);
      this.commit([...this.items, item]);
      if (region.share > 0.6) this.toast("Filled the whole background", { action: "Undo", onAction: () => this.undo() });
    } finally {
      this.filling = false;
      this.scene.live.replaceChildren();
    }
  }

  bloom(item, pt) {
    const live = this.scene.live;
    const id = `${this.prefix}bloom`;
    const clip = el("clipPath", { id });
    const circle = el("circle", { cx: n1(pt.x), cy: n1(pt.y), r: "0" }, clip);
    const group = el("g", { filter: `url(#${this.prefix}wash)` });
    const inner = el("g", { "clip-path": `url(#${id})` }, group);
    el("path", { d: item.d, ...paintAttrs("evenodd", item.color) }, inner);
    live.replaceChildren(clip, group);
    const b = item.box;
    const far = Math.max(
      dist(pt, { x: b.x, y: b.y }),
      dist(pt, { x: b.x + b.w, y: b.y }),
      dist(pt, { x: b.x, y: b.y + b.h }),
      dist(pt, { x: b.x + b.w, y: b.y + b.h }),
    );
    const duration = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1 : clamp(280 + far * 0.6, 320, 720);
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = () => {
        const t = clamp((performance.now() - t0) / duration, 0, 1);
        circle.setAttribute("r", n1(far * (1 - (1 - t) ** 3) + 2));
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
      setTimeout(resolve, duration + 200);
    });
  }

  corners(box) {
    const pad = 6 * this.unitsPerPx;
    const x0 = box.x - pad;
    const y0 = box.y - pad;
    const x1 = box.x + box.w + pad;
    const y1 = box.y + box.h + pad;
    return [
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
    ];
  }

  expandGroups(ids) {
    const groups = new Set();
    for (const id of ids) {
      const g = this.items.find((i) => i.id === id)?.group;
      if (g) groups.add(g);
    }
    if (!groups.size) return ids;
    return [...ids, ...this.items.filter((i) => i.group && groups.has(i.group)).map((i) => i.id)];
  }

  select(ids) {
    if (!ids.length && this.toolBeforeTap && this.handMode) {
      const tool = this.toolBeforeTap;
      this.toolBeforeTap = null;
      this.setTool(tool, { silent: true });
    }
    const next = [...new Set(this.expandGroups(ids))];
    if (next.join() !== this.selection.join() && this.popovers?.current?.el.dataset.owner === "float") this.popovers.close(true);
    this.selection = next;
    if (this.hoverId && this.selection.includes(this.hoverId)) this.setHover(null);
    this.renderSelection();
    this.library?.syncSelection();
    this.refreshSelectionProps();
  }

  editableSelection() {
    if (!this.handMode || !this.selection.length || this.selectionLocked) return null;
    const items = this.selection.map((id) => this.items.find((i) => i.id === id)).filter(Boolean);
    const kind = items[0]?.kind;
    if (!items.length || !["shape", "text", "bubble"].includes(kind) || items.some((i) => i.kind !== kind)) return null;
    return { kind, items, first: items[0] };
  }

  refreshSelectionProps() {
    const sel = this.editableSelection();
    const key = sel ? `${sel.kind}:${this.selection.join()}` : "";
    if (key === this.propsKey) return;
    this.propsKey = key;
    this.dock?.renderProps();
  }

  reframe(item, id) {
    if (item.kind !== "shape" || item.figure === id) return item;
    const from = isOpenFigure(item.figure);
    const to = isOpenFigure(id);
    let frame = item.frame;
    if (from && !to) {
      const { a, b } = frame;
      let w = Math.abs(b.x - a.x);
      let hgt = Math.abs(b.y - a.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      w = Math.max(w, hgt * 0.6, 40);
      hgt = Math.max(hgt, w * 0.6);
      frame = { x: cx - w / 2, y: cy - hgt / 2, w, h: hgt };
    } else if (!from && to) frame = { a: { x: frame.x, y: frame.y + frame.h }, b: { x: frame.x + frame.w, y: frame.y } };
    return { ...item, figure: id, frame, fill: to ? "none" : item.fill };
  }

  editSelection(fn, { live = false } = {}) {
    const ids = this.editable();
    if (!ids.size) return;
    const items = this.items.map((i) => (ids.has(i.id) ? this.withBox(fn(i)) : i));
    if (live) {
      this.liveBase ??= this.items;
      this.history.replace(items);
      this.scene.sync(items);
      this.renderSelection();
      return;
    }
    if (this.liveBase) {
      this.history.replace(this.liveBase);
      this.liveBase = null;
    }
    this.commit(items);
  }

  selectionKind() {
    const items = this.selection.map((id) => this.items.find((i) => i.id === id)).filter(Boolean);
    if (!items.length) return "";
    if (items.length === 1) {
      const it = items[0];
      if (TYPED.has(it.kind) || it.kind === "shape") return it.kind;
      if (it.kind !== "piece") return it.kind === "pencil" ? "pencil" : "line";
      return it.part.type === "person" ? "person" : it.part.type === "signature" ? "signature" : "piece";
    }
    return items.every((i) => i.kind === "piece") ? "pieces" : "many";
  }

  orderable(direction) {
    if (this.selection.length !== 1) return false;
    const i = this.items.findIndex((x) => x.id === this.selected);
    if (i < 0) return false;
    const item = this.items[i];
    const box = this.boxOf(item);
    const others = direction < 0 ? this.items.slice(0, i) : this.items.slice(i + 1);
    return others.some((o) => o.kind !== "erase" && overlaps(this.boxOf(o), box));
  }

  buildFloat(kind) {
    const back = this.orderable(-1);
    const front = this.orderable(1);
    const locked = this.selectionLocked;
    const key = `${kind}|${back}|${front}|${this.compact}|${locked}`;
    if (key === this.floatKind) return;
    const rebuilt = !!this.floatKind && !this.float.hidden;
    this.floatKind = key;
    const fb = (name, label, fn, key) =>
      h("button", { type: "button", class: "icon-button", "aria-label": label, "data-tip": label, "data-key": key, html: icon(name), onclick: fn });
    const buttons = [];
    if (locked) buttons.push(fb("lock-open", "Unlock", () => this.lockSelected(false)));
    else this.floatButtons(kind, back, front, fb, buttons);
    const from = rebuilt ? this.float.offsetWidth : 0;
    this.float.replaceChildren(...buttons);
    if (!rebuilt) return;
    const to = this.float.offsetWidth;
    if (Math.abs(to - from) > 1)
      animate(this.float, [{ width: `${from}px` }, { width: `${to}px` }], { duration: SPRING.duration * 0.8, easing: SPRING.easing });
    popIn(this.float, 0);
  }

  floatButtons(kind, back, front, fb, buttons) {
    if (kind === "person")
      buttons.push(
        fb("user-pen", "Change this character", () => this.editSelected()),
        fb("shuffle", "Shuffle", () => this.shuffleSelected()),
      );
    if (TYPED.has(kind)) buttons.push(fb("pen-line", "Edit the words", () => this.editType(this.items.find((i) => i.id === this.selected))));
    if (kind === "signature") buttons.push(fb("signature", "Change your signature", () => this.dock.showSignPad()));
    if (kind !== "pencil" && kind !== "signature") {
      const b = fb("palette", "Colour", () => this.toggleColours(b));
      b.setAttribute("aria-haspopup", "dialog");
      buttons.push(b);
    }
    if (kind === "person" || kind === "piece" || kind === "pieces" || kind === "bubble")
      buttons.push(fb("flip-horizontal-2", "Flip", () => this.flipSelected()));
    if (back) buttons.push(fb("send-to-back", "Send back", () => this.orderSelected(-1)));
    if (front) buttons.push(fb("bring-to-front", "Bring forward", () => this.orderSelected(1)));
    buttons.push(
      fb("lock", "Lock", () => this.lockSelected(true)),
      fb("copy", "Duplicate", () => this.duplicateSelected(), "⌘D"),
      fb("trash-2", "Remove", () => this.deleteSelected(), "⌫"),
    );
  }

  toggleColours(anchor) {
    const items = this.selection.map((id) => this.items.find((i) => i.id === id)).filter(Boolean);
    const first = items[0];
    const lineable = items.some((i) => i.kind === "piece" || i.kind === "ink" || i.kind === "hatch" || i.kind === "shape" || TYPED.has(i.kind));
    const filled = items.find((i) => i.kind === "shape" && i.fill && i.fill !== "none");
    const piece = items.length === 1 && first.kind === "piece" ? first : null;
    const parts = piece ? this.colourParts(piece) : [];
    const shaded = items.some(
      (i) => i.kind === "wash" || (i.kind === "piece" && i.part.type !== "person" && pieceGeometry(i).washes.some((w) => !w.paper && w.tint && w.tone > 0)),
    );
    const swatches = (label, list, current, pick, tinted = true) => {
      let latest = current;
      const group = h("div", { class: "swatch-line", role: "radiogroup", "aria-label": label });
      const mark = (colour) => {
        for (const b of group.querySelectorAll("[role=radio]")) b.setAttribute("aria-checked", String(sameColour(b.dataset.colour, colour)));
      };
      for (const c of list)
        group.append(
          h(
            "button",
            {
              type: "button",
              class: "swatch",
              role: "radio",
              "data-colour": c.color,
              "aria-checked": String(sameColour(current, c.color)),
              "aria-label": c.label,
              "data-tip": c.label,
              style: { "--swatch-color": tinted ? `color-mix(in srgb, ${c.color} 55%, var(--bg-paper))` : c.color },
              onclick: () => {
                latest = c.color;
                pick(c.color);
                mark(c.color);
              },
            },
            h("span"),
          ),
        );
      group.append(
        this.customSwatch({
          title: label,
          current: () => latest,
          onInput: (colour) => pick(colour, true),
          onCommit: (colour) => {
            latest = colour;
            pick(colour);
            mark(colour);
          },
        }),
      );
      return group;
    };
    const row = (label, list, kind, current, tinted = true) =>
      h(
        "div",
        { class: "colour-row" },
        h("p", { class: "colour-label", text: label }),
        swatches(label, list, current, (c, live) => this.recolourSelected(kind, c, { live }), tinted),
      );
    const rows = [];
    const ink =
      first?.kind === "piece"
        ? first.ink || INKS[0].color
        : withAlpha(first?.color || INKS[0].color, first?.kind === "ink" || first?.kind === "hatch" ? (first.alpha ?? 1) : alphaOf(first?.color));
    if (lineable) rows.push(row("Ink", INKS, "ink", ink, false));
    if (piece?.part.type === "person" && pieceGeometry(piece).washes.some((w) => w.skin && !w.hidden))
      rows.push(row({ animal: "Fur", robot: "Paint" }[kindOf(piece.part)] || "Skin", WASHES, "skin", piece.skin || WASHES[0].color));
    if (piece && shaded && parts.length) rows.push(row(THINGS[piece.part.name]?.main || "Fill", WASHES, "wash", piece.tint || WASHES[0].color));
    for (const p of parts) {
      const list = p.id === "hair" ? [{ ...WASHES[0], label: "As drawn" }, ...WASHES.slice(1)] : WASHES;
      rows.push(row(p.label, list, `part:${p.id}`, piece.tints?.[p.id] || (p.garment && piece.tint) || WASHES[0].color));
    }
    const tinting = items.some((i) => i.kind === "piece");
    if (shaded && !parts.length)
      rows.push(
        tinting
          ? row("Fill", WASHES, "wash", (first?.kind === "piece" ? first.tint : null) || WASHES[0].color)
          : row("Fill", PAINTS, "wash", first?.color || PAINTS[0].color, false),
      );
    if (filled)
      rows.push(
        row(
          "Fill",
          filled.fill === "wash" ? PAINTS : INKS,
          "fill",
          filled.fillColor || (filled.fill === "wash" ? PAINTS[0].color : filled.color || INKS[0].color),
          false,
        ),
      );
    this.popovers.toggle(
      anchor,
      (pop) => {
        pop.dataset.owner = "float";
        rows.forEach((r, i) => popIn(r.lastElementChild, 40 + i * 24));
        return h("div", { class: "colour-rows" }, ...rows);
      },
      { label: "Colour", className: "pop-palette", avoid: () => this.selectionNode?.querySelector(".selection")?.getBoundingClientRect() },
    );
  }

  colourParts(piece) {
    const g = pieceGeometry(piece);
    const have = new Set(
      g.washes
        .filter((w) => !w.paper && !w.hidden && (w.tone > 0 || w.part === "hair"))
        .map((w) => w.part)
        .filter(Boolean),
    );
    if (g.hairShown) have.add("hair");
    const spec = piece.part;
    if (spec.type !== "person") {
      const names = THINGS[spec.name]?.parts || {};
      return Object.keys(names)
        .filter((id) => have.has(id))
        .map((id) => ({ id, label: names[id] }));
    }
    const outfit = kindOf(spec) === "robot" ? "robot" : spec.outfit;
    const label = {
      hair: "Hair",
      hat: "Hat",
      top: TOPS[outfit] || optionName("outfit", outfit),
      cape: "Cape",
      bottom: BOTTOMS[outfit] || "Trousers",
      held: optionName("holding", spec.holding),
      aid: optionName("aid", spec.aid),
      chair: "Wheelchair",
    };
    return Object.keys(label)
      .filter((id) => have.has(id))
      .map((id) => ({ id, label: label[id], garment: id === "top" || id === "bottom" || id === "cape" || id === "hat" }));
  }

  customSwatch({ title, current, onInput, onCommit }) {
    const button = h("button", { type: "button", class: "swatch swatch-custom", "aria-label": "Any colour", "data-tip": "Any colour" }, h("span"));
    button.addEventListener("click", () => {
      const pop = button.closest(".pop");
      if (!pop) return;
      let back = null;
      const view = colourPicker({ title, value: current(), onInput, onCommit, onBack: () => back() });
      back = drillIn(pop, view, () => this.popovers.place());
    });
    return button;
  }

  renderSelection() {
    this.selectionNode?.remove();
    this.selectionNode = null;
    const box = this.selectionBox();
    if (!box) {
      if (!this.float.hidden && !this.float.dataset.leaving) {
        this.float.dataset.leaving = "";
        const out = animate(
          this.float,
          [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: "translateY(6px) scale(0.94)" },
          ],
          { duration: 260, easing: EASE_IN_OUT, fill: "forwards" },
        );
        out.done.then(() => {
          out.anim.cancel();
          delete this.float.dataset.leaving;
          if (!this.selection.length) {
            this.float.hidden = true;
            this.floatKind = null;
          }
        });
      }
      return;
    }
    if (this.float.dataset.leaving) {
      delete this.float.dataset.leaving;
      this.float.getAnimations?.().forEach((a) => a.cancel());
    }
    if (!this.rect) this.rect = this.panel.getBoundingClientRect();
    const c = this.corners(box);
    const g = el("g", { "aria-hidden": "true" }, this.scene.ui);
    if (this.selection.length > 1) {
      for (const id of this.selection) {
        const item = this.items.find((i) => i.id === id);
        if (!item) continue;
        const b = this.boxOf(item);
        el("rect", { class: "selection-item", x: n1(b.x), y: n1(b.y), width: n1(b.w), height: n1(b.h) }, g);
      }
    }
    el("rect", { class: "selection", x: n1(c[0].x), y: n1(c[0].y), width: n1(c[2].x - c[0].x), height: n1(c[2].y - c[0].y), rx: n1(4 * this.unitsPerPx) }, g);
    const r = 5.5 * this.unitsPerPx;
    const locked = this.selectionLocked;
    g.toggleAttribute("data-locked", locked);
    if (!locked) for (const p of c) el("circle", { class: "handle", cx: n1(p.x), cy: n1(p.y), r: n1(r) }, g);
    const tail = this.tailHandle();
    if (tail && !locked) el("circle", { class: "handle tail-handle", cx: n1(tail.at.x), cy: n1(tail.at.y), r: n1(r * 1.15) }, g);
    this.selectionNode = g;

    this.buildFloat(this.selectionKind());
    const panel = this.panel.getBoundingClientRect();
    const host = this.root.getBoundingClientRect();
    const scale = panel.width / this.board.w;
    const left = panel.left - host.left + (box.x + box.w / 2) * scale;
    let top = panel.top - host.top + c[0].y * scale - 52;
    if (top < 8) top = panel.top - host.top + c[2].y * scale + 10;
    const show = this.float.hidden && !this.gesture;
    if (show) this.float.hidden = false;
    const half = (this.float.offsetWidth || 220) / 2;
    const edge = parseFloat(getComputedStyle(this.root).getPropertyValue("--layout-margin")) || 8;
    this.float.style.left = `${clamp(left, half + edge, host.width - half - edge)}px`;
    this.float.style.top = `${top}px`;
    if (show) {
      animate(this.float, [{ transform: "translateY(4px) scale(0.98)" }, { transform: "none" }], { duration: 220, easing: EASE_OUT });
      animate(this.float, [{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: "linear" });
    }
    if (this.popovers?.current?.el.dataset.owner === "float") this.popovers.place();
  }

  startMove(e, pt) {
    const start = new Map(this.selection.map((id) => [id, this.items.find((i) => i.id === id)]));
    this.gesture = { type: "move", pointer: e.pointerId, from: pt, start, before: this.items };
    this.panel.dataset.dragging = "";
    this.float.hidden = true;
    if (this.popovers.current?.el.dataset.owner === "float") this.popovers.close(true);
  }

  moveMove(e) {
    const g = this.gesture;
    const pt = this.point(e);
    const dx = pt.x - g.from.x;
    const dy = pt.y - g.from.y;
    const items = this.items.map((i) => {
      const s = g.start.get(i.id);
      if (!s) return i;
      return s.kind === "piece" ? { ...s, x: s.x + dx, y: s.y + dy } : { ...s, t: moveBy(s.t, dx, dy) };
    });
    this.history.replace(items);
    this.scene.sync(items);
    this.renderSelection();
    this.float.hidden = true;
  }

  toggleRuler(on = !this.ruler?.on) {
    const { w, h } = this.board;
    const width = w * 0.068;
    this.ruler ||= { x: w / 2, y: h / 2, a: 0, len: w * 0.64, width, end: width * 0.95 };
    this.ruler.on = on;
    this.dock?.rulerButton.setAttribute("aria-pressed", String(on));
    this.dock?.phone.rulerButton.setAttribute("aria-pressed", String(on));
    const node = this.rulerNode;
    if (on) {
      this.renderRuler();
      animate(this.rulerNode, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: EASE_OUT });
    } else if (node) {
      this.rulerNode = null;
      animate(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: EASE_IN_OUT, fill: "forwards" }).done.then(() => node.remove());
    }
  }

  renderRuler() {
    const r = this.ruler;
    if (!r?.on) return;
    if (!this.rulerNode) {
      const { len, width, end } = r;
      const x0 = -len / 2;
      const y0 = -width / 2;
      const g = el("g", { class: "ruler", "aria-hidden": "true" }, this.scene.ui);
      const c = width * 0.14;
      const arc = (x, y) => `A${n1(c)} ${n1(c)} 0 0 1 ${n1(x)} ${n1(y)}`;
      const body = `M${n1(x0 + c)} ${n1(y0)}H${n1(-x0 - c)}${arc(-x0, y0 + c)}V${n1(-y0 - c)}${arc(-x0 - c, -y0)}H${n1(x0 + c)}${arc(x0, -y0 - c)}V${n1(y0 + c)}${arc(x0 + c, y0)}Z`;
      const hole = width * 0.15;
      const holes = [-1, 1].map((side) => side * (len / 2 - end / 2));
      const cut = (cx) => `M${n1(cx - hole)} 0a${n1(hole)} ${n1(hole)} 0 1 0 ${n1(hole * 2)} 0a${n1(hole)} ${n1(hole)} 0 1 0 ${n1(-hole * 2)} 0Z`;
      el("path", { class: "ruler-body", d: body + holes.map(cut).join(""), "fill-rule": "evenodd" }, g);
      const grain = [0.3, 0.52, 0.74]
        .map(
          (k, i) =>
            `M${n1(x0 + end * 0.7)} ${n1(y0 + width * k + Math.sin(i * 2.1) * 1.2)}C${n1(x0 + len * 0.35)} ${n1(y0 + width * k + 2.4)} ${n1(x0 + len * 0.62)} ${n1(y0 + width * k - 2)} ${n1(-x0 - end * 0.7)} ${n1(y0 + width * k + Math.cos(i * 1.7) * 1.2)}`,
        )
        .join("");
      el("path", { class: "ruler-grain", d: grain }, g);
      const corners = [
        { x: x0, y: y0 },
        { x: -x0, y: y0 },
        { x: -x0, y: -y0 },
        { x: x0, y: -y0 },
      ];
      const outline = sketchShape({ type: "polygon", corners }, 11, { bow: 0.1, wobble: 0.3 }).map((p) => ({ ...p, p: 0.7 }));
      el("path", { class: "ruler-line", d: shapePath(penShape("fineliner", outline, 2, { passes: 1 })) }, g);
      const steps = 50;
      const step = (len - end * 2) / steps;
      const jitter = (i) => Math.sin(i * 12.9898) * 0.5;
      let ticks = "";
      for (let i = 0; i <= steps; i++) {
        const x = x0 + end + i * step;
        const k = i % 10 === 0 ? 0.36 : i % 5 === 0 ? 0.25 : 0.14;
        const t = width * k * (1 + jitter(i) * 0.12);
        ticks += `M${n1(x)} ${n1(y0 + 1)}l${n1(jitter(i + 7) * 0.8)} ${n1(t)}M${n1(x)} ${n1(-y0 - 1)}l${n1(jitter(i + 3) * 0.8)} ${n1(-t * 0.8)}`;
      }
      el("path", { class: "ruler-ticks", d: ticks }, g);
      const size = width * 0.2;
      for (let i = 0; i <= steps; i += 10)
        el(
          "text",
          { class: "ruler-number", x: n1(x0 + end + i * step), y: n1(y0 + width * 0.36 + size * 1.05), "font-size": n1(size), "text-anchor": "middle" },
          g,
        ).textContent = String(i / 10);
      holes.forEach((cx, i) => {
        const rim = sketchShape({ type: "ellipse", cx, cy: 0, rx: hole, ry: hole, rot: 0 }, i ? 5 : 9, { wobble: 0.4 }).map((p) => ({ ...p, p: 0.6 }));
        el("path", { class: "ruler-line", d: shapePath(penShape("fineliner", rim, 1.6, { passes: 1 })) }, g);
      });
      this.rulerAngle = el("text", { class: "ruler-angle", x: "0", y: n1(-y0 - width * 0.3), "font-size": n1(size * 0.95), "text-anchor": "middle" }, g);
      this.rulerNode = g;
    }
    this.rulerNode.setAttribute("transform", `translate(${n1(r.x)} ${n1(r.y)}) rotate(${((r.a * 180) / Math.PI).toFixed(2)})`);
    const deg = Math.round((((((r.a * 180) / Math.PI) % 360) + 540) % 360) - 180);
    this.rulerAngle.textContent = `${Math.abs(deg) === 180 ? 0 : deg}°`;
  }

  overRuler(e) {
    if (!this.ruler?.on) return false;
    this.rect = this.panel.getBoundingClientRect();
    const over = !!this.rulerHit(this.point(e));
    this.root.toggleAttribute("data-ruler-over", over);
    return over;
  }

  rulerLocal(pt) {
    const r = this.ruler;
    return turn({ x: pt.x - r.x, y: pt.y - r.y }, -r.a);
  }

  rulerHit(pt) {
    const r = this.ruler;
    if (!r?.on) return null;
    if (!this.bleeds && (pt.x < 0 || pt.y < 0 || pt.x > this.board.w || pt.y > this.board.h)) return null;
    const p = this.rulerLocal(pt);
    if (Math.abs(p.y) > r.width / 2 || Math.abs(p.x) > r.len / 2) return null;
    return Math.abs(p.x) > r.len / 2 - r.end ? "turn" : "move";
  }

  rulerEdge(pt, size) {
    const r = this.ruler;
    if (!r?.on) return null;
    const p = this.rulerLocal(pt);
    const reach = Math.max(18 * this.unitsPerPx, size);
    if (Math.abs(p.x) > r.len / 2 + reach || Math.abs(p.y) - r.width / 2 > reach) return null;
    const line = Math.sign(p.y || 1) * (r.width / 2 + size / 2);
    return (q) => {
      const local = this.rulerLocal(q);
      const back = turn({ x: local.x, y: line }, r.a);
      return { x: r.x + back.x, y: r.y + back.y };
    };
  }

  startRuler(e, pt, grip) {
    const r = this.ruler;
    this.gesture = { type: "ruler", pointer: e.pointerId, grip, from: pt, start: { ...r }, turn: Math.atan2(pt.y - r.y, pt.x - r.x) };
    this.panel.dataset.dragging = "";
    this.panel.dataset.hover = grip === "turn" ? turnCursor(pt, r) : "ruler";
  }

  moveRuler(e) {
    const g = this.gesture;
    const pt = this.point(e);
    const r = this.ruler;
    if (g.grip === "move") {
      r.x = g.start.x + pt.x - g.from.x;
      r.y = g.start.y + pt.y - g.from.y;
    } else {
      const step = Math.PI / 12;
      let a = g.start.a + Math.atan2(pt.y - r.y, pt.x - r.x) - g.turn;
      if (e.shiftKey) a = Math.round(a / step) * step;
      r.a = a;
      this.panel.dataset.hover = turnCursor(pt, r);
    }
    this.renderRuler();
  }

  rotateZone(box, pt) {
    const u = this.unitsPerPx;
    return !inside(pt, box, 6 * u) && this.corners(box).some((c) => dist(c, pt) < 32 * u);
  }

  startRotate(e, pt, box) {
    const center = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    const start = new Map(this.selection.map((id) => [id, this.items.find((i) => i.id === id)]));
    this.gesture = { type: "rotate", pointer: e.pointerId, center, from: Math.atan2(pt.y - center.y, pt.x - center.x), start, before: this.items };
    this.panel.dataset.dragging = "";
    this.panel.dataset.hover = turnCursor(pt, center);
    this.float.hidden = true;
  }

  moveRotate(e) {
    const g = this.gesture;
    const pt = this.point(e);
    const step = Math.PI / 12;
    let angle = Math.atan2(pt.y - g.center.y, pt.x - g.center.x) - g.from;
    if (e.shiftKey) angle = Math.round(angle / step) * step;
    this.panel.dataset.hover = turnCursor(pt, g.center);
    if (this.transformFrame) cancelAnimationFrame(this.transformFrame);
    this.transformFrame = requestAnimationFrame(() => {
      const c = g.center;
      const items = this.items.map((i) => {
        const s = g.start.get(i.id);
        if (!s) return i;
        if (s.kind !== "piece") return { ...s, t: rotateAbout(s.t, c, angle) };
        const q = turn({ x: s.x - c.x, y: s.y - c.y }, angle);
        return { ...s, x: c.x + q.x, y: c.y + q.y, rot: (s.rot || 0) + angle };
      });
      this.history.replace(items);
      this.scene.sync(items);
      this.renderSelection();
      this.float.hidden = true;
    });
  }

  startScale(e, pt, box) {
    const center = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    const start = new Map(this.selection.map((id) => [id, this.items.find((i) => i.id === id)]));
    this.gesture = { type: "scale", pointer: e.pointerId, center, d0: Math.max(4, dist(center, pt)), start, before: this.items };
    this.panel.dataset.dragging = "";
    this.float.hidden = true;
  }

  moveScale(e) {
    const g = this.gesture;
    const pt = this.point(e);
    let f = dist(g.center, pt) / g.d0;
    for (const s of g.start.values()) {
      if (s.kind === "piece") f = clamp(f, 0.12 / s.scale, 8 / s.scale);
    }
    f = clamp(f, 0.05, 20);
    if (this.transformFrame) cancelAnimationFrame(this.transformFrame);
    this.transformFrame = requestAnimationFrame(() => {
      const c = g.center;
      const items = this.items.map((i) => {
        const s = g.start.get(i.id);
        if (!s) return i;
        if (s.kind === "piece") return { ...s, scale: s.scale * f, x: c.x + (s.x - c.x) * f, y: c.y + (s.y - c.y) * f };
        return { ...s, t: scaleAbout(s.t, c, f) };
      });
      this.history.replace(items);
      this.scene.sync(items);
      this.renderSelection();
      this.float.hidden = true;
    });
  }

  finishTransform(g) {
    cancelAnimationFrame(this.transformFrame);
    requestAnimationFrame(() => {
      this.history.mark(g.before);
      this.sync();
      this.changed();
    });
  }

  startMarquee(e, pt, pressed = null) {
    this.gesture = {
      type: "marquee",
      pointer: e.pointerId,
      from: pt,
      to: pt,
      keep: e.shiftKey ? this.selection.slice() : [],
      pressed,
      client: { x: e.clientX, y: e.clientY },
      moved: false,
    };
    this.marqueeNode?.remove();
    this.marqueeNode = el("rect", { class: "marquee", x: n1(pt.x), y: n1(pt.y), width: "0", height: "0" }, this.scene.ui);
  }

  moveMarquee(e) {
    const g = this.gesture;
    if (!g.moved && Math.hypot(e.clientX - g.client.x, e.clientY - g.client.y) < 4) return;
    g.moved = true;
    g.to = this.point(e);
    const x = Math.min(g.from.x, g.to.x);
    const y = Math.min(g.from.y, g.to.y);
    const w = Math.abs(g.to.x - g.from.x);
    const hgt = Math.abs(g.to.y - g.from.y);
    this.marqueeNode.setAttribute("x", n1(x));
    this.marqueeNode.setAttribute("y", n1(y));
    this.marqueeNode.setAttribute("width", n1(w));
    this.marqueeNode.setAttribute("height", n1(hgt));
    const area = { x, y, w, h: hgt };
    const picked = this.items
      .filter((i) => {
        if (i.kind === "erase" || i.locked) return false;
        const b = this.boxOf(i);
        return i.place ? coverage(area, b, this.board) > 0.8 : overlaps(area, b);
      })
      .map((i) => i.id);
    this.select([...g.keep, ...picked]);
  }

  finishMarquee(g) {
    this.marqueeNode?.remove();
    this.marqueeNode = null;
    if (!g?.moved && g?.pressed) return this.select([g.pressed.id]);
    this.renderSelection();
  }

  isLocked(id) {
    return !!this.items.find((i) => i.id === id)?.locked;
  }

  get selectionLocked() {
    return this.selection.length > 0 && this.selection.every((id) => this.isLocked(id));
  }

  editable() {
    return new Set(this.selection.filter((id) => !this.isLocked(id)));
  }

  lockSelected(on) {
    const ids = new Set(this.selection);
    if (!ids.size) return;
    this.commit(this.items.map((i) => (ids.has(i.id) ? { ...i, locked: on || undefined } : i)));
    this.toast(on ? "Locked. Select it and tap Unlock to change it" : "Unlocked", { ms: 1800 });
  }

  updateSelected(fn, { animate = false } = {}) {
    const ids = this.editable();
    if (!ids.size) return;
    this.commit(
      this.items.map((i) => (ids.has(i.id) ? fn(i) : i)),
      { animate },
    );
  }

  flipSelected() {
    this.updateSelected(
      (p) => {
        if (p.kind === "bubble" && p.tail) return this.withBox({ ...p, tail: { x: 2 * p.x - p.tail.x, y: p.tail.y } });
        if (p.kind !== "piece") return p;
        const box = pieceGeometry(p).box;
        const cx = box.x + box.w / 2;
        return { ...p, flip: !p.flip, x: 2 * cx - p.x, rot: p.rot ? -p.rot : undefined };
      },
      { animate: true },
    );
  }

  orderSelected(direction) {
    if (this.selectionLocked) return;
    const items = this.items.slice();
    const i = items.findIndex((x) => x.id === this.selected);
    if (i < 0) return;
    const [item] = items.splice(i, 1);
    const box = this.boxOf(item);
    const touches = (other) => {
      if (other.kind === "erase") return false;
      const ob = this.boxOf(other);
      return ob && !(ob.x > box.x + box.w || ob.x + ob.w < box.x || ob.y > box.y + box.h || ob.y + ob.h < box.y);
    };
    let j;
    if (direction < 0) {
      j = i - 1;
      while (j > 0 && !touches(items[j])) j--;
      j = Math.max(0, j);
    } else {
      j = i;
      while (j < items.length && !touches(items[j])) j++;
      j = Math.min(items.length, j + 1);
    }
    items.splice(j, 0, item);
    this.commit(items);
  }

  duplicateSelected() {
    const copies = [];
    const groups = new Map();
    const regroup = (g) => {
      if (!g) return undefined;
      if (!groups.has(g)) groups.set(g, uid("g"));
      return groups.get(g);
    };
    for (const id of this.editable()) {
      const item = this.items.find((i) => i.id === id);
      if (!item) continue;
      if (item.kind === "piece") copies.push({ ...item, id: uid("p"), x: item.x + 24, y: item.y + 18, place: undefined });
      else copies.push({ ...item, id: uid(item.kind[0]), t: moveBy(item.t, 24, 18), group: regroup(item.group) });
    }
    if (copies.length) this.commit([...this.items, ...copies], { select: copies.map((c) => c.id), animate: true });
  }

  deleteSelected() {
    const ids = this.editable();
    if (!ids.size) return;
    this.selection = [];
    this.commit(prune(this.items.filter((i) => !ids.has(i.id))), { animate: true });
  }

  selectAll() {
    this.select(this.items.filter((i) => i.kind !== "erase" && !i.locked).map((i) => i.id));
  }

  shuffleSelected() {
    const piece = this.items.find((i) => i.id === this.selected);
    if (!piece || piece.locked || piece.part.type !== "person") return;
    const p = piece.part;
    const keep = { kind: kindOf(p), body: p.body, age: ageOf(p), arms: p.arms, holding: p.holding, mood: p.mood };
    if (keep.kind === "human") keep.sex = p.sex || "man";
    this.replacePart(piece.id, randomPerson(newSeed(), keep));
  }

  editSelected() {
    const piece = this.items.find((i) => i.id === this.selected);
    if (!piece || piece.locked || piece.part.type !== "person") return;
    this.library.edit(piece);
  }

  replacePart(id, part) {
    const piece = this.items.find((i) => i.id === id);
    if (!piece) return;
    const before = pieceGeometry(piece).box;
    const next = { ...piece, part: { ...part, seed: piece.part.seed ?? part.seed } };
    const plan = placement(next.part, partSize(next.part), this.board);
    const scaleNow = piece.scale / (placement(piece.part, partSize(piece.part), this.board).scale || 1);
    next.scale = plan.scale * scaleNow;
    const probe = pieceGeometry({ ...next, x: 0, y: 0 }).box;
    next.x = before.x + before.w / 2 - (probe.x + probe.w / 2);
    next.y = before.y + before.h - (probe.y + probe.h);
    next.erase = [];
    this.commit(
      this.items.map((i) => (i.id === id ? next : i)),
      { select: [id], animate: true },
    );
  }

  place(part, { at, back = false, flip = false, from = null } = {}) {
    const size = partSize(part);
    const plan = placement(part, size, this.board);
    const scale = plan.scale;
    const cx = at?.x ?? plan.x;
    const cy = at?.y ?? plan.y;
    const piece = {
      id: uid("p"),
      kind: "piece",
      part: { ...part, seed: part.seed ?? newSeed() },
      x: cx - (size.x + size.w / 2) * scale * (flip ? -1 : 1),
      y: cy - (size.y + size.h / 2) * scale,
      scale,
      flip,
      weight: part.weight ?? 3.6,
      erase: [],
    };
    const items = back || plan.back ? [piece, ...this.items] : [...this.items, piece];
    const source = from?.querySelector?.("svg[data-box]") || null;
    const select = plan.select === false ? [] : [piece.id];
    if (!source || reducedMotion()) {
      this.commit(items, { select, animate: true });
      return piece;
    }
    this.commit(items, { select: [], animate: false });
    this.fly([piece], source, () => this.select(select));
    return piece;
  }

  fly(items, svg, done, { whole = false } = {}) {
    const entries = items.map((item) => this.scene.entries.get(item.id));
    const vb = svg.viewBox.baseVal;
    const box = whole ? [vb.x, vb.y, vb.width, vb.height] : (svg.dataset.box || "").split(",").map(Number);
    const r = svg.getBoundingClientRect();
    if (entries.some((e) => !e) || box.length !== 4 || !r.width || !vb?.width) return done?.();
    const nodes = entries.flatMap((e) => Object.values(e.nodes));
    for (const n of nodes) n.style.opacity = "0";
    const knocks = items.map((item) => this.scene.defsEntries.get(this.scene.ref("k", item.id))?.group).filter(Boolean);
    for (const k of knocks) k.style.display = "none";
    const host = this.root.getBoundingClientRect();
    const k = Math.min(r.width / vb.width, r.height / vb.height);
    const ox = r.left + (r.width - vb.width * k) / 2;
    const oy = r.top + (r.height - vb.height * k) / 2;
    const src = { x: ox + (box[0] - vb.x) * k, y: oy + (box[1] - vb.y) * k, w: box[2] * k, h: box[3] * k };
    const panel = this.panel.getBoundingClientRect();
    const u = panel.width / this.board.w;
    const pb = whole ? { x: 0, y: 0, w: this.board.w, h: this.board.h } : this.boxOf(items[0]);
    const pad = whole ? 0 : 8;
    const view = { x: pb.x - pad, y: pb.y - pad, w: pb.w + pad * 2, h: pb.h + pad * 2 };
    const dst = { x: panel.left + pb.x * u, y: panel.top + pb.y * u, w: pb.w * u, h: pb.h * u };
    const s = Math.sqrt((dst.w / src.w) * (dst.h / src.h));
    const tile = svg.cloneNode(true);
    const real = el("svg", { viewBox: `${n1(view.x)} ${n1(view.y)} ${n1(view.w)} ${n1(view.h)}`, "aria-hidden": "true", focusable: "false" });
    for (const entry of entries) real.appendChild(this.scene.cutout(entry));
    const sheet = this.sheet.getBoundingClientRect();
    const edge = { x: (sheet.left - panel.left) / u, y: (sheet.top - panel.top) / u, w: sheet.width / u, h: sheet.height / u };
    const frame = (this.contained && this.scene.clipPath.getAttribute("d")) || `M${n1(edge.x)} ${n1(edge.y)}h${n1(edge.w)}v${n1(edge.h)}h${n1(-edge.w)}Z`;
    if (frame) {
      const id = `${this.prefix}fly${(this.flights = (this.flights || 0) + 1)}`;
      const clip = el("clipPath", { id, clipPathUnits: "userSpaceOnUse" });
      el("path", { d: frame }, clip);
      const inside = el("g", { "clip-path": `url(#${id})` });
      inside.append(...real.childNodes);
      real.append(clip, inside);
    }
    const backing = whole ? el("rect", { x: 0, y: 0, width: this.board.w, height: this.board.h, fill: this.options.paper }) : null;
    if (whole) {
      tile.prepend(el("rect", { x: vb.x, y: vb.y, width: vb.width, height: vb.height, fill: this.options.paper }));
      real.prepend(backing);
    }
    const from = h("div", { class: "flyer", "aria-hidden": "true" }, tile);
    const to = h("div", { class: "flyer", "aria-hidden": "true" }, real);
    Object.assign(from.style, { left: `${r.left - host.left}px`, top: `${r.top - host.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    Object.assign(to.style, {
      left: `${panel.left + view.x * u - host.left}px`,
      top: `${panel.top + view.y * u - host.top}px`,
      width: `${view.w * u}px`,
      height: `${view.h * u}px`,
    });
    this.root.append(from, to);
    const flying = new Set(items.map((i) => i.id));
    const last = Math.max(...items.map((i) => this.items.findIndex((x) => x.id === i.id)));
    const front = this.items.slice(last + 1).filter((i) => !flying.has(i.id) && i.kind !== "erase");
    let cover = null;
    const covered = [];
    if (front.length) {
      const art = el("svg", { viewBox: `0 0 ${this.board.w} ${this.board.h}`, "aria-hidden": "true" });
      let inside = art;
      if (frame) {
        const id = `${this.prefix}fly${(this.flights = (this.flights || 0) + 1)}`;
        const clip = el("clipPath", { id, clipPathUnits: "userSpaceOnUse" }, art);
        el("path", { d: frame }, clip);
        inside = el("g", { "clip-path": `url(#${id})` }, art);
      }
      for (const item of front) {
        const entry = this.scene.entries.get(item.id);
        if (!entry) continue;
        inside.appendChild(this.scene.cutout(entry));
        covered.push(...Object.values(entry.nodes));
      }
      for (const n of covered) n.style.opacity = "0";
      cover = h("div", { class: "flyer", "aria-hidden": "true" }, art);
      Object.assign(cover.style, {
        left: `${panel.left - host.left}px`,
        top: `${panel.top - host.top}px`,
        width: `${panel.width}px`,
        height: `${panel.height}px`,
      });
      this.root.append(cover);
    }
    const cx = src.x + src.w / 2 - r.left;
    const cy = src.y + src.h / 2 - r.top;
    const tx = dst.x + dst.w / 2 - (r.left + cx);
    const ty = dst.y + dst.h / 2 - (r.top + cy);
    from.style.transformOrigin = `${cx}px ${cy}px`;
    to.style.transformOrigin = "50% 50%";
    const lift = Math.min(72, Math.hypot(tx, ty) * 0.14);
    const framesFrom = [];
    const framesTo = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const sc = s ** t;
      const arc = lift * 4 * t * (1 - t);
      const swap = Math.min(1, t / 0.3);
      framesFrom.push({ transform: `translate(${tx * t}px, ${ty * t - arc}px) scale(${sc})`, opacity: 1 - swap });
      framesTo.push({ transform: `translate(${tx * (t - 1)}px, ${ty * (t - 1) - arc}px) scale(${sc / s})`, opacity: swap });
    }
    const duration = Math.max(420, Math.min(620, 340 + Math.hypot(tx, ty) * 0.35));
    const timing = { duration, easing: EASE_OUT, fill: "forwards" };
    animate(from, framesFrom, timing);
    const flight = animate(to, framesTo, timing);
    if (backing)
      animate(backing, [{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], { duration: duration * 0.9, easing: "linear", fill: "forwards" });
    flight.done.then(() => {
      for (const k of knocks) k.style.display = "";
      for (const n of [...nodes, ...covered]) n.style.opacity = "";
      from.remove();
      to.remove();
      cover?.remove();
      done?.();
    });
  }

  get currentPlace() {
    return this.items.find((i) => i.place)?.place || null;
  }

  placeScene(name, { from = null } = {}) {
    if (name && !PLACES[name]) return;
    const kept = prune(this.items.filter((i) => !i.place));
    if (!name) {
      this.commit(kept, { select: [], animate: true, leave: "fade" });
      this.library?.markPlace();
      return;
    }
    if (name === this.currentPlace) return;
    const place = PLACES[name];
    const kx = this.board.w / 1000;
    const ky = this.board.h / 800;
    const seed = newSeed();
    const pieces = place.pieces.map((p, i) => ({
      id: uid("p"),
      kind: "piece",
      place: name,
      part: { ...p.part, seed: seed + i * 7 },
      x: p.x * kx,
      y: p.y * ky,
      scale: p.scale * ky,
      flip: !!p.flip,
      weight: p.weight ?? 3.6,
      erase: [],
    }));
    const swapped = this.currentPlace;
    const source = from?.querySelector?.("svg") || null;
    const flying = !!source && !reducedMotion();
    this.commit([...pieces, ...kept], { select: [], animate: true, leave: "fade", hold: flying ? new Set(pieces.map((p) => p.id)) : null });
    if (flying) this.fly(pieces, source, null, { whole: true });
    this.library?.markPlace();
    if (swapped) this.hint("swap", "A new place replaces the old one. Undo brings it back");
  }

  onLibrary(open) {
    const lib = this.library.el;
    const motion = LIBRARY_MOTION;
    for (const a of this.libraryMotion || []) a.anim.cancel();
    this.root.toggleAttribute("data-library", open);
    if (open) {
      this.toolBeforeLibrary = this.state.tool;
      if (this.state.tool !== "hand") this.setTool("hand", { keepSelection: true });
      this.reflow(motion.open);
      this.libraryMotion = [travel(lib, this.offstage(lib), "none", motion.open)];
      return;
    }
    if (this.toolBeforeLibrary && this.toolBeforeLibrary !== "hand" && this.state.tool === "hand")
      this.setTool(this.toolBeforeLibrary, { keepSelection: true });
    this.toolBeforeLibrary = null;
    const out = travel(lib, "none", this.offstage(lib), { ...motion.close, fill: "forwards" });
    this.libraryMotion = [out];
    out.done.then(() => {
      if (!this.library.isOpen) lib.hidden = true;
      out.anim.cancel();
    });
    this.placeToast(motion.close);
    this.reflow(motion.close);
  }

  offstage(node, edge = node.dataset.mode === "sheet" ? "bottom" : "left") {
    const r = node.getBoundingClientRect();
    const host = this.root.getBoundingClientRect();
    const room = 24;
    if (edge === "left") return `translateX(${Math.round(host.left - r.right - room)}px)`;
    if (edge === "top") return `translateY(${Math.round(host.top - r.bottom - room)}px)`;
    if (edge === "right") return `translateX(${Math.round(host.right - r.left + room)}px)`;
    return `translateY(${Math.round(host.bottom - r.top + room)}px)`;
  }

  setChrome(visible) {
    if (visible === this.chrome || !this.dock) return;
    this.chrome = visible;
    this.popovers.close(true);
    const { el: dock, disc, historyBar, actionsBar, phone } = this.dock;
    for (const a of this.chromeMotion || []) a.anim.cancel();
    this.chromeMotion = [];
    const run = (node, from, to, options) => {
      const a = travel(node, from, to, options);
      this.chromeMotion.push(a);
      return a;
    };
    const settle = () => {
      for (const a of this.chromeMotion) a.anim.cancel();
      this.chromeMotion = [];
    };
    const away = { duration: 260, easing: EASE_IN, fill: "forwards" };
    const back = { duration: SPRING.duration, easing: SPRING.easing };
    this.root.toggleAttribute("data-settling", true);
    if (!visible) {
      this.library.close();
      const out = run(dock, "none", this.offstage(dock, "bottom"), away);
      for (const bar of [historyBar, actionsBar, phone.doneBar]) run(bar, "none", this.offstage(bar, "top"), away);
      run(phone.rail, "none", this.offstage(phone.rail, "bottom"), away);
      out.done.then(() => {
        if (this.chrome) return;
        settle();
        this.root.toggleAttribute("data-chrome-hidden", true);
        disc.hidden = false;
        this.reflow();
        run(disc, this.offstage(disc, "bottom"), "none", back).done.then(() => this.root.removeAttribute("data-settling"));
      });
      return;
    }
    const leaving = run(disc, "none", this.offstage(disc, "bottom"), { ...away, duration: 200 });
    this.root.toggleAttribute("data-chrome-hidden", false);
    this.reflow();
    const rising = { ...back, delay: 60, fill: "backwards" };
    const arrived = run(dock, this.offstage(dock, "bottom"), "none", rising);
    for (const bar of [historyBar, actionsBar, phone.doneBar]) run(bar, this.offstage(bar, "top"), "none", rising);
    run(phone.rail, this.offstage(phone.rail, "bottom"), "none", rising);
    leaving.done.then(() => {
      if (this.chrome) disc.hidden = true;
    });
    arrived.done.then(() => {
      if (!this.chrome) return;
      settle();
      this.root.removeAttribute("data-settling");
    });
  }

  reflow(timing = { duration: SPRING.duration * 0.8, easing: SPRING.easing }) {
    const before = this.sheet.getBoundingClientRect();
    this.layout();
    const after = this.sheet.getBoundingClientRect();
    if (
      !before.width ||
      !after.width ||
      (Math.abs(before.width - after.width) < 1 && Math.abs(before.left - after.left) < 1 && Math.abs(before.top - after.top) < 1)
    )
      return;
    const k = before.width / after.width;
    animate(
      this.sheet,
      [
        { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${k})`, transformOrigin: "0 0" },
        { transform: "none", transformOrigin: "0 0" },
      ],
      { ...timing, large: true },
    );
  }

  refreshQuotes() {
    const t = this.caption.trim();
    const quoted = !!t && this.state.quotes && !/^["“‘'«]/.test(t);
    this.captionEl.toggleAttribute("data-quoted", quoted);
    this.captionUi.quotesButton?.setAttribute("aria-pressed", String(this.state.quotes));
  }

  setCaption(text, html) {
    this.captionUi.set(html, text);
    this.caption = this.captionUi.plain();
    this.refreshQuotes();
    this.layout();
  }

  toggleQuotes() {
    this.state.quotes = !this.state.quotes;
    this.refreshQuotes();
    this.layout();
    this.changed();
  }

  pickTrace() {
    this.fileInput.click();
  }

  async setTrace(file) {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(this.board.w, this.board.h));
      const w = Math.round(this.board.w * scale);
      const hgt = Math.round(this.board.h * scale);
      const photo = drawCover(bitmap, w, hgt);
      bitmap.close?.();
      this.traceLeaving?.anim.cancel();
      this.trace = { photo, lines: null };
      this.traceImage.width = w;
      this.traceImage.height = hgt;
      this.traceImage.hidden = false;
      this.hideTrace(false);
      const fresh = this.traceBar.hidden;
      this.traceBar.hidden = false;
      this.setTraceMode(this.traceMode);
      requestAnimationFrame(() => this.traceModes.place(true));
      if (fresh) {
        animate(
          this.traceBar,
          [
            { opacity: 0, transform: "translateY(-6px) scale(0.96)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: SPRING.duration * 0.7, easing: SPRING.easing },
        );
        popIn(this.traceBar, 60);
        this.reflow();
      }
      const trace = this.trace;
      const later = window.requestIdleCallback?.bind(window) || ((fn) => setTimeout(fn, 400));
      later(() => {
        if (this.trace === trace && !trace.lines) trace.lines = inkLines(trace.photo);
      });
      this.hint("trace", "The photo is only a guide. It doesn't show when you save");
    } catch {
      this.toast("That file isn't a picture we can read");
    }
  }

  setTraceMode(mode) {
    this.traceMode = mode;
    if (!this.trace) return;
    if (mode === "lines" && !this.trace.lines) this.trace.lines = inkLines(this.trace.photo);
    const image = this.traceImage;
    const was = image.dataset.mode;
    const visible = !image.hasAttribute("data-hidden");
    if (visible && was && was !== mode) {
      const ghost = image.cloneNode();
      ghost.getContext("2d").drawImage(image, 0, 0);
      image.after(ghost);
      animate(ghost, [{ opacity: getComputedStyle(ghost).opacity }, { opacity: 0 }], { ...TRACE_FADE, fill: "forwards" }).done.then(() => ghost.remove());
    }
    const ctx = image.getContext("2d");
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.drawImage(mode === "lines" ? this.trace.lines : this.trace.photo, 0, 0);
    image.dataset.mode = mode;
    if (visible && was !== mode) animate(image, [{ opacity: 0 }, { opacity: getComputedStyle(image).opacity }], TRACE_FADE);
  }

  hideTrace(hidden) {
    const image = this.traceImage;
    const button = this.traceToggle;
    const changed = image.hasAttribute("data-hidden") !== hidden;
    const from = getComputedStyle(image).opacity;
    image.toggleAttribute("data-hidden", hidden);
    button.setAttribute("aria-pressed", String(hidden));
    const label = hidden ? "Show the photo" : "Hide the photo";
    button.setAttribute("aria-label", label);
    button.dataset.tip = label;
    if (!changed) return;
    if (!image.hidden) animate(image, [{ opacity: from }, { opacity: getComputedStyle(image).opacity }], TRACE_FADE);
    button.innerHTML = icon(hidden ? "eye" : "eye-off");
    button.dataset.still = "";
    button.addEventListener("pointerleave", () => delete button.dataset.still, { once: true });
    animate(
      button.firstElementChild,
      [
        { opacity: 0, transform: "scale(0.6)" },
        { opacity: 1, transform: "none" },
      ],
      TRACE_FADE,
    );
  }

  clearTrace() {
    if (!this.trace) return;
    this.trace = null;
    const timing = { ...TRACE_FADE, fill: "forwards" };
    animate(this.traceImage, [{ opacity: getComputedStyle(this.traceImage).opacity }, { opacity: 0 }], timing);
    const out = animate(
      this.traceBar,
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(-6px) scale(0.96)" },
      ],
      timing,
    );
    this.traceLeaving = out;
    out.done.then(() => {
      if (this.traceLeaving !== out) return;
      this.traceLeaving = null;
      for (const node of [this.traceImage, this.traceBar]) node.getAnimations().forEach((a) => a.cancel());
      if (this.trace) return;
      delete this.traceImage.dataset.mode;
      this.traceImage.hidden = true;
      this.traceBar.hidden = true;
      this.reflow();
    });
  }

  bindDrop() {
    this.root.addEventListener("dragover", (e) => {
      if ([...(e.dataTransfer?.items || [])].some((i) => i.type.startsWith("image/"))) e.preventDefault();
    });
    this.root.addEventListener("drop", (e) => {
      const file = [...(e.dataTransfer?.files || [])].find((f) => f.type.startsWith("image/"));
      if (!file || !this.options.trace) return;
      e.preventDefault();
      this.setTrace(file);
    });
    this.onPaste = (e) => {
      if (!this.options.trace || !this.engaged) return;
      if (this.isEditing(e)) return;
      const file = [...(e.clipboardData?.files || [])].find((f) => f.type.startsWith("image/"));
      if (!file) return;
      e.preventDefault();
      this.setTrace(file);
    };
    window.addEventListener("paste", this.onPaste);
  }

  buildSignPad() {
    const pad = h("div", { class: "sign-pad", role: "img", "aria-label": "Signature pad" });
    const svg = el("svg", { viewBox: "0 0 360 128", preserveAspectRatio: "none" });
    const ink = el("g", { fill: this.colors.ink }, svg);
    pad.append(svg);
    const strokes = [];
    let current = null;
    let rect = null;
    const toPad = (e) => ({ x: ((e.clientX - rect.left) / rect.width) * 360, y: ((e.clientY - rect.top) / rect.height) * 128, p: 0.8 });
    const draw = () => {
      ink.replaceChildren(
        ...strokes
          .concat(current ? [current] : [])
          .map((s) => el("path", { d: shapePath(s.length > 1 ? penShape("fineliner", s, 2.6, { passes: 2 }) : { rings: [], dots: [{ ...s[0], r: 1.4 }] }) })),
      );
    };
    pad.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      rect = pad.getBoundingClientRect();
      pad.setPointerCapture(e.pointerId);
      current = [toPad(e)];
      draw();
    });
    pad.addEventListener("pointermove", (e) => {
      if (!current) return;
      const evs = e.getCoalescedEvents?.().length ? e.getCoalescedEvents() : [e];
      for (const ev of evs) current.push(toPad(ev));
      draw();
    });
    const end = () => {
      if (!current) return;
      strokes.push(current);
      current = null;
      draw();
      use.disabled = !strokes.length;
    };
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);

    const use = h("button", {
      type: "button",
      class: "button button-primary",
      text: this.signature ? "Use this signature" : "Sign the cartoon",
      disabled: true,
      onclick: () => {
        const all = strokes.flat();
        const b = bounds(all);
        const sig = strokes.map((s) => s.map((p) => [Math.round((p.x - b.x) * 10) / 10, Math.round((p.y - b.y) * 10) / 10]));
        this.signature = sig;
        storage.set("inkling:signature", sig);
        this.popovers.close();
        const existing = this.items.find((i) => i.kind === "piece" && i.part.type === "signature");
        if (existing) {
          const box = pieceGeometry(existing).box;
          const next = { ...existing, part: { ...existing.part, strokes: sig }, erase: [] };
          const probe = pieceGeometry({ ...next, x: 0, y: 0 }).box;
          next.x = box.x + box.w - (probe.x + probe.w);
          next.y = box.y + box.h - (probe.y + probe.h);
          this.commit(
            this.items.map((i) => (i.id === existing.id ? next : i)),
            { select: [existing.id], animate: true },
          );
        } else this.sign();
      },
    });
    const clear = h("button", {
      type: "button",
      class: "button button-secondary",
      text: "Clear",
      onclick: () => {
        strokes.length = 0;
        draw();
        use.disabled = true;
      },
    });
    const cancel = h("button", { type: "button", class: "button button-secondary", text: "Cancel", onclick: () => this.popovers.close() });
    return h(
      "div",
      { class: "card", role: "dialog", "aria-label": "Your signature" },
      h("div", { class: "card-head" }, h("h2", { class: "card-title", text: this.signature ? "A new signature" : "Your signature" })),
      h("p", {
        class: "card-note",
        text: this.signature ? "Sign again. It replaces the old one here and on this device." : "Sign once and it's kept on this device for every cartoon.",
      }),
      pad,
      h("div", { class: "actions" }, clear, h("span", { style: { flex: "1" } }), cancel, use),
    );
  }

  sign() {
    if (!this.signature) return this.dock.showSignPad();
    const existing = this.items.find((i) => i.kind === "piece" && i.part.type === "signature");
    if (existing) {
      this.select([existing.id]);
      return;
    }
    this.place({ type: "signature", strokes: this.signature, weight: 2.2 });
  }

  get engaged() {
    return this.hovering || this.focused || this.pressed;
  }

  isEditing(e) {
    const t = e.composedPath?.()[0] || e.target;
    return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
  }

  bindKeys() {
    this.onKey = (e) => {
      if (e.key === "Tab") this.engagedByKeyboard = true;
      if (!this.engaged) return;
      if (this.isEditing(e)) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === "z") {
        e.preventDefault();
        e.shiftKey ? this.redo() : this.undo();
        return;
      }
      if (mod && key === "y") {
        e.preventDefault();
        this.redo();
        return;
      }
      if (mod && key === "d" && this.selection.length) {
        e.preventDefault();
        this.duplicateSelected();
        return;
      }
      if (mod && key === "\\") {
        e.preventDefault();
        this.setChrome(!this.chrome);
        return;
      }
      if (mod && key === "a" && this.handMode) {
        e.preventDefault();
        this.selectAll();
        return;
      }
      if (mod || e.altKey) return;
      if (e.key === "Escape") {
        if (this.popovers.close()) return;
        if (this.gesture) this.cancelGesture();
        else if (this.selection.length) this.select([]);
        else if (this.library.isOpen) this.library.close();
        else if (!this.chrome) this.setChrome(true);
        return;
      }
      if (this.selection.length && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        this.deleteSelected();
        return;
      }
      if (this.selection.length && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        this.updateSelected((p) => (p.kind === "piece" ? { ...p, x: p.x + dx, y: p.y + dy } : { ...p, t: moveBy(p.t, dx, dy) }));
        return;
      }
      if (!this.options.shortcuts) return;
      if (e.key === "Shift" && this.gesture?.type === "draw" && SNAPPABLE.has(this.gesture.tool) && !this.gesture.shape) {
        const g = this.gesture;
        g.shape = { type: "line", a: { x: g.start.x, y: g.start.y }, b: g.last };
        this.adjustShape(g, g.last, true);
        this.scheduleLive();
        return;
      }
      if (key === "[" || key === "]") {
        e.preventDefault();
        this.nudgeSize(key === "]" ? 1 : -1);
        return;
      }
      if (/^[0-9]$/.test(key) && this.colourFor(this.state.tool)) {
        this.setOpacity(key === "0" ? 1 : +key / 10);
        this.dock?.syncColour?.();
        return;
      }
      if (key === "v") {
        this.setTool("hand");
        return;
      }
      const pen = this.options.tools.find((id) => PENS[id].key === key);
      if (pen) {
        this.setTool(pen);
        return;
      }
      const figure = this.options.shapes && FIGURES.find((f) => f.key && f.key.toLowerCase() === key && !!f.shift === e.shiftKey);
      if (figure) {
        this.setFigure(figure.id);
        return;
      }
      if (key === "t" && this.options.text) this.setTextMode("text");
      if (key === "c" && this.options.bubbles) this.setTool("bubble");
      if (key === "i" && e.shiftKey && this.options.cast) this.library.isOpen ? this.library.close() : this.library.open();
    };
    window.addEventListener("keydown", this.onKey);
  }

  undo() {
    if (this.gesture) return;
    if (this.history.undo()) {
      this.dock?.turn(this.dock.undoButton, "-24deg");
      this.sync({ animate: true, wipe: true });
      this.propsKey = null;
      this.refreshSelectionProps();
      this.changed();
    }
  }

  redo() {
    if (this.gesture) return;
    if (this.history.redo()) {
      this.dock?.turn(this.dock.redoButton, "24deg");
      this.sync({ animate: true, wipe: true });
      this.propsKey = null;
      this.refreshSelectionProps();
      this.changed();
    }
  }

  clear() {
    this.typing?.finish();
    if (!this.items.length && !this.caption) return;
    const caption = { text: this.caption, html: this.captionUi.html() };
    this.selection = [];
    this.history.commit([]);
    this.setCaption("");
    this.clearTrace();
    this.sync({ animate: true });
    this.changed();
    this.toast("Started over", {
      action: "Undo",
      onAction: () => {
        this.undo();
        this.setCaption(caption.text, caption.html);
        this.changed();
      },
    });
  }

  fontFor(size) {
    const italic = !!this.captionUi.style.italic;
    return (piece) => `${italic ? "italic " : ""}${piece.b ? "600 " : ""}${size}px ${this.options.captionFont}`;
  }

  get hasCaption() {
    return !!this.options.caption && this.captionShown;
  }

  setCaptionShown(show, { silent = false } = {}) {
    show = !!show;
    if (show === this.captionShown) return;
    this.captionShown = show;
    if (!this.options.caption) return;
    if (!show) this.captionUi.text.blur();
    this.captionEl.hidden = !show;
    if (this.captionUi.bar && !show) this.captionUi.bar.hidden = true;
    if (silent) return this.layout();
    this.reflow();
    if (show)
      animate(
        this.captionEl,
        [
          { opacity: 0, transform: "translateY(-6px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 320, delay: 80, easing: EASE, fill: "backwards" },
      );
    this.toast(show ? "Caption on" : "Caption off", { action: "Undo", onAction: () => this.setCaptionShown(!show) });
    this.changed();
  }

  captionLinesFor() {
    if (!this.hasCaption) return [];
    const runs = quoteRuns(this.captionUi.runs(), this.state.quotes);
    if (!runs.length) return [];
    const m = sheetMetrics(this.board, 1, this.captionScale);
    return wrapRuns(runs, this.fontFor(m.fontSize), this.board.w * 0.92);
  }

  toSvg({ sheet = true, background = true, pencils = this.options.exportPencils, washes = true, caption = true, type = true } = {}) {
    this.scene.sync(this.items);
    this.scene.clearGhosts();
    const s = new XMLSerializer();
    const strip = (node) => {
      if (!type && node.querySelector?.("[data-type]")) {
        node = node.cloneNode(true);
        for (const t of node.querySelectorAll("[data-type]")) t.remove();
      }
      return s.serializeToString(node).replace(/ xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "");
    };
    const defs = [...this.scene.defs.childNodes].map(strip).join("");
    const lines = sheet && caption ? this.captionLinesFor() : [];
    return assemble({
      board: this.board,
      defs,
      wash: washes ? strip(this.scene.washRoot) : "",
      ink: strip(this.scene.ink) + strip(this.scene.frame),
      pencil: pencils ? strip(this.scene.pencil) : "",
      paper: this.options.paper,
      lines,
      font: this.options.captionFont,
      inkColor: this.colors.ink,
      prefix: this.prefix,
      background,
      sheet,
      bleed: this.bleeds,
      label: this.captionUi.style.label !== false,
      scale: this.captionScale,
      italic: !!this.captionUi.style.italic,
    });
  }

  async toPng(scale = 2) {
    const m0 = sheetMetrics(this.board, 1, this.captionScale);
    try {
      await Promise.all([
        document.fonts?.load?.(`${m0.fontSize}px ${this.options.captionFont}`, "A"),
        document.fonts?.load?.(`italic ${m0.fontSize}px ${this.options.captionFont}`, "A"),
      ]);
    } catch {}
    const lines = this.captionLinesFor();
    const m = sheetMetrics(this.board, lines.length, this.captionScale);
    const markup = this.toSvg({ caption: false, type: false }).replace(
      /viewBox="[^"]*" width="\d+" height="\d+"/,
      `viewBox="0 0 ${n1(m.sheetW)} ${n1(m.sheetH)}" width="${Math.round(m.sheetW)}" height="${Math.round(m.sheetH)}"`,
    );
    const img = await svgImage(markup);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(m.sheetW * scale);
    canvas.height = Math.round(m.sheetH * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    await this.paintType(ctx, scale, m.pad);
    if (lines.length) {
      ctx.scale(scale, scale);
      ctx.fillStyle = this.colors.ink;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const fontFor = this.fontFor(m.fontSize);
      const top = m.pad + this.board.h + m.gap;
      lines.forEach((line, i) => {
        let x = m.sheetW / 2 - line.width / 2;
        const y = top + m.lineHeight * i + m.fontSize * 1.02;
        for (const piece of line.pieces) {
          ctx.font = fontFor(piece);
          ctx.fillText(piece.text, x, y);
          if (piece.u) ctx.fillRect(x, y + m.fontSize * 0.13, ctx.measureText(piece.text.trimEnd()).width, Math.max(1, m.fontSize * 0.055));
          x += piece.w;
        }
      });
    }
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async download(name = "cartoon", format = "png", scale = 2) {
    if (format === "svg") {
      saveBlob(new Blob([this.toSvg()], { type: "image/svg+xml" }), `${name}.svg`);
      return;
    }
    const blob = await this.toPng(scale);
    if (blob) saveBlob(blob, `${name}.png`);
  }

  getDrawing() {
    return {
      version: 2,
      board: { ...this.board },
      items: this.items.map(({ shape, ...rest }) => rest),
      caption: this.caption,
      captionHtml: this.captionUi.html(),
      captionStyle: { ...this.captionUi.style },
      quotes: this.state.quotes,
      frame: this.frameMode,
      contain: this.contained,
      showCaption: this.captionShown,
    };
  }

  setDrawing(doc, { silent } = {}) {
    if (!doc || !Array.isArray(doc.items)) return;
    this.history.reset(doc.items.map((i) => (i.box || i.kind === "piece" || i.kind === "erase" ? { ...i } : this.withBox({ ...i }))));
    if (typeof doc.quotes === "boolean") this.state.quotes = doc.quotes;
    if (doc.frame || typeof doc.contain === "boolean") {
      if (doc.frame) this.frameMode = frameMode(doc.frame);
      if (typeof doc.contain === "boolean") this.contained = doc.contain;
      this.drawFrame();
    }
    this.captionUi.setStyle({ italic: false, size: "m", label: true, ...(doc.captionStyle || {}) }, { silent: true });
    this.setCaption(doc.caption || "", doc.captionHtml);
    this.setCaptionShown(doc.showCaption !== false, { silent: true });
    this.selection = [];
    this.sync();
    if (!silent) this.changed();
  }

  setOptions(next) {
    Object.assign(this.options, next);
    if ("theme" in next) this.applyTheme();
    if ("frame" in next) this.setFrame(next.frame);
  }

  destroy() {
    window.removeEventListener("keydown", this.onKey);
    document.removeEventListener("pointerdown", this.onPress, true);
    window.removeEventListener("paste", this.onPaste);
    this.themeQuery?.removeEventListener?.("change", this.themeListener);
    this.captionUi.destroy();
    this.resize.disconnect();
    this.shadow.innerHTML = "";
    if (this.host.className === "inkling") this.host.remove();
  }
}
