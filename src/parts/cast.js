import { rng } from "../core/random.js";
import { pointInRing } from "../core/geometry.js";
import { area, dot, flat, hideUnder, layer, line, loop, oval, ovalRing, paint, poly, scallop, segment, spline } from "./kit.js";

export const BROWS = {
  neutral: { near: [-12, -14, -12.5], far: [-12.5, -13.5, -12] },
  smug: { near: [-15, -19, -16], far: [-10.5, -11, -11] },
  worried: { near: [-11, -13, -17], far: [-17, -13, -11] },
  delighted: { near: [-14, -18, -15], far: [-15, -18, -14] },
  deadpan: { near: [-10, -10, -10], far: [-10, -10, -10] },
  startled: { near: [-17, -22, -18], far: [-18, -22, -17] },
  sheepish: { near: [-11, -12.5, -15], far: [-15, -12.5, -11] },
  cross: { near: [-15, -12, -8], far: [-8, -12, -15] },
};

export const MOUTHS = {
  neutral: [
    [-10, 0],
    [0, 1],
    [9, -1],
  ],
  smug: [
    [-10, 1],
    [2, 1.5],
    [10, -4],
    [11.5, -6],
  ],
  worried: [
    [-9, 1.5],
    [-4, -0.5],
    [1, 1.5],
    [6, -0.5],
    [10, 1.5],
  ],
  delighted: null,
  deadpan: [
    [-9, 0],
    [9, 0],
  ],
  startled: null,
  sheepish: [
    [-10, -1],
    [-2, 2.5],
    [8, -1],
    [10, -3],
  ],
  cross: [
    [-10, 2.5],
    [0, -1],
    [10, 2.5],
  ],
};

const SKIN = "skin";

function skull(target, pts, tone, { weight = 1.05, role = SKIN, step = 1.5 } = {}) {
  const contour = spline(pts, { closed: true, step });
  target.lines.push({ pts: contour.concat(contour.slice(0, 6)), weight });
  target.knock.push(contour);
  if (tone) target.washes.push({ rings: [contour], tone, role });
  return contour;
}

function behind(b, draw, pts, tone, opts) {
  const back = layer();
  draw(back);
  paint(b, back);
  const front = layer();
  const contour = skull(front, pts, tone, opts);
  front.cover.push(contour);
  paint(b, front);
  return contour;
}

function blob(b, x, y, rx, ry, tone, { weight = 0.85, role = SKIN, start = -1.2 } = {}) {
  b.lines.push({ pts: oval(x, y, rx, ry, { start }), weight });
  b.knock.push(ovalRing(x, y, rx, ry));
  if (tone) b.washes.push({ rings: [ovalRing(x, y, rx, ry)], tone, role });
}

function chalk(b, x, y, r = 1.2) {
  b.lines.push(segment([x - r * 0.4, y - r * 0.4], [x + r * 0.4, y + r * 0.2], { weight: 0.55, color: "chalk" }));
}

function mouthFor(b, mood, m, k = 1, weight = 0.85) {
  const s = (pts) => pts.map(([x, y]) => [m.x + x * k, m.y + y * k]);
  if (mood === "delighted") {
    b.lines.push({
      pts: spline(
        s([
          [-12, -3],
          [0, -1],
          [12, -5],
          [7, 6],
          [-2, 8],
          [-10, 3],
        ]),
        { closed: true, overlap: 0.08 },
      ),
      weight,
    });
    b.washes.push({
      rings: [
        area(
          s([
            [-10, -1],
            [0, 0.5],
            [10, -3],
            [6, 5],
            [-2, 6.5],
            [-8, 2.5],
          ]),
        ),
      ],
      tone: 0.55,
    });
  } else if (mood === "startled") {
    b.lines.push({ pts: oval(m.x, m.y + 2 * k, 4 * k, 6 * k, { start: -1.2 }), weight });
    b.washes.push({ rings: [ovalRing(m.x, m.y + 2 * k, 3 * k, 4.6 * k)], tone: 0.55 });
  } else b.lines.push(line(s(MOUTHS[mood] || MOUTHS.neutral), { weight }));
}

function browsFor(b, mood, near, far, k = 1, weight = 0.8) {
  const brow = BROWS[mood] || BROWS.neutral;
  b.lines.push(
    line(
      [
        [near.x - 7 * k, near.y + brow.near[0] * k],
        [near.x, near.y + brow.near[1] * k],
        [near.x + 6 * k, near.y + brow.near[2] * k],
      ],
      { weight },
    ),
  );
  b.lines.push(
    line(
      [
        [far.x - 4.5 * k, far.y + brow.far[0] * k],
        [far.x + 0.5 * k, far.y + brow.far[1] * k],
        [far.x + 5 * k, far.y + brow.far[2] * k],
      ],
      { weight: weight * 0.94 },
    ),
  );
}

export function shutEye(b, e, w, weight = 0.8) {
  b.lines.push(
    line(
      [
        [e.x - w, e.y - 1],
        [e.x - w * 0.3, e.y + w * 0.42],
        [e.x + w * 0.4, e.y + w * 0.4],
        [e.x + w, e.y - 1.2],
      ],
      { weight },
    ),
  );
}

function happyEye(b, e, w, weight = 0.8) {
  b.lines.push(
    line(
      [
        [e.x - w, e.y + 1.5],
        [e.x, e.y - w * 0.6],
        [e.x + w, e.y + 1.5],
      ],
      { weight },
    ),
  );
}

const youth = (spec) => (spec.age === "kid" ? 1.6 : spec.age === "teen" ? 1.3 : 1);

function droop(b, e, w, k = 1) {
  b.lines.push(
    line(
      [
        [e.x - w, e.y - 0.4 * k],
        [e.x, e.y - 1.6 * k],
        [e.x + w, e.y - 0.2 * k],
      ],
      { weight: 0.95 },
    ),
  );
  b.lines.push(
    line(
      [
        [e.x - w * 0.8, e.y + w * 0.9],
        [e.x, e.y + w * 1.2],
        [e.x + w * 0.8, e.y + w * 0.85],
      ],
      { weight: 0.4 },
    ),
  );
}

function petEyes(b, spec, near, far, r = 2.8) {
  const mood = spec.mood || "neutral";
  const young = youth(spec);
  const old = spec.age === "old";
  for (const [e, k] of [
    [near, young],
    [far, 0.86 * young],
  ]) {
    if (spec.eyes === "closed") shutEye(b, e, 5.5 * k);
    else if (mood === "delighted") happyEye(b, e, 5 * k);
    else if (mood === "startled") {
      b.lines.push({ pts: oval(e.x, e.y, 5 * k, 6 * k, { start: -1.4 }), weight: 0.7 });
      b.solids.push(dot(e.x + 1, e.y, 1.6 * k));
    } else if (old) {
      const half = [];
      for (let i = 0; i <= 8; i++) half.push([e.x + Math.cos((i / 8) * Math.PI) * r * k * 1.05, e.y + Math.sin((i / 8) * Math.PI) * r * k * 1.05]);
      b.solids.push(area(half));
      droop(b, e, 5 * k);
    } else {
      b.solids.push(dot(e.x, e.y + (mood === "deadpan" || mood === "smug" ? 1.2 : 0), r * k));
      chalk(b, e.x + 0.8 * k, e.y - 0.9 * k, young > 1 ? 1.6 : 1);
      if (young > 1.3) chalk(b, e.x - 1.2 * k, e.y + 1.1 * k, 0.8);
      if (mood === "deadpan" || mood === "smug")
        b.lines.push(
          line(
            [
              [e.x - 5 * k, e.y - 0.6],
              [e.x, e.y - 1.8],
              [e.x + 5 * k, e.y - 0.2],
            ],
            { weight: 0.75 },
          ),
        );
    }
  }
}

