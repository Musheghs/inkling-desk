import { rng } from "../../core/random.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, poly, scallop, segment, spline } from "../kit.js";
import { arch, disc, rounded, shape } from "./draw.js";

function leafyCanopy(b, cx, cy, rx, ry, seed, tone = 0.32) {
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

function canopy(b, cx, cy, rx, ry, seed, tone = 0.32) {
  const puff = scallop(oval(cx, cy, rx, ry, { overlap: 0, step: 3 }), Math.min(rx, ry) * 0.16, Math.max(30, rx * 0.42), seed, { outward: true });
  b.lines.push({ pts: puff, weight: 0.9 });
  b.washes.push({ rings: [puff], tone, part: "leaves" });
  b.knock.push(puff);
}

export const OUTDOORS = {
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
      leafyCanopy(b, 0, -430, 210, 160, 4);
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
  appletree: {
    label: "Apple tree",
    main: "Trunk",
    parts: { leaves: "Leaves", apples: "Apples" },
    words: "eden orchard fruit",
    zone: "floor",
    build() {
      const b = build();
      const trunk = [
        [-24, 0],
        [-18, -180],
        [-30, -256],
        [24, -256],
        [22, -180],
        [28, 0],
      ];
      b.lines.push(
        line(
          [
            [-24, 0],
            [-18, -180],
            [-30, -258],
          ],
          { weight: 1.05 },
        ),
        line(
          [
            [28, 0],
            [22, -180],
            [24, -258],
          ],
          { weight: 1.05 },
        ),
      );
      b.washes.push({ rings: [flat(trunk, 5)], tone: 0.34 });
      b.knock.push(flat(trunk));
      canopy(b, 0, -400, 200, 150, 6);
      for (const [x, y] of [
        [-120, -430],
        [-60, -480],
        [20, -450],
        [100, -480],
        [140, -400],
        [-140, -360],
        [-40, -380],
        [60, -360],
        [10, -310],
        [-90, -300],
        [110, -310],
      ]) {
        b.lines.push({ pts: oval(x, y, 11, 11), weight: 0.75 });
        b.washes.push({ rings: [ovalRing(x, y, 10, 10)], tone: 0.62, part: "apples" });
        b.lines.push(segment([x, y - 11], [x + 3, y - 18], { weight: 0.5 }));
      }
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
  palm: {
    label: "Palm tree",
    zone: "floor",
    build() {
      const b = build();
      const left = [
        [-14, 0],
        [-12, -100],
        [-2, -200],
        [16, -290],
        [40, -372],
      ];
      const right = [
        [14, 0],
        [12, -100],
        [20, -200],
        [36, -290],
        [56, -370],
      ];
      b.lines.push(line(left), line(right));
      const L = spline(left, { step: 40 });
      const R = spline(right, { step: 40 });
      for (let i = 1; i < Math.min(L.length, R.length) - 1; i++) b.lines.push(segment(L[i], { x: R[i].x, y: R[i].y + 6 }, { weight: 0.5 }));
      const crown = { x: 48, y: -374 };
      const fronds = [
        [-150, -350, -36],
        [-110, -290, -8],
        [-30, -470, 18],
        [92, -478, -22],
        [196, -372, -28],
        [172, -292, 8],
        [60, -262, 0],
      ];
      for (const [tx, ty, bend] of fronds) {
        const mx = (crown.x + tx) / 2 + bend;
        const my = Math.min(crown.y, ty) - 30;
        const spine = spline(
          [
            [crown.x, crown.y],
            [mx, my],
            [tx, ty],
          ],
          { step: 3 },
        );
        const n = spine.length;
        const sideA = [];
        const sideB = [];
        for (let k = 0; k < n; k++) {
          const p = spine[k];
          const q = spine[Math.min(n - 1, k + 1)];
          const o = spine[Math.max(0, k - 1)];
          const dx = q.x - o.x;
          const dy = q.y - o.y;
          const len = Math.hypot(dx, dy) || 1;
          const t = k / (n - 1);
          const w = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 20 * (1 - t * 0.35);
          const tooth = k % 4 < 2 ? 1 : 0.55;
          sideA.push({ x: p.x + (-dy / len) * w * tooth, y: p.y + (dx / len) * w * tooth });
          sideB.push({ x: p.x - (-dy / len) * w * tooth * 0.75, y: p.y - (dx / len) * w * tooth * 0.75 });
        }
        b.lines.push({ pts: sideA, weight: 0.75 }, { pts: sideB, weight: 0.7 });
        b.lines.push({ pts: spine.slice(0, Math.floor(n * 0.85)), weight: 0.45 });
        const leaf = sideA.concat(sideB.slice().reverse());
        b.washes.push({ rings: [leaf], tone: 0.3 });
        b.knock.push(leaf);
      }
      for (const [x, y] of [
        [40, -360],
        [54, -356],
        [46, -348],
      ])
        b.solids.push(dot(x, y, 6));
      b.knock.push(area(left.concat(right.slice().reverse())));
      return b;
    },
  },
  deadtree: {
    label: "Bare tree",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-10, 0],
            [-6, -80],
            [-14, -150],
            [-8, -210],
          ],
          { weight: 1.3 },
        ),
        line(
          [
            [10, 0],
            [8, -70],
            [14, -140],
            [6, -200],
          ],
          { weight: 1.1 },
        ),
      );
      const branch = (pts, w) => b.lines.push(line(pts, { weight: w }));
      branch(
        [
          [-6, -120],
          [-50, -160],
          [-80, -170],
        ],
        0.9,
      );
      branch(
        [
          [-40, -150],
          [-50, -200],
        ],
        0.6,
      );
      branch(
        [
          [8, -110],
          [60, -150],
          [90, -150],
        ],
        0.9,
      );
      branch(
        [
          [50, -142],
          [64, -190],
        ],
        0.6,
      );
      branch(
        [
          [-4, -190],
          [-30, -240],
        ],
        0.7,
      );
      branch(
        [
          [4, -186],
          [30, -250],
        ],
        0.7,
      );
      b.washes.push({
        rings: [
          area([
            [-10, 0],
            [-6, -80],
            [-14, -150],
            [-8, -210],
            [6, -200],
            [14, -140],
            [8, -70],
            [10, 0],
          ]),
        ],
        tone: 0.4,
      });
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
  cactus: {
    label: "Cactus",
    words: "desert dry west",
    zone: "floor",
    build() {
      const b = build();
      const trunk = [
        [-30, 0],
        [-32, -280],
        [-20, -310],
        [0, -316],
        [20, -310],
        [32, -280],
        [30, 0],
      ];
      shape(b, trunk, { tone: 0.3, smooth: true });
      const arm = (d) => {
        const pts = [
          [d * 30, -120],
          [d * 80, -124],
          [d * 96, -150],
          [d * 96, -230],
          [d * 84, -244],
          [d * 72, -232],
          [d * 70, -150],
          [d * 30, -146],
        ];
        shape(b, pts, { tone: 0.3, smooth: true });
      };
      arm(1);
      arm(-1);
      for (const x of [-14, 0, 14])
        b.lines.push(
          line(
            [
              [x, -20],
              [x * 1.1, -290],
            ],
            { weight: 0.4 },
          ),
        );
      b.lines.push(
        line(
          [
            [-120, 2],
            [0, -2],
            [130, 2],
          ],
          { weight: 0.6 },
        ),
      );
      return b;
    },
  },
  boulder: {
    label: "Boulder",
    words: "rock stone sisyphus push hill",
    zone: "floor",
    build() {
      const b = build();
      const rock = [
        [-130, -10],
        [-150, -90],
        [-120, -180],
        [-40, -230],
        [60, -220],
        [130, -160],
        [150, -70],
        [120, -10],
      ];
      shape(b, rock, { tone: 0.3, smooth: true, weight: 1.05 });
      b.lines.push(
        line(
          [
            [-60, -180],
            [-20, -150],
            [-30, -110],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [60, -120],
            [90, -90],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [-90, -60],
            [-60, -40],
          ],
          { weight: 0.5 },
        ),
      );
      b.lines.push(
        line(
          [
            [-180, 2],
            [0, 6],
            [180, 2],
          ],
          { weight: 0.6 },
        ),
      );
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
  hydrant: {
    label: "Fire hydrant",
    words: "street dog city",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-40, 0],
          [-40, -16],
          [40, -16],
          [40, 0],
        ],
        { tone: 0.5, weight: 0.85 },
      );
      shape(
        b,
        [
          [-30, -16],
          [-30, -110],
          [30, -110],
          [30, -16],
        ],
        { tone: 0.5 },
      );
      shape(
        b,
        [
          [-36, -110],
          [-30, -140],
          [0, -158],
          [30, -140],
          [36, -110],
        ],
        { tone: 0.5, smooth: true },
      );
      shape(
        b,
        [
          [-6, -158],
          [6, -158],
          [6, -172],
          [-6, -172],
        ],
        { tone: 0.5, weight: 0.75 },
      );
      for (const d of [-1, 1])
        shape(
          b,
          [
            [d * 30, -84],
            [d * 48, -84],
            [d * 48, -64],
            [d * 30, -64],
          ],
          { tone: 0.5, weight: 0.75 },
        );
      b.lines.push(
        line(
          [
            [-18, -100],
            [-16, -30],
          ],
          { weight: 0.45, color: "chalk" },
        ),
      );
      return b;
    },
  },
  mailbox: {
    label: "Mailbox",
    words: "letter post suburb",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-8, 0],
            [-8, -200],
            [8, -200],
            [8, 0],
          ],
          { weight: 0.9 },
        ),
      );
      shape(b, rounded(-90, -290, 150, 90, 22), { tone: 0.3, smooth: true });
      b.lines.push(
        line(
          [
            [40, -204],
            [44, -246],
            [40, -286],
          ],
          { weight: 0.6 },
        ),
        segment([60, -246], [72, -246], { weight: 0.9 }),
      );
      b.lines.push(
        poly(
          [
            [-60, -240],
            [-60, -320],
            [-20, -320],
            [-20, -296],
            [-60, -296],
          ],
          { weight: 0.8 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [-60, -320],
              [-20, -320],
              [-20, -296],
              [-60, -296],
            ],
            3,
          ),
        ],
        tone: 0.5,
      });
      return b;
    },
  },
  signpost: {
    label: "Signpost",
    words: "direction road crossroads arrow sign",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-8, 0],
          [-8, -420],
          [8, -420],
          [8, 0],
        ],
        { tone: 0.4, weight: 0.9 },
      );
      shape(
        b,
        [
          [-10, -400],
          [130, -400],
          [160, -376],
          [130, -352],
          [-10, -352],
        ],
        { tone: 0.12 },
      );
      shape(
        b,
        [
          [10, -320],
          [-130, -320],
          [-160, -296],
          [-130, -272],
          [10, -272],
        ],
        { tone: 0.12 },
      );
      shape(
        b,
        [
          [-10, -240],
          [110, -244],
          [140, -220],
          [110, -196],
          [-10, -196],
        ],
        { tone: 0.12 },
      );
      b.lines.push(
        line(
          [
            [-60, 2],
            [0, -2],
            [60, 2],
          ],
          { weight: 0.6 },
        ),
      );
      return b;
    },
  },
  fence: {
    label: "Picket fence",
    words: "garden suburb yard",
    zone: "floor",
    build() {
      const b = build();
      for (let x = -280; x <= 280; x += 40)
        shape(
          b,
          [
            [x - 13, 0],
            [x - 13, -150],
            [x, -170],
            [x + 13, -150],
            [x + 13, 0],
          ],
          { tone: 0.06, weight: 0.85 },
        );
      for (const y of [-120, -46])
        b.lines.push(
          poly(
            [
              [-300, y],
              [300, y],
              [300, y + 14],
              [-300, y + 14],
            ],
            { closed: true, weight: 0.7 },
          ),
        );
      return b;
    },
  },
  well: {
    label: "Wishing well",
    words: "water bucket wish village",
    zone: "floor",
    build() {
      const b = build();
      const wall = [
        [-110, 0],
        [-110, -120],
        [110, -120],
        [110, 0],
      ];
      shape(b, wall, { tone: 0.24 });
      for (let y = -100; y < 0; y += 24) b.lines.push(segment([-110, y], [110, y], { weight: 0.38 }));
      b.lines.push({ pts: oval(0, -120, 110, 20), weight: 0.95 });
      b.washes.push({ rings: [ovalRing(0, -120, 100, 16)], tone: 0.6 });
      for (const x of [-96, 96])
        shape(
          b,
          [
            [x - 8, -120],
            [x - 8, -300],
            [x + 8, -300],
            [x + 8, -120],
          ],
          { tone: 0.4, weight: 0.85 },
        );
      shape(
        b,
        [
          [-150, -290],
          [0, -380],
          [150, -290],
          [130, -280],
          [0, -350],
          [-130, -280],
        ],
        { tone: 0.42 },
      );
      b.lines.push(
        segment([-96, -250], [96, -250], { weight: 0.9 }),
        line(
          [
            [0, -250],
            [0, -190],
          ],
          { weight: 0.5 },
        ),
      );
      shape(
        b,
        [
          [-20, -190],
          [20, -190],
          [16, -160],
          [-16, -160],
        ],
        { tone: 0.4, weight: 0.8 },
      );
      return b;
    },
  },
  tombstone: {
    label: "Tombstone",
    words: "grave cemetery rip death",
    zone: "floor",
    build() {
      const b = build();
      const stone = [
        [-80, 0],
        [-80, -180],
        ...[...Array(13)].map((_, i) => [Math.cos(Math.PI + (i / 12) * Math.PI) * 80, -180 + Math.sin(Math.PI + (i / 12) * Math.PI) * 70]),
        [80, -180],
        [80, 0],
      ];
      shape(b, stone, { tone: 0.3 });
      b.lines.push(segment([-40, -170], [40, -170], { weight: 0.6 }), segment([0, -220], [0, -120], { weight: 0.6 }));
      for (const y of [-90, -66, -42]) b.lines.push(segment([-46, y], [46, y], { weight: 0.4 }));
      b.lines.push(
        line(
          [
            [-140, 2],
            [-60, -6],
            [60, -6],
            [140, 2],
          ],
          { weight: 0.7 },
        ),
      );
      for (const x of [-120, -100, 104, 124])
        b.lines.push(
          line(
            [
              [x, 0],
              [x - 4, -14],
            ],
            { weight: 0.45 },
          ),
          line(
            [
              [x + 6, 0],
              [x + 10, -12],
            ],
            { weight: 0.45 },
          ),
        );
      return b;
    },
  },
  snowman: {
    label: "Snowman",
    words: "winter snow cold",
    zone: "floor",
    build() {
      const b = build();
      disc(b, 0, -80, 90, { tone: 0.04, weight: 1 });
      disc(b, 0, -224, 64, { tone: 0.04, weight: 1 });
      disc(b, 0, -330, 46, { tone: 0.04, weight: 1 });
      for (const y of [-250, -220, -190]) b.solids.push(dot(0, y, 4));
      b.solids.push(dot(-14, -340, 3.4), dot(14, -340, 3.4));
      shape(
        b,
        [
          [0, -326],
          [44, -320],
          [0, -314],
        ],
        { tone: 0.45, weight: 0.7 },
      );
      shape(
        b,
        [
          [-50, -370],
          [50, -370],
          [42, -380],
          [34, -440],
          [-34, -440],
          [-42, -380],
        ],
        { tone: 0.66, weight: 0.95 },
      );
      for (const d of [-1, 1])
        b.lines.push(
          line(
            [
              [d * 60, -240],
              [d * 120, -290],
              [d * 140, -300],
            ],
            { weight: 0.8 },
          ),
          line(
            [
              [d * 112, -286],
              [d * 120, -310],
            ],
            { weight: 0.6 },
          ),
        );
      return b;
    },
  },
  igloo: {
    label: "Igloo",
    words: "ice eskimo snow arctic home",
    zone: "floor",
    build() {
      const b = build();
      const dome = [[-200, 0], ...arch(0, 0, 200, 24).reverse(), [200, 0]];
      shape(b, dome, { tone: 0.05 });
      for (const y of [-60, -120, -170]) {
        const half = Math.sqrt(200 * 200 - y * y);
        b.lines.push(
          line(
            [
              [-half, y],
              [0, y - 6],
              [half, y],
            ],
            { weight: 0.45 },
          ),
        );
      }
      const door = [[40, 0], ...arch(110, 0, 70, 12).reverse(), [180, 0]];
      shape(b, door, { tone: 0.06 });
      shape(b, [[80, 0], ...arch(110, 0, 34, 8).reverse(), [144, 0]], { tone: 0.66, weight: 0.8 });
      return b;
    },
  },
  island: {
    label: "Island",
    zone: "floor",
    build() {
      const b = build();
      const mound = [
        [-200, 0],
        [-150, -36],
        [-60, -62],
        [40, -64],
        [130, -44],
        [200, 0],
      ];
      b.lines.push(line(mound, { weight: 1.05 }));
      b.lines.push(
        line(
          [
            [-230, 4],
            [-180, 0],
            [-120, 6],
            [-40, 2],
            [40, 7],
            [120, 2],
            [190, 6],
            [236, 2],
          ],
          { weight: 0.6 },
        ),
      );
      b.lines.push(
        line(
          [
            [-60, -20],
            [-30, -24],
          ],
          { weight: 0.4 },
        ),
        line(
          [
            [30, -30],
            [60, -28],
          ],
          { weight: 0.4 },
        ),
        line(
          [
            [100, -14],
            [126, -12],
          ],
          { weight: 0.4 },
        ),
      );
      b.knock.push(area(mound.concat([[0, 8]])));
      return b;
    },
  },
  mountain: {
    label: "Mountain",
    zone: "floor",
    build() {
      const b = build();
      const outline = [
        [-320, 0],
        [-200, -170],
        [-120, -250],
        [-60, -420],
        [-30, -440],
        [30, -440],
        [60, -410],
        [130, -270],
        [210, -180],
        [320, 0],
      ];
      b.lines.push(line(outline, { weight: 1.05 }));
      b.lines.push(
        line(
          [
            [-60, -420],
            [-40, -380],
            [-10, -400],
            [20, -376],
            [60, -410],
          ],
          { weight: 0.6 },
        ),
      );
      b.lines.push(
        line(
          [
            [-120, -250],
            [-90, -200],
            [-110, -150],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [130, -270],
            [100, -210],
            [120, -160],
          ],
          { weight: 0.5 },
        ),
      );
      b.knock.push(area(outline.concat([[0, 4]])));
      return b;
    },
  },
  volcano: {
    label: "Volcano",
    words: "eruption lava island mountain",
    zone: "floor",
    build() {
      const b = build();
      const cone = [
        [-320, 0],
        [-140, -230],
        [-70, -340],
        [70, -340],
        [140, -230],
        [320, 0],
      ];
      shape(b, cone, { tone: 0.36, smooth: true });
      b.lines.push({ pts: oval(0, -340, 70, 12), weight: 0.8 });
      const plume = scallop(oval(30, -470, 140, 90, { overlap: 0, step: 3 }), 14, 40, 5, { outward: true });
      b.lines.push({ pts: plume, weight: 0.85 });
      b.washes.push({ rings: [plume], tone: 0.5 });
      b.lines.push(
        line(
          [
            [-30, -340],
            [-60, -280],
            [-40, -220],
            [-90, -150],
          ],
          { weight: 0.6 },
        ),
        line(
          [
            [20, -340],
            [40, -270],
            [10, -200],
          ],
          { weight: 0.6 },
        ),
      );
      return b;
    },
  },
  fire: {
    label: "Fire",
    zone: "floor",
    build() {
      const b = build();
      const outer = [
        [-40, 0],
        [-50, -40],
        [-30, -80],
        [-24, -50],
        [-6, -120],
        [10, -70],
        [26, -100],
        [32, -52],
        [50, -40],
        [42, 0],
      ];
      const inner = [
        [-20, 0],
        [-24, -30],
        [-10, -54],
        [-2, -30],
        [12, -60],
        [20, -26],
        [20, 0],
      ];
      b.lines.push(loop(outer, { weight: 0.95 }), loop(inner, { weight: 0.7 }));
      b.washes.push({ rings: [area(outer)], tone: 0.3 });
      b.knock.push(area(outer));
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
  gate: {
    label: "Gate",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-120, 0],
            [-120, -330],
          ],
          { weight: 1.2 },
        ),
        line(
          [
            [120, 0],
            [120, -330],
          ],
          { weight: 1.2 },
        ),
      );
      b.lines.push({ pts: oval(-120, -342, 12, 12), weight: 0.9 }, { pts: oval(120, -342, 12, 12), weight: 0.9 });
      b.lines.push(
        line(
          [
            [-112, -290],
            [-60, -330],
            [0, -344],
            [60, -330],
            [112, -290],
          ],
          { weight: 1 },
        ),
      );
      for (let x = -96; x <= 96; x += 24) {
        const top = -290 - Math.cos((x / 112) * (Math.PI / 2)) * 48;
        b.lines.push(
          line(
            [
              [x, -20],
              [x, top + 6],
            ],
            { weight: 0.75 },
          ),
        );
        b.lines.push({ pts: oval(x, top, 3.5, 3.5), weight: 0.6 });
      }
      b.lines.push(
        line(
          [
            [-112, -40],
            [112, -40],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [-112, -250],
            [112, -250],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(
        line(
          [
            [0, -40],
            [0, -340],
          ],
          { weight: 0.5 },
        ),
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
};
