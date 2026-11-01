const barrel = (id, stops) =>
  `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;

const INK = "var(--tool-color, #18181b)";
const mix = (pct, other) => `color-mix(in srgb, ${INK} ${pct}%, ${other})`;

const tinted = (id, stops) =>
  `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">${stops.map(([o, c]) => `<stop offset="${o}" style="stop-color:${c}"/>`).join("")}</linearGradient>`;

const LACQUER = [
  [0, mix(55, "#000")],
  [0.28, mix(76, "#fff")],
  [0.42, INK],
  [1, mix(42, "#000")],
];
const WET = [
  [0, mix(55, "#000")],
  [0.35, mix(82, "#fff")],
  [1, mix(50, "#000")],
];
const BODY = [
  [0, "#232428"],
  [0.28, "#5a5c63"],
  [0.52, "#3a3c42"],
  [1, "#1d1e21"],
];
const STEEL = [
  [0, "#7c7d83"],
  [0.3, "#f4f4f6"],
  [0.55, "#b8b9be"],
  [1, "#5e5f65"],
];
const WOOD = [
  [0, "#b7864a"],
  [0.32, "#f3d6a6"],
  [0.6, "#d8a96c"],
  [1, "#9c6c35"],
];
const RUBBER = [
  [0, "#d9d9dc"],
  [0.3, "#ffffff"],
  [0.62, "#f0f0f1"],
  [1, "#c9c9cd"],
];

const RULER = { left: 6.6, right: 21.4, top: 3.4, corner: 2.1, end: 14, step: 2.35 };

const rulerTicks = () => {
  const { left, right, top, end, step } = RULER;
  const width = right - left;
  let d = "";
  for (let i = 0; top + end + i * step < 96; i++) {
    const y = (top + end + i * step).toFixed(2);
    const k = i % 10 === 0 ? 0.36 : i % 5 === 0 ? 0.25 : 0.14;
    d += `M${left} ${y}h${(width * k).toFixed(2)}M${right} ${y}h${(-width * k * 0.8).toFixed(2)}`;
  }
  return d;
};

const rulerNumbers = () => {
  const { left, right, top, end, step } = RULER;
  const x = (left + (right - left) * 0.57).toFixed(2);
  return [0, 1, 2, 3]
    .map((n) => {
      const y = (top + end + n * 10 * step).toFixed(2);
      return `<text x="${x}" y="${y}" transform="rotate(90 ${x} ${y})" text-anchor="middle" dominant-baseline="middle">${n}</text>`;
    })
    .join("");
};