function bigEye(b, spec, e, rx, ry, { pupil = 0.42, look = 0.35 } = {}) {
  const mood = spec.mood || "neutral";
  const grow = spec.age === "kid" ? 1.3 : spec.age === "teen" ? 1.16 : 1;
  rx *= grow;
  ry *= grow;
  if (spec.eyes === "closed") return shutEye(b, { x: e.x, y: e.y + ry * 0.2 }, rx * 0.9, 0.85);
  if (mood === "delighted") return happyEye(b, e, rx * 0.8, 0.9);
  b.lines.push({ pts: oval(e.x, e.y, rx, ry, { start: -1.3 }), weight: 0.75 });
  b.knock.push(ovalRing(e.x, e.y, rx, ry));
  const pr = Math.min(rx, ry) * (mood === "startled" ? pupil * 0.6 : pupil * (grow > 1 ? 1.15 : 1));
  const old = spec.age === "old";
  b.solids.push(dot(e.x + rx * look, e.y + (mood === "sheepish" || old ? ry * 0.3 : 0), pr));
  chalk(b, e.x + rx * look + pr * 0.4, e.y - pr * 0.4 + (old ? ry * 0.3 : 0), grow > 1 ? 1.5 : 1);
  if (old) {
    b.lines.push(
      line(
        [
          [e.x - rx, e.y - ry * 0.05],
          [e.x, e.y - ry * 0.22],
          [e.x + rx, e.y - ry * 0.05],
        ],
        { weight: 0.9 },
      ),
    );
    b.lines.push(
      line(
        [
          [e.x - rx * 0.7, e.y + ry * 1.25],
          [e.x, e.y + ry * 1.4],
          [e.x + rx * 0.7, e.y + ry * 1.22],
        ],
        { weight: 0.4 },
      ),
    );
  }
  if (mood === "deadpan" || mood === "smug")
    b.solids.push(
      area([
        [e.x - rx, e.y - 0.5],
        [e.x - rx * 0.6, e.y - ry * 0.8],
        [e.x, e.y - ry],
        [e.x + rx * 0.6, e.y - ry * 0.8],
        [e.x + rx, e.y - 0.5],
        [e.x, e.y - ry * 0.2],
      ]),
    );
  if (mood === "cross")
    b.lines.push(
      line(
        [
          [e.x - rx, e.y - ry * 0.9],
          [e.x + rx, e.y - ry * 0.35],
        ],
        { weight: 0.9 },
      ),
    );
  if (mood === "worried")
    b.lines.push(
      line(
        [
          [e.x - rx, e.y - ry * 0.4],
          [e.x + rx, e.y - ry * 1.05],
        ],
        { weight: 0.8 },
      ),
    );
}

function almond(cx, cy, w, h, tilt) {
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const pts = [
    [-w, 0],
    [-w * 0.4, -h],
    [w * 0.5, -h * 0.9],
    [w, 0],
    [w * 0.2, h * 0.8],
    [-w * 0.5, h * 0.7],
  ];
  return area(pts.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]));
}

const head = (contour, eye, mouth) => ({ pts: contour.map((p) => [p.x, p.y]), eye, mouth, face: 0 });

const OCTOPUS = {
  head: [
    [-14, -104],
    [14, -100],
    [34, -84],
    [42, -58],
    [50, -30],
    [46, -6],
    [32, 8],
    [14, 14],
    [-4, 14],
    [-22, 6],
    [-36, -10],
    [-52, -38],
    [-64, -72],
    [-54, -98],
    [-34, -108],
  ],
  eyes: [
    [12, -18, 9, 8],
    [34, -16, 7, 7],
  ],
  spots: [
    [-40, -80],
    [-24, -92],
    [-8, -84],
    [-46, -56],
  ],
  mouth: { x: 22, y: -2 },
  root: 6,
  arms: [
    [-22, -2, 38, -6],
    [-12, 2, 44, -3],
    [-2, 4, 48, 0],
    [9, 4, 48, 0],
    [20, 2, 44, 3],
    [30, -2, 38, 6],
  ],
};

function octopus(label) {
  const style = OCTOPUS;
  return {
    label,
    draw(b, spec) {
      const contour = skull(b, style.head, 0);
      for (const [x, y, rx, ry] of style.eyes) bigEye(b, spec, { x, y }, rx, ry, { pupil: 0.5 });
      for (const [x, y] of style.spots) b.washes.push({ rings: [ovalRing(x, y, 3.4, 3)], tone: 0.3, role: SKIN });
      const r = rng(spec.seed || 3);
      const bottom = contour.reduce((m, p) => Math.max(m, p.y), -Infinity);
      const after = (target, { contour: shape = contour, k = 1 } = {}) => {
        const t = layer();
        const whole = [];
        const skin = [shape];
        const reach = (1 + k) / 2;
        style.arms.forEach(([ax, ay, len, drift], i) => {
          const x0 = ax * k;
          const y0 = bottom + (ay - bottom) * k;
          const long = (len + r() * 10) * reach;
          const curl = (i % 2 ? 1 : -1) * (6 + r() * 4) * reach;
          const spine = spline(
            [
              [x0, y0],
              [x0 + drift * k * 0.45 + curl * 0.3, y0 + long * 0.45],
              [x0 + drift * k * 0.85 + curl, y0 + long * 0.8],
              [x0 + drift * k + curl * 1.9, y0 + long * 0.94],
              [x0 + drift * k + curl * 1.5, y0 + long],
            ],
            { step: 2 },
          );
          const left = [];
          const right = [];
          spine.forEach((p, n) => {
            const a = spine[Math.max(0, n - 1)];
            const c = spine[Math.min(spine.length - 1, n + 1)];
            const dx = c.x - a.x;
            const dy = c.y - a.y;
            const l = Math.hypot(dx, dy) || 1;
            const w = style.root * Math.sqrt(k) * (1 - n / spine.length) ** 0.8 + 0.8;
            left.push({ x: p.x - (dy / l) * w, y: p.y + (dx / l) * w });
            right.push({ x: p.x + (dy / l) * w, y: p.y - (dx / l) * w });
          });
          const ring = left.concat(right.slice().reverse());
          t.lines.push({ pts: ring.slice(1, -1), weight: 0.75 });
          whole.push(ring);
          const from = Math.max(0, spine.findIndex((p) => !pointInRing(p, shape)) - 3);
          const below = left.slice(from).concat(right.slice(from).reverse());
          skin.push(below);
          t.knock.push(below);
          t.cover.push(below);
        });
        t.washes.push({ rings: skin, tone: 0.26, role: SKIN });
        target.lines = hideUnder(target.lines, whole);
        mouthFor(t, spec.mood, { x: style.mouth.x * k, y: bottom + (style.mouth.y - bottom) * k }, 0.7 * Math.sqrt(k), 0.75);
        paint(target, t);
      };
      return { contour, head: head(contour, style.eyes[0][1], style.mouth.y), after };
    },
  };
}

