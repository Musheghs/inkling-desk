import { bubbleGeometry } from "./bubbles.js";
import { shapeArt } from "./figures.js";
import { mergeShapes, n1, overlaps, ringPath, shapePath } from "./geometry.js";
import { SPRING } from "./motion.js";
import { PAINTS, penShape } from "./pens.js";
import { relative, tfBox, tfString } from "./transform.js";
import { textItemLayout } from "./type.js";

const NS = "http://www.w3.org/2000/svg";

export const el = (name, attrs = {}, parent) => {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
};

export const COLORS = { ink: "#18181b", pencil: "#6aa6e0", wash: "#34343c" };

function washFilter(id, parent) {
  const f = el("filter", { id, x: "-5%", y: "-5%", width: "110%", height: "110%", "color-interpolation-filters": "sRGB" }, parent);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.022", numOctaves: "3", seed: "4", result: "warp" }, f);
  el("feDisplacementMap", { in: "SourceGraphic", in2: "warp", scale: "6", xChannelSelector: "R", yChannelSelector: "G", result: "shape" }, f);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.55", numOctaves: "2", seed: "9", result: "grain" }, f);
  el("feColorMatrix", { in: "grain", type: "matrix", values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.42", result: "tooth" }, f);
  el("feComposite", { in: "shape", in2: "tooth", operator: "in" }, f);
  return f;
}

function pencilFilter(id, parent) {
  const f = el("filter", { id, x: "0", y: "0", width: "100%", height: "100%", "color-interpolation-filters": "sRGB" }, parent);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: "2", seed: "3", result: "grain" }, f);
  el("feColorMatrix", { in: "grain", type: "matrix", values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55", result: "tooth" }, f);
  el("feComposite", { in: "SourceGraphic", in2: "tooth", operator: "in" }, f);
  return f;
}

export function washAttrs(tone, fillRule, color = COLORS.wash) {
  return {
    fill: color,
    "fill-opacity": tone.toFixed(3),
    stroke: color,
    "stroke-opacity": (tone * 0.55).toFixed(3),
    "stroke-width": "1.4",
    "stroke-linejoin": "round",
    "fill-rule": fillRule,
  };
}

export function paintAttrs(fillRule, color = PAINTS[0].color) {
  return { fill: color, stroke: color, "stroke-width": "1.4", "stroke-linejoin": "round", "fill-rule": fillRule };
}

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const LEAVE = { erase: 340, fade: 240 };

const SPREAD = 680;

export const paperAttrs = (paper = "#fffefa") => ({ fill: paper, "fill-rule": "nonzero" });

export const washColour = (w, piece, fallback) => (w.part && piece.tints?.[w.part]) || (w.tint && piece.tint) || (w.skin && piece.skin) || fallback;
export function washTone(w, piece) {
  if (w.part === "hair" && piece.tints?.hair) return w.tone ? 0.6 : 0.42;
  if (w.part && piece.tints?.[w.part]) return Math.max(w.tone, 0.24);
  return w.tone || (w.skin && piece.skin ? 0.32 : 0);
}

export function hairArt(g, piece, wash, ink) {
  if (!g.hair) return;
  const colour = piece.tints?.hair;
  if (colour) el("path", { d: g.hair, transform: g.transform, ...washAttrs(0.85, "nonzero", colour) }, wash);
  else el("path", { d: g.hair, transform: g.transform }, ink);
}

const deg = (a) => ((a * 180) / Math.PI).toFixed(2);

export function typeNode(layout, color, parent) {
  const f = layout.font;
  const g = el(
    "g",
    {
      "data-type": "",
      fill: color,
      "font-family": f.family,
      "font-size": n1(f.size),
      "font-style": f.style === "italic" ? "italic" : null,
      "font-weight": f.weight === 400 ? null : String(f.weight),
    },
    parent,
  );
  if (layout.glyphs) {
    for (const gl of layout.glyphs) {
      const t = el("text", { x: n1(gl.x), y: n1(gl.y), transform: `rotate(${deg(gl.a)} ${n1(gl.x)} ${n1(gl.y)})` }, g);
      t.textContent = gl.ch;
    }
    return g;
  }
  const text = el("text", { "text-anchor": "middle", "xml:space": "preserve" }, g);
  for (const line of layout.lines) {
    const span = el("tspan", { x: n1(line.x), y: n1(line.y) }, text);
    span.textContent = line.text;
  }
  return g;
}

const bubbleInk = new WeakMap();

export function bubbleArt(item, families) {
  const g = bubbleGeometry(item, families);
  let ink = bubbleInk.get(g);
  if (ink == null) {
    ink = shapePath(mergeShapes(g.strokes.map((s) => penShape(g.style === "whisper" ? "fineliner" : "nib", s, item.weight ?? 3, { passes: 0 }))));
    bubbleInk.set(g, ink);
  }
  return { ...g, fill: g.fills.map((r) => ringPath(r)).join(""), ink };
}

export class Scene {
  constructor({ panel, board, prefix, geometry, colors = COLORS, paper, families }) {
    this.board = board;
    this.colors = colors;
    this.paper = paper;
    this.families = families;
    this.prefix = prefix;
    this.geometry = geometry;
    this.entries = new Map();
    this.defsEntries = new Map();
    this.trail = new Map();
    this.wipes = 0;
    this.view = `0 0 ${board.w} ${board.h}`;

    const layer = (name) => el("svg", { class: `layer layer-${name}`, viewBox: this.view, preserveAspectRatio: "none", "aria-hidden": "true" }, panel);

    this.defsSvg = el("svg", { class: "defs", width: "0", height: "0", "aria-hidden": "true", focusable: "false" }, panel);
    this.defs = el("defs", {}, this.defsSvg);
    washFilter(`${prefix}wash`, this.defs);
    pencilFilter(`${prefix}grain`, this.defs);
    this.shapes = el("g", {}, this.defs);
    this.masks = el("g", {}, this.defs);
    this.clip = el("clipPath", { id: `${prefix}frameclip`, clipPathUnits: "userSpaceOnUse" }, this.defs);
    this.clipPath = el("path", { d: "" }, this.clip);

    this.washSvg = layer("wash");
    this.washRoot = el("g", { filter: `url(#${prefix}wash)` }, this.washSvg);
    this.backdrop = el("g", {}, this.washRoot);
    this.wash = el("g", {}, this.washRoot);
    this.inkSvg = layer("ink");
    this.ink = el("g", { fill: colors.ink }, this.inkSvg);
    this.frame = el("g", { fill: colors.ink, class: "frame" }, this.inkSvg);
    this.pencilSvg = layer("pencil");
    this.pencil = el("g", { fill: colors.pencil, filter: `url(#${prefix}grain)` }, this.pencilSvg);
    this.ghosts = {
      wash: el("g", {}, this.washRoot),
      ink: el("g", { fill: colors.ink }, this.inkSvg),
      pencil: el("g", { fill: colors.pencil, filter: `url(#${prefix}grain)` }, this.pencilSvg),
    };
    this.liveSvg = layer("live");
    this.live = el("g", {}, this.liveSvg);
    this.uiSvg = layer("ui");
    this.ui = el("g", {}, this.uiSvg);
  }

  ref(kind, id) {
    return `${this.prefix}${kind}-${id}`;
  }

  boxOf(item) {
    return item.kind === "piece" ? this.geometry(item).box : tfBox(item.box, item.t);
  }

  sync(items, { animate = false, hold = null, leave = "erase", soft = false, wipe = false, paint = false } = {}) {
    this.calm = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.items = items;
    const seen = new Set();
    const knockOwners = [];
    const maskPlan = new Map();

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.kind === "erase") continue;
      const refs = [];
      for (const ref of item.erase || []) {
        if (typeof ref === "string") refs.push(["e", ref, tfString(relative(null, item.t))]);
        else if (ref.id) refs.push(["e", ref.id, tfString(relative(ref.t, item.t))]);
      }
      if (item.kind !== "pencil") {
        const box = this.boxOf(item);
        for (const owner of knockOwners) if (overlaps(owner.box, box)) refs.push(["k", owner.id, null]);
      }
      const local = item.kind === "piece" ? (item.erase || []).filter((ref) => ref && ref.d) : [];
      if (refs.length || local.length) maskPlan.set(item.id, { refs, local });
      if (item.kind === "piece") {
        const g = this.geometry(item);
        if (g.knock) knockOwners.push({ id: item.id, box: g.knockBox });
      }
    }

    this.syncDefs(items);
    this.maskBackdrop(knockOwners.map((o) => o.id));

    const order = { wash: [], ink: [], pencil: [] };
    const spreads = [];
    for (const item of items) {
      if (item.kind === "erase") continue;
      seen.add(item.id);
      let entry = this.entries.get(item.id);
      if (!entry || entry.item !== item) {
        const recoloured = animate && paint && !!entry && !this.calm;
        const before = recoloured ? this.snapshot(entry) : null;
        if (entry) {
          if (animate && !recoloured) this.ghost(entry);
          this.drop(entry, recoloured);
        }
        const fresh = !entry;
        if (fresh) this.clearTrail(item.id);
        entry = this.build(item);
        this.entries.set(item.id, entry);
        if (before) spreads.push([before, entry]);
        if (animate && !recoloured && !hold?.has(item.id)) {
          if (wipe && fresh && !this.calm) this.arrive(entry);
          else this.reveal(entry, fresh && !soft);
        }
      }
      this.applyMask(entry, maskPlan.get(item.id));
      for (const [layer, node] of Object.entries(entry.nodes)) order[layer].push(node);
    }

    for (const [id, entry] of this.entries) {
      if (!seen.has(id)) {
        const show = animate && leave !== "none";
        if (show) this.leave(entry, soft ? "fade" : leave);
        this.drop(entry, show);
        this.entries.delete(id);
      }
    }

    this.order(this.wash, order.wash);
    this.order(this.ink, order.ink);
    this.order(this.pencil, order.pencil);
    for (const [before, entry] of spreads) this.spread(before, entry);
  }

  syncDefs(items) {
    const want = new Map();
    for (const item of items) {
      if (item.kind === "erase") want.set(this.ref("e", item.id), { item, d: item.d });
      if (item.kind === "piece") {
        const g = this.geometry(item);
        if (g.knock) want.set(this.ref("k", item.id), { item, d: g.knock, transform: g.transform });
      }
    }
    for (const [id, node] of this.defsEntries) {
      if (!want.has(id)) {
        (node.group || node.node).remove();
        this.defsEntries.delete(id);
      }
    }
    for (const [id, spec] of want) {
      const have = this.defsEntries.get(id);
      if (have && have.item === spec.item) continue;
      if (have) {
        have.node.setAttribute("d", spec.d);
        if (spec.transform) have.node.setAttribute("transform", spec.transform);
        have.item = spec.item;
        continue;
      }
      if (spec.item.kind === "piece") {
        const group = el("g", { id }, this.shapes);
        const inner = el("g", {}, group);
        if (this.liveMask) inner.setAttribute("mask", `url(#${this.ref("m", "live")})`);
        const node = el("path", { d: spec.d, transform: spec.transform, "fill-rule": "nonzero" }, inner);
        this.defsEntries.set(id, { node, group, inner, item: spec.item });
        continue;
      }
      const node = el("path", { id, d: spec.d, transform: spec.transform, "fill-rule": "nonzero" }, this.shapes);
      this.defsEntries.set(id, { node, item: spec.item });
    }
  }

  applyMask(entry, plan) {
    const key = plan
      ? plan.refs.map((r) => r.join(":")).join(",") + "|" + plan.local.length + (plan.local.length ? `|${this.geometry(entry.item).localTransform}` : "")
      : "";
    if (key === entry.maskKey) return;
    entry.maskKey = key;
    entry.mask?.remove();
    entry.mask = null;
    if (!plan) {
      for (const node of Object.values(entry.nodes)) node.removeAttribute("mask");
      this.maskKnock(entry.item, null);
      return;
    }
    const { w, h } = this.board;
    const id = this.ref("m", entry.item.id);
    const mask = el("mask", { id, maskUnits: "userSpaceOnUse", x: n1(-w), y: n1(-h), width: n1(w * 3), height: n1(h * 3) }, this.masks);
    el("rect", { x: n1(-w), y: n1(-h), width: n1(w * 3), height: n1(h * 3), fill: "#fff" }, mask);
    for (const [kind, ref, transform] of plan.refs) el("use", { href: `#${this.ref(kind, ref)}`, fill: "#000", transform }, mask);
    if (plan.local.length) {
      const g = this.geometry(entry.item);
      for (const local of plan.local) el("path", { d: local.d, fill: "#000", transform: g.localTransform }, mask);
    }
    entry.mask = mask;
    for (const node of Object.values(entry.nodes)) node.setAttribute("mask", `url(#${id})`);
    this.maskKnock(entry.item, plan.local.length ? id : null);
  }

  maskKnock(item, maskId) {
    if (item.kind !== "piece") return;
    const def = this.defsEntries.get(this.ref("k", item.id));
    if (!def?.group) return;
    if (maskId) def.group.setAttribute("mask", `url(#${maskId})`);
    else def.group.removeAttribute("mask");
  }

  setLiveErase(d) {
    const id = this.ref("m", "live");
    const knocks = [...this.defsEntries.values()].map((entry) => entry.inner).filter(Boolean);
    if (!d) {
      this.liveMask?.remove();
      this.liveMask = null;
      for (const g of [this.wash, this.ink, this.pencil, ...knocks]) g.removeAttribute("mask");
      return;
    }
    if (!this.liveMask) {
      const { w, h } = this.board;
      this.liveMask = el("mask", { id, maskUnits: "userSpaceOnUse", x: n1(-w), y: n1(-h), width: n1(w * 3), height: n1(h * 3) }, this.masks);
      el("rect", { x: n1(-w), y: n1(-h), width: n1(w * 3), height: n1(h * 3), fill: "#fff" }, this.liveMask);
      this.livePath = el("path", { fill: "#000" }, this.liveMask);
      for (const g of [this.wash, this.ink, this.pencil, ...knocks]) g.setAttribute("mask", `url(#${id})`);
    }
    this.livePath.setAttribute("d", d);
  }

  washPaint(item) {
    const rule = item.fill ? "evenodd" : "nonzero";
    return item.tone == null ? paintAttrs(rule, item.color) : washAttrs(item.tone, rule, item.color || this.colors.wash);
  }

  build(item) {
    const nodes = {};
    const transform = tfString(item.t);
    const wrap = (layer) => {
      nodes[layer] = el("g", { "data-id": item.id });
      return transform ? el("g", { transform }, nodes[layer]) : nodes[layer];
    };
    let hit = null;
    if (item.kind === "ink" || item.kind === "hatch") hit = el("path", { d: item.d, fill: item.color, "fill-opacity": item.alpha }, wrap("ink"));
    else if (item.kind === "shape") {
      const art = shapeArt(item);
      let fill = null;
      if (art.fill && item.fill === "wash")
        fill = el(
          "path",
          { d: art.fill, ...(item.tone == null ? paintAttrs("nonzero", item.fillColor) : washAttrs(item.tone, "nonzero", item.fillColor || this.colors.wash)) },
          wrap("wash"),
        );
      const ink = wrap("ink");
      if (art.fill && item.fill === "solid") fill = el("path", { d: art.fill, fill: item.fillColor || item.color || this.colors.ink }, ink);
      const line = el("path", { d: art.ink, fill: item.color || this.colors.ink }, ink);
      hit = fill || line;
    } else if (item.kind === "text") hit = typeNode(textItemLayout(item, this.families), item.color || this.colors.ink, wrap("ink"));
    else if (item.kind === "bubble") {
      const art = bubbleArt(item, this.families);
      const host = wrap("ink");
      hit = el("path", { d: art.fill, ...paperAttrs(this.paper) }, host);
      el("path", { d: art.ink, fill: item.color || this.colors.ink }, host);
      typeNode(art, item.color || this.colors.ink, host);
    } else if (item.kind === "pencil") hit = el("path", { d: item.d }, wrap("pencil"));
    else if (item.kind === "wash") hit = el("path", { d: item.d, ...this.washPaint(item) }, wrap("wash"));
    else if (item.kind === "piece") {
      const g = this.geometry(item);
      const host = g.washes.length || (g.hair && item.tints?.hair) ? wrap("wash") : null;
      for (const w of g.washes)
        el(
          "path",
          {
            d: w.d,
            transform: g.transform,
            ...(w.paper ? paperAttrs(this.paper) : washAttrs(washTone(w, item), "nonzero", washColour(w, item, this.colors.wash))),
          },
          host,
        );
      const ink = wrap("ink");
      if (item.ink) ink.setAttribute("fill", item.ink);
      if (g.solid) el("path", { d: g.solid, transform: g.transform, "fill-rule": "evenodd" }, ink);
      hairArt(g, item, host, ink);
      hit = el("path", { d: g.ink, transform: g.transform }, ink);
      if (g.chalk) el("path", { d: g.chalk, transform: g.transform, fill: this.paper || "#fffefa", "fill-opacity": "0.82" }, ink);
    }
    return { item, nodes, hit, mask: null, maskKey: "" };
  }

  maskBackdrop(ids) {
    const key = ids.slice().sort().join(",");
    if (key === this.backdropKey) return;
    this.backdropKey = key;
    this.backdropMask?.remove();
    this.backdropMask = null;
    if (!ids.length) {
      this.backdrop.removeAttribute("mask");
      return;
    }
    const { w, h } = this.board;
    const id = this.ref("m", "backdrop");
    const mask = el("mask", { id, maskUnits: "userSpaceOnUse", x: n1(-w), y: n1(-h), width: n1(w * 3), height: n1(h * 3) }, this.masks);
    el("rect", { x: n1(-w), y: n1(-h), width: n1(w * 3), height: n1(h * 3), fill: "#fff" }, mask);
    for (const ref of ids) el("use", { href: `#${this.ref("k", ref)}`, fill: "#000" }, mask);
    this.backdropMask = mask;
    this.backdrop.setAttribute("mask", `url(#${id})`);
  }

  setBackdrop(d, tone = 0.1) {
    this.backdrop.replaceChildren();
    if (d) el("path", { d, ...washAttrs(tone, "nonzero", this.colors.wash), "stroke-opacity": (tone * 0.4).toFixed(3) }, this.backdrop);
  }

  drop(entry, linger = false) {
    for (const node of Object.values(entry.nodes)) node.remove();
    const mask = entry.mask;
    if (!mask) return;
    if (linger) setTimeout(() => mask.remove(), 760);
    else mask.remove();
  }

  ghost(entry) {
    for (const [layer, node] of Object.entries(entry.nodes)) {
      const clone = node.cloneNode(true);
      this.ghosts[layer].append(clone);
      const anim = clone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: EASE, fill: "forwards" });
      const done = () => clone.remove();
      anim.onfinish = done;
      anim.oncancel = done;
      setTimeout(done, 600);
    }
  }

  snapshot(entry) {
    const copy = {};
    for (const layer of ["wash", "ink"]) {
      const node = entry.nodes[layer]?.cloneNode(true);
      if (!node) continue;
      node.style.opacity = "";
      copy[layer] = node;
    }
    return copy;
  }

  spread(before, entry) {
    const [shown, hidden] = this.spreadMasks(this.boxOf(entry.item));
    const added = [];
    const nodes = [];
    for (const layer of ["wash", "ink"]) {
      const node = entry.nodes[layer];
      if (!node) continue;
      const fresh = el("g", { mask: `url(#${shown})` });
      const copy = node.cloneNode(true);
      copy.style.opacity = "";
      fresh.appendChild(copy);
      node.after(fresh);
      added.push(fresh);
      if (before[layer]) {
        const old = el("g", { mask: `url(#${hidden})` });
        old.appendChild(before[layer]);
        fresh.after(old);
        added.push(old);
      }
      node.style.opacity = "0";
      nodes.push(node);
    }
    setTimeout(() => {
      for (const n of added) n.remove();
      for (const node of nodes) node.style.opacity = "";
    }, SPREAD + 40);
  }

  spreadMasks(box) {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const reach = Math.hypot(box.w, box.h) * 0.62 + 24;
    const phase = Math.random() * Math.PI * 2;
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = 1 + 0.09 * Math.sin(3 * a + phase) + 0.05 * Math.sin(7 * a - phase * 1.7);
      pts.push(`${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`);
    }
    const d = `M${pts.join("L")}Z`;
    const id = this.ref("spread", String(++this.wipes));
    const soften = el("filter", { id: `${id}-soft`, x: "-50%", y: "-50%", width: "200%", height: "200%" }, this.masks);
    el("feGaussianBlur", { stdDeviation: "0.07" }, soften);
    const area = { x: n1(box.x - reach), y: n1(box.y - reach), width: n1(box.w + reach * 2), height: n1(box.h + reach * 2) };
    const masks = [];
    for (const [suffix, back, blot] of [
      ["in", "#000", "#fff"],
      ["out", "#fff", "#000"],
    ]) {
      const mask = el("mask", { id: `${id}-${suffix}`, maskUnits: "userSpaceOnUse", ...area }, this.masks);
      el("rect", { ...area, fill: back }, mask);
      const blob = el("path", { d, fill: blot, filter: `url(#${id}-soft)`, style: "transform-origin: 0 0; transform-box: view-box" }, mask);
      blob.animate(
        [{ transform: `translate(${n1(cx)}px, ${n1(cy)}px) scale(0.02)` }, { transform: `translate(${n1(cx)}px, ${n1(cy)}px) scale(${n1(reach)})` }],
        { duration: SPREAD, easing: "cubic-bezier(0.3, 0.1, 0.25, 1)", fill: "forwards" },
      );
      masks.push(mask);
    }
    setTimeout(() => {
      for (const mask of masks) mask.remove();
      soften.remove();
    }, SPREAD + 500);
    return masks.map((m) => m.id);
  }

  cutout(entry) {
    const item = entry.item;
    const g = el("g", entry.mask ? { mask: `url(#${entry.mask.id})` } : {});
    if (item.kind === "piece") {
      const geo = this.geometry(item);
      if (geo.knock) el("path", { d: geo.knock, transform: geo.transform, fill: this.paper || "#fffefa" }, g);
    }
    const strip = (node) => {
      const copy = node.cloneNode(true);
      copy.removeAttribute("mask");
      copy.style.opacity = "";
      return copy;
    };
    if (entry.nodes.wash) el("g", { filter: `url(#${this.prefix}wash)` }, g).appendChild(strip(entry.nodes.wash));
    if (entry.nodes.ink) g.appendChild(strip(entry.nodes.ink));
    return g;
  }

  clearTrail(id) {
    for (const node of this.trail.get(id) || []) node.remove();
    this.trail.delete(id);
  }

  leave(entry, leave) {
    const style = this.calm || leave !== "erase" ? "fade" : "erase";
    const id = entry.item.id;
    const box = this.boxOf(entry.item);
    const holder = el("g", {}, this.ghosts.ink);
    holder.appendChild(this.cutout(entry));
    const extra = entry.nodes.pencil ? entry.nodes.pencil.cloneNode(true) : null;
    if (extra) this.ghosts.pencil.append(extra);
    const ms = LEAVE[style] || LEAVE.fade;
    holder.style.transformBox = "view-box";
    holder.style.transformOrigin = `${n1(box.x + box.w / 2)}px ${n1(box.y + box.h / 2)}px`;
    let anim;
    if (style === "erase") {
      holder.setAttribute("mask", `url(#${this.wipe(box, ms)})`);
      anim = holder.animate([{ opacity: 1 }, { opacity: 1 }], { duration: ms, fill: "forwards" });
    } else anim = holder.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: "linear", fill: "forwards" });
    extra?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: Math.min(ms, 240), easing: "linear", fill: "forwards" });
    const list = this.trail.get(id) || [];
    list.push(holder);
    if (extra) list.push(extra);
    this.trail.set(id, list);
    const done = () => {
      holder.remove();
      extra?.remove();
      const left = (this.trail.get(id) || []).filter((n) => n !== holder && n !== extra);
      if (left.length) this.trail.set(id, left);
      else this.trail.delete(id);
    };
    anim.onfinish = done;
    anim.oncancel = done;
    setTimeout(done, ms + 400);
  }

  arrive(entry) {
    const ms = LEAVE.erase;
    const holder = el("g", { mask: `url(#${this.wipe(this.boxOf(entry.item), ms, true)})` }, this.ghosts.ink);
    holder.appendChild(this.cutout(entry));
    const nodes = [entry.nodes.wash, entry.nodes.ink].filter(Boolean);
    for (const node of nodes) node.style.opacity = "0";
    entry.nodes.pencil?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: EASE });
    setTimeout(() => {
      holder.remove();
      for (const node of nodes) node.style.opacity = "";
    }, ms + 40);
  }

  wipe(box, ms, reveal = false) {
    const [gone, shown] = reveal ? ["#fff", "#000"] : ["#000", "#fff"];
    const id = this.ref("wipe", String(++this.wipes));
    const m = 24;
    const x = box.x - m;
    const y = box.y - m;
    const w = box.w + m * 2;
    const h = box.h + m * 2;
    const band = Math.max(40, Math.min(160, w * 0.35));
    const mask = el("mask", { id, maskUnits: "userSpaceOnUse", x: n1(x - band), y: n1(y), width: n1(w + band * 2), height: n1(h) }, this.masks);
    const grad = el("linearGradient", { id: `${id}-edge` }, mask);
    el("stop", { offset: "0", "stop-color": gone }, grad);
    el("stop", { offset: "1", "stop-color": shown }, grad);
    const sweep = el("g", {}, mask);
    el("rect", { x: n1(x - w - band), y: n1(y), width: n1(w), height: n1(h), fill: gone }, sweep);
    el("rect", { x: n1(x - band), y: n1(y), width: n1(band + 0.5), height: n1(h), fill: `url(#${id}-edge)` }, sweep);
    el("rect", { x: n1(x), y: n1(y), width: n1(w), height: n1(h), fill: shown }, sweep);
    sweep.animate([{ transform: "translateX(0px)" }, { transform: `translateX(${n1(w + band)}px)` }], {
      duration: ms,
      easing: "cubic-bezier(0.45, 0, 0.55, 1)",
      fill: "forwards",
    });
    setTimeout(() => mask.remove(), ms + 500);
    return id;
  }

  reveal(entry, fresh = false) {
    for (const node of Object.values(entry.nodes)) {
      node.style.transformBox = "fill-box";
      node.style.transformOrigin = "50% 60%";
      if (fresh) {
        node.animate([{ transform: "scale(0.95)" }, { transform: "none" }], {
          duration: this.calm ? 220 : SPRING.duration * 0.8,
          easing: this.calm ? EASE : SPRING.easing,
        });
        node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "linear" });
      } else node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE });
    }
  }

  clearGhosts() {
    for (const g of Object.values(this.ghosts)) g.replaceChildren();
    this.trail.clear();
  }

  order(parent, nodes) {
    let cursor = parent.firstChild;
    for (const node of nodes) {
      if (node === cursor) {
        cursor = cursor.nextSibling;
        continue;
      }
      parent.insertBefore(node, cursor);
    }
    while (cursor) {
      const next = cursor.nextSibling;
      cursor.remove();
      cursor = next;
    }
  }

  setFrame(d) {
    this.frame.replaceChildren();
    if (d) el("path", { d }, this.frame);
  }

  setClip(d) {
    this.clipPath.setAttribute("d", d || "");
    const url = `url(#${this.prefix}frameclip)`;
    for (const g of [this.washRoot, this.ink, this.pencil, this.live, this.ghosts.ink, this.ghosts.pencil]) {
      if (d) g.setAttribute("clip-path", url);
      else g.removeAttribute("clip-path");
    }
  }
}