const rulerBody = () => {
  const { left, right, top, corner, end } = RULER;
  const cx = (left + right) / 2;
  const cy = top + end / 2;
  const r = (right - left) * 0.15;
  return `M${left} 98V${top + corner}a${corner} ${corner} 0 0 1 ${corner} ${-corner}H${right - corner}a${corner} ${corner} 0 0 1 ${corner} ${corner}V98ZM${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
};

const rulerGrain = () => {
  const { left, right, top, end } = RULER;
  return [0.3, 0.52, 0.74]
    .map((k, i) => {
      const x = left + (right - left) * k;
      return `M${(x + Math.sin(i * 2.1) * 0.3).toFixed(2)} ${top + end * 0.7}C${(x + 0.5).toFixed(2)} 40 ${(x - 0.4).toFixed(2)} 70 ${(x + Math.cos(i * 1.7) * 0.3).toFixed(2)} 98`;
    })
    .join("");
};

const svg = (body, defs) =>
  `<svg class="tool-art" viewBox="0 0 28 96" width="28" height="96" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;

export const ART = {
  nib: (p) =>
    svg(
      `<rect x="7" y="40" width="14" height="58" rx="2" fill="url(#${p}b)"/>
       <rect x="7.4" y="29" width="13.2" height="13" rx="1.4" fill="url(#${p}l)"/>
       <path d="M7.4 32.6h13.2M7.4 38.2h13.2" stroke="#000" stroke-opacity=".18" stroke-width=".6"/>
       <path d="M14 1.6C12.6 9 9.4 17.4 8.6 25.4L8.6 30h10.8v-4.6C18.6 17.4 15.4 9 14 1.6Z" fill="url(#${p}s)"/>
       <path d="M14 1.6c-.5 2.6-1.1 5-1.8 7.4h3.6c-.7-2.4-1.3-4.8-1.8-7.4Z" style="fill:${INK}"/>
       <path d="M14 4.5v14.2" stroke="#2c2c31" stroke-width=".7" stroke-linecap="round"/>
       <circle cx="14" cy="20.4" r="1.25" fill="#2c2c31"/>
       <path d="M8.6 25.4h10.8" stroke="#000" stroke-opacity=".14" stroke-width=".6"/>`,
      barrel(`${p}b`, BODY) + tinted(`${p}l`, LACQUER) + barrel(`${p}s`, STEEL),
    ),
  fineliner: (p) =>
    svg(
      `<rect x="7" y="25" width="14" height="73" rx="2.2" fill="url(#${p}b)"/>
       <rect x="7" y="33" width="14" height="3.4" style="fill:${INK}"/>
       <path d="M8.6 25.6 11.4 12h5.2l2.8 13.6Z" fill="url(#${p}c)"/>
       <rect x="12.7" y="4.6" width="2.6" height="8" rx=".5" fill="url(#${p}s)"/>
       <rect x="13.25" y="1.4" width="1.5" height="4" rx=".7" style="fill:${INK}"/>`,
      barrel(`${p}b`, BODY) + tinted(`${p}c`, LACQUER) + barrel(`${p}s`, STEEL),
    ),
  brush: (p) =>
    svg(
      `<rect x="7" y="33" width="14" height="65" rx="2" fill="url(#${p}b)"/>
       <rect x="7" y="43" width="14" height="2.6" style="fill:${INK}"/>
       <path d="M8.2 33.6V27h11.6v6.6Z" fill="url(#${p}s)"/>
       <path d="M8.6 27.4C8.4 19 11.4 9.6 14 1.2c2.6 8.4 5.6 17.8 5.4 26.2Z" fill="url(#${p}t)"/>
       <path d="M14 3.4c-.9 5.8-1.9 12-2.2 18.4" stroke="#fff" stroke-opacity=".18" stroke-width=".7" fill="none" stroke-linecap="round"/>`,
      barrel(`${p}b`, BODY) + barrel(`${p}s`, STEEL) + tinted(`${p}t`, WET),
    ),
  pencil: (p) =>
    svg(
      `<rect x="7" y="25" width="14" height="73" fill="url(#${p}b)"/>
       <rect x="7" y="33" width="14" height="3.4" fill="#4f8fd4"/>
       <path d="M7 26.4 11.2 10.6h5.6L21 26.4c-1.2-1.5-2.4-1.5-3.6 0-1.2-1.6-2.4-1.6-3.4 0-1.1-1.6-2.3-1.6-3.4 0-1.2-1.5-2.4-1.5-3.6 0Z" fill="url(#${p}w)"/>
       <path d="M11.2 10.6 14 1.6l2.8 9Z" fill="#4f8fd4"/>
       <path d="M12.3 7 14 1.6l.8 2.6" fill="#7fb4ea"/>`,
      barrel(`${p}b`, BODY) + barrel(`${p}w`, WOOD),
    ),
  wash: (p) =>
    svg(
      `<path d="M8.4 47h11.2l-1.4 51H9.8Z" fill="url(#${p}b)"/>
       <rect x="8" y="27" width="12" height="21" rx="1.2" fill="url(#${p}s)"/>
       <path d="M8 43.4h12M8 45.4h12" stroke="#000" stroke-opacity=".2" stroke-width=".6"/>
       <path class="wash-tip" d="M8.6 28C7.2 19.6 10.2 9.8 14 1.4c3.8 8.4 6.8 18.2 5.4 26.6Z" fill="var(--wash-tip, #6b6b72)"/>
       <path d="M8.6 28C7.2 19.6 10.2 9.8 14 1.4c3.8 8.4 6.8 18.2 5.4 26.6Z" fill="url(#${p}t)"/>`,
      barrel(`${p}b`, BODY) +
        barrel(`${p}s`, STEEL) +
        barrel(`${p}t`, [
          [0, "rgba(0,0,0,.28)"],
          [0.32, "rgba(255,255,255,.3)"],
          [0.55, "rgba(255,255,255,0)"],
          [1, "rgba(0,0,0,.32)"],
        ]),
    ),
  hatch: (p) =>
    svg(
      `<rect x="7" y="23" width="14" height="75" rx="2" fill="url(#${p}b)"/>
       <rect x="9.4" y="38" width="9.2" height="15" rx="1.4" fill="#f4f4f2"/>
       <clipPath id="${p}c"><rect x="9.4" y="38" width="9.2" height="15" rx="1.4"/></clipPath>
       <path clip-path="url(#${p}c)" d="M4 50 16 38M6 54 18 42M8 58 20 46M10 62 22 50M2 46 14 34" style="stroke:${INK}" stroke-width="1.1" stroke-linecap="round"/>
       <path d="M9.8 23.6 12.4 11.4h3.2l2.6 12.2Z" fill="url(#${p}d)"/>
       <rect x="13.15" y="1.6" width="1.7" height="10.4" rx=".6" fill="url(#${p}s)"/>`,
      barrel(`${p}b`, BODY) + tinted(`${p}d`, LACQUER) + barrel(`${p}s`, STEEL),
    ),
  ruler: () =>
    svg(
      `<path d="${rulerBody()}" fill-rule="evenodd" style="fill:color-mix(in srgb, var(--ruler-wood) 84%, var(--bg-paper));stroke:var(--ruler-ink)" stroke-width=".5"/>
       <path d="${rulerGrain()}" fill="none" style="stroke:var(--ruler-grain)" stroke-width=".45"/>
       <path d="${rulerTicks()}" style="stroke:var(--ruler-ink)" stroke-width=".5" stroke-linecap="round"/>
       <g style="fill:var(--ruler-ink);font-family:var(--font-family-caption)" font-style="italic" font-size="2.96">${rulerNumbers()}</g>`,
      "",
    ),
  eraser: (p) =>
    svg(
      `<path d="M6.4 40V9.6C6.4 5.6 8.6 3.4 12.6 3.2h2.8c4 .2 6.2 2.4 6.2 6.4V40Z" fill="url(#${p}r)"/>
       <rect x="5.4" y="27" width="17.2" height="71" rx="1.2" fill="url(#${p}b)"/>
       <rect x="5.4" y="33" width="17.2" height="3.4" fill="#fff" fill-opacity=".85"/>`,
      barrel(`${p}r`, RUBBER) + barrel(`${p}b`, BODY),
    ),
};