export const ALIENS = {
  grey: {
    label: "Grey",
    draw(b, spec) {
      const pts = [
        [0, -72],
        [34, -66],
        [56, -44],
        [60, -14],
        [50, 12],
        [34, 34],
        [16, 52],
        [0, 58],
        [-14, 52],
        [-30, 32],
        [-46, 6],
        [-56, -24],
        [-50, -52],
        [-28, -68],
      ];
      const contour = skull(b, pts, 0.2);
      const mood = spec.mood || "neutral";
      const eyes = [
        [8, -4, 15, 8.5, 0.45],
        [38, -6, 11, 7, -0.42],
      ];
      for (const [x, y, w, h, t] of eyes) {
        if (spec.eyes === "closed") shutEye(b, { x, y }, w * 0.8, 0.9);
        else if (mood === "delighted") happyEye(b, { x, y }, w * 0.75, 1);
        else {
          const grow = spec.age === "kid" ? 1.25 : spec.age === "teen" ? 1.12 : 1;
          b.solids.push(almond(x, y, w * grow * (mood === "startled" ? 1.12 : 1), h * grow * (mood === "deadpan" || spec.age === "old" ? 0.6 : 1), t));
          chalk(b, x + w * 0.3, y - h * 0.3, grow > 1 ? 1.8 : 1.4);
          if (spec.age === "old") droop(b, { x, y: y - h * 0.5 }, w * 0.9, 1.4);
        }
      }
      if (mood === "cross")
        b.lines.push(
          line(
            [
              [-4, -16],
              [14, -12],
            ],
            { weight: 0.8 },
          ),
          line(
            [
              [32, -15],
              [46, -18],
            ],
            { weight: 0.7 },
          ),
        );
      if (mood === "worried")
        b.lines.push(
          line(
            [
              [-6, -12],
              [14, -18],
            ],
            { weight: 0.7 },
          ),
          line(
            [
              [30, -18],
              [46, -14],
            ],
            { weight: 0.65 },
          ),
        );
      b.solids.push(dot(30, 17, 1.1), dot(35, 16.5, 1));
      mouthFor(b, mood, { x: 25, y: 36 }, 0.55, 0.8);
      return { contour, head: head(contour, -6, 36) };
    },
  },
  martian: {
    label: "Antennae",
    draw(b, spec) {
      const pts = [
        [0, -52],
        [30, -48],
        [48, -28],
        [52, 0],
        [46, 26],
        [28, 44],
        [4, 52],
        [-22, 48],
        [-42, 32],
        [-52, 6],
        [-50, -22],
        [-38, -42],
        [-20, -52],
      ];
      const contour = behind(
        b,
        (p) => {
          p.lines.push(
            line(
              [
                [-12, -44],
                [-22, -70],
                [-30, -88],
              ],
              { weight: 0.85 },
            ),
            line(
              [
                [14, -46],
                [22, -72],
                [26, -90],
              ],
              { weight: 0.85 },
            ),
          );
          blob(p, -31, -95, 6.5, 6.5, 0.45);
          blob(p, 27, -96, 6, 6, 0.45);
        },
        pts,
        0.24,
      );
      bigEye(b, spec, { x: 9, y: -12 }, 11, 12);
      bigEye(b, spec, { x: 35, y: -13 }, 8.5, 10.5);
      mouthFor(b, spec.mood, { x: 24, y: 26 }, 1.15);
      return { contour, head: head(contour, -12, 26) };
    },
  },
  cyclops: {
    label: "One eye",
    draw(b, spec) {
      const pts = [
        [0, -60],
        [30, -54],
        [46, -30],
        [48, 0],
        [40, 28],
        [22, 48],
        [0, 56],
        [-22, 50],
        [-40, 30],
        [-48, 0],
        [-46, -30],
        [-30, -52],
        [-14, -60],
      ];
      const contour = behind(
        b,
        (p) => {
          for (const horn of [
            [
              [-28, -46],
              [-34, -76],
              [-14, -56],
            ],
            [
              [6, -58],
              [16, -82],
              [22, -54],
            ],
          ]) {
            p.lines.push(poly(horn, { closed: true, weight: 0.8 }));
            p.washes.push({ rings: [flat(horn, 3)], tone: 0.4 });
            p.knock.push(flat(horn, 3));
          }
        },
        pts,
        0.22,
      );
      const mood = spec.mood || "neutral";
      const e = { x: 16, y: -10 };
      if (spec.eyes === "closed") shutEye(b, e, 14, 1);
      else if (mood === "delighted") happyEye(b, e, 13, 1.1);
      else {
        b.lines.push({ pts: oval(e.x, e.y, 17, 15, { start: -1.3 }), weight: 0.9 });
        b.washes.push({ rings: [ovalRing(e.x + 2, e.y, 8, 8)], tone: 0.4 });
        b.lines.push({ pts: oval(e.x + 2, e.y, 8, 8), weight: 0.6 });
        b.solids.push(dot(e.x + 3, e.y, mood === "startled" ? 2.4 : 4));
        chalk(b, e.x + 6, e.y - 3, 1.6);
        if (mood === "deadpan" || mood === "smug")
          b.solids.push(
            area([
              [e.x - 17, e.y - 1],
              [e.x - 10, e.y - 12],
              [e.x, e.y - 15],
              [e.x + 10, e.y - 12],
              [e.x + 17, e.y - 1],
              [e.x, e.y - 4],
            ]),
          );
        if (mood === "cross")
          b.lines.push(
            line(
              [
                [e.x - 16, e.y - 20],
                [e.x + 14, e.y - 12],
              ],
              { weight: 1 },
            ),
          );
        if (mood === "worried")
          b.lines.push(
            line(
              [
                [e.x - 16, e.y - 13],
                [e.x + 14, e.y - 21],
              ],
              { weight: 0.9 },
            ),
          );
      }
      mouthFor(b, mood, { x: 18, y: 30 }, 1.1);
      if (mood !== "startled" && mood !== "delighted")
        b.lines.push(
          poly(
            [
              [16, 31],
              [22, 31.5],
              [21, 37],
              [16.5, 37],
            ],
            { closed: true, weight: 0.55 },
          ),
        );
      return { contour, head: head(contour, -10, 30) };
    },
  },
  octopus: { ...octopus("Tentacles"), grow: { kid: 0.82, teen: 0.9 } },
  bug: {
    label: "Eye stalks",
    draw(b, spec) {
      const pts = [
        [0, -46],
        [30, -42],
        [46, -22],
        [50, 4],
        [44, 26],
        [26, 42],
        [2, 48],
        [-22, 44],
        [-40, 28],
        [-48, 4],
        [-46, -22],
        [-32, -40],
        [-16, -46],
      ];
      const contour = behind(
        b,
        (p) =>
          p.lines.push(
            line(
              [
                [0, -40],
                [-8, -70],
                [-14, -88],
              ],
              { weight: 0.9 },
            ),
            line(
              [
                [22, -38],
                [30, -68],
                [36, -86],
              ],
              { weight: 0.9 },
            ),
          ),
        pts,
        0.24,
      );
      const top = layer();
      for (const [x, y, r] of [
        [-15, -97, 11],
        [37, -95, 9.5],
      ]) {
        top.lines.push({ pts: oval(x, y, r, r, { start: -1.2 }), weight: 0.85 });
        top.cover.push(ovalRing(x, y, r, r));
        top.knock.push(ovalRing(x, y, r, r));
      }
      paint(b, top);
      bigEye(b, spec, { x: -15, y: -97 }, 8, 8, { pupil: 0.5 });
      bigEye(b, spec, { x: 37, y: -95 }, 7, 7, { pupil: 0.5 });
      for (const [x, y, rr] of [
        [-26, -22, 5],
        [-10, -32, 3.5],
        [-30, 2, 3],
      ])
        b.washes.push({ rings: [ovalRing(x, y, rr, rr * 0.9)], tone: 0.42, role: SKIN });
      mouthFor(b, spec.mood, { x: 24, y: 18 }, 0.9);
      b.lines.push(
        line(
          [
            [16, 24],
            [20, 34],
            [28, 36],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [32, 23],
            [38, 32],
            [46, 32],
          ],
          { weight: 0.8 },
        ),
      );
      return { contour, head: head(contour, -10, 18) };
    },
  },
  brainy: {
    label: "Big brain",
    draw(b, spec) {
      const pts = [
        [0, -90],
        [42, -84],
        [66, -58],
        [68, -22],
        [56, 6],
        [42, 26],
        [24, 46],
        [6, 54],
        [-12, 50],
        [-30, 36],
        [-48, 10],
        [-62, -24],
        [-62, -60],
        [-36, -84],
      ];
      const contour = skull(b, pts, 0.16);
      const cap = [
        [-60, -16],
        [-30, -6],
        [4, -8],
        [36, -10],
        [66, -18],
      ];
      b.lines.push(line(cap, { weight: 0.8 }));
      b.washes.push({
        rings: [
          area(
            cap.concat([
              [66, -40],
              [56, -74],
              [24, -90],
              [-24, -88],
              [-56, -66],
            ]),
          ),
        ],
        tone: 0.22,
        role: SKIN,
      });
      const r = rng(spec.seed || 5);
      for (const [y, x0, x1] of [
        [-74, -30, 30],
        [-58, -50, 50],
        [-42, -56, 58],
        [-27, -54, 60],
      ]) {
        const pts2 = [];
        for (let x = x0; x <= x1; x += 6) pts2.push([x, y + Math.sin(x / 7 + r() * 2) * 3.5]);
        b.lines.push(line(pts2, { weight: 0.5 }));
      }
      b.lines.push(
        line(
          [
            [-2, -88],
            [2, -66],
            [-2, -46],
            [2, -24],
          ],
          { weight: 0.55 },
        ),
      );
      bigEye(b, spec, { x: 10, y: 6 }, 8.5, 8);
      bigEye(b, spec, { x: 34, y: 5 }, 7, 7);
      mouthFor(b, spec.mood, { x: 24, y: 34 }, 0.9);
      return { contour, head: head(contour, 6, 34) };
    },
  },
};

function robotEyes(b, spec, eyes, r) {
  const mood = spec.mood || "neutral";
  for (const [x, y, k] of eyes) {
    const rr = r * k;
    b.lines.push({ pts: oval(x, y, rr, rr, { start: -1.2 }), weight: 0.85 });
    b.knock.push(ovalRing(x, y, rr, rr));
    if (spec.eyes === "closed") {
      b.lines.push(segment([x - rr * 0.8, y + 1], [x + rr * 0.8, y + 1], { weight: 0.9 }));
      continue;
    }
    if (mood === "delighted") {
      happyEye(b, { x, y: y + 2 }, rr * 0.7, 0.9);
      continue;
    }
    b.washes.push({ rings: [ovalRing(x, y, rr * 0.7, rr * 0.7)], tone: 0.32 });
    b.solids.push(dot(x + rr * 0.15, y, rr * (mood === "startled" ? 0.2 : 0.36)));
    chalk(b, x + rr * 0.3, y - rr * 0.35, 1.2);
    if (mood === "cross")
      b.solids.push(
        area([
          [x - rr, y - rr * 0.95],
          [x + rr, y - rr * 0.35],
          [x + rr, y - rr * 1.1],
          [x - rr, y - rr * 1.1],
        ]),
      );
    if (mood === "worried" || mood === "sheepish")
      b.solids.push(
        area([
          [x - rr, y - rr * 0.35],
          [x + rr, y - rr * 0.95],
          [x + rr, y - rr * 1.1],
          [x - rr, y - rr * 1.1],
        ]),
      );
    if (mood === "deadpan" || mood === "smug")
      b.solids.push(
        area([
          [x - rr, y - 0.2],
          [x + rr, y - 0.2],
          [x + rr, y - rr * 1.1],
          [x - rr, y - rr * 1.1],
        ]),
      );
  }
}

