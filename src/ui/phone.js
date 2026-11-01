import { BUBBLES } from "../core/bubbles.js";
import { FIGURES, figureOf } from "../core/figures.js";
import { PENS } from "../core/pens.js";
import { LIBRARY_TABS, TEXT_MODES } from "../core/tools.js";
import { ART } from "./art.js";
import { dip, EASE_IN, h, popIn, segmented, SPRING, travel } from "./dom.js";
import { icon } from "./icons.js";

const GROUPS = new Set(["shape", "text", "bubble"]);

const divider = () => h("span", { class: "divider", "aria-hidden": "true" });

export class Phone {
  constructor(dock) {
    this.dock = dock;
    this.desk = dock.desk;
    this.o = dock.o;
    this.mode = "home";
    this.shown = null;
    this.pen = this.o.tools[0];
    this.content = {};
    this.buildPens();
    this.buildRail();
    this.el = h("div", { class: "mode-bar", role: "toolbar", "aria-label": "Tools", hidden: true });
    this.doneBar = h(
      "div",
      { class: "top-bar done-bar" },
      h("button", { type: "button", class: "button button-primary", text: "Done", onclick: () => this.home() }),
    );
  }

  buildPens() {
    const d = this.desk;
    this.pens = {};
    const tray = h("div", { class: "mode-pens", role: "radiogroup", "aria-label": "Pens" });
    for (const id of this.o.tools) {
      this.pens[id] = h("button", {
        type: "button",
        class: "tool",
        role: "radio",
        "aria-checked": "false",
        "aria-label": PENS[id].label,
        html: ART[id](`${this.dock.prefix}phone-${id}`),
        onclick: () => d.setTool(id),
      });
      tray.append(this.pens[id]);
    }
    this.handButton = h("button", {
      type: "button",
      class: "icon-button",
      "aria-label": "Move",
      "aria-pressed": "false",
      html: icon("hand"),
      onclick: () => d.setTool("hand"),
    });
    this.rulerButton = h("button", {
      type: "button",
      class: "tool",
      "aria-label": "Ruler",
      "aria-pressed": "false",
      html: ART.ruler(),
      onclick: () => d.toggleRuler(),
    });
    this.content.draw = [this.handButton, divider(), tray, h("div", { class: "mode-pens mode-ruler" }, this.rulerButton)];
  }

  buildRail() {
    const d = this.desk;
    const item = (name, label, onclick) => h("button", { type: "button", class: "icon-button", "aria-label": label, html: icon(name), onclick });
    this.railButtons = {};
    if (this.o.tools.length) this.railButtons.draw = item("pen-line", "Draw", () => this.enter("draw"));
    if (this.o.shapes) this.railButtons.shape = item(figureOf(d.state.figure).icon, "Shapes", () => this.enter("shape"));
    if (this.o.text) this.railButtons.text = item("type", "Text", () => this.enter("text"));
    if (this.o.bubbles) this.railButtons.bubble = item("message-circle", "Speech bubble", () => this.enter("bubble"));
    const cast = this.o.cast ? LIBRARY_TABS.map((t) => item(t.icon, t.label, () => d.library.open(t.id))) : [];
    this.moreButton = item("ellipsis", "More", () => this.dock.toggleMenu());
    this.moreButton.setAttribute("aria-haspopup", "menu");
    this.moreButton.setAttribute("aria-expanded", "false");
    this.frameButton = item("frame", "Frame", () => this.toggleFrame());
    this.frameButton.setAttribute("aria-haspopup", "menu");
    this.frameButton.setAttribute("aria-expanded", "false");
    const file = [this.frameButton, item("arrow-down-to-line", "Save as PNG", () => d.download()), this.moreButton];
    const hide = [item("eye-off", "Hide the tools", () => d.setChrome(false))];
    const groups = [Object.values(this.railButtons), cast, file, hide].filter((g) => g.length);
    this.rail = h(
      "div",
      { class: "rail", role: "toolbar", "aria-orientation": "vertical", "aria-label": "Add to the cartoon" },
      ...groups.flatMap((g, i) => (i ? [divider(), ...g] : g)),
    );
  }

  toggleFrame() {
    const menu = () => this.dock.arrowKeys(h("div", { class: "menu", role: "menu", "aria-label": "Frame" }, ...this.dock.frameRows()));
    this.desk.popovers.toggle(this.frameButton, menu, { placement: "left", align: "center", role: "menu", label: "Frame", className: "pop-menu" });
  }

  enter(mode) {
    const d = this.desk;
    const tool = mode === "draw" ? this.pen : mode;
    this.mode = mode;
    if (d.state.tool === tool) this.dock.renderProps();
    else d.setTool(tool);
  }

  home() {
    const d = this.desk;
    d.popovers.close();
    this.mode = "home";
    if (d.state.tool === "hand") this.dock.renderProps();
    else d.setTool("hand");
  }

