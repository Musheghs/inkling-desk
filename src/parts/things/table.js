import { rng } from "../../core/random.js";
import { area, build, dot, flat, line, loop, oval, poly, scallop, segment, spline } from "../kit.js";
import { box, disc, rounded, shape } from "./draw.js";

export const TABLE = {
  monitor: {
    label: "Old computer",
    zone: "table",
    build() {
      const b = build();
      const face = [
        [-62, -150],
        [50, -150],
        [54, -146],
        [54, -50],
        [50, -46],
        [-62, -46],
        [-66, -50],
        [-66, -146],
      ];
      b.lines.push(poly(face, { closed: true, weight: 1.05 }));
      b.lines.push(
        poly(
          [
            [-52, -138],
            [42, -138],
            [42, -60],
            [-52, -60],
          ],
          { closed: true, weight: 0.7 },
        ),
      );
      b.lines.push(
        line(
          [
            [54, -146],
            [76, -132],
            [78, -60],
            [54, -50],
          ],
          { weight: 0.95 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [-52, -138],
              [42, -138],
              [42, -60],
              [-52, -60],
            ],
            4,
          ),
        ],
        tone: 0.72,
      });
      b.washes.push({
        rings: [
          flat(
            [
              [54, -146],
              [76, -132],
              [78, -60],
              [54, -50],
            ],
            4,
          ),
        ],
        tone: 0.3,
      });
      b.lines.push(
        line(
          [
            [-36, -126],
            [-10, -132],
            [20, -128],
          ],
          { weight: 0.5, color: "chalk" },
        ),
      );
      b.lines.push(
        poly(
          [
            [-22, -46],
            [8, -46],
            [14, -24],
            [-28, -24],
          ],
          { closed: true, weight: 0.85 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-90, -10],
            [70, -10],
            [82, 0],
            [-100, 0],
          ],
          { closed: true, weight: 0.9 },
        ),
      );
      for (let x = -86; x < 70; x += 12) b.lines.push(segment([x, -6], [x + 6, -6], { weight: 0.5 }));
      b.knock.push(
        flat([
          [-66, -150],
          [54, -150],
          [78, -132],
          [78, -60],
          [14, -24],
          [82, 0],
          [-100, 0],
          [-28, -24],
          [-66, -46],
        ]),
      );
      return b;
    },
  },
  laptop: {
    label: "Laptop",
    words: "computer notebook work email",
    zone: "table",
    build() {
      const b = build();
      shape(
        b,
        [
          [-100, 0],
          [100, 0],
          [88, -12],
          [-88, -12],
        ],
        { tone: 0.3, weight: 0.9 },
      );
      const lid = rounded(-84, -132, 168, 120, 6);
      shape(b, lid, { tone: 0.3, weight: 1 });
      b.lines.push(loop(rounded(-74, -122, 148, 100, 3), { weight: 0.6 }));
      b.washes.push({ rings: [flat(box(-72, -120, 144, 96), 4)], tone: 0.18 });
      return b;
    },
  },
  papers: {
    label: "Stack of papers",
    zone: "table",
    build() {
      const b = build();
      const r = rng(8);
      for (let i = 0; i < 9; i++) {
        const y = -i * 6;
        const s = (r() - 0.5) * 8;
        b.lines.push(
          poly(
            [
              [-60 + s, y],
              [56 + s, y - 1],
              [60 + s, y - 5],
              [-56 + s, y - 4],
            ],
            { weight: 0.5 },
          ),
        );
      }
      b.lines.push(
        poly(
          [
            [-54, -58],
            [52, -60],
            [58, -48],
            [-58, -50],
          ],
          { closed: true, weight: 0.7 },
        ),
      );
      b.knock.push(
        flat([
          [-64, 2],
          [66, 2],
          [64, -62],
          [-60, -62],
        ]),
      );
      return b;
    },
  },
  pencilcup: {
    label: "Pencil cup",
    zone: "table",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-16, -44],
            [16, -44],
            [14, 0],
            [-14, 0],
          ],
          { closed: true },
        ),
      );
      b.lines.push({ pts: oval(0, -44, 16, 3.5, { start: 2.8 }), weight: 0.7 });
      for (const [x, a] of [
        [-8, -0.3],
        [-2, 0.1],
        [5, 0.3],
        [9, -0.1],
      ]) {
        const tip = [x + Math.sin(a) * 52, -44 - Math.cos(a) * 52];
        b.lines.push(segment([x, -44], tip, { weight: 0.75 }));
        b.lines.push(segment([x + 3, -44], [tip[0] + 3, tip[1]], { weight: 0.5 }));
      }
      b.washes.push({
        rings: [
          flat(
            [
              [-16, -44],
              [16, -44],
              [14, 0],
              [-14, 0],
            ],
            3,
          ),
        ],
        tone: 0.3,
      });
      b.knock.push(
        flat([
          [-16, -44],
          [16, -44],
          [14, 0],
          [-14, 0],
        ]),
      );
      return b;
    },
  },
  boxes: {
    label: "File boxes",
    zone: "table",
    build() {
      const b = build();
      const one = (x, y, w, hgt) => {
        b.lines.push(poly(box(x, y, w, hgt), { closed: true, weight: 0.95 }));
        b.lines.push(
          poly(
            [
              [x, y],
              [x + 16, y - 14],
              [x + w + 16, y - 14],
              [x + w, y],
            ],
            { weight: 0.85 },
          ),
          segment([x + w + 16, y - 14], [x + w + 16, y + hgt - 14], { weight: 0.85 }),
          segment([x + w, y + hgt], [x + w + 16, y + hgt - 14], { weight: 0.85 }),
        );
        b.lines.push({ pts: oval(x + w / 2, y + 20, 12, 5), weight: 0.6 });
        b.washes.push({
          rings: [
            flat(
              [
                [x + w, y],
                [x + w + 16, y - 14],
                [x + w + 16, y + hgt - 14],
                [x + w, y + hgt],
              ],
              4,
            ),
          ],
          tone: 0.28,
        });
        b.knock.push(
          flat([
            [x, y],
            [x + 16, y - 14],
            [x + w + 16, y - 14],
            [x + w + 16, y + hgt - 14],
            [x + w, y + hgt],
            [x, y + hgt],
          ]),
        );
      };
      one(-80, -60, 90, 60);
      one(14, -60, 80, 60);
      one(-40, -126, 90, 62);
      return b;
    },
  },
  martini: {
    label: "Martini",
    zone: "table",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-26, -76],
            [26, -76],
            [1, -44],
          ],
          { closed: true },
        ),
      );
      b.lines.push(
        line(
          [
            [0, -44],
            [0, -6],
          ],
          { weight: 0.85 },
        ),
      );
      b.lines.push({ pts: oval(0, -4, 16, 3.5, { start: 2.8 }), weight: 0.85 });
      b.lines.push(segment([-8, -84], [10, -58], { weight: 0.6 }));
      b.lines.push({ pts: oval(5, -64, 4, 4), weight: 0.6 });
      b.washes.push({
        rings: [
          flat(
            [
              [-20, -70],
              [20, -70],
              [1, -48],
            ],
            3,
          ),
        ],
        tone: 0.14,
      });
      b.knock.push(
        area([
          [-26, -76],
          [26, -76],
          [3, -44],
          [3, -6],
          [16, -4],
          [-16, -4],
          [-3, -6],
          [-3, -44],
        ]),
      );
      return b;
    },
  },
  wine: {
    label: "Wine and a glass",
    words: "bottle red dinner drink",
    zone: "table",
    build() {
      const b = build();
      const bottle = [
        [-60, 0],
        [-60, -110],
        [-48, -140],
        [-44, -186],
        [-30, -186],
        [-26, -140],
        [-14, -110],
        [-14, 0],
      ];
      shape(b, bottle, { tone: 0.62, smooth: true });
      b.lines.push(loop(rounded(-56, -96, 38, 50, 4), { weight: 0.6, color: "chalk" }));
      const glass = [
        [20, -130],
        [70, -130],
        [66, -96],
        [45, -78],
        [24, -96],
      ];
      b.lines.push(loop(glass, { weight: 0.85 }));
      b.washes.push({
        rings: [
          area([
            [24, -108],
            [66, -108],
            [62, -92],
            [45, -80],
            [28, -92],
          ]),
        ],
        tone: 0.55,
      });
      b.lines.push(
        segment([45, -78], [45, -10], { weight: 0.85 }),
        line(
          [
            [22, 0],
            [45, -8],
            [68, 0],
          ],
          { weight: 0.85 },
        ),
      );
      b.knock.push(area(glass));
      return b;
    },
  },
  mug: {
    label: "Coffee mug",
    zone: "table",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, -62, 22, 5, { start: 2.6 }), weight: 0.9 });
      b.lines.push(
        line([
          [-22, -62],
          [-21, -30],
          [-18, -4],
          [0, -1],
          [18, -4],
          [21, -30],
          [22, -62],
        ]),
      );
      b.lines.push(
        line(
          [
            [22, -52],
            [36, -50],
            [38, -36],
            [30, -24],
            [20, -22],
          ],
          { weight: 0.85 },
        ),
      );
      b.lines.push(
        line(
          [
            [-6, -78],
            [-2, -90],
            [-7, -102],
            [-3, -112],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [6, -76],
            [10, -88],
            [5, -98],
          ],
          { weight: 0.45 },
        ),
      );
      b.knock.push(
        area([
          [-22, -66],
          [22, -66],
          [38, -50],
          [38, -30],
          [20, -20],
          [18, -2],
          [-18, -2],
          [-21, -30],
        ]),
      );
      return b;
    },
  },
  cake: {
    label: "Birthday cake",
    words: "party celebration candles",
    zone: "table",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, 0, 110, 14), weight: 0.8 });
      const tier = (y, w, h) => {
        const ring = [
          [-w, y],
          [-w, y - h],
          [w, y - h],
          [w, y],
        ];
        shape(b, ring, { tone: 0.1 });
        b.lines.push(
          line(
            scallop(
              spline([
                [-w, y - h + 4],
                [0, y - h + 8],
                [w, y - h + 4],
              ]),
              4,
              18,
              2,
            ),
            { weight: 0.6 },
          ),
        );
      };
      tier(-4, 90, 60);
      tier(-64, 64, 50);
      for (const x of [-36, -12, 12, 36]) {
        b.lines.push(
          poly(
            [
              [x - 3, -114],
              [x - 3, -150],
              [x + 3, -150],
              [x + 3, -114],
            ],
            { closed: true, weight: 0.6 },
          ),
        );
        b.lines.push(
          loop(
            [
              [x, -168],
              [x + 5, -156],
              [x, -152],
              [x - 5, -156],
            ],
            { weight: 0.5 },
          ),
        );
      }
      return b;
    },
  },
  phone: {
    label: "Telephone",
    zone: "table",
    build() {
      const b = build();
      const base = [
        [-40, 0],
        [-34, -34],
        [34, -34],
        [40, 0],
      ];
      b.lines.push(poly(base, { closed: true }));
      b.lines.push(
        line(
          [
            [-50, -42],
            [-46, -54],
            [46, -54],
            [50, -42],
            [34, -38],
            [26, -46],
            [-26, -46],
            [-34, -38],
            [-50, -42],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push({ pts: oval(0, -18, 11, 8), weight: 0.6 });
      b.lines.push(
        line(
          [
            [40, -6],
            [58, 2],
            [66, 12],
            [80, 8],
          ],
          { weight: 0.5 },
        ),
      );
      b.solids.push(
        area([
          [-50, -42],
          [-46, -54],
          [46, -54],
          [50, -42],
          [34, -38],
          [26, -46],
          [-26, -46],
          [-34, -38],
        ]),
      );
      b.washes.push({ rings: [flat(base)], tone: 0.3 });
      b.knock.push(
        area([
          [-50, -56],
          [50, -56],
          [40, 0],
          [-40, 0],
        ]),
      );
      return b;
    },
  },
  shipbottle: {
    label: "Ship in a bottle",
    zone: "table",
    build() {
      const b = build();
      const bottle = [
        [-60, -40],
        [40, -40],
        [56, -32],
        [70, -30],
        [74, -24],
        [70, -18],
        [56, -16],
        [40, -8],
        [-60, -8],
        [-66, -24],
      ];
      b.lines.push(loop(bottle, { weight: 0.9, overlap: 0.03 }));
      b.lines.push(
        line(
          [
            [-40, -16],
            [24, -16],
            [16, -12],
            [-34, -12],
            [-40, -16],
          ],
          { weight: 0.75 },
        ),
      );
      b.lines.push(segment([-12, -16], [-12, -36], { weight: 0.6 }), segment([6, -16], [6, -32], { weight: 0.6 }));
      b.lines.push(
        poly(
          [
            [-12, -34],
            [-2, -26],
            [-12, -20],
          ],
          { closed: true, weight: 0.5 },
        ),
        poly(
          [
            [6, -30],
            [14, -24],
            [6, -20],
          ],
          { closed: true, weight: 0.5 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-40, -8],
            [-34, 0],
            [24, 0],
            [30, -8],
          ],
          { weight: 0.8 },
        ),
      );
      b.washes.push({ rings: [area(bottle)], tone: 0.08 });
      b.knock.push(area(bottle));
      return b;
    },
  },
  crystalball: {
    label: "Crystal ball",
    words: "fortune teller future psychic",
    zone: "table",
    build() {
      const b = build();
      shape(
        b,
        [
          [-60, 0],
          [-46, -30],
          [46, -30],
          [60, 0],
        ],
        { tone: 0.55, weight: 0.9 },
      );
      disc(b, 0, -100, 72, { tone: 0.12, weight: 1 });
      b.lines.push(
        line(
          [
            [-40, -140],
            [-20, -158],
            [6, -160],
          ],
          { weight: 0.6 },
        ),
      );
      for (const [x, y] of [
        [20, -90],
        [-16, -70],
        [36, -120],
      ])
        b.lines.push(segment([x - 6, y], [x + 6, y], { weight: 0.45 }), segment([x, y - 6], [x, y + 6], { weight: 0.45 }));
      return b;
    },
  },
  fishbowl: {
    label: "Goldfish bowl",
    words: "fish pet water",
    zone: "table",
    build() {
      const b = build();
      const bowl = [
        [-40, -150],
        [-80, -110],
        [-90, -60],
        [-70, -14],
        [-30, 0],
        [30, 0],
        [70, -14],
        [90, -60],
        [80, -110],
        [40, -150],
      ];
      b.lines.push(line(bowl, { weight: 1 }), { pts: oval(0, -150, 40, 8), weight: 0.8 });
      b.washes.push({
        rings: [
          area([
            [-78, -100],
            [-84, -60],
            [-66, -18],
            [-30, -5],
            [30, -5],
            [66, -18],
            [84, -60],
            [78, -100],
          ]),
        ],
        tone: 0.12,
      });
      b.lines.push(
        line(
          [
            [-82, -100],
            [0, -96],
            [82, -100],
          ],
          { weight: 0.5 },
        ),
      );
      const fish = [
        [-30, -56],
        [-6, -70],
        [20, -60],
        [26, -56],
        [20, -50],
        [-6, -42],
      ];
      b.lines.push(
        loop(fish, { weight: 0.75 }),
        poly(
          [
            [-30, -56],
            [-48, -70],
            [-46, -42],
          ],
          { closed: true, weight: 0.7 },
        ),
      );
      b.washes.push({ rings: [area(fish)], tone: 0.4 });
      b.solids.push(dot(12, -58, 2));
      b.knock.push(area(bowl.concat([[0, -158]])));
      return b;
    },
  },
  birdcage: {
    label: "Birdcage",
    words: "bird parrot canary pet",
    zone: "table",
    build() {
      const b = build();
      const dome = [
        [-80, -40],
        [-80, -170],
        [-60, -230],
        [0, -256],
        [60, -230],
        [80, -170],
        [80, -40],
      ];
      b.lines.push(line(dome, { weight: 1 }));
      b.lines.push({ pts: oval(0, -266, 10, 10), weight: 0.8 });
      for (const x of [-56, -28, 0, 28, 56])
        b.lines.push(
          line(
            [
              [x, -40],
              [x * 1.02, -170],
              [x * 0.5, -240],
            ],
            { weight: 0.5 },
          ),
        );
      shape(
        b,
        [
          [-92, -40],
          [92, -40],
          [86, 0],
          [-86, 0],
        ],
        { tone: 0.45, weight: 0.95 },
      );
      b.lines.push(segment([-50, -110], [50, -110], { weight: 0.7 }));
      const bird = [
        [-16, -112],
        [-20, -140],
        [-6, -160],
        [10, -156],
        [14, -136],
        [4, -114],
      ];
      b.lines.push(
        loop(bird, { weight: 0.75 }),
        poly(
          [
            [10, -152],
            [22, -148],
            [10, -144],
          ],
          { closed: true, weight: 0.6 },
        ),
      );
      b.washes.push({ rings: [area(bird)], tone: 0.3 });
      b.solids.push(dot(4, -150, 1.8));
      b.knock.push(
        area(
          dome.concat([
            [80, 0],
            [-80, 0],
          ]),
        ),
      );
      return b;
    },
  },
  trophy: {
    label: "Trophy",
    words: "award prize winner cup",
    zone: "table",
    build() {
      const b = build();
      shape(b, box(-50, -36, 100, 36), { tone: 0.5 });
      shape(
        b,
        [
          [-20, -36],
          [20, -36],
          [10, -70],
          [-10, -70],
        ],
        { tone: 0.3, weight: 0.8 },
      );
      const cup = [
        [-60, -190],
        [60, -190],
        [54, -140],
        [30, -96],
        [10, -76],
        [-10, -76],
        [-30, -96],
        [-54, -140],
      ];
      shape(b, cup, { tone: 0.3, smooth: true });
      for (const d of [-1, 1])
        b.lines.push(
          line(
            [
              [d * 56, -176],
              [d * 92, -170],
              [d * 88, -130],
              [d * 44, -116],
            ],
            { weight: 0.9 },
          ),
        );
      b.lines.push(
        line(
          [
            [-36, -170],
            [-30, -120],
          ],
          { weight: 0.5, color: "chalk" },
        ),
      );
      return b;
    },
  },
};