function grille(b, x, y, w, h, mood) {
  if (mood === "startled") return b.lines.push({ pts: oval(x + w / 2, y + h / 2, h * 0.5, h * 0.6), weight: 0.85 });
  const bend = mood === "delighted" ? 4 : mood === "cross" || mood === "worried" ? -3 : 0;
  const top = [
    [x, y],
    [x + w / 2, y + bend],
    [x + w, y],
  ];
  const bottom = [
    [x, y + h],
    [x + w / 2, y + h + bend],
    [x + w, y + h],
  ];
  b.lines.push(
    line(top, { weight: 0.75 }),
    line(bottom, { weight: 0.75 }),
    segment([x, y], [x, y + h], { weight: 0.75 }),
    segment([x + w, y], [x + w, y + h], { weight: 0.75 }),
  );
  for (let i = 1; i < 5; i++) b.lines.push(segment([x + (w * i) / 5, y + bend * 0.8], [x + (w * i) / 5, y + h + bend * 0.8], { weight: 0.45 }));
}

export const ROBOT_HEADS = {
  box: {
    label: "Tin box",
    draw(b, spec) {
      const pts = [
        [-36, -48],
        [38, -48],
        [46, -40],
        [46, 38],
        [38, 46],
        [-36, 46],
        [-44, 38],
        [-44, -40],
      ];
      const contour = flat(pts, 3);
      const back = layer();
      back.lines.push(segment([2, -48], [2, -74], { weight: 0.9 }));
      blob(back, 2, -80, 6, 6, 0.5);
      for (const x of [-51, 46]) {
        const bolt = [
          [x, -10],
          [x + 6, -10],
          [x + 6, 10],
          [x, 10],
        ];
        back.lines.push(poly(bolt, { closed: true, weight: 0.75 }));
        back.washes.push({ rings: [flat(bolt, 2)], tone: 0.5 });
      }
      paint(b, back);
      b.lines.push(poly(pts, { closed: true, weight: 1.05 }));
      b.knock.push(contour);
      b.washes.push({ rings: [contour], tone: 0.2, role: SKIN });
      for (const [x, y] of [
        [-38, -42],
        [40, -42],
        [-38, 40],
        [40, 40],
      ])
        b.solids.push(dot(x, y, 1.6));
      robotEyes(
        b,
        spec,
        [
          [-10, -12, 1],
          [22, -12, 0.9],
        ],
        11,
      );
      grille(b, -14, 16, 36, 13, spec.mood);
      return { contour, head: head(contour, -12, 22) };
    },
  },
  tv: {
    label: "Television",
    draw(b, spec) {
      const pts = [
        [-40, -44],
        [40, -44],
        [48, -36],
        [48, 40],
        [40, 46],
        [-40, 46],
        [-48, 40],
        [-48, -36],
      ];
      const contour = flat(pts, 3);
      const back = layer();
      back.lines.push(
        line(
          [
            [-4, -44],
            [-18, -66],
            [-30, -90],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [6, -44],
            [18, -68],
            [32, -92],
          ],
          { weight: 0.8 },
        ),
      );
      blob(back, -31, -93, 3.5, 3.5, 0.5);
      blob(back, 33, -95, 3.5, 3.5, 0.5);
      paint(b, back);
      b.lines.push(poly(pts, { closed: true, weight: 1.05 }));
      b.knock.push(contour);
      b.washes.push({ rings: [contour], tone: 0.34, role: SKIN });
      const screen = [
        [-38, -32],
        [24, -32],
        [28, -28],
        [28, 30],
        [24, 34],
        [-38, 34],
        [-42, 30],
        [-42, -28],
      ];
      b.lines.push(poly(screen, { closed: true, weight: 0.8 }));
      b.washes.push({ rings: [flat(screen, 3)], tone: 0.02, paper: true });
      b.washes.push({ rings: [flat(screen, 3)], tone: 0.06 });
      blob(b, 38, -20, 4.5, 4.5, 0.5, { role: null });
      blob(b, 38, -4, 4.5, 4.5, 0.5, { role: null });
      for (const y of [14, 20, 26]) b.lines.push(segment([33, y], [43, y], { weight: 0.45 }));
      const mood = spec.mood || "neutral";
      const slant = mood === "cross" || mood === "smug" ? 4 : mood === "worried" || mood === "sheepish" ? -4 : 0;
      if (spec.eyes === "closed") b.lines.push(segment([-28, -6], [-14, -6], { weight: 1.2 }), segment([0, -6], [14, -6], { weight: 1.2 }));
      else if (mood === "delighted")
        b.lines.push(
          line(
            [
              [-28, -4],
              [-21, -11],
              [-14, -4],
            ],
            { weight: 1.3 },
          ),
          line(
            [
              [0, -4],
              [7, -11],
              [14, -4],
            ],
            { weight: 1.3 },
          ),
        );
      else if (mood === "startled") {
        b.lines.push({ pts: oval(-21, -8, 6, 6), weight: 0.9 }, { pts: oval(7, -8, 6, 6), weight: 0.9 });
        b.solids.push(dot(-21, -8, 2), dot(7, -8, 2));
      } else
        b.solids.push(
          area([
            [-28, -12 - slant],
            [-14, -12 + slant],
            [-14, -5 + slant],
            [-28, -5 - slant],
          ]),
          area([
            [0, -12 + slant],
            [14, -12 - slant],
            [14, -5 - slant],
            [0, -5 + slant],
          ]),
        );
      mouthFor(b, mood, { x: -7, y: 18 }, 1.1, 1);
      return { contour, head: head(contour, -8, 18) };
    },
  },
  dome: {
    label: "Dome",
    draw(b, spec) {
      const pts = [
        [-46, 46],
        [-48, 0],
        [-42, -30],
        [-26, -48],
        [0, -55],
        [26, -48],
        [42, -30],
        [48, 0],
        [46, 46],
      ];
      const back = layer();
      blob(back, -49, -4, 8, 9, 0.45);
      blob(back, 49, -4, 7, 9, 0.45);
      paint(b, back);
      const front = layer();
      const contour = spline(pts, { step: 1.5 }).concat(
        spline(
          [
            [46, 46],
            [0, 48],
            [-46, 46],
          ],
          { step: 2 },
        ).slice(1),
      );
      front.lines.push({ pts: contour.concat(contour.slice(0, 4)), weight: 1.05 });
      front.knock.push(contour);
      front.cover.push(contour);
      front.washes.push({ rings: [contour], tone: 0.18, role: SKIN });
      paint(b, front);
      const visor = [
        [-38, -20],
        [40, -20],
        [44, -14],
        [44, 2],
        [40, 6],
        [-38, 6],
        [-42, 2],
        [-42, -14],
      ];
      b.lines.push(poly(visor, { closed: true, weight: 0.85 }));
      b.solids.push(flat(visor, 3));
      const mood = spec.mood || "neutral";
      const ex = mood === "worried" || mood === "sheepish" ? 4 : mood === "cross" ? 26 : 18;
      if (spec.eyes === "closed") b.lines.push(segment([ex - 8, -7], [ex + 8, -7], { weight: 0.9, color: "chalk" }));
      else if (mood === "delighted")
        b.lines.push(
          line(
            [
              [ex - 8, -4],
              [ex, -12],
              [ex + 8, -4],
            ],
            { weight: 1, color: "chalk" },
          ),
        );
      else {
        const r = mood === "startled" ? 6.5 : 4.5;
        b.lines.push({ pts: oval(ex, -7, r, r * 0.8), weight: 1.1, color: "chalk" });
        if (mood === "cross") b.lines.push(segment([ex - 10, -16], [ex + 9, -11], { weight: 0.9, color: "chalk" }));
      }
      b.lines.push(
        line(
          [
            [-44, 18],
            [0, 21],
            [46, 18],
          ],
          { weight: 0.6 },
        ),
      );
      for (const x of [-30, -18, 22, 34]) b.lines.push(segment([x, 28], [x, 38], { weight: 0.45 }));
      b.lines.push(
        line(
          [
            [-30, -40],
            [-16, -48],
            [0, -51],
          ],
          { weight: 0.45 },
        ),
      );
      return { contour, head: head(contour, -7, 30) };
    },
  },
  can: {
    label: "Tin can",
    draw(b, spec) {
      const pts = [
        [-34, -56],
        [-26, -64],
        [0, -68],
        [26, -64],
        [34, -56],
        [34, 48],
        [-34, 48],
      ];
      const contour = flat(pts, 3);
      b.lines.push(poly(pts, { closed: true, weight: 1.05 }));
      b.knock.push(contour);
      b.washes.push({ rings: [contour], tone: 0.16, role: SKIN });
      b.lines.push(
        line(
          [
            [-34, -56],
            [0, -50],
            [34, -56],
          ],
          { weight: 0.75 },
        ),
        line(
          [
            [-34, -42],
            [0, -37],
            [34, -42],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [-34, 36],
            [0, 40],
            [34, 36],
          ],
          { weight: 0.5 },
        ),
      );
      const mood = spec.mood || "neutral";
      const e = { x: 12, y: -18 };
      b.lines.push({ pts: oval(e.x, e.y, 14, 14, { start: -1.2 }), weight: 0.95 });
      if (spec.eyes === "closed") {
        b.solids.push(
          area([
            [e.x - 14, e.y],
            [e.x - 10, e.y - 10],
            [e.x, e.y - 14],
            [e.x + 10, e.y - 10],
            [e.x + 14, e.y],
          ]),
        );
        b.lines.push(segment([e.x - 14, e.y], [e.x + 14, e.y], { weight: 0.8 }));
      } else {
        b.washes.push({ rings: [ovalRing(e.x, e.y, 8, 8)], tone: 0.6 });
        b.lines.push({ pts: oval(e.x, e.y, 8, 8), weight: 0.6 });
        b.solids.push(dot(e.x + 1, e.y, mood === "startled" ? 2 : 3.6));
        chalk(b, e.x + 4, e.y - 4, 1.6);
        if (mood === "cross")
          b.solids.push(
            area([
              [e.x - 14, e.y - 12],
              [e.x + 14, e.y - 4],
              [e.x + 14, e.y - 15],
              [e.x - 14, e.y - 15],
            ]),
          );
        if (mood === "deadpan" || mood === "smug")
          b.solids.push(
            area([
              [e.x - 14, e.y - 1],
              [e.x + 14, e.y - 1],
              [e.x + 12, e.y - 9],
              [e.x, e.y - 14],
              [e.x - 12, e.y - 9],
            ]),
          );
      }
      b.lines.push(
        poly(
          [
            [-26, 6],
            [-6, 6],
            [-6, 28],
            [-26, 28],
          ],
          { closed: true, weight: 0.65 },
        ),
      );
      for (const [x, k] of [
        [6, 1],
        [14, 0.8],
        [22, 1],
      ])
        b.solids.push(dot(x, 12, 2.2 * k));
      mouthFor(b, mood, { x: 14, y: 24 }, 0.6, 0.7);
      return { contour, head: head(contour, -18, 24) };
    },
  },
  bulb: {
    label: "Light bulb",
    draw(b, spec) {
      const glass = [
        [0, -66],
        [30, -60],
        [48, -36],
        [50, -8],
        [40, 14],
        [24, 30],
        [22, 40],
        [-22, 40],
        [-24, 30],
        [-40, 14],
        [-50, -8],
        [-48, -36],
        [-30, -60],
      ];
      const contour = skull(b, glass, 0.04, { role: null });
      const base = [
        [-22, 40],
        [22, 40],
        [22, 62],
        [12, 70],
        [-12, 70],
        [-22, 62],
      ];
      b.lines.push(poly(base, { closed: true, weight: 0.95 }));
      b.washes.push({ rings: [flat(base, 3)], tone: 0.42, role: SKIN });
      b.knock.push(flat(base, 3));
      for (const y of [47, 54, 61])
        b.lines.push(
          line(
            [
              [-22, y],
              [0, y + 2],
              [22, y],
            ],
            { weight: 0.5 },
          ),
        );
      b.lines.push(
        line(
          [
            [-8, 40],
            [-6, 22],
            [-4, 8],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [8, 40],
            [10, 22],
            [12, 8],
          ],
          { weight: 0.45 },
        ),
      );
      b.lines.push(
        line(
          [
            [-32, -40],
            [-26, -52],
            [-12, -58],
          ],
          { weight: 0.5 },
        ),
      );
      const mood = spec.mood || "neutral";
      for (const [x, k] of [
        [-4, 1],
        [20, 0.85],
      ]) {
        if (spec.eyes === "closed") shutEye(b, { x, y: -14 }, 5 * k, 0.7);
        else if (mood === "delighted") happyEye(b, { x, y: -14 }, 5 * k, 0.8);
        else {
          const coil = [];
          for (let i = 0; i <= 24; i++) {
            const a = (i / 24) * Math.PI * 4;
            coil.push([x + Math.cos(a) * 3 * k + (i / 24 - 0.5) * 2, -14 + Math.sin(a) * (mood === "startled" ? 6 : 4.5) * k]);
          }
          b.lines.push(line(coil, { weight: 0.55 }));
        }
      }
      if (mood === "delighted" || mood === "smug")
        b.lines.push(
          line(
            [
              [-6, 6],
              [4, 12],
              [14, 12],
              [24, 4],
            ],
            { weight: 0.7 },
          ),
        );
      else if (mood === "startled") b.lines.push({ pts: oval(9, 8, 4, 5), weight: 0.7 });
      else {
        const zig = [];
        const amp = mood === "cross" || mood === "worried" ? 4 : 2.6;
        for (let i = 0; i <= 8; i++) zig.push([-6 + i * 3.8, 8 + (i % 2 ? -amp : amp) * (mood === "deadpan" ? 0.2 : 1)]);
        b.lines.push(line(zig, { weight: 0.6 }));
      }
      return { contour: contour.concat(flat(base, 3)), head: { pts: [[0, 70]], eye: -14, mouth: 8, face: 0 } };
    },
  },
};

