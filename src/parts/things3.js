import { rng } from "../core/random.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, poly, scallop, segment, spline } from "./kit.js";

const rounded = (x, y, w, h, r) => [
  [x + r, y],
  [x + w - r, y],
  [x + w, y + r],
  [x + w, y + h - r],
  [x + w - r, y + h],
  [x + r, y + h],
  [x, y + h - r],
  [x, y + r],
];

const box = (x, y, w, h) => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

function wheel(b, x, y, r) {
  b.lines.push({ pts: oval(x, y, r, r, { start: -1.2 }), weight: 1 });
  b.lines.push({ pts: oval(x, y, r * 0.42, r * 0.42), weight: 0.7 });
  b.washes.push({ rings: [ovalRing(x, y, r, r)], tone: 0.62, part: "wheels" });
  b.knock.push(ovalRing(x, y, r + 1, r + 1));
}

function jet(b, x, y, len = 46) {
  b.lines.push(
    poly(
      [
        [x - 10, y],
        [x + 10, y],
        [x + 7, y + 12],
        [x - 7, y + 12],
      ],
      { closed: true, weight: 0.8 },
    ),
  );
  b.washes.push({
    rings: [
      flat(
        [
          [x - 10, y],
          [x + 10, y],
          [x + 7, y + 12],
          [x - 7, y + 12],
        ],
        3,
      ),
    ],
    tone: 0.5,
  });
  b.lines.push(
    line(
      [
        [x - 7, y + 14],
        [x - 10, y + len * 0.55],
        [x - 3, y + len * 0.4],
        [x, y + len],
        [x + 3, y + len * 0.4],
        [x + 10, y + len * 0.55],
        [x + 7, y + 14],
      ],
      { weight: 0.7 },
    ),
  );
}

function speed(b, x, ys, len = 40) {
  for (const y of ys) b.lines.push(segment([x - len, y], [x, y], { weight: 0.45 }));
}

function canopy(b, cx, cy, rx, ry, seed, tone = 0.32) {
  const base = oval(cx, cy, rx, ry, { overlap: 0, step: 3 });
  const puff = scallop(base, Math.min(rx, ry) * 0.16, Math.max(30, rx * 0.42), seed, { outward: true });
  b.lines.push({ pts: puff, weight: 0.9 });
  b.washes.push({ rings: [puff], tone, part: "leaves" });
  b.knock.push(puff);
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const d = 0.3 + r() * 0.45;
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    b.lines.push(
      line(
        [
          [x - 10, y + 4],
          [x - 2, y - 4],
          [x + 8, y + 2],
        ],
        { weight: 0.4 },
      ),
    );
  }
}

