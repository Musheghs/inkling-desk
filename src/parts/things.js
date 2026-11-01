import { rng } from "../core/random.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, poly, scallop, segment, spline, straight } from "./kit.js";
import { MORE_THINGS } from "./things2.js";
import { NATURE_THINGS } from "./things3.js";
import { ANIMALS, HOME_THINGS, WORLD_THINGS } from "./things4.js";
import { VEHICLE_ORDER, VEHICLES } from "./things5.js";

const box = (b, x, y, w, h, opts = {}) => {
  b.lines.push(
    poly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      { closed: true, ...opts },
    ),
  );
};

export const THINGS = {
  armchair: {
    label: "Armchair",
    zone: "floor",
    build() {
      const b = build();
      const outer = [
        [-98, -12],
        [-104, -92],
        [-96, -106],
        [-80, -106],
        [-80, -150],
        [-72, -200],
        [-36, -216],
        [0, -220],
        [36, -216],
        [72, -200],
        [80, -150],
        [80, -106],
        [96, -106],
        [104, -92],
        [98, -12],
      ];
      b.lines.push(line(outer, { weight: 1.05 }));
      b.lines.push(
        line([
          [-80, -106],
          [-76, -70],
          [-74, -40],
        ]),
        line([
          [80, -106],
          [76, -70],
          [74, -40],
        ]),
      );
      b.lines.push(
        line([
          [-74, -62],
          [-36, -68],
          [0, -69],
          [36, -68],
          [74, -62],
        ]),
      );
      b.lines.push(
        loop(
          [
            [-78, -44],
            [0, -46],
            [78, -44],
            [80, -26],
            [0, -24],
            [-80, -26],
          ],
          { overlap: 0.03, weight: 0.9 },
        ),
      );
      b.lines.push(
        line([
          [-98, -12],
          [0, -10],
          [98, -12],
        ]),
      );
      b.lines.push(
        line(
          [
            [-86, -12],
            [-84, 6],
            [-80, 6],
            [-78, -11],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [86, -12],
            [84, 6],
            [80, 6],
            [78, -11],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(
        line(
          [
            [-60, -150],
            [-50, -180],
            [-30, -194],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [60, -150],
            [50, -180],
            [30, -194],
          ],
          { weight: 0.45 },
        ),
      );
      b.washes.push({ rings: [area(outer.concat([[0, -10]]))], tone: 0.18 });
      b.knock.push(
        area(
          outer.concat([
            [80, 6],
            [-80, 6],
          ]),
        ),
      );
      return b;
    },
  },
  sofa: {
    label: "Sofa",
    zone: "floor",
    build() {
      const b = build();
      const outer = [
        [-226, -14],
        [-232, -96],
        [-222, -112],
        [-200, -112],
        [-198, -160],
        [-180, -176],
        [0, -182],
        [180, -176],
        [198, -160],
        [200, -112],
        [222, -112],
        [232, -96],
        [226, -14],
      ];
      b.lines.push(line(outer, { weight: 1.05 }));
      b.lines.push(
        line([
          [-200, -112],
          [-196, -76],
          [-194, -44],
        ]),
        line([
          [200, -112],
          [196, -76],
          [194, -44],
        ]),
      );
      b.lines.push(
        line([
          [-194, -72],
          [0, -78],
          [194, -72],
        ]),
      );
      b.lines.push(
        line(
          [
            [0, -176],
            [-2, -128],
            [0, -78],
          ],
          { weight: 0.6 },
        ),
      );
      b.lines.push(
        loop(
          [
            [-198, -48],
            [0, -52],
            [198, -48],
            [200, -30],
            [0, -26],
            [-200, -30],
          ],
          { overlap: 0.03, weight: 0.9 },
        ),
      );
      b.lines.push(
        line(
          [
            [0, -52],
            [1, -26],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        line([
          [-226, -14],
          [0, -10],
          [226, -14],
        ]),
      );
      for (const x of [-206, 206])
        b.lines.push(
          line(
            [
              [x - 6, -12],
              [x - 4, 6],
              [x + 4, 6],
              [x + 6, -12],
            ],
            { weight: 0.8 },
          ),
        );
      b.washes.push({ rings: [area(outer.concat([[0, -10]]))], tone: 0.22 });
      b.knock.push(
        area(
          outer.concat([
            [210, 6],
            [-210, 6],
          ]),
        ),
      );
      return b;
    },
  },
  chaise: {
    label: "Therapist's couch",
    zone: "floor",
    build() {
      const b = build();
      const top = [
        [-220, -112],
        [-232, -150],
        [-226, -184],
        [-204, -190],
        [-190, -168],
        [-178, -104],
        [-120, -96],
        [0, -98],
        [160, -100],
        [214, -96],
        [222, -78],
      ];
      b.lines.push(line(top, { weight: 1.05 }));
      b.lines.push(
        line([
          [-220, -112],
          [-222, -60],
          [-214, -48],
        ]),
      );
      b.lines.push(
        line([
          [222, -78],
          [220, -52],
          [210, -46],
        ]),
      );
      b.lines.push(
        line(
          [
            [-214, -48],
            [0, -44],
            [210, -46],
          ],
          { weight: 0.95 },
        ),
      );
      b.lines.push(
        line(
          [
            [-178, -104],
            [-176, -78],
            [-150, -74],
            [180, -76],
            [218, -74],
          ],
          { weight: 0.7 },
        ),
      );
      for (const x of [-196, -110, 90, 190]) {
        b.lines.push(
          line(
            [
              [x - 5, -46],
              [x - 7, -30],
              [x - 3, -16],
              [x - 5, 0],
              [x + 5, 0],
              [x + 3, -16],
              [x + 7, -30],
              [x + 5, -46],
            ],
            { weight: 0.8 },
          ),
        );
      }
      const r = rng(5);
      for (let i = 0; i < 9; i++) b.solids.push(dot(-130 + i * 38 + r() * 4, -86 + r() * 2, 1.6));
      b.lines.push(
        line(
          [
            [-226, -170],
            [-210, -176],
            [-198, -160],
          ],
          { weight: 0.5 },
        ),
      );
      b.washes.push({
        rings: [
          area(
            top.concat([
              [220, -52],
              [0, -44],
              [-214, -48],
              [-222, -60],
            ]),
          ),
        ],
        tone: 0.3,
      });
      b.knock.push(
        area(
          top.concat([
            [220, -46],
            [196, 0],
            [-200, 0],
            [-222, -60],
          ]),
        ),
      );
      return b;
    },
  },
  desk: {
    label: "Desk",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-210, -168],
            [210, -168],
            [214, -152],
            [-214, -152],
          ],
          { closed: true, weight: 1.05 },
        ),
      );
      b.lines.push(
        line([
          [-196, -152],
          [-196, 0],
        ]),
        line([
          [-84, -152],
          [-84, 0],
        ]),
      );
      b.lines.push(
        line([
          [196, -152],
          [196, 0],
        ]),
        line(
          [
            [184, -152],
            [184, -4],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        poly([
          [-196, 0],
          [-84, 0],
        ]),
      );
      for (const y of [-104, -56])
        b.lines.push(
          line(
            [
              [-196, y],
              [-84, y],
            ],
            { weight: 0.85 },
          ),
        );
      for (const y of [-128, -80, -30]) b.lines.push(segment([-150, y], [-130, y], { weight: 1.3 }));
      b.lines.push(
        line(
          [
            [-84, -120],
            [184, -120],
          ],
          { weight: 0.7 },
        ),
      );
      b.washes.push({
        rings: [
          flat([
            [-196, -152],
            [-84, -152],
            [-84, 0],
            [-196, 0],
          ]),
        ],
        tone: 0.2,
      });
      b.knock.push(
        flat([
          [-214, -168],
          [214, -168],
          [214, -152],
          [-214, -152],
        ]),
        flat([
          [-196, -152],
          [-84, -152],
          [-84, 0],
          [-196, 0],
        ]),
        flat([
          [-84, -152],
          [198, -152],
          [198, -120],
          [-84, -120],
        ]),
        flat([
          [184, -120],
          [198, -120],
          [198, 0],
          [184, 0],
        ]),
      );
      return b;
    },
  },
  table: {
    label: "Café table",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, -150, 78, 13, { start: 2.6 }), weight: 1.05 });
      b.lines.push(
        line(
          [
            [-78, -150],
            [-77, -142],
            [0, -132],
            [77, -142],
            [78, -150],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(
        line([
          [-5, -132],
          [-4, -60],
          [-6, -14],
        ]),
        line([
          [5, -132],
          [4, -60],
          [6, -14],
        ]),
      );
      b.lines.push(
        line([
          [-6, -14],
          [-44, -4],
          [-46, 2],
        ]),
        line([
          [6, -14],
          [44, -4],
          [46, 2],
        ]),
        line(
          [
            [0, -12],
            [2, 4],
          ],
          { weight: 0.8 },
        ),
      );
      b.knock.push(
        ovalRing(0, -146, 80, 16),
        area([
          [-8, -134],
          [8, -134],
          [48, 4],
          [-48, 4],
        ]),
      );
      return b;
    },
  },
  stool: {
    label: "Bar stool",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, -196, 40, 9, { start: 2.8 }), weight: 1.05 });
      b.lines.push(
        line(
          [
            [-40, -196],
            [-38, -186],
            [0, -180],
            [38, -186],
            [40, -196],
          ],
          { weight: 0.85 },
        ),
      );
      b.lines.push(
        line([
          [-28, -184],
          [-40, 0],
        ]),
        line([
          [28, -184],
          [40, 0],
        ]),
        line(
          [
            [-8, -180],
            [-12, -4],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [8, -180],
            [12, -4],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(
        line(
          [
            [-34, -70],
            [0, -64],
            [34, -70],
          ],
          { weight: 0.75 },
        ),
      );
      b.knock.push(
        ovalRing(0, -192, 42, 13),
        flat([
          [-32, -184],
          [-24, -184],
          [-36, 0],
          [-44, 0],
        ]),
        flat([
          [24, -184],
          [32, -184],
          [44, 0],
          [36, 0],
        ]),
        flat([
          [-36, -74],
          [36, -74],
          [36, -62],
          [-36, -62],
        ]),
      );
      return b;
    },
  },
  lamp: {
    label: "Floor lamp",
    zone: "floor",
    build() {
      const b = build();
      const shade = [
        [-38, -380],
        [38, -380],
        [58, -306],
        [-58, -306],
      ];
      b.lines.push(poly(shade, { closed: true, weight: 1.05 }));
      b.lines.push(
        line(
          [
            [-58, -306],
            [0, -300],
            [58, -306],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        line([
          [-2, -302],
          [-1, -150],
          [-2, -12],
        ]),
        line(
          [
            [3, -302],
            [3, -150],
            [3, -12],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push({ pts: oval(0, -6, 40, 8, { start: 2.8 }), weight: 0.95 });
      b.washes.push({ rings: [flat(shade)], tone: 0.12 });
      b.knock.push(
        area(shade),
        area([
          [-5, -306],
          [5, -306],
          [5, -10],
          [-5, -10],
        ]),
        ovalRing(0, -6, 42, 10),
      );
      return b;
    },
  },
  plant: {
    label: "Potted plant",
    main: "Pot",
    parts: { leaves: "Leaves" },
    zone: "floor",
    build() {
      const b = build();
      const pot = [
        [-42, -92],
        [42, -92],
        [32, 0],
        [-32, 0],
      ];
      b.lines.push(poly(pot, { closed: true }));
      b.lines.push(
        line(
          [
            [-46, -92],
            [-46, -78],
            [46, -78],
            [46, -92],
          ],
          { weight: 0.85 },
        ),
      );
      const leaves = [
        [-6, -92, -38, -250, -14],
        [2, -92, 6, -300, 12],
        [10, -92, 44, -236, 16],
        [-14, -92, -70, -190, -10],
        [16, -92, 72, -176, 10],
        [-2, -92, -12, -200, 8],
      ];
      for (const [x0, y0, tx, ty, bend] of leaves) {
        const mx = (x0 + tx) / 2 + bend;
        const my = (y0 + ty) / 2;
        const leaf = [
          [x0 - 8, y0],
          [mx - 14, my],
          [tx, ty],
          [mx + 14, my + 6],
          [x0 + 8, y0],
        ];
        b.lines.push(line(leaf, { weight: 0.9 }));
        b.lines.push(
          line(
            [
              [x0, y0],
              [mx, my + 3],
              [tx, ty],
            ],
            { weight: 0.4 },
          ),
        );
        b.washes.push({ rings: [area(leaf)], tone: 0.24, part: "leaves" });
        b.knock.push(area(leaf));
      }
      b.washes.push({ rings: [flat(pot)], tone: 0.34 });
      b.knock.push(
        area([
          [-46, -92],
          [46, -92],
          [32, 0],
          [-32, 0],
        ]),
      );
      return b;
    },
  },
  window: {
    label: "Window",
    zone: "wall",
    build() {
      const b = build();
      box(b, -100, -130, 200, 250, { weight: 1.05 });
      box(b, -88, -118, 176, 226, { weight: 0.8 });
      b.lines.push(
        line(
          [
            [0, -118],
            [0, 108],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [-88, -4],
            [88, -4],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-112, 120],
            [112, 120],
            [116, 132],
            [-116, 132],
          ],
          { closed: true },
        ),
      );
      const curtain = (dir) => {
        const x = dir * 104;
        const edge = [
          [x, -150],
          [x + dir * 6, -60],
          [x - dir * 4, 40],
          [x + dir * 10, 150],
        ];
        const inner = [
          [x - dir * 30, -150],
          [x - dir * 44, -40],
          [x - dir * 26, 60],
          [x - dir * 40, 150],
        ];
        b.lines.push(line(edge), line(inner));
        b.lines.push(
          line(
            [
              [x - dir * 14, -144],
              [x - dir * 18, 0],
              [x - dir * 12, 144],
            ],
            { weight: 0.5 },
          ),
        );
        b.lines.push(
          line(
            [
              [x - dir * 40, 150],
              [x - dir * 14, 154],
              [x + dir * 10, 150],
            ],
            { weight: 0.8 },
          ),
        );
        b.washes.push({ rings: [area(edge.concat(inner.slice().reverse()))], tone: 0.26 });
        b.knock.push(area(edge.concat(inner.slice().reverse())));
      };
      curtain(-1);
      curtain(1);
      b.lines.push(
        line(
          [
            [-160, -152],
            [160, -152],
          ],
          { weight: 0.9 },
        ),
      );
      return b;
    },
  },
  door: {
    label: "Door",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-96, 0],
            [-96, -404],
            [96, -404],
            [96, 0],
          ],
          { weight: 1.05 },
        ),
      );
      box(b, -84, -392, 168, 392);
      box(b, -66, -370, 132, 150, { weight: 0.7 });
      box(b, -66, -196, 132, 170, { weight: 0.7 });
      b.lines.push({ pts: oval(62, -200, 6, 6), weight: 0.9 });
      b.washes.push({
        rings: [
          flat([
            [-84, -392],
            [84, -392],
            [84, 0],
            [-84, 0],
          ]),
        ],
        tone: 0.14,
      });
      b.knock.push(
        area([
          [-96, -404],
          [96, -404],
          [96, 0],
          [-96, 0],
        ]),
      );
      return b;
    },
  },
  painting: {
    label: "Framed picture",
    zone: "wall",
    build() {
      const b = build();
      box(b, -80, -64, 160, 128, { weight: 1.05 });
      box(b, -66, -50, 132, 100, { weight: 0.75 });
      b.lines.push(
        line(
          [
            [-66, 30],
            [-30, -10],
            [-6, 14],
            [24, -26],
            [66, 22],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push({ pts: oval(34, -28, 9, 9), weight: 0.6 });
      b.washes.push({
        rings: [
          area([
            [-66, 30],
            [-30, -10],
            [-6, 14],
            [24, -26],
            [66, 22],
            [66, 50],
            [-66, 50],
          ]),
        ],
        tone: 0.22,
      });
      b.knock.push(
        area([
          [-80, -64],
          [80, -64],
          [80, 64],
          [-80, 64],
        ]),
      );
      return b;
    },
  },
  diploma: {
    label: "Diploma",
    zone: "wall",
    build() {
      const b = build();
      box(b, -54, -40, 108, 80, { weight: 1 });
      box(b, -44, -30, 88, 60, { weight: 0.6 });
      for (const [y, w] of [
        [-14, 50],
        [-2, 64],
        [10, 40],
      ])
        b.lines.push(segment([-w / 2, y], [w / 2, y], { weight: 0.5 }));
      b.lines.push({ pts: oval(26, 20, 6, 6), weight: 0.6 });
      b.knock.push(
        area([
          [-54, -40],
          [54, -40],
          [54, 40],
          [-54, 40],
        ]),
      );
      return b;
    },
  },
  bookshelf: {
    label: "Bookshelf",
    zone: "floor",
    build() {
      const b = build();
      box(b, -100, -380, 200, 380, { weight: 1.05 });
      const shelves = [-290, -196, -102];
      for (const y of shelves)
        b.lines.push(
          line(
            [
              [-100, y],
              [100, y],
            ],
            { weight: 0.9 },
          ),
        );
      const r = rng(9);
      for (const [top, bottom] of [
        [-380, -290],
        [-290, -196],
        [-196, -102],
        [-102, 0],
      ]) {
        let x = -92;
        while (x < 80) {
          const w = 10 + Math.floor(r() * 12);
          const h = (bottom - top) * (0.62 + r() * 0.3);
          if (x + w > 92) break;
          if (r() < 0.12 && x < 60) {
            b.lines.push(
              poly(
                [
                  [x, bottom],
                  [x + h * 0.55, bottom - h * 0.85],
                  [x + h * 0.55 + w, bottom - h * 0.8],
                  [x + w + 2, bottom],
                ],
                { weight: 0.7 },
              ),
            );
            x += h * 0.55 + w + 6;
            continue;
          }
          b.lines.push(
            poly(
              [
                [x, bottom],
                [x, bottom - h],
                [x + w, bottom - h],
                [x + w, bottom],
              ],
              { weight: 0.7 },
            ),
          );
          if (r() < 0.4)
            b.washes.push({
              rings: [
                flat(
                  [
                    [x, bottom],
                    [x, bottom - h],
                    [x + w, bottom - h],
                    [x + w, bottom],
                  ],
                  3,
                ),
              ],
              tone: 0.18 + r() * 0.3,
            });
          x += w + 1;
        }
      }
      b.knock.push(
        area([
          [-100, -380],
          [100, -380],
          [100, 0],
          [-100, 0],
        ]),
      );
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
  dog: {
    label: "Dog",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-70, -10],
        [-82, -56],
        [-66, -104],
        [-26, -124],
        [10, -126],
        [30, -150],
        [36, -190],
        [58, -214],
        [92, -212],
        [112, -196],
        [136, -190],
        [142, -174],
        [126, -164],
        [104, -164],
        [92, -146],
        [70, -120],
        [62, -90],
        [66, -50],
        [64, -8],
      ];
      b.lines.push(line(body, { weight: 1.05 }));
      b.lines.push(
        line(
          [
            [-70, -10],
            [-40, -6],
            [-20, -8],
          ],
          { weight: 0.95 },
        ),
      );
      b.lines.push(
        line(
          [
            [30, -64],
            [34, -30],
            [32, -4],
            [44, -2],
            [46, -10],
            [44, -40],
            [46, -76],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(
        line(
          [
            [64, -8],
            [52, -6],
            [50, 0],
            [66, 0],
            [72, -6],
          ],
          { weight: 0.85 },
        ),
      );
      b.lines.push(
        line(
          [
            [-70, -40],
            [-104, -48],
            [-120, -70],
            [-112, -78],
            [-96, -62],
            [-74, -58],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(
        line(
          [
            [64, -206],
            [50, -186],
            [52, -158],
            [62, -150],
            [70, -168],
            [72, -196],
          ],
          { weight: 0.9 },
        ),
      );
      b.solids.push(dot(139, -183, 4.2));
      b.solids.push(dot(96, -194, 2.6));
      b.lines.push(
        line(
          [
            [118, -166],
            [116, -158],
            [110, -154],
          ],
          { weight: 0.55 },
        ),
      );
      b.lines.push(
        line(
          [
            [46, -150],
            [60, -138],
            [80, -134],
          ],
          { weight: 0.7 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [52, -184],
            [62, -150],
            [70, -168],
            [72, -196],
            [64, -206],
          ]),
        ],
        tone: 0.5,
      });
      b.knock.push(
        area(
          body.concat([
            [-20, -8],
            [-40, -6],
          ]),
        ),
        area([
          [-70, -40],
          [-104, -48],
          [-120, -70],
          [-112, -78],
          [-96, -62],
          [-74, -58],
        ]),
      );
      return b;
    },
  },
  cat: {
    label: "Cat",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-44, 0],
        [-56, -40],
        [-50, -86],
        [-34, -116],
        [-40, -150],
        [-34, -176],
        [-20, -160],
        [0, -164],
        [20, -160],
        [34, -176],
        [40, -150],
        [34, -116],
        [50, -86],
        [56, -40],
        [44, 0],
      ];
      b.lines.push(line(body, { weight: 1.05 }));
      b.lines.push(
        line(
          [
            [-44, 0],
            [0, 4],
            [44, 0],
          ],
          { weight: 0.95 },
        ),
      );
      b.lines.push(
        line(
          [
            [44, -6],
            [80, -10],
            [98, -30],
            [92, -56],
            [80, -60],
          ],
          { weight: 0.95 },
        ),
      );
      b.lines.push(
        line(
          [
            [-14, -2],
            [-12, -40],
          ],
          { weight: 0.7 },
        ),
        line(
          [
            [14, -2],
            [12, -40],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        line(
          [
            [-34, -116],
            [0, -110],
            [34, -116],
          ],
          { weight: 0.5 },
        ),
      );
      b.solids.push(dot(-14, -140, 2.6), dot(14, -140, 2.6));
      b.lines.push(
        line(
          [
            [-4, -128],
            [0, -124],
            [4, -128],
          ],
          { weight: 0.6 },
        ),
      );
      b.lines.push(
        line(
          [
            [0, -124],
            [-4, -118],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [0, -124],
            [4, -118],
          ],
          { weight: 0.5 },
        ),
      );
      for (const s of [-1, 1]) {
        b.lines.push(
          segment([s * 8, -126], [s * 34, -130], { weight: 0.35, pen: "fineliner" }),
          segment([s * 8, -123], [s * 32, -120], { weight: 0.35, pen: "fineliner" }),
        );
      }
      b.washes.push({ rings: [area(body)], tone: 0.36 });
      b.knock.push(area(body.concat([[0, 4]])));
      return b;
    },
  },
  bird: {
    label: "Bird",
    zone: "sky",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-40, 4],
            [-20, -10],
            [0, -2],
            [22, -12],
            [42, 2],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        line(
          [
            [-30, 34],
            [-16, 24],
            [-2, 30],
            [14, 22],
            [28, 32],
          ],
          { weight: 0.8 },
        ),
      );
      return b;
    },
  },
  cloud: {
    label: "Cloud",
    zone: "sky",
    build() {
      const b = build();
      const base = spline([
        [-110, 0],
        [-60, 4],
        [0, 2],
        [60, 4],
        [110, 0],
      ]);
      const top = scallop(
        spline([
          [110, 0],
          [100, -40],
          [60, -72],
          [10, -88],
          [-40, -76],
          [-86, -48],
          [-110, 0],
        ]),
        9,
        46,
        1,
      );
      b.lines.push({ pts: top, weight: 1 });
      b.lines.push({ pts: base, weight: 0.7 });
      b.knock.push(top.concat(base.slice().reverse()));
      return b;
    },
  },
  sun: {
    label: "Sun",
    zone: "sky",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, 0, 40, 40), weight: 1 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.1;
        b.lines.push(segment([Math.cos(a) * 52, Math.sin(a) * 52], [Math.cos(a) * 72, Math.sin(a) * 72], { weight: 0.8 }));
      }
      b.knock.push(ovalRing(0, 0, 42, 42));
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
  rug: {
    label: "Rug",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, -30, 200, 30), weight: 0.95 });
      b.lines.push({ pts: oval(0, -30, 170, 21), weight: 0.5 });
      b.washes.push({ rings: [ovalRing(0, -30, 200, 30)], tone: 0.14 });
      for (let i = 0; i < 26; i++) {
        const a = Math.PI * 0.08 + (i / 25) * Math.PI * 0.84;
        const x = Math.cos(a) * 200;
        const y = -30 + Math.sin(a) * 30;
        b.lines.push(segment([x, y], [x * 1.02, y + 9], { weight: 0.4 }));
      }
      return b;
    },
  },
  lectern: {
    label: "Lectern",
    zone: "floor",
    build() {
      const b = build();
      const plinth = [
        [-72, 0],
        [72, 0],
        [62, -18],
        [-62, -18],
      ];
      b.lines.push(poly(plinth, { closed: true, weight: 0.95 }));
      b.washes.push({ rings: [flat(plinth)], tone: 0.34 });
      const column = [
        [-44, -18],
        [44, -18],
        [50, -190],
        [-50, -190],
      ];
      b.lines.push(poly(column, { closed: true }));
      b.washes.push({ rings: [flat(column)], tone: 0.2 });
      b.lines.push(
        poly(
          [
            [-30, -36],
            [30, -36],
            [34, -172],
            [-34, -172],
          ],
          { closed: true, weight: 0.6 },
        ),
      );
      const lip = [
        [-76, -190],
        [76, -190],
        [76, -200],
        [-76, -200],
      ];
      b.lines.push(poly(lip, { closed: true, weight: 0.9 }));
      b.washes.push({ rings: [flat(lip)], tone: 0.34 });
      const desk = [
        [-76, -200],
        [76, -200],
        [64, -248],
        [-64, -248],
      ];
      b.lines.push(poly(desk, { closed: true }));
      b.washes.push({ rings: [flat(desk)], tone: 0.24 });
      const left = [
        [-62, -204],
        [-26, -201],
        [-2, -205],
        [-2, -242],
        [-24, -239],
        [-56, -242],
      ];
      const right = [
        [2, -205],
        [26, -201],
        [62, -204],
        [56, -242],
        [24, -239],
        [2, -242],
      ];
      for (const page of [left, right]) {
        b.lines.push(loop(page, { weight: 0.8, overlap: 0.04 }));
        b.washes.push({ rings: [area(page)], paper: true });
      }
      b.lines.push(
        line(
          [
            [0, -205],
            [0, -242],
          ],
          { weight: 0.7 },
        ),
      );
      for (const [x0, x1] of [
        [-50, -10],
        [10, 50],
      ])
        for (let i = 0; i < 4; i++) {
          const y = -232 + i * 7;
          b.lines.push(segment([x0 + (x0 < 0 ? i : 0), y], [x1 - (x0 < 0 ? 0 : i), y], { weight: 0.32 }));
        }
      b.lines.push(
        line(
          [
            [0, -203],
            [3, -188],
            [1, -176],
          ],
          { weight: 0.55 },
        ),
      );
      b.knock.push(
        area([
          [-76, -200],
          [-64, -250],
          [64, -250],
          [76, -200],
          [76, -190],
          [50, -190],
          [44, -18],
          [62, -18],
          [72, 0],
          [-72, 0],
          [-62, -18],
          [-44, -18],
          [-50, -190],
          [-76, -190],
        ]),
      );
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
  bar: {
    label: "Bar counter",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-320, -200],
            [320, -200],
            [326, -184],
            [-326, -184],
          ],
          { closed: true, weight: 1.05 },
        ),
      );
      b.lines.push(
        line([
          [-312, -184],
          [-312, 0],
        ]),
        line([
          [312, -184],
          [312, 0],
        ]),
      );
      b.lines.push(
        line(
          [
            [-312, -40],
            [312, -40],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [-312, -30],
            [312, -30],
          ],
          { weight: 0.5 },
        ),
      );
      for (let x = -240; x <= 240; x += 120)
        b.lines.push(
          line(
            [
              [x, -184],
              [x, -40],
            ],
            { weight: 0.5 },
          ),
        );
      b.washes.push({
        rings: [
          flat([
            [-312, -184],
            [312, -184],
            [312, 0],
            [-312, 0],
          ]),
        ],
        tone: 0.3,
      });
      b.knock.push(
        area([
          [-326, -200],
          [326, -200],
          [326, -184],
          [312, -184],
          [312, 0],
          [-312, 0],
          [-312, -184],
          [-326, -184],
        ]),
      );
      return b;
    },
  },
  bottles: {
    label: "Bottle shelf",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-240, 0],
            [240, 0],
          ],
          { weight: 1 },
        ),
        line(
          [
            [-240, 8],
            [240, 8],
          ],
          { weight: 0.6 },
        ),
      );
      const r = rng(4);
      for (let x = -220; x <= 210; x += 34 + Math.floor(r() * 10)) {
        const h = 60 + r() * 50;
        const w = 9 + r() * 6;
        const neck = 3.5 + r();
        const pts = [
          [x - w, 0],
          [x - w, -h * 0.6],
          [x - neck, -h * 0.78],
          [x - neck, -h],
          [x + neck, -h],
          [x + neck, -h * 0.78],
          [x + w, -h * 0.6],
          [x + w, 0],
        ];
        b.lines.push(poly(pts, { weight: 0.8 }));
        b.washes.push({ rings: [flat(pts, 3)], tone: 0.15 + r() * 0.35 });
      }
      return b;
    },
  },
  skyline: {
    label: "Skyline",
    zone: "wall",
    build() {
      const b = build();
      const r = rng(12);
      let x = -260;
      const outline = [[-260, 0]];
      while (x < 260) {
        const w = 40 + r() * 50;
        const h = 80 + r() * 170;
        outline.push([x, -h], [Math.min(260, x + w), -h]);
        for (let wy = -h + 16; wy < -12; wy += 22) {
          for (let wx = x + 9; wx < x + w - 12; wx += 16) {
            if (r() < 0.55) b.lines.push(segment([wx, wy], [wx + 5, wy], { weight: 0.55 }));
          }
        }
        x += w;
      }
      outline.push([260, 0]);
      b.lines.push({ pts: outline.flatMap((p, i) => (i ? straight(outline[i - 1], p, 6) : [])), weight: 0.95 });
      b.washes.push({ rings: [flat(outline)], tone: 0.18 });
      return b;
    },
  },
  floor: {
    label: "Floor line",
    zone: "line",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-500, 0],
            [-200, 1],
            [100, -1],
            [500, 0],
          ],
          { weight: 1 },
        ),
      );
      return b;
    },
  },
  horizon: {
    label: "Sea",
    zone: "line",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-500, 0],
            [-100, 1],
            [300, -1],
            [500, 0],
          ],
          { weight: 0.9 },
        ),
      );
      const r = rng(21);
      for (let i = 0; i < 9; i++) {
        const x = -440 + i * 110 + r() * 40;
        const y = 50 + r() * 180;
        const w = 22 + r() * 18;
        b.lines.push(
          line(
            [
              [x - w, y],
              [x - w / 2, y - 6],
              [x, y],
              [x + w / 2, y - 6],
              [x + w, y],
            ],
            { weight: 0.5 },
          ),
        );
      }
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
};