export const CHASSIS = ["boxy", "barrel", "round"];
export const ROBOT_LEGS = ["legs", "treads", "wheel"];

function muzzle(b, x, y, rx, ry) {
  const ring = ovalRing(x, y, rx, ry);
  b.lines.push({ pts: oval(x, y, rx, ry, { start: -0.4, sweep: Math.PI * 1.55 }), weight: 0.75 });
  b.washes.push({ rings: [ring], paper: true });
  b.knock.push(ring);
}

function whiskers(b, x, y, dir = 1, len = 30) {
  for (const [dy, k] of [
    [-5, 0.95],
    [1, 1],
    [7, 0.9],
  ])
    b.lines.push(
      line(
        [
          [x, y + dy * 0.4],
          [x + dir * len * 0.5 * k, y + dy * 0.9],
          [x + dir * len * k, y + dy * 1.5],
        ],
        { weight: 0.4 },
      ),
    );
}

function ear(p, pts, tone, inner = null, innerTone = 0) {
  const ring = area(pts);
  p.lines.push({ pts: ring.concat(ring.slice(0, 3)), weight: 0.9 });
  p.knock.push(ring);
  p.cover.push(ring);
  if (tone) p.washes.push({ rings: [ring], tone, role: SKIN });
  if (inner) {
    p.lines.push(line(inner, { weight: 0.55 }));
    if (innerTone) p.washes.push({ rings: [area(inner)], tone: innerTone });
  }
}

