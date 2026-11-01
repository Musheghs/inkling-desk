import { SPRING } from "../core/motion.js";

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (k === "style" && typeof v === "object")
      for (const [prop, val] of Object.entries(v)) prop.startsWith("--") ? node.style.setProperty(prop, val) : (node.style[prop] = val);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const child of children.flat()) if (child != null && child !== false) node.append(child);
  return node;
}

export const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_IN = "cubic-bezier(0.5, 0, 0.75, 0)";
export const EASE_IN_OUT = "cubic-bezier(0.45, 0, 0.55, 1)";

export const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export { LIFT, SPRING, spring } from "../core/motion.js";

export function morph(pop, change) {
  const from = { width: `${pop.offsetWidth}px`, height: `${pop.offsetHeight}px`, left: pop.style.left, top: pop.style.top };
  change();
  if (reducedMotion()) return;
  const to = { width: `${pop.offsetWidth}px`, height: `${pop.offsetHeight}px`, left: pop.style.left, top: pop.style.top };
  pop.style.overflow = "hidden";
  animate(pop, [from, to], { duration: SPRING.duration * 0.8, easing: SPRING.easing }).done.then(() => (pop.style.overflow = ""));
}

const MOVES = new Set(["transform", "translate", "scale", "rotate", "clipPath", "width", "height"]);

export function animate(node, frames, options) {
  if (reducedMotion()) {
    if (options.large) frames = frames.map((frame) => Object.fromEntries(Object.entries(frame).filter(([key]) => !MOVES.has(key))));
    const fades = frames.some((frame) => Object.keys(frame).some((key) => key !== "offset" && key !== "easing"));
    options = { ...options, easing: EASE, duration: fades ? Math.min(options.duration || 0, 220) : 1, delay: Math.min(options.delay || 0, 60) };
  }
  const { large, ...timing } = options;
  options = timing;
  const anim = node.animate(frames, { fill: "none", ...options });
  return {
    anim,
    done: new Promise((resolve) => {
      const timer = setTimeout(resolve, (options.duration || 0) + (options.delay || 0) + 60);
      anim.onfinish = () => {
        clearTimeout(timer);
        resolve();
      };
      anim.oncancel = () => {
        clearTimeout(timer);
        resolve();
      };
    }),
  };
}

export function popIn(group, delay = 40) {
  [...group.children].forEach((n, i) =>
    animate(
      n,
      [
        { transform: "scale(0.4)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: SPRING.duration * 0.7, delay: delay + i * 18, easing: SPRING.easing, fill: "backwards" },
    ),
  );
}

export function dip(tool) {
  if (reducedMotion()) return;
  tool
    .querySelector(".tool-art")
    ?.animate([{ transform: "none" }, { transform: "translateY(7px)", offset: 0.4 }, { transform: "none" }], { duration: 420, easing: EASE });
}

export function travel(node, from, to, options) {
  if (reducedMotion())
    return animate(node, [{ opacity: from === "none" ? 1 : 0 }, { opacity: to === "none" ? 1 : 0 }], { ...options, duration: 200, delay: 0, easing: "linear" });
  return animate(node, [{ transform: from }, { transform: to }], options);
}

export function segmented(options, value, onPick, { label, icons } = {}) {
  const group = h("div", { class: "tabs", role: "radiogroup", "aria-label": label });
  const thumb = h("span", { class: "tabs-indicator", "aria-hidden": "true" });
  group.append(thumb);
  const buttons = options.map((o) =>
    h("button", {
      type: "button",
      role: "radio",
      "aria-checked": String(o.id === value),
      "aria-label": icons ? o.label : null,
      "data-tip": icons ? o.label : null,
      "data-icon": icons ? "" : null,
      tabindex: o.id === value ? "0" : "-1",
      html: icons ? o.icon : null,
      text: icons ? null : o.label,
      onclick: () => pick(o.id),
    }),
  );
  group.append(...buttons);

  const place = (instant) => {
    const index = options.findIndex((o) => o.id === value);
    const b = buttons[index];
    if (!b) return;
    if (instant) thumb.style.transition = "none";
    thumb.style.width = `${b.offsetWidth}px`;
    thumb.style.translate = `${b.offsetLeft}px 0`;
    if (instant) {
      void thumb.offsetWidth;
      thumb.style.transition = "";
    }
  };

  const pick = (id) => {
    value = id;
    buttons.forEach((b, i) => {
      const on = options[i].id === id;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    place(false);
    onPick(id);
  };

  group.addEventListener("keydown", (e) => {
    const index = options.findIndex((o) => o.id === value);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % options.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
    if (next < 0) return;
    e.preventDefault();
    pick(options[next].id);
    buttons[next].focus();
  });

  group.place = place;
  group.set = (id) => {
    if (id === value) return;
    value = id;
    buttons.forEach((b, i) => {
      const on = options[i].id === id;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    place(!group.isConnected);
  };
  new ResizeObserver(() => group.offsetWidth && place(true)).observe(group);
  return group;
}

export function chips(options, value, onPick, { label } = {}) {
  const row = h("div", { class: "chips", role: "tablist", "aria-label": label });
  const track = h("div", { class: "chips-track" });
  const pill = h("span", { class: "chips-indicator", "aria-hidden": "true" });
  const buttons = options.map((o) =>
    h("button", {
      type: "button",
      class: "chip",
      role: "tab",
      "aria-selected": String(o.id === value),
      text: o.label,
      onclick: () => {
        row.set(o.id);
        onPick(o.id);
      },
    }),
  );
  track.append(pill, ...buttons);
  row.append(track);

  const fades = () => {
    const max = row.scrollWidth - row.clientWidth;
    row.toggleAttribute("data-fade-start", row.scrollLeft > 2);
    row.toggleAttribute("data-fade-end", row.scrollLeft < max - 2);
  };
  const place = (instant) => {
    const b = buttons[options.findIndex((o) => o.id === value)];
    pill.toggleAttribute("data-off", !b);
    if (!b) return;
    if (instant) pill.style.transition = "none";
    pill.style.width = `${b.offsetWidth}px`;
    pill.style.translate = `${b.offsetLeft}px 0`;
    if (instant) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  };
  const center = (smooth) => {
    const b = buttons[options.findIndex((o) => o.id === value)];
    if (!b || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: b.offsetLeft + b.offsetWidth / 2 - row.clientWidth / 2, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  };

  row.addEventListener("scroll", fades, { passive: true });
  row.addEventListener(
    "wheel",
    (e) => {
      if (row.scrollWidth <= row.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    },
    { passive: false },
  );
  row.addEventListener("keydown", (e) => {
    const i = options.findIndex((o) => o.id === value);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
    if (next < 0 || next >= options.length || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    e.preventDefault();
    buttons[next].click();
    buttons[next].focus();
  });

  row.set = (id, { smooth = true } = {}) => {
    if (id === value) return;
    value = id;
    buttons.forEach((b, i) => {
      const on = options[i].id === id;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    place(!row.isConnected);
    center(smooth);
  };
  row.refresh = () => {
    place(true);
    center(false);
    fades();
  };
  buttons.forEach((b, i) => (b.tabIndex = options[i].id === value ? 0 : -1));
  new ResizeObserver(() => row.offsetWidth && row.refresh()).observe(row);
  return row;
}