Object.assign(THINGS, MORE_THINGS, NATURE_THINGS, HOME_THINGS, WORLD_THINGS, ANIMALS, VEHICLES);

export const THING_ORDER = [
  "armchair",
  "clubchair",
  "sofa",
  "chaise",
  "desk",
  "schoolchair",
  "table",
  "sidetable",
  "stool",
  "lamp",
  "plant",
  "fireplace",
  "window",
  "drapes",
  "door",
  "painting",
  "diploma",
  "poster",
  "clock",
  "chalkboard",
  "banner",
  "wallmap",
  "warboard",
  "pinboard",
  "bookshelf",
  "monitor",
  "papers",
  "pencilcup",
  "boxes",
  "wastebasket",
  "bar",
  "bottles",
  "barcart",
  "martini",
  "mug",
  "phone",
  "shipbottle",
  "antelope",
  "bear",
  "deer",
  "dog",
  "cat",
  "bird",
  "flyingcar",
  "flyingtruck",
  "cloud",
  "sun",
  "smoke",
  "fire",
  "factory",
  "tree",
  "pine",
  "palm",
  "deadtree",
  "stump",
  "logs",
  "sapling",
  "tent",
  "bench",
  "lamppost",
  "pigeons",
  "cracks",
  "island",
  "mountain",
  "ruins",
  "rubble",
  "skyline",
  "capitol",
  "crowd",
  "bunting",
  "lectern",
  "judgebench",
  "flag",
  "gate",
  "conference",
  "easel",
  "bed",
  "nightstand",
  "fridge",
  "counter",
  "abstract",
  "ottoman",
  "stanchions",
  "subway",
  "rug",
  "wallpaper",
  "wainscot",
  "floorboards",
  ...Object.keys(HOME_THINGS),
  ...Object.keys(WORLD_THINGS),
  ...Object.keys(ANIMALS),
  ...VEHICLE_ORDER,
].filter((id) => THINGS[id]);