export const ANIMALS = {
  dog: {
    label: "Dog",
    draw(b, spec) {
      const pts = [
        [0, -52],
        [28, -48],
        [44, -30],
        [50, -12],
        [70, -6],
        [84, 4],
        [84, 18],
        [72, 28],
        [50, 34],
        [36, 46],
        [14, 54],
        [-12, 52],
        [-34, 40],
        [-46, 16],
        [-48, -14],
        [-38, -40],
        [-20, -50],
      ];
      const contour = skull(b, pts, 0.08);
      b.lines.push(
        line(
          [
            [48, -10],
            [56, 2],
            [58, 14],
          ],
          { weight: 0.5 },
        ),
      );
      b.solids.push(
        area([
          [74, -2],
          [86, 0],
          [88, 10],
          [80, 14],
          [72, 9],
        ]),
      );
      chalk(b, 80, 3, 1.5);
      const f = layer();
      ear(
        f,
        [
          [-22, -46],
          [-40, -44],
          [-56, -20],
          [-60, 12],
          [-52, 32],
          [-38, 28],
          [-30, 2],
          [-20, -28],
        ],
        0.55,
      );
      paint(b, f);
      petEyes(b, spec, { x: 20, y: -16 }, { x: 42, y: -17 }, 3);
      browsFor(b, spec.mood, { x: 20, y: -16 }, { x: 42, y: -17 }, 0.8, 0.7);
      const mood = spec.mood || "neutral";
      b.lines.push(
        line(
          [
            [80, 14],
            [78, 22],
            [72, 27],
          ],
          { weight: 0.7 },
        ),
      );
      if (mood === "delighted") {
        b.lines.push(
          line(
            [
              [72, 27],
              [62, 36],
              [52, 34],
            ],
            { weight: 0.8 },
          ),
        );
        b.lines.push(
          loop(
            [
              [60, 34],
              [66, 46],
              [58, 52],
              [54, 42],
            ],
            { weight: 0.6 },
          ),
        );
        b.washes.push({
          rings: [
            area([
              [60, 34],
              [66, 46],
              [58, 52],
              [54, 42],
            ]),
          ],
          tone: 0.35,
        });
      } else mouthFor(b, mood, { x: 62, y: 30 }, 0.8, 0.75);
      return { contour, head: head(contour, -16, 30) };
    },
  },
  cat: {
    label: "Cat",
    draw(b, spec) {
      const pts = [
        [0, -46],
        [30, -42],
        [46, -22],
        [50, 4],
        [44, 26],
        [28, 42],
        [6, 48],
        [-18, 44],
        [-38, 30],
        [-48, 6],
        [-46, -20],
        [-34, -40],
        [-16, -48],
      ];
      const contour = behind(
        b,
        (p) => {
          ear(
            p,
            [
              [-36, -30],
              [-46, -84],
              [-6, -50],
            ],
            0.24,
            [
              [-34, -42],
              [-40, -70],
              [-18, -50],
            ],
            0.3,
          );
          ear(
            p,
            [
              [6, -48],
              [30, -88],
              [42, -30],
            ],
            0.24,
            [
              [14, -50],
              [30, -76],
              [36, -40],
            ],
            0.3,
          );
        },
        pts,
        0.24,
      );
      for (const [x0, y0] of [
        [-14, -40],
        [-4, -42],
        [6, -40],
      ])
        b.lines.push(
          line(
            [
              [x0, y0],
              [x0 + 1, y0 + 9],
            ],
            { weight: 0.45 },
          ),
        );
      const mood = spec.mood || "neutral";
      for (const [x, y, k] of [
        [12, -8, 1],
        [34, -9, 0.85],
      ]) {
        if (spec.eyes === "closed") shutEye(b, { x, y }, 6 * k);
        else if (mood === "delighted") happyEye(b, { x, y }, 6 * k, 0.85);
        else {
          b.lines.push({
            pts: spline(
              [
                [x - 7 * k, y],
                [x, y - 5 * k],
                [x + 7 * k, y],
                [x, y + 5 * k],
              ],
              { closed: true, overlap: 0.1 },
            ),
            weight: 0.7,
          });
          b.solids.push(
            area(
              [
                [x, y - 4.4 * k],
                [x + 1.6 * k, y],
                [x, y + 4.4 * k],
                [x - 1.6 * k, y],
              ].map(([px, py]) => [px + (mood === "startled" ? 0 : 0.6), py]),
            ),
          );
          if (mood === "deadpan" || mood === "smug") b.lines.push(segment([x - 7 * k, y - 1], [x + 7 * k, y - 1.5], { weight: 0.8 }));
        }
      }
      browsFor(b, mood, { x: 12, y: -8 }, { x: 34, y: -9 }, 0.8, 0.6);
      b.solids.push(
        area([
          [38, 8],
          [48, 8],
          [43, 14],
        ]),
      );
      b.lines.push(
        line(
          [
            [43, 14],
            [43, 19],
          ],
          { weight: 0.6 },
        ),
      );
      if (mood === "delighted" || mood === "startled") mouthFor(b, mood, { x: 43, y: 24 }, 0.6, 0.7);
      else
        b.lines.push(
          line(
            [
              [35, 20],
              [39, 23],
              [43, 19],
              [47, 23],
              [51, 20],
            ],
            { weight: 0.6 },
          ),
        );
      whiskers(b, 50, 14, 1, 34);
      whiskers(b, 30, 16, -1, 18);
      return { contour, head: head(contour, -8, 22) };
    },
  },
  bear: {
    label: "Bear",
    draw(b, spec) {
      const pts = [
        [0, -50],
        [32, -46],
        [50, -24],
        [54, 4],
        [48, 28],
        [30, 46],
        [4, 52],
        [-22, 48],
        [-42, 32],
        [-52, 6],
        [-50, -20],
        [-38, -40],
        [-18, -50],
      ];
      const contour = behind(
        b,
        (p) => {
          for (const [x, y, r] of [
            [-32, -44, 16],
            [26, -50, 14],
          ]) {
            const ring = ovalRing(x, y, r, r);
            p.lines.push({ pts: oval(x, y, r, r), weight: 0.9 });
            p.washes.push({ rings: [ring], tone: 0.46, role: SKIN });
            p.knock.push(ring);
            p.lines.push({ pts: oval(x + 1, y + 2, r * 0.5, r * 0.5, { start: 0.2, sweep: Math.PI * 1.4 }), weight: 0.5 });
          }
        },
        pts,
        0.42,
      );
      muzzle(b, 40, 18, 24, 18);
      b.solids.push(
        area([
          [52, 4],
          [64, 6],
          [62, 14],
          [54, 15],
        ]),
      );
      chalk(b, 58, 7, 1.3);
      b.lines.push(
        line(
          [
            [58, 15],
            [56, 22],
          ],
          { weight: 0.6 },
        ),
      );
      petEyes(b, spec, { x: 10, y: -12 }, { x: 32, y: -13 }, 2.8);
      browsFor(b, spec.mood, { x: 10, y: -12 }, { x: 32, y: -13 }, 0.8, 0.7);
      mouthFor(b, spec.mood, { x: 52, y: 26 }, 0.75, 0.7);
      return { contour, head: head(contour, -12, 26) };
    },
  },
  rabbit: {
    label: "Rabbit",
    draw(b, spec) {
      const pts = [
        [0, -46],
        [28, -42],
        [44, -22],
        [50, 2],
        [46, 22],
        [30, 38],
        [8, 44],
        [-16, 40],
        [-36, 26],
        [-44, 2],
        [-42, -24],
        [-28, -42],
        [-12, -48],
      ];
      const contour = behind(
        b,
        (p) => {
          ear(
            p,
            [
              [-26, -36],
              [-40, -96],
              [-30, -132],
              [-16, -110],
              [-8, -46],
            ],
            0.06,
            [
              [-24, -50],
              [-32, -100],
              [-26, -120],
              [-18, -100],
              [-14, -52],
            ],
            0.14,
          );
          ear(
            p,
            [
              [-2, -44],
              [8, -104],
              [24, -128],
              [30, -98],
              [16, -40],
            ],
            0.06,
            [
              [4, -56],
              [12, -100],
              [22, -116],
              [24, -96],
              [14, -52],
            ],
            0.14,
          );
        },
        pts,
        0.06,
      );
      petEyes(b, spec, { x: 14, y: -10 }, { x: 34, y: -11 }, 3.4);
      browsFor(b, spec.mood, { x: 14, y: -10 }, { x: 34, y: -11 }, 0.8, 0.6);
      b.solids.push(
        area([
          [42, 5.5],
          [50, 5.5],
          [50.5, 8],
          [46, 11.5],
          [41.5, 8],
        ]),
      );
      b.lines.push(
        line(
          [
            [46, 11],
            [46, 16],
          ],
          { weight: 0.6 },
        ),
      );
      if (spec.mood === "startled") mouthFor(b, "startled", { x: 46, y: 22 }, 0.6, 0.7);
      else
        b.lines.push(
          line(
            [
              [40.5, 19.5],
              [43.5, 19],
              [46, 16],
            ],
            { weight: 0.6 },
          ),
          line(
            [
              [46, 16],
              [48.5, 19],
              [51.5, 19.5],
            ],
            { weight: 0.6 },
          ),
        );
      whiskers(b, 52, 12, 1, 30);
      return { contour, head: head(contour, -10, 22) };
    },
  },
  pig: {
    label: "Pig",
    draw(b, spec) {
      const pts = [
        [0, -46],
        [30, -42],
        [46, -20],
        [50, 6],
        [44, 28],
        [24, 44],
        [0, 48],
        [-24, 42],
        [-42, 24],
        [-48, 0],
        [-44, -24],
        [-30, -42],
        [-14, -48],
      ];
      const contour = skull(b, pts, 0.12);
      const f = layer();
      ear(
        f,
        [
          [-34, -30],
          [-46, -70],
          [-8, -48],
        ],
        0.18,
      );
      ear(
        f,
        [
          [8, -46],
          [32, -78],
          [40, -34],
        ],
        0.18,
      );
      paint(b, f);
      const snout = layer();
      snout.lines.push({ pts: oval(52, 8, 11, 15, { start: -1.4 }), weight: 0.9 });
      snout.cover.push(ovalRing(52, 8, 11, 15));
      snout.knock.push(ovalRing(52, 8, 11, 15));
      snout.washes.push({ rings: [ovalRing(52, 8, 11, 15)], tone: 0.2, role: SKIN });
      paint(b, snout);
      b.solids.push(
        area([
          [50, 1],
          [54, 0],
          [54, 6],
          [50, 6],
        ]),
        area([
          [52, 11],
          [56, 10],
          [56, 16],
          [52, 16],
        ]),
      );
      petEyes(b, spec, { x: 16, y: -12 }, { x: 34, y: -13 }, 2.6);
      browsFor(b, spec.mood, { x: 16, y: -12 }, { x: 34, y: -13 }, 0.8, 0.65);
      mouthFor(b, spec.mood, { x: 40, y: 30 }, 0.75, 0.75);
      return { contour, head: head(contour, -12, 30) };
    },
  },
  mouse: {
    label: "Mouse",
    draw(b, spec) {
      const pts = [
        [0, -40],
        [26, -36],
        [42, -18],
        [60, -4],
        [76, 6],
        [74, 14],
        [56, 20],
        [40, 32],
        [18, 42],
        [-6, 42],
        [-28, 30],
        [-40, 8],
        [-38, -16],
        [-24, -34],
        [-12, -40],
      ];
      const contour = behind(
        b,
        (p) => {
          for (const [x, y, r] of [
            [-28, -46, 25],
            [14, -54, 21],
          ]) {
            const ring = ovalRing(x, y, r, r);
            p.lines.push({ pts: oval(x, y, r, r), weight: 0.9 });
            p.washes.push({ rings: [ring], tone: 0.3, role: SKIN });
            p.washes.push({ rings: [ovalRing(x + 2, y + 2, r * 0.6, r * 0.6)], tone: 0.2 });
            p.knock.push(ring);
          }
        },
        pts,
        0.3,
      );
      b.solids.push(dot(76, 8, 4));
      petEyes(b, spec, { x: 16, y: -10 }, { x: 34, y: -11 }, 3);
      browsFor(b, spec.mood, { x: 16, y: -10 }, { x: 34, y: -11 }, 0.8, 0.6);
      mouthFor(b, spec.mood, { x: 58, y: 22 }, 0.6, 0.7);
      whiskers(b, 70, 12, 1, 32);
      return { contour, head: head(contour, -10, 22) };
    },
  },
  fox: {
    label: "Fox",
    draw(b, spec) {
      const pts = [
        [0, -44],
        [28, -40],
        [44, -24],
        [60, -10],
        [86, 4],
        [82, 12],
        [60, 20],
        [44, 34],
        [20, 44],
        [-6, 44],
        [-30, 32],
        [-42, 10],
        [-42, -16],
        [-30, -36],
        [-14, -44],
      ];
      const contour = behind(
        b,
        (p) => {
          ear(
            p,
            [
              [-32, -32],
              [-38, -92],
              [-4, -46],
            ],
            0.44,
            [
              [-28, -42],
              [-32, -78],
              [-14, -48],
            ],
          );
          ear(
            p,
            [
              [8, -44],
              [24, -94],
              [38, -30],
            ],
            0.44,
            [
              [14, -48],
              [24, -80],
              [32, -38],
            ],
          );
          p.solids.push(
            area([
              [-37, -82],
              [-38, -92],
              [-31, -84],
            ]),
            area([
              [22, -86],
              [24, -94],
              [28, -86],
            ]),
          );
        },
        pts,
        0.42,
      );
      const cheek = [
        [-6, 44],
        [20, 44],
        [44, 34],
        [60, 20],
        [82, 12],
        [64, 12],
        [44, 18],
        [26, 22],
        [6, 26],
        [-14, 30],
        [-30, 32],
      ];
      b.washes.push({ rings: [area(cheek)], paper: true });
      b.lines.push(
        line(
          [
            [82, 12],
            [60, 14],
            [40, 20],
            [14, 26],
            [-12, 30],
          ],
          { weight: 0.5 },
        ),
      );
      b.solids.push(
        area([
          [80, -1],
          [89, 2],
          [88, 9],
          [80, 9],
        ]),
      );
      const mood = spec.mood || "neutral";
      for (const [x, y, k] of [
        [16, -12, 1],
        [36, -13, 0.85],
      ]) {
        if (spec.eyes === "closed") shutEye(b, { x, y }, 5.5 * k);
        else if (mood === "delighted") happyEye(b, { x, y }, 5 * k);
        else {
          b.solids.push(almond(x, y, 5 * k, 2.6, -0.2));
          chalk(b, x + 1, y - 1, 1);
        }
      }
      browsFor(b, mood, { x: 16, y: -12 }, { x: 36, y: -13 }, 0.8, 0.65);
      mouthFor(b, mood, { x: 66, y: 16 }, 0.6, 0.7);
      return { contour, head: head(contour, -12, 16) };
    },
  },
  lion: {
    label: "Lion",
    draw(b, spec) {
      {
        const k = spec.age === "kid" ? 0.8 : spec.age === "teen" ? 0.9 : 1;
        const mane = layer();
        const ring = scallop(ovalRing(-4, -8, 74 * k, 66 * k), 6, 22, spec.seed || 2, { outward: true });
        mane.lines.push({ pts: ring.concat(ring.slice(0, 4)), weight: 1 });
        mane.washes.push({ rings: [ring], tone: 0.5, role: SKIN });
        mane.knock.push(ring);
        const r = rng(spec.seed || 4);
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2 + r() * 0.2;
          mane.lines.push(
            line(
              [
                [-4 + Math.cos(a) * 52 * k, -8 + Math.sin(a) * 46 * k],
                [-4 + Math.cos(a) * 66 * k, -8 + Math.sin(a) * 58 * k],
              ],
              { weight: 0.45 },
            ),
          );
        }
        paint(b, mane);
      }
      const ears = layer();
      for (const [x, y] of [
        [-24, -36],
        [12, -42],
      ]) {
        ears.lines.push({ pts: oval(x, y, 11, 10, { start: 0.6 }), weight: 0.9 });
        ears.washes.push({ rings: [ovalRing(x, y, 11, 10)], tone: 0.24, role: SKIN });
        ears.washes.push({ rings: [ovalRing(x + 1, y + 1, 5, 4.5)], tone: 0.4 });
        ears.knock.push(ovalRing(x, y, 11, 10));
      }
      paint(b, ears);
      const pts = [
        [0, -44],
        [28, -40],
        [44, -24],
        [48, -6],
        [56, 6],
        [60, 18],
        [56, 30],
        [44, 38],
        [26, 44],
        [6, 46],
        [-14, 42],
        [-32, 30],
        [-40, 6],
        [-38, -18],
        [-28, -36],
        [-14, -44],
      ];
      const face = layer();
      const contour = skull(face, pts, 0.2);
      face.cover.push(contour);
      paint(b, face);
      b.washes.push({
        rings: [
          area([
            [32, 4],
            [46, 2],
            [56, 6],
            [60, 18],
            [56, 30],
            [44, 37],
            [30, 35],
            [24, 22],
          ]),
        ],
        paper: true,
      });
      b.lines.push(
        line(
          [
            [33, 4],
            [24, 20],
            [31, 35],
          ],
          { weight: 0.55 },
        ),
      );
      b.solids.push(
        area([
          [45, 5],
          [57, 5],
          [58, 9],
          [52, 14],
          [46, 9],
        ]),
      );
      b.lines.push(
        line(
          [
            [52, 14],
            [52, 21],
          ],
          { weight: 0.6 },
        ),
      );
      for (const [x, y] of [
        [40, 18],
        [44, 23],
        [38, 25],
      ])
        b.solids.push(dot(x, y, 1.1));
      petEyes(b, spec, { x: 12, y: -10 }, { x: 32, y: -11 }, 2.8);
      browsFor(b, spec.mood, { x: 12, y: -10 }, { x: 32, y: -11 }, 0.85, 0.75);
      mouthFor(b, spec.mood, { x: 52, y: 25 }, 0.55, 0.75);
      return { contour, head: head(contour, -10, 27), top: -70 };
    },
  },
};