  reset() {
    this.mode = "home";
    this.shown = null;
    this.refresh();
  }

  refresh() {
    const d = this.desk;
    const tool = d.state.tool;
    if (PENS[tool]) {
      this.pen = tool;
      this.mode = "draw";
    } else if (GROUPS.has(tool)) this.mode = tool;
    this.handButton.setAttribute("aria-pressed", String(tool === "hand"));
    for (const [id, b] of Object.entries(this.pens)) {
      b.setAttribute("aria-checked", String(id === tool));
      const c = d.colourFor(id);
      if (c && b.style.getPropertyValue("--tool-color") && b.style.getPropertyValue("--tool-color") !== c) dip(b);
      if (c) b.style.setProperty("--tool-color", c);
    }
    this.el.style.setProperty("--wash-tip", this.dock.bar.style.getPropertyValue("--wash-tip"));
    if (this.railButtons.shape) this.railButtons.shape.innerHTML = icon(figureOf(d.state.figure).icon);
    for (const b of this.content.shape?.[0].children || []) b.setAttribute("aria-checked", String(b.dataset.figure === d.state.figure));
    this.content.text?.[0].set(d.state.textMode);
    this.content.bubble?.[0].set(d.state.bubble);
    this.show();
  }

  build(mode) {
    const d = this.desk;
    if (mode === "shape") {
      const cells = FIGURES.map((f) =>
        h("button", {
          type: "button",
          class: "icon-button",
          role: "radio",
          "aria-label": f.label,
          "aria-checked": String(d.state.figure === f.id),
          "data-figure": f.id,
          html: icon(f.icon),
          onclick: () => d.setFigure(f.id),
        }),
      );
      return [h("div", { class: "figure-grid", role: "radiogroup", "aria-label": "Shape" }, ...cells)];
    }
    if (mode === "text") return [segmented(TEXT_MODES, d.state.textMode, (id) => d.setTextMode(id), { label: "Kind of text" })];
    return [segmented(BUBBLES, d.state.bubble, (id) => d.setBubbleStyle(id), { label: "Bubble" })];
  }

  show() {
    const d = this.desk;
    const mode = this.mode;
    if (mode === this.shown) return;
    const from = this.shown;
    this.shown = mode;
    const working = mode !== "home";
    if (working) {
      this.content[mode] ||= this.build(mode);
      this.el.replaceChildren(...this.content[mode]);
      this.el.dataset.tools = mode;
    }
    d.root.toggleAttribute("data-tools", working);
    this.leaving?.anim.cancel();
    this.leaving = null;
    if (from === null || !d.compact) {
      this.el.hidden = !working;
      return;
    }
    if (working && from === "home") {
      this.el.hidden = false;
      travel(this.el, d.offstage(this.el, "bottom"), "none", { duration: SPRING.duration, easing: SPRING.easing, delay: 40, fill: "backwards" });
    } else if (working) popIn(this.el, 0);
    else {
      const out = travel(this.el, "none", d.offstage(this.el, "bottom"), { duration: 240, easing: EASE_IN, fill: "forwards" });
      this.leaving = out;
      out.done.then(() => {
        if (this.leaving !== out) return;
        out.anim.cancel();
        this.leaving = null;
        this.el.hidden = true;
      });
    }
    if (!working) popIn(this.rail, 60);
    queueMicrotask(() => d.reflow());
  }

  strip(tool, sel, meta) {
    const dock = this.dock;
    const all = dock.controls(tool, sel, meta, { inline: true, stacked: true });
    const colour = all.find((p) => p.matches(".colour-button"));
    const sliders = all.filter((p) => p.matches(".slider-field") && p.dataset.kind !== "count");
    const shown = !sel && tool === "bubble" ? "Bubble" : null;
    const rest = all.filter((p) => p !== colour && !sliders.includes(p) && !p.matches(".divider, .props-note") && p.dataset.label !== shown);
    const parts = [];
    const add = (part) => {
      if (parts.length) parts.push(dock.divider());
      parts.push(part);
    };
    if (colour) add(colour);
    for (const slider of sliders) add(slider);
    if (rest.length) add(this.moreButtonFor(rest));
    return parts;
  }

  moreButtonFor(rows) {
    const d = this.desk;
    const button = this.dock.button("ellipsis", "More options", "", () =>
      d.popovers.toggle(
        button,
        (pop) => {
          pop.dataset.owner = "props";
          const row = (part) => {
            if (part.matches(".slider-field")) return part;
            const label = part.dataset.label || part.getAttribute("aria-label");
            return h("div", { class: "settings-row" }, label ? h("p", { class: "settings-label", text: label }) : null, part);
          };
          return h("div", { class: "settings" }, ...rows.map(row));
        },
        { placement: "top", align: "end", label: "More options", className: "pop-options" },
      ),
    );
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    return button;
  }
}
