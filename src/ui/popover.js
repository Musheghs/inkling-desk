import { animate, EASE_IN_OUT, h, SPRING } from "./dom.js";

const GAP = 8;
const EDGE = 8;

export class Popovers {
  constructor(desk) {
    this.desk = desk;
    this.current = null;
    this.dismissedAt = -1;
    desk.root.addEventListener(
      "pointerdown",
      (e) => {
        const c = this.current;
        if (!c) return;
        const path = e.composedPath();
        if (path.includes(c.el) || (c.anchor && path.includes(c.anchor))) return;
        this.dismissedAt = e.timeStamp;
        this.close();
      },
      true,
    );
  }

  get open() {
    return !!this.current;
  }

  isOpen(anchor) {
    return this.current?.anchor === anchor;
  }

  toggle(anchor, build, options) {
    if (this.isOpen(anchor)) return this.close();
    this.show(anchor, build, options);
  }

  show(anchor, build, { placement = "top", align = "center", label, role = "dialog", onClose, className = "", anchorFor = null, avoid = null } = {}) {
    this.close(true);
    const el = h("div", { class: `pop ${className}`.trim(), role, "aria-label": label, "data-placement": placement });
    const content = build(el);
    if (content) el.append(...[].concat(content));
    this.desk.root.append(el);
    anchor?.setAttribute("aria-expanded", "true");
    this.current = { el, anchor, placement, align, onClose, anchorFor, avoid };
    this.place();
    const a = (anchorFor || anchor || this.desk.dock.bar).getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const ox = Math.min(r.width, Math.max(0, a.left + a.width / 2 - r.left));
    const oy = Math.min(r.height, Math.max(0, a.top + a.height / 2 - r.top));
    el.style.transformOrigin = `${Math.round(ox)}px ${Math.round(oy)}px`;
    animate(el, [{ transform: "scale(0.6)" }, { transform: "none" }], { duration: SPRING.duration * 0.85, easing: SPRING.easing });
    animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "linear" });
    if (this.desk.engagedByKeyboard) requestAnimationFrame(() => el.querySelector("[aria-checked=true], [role=menuitem], button, input")?.focus());
    return el;
  }

  place() {
    const c = this.current;
    if (!c) return;
    const host = this.desk.root.getBoundingClientRect();
    const a = (c.anchorFor || c.anchor || this.desk.dock.bar).getBoundingClientRect();
    const w = c.el.offsetWidth;
    const hgt = c.el.offsetHeight;
    const keep = c.avoid?.();
    if (keep && keep.width) return this.beside(c, host, a, keep, w, hgt);
    if (c.placement === "left") {
      const top = c.align === "start" ? a.top - host.top : c.align === "end" ? a.bottom - host.top - hgt : a.top - host.top + a.height / 2 - hgt / 2;
      const bar = (c.anchor?.closest("[role=toolbar]") || c.anchor).getBoundingClientRect();
      c.el.style.left = `${Math.max(EDGE, bar.left - host.left - w - GAP)}px`;
      c.el.style.top = `${Math.min(host.height - hgt - EDGE, Math.max(EDGE, top))}px`;
      return;
    }
    let left = c.align === "start" ? a.left - host.left : c.align === "end" ? a.right - host.left - w : a.left - host.left + a.width / 2 - w / 2;
    left = Math.min(host.width - w - EDGE, Math.max(EDGE, left));
    let top = c.placement === "bottom" ? a.bottom - host.top + GAP : a.top - host.top - hgt - GAP;
    const bar = this.desk.dock?.props;
    if (c.placement === "top" && bar && !bar.hidden && !bar.hasAttribute("data-empty")) {
      const r = bar.getBoundingClientRect();
      const barTop = this.desk.dock.el.offsetTop + bar.offsetTop;
      if (r.width && left < r.right - host.left && left + w > r.left - host.left) top = Math.min(top, barTop - hgt - GAP);
    }
    if (c.placement === "top" && top < EDGE) top = a.bottom - host.top + GAP;
    c.el.style.left = `${left}px`;
    c.el.style.top = `${Math.max(EDGE, top)}px`;
  }

  beside(c, host, a, keep, w, hgt) {
    const local = (r) => ({ left: r.left - host.left, top: r.top - host.top, right: r.right - host.left, bottom: r.bottom - host.top });
    const sel = local(keep);
    const bar = local(a);
    const blocks = [sel, ...this.obstacles().map(local)];
    const fit = (left, top) => ({ left: Math.min(host.width - w - EDGE, Math.max(EDGE, left)), top: Math.min(host.height - hgt - EDGE, Math.max(EDGE, top)) });
    const float = this.desk.float && !this.desk.float.hidden ? local(this.desk.float.getBoundingClientRect()) : bar;
    const zone = { left: Math.min(sel.left, float.left), right: Math.max(sel.right, float.right), top: Math.min(sel.top, float.top) };
    const spots = [
      fit(zone.right + GAP, zone.top),
      fit(zone.left - GAP - w, zone.top),
      fit((bar.left + bar.right) / 2 - w / 2, bar.top - GAP - hgt),
      fit((sel.left + sel.right) / 2 - w / 2, sel.bottom + GAP * 2),
    ];
    const overlap = (p, r) =>
      Math.max(0, Math.min(p.left + w, r.right) - Math.max(p.left, r.left)) * Math.max(0, Math.min(p.top + hgt, r.bottom) - Math.max(p.top, r.top));
    const cost = (p) => blocks.reduce((sum, r, i) => sum + overlap(p, r) * (i ? 1 : 4), 0);
    const best = spots.find((p) => cost(p) === 0) || spots.reduce((m, p) => (cost(p) < cost(m) ? p : m));
    c.el.style.left = `${best.left}px`;
    c.el.style.top = `${best.top}px`;
  }

  obstacles() {
    const d = this.desk;
    const list = [
      d.float,
      d.dock?.bar,
      d.dock?.phone.el,
      d.dock?.phone.rail,
      d.dock?.historyBar,
      d.dock?.actionsBar,
      d.dock?.props,
      d.library?.isOpen ? d.library.el : null,
    ];
    return list.filter((n) => n && !n.hidden && n.offsetWidth).map((n) => n.getBoundingClientRect());
  }

  close(instant = false) {
    const c = this.current;
    if (!c) return false;
    this.current = null;
    c.anchor?.setAttribute("aria-expanded", "false");
    c.onClose?.();
    if (instant) c.el.remove();
    else {
      const out = animate(
        c.el,
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "scale(0.88)" },
        ],
        { duration: 360, easing: EASE_IN_OUT, fill: "forwards" },
      );
      out.done.then(() => c.el.remove());
    }
    if (c.anchor && this.desk.shadow.activeElement && c.el.contains(this.desk.shadow.activeElement)) c.anchor.focus();
    return true;
  }
}