export const HATS = ["none", "cap", "beanie", "bowler", "tophat", "cowboy", "witch", "pirate", "party", "crown", "chef", "santa", "helmet"];

const SINK = { cap: 24, beanie: 30, bowler: 20, tophat: 16, cowboy: 18, witch: 18, pirate: 22, party: 8, crown: 10, chef: 14, santa: 26 };

export function headTop(b) {
  let top = Infinity;
  for (const l of b.lines) for (const p of l.pts) if (Math.abs(p.x) < 30 && p.y < top) top = p.y;
  return Number.isFinite(top) ? top : -60;
}

export function addHat(b, hat, { top, seed = 1 } = {}) {
  if (!hat || hat === "none" || !SINK[hat]) return;
  const y = top + SINK[hat];
  const h = layer();
  const part = (pts, tone, { smooth = false, weight = 0.95, cover = true } = {}) => {
    const ring = smooth ? area(pts) : flat(pts, 3);
    h.lines.push(smooth ? loop(pts, { weight, overlap: 0.04 }) : poly(pts, { closed: true, weight }));
    if (tone) h.washes.push({ rings: [ring], tone, role: "hat" });
    h.knock.push(ring);
    if (cover) h.cover.push(ring);
    return ring;
  };
  if (hat === "cap") {
    part(
      [
        [-48, y + 6],
        [-46, y - 16],
        [-30, y - 34],
        [0, y - 40],
        [30, y - 32],
        [44, y - 12],
        [46, y + 4],
      ],
      0.42,
      { smooth: true },
    );
    part(
      [
        [40, y + 1],
        [64, y + 3],
        [84, y + 10],
        [80, y + 15],
        [40, y + 9],
      ],
      0.55,
      { smooth: true },
    );
    h.lines.push(
      line(
        [
          [-2, y - 40],
          [6, y - 22],
          [10, y + 4],
        ],
        { weight: 0.5 },
      ),
    );
    h.solids.push(dot(-1, y - 41, 3));
  } else if (hat === "beanie") {
    part(scallop(ovalRing(2, y - 58, 10, 10), 2.4, 6, seed), 0.3, { smooth: true, weight: 0.75 });
    part(
      [
        [-50, y + 6],
        [-48, y - 22],
        [-28, y - 44],
        [4, y - 50],
        [32, y - 42],
        [48, y - 18],
        [50, y + 6],
      ],
      0.36,
      { smooth: true },
    );
    part(
      [
        [-52, y - 8],
        [52, y - 8],
        [53, y + 10],
        [-53, y + 10],
      ],
      0.46,
    );
    for (let x = -46; x <= 46; x += 8) h.lines.push(segment([x, y - 6], [x, y + 8], { weight: 0.4 }));
  } else if (hat === "bowler") {
    part(
      [
        [-36, y],
        [-34, y - 26],
        [-18, y - 42],
        [4, y - 46],
        [26, y - 40],
        [38, y - 24],
        [38, y],
      ],
      0.66,
      { smooth: true },
    );
    part(
      [
        [-56, y + 2],
        [-40, y - 4],
        [0, y - 6],
        [44, y - 4],
        [60, y + 2],
        [44, y + 9],
        [0, y + 11],
        [-40, y + 9],
      ],
      0.7,
      { smooth: true },
    );
    h.lines.push(
      line(
        [
          [-35, y - 8],
          [2, y - 10],
          [37, y - 8],
        ],
        { weight: 0.6, color: "chalk" },
      ),
    );
  } else if (hat === "tophat") {
    part(
      [
        [-34, y],
        [-36, y - 92],
        [-30, y - 98],
        [34, y - 98],
        [40, y - 92],
        [38, y],
      ],
      0.7,
    );
    part(
      [
        [-58, y + 2],
        [-36, y - 4],
        [40, y - 4],
        [62, y + 2],
        [40, y + 9],
        [-36, y + 9],
      ],
      0.74,
      { smooth: true },
    );
    h.lines.push(
      line(
        [
          [-35, y - 22],
          [2, y - 24],
          [38, y - 22],
        ],
        { weight: 0.6, color: "chalk" },
      ),
      line(
        [
          [-35, y - 12],
          [2, y - 14],
          [38, y - 12],
        ],
        { weight: 0.6, color: "chalk" },
      ),
    );
  } else if (hat === "cowboy") {
    part(
      [
        [-30, y],
        [-34, y - 40],
        [-18, y - 56],
        [-2, y - 46],
        [14, y - 58],
        [32, y - 42],
        [30, y],
      ],
      0.42,
      { smooth: true },
    );
    part(
      [
        [-82, y - 16],
        [-56, y + 2],
        [0, y + 6],
        [60, y + 2],
        [86, y - 18],
        [70, y + 14],
        [0, y + 22],
        [-64, y + 14],
      ],
      0.46,
      { smooth: true },
    );
    h.lines.push(
      line(
        [
          [-30, y - 6],
          [0, y - 8],
          [30, y - 6],
        ],
        { weight: 0.7 },
      ),
    );
  } else if (hat === "witch") {
    part(
      [
        [-36, y],
        [-14, y - 60],
        [6, y - 112],
        [34, y - 132],
        [24, y - 104],
        [26, y - 60],
        [38, y],
      ],
      0.72,
      { smooth: true },
    );
    part(
      [
        [-76, y + 4],
        [-40, y - 6],
        [0, y - 8],
        [44, y - 6],
        [80, y + 4],
        [44, y + 14],
        [0, y + 16],
        [-40, y + 14],
      ],
      0.74,
      { smooth: true },
    );
    h.lines.push(
      poly(
        [
          [-6, y - 18],
          [14, y - 18],
          [14, y - 4],
          [-6, y - 4],
        ],
        { closed: true, weight: 0.65, color: "chalk" },
      ),
    );
  } else if (hat === "pirate") {
    part(
      [
        [-62, y + 4],
        [-58, y - 30],
        [-30, y - 20],
        [0, y - 48],
        [30, y - 20],
        [60, y - 32],
        [64, y + 4],
        [0, y + 12],
      ],
      0.74,
      { smooth: true },
    );
    h.lines.push({ pts: oval(0, y - 18, 6, 5.5), weight: 0.6, color: "chalk" });
    h.lines.push(segment([-9, y - 7], [9, y - 1], { weight: 0.6, color: "chalk" }), segment([-9, y - 1], [9, y - 7], { weight: 0.6, color: "chalk" }));
  } else if (hat === "party") {
    part(
      [
        [-28, y + 2],
        [4, y - 96],
        [32, y + 2],
      ],
      0.18,
    );
    for (const k of [0.3, 0.55, 0.8]) h.lines.push(segment([-28 + 32 * k, y + 2 - 98 * k], [32 - 28 * k, y + 2 - 98 * k * 0.92 + 6], { weight: 0.45 }));
    part(scallop(ovalRing(4, y - 102, 8, 8), 2, 5, seed), 0.4, { smooth: true, weight: 0.7 });
  } else if (hat === "crown") {
    part(
      [
        [-40, y + 2],
        [-44, y - 42],
        [-26, y - 22],
        [-12, y - 50],
        [2, y - 24],
        [16, y - 50],
        [30, y - 22],
        [46, y - 42],
        [42, y + 2],
      ],
      0.3,
    );
    h.lines.push(
      line(
        [
          [-40, y - 8],
          [0, y - 10],
          [42, y - 8],
        ],
        { weight: 0.6 },
      ),
    );
    for (const x of [-20, 2, 24]) h.solids.push(dot(x, y - 2, 2.6));
  } else if (hat === "chef") {
    part(scallop(ovalRing(2, y - 50, 50, 34), 5, 22, seed, { outward: true }), 0.02, { smooth: true });
    part(
      [
        [-38, y + 2],
        [-38, y - 22],
        [40, y - 22],
        [40, y + 2],
      ],
      0.04,
    );
    h.lines.push(
      line(
        [
          [-14, y - 22],
          [-12, y - 44],
        ],
        { weight: 0.45 },
      ),
      line(
        [
          [16, y - 22],
          [18, y - 44],
        ],
        { weight: 0.45 },
      ),
    );
  } else if (hat === "santa") {
    part(
      [
        [-46, y],
        [-34, y - 50],
        [0, y - 74],
        [40, y - 66],
        [66, y - 36],
        [70, y - 6],
        [56, y - 26],
        [40, y - 40],
        [40, y],
      ],
      0.5,
      { smooth: true },
    );
    part(scallop(ovalRing(70, y + 2, 11, 11), 2.2, 6, seed), 0.02, { smooth: true, weight: 0.7 });
    part(
      scallop(
        flat(
          [
            [-52, y - 12],
            [52, y - 12],
            [52, y + 5],
            [-52, y + 5],
          ],
          3,
        ),
        2,
        7,
        seed,
      ),
      0.02,
      { smooth: true, weight: 0.7 },
    );
  }
  paint(b, h);
}