export const NATURE_THINGS = {
  flyingtruck: {
    label: "Flying truck",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    zone: "sky",
    build() {
      const b = build();
      const body = [
        [-132, -10],
        [-132, -46],
        [-14, -82],
        [130, -38],
        [134, -12],
        [124, -4],
        [104, -4],
        [100, -28],
        [54, -28],
        [50, -4],
        [-58, -4],
        [-62, -28],
        [-108, -28],
        [-112, -4],
        [-128, -4],
      ];
      b.lines.push(poly(body, { closed: true, weight: 1.05 }));
      b.washes.push({ rings: [flat(body, 5)], tone: 0.16 });
      const glass = [
        [-74, -50],
        [-16, -70],
        [64, -44],
        [-70, -38],
      ];
      b.lines.push(poly(glass, { closed: true, weight: 0.75 }));
      b.washes.push({ rings: [flat(glass, 4)], tone: 0.58, part: "windows" });
      b.lines.push(segment([-8, -40], [-6, -8], { weight: 0.55 }), segment([-132, -22], [134, -22], { weight: 0.4 }));
      b.lines.push(segment([110, -30], [132, -30], { weight: 0.9 }));
      wheel(b, -85, -6, 21);
      wheel(b, 77, -6, 21);
      jet(b, -30, -2, 40);
      jet(b, 22, -2, 40);
      speed(b, -150, [-58, -40, -22], 46);
      b.knock.push(flat(body));
      return b;
    },
  },
  flyingcar: {
    label: "Flying car",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    zone: "sky",
    build() {
      const b = build();
      const body = [
        [-124, -8],
        [-128, -30],
        [-84, -38],
        [-62, -66],
        [14, -70],
        [48, -42],
        [116, -36],
        [126, -18],
        [120, -6],
        [100, -6],
        [96, -24],
        [50, -24],
        [46, -6],
        [-56, -6],
        [-60, -24],
        [-104, -24],
        [-108, -6],
      ];
      b.lines.push(loop(body, { weight: 1.05, overlap: 0.02, step: 2 }));
      b.washes.push({ rings: [area(body)], tone: 0.22 });
      const glass = [
        [-56, -60],
        [10, -64],
        [36, -42],
        [-66, -40],
      ];
      b.lines.push(poly(glass, { closed: true, weight: 0.75 }));
      b.washes.push({ rings: [flat(glass, 4)], tone: 0.55, part: "windows" });
      b.lines.push(segment([-14, -60], [-12, -40], { weight: 0.6 }), segment([-12, -38], [-10, -10], { weight: 0.5 }));
      b.lines.push(
        line(
          [
            [-96, -30],
            [-150, -20],
            [-100, -18],
          ],
          { weight: 0.85 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [-96, -30],
            [-150, -20],
            [-100, -18],
          ]),
        ],
        tone: 0.4,
      });
      b.lines.push({ pts: oval(118, -26, 5, 4), weight: 0.6 });
      wheel(b, -82, -6, 18);
      wheel(b, 73, -6, 18);
      b.lines.push(
        poly(
          [
            [-134, -22],
            [-128, -30],
            [-128, -14],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        line(
          [
            [-140, -22],
            [-164, -30],
            [-176, -18],
            [-196, -26],
          ],
          { weight: 0.6 },
        ),
        line(
          [
            [-140, -16],
            [-170, -10],
            [-188, -14],
          ],
          { weight: 0.5 },
        ),
      );
      speed(b, -150, [-56, -44], 40);
      b.knock.push(
        area(body),
        area([
          [-96, -30],
          [-150, -20],
          [-100, -18],
        ]),
      );
      return b;
    },
  },
  stump: {
    label: "Tree stump",
    zone: "floor",
    build() {
      const b = build();
      const side = [
        [-58, -126],
        [-60, -60],
        [-66, -16],
        [-92, 0],
        [92, 0],
        [66, -14],
        [60, -60],
        [58, -126],
      ];
      b.lines.push(
        line(
          [
            [-58, -126],
            [-60, -60],
            [-66, -16],
            [-92, 0],
          ],
          { weight: 1 },
        ),
        line(
          [
            [58, -126],
            [60, -60],
            [66, -14],
            [92, 0],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        line(
          [
            [-92, 0],
            [-40, 3],
            [0, 0],
            [44, 4],
            [92, 0],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push({ pts: oval(0, -126, 58, 16), weight: 1 });
      for (const k of [0.68, 0.4, 0.16]) b.lines.push({ pts: oval(-2, -126, 58 * k, 16 * k, { start: 0.4 + k }), weight: 0.45 });
      for (const x of [-36, -6, 24, 46])
        b.lines.push(
          line(
            [
              [x, -104],
              [x + 3, -60],
              [x - 2, -20],
            ],
            { weight: 0.42 },
          ),
        );
      b.lines.push(
        line(
          [
            [-66, -16],
            [-78, -30],
            [-74, -44],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [66, -14],
            [80, -26],
          ],
          { weight: 0.5 },
        ),
      );
      b.washes.push({ rings: [area(side)], tone: 0.34 });
      b.washes.push({ rings: [ovalRing(0, -126, 56, 15)], tone: 0.14 });
      b.knock.push(area(side), ovalRing(0, -126, 59, 17));
      return b;
    },
  },
  logs: {
    label: "Log pile",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(14);
      const ends = [
        [-90, -28],
        [-30, -28],
        [30, -28],
        [90, -28],
        [-60, -78],
        [0, -78],
        [60, -78],
        [-30, -126],
        [30, -126],
      ];
      b.lines.push(segment([-120, -2], [120, -2], { weight: 0.6 }));
      for (const [x, y] of ends) {
        const rr = 28 + r() * 3;
        b.lines.push({ pts: oval(x, y, rr, rr), weight: 0.95 });
        b.lines.push({ pts: oval(x + 1, y, rr * 0.55, rr * 0.55, { start: r() * 6 }), weight: 0.4 });
        b.solids.push(dot(x, y, 2.4));
        b.washes.push({ rings: [ovalRing(x, y, rr, rr)], tone: 0.16 });
        b.knock.push(ovalRing(x, y, rr + 1, rr + 1));
      }
      return b;
    },
  },
  factory: {
    label: "Factory",
    zone: "floor",
    build() {
      const b = build();
      const roof = [
        [-240, 0],
        [-240, -110],
        [-180, -150],
        [-180, -110],
        [-120, -150],
        [-120, -110],
        [-60, -150],
        [-60, -110],
        [0, -150],
        [0, -110],
        [60, -110],
        [60, 0],
      ];
      b.lines.push(poly(roof, { weight: 1 }));
      b.washes.push({ rings: [flat(roof.concat([[-240, 0]]), 6)], tone: 0.38 });
      for (let x = -226; x < 50; x += 34) b.lines.push(poly(box(x, -90, 18, 26), { closed: true, weight: 0.5 }));
      const stacks = [
        [110, -330],
        [170, -390],
        [226, -300],
      ];
      for (const [x, top] of stacks) {
        const s = [
          [x - 18, 0],
          [x - 12, top],
          [x + 12, top],
          [x + 18, 0],
        ];
        b.lines.push(poly(s, { weight: 1 }));
        b.lines.push(
          poly(
            [
              [x - 15, top + 12],
              [x + 15, top + 12],
            ],
            { weight: 0.5 },
          ),
          poly(
            [
              [x - 16, top + 30],
              [x + 16, top + 30],
            ],
            { weight: 0.5 },
          ),
        );
        b.washes.push({ rings: [flat(s, 5)], tone: 0.46 });
        b.knock.push(flat(s));
        const len = 260 + (x % 3) * 30;
        const upper = [];
        const lower = [];
        for (let k = 0; k <= 24; k++) {
          const t = k / 24;
          const cx = x + t * len;
          const cy = top - 30 - Math.sin(t * Math.PI * 0.6) * 90 + t * t * 40;
          const half = 9 + t * 34;
          const wave = Math.sin(t * 19 + x) * (2 + t * 6);
          upper.push([cx, cy - half + wave]);
          lower.push([cx + 6, cy + half * 0.7 - wave * 0.4]);
        }
        upper.unshift([x - 9, top]);
        lower.unshift([x + 9, top]);
        const plume = spline(upper.concat(lower.reverse()), { closed: true, step: 3 });
        b.lines.push({ pts: spline(upper, { step: 3 }), weight: 0.7 }, { pts: spline(lower.slice().reverse(), { step: 3 }), weight: 0.45 });
        b.washes.push({ rings: [plume], tone: 0.5 });
      }
      b.lines.push(
        poly(
          [
            [60, 0],
            [60, -60],
            [250, -60],
            [250, 0],
          ],
          { weight: 0.9 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [60, 0],
              [60, -60],
              [250, -60],
              [250, 0],
            ],
            6,
          ),
        ],
        tone: 0.3,
      });
      b.knock.push(
        flat(roof.concat([[-240, 0]])),
        flat([
          [60, 0],
          [60, -60],
          [250, -60],
          [250, 0],
        ]),
      );
      return b;
    },
  },
  sapling: {
    label: "Sapling",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [0, 0],
            [2, -30],
            [-2, -58],
            [1, -80],
          ],
          { weight: 0.75 },
        ),
      );
      b.lines.push(
        loop(
          [
            [1, -64],
            [-14, -74],
            [-26, -70],
            [-12, -62],
          ],
          { weight: 0.6 },
        ),
        loop(
          [
            [0, -78],
            [14, -92],
            [26, -88],
            [12, -78],
          ],
          { weight: 0.6 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [1, -64],
            [-14, -74],
            [-26, -70],
            [-12, -62],
          ]),
          area([
            [0, -78],
            [14, -92],
            [26, -88],
            [12, -78],
          ]),
        ],
        tone: 0.3,
      });
      b.lines.push(
        line(
          [
            [-20, 2],
            [0, -2],
            [22, 2],
          ],
          { weight: 0.5 },
        ),
      );
      return b;
    },
  },
  cracks: {
    label: "Cracked earth",
    zone: "back",
    build() {
      const b = build();
      const r = rng(23);
      for (let i = 0; i < 16; i++) {
        let x = -460 + r() * 920;
        let y = 10 + r() * 150;
        const pts = [[x, y]];
        for (let k = 0; k < 4; k++) {
          x += (r() - 0.5) * 70;
          y += (r() - 0.3) * 30;
          pts.push([x, y]);
        }
        b.lines.push(poly(pts, { weight: 0.45 }));
      }
      b.washes.push({
        rings: [
          area([
            [-470, 0],
            [470, 0],
            [466, 130],
            [420, 172],
            [0, 178],
            [-420, 172],
            [-466, 130],
          ]),
        ],
        tone: 0.2,
      });
      return b;
    },
  },
  bench: {
    label: "Park bench",
    zone: "floor",
    build() {
      const b = build();
      for (const y of [-300, -260, -220])
        b.lines.push(
          poly(
            [
              [-250, y],
              [250, y - 6],
              [250, y + 22],
              [-250, y + 26],
            ],
            { closed: true, weight: 0.85 },
          ),
        );
      for (const y of [-150, -126])
        b.lines.push(
          poly(
            [
              [-270, y],
              [270, y - 4],
              [276, y + 16],
              [-276, y + 20],
            ],
            { closed: true, weight: 0.85 },
          ),
        );
      for (const x of [-220, 210]) {
        b.lines.push(
          poly(
            [
              [x - 8, -300],
              [x + 8, -300],
              [x + 12, 0],
              [x - 4, 0],
            ],
            { closed: true, weight: 0.9 },
          ),
        );
        b.lines.push(
          line(
            [
              [x - 4, -110],
              [x + 40, -100],
              [x + 60, 0],
            ],
            { weight: 0.8 },
          ),
        );
      }
      b.washes.push({
        rings: [
          flat(
            [
              [-250, -300],
              [250, -306],
              [250, -172],
              [-250, -168],
            ],
            6,
          ),
          flat(
            [
              [-270, -150],
              [270, -154],
              [276, -88],
              [-276, -84],
            ],
            6,
          ),
        ],
        tone: 0.3,
      });
      b.knock.push(
        flat([
          [-250, -302],
          [250, -308],
          [250, -170],
          [-250, -166],
        ]),
        flat([
          [-278, -152],
          [278, -156],
          [278, -86],
          [-278, -82],
        ]),
        flat([
          [-232, -82],
          [-210, -82],
          [-204, 0],
          [-226, 0],
        ]),
        flat([
          [198, -82],
          [222, -82],
          [226, 0],
          [204, 0],
        ]),
      );
      return b;
    },
  },
  tree: {
    label: "Tree",
    main: "Trunk",
    parts: { leaves: "Leaves" },
    zone: "floor",
    build() {
      const b = build();
      const trunk = [
        [-26, 0],
        [-20, -200],
        [-30, -300],
        [-10, -330],
        [12, -320],
        [24, -220],
        [30, 0],
      ];
      b.lines.push(
        line(
          [
            [-26, 0],
            [-20, -200],
            [-30, -300],
          ],
          { weight: 1.05 },
        ),
        line(
          [
            [30, 0],
            [24, -220],
            [12, -320],
          ],
          { weight: 1.05 },
        ),
      );
      b.lines.push(
        line(
          [
            [-20, -200],
            [-70, -260],
            [-90, -300],
          ],
          { weight: 0.9 },
        ),
        line(
          [
            [24, -220],
            [70, -280],
            [80, -320],
          ],
          { weight: 0.9 },
        ),
      );
      b.washes.push({ rings: [area(trunk)], tone: 0.34 });
      b.knock.push(area(trunk));
      canopy(b, 0, -430, 210, 160, 4);
      b.lines.push(
        line(
          [
            [-60, 2],
            [0, -2],
            [70, 3],
          ],
          { weight: 0.5 },
        ),
      );
      return b;
    },
  },
  pine: {
    label: "Pine tree",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-14, 0],
            [-12, -70],
            [12, -70],
            [14, 0],
          ],
          { weight: 0.95 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [-14, 0],
              [-12, -70],
              [12, -70],
              [14, 0],
            ],
            4,
          ),
        ],
        tone: 0.4,
      });
      const tiers = [
        [-150, -70, -230],
        [-120, -190, -340],
        [-90, -300, -440],
        [-60, -400, -520],
      ];
      for (const [hw, base, tip] of tiers) {
        const tier = [
          [hw, base],
          [hw * 0.55, base - 16],
          [0, tip],
          [-hw * 0.55, base - 16],
          [-hw, base],
          [-hw * 0.5, base + 8],
          [0, base + 2],
          [hw * 0.5, base + 8],
        ];
        b.lines.push(loop(tier, { weight: 0.9, overlap: 0.03 }));
        b.washes.push({ rings: [area(tier)], tone: 0.36 });
        b.knock.push(area(tier));
      }
      return b;
    },
  },
  lamppost: {
    label: "Lamppost",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-10, 0],
            [-6, -560],
            [6, -560],
            [10, 0],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-30, 0],
            [-24, -40],
            [24, -40],
            [30, 0],
          ],
          { closed: true, weight: 0.9 },
        ),
      );
      const lantern = [
        [-30, -560],
        [30, -560],
        [40, -640],
        [-40, -640],
      ];
      b.lines.push(poly(lantern, { closed: true, weight: 0.95 }));
      b.lines.push(
        poly(
          [
            [-48, -640],
            [48, -640],
            [0, -680],
          ],
          { closed: true, weight: 0.95 },
        ),
      );
      b.lines.push(segment([0, -560], [0, -640], { weight: 0.5 }));
      b.washes.push({
        rings: [
          flat(
            [
              [-10, 0],
              [-6, -560],
              [6, -560],
              [10, 0],
            ],
            6,
          ),
        ],
        tone: 0.5,
      });
      b.washes.push({ rings: [flat(lantern, 4)], tone: 0.08 });
      b.knock.push(
        flat([
          [-30, 0],
          [-24, -40],
          [-8, -40],
          [-6, -560],
          [-30, -560],
          [-40, -640],
          [-48, -640],
          [0, -682],
          [48, -640],
          [40, -640],
          [30, -560],
          [6, -560],
          [8, -40],
          [24, -40],
          [30, 0],
        ]),
      );
      return b;
    },
  },
  pigeons: {
    label: "Pigeons",
    zone: "floor",
    build() {
      const b = build();
      const pigeon = (x, dir) => {
        const body = [
          [x - 30 * dir, -20],
          [x - 10 * dir, -34],
          [x + 12 * dir, -32],
          [x + 22 * dir, -46],
          [x + 34 * dir, -44],
          [x + 36 * dir, -34],
          [x + 26 * dir, -26],
          [x + 20 * dir, -10],
          [x - 4 * dir, -6],
          [x - 40 * dir, -14],
        ];
        b.lines.push(loop(body, { weight: 0.8, overlap: 0.03 }));
        b.washes.push({ rings: [area(body)], tone: 0.4 });
        b.solids.push(
          dot(x + 29 * dir, -40, 1.8),
          area([
            [x + 36 * dir, -38],
            [x + 44 * dir, -36],
            [x + 36 * dir, -34],
          ]),
        );
        b.lines.push(segment([x + 2 * dir, -6], [x, 0], { weight: 0.5 }), segment([x + 8 * dir, -6], [x + 8 * dir, 0], { weight: 0.5 }));
        b.knock.push(area(body));
      };
      pigeon(-50, 1);
      pigeon(50, -1);
      return b;
    },
  },
  ottoman: {
    label: "Gallery bench",
    zone: "floor",
    build() {
      const b = build();
      const top = [
        [-200, -110],
        [200, -110],
        [214, -80],
        [-214, -80],
      ];
      b.lines.push(poly(top, { closed: true, weight: 1 }));
      b.washes.push({ rings: [flat(top, 5)], tone: 0.45 });
      for (const x of [-190, -100, 100, 190]) b.lines.push(segment([x, -80], [x, 0], { weight: 0.85 }));
      b.knock.push(
        flat(top),
        flat([
          [-196, -80],
          [-184, -80],
          [-184, 0],
          [-196, 0],
        ]),
        flat([
          [184, -80],
          [196, -80],
          [196, 0],
          [184, 0],
        ]),
      );
      return b;
    },
  },
  abstract: {
    label: "Abstract painting",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push(poly(box(-150, -110, 300, 220), { closed: true, weight: 1.05 }), poly(box(-138, -98, 276, 196), { closed: true, weight: 0.6 }));
      b.lines.push({ pts: oval(-50, -10, 50, 50), weight: 0.8 });
      b.washes.push({ rings: [ovalRing(-50, -10, 48, 48)], tone: 0.5 });
      b.lines.push(
        poly(
          [
            [20, 80],
            [70, -70],
            [120, 80],
          ],
          { closed: true, weight: 0.8 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [24, 78],
              [70, -64],
              [116, 78],
            ],
            4,
          ),
        ],
        tone: 0.22,
      });
      b.lines.push(segment([-130, 60], [130, 40], { weight: 1.2 }));
      b.knock.push(flat(box(-150, -110, 300, 220)));
      return b;
    },
  },
  stanchions: {
    label: "Velvet rope",
    zone: "floor",
    build() {
      const b = build();
      for (const x of [-220, 220]) {
        b.lines.push(
          poly(
            [
              [x - 5, 0],
              [x - 4, -190],
              [x + 4, -190],
              [x + 5, 0],
            ],
            { weight: 0.9 },
          ),
        );
        b.lines.push({ pts: oval(x, -196, 10, 9), weight: 0.85 }, { pts: oval(x, -2, 26, 6), weight: 0.8 });
        b.knock.push(
          flat([
            [x - 6, 0],
            [x - 6, -200],
            [x + 6, -200],
            [x + 6, 0],
          ]),
        );
      }
      const rope = spline([
        [-212, -180],
        [-100, -110],
        [0, -96],
        [100, -110],
        [212, -180],
      ]);
      b.lines.push({ pts: rope, weight: 1.6 });
      return b;
    },
  },
  subway: {
    label: "Subway car",
    zone: "back",
    build() {
      const b = build();
      const wall = [
        [-500, -640],
        [500, -640],
        [500, -120],
        [-500, -120],
      ];
      b.washes.push({ rings: [flat(wall, 10)], tone: 0.08 });
      b.lines.push(segment([-500, -640], [500, -640], { weight: 1 }), segment([-500, -120], [500, -120], { weight: 1 }));
      for (let x = -470; x < 300; x += 180) {
        const ad = [
          [x, -604],
          [x + 150, -604],
          [x + 150, -566],
          [x, -566],
        ];
        b.lines.push(poly(ad, { closed: true, weight: 0.6 }));
        b.washes.push({ rings: [flat(ad, 4)], tone: 0.16 });
      }
      b.lines.push(segment([-500, -622], [330, -622], { weight: 0.9 }));
      for (let x = -440; x < 320; x += 95) {
        b.lines.push(
          line(
            [
              [x, -622],
              [x + 2, -600],
              [x, -586],
            ],
            { weight: 0.5 },
          ),
        );
        b.lines.push({ pts: oval(x, -574, 10, 13), weight: 0.6 });
      }
      for (const [x0, x1] of [
        [-462, -258],
        [-226, -22],
        [10, 214],
      ]) {
        const win = rounded(x0, -540, x1 - x0, 190, 24);
        b.lines.push(loop(win, { weight: 0.95, overlap: 0.03 }));
        b.washes.push({ rings: [area(win)], tone: 0.55 });
        for (const [y, k] of [
          [-500, 0.5],
          [-430, 0.3],
        ])
          b.lines.push(segment([x0 + 30, y], [x0 + 30 + (x1 - x0) * k, y], { weight: 0.4, color: "chalk" }));
      }
      const door = [
        [300, -600],
        [480, -600],
        [480, -120],
        [300, -120],
      ];
      b.lines.push(poly(door, { closed: true, weight: 1 }), segment([390, -600], [390, -120], { weight: 0.8 }));
      b.washes.push({ rings: [flat(door, 8)], tone: 0.14 });
      for (const x of [314, 404]) {
        const glass = rounded(x, -540, 72, 170, 14);
        b.lines.push(loop(glass, { weight: 0.75, overlap: 0.03 }));
        b.washes.push({ rings: [area(glass)], tone: 0.55 });
      }
      const cushion = rounded(-490, -312, 770, 52, 12);
      b.lines.push(poly(cushion, { closed: true, weight: 1 }));
      b.washes.push({ rings: [flat(cushion, 6)], tone: 0.34 });
      for (let x = -360; x < 280; x += 128) b.lines.push(segment([x, -308], [x, -264], { weight: 0.5 }));
      const base = [
        [-480, -260],
        [270, -260],
        [262, -150],
        [-472, -150],
      ];
      b.lines.push(poly(base, { closed: true, weight: 0.85 }));
      b.washes.push({ rings: [flat(base, 6)], tone: 0.24 });
      b.washes.push({
        rings: [
          flat(
            [
              [-500, -120],
              [500, -120],
              [500, 0],
              [-500, 0],
            ],
            10,
          ),
        ],
        tone: 0.12,
      });
      for (const x of [-300, -30, 240]) {
        const pole = [
          [x - 7, -622],
          [x + 7, -622],
          [x + 7, 0],
          [x - 7, 0],
        ];
        b.lines.push(poly(pole, { closed: true, weight: 0.8 }));
        b.washes.push({ rings: [flat(pole, 6)], paper: true });
      }
      return b;
    },
  },
  conference: {
    label: "Conference table",
    zone: "floor",
    build() {
      const b = build();
      const top = [
        [-380, -40],
        [380, -40],
        [250, -170],
        [-250, -170],
      ];
      b.lines.push(poly(top, { closed: true, weight: 1.05 }));
      b.lines.push(
        poly(
          [
            [-380, -40],
            [-380, -24],
            [380, -24],
            [380, -40],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(segment([-300, -24], [-300, 0], { weight: 0.9 }), segment([300, -24], [300, 0], { weight: 0.9 }));
      b.washes.push({ rings: [flat(top, 8)], tone: 0.3 });
      for (const [x, y] of [
        [-200, -150],
        [-60, -150],
        [80, -150],
        [200, -150],
      ]) {
        const back = [
          [x - 34, y],
          [x - 30, y - 70],
          [x + 30, y - 70],
          [x + 34, y],
        ];
        b.lines.push(poly(back, { weight: 0.9 }));
        b.washes.push({ rings: [flat(back, 4)], tone: 0.5 });
      }
      b.knock.push(
        flat([
          [-380, -40],
          [380, -40],
          [380, -24],
          [-380, -24],
        ]),
        flat(top),
      );
      return b;
    },
  },
  easel: {
    label: "Chart on an easel",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        segment([-70, 0], [-30, -330], { weight: 0.9 }),
        segment([70, 0], [30, -330], { weight: 0.9 }),
        segment([0, -60], [0, -340], { weight: 0.7 }),
      );
      const board = [
        [-90, -340],
        [90, -340],
        [90, -140],
        [-90, -140],
      ];
      b.lines.push(poly(board, { closed: true, weight: 1 }));
      b.lines.push(
        poly(
          [
            [-70, -170],
            [-70, -320],
          ],
          { weight: 0.6 },
        ),
        poly(
          [
            [-70, -170],
            [74, -170],
          ],
          { weight: 0.6 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-64, -190],
            [-30, -230],
            [0, -210],
            [30, -270],
            [70, -300],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [56, -300],
            [70, -300],
            [68, -286],
          ],
          { weight: 0.9 },
        ),
      );
      b.knock.push(flat(board));
      return b;
    },
  },
  bed: {
    label: "Bed",
    zone: "floor",
    build() {
      const b = build();
      const head = [
        [-340, -300],
        [-310, -330],
        [-280, -300],
        [-280, -60],
        [-340, -60],
      ];
      b.lines.push(poly(head, { closed: true, weight: 1 }));
      b.washes.push({ rings: [flat(head, 4)], tone: 0.4 });
      b.lines.push(
        poly(
          [
            [-280, -150],
            [330, -150],
            [330, -70],
            [-280, -70],
          ],
          { closed: true, weight: 1 },
        ),
      );
      b.lines.push(
        line(
          [
            [-270, -150],
            [-260, -190],
            [-150, -196],
            [-140, -150],
          ],
          { weight: 0.9 },
        ),
      );
      const blanket = [
        [-120, -156],
        [-110, -176],
        [320, -170],
        [336, -150],
        [338, -90],
        [-120, -96],
      ];
      b.lines.push(loop(blanket, { weight: 0.95, overlap: 0.02 }));
      b.washes.push({ rings: [area(blanket)], tone: 0.26 });
      for (const x of [-330, 320])
        b.lines.push(
          poly(
            [
              [x, -60],
              [x, 0],
              [x + 14, 0],
              [x + 14, -60],
            ],
            { weight: 0.8 },
          ),
        );
      b.knock.push(
        flat(head),
        flat([
          [-280, -200],
          [340, -180],
          [340, -60],
          [-280, -60],
        ]),
        flat([
          [-332, -60],
          [-316, -60],
          [-316, 0],
          [-332, 0],
        ]),
        flat([
          [318, -60],
          [336, -60],
          [336, 0],
          [318, 0],
        ]),
      );
      return b;
    },
  },
  nightstand: {
    label: "Nightstand & lamp",
    zone: "floor",
    build() {
      const b = build();
      const stand = [
        [-60, -150],
        [60, -150],
        [60, 0],
        [-60, 0],
      ];
      b.lines.push(poly(stand, { closed: true, weight: 1 }), segment([-60, -90], [60, -90], { weight: 0.6 }));
      b.solids.push(dot(0, -120, 3));
      b.washes.push({ rings: [flat(stand, 5)], tone: 0.3 });
      b.lines.push(
        poly(
          [
            [-30, -260],
            [30, -260],
            [44, -210],
            [-44, -210],
          ],
          { closed: true, weight: 0.9 },
        ),
      );
      b.lines.push(segment([0, -210], [0, -164], { weight: 0.8 }), { pts: oval(0, -158, 22, 7), weight: 0.8 });
      b.washes.push({
        rings: [
          flat(
            [
              [-30, -260],
              [30, -260],
              [44, -210],
              [-44, -210],
            ],
            4,
          ),
        ],
        tone: 0.1,
      });
      b.knock.push(
        flat(stand),
        flat([
          [-44, -262],
          [44, -262],
          [44, -150],
          [-44, -150],
        ]),
      );
      return b;
    },
  },
  fridge: {
    label: "Fridge",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-120, -560],
        [120, -560],
        [120, 0],
        [-120, 0],
      ];
      b.lines.push(
        poly(
          [
            [-108, -560],
            [108, -560],
            [120, -548],
            [120, -6],
            [114, 0],
            [-114, 0],
            [-120, -6],
            [-120, -548],
          ],
          { closed: true, weight: 1.05 },
        ),
      );
      b.lines.push(segment([-120, -380], [120, -380], { weight: 0.8 }));
      b.lines.push(
        poly(
          [
            [90, -520],
            [96, -520],
            [96, -420],
            [90, -420],
          ],
          { closed: true, weight: 0.8 },
        ),
        poly(
          [
            [90, -350],
            [96, -350],
            [96, -220],
            [90, -220],
          ],
          { closed: true, weight: 0.8 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-80, -330],
            [-20, -334],
            [-22, -270],
            [-82, -266],
          ],
          { closed: true, weight: 0.55 },
        ),
        poly(
          [
            [-10, -320],
            [40, -318],
            [38, -280],
            [-8, -282],
          ],
          { closed: true, weight: 0.55 },
        ),
      );
      b.washes.push({ rings: [flat(body, 8)], tone: 0.08 });
      b.knock.push(flat(body));
      return b;
    },
  },
  counter: {
    label: "Kitchen counter",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-310, -310],
            [310, -310],
            [316, -290],
            [-316, -290],
          ],
          { closed: true, weight: 1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-300, -290],
            [-300, 0],
            [300, 0],
            [300, -290],
          ],
          { weight: 1 },
        ),
      );
      for (let x = -300; x < 300; x += 150)
        b.lines.push(poly(box(x + 12, -276, 126, 260), { closed: true, weight: 0.55 }), segment([x + 120, -240], [x + 120, -200], { weight: 1 }));
      b.lines.push(
        line(
          [
            [-120, -310],
            [-120, -380],
            [-80, -390],
            [-60, -370],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(
        poly(
          [
            [140, -360],
            [220, -360],
            [214, -310],
            [146, -310],
          ],
          { closed: true, weight: 0.8 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [-300, -290],
              [300, -290],
              [300, 0],
              [-300, 0],
            ],
            8,
          ),
        ],
        tone: 0.24,
      });
      b.knock.push(
        flat([
          [-316, -312],
          [316, -312],
          [316, -290],
          [300, -290],
          [300, 0],
          [-300, 0],
          [-300, -290],
          [-316, -290],
        ]),
      );
      return b;
    },
  },
  judgebench: {
    label: "Judge's bench",
    zone: "floor",
    build() {
      const b = build();
      const front = [
        [-300, -330],
        [300, -330],
        [300, 0],
        [-300, 0],
      ];
      b.lines.push(
        poly(
          [
            [-316, -346],
            [316, -346],
            [316, -330],
            [-316, -330],
          ],
          { closed: true, weight: 1 },
        ),
      );
      b.lines.push(poly(front, { weight: 1 }));
      for (let x = -280; x < 280; x += 140) b.lines.push(poly(box(x + 14, -300, 112, 270), { closed: true, weight: 0.55 }));
      b.lines.push(poly(box(-60, -260, 120, 70), { closed: true, weight: 0.7 }));
      b.lines.push({ pts: oval(0, -225, 20, 20), weight: 0.6 });
      b.washes.push({ rings: [flat(front, 8)], tone: 0.42 });
      b.lines.push(
        poly(
          [
            [200, -360],
            [250, -372],
            [254, -362],
            [204, -350],
          ],
          { closed: true, weight: 0.8 },
        ),
        segment([228, -366], [236, -390], { weight: 0.9 }),
      );
      b.knock.push(
        flat([
          [-316, -346],
          [316, -346],
          [316, -330],
          [300, -330],
          [300, 0],
          [-300, 0],
          [-300, -330],
          [-316, -330],
        ]),
      );
      return b;
    },
  },
  flag: {
    label: "Flag",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(segment([0, 0], [0, -460], { weight: 1 }));
      b.lines.push({ pts: oval(0, -468, 8, 8), weight: 0.8 });
      b.lines.push(
        poly(
          [
            [-30, 0],
            [30, 0],
            [22, -20],
            [-22, -20],
          ],
          { closed: true, weight: 0.8 },
        ),
      );
      const cloth = [
        [4, -452],
        [96, -448],
        [104, -400],
        [100, -330],
        [86, -270],
        [58, -236],
        [30, -246],
        [6, -280],
      ];
      b.lines.push(line(cloth, { weight: 0.9 }));
      for (const x of [28, 52, 76])
        b.lines.push(
          line(
            [
              [x, -446],
              [x + 4, -360],
              [x - 2, -262],
            ],
            { weight: 0.45 },
          ),
        );
      b.lines.push(
        line(
          [
            [4, -300],
            [10, -280],
            [30, -256],
          ],
          { weight: 0.6 },
        ),
      );
      b.washes.push({ rings: [area(cloth)], tone: 0.28 });
      b.knock.push(area(cloth));
      return b;
    },
  },
  tent: {
    label: "Tent",
    zone: "floor",
    build() {
      const b = build();
      const outer = [
        [-240, 0],
        [-20, -280],
        [230, 0],
      ];
      b.lines.push(poly(outer, { closed: true, weight: 1.05 }));
      b.lines.push(
        poly(
          [
            [-20, -280],
            [-60, 0],
          ],
          { weight: 0.8 },
        ),
        poly(
          [
            [-20, -280],
            [40, 0],
          ],
          { weight: 0.8 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [-60, 0],
              [-20, -270],
              [40, 0],
            ],
            5,
          ),
        ],
        tone: 0.62,
      });
      b.washes.push({ rings: [flat(outer, 6)], tone: 0.2 });
      b.lines.push(
        segment([-20, -280], [-30, -310], { weight: 0.8 }),
        segment([-240, 0], [-290, 20], { weight: 0.5 }),
        segment([230, 0], [280, 18], { weight: 0.5 }),
      );
      b.knock.push(flat(outer));
      return b;
    },
  },
};
