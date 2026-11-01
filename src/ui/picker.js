import { splitColour, withAlpha } from "../core/colour.js";
import { animate, EASE_OUT, h, morph, reducedMotion } from "./dom.js";
import { icon } from "./icons.js";

const unit = (v) => Math.min(1, Math.max(0, v));

const FORMATS = [
  { id: "hex", label: "Hex" },
  {
    id: "rgb",
    label: "RGB",
    fields: [
      ["Red", 255],
      ["Green", 255],
      ["Blue", 255],
    ],
  },
  {
    id: "hsl",
    label: "HSL",
    fields: [
      ["Hue", 360],
      ["Saturation", 100],
      ["Lightness", 100],
    ],
  },
  {
    id: "hsb",
    label: "HSB",
    fields: [
      ["Hue", 360],
      ["Saturation", 100],
      ["Brightness", 100],
    ],
  },
];
let lastFormat = "hex";

const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const fromRgb = (r, g, b) =>
  `#${[r, g, b]
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  };
  return fromRgb(f(0), f(8), f(4));
}

function hexToHsl(hex) {
  const [r, g, b] = toRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return [hexToHsv(hex)[0], s, l];
}

function hexToHsv(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  const r = (n >> 16) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let hue = 0;
  if (d) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return [hue, max ? d / max : 0, max];
}

function hsvToHex(hue, sat, val) {
  const f = (n) => {
    const k = (n + hue / 60) % 6;
    return Math.round((val - val * sat * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return `#${[f(5), f(3), f(1)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function colourPicker({ title, value, onInput, onCommit, onBack }) {
  const start = splitColour(value);
  let [hue, sat, val] = hexToHsv(start.hex);
  let alpha = start.alpha;
  const svThumb = h("span", { class: "picker-thumb" });
  const hueThumb = h("span", { class: "picker-thumb" });
  const alphaThumb = h("span", { class: "picker-thumb" });
  const sv = h("div", { class: "picker-sv", role: "slider", tabindex: "0", "aria-label": "Shade" }, svThumb);
  const hues = h("div", { class: "picker-hue", role: "slider", tabindex: "0", "aria-label": "Hue", "aria-valuemin": "0", "aria-valuemax": "360" }, hueThumb);
  const alphas = h(
    "div",
    { class: "picker-alpha", role: "slider", tabindex: "0", "aria-label": "Opacity", "aria-valuemin": "0", "aria-valuemax": "100" },
    alphaThumb,
  );
  const preview = h("span", { class: "picker-preview" });
  const percent = h("input", {
    class: "picker-percent",
    "aria-label": "Opacity",
    inputmode: "numeric",
    maxlength: "3",
    spellcheck: "false",
    autocomplete: "off",
  });
  const hex = h("input", { class: "picker-hex", "aria-label": "Hex colour", maxlength: "9", spellcheck: "false", autocomplete: "off" });
  const fields = h("div", { class: "picker-fields" });
  let nums = [];
  const values = (colour) => {
    if (lastFormat === "rgb") return toRgb(colour);
    if (lastFormat === "hsl") {
      const [hh, ss, ll] = hexToHsl(colour);
      return [Math.round(hh), Math.round(ss * 100), Math.round(ll * 100)];
    }
    return [Math.round(hue), Math.round(sat * 100), Math.round(val * 100)];
  };
  const paintFields = (colour) => {
    const focused = fields.getRootNode().activeElement;
    if (lastFormat === "hex") {
      if (focused !== hex) hex.value = colour.slice(1).toUpperCase();
      return;
    }
    values(colour).forEach((v, i) => {
      if (focused !== nums[i]) nums[i].value = String(v);
    });
  };
  const paint = () => {
    const colour = hsvToHex(hue, sat, val);
    const result = withAlpha(colour, alpha);
    sv.style.setProperty("--hue", String(Math.round(hue)));
    svThumb.style.left = `${sat * 100}%`;
    svThumb.style.top = `${(1 - val) * 100}%`;
    svThumb.style.background = colour;
    hueThumb.style.left = `${(hue / 360) * 100}%`;
    hueThumb.style.background = `hsl(${Math.round(hue)} 100% 50%)`;
    alphas.style.setProperty("--picker-colour", colour);
    alphaThumb.style.left = `${alpha * 100}%`;
    alphaThumb.style.setProperty("--swatch-color", result);
    preview.style.setProperty("--swatch-color", result);
    sv.setAttribute("aria-valuetext", `${Math.round(sat * 100)}% saturation, ${Math.round(val * 100)}% brightness`);
    hues.setAttribute("aria-valuenow", String(Math.round(hue)));
    alphas.setAttribute("aria-valuenow", String(Math.round(alpha * 100)));
    if (percent.getRootNode().activeElement !== percent) percent.value = String(Math.round(alpha * 100));
    paintFields(colour);
    return result;
  };
  const drag = (el, move) => {
    el.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      e.preventDefault();
      el.focus({ preventScroll: true });
      el.setPointerCapture(e.pointerId);
      const at = (ev) => {
        const r = el.getBoundingClientRect();
        move(unit((ev.clientX - r.left) / r.width), unit((ev.clientY - r.top) / r.height));
        onInput(paint());
      };
      const up = () => {
        el.removeEventListener("pointermove", at);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        onCommit(paint());
      };
      at(e);
      el.addEventListener("pointermove", at);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    });
  };
  drag(sv, (x, y) => {
    sat = x;
    val = 1 - y;
  });
  drag(hues, (x) => {
    hue = x * 359.9;
  });
  drag(alphas, (x) => {
    alpha = Math.round(x * 100) / 100;
  });
  const keys = (el, step) =>
    el.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!d) return;
      e.preventDefault();
      step(d[0] * (e.shiftKey ? 10 : 1), d[1] * (e.shiftKey ? 10 : 1));
      onCommit(paint());
    });
  keys(sv, (dx, dy) => {
    sat = unit(sat + dx / 100);
    val = unit(val + dy / 100);
  });
  keys(hues, (dx, dy) => {
    hue = (hue + dx + dy + 360) % 360;
  });
  keys(alphas, (dx, dy) => {
    alpha = unit(Math.round(alpha * 100 + dx + dy) / 100);
  });
  percent.addEventListener("input", () => {
    const digits = percent.value.replace(/[^0-9]/g, "");
    percent.value = digits && Number(digits) > 100 ? "100" : digits;
  });
  const takePercent = () => {
    const v = parseInt(percent.value, 10);
    if (Number.isFinite(v)) alpha = unit(v / 100);
    onCommit(paint());
  };
  percent.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      takePercent();
      percent.select();
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      percent.blur();
      paint();
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      alpha = unit(Math.round(alpha * 100 + (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1)) / 100);
      onCommit(paint());
      percent.value = String(Math.round(alpha * 100));
    }
  });
  percent.addEventListener("change", takePercent);
  percent.addEventListener("blur", () => paint());
  const take = () => {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex.value.trim());
    if (!m) return paint();
    const full = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    const parts = splitColour(`#${full}`);
    if (full.length === 8) alpha = parts.alpha;
    [hue, sat, val] = hexToHsv(parts.hex);
    hex.blur();
    onCommit(paint());
  };
  hex.addEventListener("keydown", (e) => {
    if (e.key === "Enter") take();
    if (e.key === "Escape") {
      e.stopPropagation();
      hex.blur();
      paint();
    }
  });
  hex.addEventListener("blur", () => paint());
  hex.addEventListener("change", take);
  const hexField = h("label", { class: "picker-field" }, h("span", { text: "#" }), hex);
  const takeNums = () => {
    const [a, b, c] = nums.map((n) => parseFloat(n.value));
    if ([a, b, c].some((v) => !Number.isFinite(v))) return paint();
    const pct = (v) => unit(v / 100);
    if (lastFormat === "rgb") [hue, sat, val] = hexToHsv(fromRgb(a, b, c));
    else if (lastFormat === "hsl") {
      const keep = hue;
      [hue, sat, val] = hexToHsv(hslToHex(((a % 360) + 360) % 360, pct(b), pct(c)));
      if (!sat || !val) hue = keep;
    } else [hue, sat, val] = [((a % 360) + 360) % 360, pct(b), pct(c)];
    onCommit(paint());
  };
  const build = () => {
    const f = FORMATS.find((x) => x.id === lastFormat) || FORMATS[0];
    if (!f.fields) {
      nums = [];
      fields.replaceChildren(hexField);
      return;
    }
    nums = f.fields.map(([name, max]) => {
      const n = h("input", { class: "picker-num", "aria-label": name, "data-tip": name, inputmode: "numeric", spellcheck: "false", autocomplete: "off" });
      n.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          takeNums();
          n.select();
        }
        if (e.key === "Escape") {
          e.stopPropagation();
          n.blur();
          paint();
        }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const v = (parseFloat(n.value) || 0) + (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1);
          n.value = String(Math.min(max, Math.max(0, v)));
          takeNums();
        }
      });
      n.addEventListener("change", takeNums);
      n.addEventListener("blur", () => paint());
      return n;
    });
    fields.replaceChildren(...nums);
  };
  const formatLabel = h("span", { text: "" });
  const formatButton = h(
    "button",
    {
      type: "button",
      class: "picker-format",
      "aria-haspopup": "listbox",
      "aria-expanded": "false",
      "aria-label": "Colour format",
      "data-tip": "Colour format",
    },
    formatLabel,
    h("span", { class: "picker-format-chevron", html: icon("chevron-down") }),
  );
  const list = h("div", { class: "picker-formats", role: "listbox", "aria-label": "Colour format", hidden: true });
  const showList = (open) => {
    list.hidden = !open;
    formatButton.setAttribute("aria-expanded", String(open));
    if (open && !reducedMotion())
      animate(
        list,
        [
          { opacity: 0, transform: "translateY(4px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 180, easing: EASE_OUT },
      );
  };
  const setFormat = (id) => {
    lastFormat = id;
    formatLabel.textContent = FORMATS.find((x) => x.id === id).label;
    for (const o of list.children) o.setAttribute("aria-selected", String(o.dataset.id === id));
    build();
    paint();
  };
  for (const f of FORMATS)
    list.append(
      h("button", {
        type: "button",
        class: "picker-option",
        role: "option",
        "data-id": f.id,
        text: f.label,
        onclick: () => {
          setFormat(f.id);
          showList(false);
          formatButton.focus();
        },
      }),
    );
  formatButton.addEventListener("click", () => showList(list.hidden));
  const row = h(
    "div",
    { class: "picker-row" },
    h("div", { class: "picker-pick" }, formatButton, list),
    fields,
    h("label", { class: "picker-field picker-opacity" }, percent, h("span", { text: "%" })),
  );
  let lead = preview;
  if (typeof window !== "undefined" && "EyeDropper" in window) {
    lead = h("button", {
      type: "button",
      class: "icon-button",
      "aria-label": "Pick a colour from the screen",
      "data-tip": "Pick from the screen",
      html: icon("pipette"),
      onclick: () =>
        new window.EyeDropper()
          .open()
          .then((r) => {
            [hue, sat, val] = hexToHsv(r.sRGBHex);
            onCommit(paint());
          })
          .catch(() => {}),
    });
  }
  const sliders = h("div", { class: "picker-sliders" }, lead, h("div", { class: "picker-tracks" }, hues, alphas));
  const head = h(
    "div",
    { class: "picker-head" },
    h("button", { type: "button", class: "icon-button icon-button-sm", "aria-label": "Back", "data-tip": "Back", html: icon("chevron-left"), onclick: onBack }),
    h("p", { class: "picker-title", text: title }),
  );
  setFormat(lastFormat);
  const view = h("div", { class: "picker" }, head, sv, sliders, row);
  view.addEventListener("pointerdown", (e) => {
    if (!list.hidden && !e.composedPath().some((n) => n === list || n === formatButton)) showList(false);
  });
  view.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !list.hidden) {
      e.stopPropagation();
      showList(false);
      formatButton.focus();
    }
  });
  return view;
}

export function drillIn(pop, view, place) {
  const before = [...pop.childNodes];
  const style = getComputedStyle(pop);
  const inner = pop.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  view.style.width = `max(${Math.round(inner)}px, 248px)`;
  morph(pop, () => {
    pop.replaceChildren(view);
    place?.();
  });
  if (!reducedMotion())
    animate(
      view,
      [
        { opacity: 0, transform: "translateX(12px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 240, easing: EASE_OUT },
    );
  return () => {
    morph(pop, () => {
      pop.replaceChildren(...before);
      place?.();
    });
    if (!reducedMotion())
      for (const n of before)
        if (n.nodeType === 1)
          animate(
            n,
            [
              { opacity: 0, transform: "translateX(-12px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 240, easing: EASE_OUT },
          );
  };
}
