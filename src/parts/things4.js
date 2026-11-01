import { bounds, pointInRing } from "../core/geometry.js";
import { rng } from "../core/random.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, poly, scallop, segment, spline } from "./kit.js";

const box = (x, y, w, h) => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

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

function shape(b, pts, { tone = 0, weight = 1, closed = true, smooth = false, knock = true, part } = {}) {
  const ring = smooth ? area(pts) : flat(pts, 4);
  b.lines.push(smooth ? loop(pts, { weight, overlap: 0.03 }) : poly(pts, { closed, weight }));
  if (tone) b.washes.push({ rings: [ring], tone, part });
  if (knock) b.knock.push(ring);
  return ring;
}

function disc(b, x, y, r, { tone = 0, weight = 0.9, knock = true } = {}) {
  b.lines.push({ pts: oval(x, y, r, r, { start: -1.1 }), weight });
  if (tone) b.washes.push({ rings: [ovalRing(x, y, r, r)], tone });
  if (knock) b.knock.push(ovalRing(x, y, r + 1, r + 1));
}

function arch(cx, y, r, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = -(i / n) * Math.PI;
    pts.push([cx + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return pts;
}

function tyre(b, x, y, r) {
  b.lines.push({ pts: oval(x, y, r, r, { start: -1.2 }), weight: 1 });
  b.lines.push({ pts: oval(x, y, r * 0.45, r * 0.45), weight: 0.7 });
  b.washes.push({ rings: [ovalRing(x, y, r, r)], tone: 0.62, part: "wheels" });
  b.knock.push(ovalRing(x, y, r + 1, r + 1));
}

export const HOME_THINGS = {
  car: {
    label: "Car",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    words: "sedan automobile drive road",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-250, -40],
        [-254, -92],
        [-214, -106],
        [-150, -112],
        [-112, -170],
        [-40, -184],
        [64, -182],
        [116, -122],
        [204, -112],
        [248, -94],
        [254, -52],
        [244, -38],
      ]
        .concat(arch(150, -38, 46))
        .concat([
          [104, -38],
          [-104, -38],
        ])
        .concat(arch(-150, -38, 46))
        .concat([[-196, -38]]);
      b.lines.push(poly(body, { closed: true, weight: 1.05 }));
      b.washes.push({ rings: [flat(body, 5)], tone: 0.2 });
      for (const win of [
        [
          [-100, -164],
          [-38, -174],
          [-32, -118],
          [-112, -118],
        ],
        [
          [-14, -174],
          [54, -172],
          [94, -120],
          [-10, -118],
        ],
      ]) {
        b.lines.push(poly(win, { closed: true, weight: 0.8 }));
        b.washes.push({ rings: [flat(win, 4)], tone: 0.5, part: "windows" });
      }
      b.lines.push(segment([-20, -118], [-22, -44], { weight: 0.6 }), segment([102, -112], [100, -50], { weight: 0.6 }));
      b.lines.push(segment([-4, -100], [18, -100], { weight: 0.9 }), segment([118, -100], [138, -100], { weight: 0.9 }));
      b.lines.push(
        { pts: oval(236, -84, 9, 7), weight: 0.7 },
        segment([-254, -62], [-226, -62], { weight: 1.2 }),
        segment([228, -50], [256, -50], { weight: 1.2 }),
      );
      tyre(b, -150, -36, 36);
      tyre(b, 150, -36, 36);
      b.knock.push(flat(body));
      return b;
    },
  },
  house: {
    label: "House",
    main: "Walls",
    parts: { roof: "Roof", door: "Door", windows: "Windows" },
    words: "home cottage suburb",
    zone: "floor",
    build() {
      const b = build();
      const walls = box(-200, -300, 400, 300);
      shape(b, walls, { tone: 0.08 });
      const roof = [
        [-236, -296],
        [0, -470],
        [236, -296],
      ];
      shape(b, roof, { tone: 0.42, weight: 1.05, part: "roof" });
      shape(b, box(110, -460, 44, 110), { tone: 0.3, part: "roof" });
      b.lines.push(
        line(
          [
            [122, -480],
            [112, -510],
            [130, -540],
            [118, -580],
          ],
          { weight: 0.5 },
        ),
      );
      shape(b, box(-38, -160, 76, 160), { tone: 0.32, part: "door" });
      b.solids.push(dot(24, -80, 4));
      for (const x of [-160, 84]) {
        shape(b, box(x, -240, 76, 70), { tone: 0.4, weight: 0.85, part: "windows" });
        b.lines.push(segment([x + 38, -240], [x + 38, -170], { weight: 0.55 }), segment([x, -205], [x + 76, -205], { weight: 0.55 }));
      }
      for (const x of [-160, 84]) shape(b, box(x, -118, 76, 60), { tone: 0.4, weight: 0.8, part: "windows" });
      for (let y = -280; y < 0; y += 22) b.lines.push(segment([-196, y], [-178, y], { weight: 0.35 }), segment([178, y + 11], [196, y + 11], { weight: 0.35 }));
      b.lines.push(segment([-44, 0], [44, 0], { weight: 0.6 }), segment([-60, 8], [60, 8], { weight: 0.5 }));
      return b;
    },
  },
  castle: {
    label: "Castle",
    words: "king queen fortress tower medieval",
    zone: "floor",
    build() {
      const b = build();
      const tower = (x, w, h) => {
        const top = -h;
        const pts = [
          [x - w / 2, 0],
          [x - w / 2, top],
        ];
        const n = 4;
        for (let i = 0; i < n; i++) {
          const x0 = x - w / 2 + (i * w) / n;
          const x1 = x0 + w / n;
          pts.push([x0, top - 24], [x0 + (x1 - x0) * 0.5, top - 24], [x0 + (x1 - x0) * 0.5, top]);
          if (i < n - 1) pts.push([x1, top]);
        }
        pts.push([x + w / 2, top], [x + w / 2, 0]);
        shape(b, pts, { tone: 0.2 });
        shape(b, rounded(x - 12, top + 60, 24, 46, 12), { tone: 0.62, weight: 0.8 });
        for (let y = top + 30; y < -10; y += 34)
          b.lines.push(
            segment([x - w / 2 + 8, y], [x - w / 2 + 30, y], { weight: 0.35 }),
            segment([x + w / 2 - 34, y + 17], [x + w / 2 - 10, y + 17], { weight: 0.35 }),
          );
      };
      shape(
        b,
        [
          [-150, 0],
          [-150, -260],
          [-130, -260],
          [-130, -280],
          [-100, -280],
          [-100, -260],
          [-70, -260],
          [-70, -280],
          [-40, -280],
          [-40, -260],
          [-10, -260],
          [-10, -280],
          [20, -280],
          [20, -260],
          [50, -260],
          [50, -280],
          [80, -280],
          [80, -260],
          [110, -260],
          [110, -280],
          [140, -280],
          [140, -260],
          [150, -260],
          [150, 0],
        ],
        { tone: 0.16 },
      );
      shape(b, [[-50, 0], ...arch(0, -100, 50, 12).reverse(), [50, 0]], { tone: 0.6, weight: 0.9 });
      for (const x of [-30, -10, 10, 30]) b.lines.push(segment([x, -140], [x, 0], { weight: 0.45, color: "chalk" }));
      tower(-180, 90, 420);
      tower(180, 90, 420);
      tower(0, 70, 520);
      b.lines.push(segment([0, -544], [0, -640], { weight: 0.8 }));
      shape(
        b,
        [
          [0, -640],
          [56, -624],
          [0, -606],
        ],
        { tone: 0.45, weight: 0.8 },
      );
      return b;
    },
  },
  tv: {
    label: "Old television",
    words: "tv telly set screen watch",
    zone: "floor",
    build() {
      const b = build();
      const cabinet = rounded(-130, -300, 260, 210, 18);
      shape(b, cabinet, { tone: 0.28, weight: 1.05 });
      const screen = rounded(-110, -284, 170, 176, 26);
      b.lines.push(loop(screen, { weight: 0.95 }));
      b.washes.push({ rings: [area(screen)], tone: 0.5 });
      b.lines.push(
        line(
          [
            [-90, -262],
            [-60, -270],
            [-30, -266],
          ],
          { weight: 0.45, color: "chalk" },
        ),
      );
      for (const y of [-260, -220]) disc(b, 96, y, 12, { tone: 0.5, weight: 0.8 });
      for (let y = -180; y < -110; y += 12) b.lines.push(segment([80, y], [112, y], { weight: 0.4 }));
      for (const x of [-100, 100])
        b.lines.push(
          poly(
            [
              [x - 6, -90],
              [x + (x < 0 ? -20 : 20), 0],
            ],
            { weight: 1 },
          ),
        );
      b.lines.push(
        poly(
          [
            [-20, -300],
            [-70, -400],
          ],
          { weight: 0.8 },
        ),
        poly(
          [
            [10, -300],
            [70, -410],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push({ pts: oval(-5, -304, 22, 8), weight: 0.8 });
      b.solids.push(dot(-70, -400, 4), dot(70, -410, 4));
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
  officechair: {
    label: "Office chair",
    words: "desk swivel boss",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-60, -380],
          [60, -380],
          [72, -250],
          [62, -200],
          [-62, -200],
          [-72, -250],
        ],
        { tone: 0.5, smooth: true },
      );
      b.lines.push(
        line(
          [
            [-40, -360],
            [-46, -230],
          ],
          { weight: 0.4 },
        ),
        line(
          [
            [40, -360],
            [46, -230],
          ],
          { weight: 0.4 },
        ),
      );
      shape(
        b,
        [
          [-10, -200],
          [10, -200],
          [8, -160],
          [-8, -160],
        ],
        { tone: 0.5, weight: 0.8 },
      );
      shape(
        b,
        [
          [-90, -160],
          [90, -160],
          [96, -140],
          [86, -122],
          [-86, -122],
          [-96, -140],
        ],
        { tone: 0.5, smooth: true },
      );
      for (const x of [-100, 100])
        b.lines.push(
          line(
            [
              [x * 0.8, -180],
              [x, -200],
              [x * 1.02, -160],
              [x * 0.9, -150],
            ],
            { weight: 0.8 },
          ),
        );
      shape(
        b,
        [
          [-8, -122],
          [8, -122],
          [8, -40],
          [-8, -40],
        ],
        { tone: 0.3, weight: 0.8 },
      );
      b.lines.push(
        line(
          [
            [-110, -26],
            [0, -40],
            [110, -26],
          ],
          { weight: 1 },
        ),
        segment([0, -40], [0, -24], { weight: 1 }),
      );
      for (const x of [-110, 0, 110]) disc(b, x, -12, 12, { tone: 0.6, weight: 0.8 });
      return b;
    },
  },
  watercooler: {
    label: "Water cooler",
    words: "office gossip break",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-58, 0],
          [-58, -250],
          [58, -250],
          [58, 0],
        ],
        { tone: 0.12 },
      );
      shape(
        b,
        [
          [-20, -250],
          [-20, -268],
          [20, -268],
          [20, -250],
        ],
        { weight: 0.8 },
      );
      const jug = [
        [-22, -268],
        [-60, -300],
        [-66, -360],
        [-60, -420],
        [-30, -440],
        [30, -440],
        [60, -420],
        [66, -360],
        [60, -300],
        [22, -268],
      ];
      b.lines.push(loop(jug, { weight: 0.95 }));
      b.washes.push({ rings: [area(jug)], tone: 0.18 });
      b.knock.push(area(jug));
      b.lines.push(
        line(
          [
            [-58, -360],
            [0, -364],
            [58, -360],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [-40, -330],
            [-44, -400],
          ],
          { weight: 0.4, color: "chalk" },
        ),
      );
      shape(b, box(-34, -200, 68, 40), { tone: 0.4, weight: 0.8 });
      b.lines.push(segment([-20, -160], [-20, -146], { weight: 0.9 }), segment([20, -160], [20, -146], { weight: 0.9 }));
      shape(
        b,
        [
          [-36, -110],
          [36, -110],
          [30, -96],
          [-30, -96],
        ],
        { weight: 0.7 },
      );
      b.lines.push(segment([-50, -40], [50, -40], { weight: 0.4 }));
      return b;
    },
  },
  filing: {
    label: "Filing cabinet",
    words: "office drawers files",
    zone: "floor",
    build() {
      const b = build();
      shape(b, box(-80, -420, 160, 420), { tone: 0.3 });
      for (let i = 0; i < 4; i++) {
        const y = -410 + i * 102;
        b.lines.push(poly(box(-70, y, 140, 92), { closed: true, weight: 0.75 }));
        b.lines.push(poly(box(-26, y + 20, 52, 14), { closed: true, weight: 0.6 }));
        b.lines.push(
          line(
            [
              [-22, y + 52],
              [0, y + 48],
              [22, y + 52],
            ],
            { weight: 0.95 },
          ),
        );
      }
      return b;
    },
  },
  dining: {
    label: "Dinner table",
    words: "dining supper feast candles tablecloth",
    zone: "floor",
    build() {
      const b = build();
      const top = [
        [-300, -170],
        [300, -170],
        [310, -150],
        [-310, -150],
      ];
      shape(b, top, { weight: 1 });
      const cloth = [
        [-310, -150],
        [310, -150],
      ];
      const hem = [];
      for (let x = 310; x >= -310; x -= 31) hem.push([x, -86 + (Math.abs((x / 31) % 2) < 1 ? 0 : 10)]);
      b.lines.push(
        line(
          [
            [-310, -150],
            [-314, -86],
          ],
          { weight: 1 },
        ),
        line(
          [
            [310, -150],
            [314, -86],
          ],
          { weight: 1 },
        ),
        line(hem, { weight: 0.9 }),
      );
      b.washes.push({ rings: [area(cloth.concat(hem))], tone: 0.06 });
      b.knock.push(area(cloth.concat(hem)));
      for (const x of [-280, 280])
        b.lines.push(
          poly(
            [
              [x - 6, -86],
              [x - 6, 0],
              [x + 6, 0],
              [x + 6, -86],
            ],
            { weight: 0.9 },
          ),
        );
      for (const x of [-50, 50]) {
        shape(
          b,
          [
            [x - 16, -170],
            [x + 16, -170],
            [x + 8, -180],
            [x + 4, -230],
            [x - 4, -230],
            [x - 8, -180],
          ],
          { tone: 0.4, weight: 0.8 },
        );
        shape(b, box(x - 5, -290, 10, 60), { weight: 0.75 });
        b.lines.push(
          loop(
            [
              [x, -312],
              [x + 6, -298],
              [x, -292],
              [x - 6, -298],
            ],
            { weight: 0.5 },
          ),
        );
      }
      for (const x of [-200, 190]) {
        b.lines.push({ pts: oval(x, -176, 44, 9), weight: 0.8 }, { pts: oval(x, -176, 26, 5), weight: 0.45 });
        b.lines.push(segment([x - 62, -184], [x - 62, -170], { weight: 0.7 }), segment([x + 60, -184], [x + 60, -170], { weight: 0.7 }));
      }
      return b;
    },
  },
  hospitalbed: {
    label: "Hospital bed",
    words: "doctor patient ward sick",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-318, -104],
          [-318, -318],
          [-310, -332],
          [-298, -332],
          [-290, -318],
          [-290, -104],
        ],
        { tone: 0.3 },
      );
      shape(
        b,
        [
          [310, -104],
          [310, -236],
          [318, -248],
          [328, -248],
          [336, -236],
          [336, -104],
        ],
        { tone: 0.3 },
      );
      for (const x of [-244, 244]) {
        b.lines.push(
          poly(
            [
              [x - 6, -104],
              [x - 6, -40],
              [x + 6, -40],
              [x + 6, -104],
            ],
            { weight: 0.8 },
          ),
        );
        b.lines.push(
          poly(
            [
              [x - 16, -40],
              [x + 16, -40],
            ],
            { weight: 0.9 },
          ),
        );
        disc(b, x, -19, 19, { tone: 0.55, weight: 0.9 });
        disc(b, x, -19, 5, { weight: 0.6, knock: false });
      }
      b.lines.push(
        poly(
          [
            [-238, -76],
            [238, -76],
          ],
          { weight: 0.8 },
        ),
        poly(
          [
            [-238, -66],
            [238, -66],
          ],
          { weight: 0.6 },
        ),
      );
      b.knock.push(flat(box(-238, -76, 476, 10)));
      b.lines.push(
        poly(
          [
            [-104, -128],
            [-290, -128],
            [-290, -104],
            [310, -104],
            [310, -118],
          ],
          { weight: 1 },
        ),
      );
      b.washes.push({
        rings: [
          flat([
            [-290, -128],
            [-104, -128],
            [-104, -116],
            [310, -116],
            [310, -104],
            [-290, -104],
          ]),
        ],
        tone: 0.35,
      });
      b.knock.push(flat(box(-290, -128, 600, 24)));
      const mattress = [
        [-96, -164],
        [-262, -246],
        [-276, -222],
        [-118, -128],
        [-104, -128],
      ];
      b.lines.push(
        line(
          [
            [-96, -164],
            [-180, -205.5],
            [-262, -246],
          ],
          { weight: 1 },
        ),
        line(
          [
            [-262, -246],
            [-272, -238],
            [-276, -222],
          ],
          { weight: 1 },
        ),
        line(
          [
            [-276, -222],
            [-196, -175],
            [-118, -128],
          ],
          { weight: 1 },
        ),
      );
      b.washes.push({ rings: [area(mattress)], tone: 0.05 });
      b.knock.push(area(mattress));
      b.lines.push(
        line(
          [
            [-236, -128],
            [-232, -160],
            [-224, -186],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push({ pts: oval(-181.6, -222.4, 50, 17, { rot: 0.459 }), weight: 0.9 });
      b.washes.push({ rings: [ovalRing(-181.6, -222.4, 50, 17, 0.459)], tone: 0.04 });
      b.knock.push(ovalRing(-181.6, -222.4, 51, 18, 0.459));
      const hem = [];
      for (let x = 306, i = 0; x >= -104; x -= 41, i++) hem.push([x, i % 2 ? -116 : -123]);
      hem.push([-104, -118]);
      const blanket = [[-98, -170], [300, -170], [306, -152], ...hem, [-102, -146]];
      b.lines.push(loop(blanket, { weight: 0.95, overlap: 0.03 }));
      b.washes.push({ rings: [area(blanket)], tone: 0.16 });
      b.knock.push(area(blanket));
      b.lines.push(
        line(
          [
            [54, -168],
            [60, -146],
            [64, -122],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [196, -168],
            [192, -146],
            [194, -120],
          ],
          { weight: 0.5 },
        ),
      );
      b.lines.push(
        loop(
          [
            [-30, -214],
            [150, -214],
            [156, -207],
            [150, -200],
            [-30, -200],
            [-36, -207],
          ],
          { weight: 0.85, overlap: 0.04 },
        ),
      );
      for (let x = -14; x <= 140; x += 38.5) b.lines.push(segment([x, -200], [x, -171], { weight: 0.6 }));
      return b;
    },
  },
  ivstand: {
    label: "IV drip",
    words: "hospital drip doctor",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-3, 0],
            [-3, -500],
            [3, -500],
            [3, 0],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(
        line(
          [
            [-70, -10],
            [0, -20],
            [70, -10],
          ],
          { weight: 1 },
        ),
      );
      for (const x of [-70, 70]) disc(b, x, -6, 6, { tone: 0.5, weight: 0.7 });
      b.lines.push(
        line(
          [
            [0, -496],
            [-30, -500],
            [-40, -490],
          ],
          { weight: 0.8 },
        ),
      );
      const bag = [
        [-62, -480],
        [-18, -480],
        [-14, -380],
        [-26, -360],
        [-54, -360],
        [-66, -380],
      ];
      shape(b, bag, { tone: 0.16, weight: 0.85, smooth: true });
      b.washes.push({
        rings: [
          flat(
            [
              [-62, -420],
              [-18, -420],
              [-15, -382],
              [-26, -364],
              [-54, -364],
              [-64, -382],
            ],
            3,
          ),
        ],
        tone: 0.28,
      });
      b.lines.push(
        line(
          [
            [-40, -360],
            [-38, -300],
            [-60, -200],
            [-20, -120],
            [-80, -60],
          ],
          { weight: 0.45 },
        ),
      );
      return b;
    },
  },
  piano: {
    label: "Grand piano",
    words: "music concert pianist",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-240, -150],
        [-240, -230],
        [-60, -240],
        [40, -232],
        [120, -210],
        [200, -216],
        [250, -200],
        [260, -170],
        [250, -150],
      ];
      b.lines.push(loop(body, { weight: 1.05 }));
      b.washes.push({ rings: [area(body)], tone: 0.62 });
      b.knock.push(area(body));
      const lid = [
        [-230, -238],
        [-60, -248],
        [230, -420],
        [250, -406],
        [40, -240],
      ];
      shape(b, lid, { tone: 0.55, weight: 0.95 });
      b.lines.push(segment([60, -236], [150, -360], { weight: 0.7 }));
      for (const x of [-220, 30, 230])
        shape(
          b,
          [
            [x - 10, -150],
            [x + 10, -150],
            [x + 6, 0],
            [x - 6, 0],
          ],
          { tone: 0.6, weight: 0.85 },
        );
      shape(b, box(-276, -176, 40, 22), { tone: 0.1, weight: 0.75 });
      for (let x = -272; x < -238; x += 6) b.lines.push(segment([x, -176], [x, -164], { weight: 0.5 }));
      b.lines.push(segment([-40, -40], [20, -40], { weight: 0.8 }), segment([-10, -150], [-10, -40], { weight: 0.7 }));
      return b;
    },
  },
  throne: {
    label: "Throne",
    words: "king queen royal crown",
    zone: "floor",
    build() {
      const b = build();
      const back = [
        [-90, -170],
        [-100, -440],
        [-70, -470],
        [-50, -520],
        [-24, -480],
        [0, -540],
        [24, -480],
        [50, -520],
        [70, -470],
        [100, -440],
        [90, -170],
      ];
      shape(b, back, { tone: 0.42 });
      b.lines.push(loop(rounded(-56, -420, 112, 210, 50), { weight: 0.7 }));
      b.washes.push({ rings: [area(rounded(-56, -420, 112, 210, 50))], tone: 0.2 });
      for (const [x, y] of [
        [-50, -520],
        [0, -540],
        [50, -520],
      ])
        disc(b, x, y - 8, 7, { tone: 0.2, weight: 0.7 });
      shape(
        b,
        [
          [-120, -170],
          [120, -170],
          [130, -140],
          [120, -110],
          [-120, -110],
          [-130, -140],
        ],
        { tone: 0.3, smooth: true },
      );
      for (const x of [-1, 1]) {
        shape(
          b,
          [
            [x * 96, -260],
            [x * 150, -250],
            [x * 156, -226],
            [x * 140, -200],
            [x * 130, -110],
            [x * 104, -110],
            [x * 100, -220],
          ],
          { tone: 0.42, weight: 0.9 },
        );
      }
      for (const x of [-110, 110])
        shape(
          b,
          [
            [x - 12, -110],
            [x + 12, -110],
            [x + 8, 0],
            [x - 8, 0],
          ],
          { tone: 0.42, weight: 0.85 },
        );
      return b;
    },
  },
  mic: {
    label: "Microphone",
    words: "stand-up comedy comedian stage mic open",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-3, 0],
            [-3, -420],
            [3, -420],
            [3, 0],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(
        line(
          [
            [-60, 0],
            [0, -14],
            [60, 0],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        line(
          [
            [0, -420],
            [10, -440],
            [30, -454],
          ],
          { weight: 1 },
        ),
      );
      const head = rounded(22, -486, 24, 40, 12);
      shape(b, head, { tone: 0.55, weight: 0.9 });
      for (let y = -478; y < -452; y += 6) b.lines.push(segment([24, y], [44, y], { weight: 0.35, color: "chalk" }));
      b.lines.push(
        line(
          [
            [0, -380],
            [-30, -300],
            [10, -200],
            [-20, -80],
            [20, -10],
          ],
          { weight: 0.4 },
        ),
      );
      return b;
    },
  },
  coatrack: {
    label: "Coat rack",
    words: "hat coat hallway",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-4, 0],
            [-4, -470],
            [4, -470],
            [4, 0],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(
        line(
          [
            [-50, 0],
            [0, -30],
            [50, 0],
          ],
          { weight: 0.9 },
        ),
        line(
          [
            [0, -30],
            [0, -10],
          ],
          { weight: 0.9 },
        ),
      );
      for (const d of [-1, 1])
        b.lines.push(
          line(
            [
              [0, -440],
              [d * 26, -456],
              [d * 34, -470],
            ],
            { weight: 0.8 },
          ),
        );
      const coat = [
        [4, -440],
        [40, -430],
        [60, -380],
        [70, -260],
        [62, -150],
        [10, -150],
        [6, -300],
        [-12, -380],
      ];
      shape(b, coat, { tone: 0.42, smooth: true });
      b.lines.push(
        line(
          [
            [30, -420],
            [24, -300],
            [36, -160],
          ],
          { weight: 0.5 },
        ),
      );
      const hat = [
        [-50, -462],
        [-46, -488],
        [-30, -500],
        [-10, -500],
        [6, -488],
        [10, -462],
      ];
      shape(b, hat, { tone: 0.62, smooth: true });
      b.lines.push(
        line(
          [
            [-64, -462],
            [-20, -456],
            [24, -462],
          ],
          { weight: 1 },
        ),
      );
      return b;
    },
  },
  grandclock: {
    label: "Grandfather clock",
    words: "time hallway pendulum",
    zone: "floor",
    build() {
      const b = build();
      const hood = [
        [-70, -440],
        [-70, -560],
        [-50, -600],
        [50, -600],
        [70, -560],
        [70, -440],
      ];
      shape(b, hood, { tone: 0.38 });
      disc(b, 0, -510, 46, { weight: 0.95 });
      b.washes.push({ rings: [ovalRing(0, -510, 44, 44)], tone: 0.04 });
      b.lines.push(segment([0, -510], [0, -540], { weight: 0.9 }), segment([0, -510], [22, -500], { weight: 0.9 }));
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.lines.push(segment([Math.cos(a) * 38, -510 + Math.sin(a) * 38], [Math.cos(a) * 42, -510 + Math.sin(a) * 42], { weight: 0.4 }));
      }
      shape(b, box(-56, -440, 112, 330), { tone: 0.38 });
      shape(b, rounded(-30, -420, 60, 260, 26), { tone: 0.62, weight: 0.8 });
      b.lines.push(segment([0, -410], [0, -230], { weight: 0.6, color: "chalk" }));
      b.lines.push({ pts: oval(0, -218, 16, 16), weight: 0.7, color: "chalk" });
      shape(b, box(-72, -110, 144, 110), { tone: 0.38 });
      return b;
    },
  },
  bathtub: {
    label: "Bathtub",
    words: "bath bathroom clawfoot",
    zone: "floor",
    build() {
      const b = build();
      const tub = [
        [-240, -220],
        [240, -220],
        [230, -150],
        [200, -84],
        [140, -60],
        [-140, -60],
        [-200, -84],
        [-230, -150],
      ];
      shape(b, tub, { tone: 0.12, smooth: true, weight: 1.05 });
      b.lines.push(
        line(
          [
            [-232, -206],
            [0, -200],
            [232, -206],
          ],
          { weight: 0.6 },
        ),
      );
      for (const x of [-160, 160])
        b.lines.push(
          loop(
            [
              [x - 12, -64],
              [x + 12, -64],
              [x + 16, -20],
              [x + 24, 0],
              [x - 8, 0],
              [x - 12, -30],
            ],
            { weight: 0.8 },
          ),
        );
      b.lines.push(
        line(
          [
            [200, -220],
            [204, -280],
            [180, -300],
            [160, -290],
          ],
          { weight: 1 },
        ),
        segment([150, -294], [170, -284], { weight: 1.2 }),
      );
      b.lines.push(
        { pts: oval(-160, -260, 22, 18), weight: 0.6 },
        { pts: oval(-130, -276, 16, 14), weight: 0.6 },
        { pts: oval(-196, -270, 14, 12), weight: 0.6 },
      );
      return b;
    },
  },
  mirror: {
    label: "Mirror",
    words: "wall reflection vanity",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, 0, 90, 120, { start: -1.3 }), weight: 1.05 }, { pts: oval(0, 0, 78, 108, { start: 1.8 }), weight: 0.7 });
      b.washes.push({ rings: [ovalRing(0, 0, 89, 119)], tone: 0.32 });
      b.washes.push({ rings: [ovalRing(0, 0, 76, 106)], tone: 0.08 });
      b.lines.push(
        line(
          [
            [-40, -60],
            [-20, -80],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [-50, -30],
            [-10, -76],
          ],
          { weight: 0.5 },
        ),
      );
      b.knock.push(ovalRing(0, 0, 91, 121));
      return b;
    },
  },
  whiteboard: {
    label: "Whiteboard chart",
    words: "office meeting sales graph presentation",
    zone: "wall",
    build() {
      const b = build();
      shape(b, box(-210, -130, 420, 260), { weight: 1.05 });
      b.lines.push(poly(box(-200, -120, 400, 240), { closed: true, weight: 0.6 }));
      b.lines.push(segment([-160, 90], [170, 90], { weight: 0.8 }), segment([-160, 90], [-160, -100], { weight: 0.8 }));
      b.lines.push(
        poly(
          [
            [-150, -80],
            [-90, -60],
            [-40, -70],
            [10, -20],
            [60, -30],
            [110, 40],
            [160, 76],
          ],
          { weight: 1.1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [140, 62],
            [162, 78],
            [136, 82],
          ],
          { weight: 1.1 },
        ),
      );
      shape(b, box(-200, 120, 400, 12), { tone: 0.3, weight: 0.8 });
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

function canopy(b, cx, cy, rx, ry, seed, tone = 0.32) {
  const puff = scallop(oval(cx, cy, rx, ry, { overlap: 0, step: 3 }), Math.min(rx, ry) * 0.16, Math.max(30, rx * 0.42), seed, { outward: true });
  b.lines.push({ pts: puff, weight: 0.9 });
  b.washes.push({ rings: [puff], tone, part: "leaves" });
  b.knock.push(puff);
}

function waterline(b, w, y = 0) {
  b.lines.push(
    line(
      [
        [-w, y],
        [-w / 3, y + 1],
        [w / 3, y - 1],
        [w, y],
      ],
      { weight: 0.7 },
    ),
  );
  const r = rng(w);
  for (let i = 0; i < 5; i++) {
    const x = -w * 0.8 + (i / 4) * w * 1.6 + (r() - 0.5) * 30;
    const yy = y + 18 + r() * 26;
    b.lines.push(
      line(
        [
          [x - 18, yy],
          [x - 9, yy - 4],
          [x, yy],
          [x + 9, yy - 4],
          [x + 18, yy],
        ],
        { weight: 0.4 },
      ),
    );
  }
}

export const WORLD_THINGS = {
  penguin: {
    label: "Penguin",
    words: "bird ice antarctic",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-44, -20],
        [-56, -90],
        [-50, -150],
        [-30, -196],
        [0, -210],
        [26, -200],
        [40, -170],
        [50, -110],
        [46, -30],
        [20, -6],
        [-20, -6],
      ];
      shape(b, body, { tone: 0.66, smooth: true });
      const belly = [
        [-30, -30],
        [-36, -100],
        [-20, -160],
        [10, -172],
        [26, -130],
        [30, -60],
        [14, -20],
        [-14, -18],
      ];
      b.lines.push(loop(belly, { weight: 0.55 }));
      b.washes.push({ rings: [area(belly)], tone: 0.02 });
      b.knock.push(area(belly));
      b.lines.push(
        loop(
          [
            [-4, -170],
            [6, -176],
            [12, -170],
            [6, -166],
          ],
          { weight: 0.5, color: "chalk" },
        ),
      );
      b.solids.push(dot(6, -172, 2.6));
      shape(
        b,
        [
          [24, -176],
          [58, -168],
          [24, -160],
        ],
        { tone: 0.4, weight: 0.7 },
      );
      b.lines.push(
        line(
          [
            [-50, -120],
            [-70, -70],
            [-56, -50],
          ],
          { weight: 0.8 },
        ),
      );
      for (const x of [-24, 18])
        shape(
          b,
          [
            [x - 14, 0],
            [x + 16, 0],
            [x + 10, -10],
            [x - 6, -10],
          ],
          { tone: 0.4, weight: 0.7 },
        );
      return b;
    },
  },
  snake: {
    label: "Snake",
    words: "serpent eden temptation",
    zone: "floor",
    build() {
      const b = build();
      const coil = (y, rx) => {
        b.lines.push({ pts: oval(0, y, rx, rx * 0.32, { start: 0.2 }), weight: 1 });
        b.washes.push({ rings: [ovalRing(0, y, rx, rx * 0.32)], tone: 0.34 });
        b.knock.push(ovalRing(0, y, rx + 2, rx * 0.32 + 2));
      };
      coil(-20, 90);
      coil(-46, 70);
      const neck = [
        [30, -60],
        [40, -110],
        [20, -160],
        [30, -200],
        [60, -214],
        [86, -206],
        [90, -190],
        [70, -180],
        [48, -186],
        [44, -160],
        [62, -110],
        [54, -60],
      ];
      shape(b, neck, { tone: 0.34, smooth: true });
      b.solids.push(dot(72, -200, 2.4));
      b.lines.push(
        line(
          [
            [90, -196],
            [110, -194],
            [118, -200],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [110, -194],
            [118, -188],
          ],
          { weight: 0.5 },
        ),
      );
      for (const [x, y] of [
        [-40, -22],
        [0, -12],
        [40, -22],
        [-30, -48],
        [20, -44],
      ])
        b.lines.push(segment([x - 6, y], [x + 6, y], { weight: 0.4 }));
      return b;
    },
  },
  elephant: {
    label: "Elephant",
    words: "room animal zoo",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-220, -170],
        [-200, -280],
        [-120, -330],
        [20, -330],
        [120, -300],
        [170, -250],
        [190, -190],
        [196, -120],
        [180, -40],
        [180, 0],
        [130, 0],
        [128, -80],
        [60, -96],
        [40, -90],
        [40, 0],
        [-10, 0],
        [-14, -90],
        [-130, -96],
        [-140, 0],
        [-190, 0],
        [-190, -90],
        [-210, -120],
      ];
      shape(b, body, { tone: 0.42, smooth: true });
      const head = [
        [110, -310],
        [170, -350],
        [240, -340],
        [270, -290],
        [260, -220],
        [270, -120],
        [290, -60],
        [270, -40],
        [244, -70],
        [230, -160],
        [200, -200],
        [150, -220],
      ];
      shape(b, head, { tone: 0.42, smooth: true });
      const ear = [
        [150, -320],
        [110, -300],
        [90, -240],
        [110, -170],
        [160, -190],
        [190, -240],
        [190, -300],
      ];
      shape(b, ear, { tone: 0.5, smooth: true });
      b.solids.push(dot(232, -298, 3.4));
      b.lines.push(
        line(
          [
            [244, -240],
            [276, -250],
            [290, -244],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(
        line(
          [
            [-220, -170],
            [-250, -130],
            [-244, -100],
          ],
          { weight: 0.7 },
        ),
      );
      for (const x of [-170, -30, 60, 150])
        b.lines.push(
          line(
            [
              [x - 6, -6],
              [x, -2],
              [x + 6, -6],
            ],
            { weight: 0.45 },
          ),
        );
      return b;
    },
  },
  duck: {
    label: "Duck",
    words: "bird pond",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-80, -40],
        [-92, -70],
        [-60, -84],
        [0, -80],
        [20, -110],
        [26, -150],
        [50, -170],
        [76, -160],
        [80, -136],
        [62, -114],
        [64, -80],
        [80, -50],
        [50, -14],
        [-40, -12],
      ];
      shape(b, body, { tone: 0.24, smooth: true });
      shape(
        b,
        [
          [78, -152],
          [108, -146],
          [104, -136],
          [78, -138],
        ],
        { tone: 0.5, weight: 0.75 },
      );
      b.solids.push(dot(60, -150, 2.6));
      b.lines.push(
        line(
          [
            [-50, -60],
            [-10, -52],
            [30, -60],
          ],
          { weight: 0.55 },
        ),
        line(
          [
            [-30, -70],
            [10, -64],
          ],
          { weight: 0.45 },
        ),
      );
      for (const x of [-16, 16])
        b.lines.push(
          line(
            [
              [x, -14],
              [x - 2, 0],
              [x + 14, 0],
            ],
            { weight: 0.75 },
          ),
        );
      return b;
    },
  },
  snail: {
    label: "Snail",
    words: "slow garden",
    zone: "floor",
    build() {
      const b = build();
      const foot = [
        [-90, -4],
        [-70, -26],
        [40, -28],
        [80, -40],
        [96, -70],
        [106, -70],
        [102, -30],
        [80, -8],
        [0, 0],
      ];
      shape(b, foot, { tone: 0.16, smooth: true });
      const shell = [];
      for (let i = 0; i <= 90; i++) {
        const t = i / 90;
        const a = -Math.PI / 2 + t * Math.PI * 4.2;
        const r = 70 * (1 - t * 0.84);
        shell.push([-14 + Math.cos(a) * r, -84 + Math.sin(a) * r]);
      }
      b.lines.push(line(shell, { weight: 0.9 }));
      b.washes.push({ rings: [ovalRing(-14, -84, 70, 70)], tone: 0.34 });
      b.knock.push(ovalRing(-14, -84, 72, 72));
      for (const d of [-1, 1])
        b.lines.push(
          line(
            [
              [98, -68],
              [100 + d * 6, -100],
              [104 + d * 12, -112],
            ],
            { weight: 0.6 },
          ),
        );
      b.solids.push(dot(104 - 6 + 0, -112, 3), dot(116, -112, 3));
      return b;
    },
  },
  sheep: {
    label: "Sheep",
    words: "lamb farm wool counting",
    zone: "floor",
    build() {
      const b = build();
      const wool = scallop(oval(0, -110, 110, 64, { overlap: 0, step: 3 }), 8, 30, 3, { outward: true });
      b.lines.push({ pts: wool, weight: 0.9 });
      b.washes.push({ rings: [wool], tone: 0.06 });
      b.knock.push(wool);
      const head = [
        [94, -150],
        [130, -160],
        [150, -130],
        [138, -100],
        [104, -104],
      ];
      shape(b, head, { tone: 0.62, smooth: true });
      b.lines.push(
        line(
          [
            [110, -152],
            [96, -136],
            [90, -120],
          ],
          { weight: 0.6 },
        ),
      );
      b.solids.push(dot(132, -136, 2.4));
      for (const x of [-70, -40, 40, 70])
        shape(
          b,
          [
            [x - 7, -54],
            [x + 7, -54],
            [x + 6, 0],
            [x - 6, 0],
          ],
          { tone: 0.62, weight: 0.75 },
        );
      return b;
    },
  },
  cow: {
    label: "Cow",
    words: "farm milk field",
    zone: "floor",
    build() {
      const b = build();
      for (const x of [-108, 108])
        shape(
          b,
          [
            [x - 12, -100],
            [x + 12, -100],
            [x + 10, 0],
            [x - 10, 0],
          ],
          { tone: 0.2, weight: 0.85 },
        );
      const body = [
        [-170, -110],
        [-160, -200],
        [-60, -214],
        [80, -210],
        [140, -196],
        [152, -140],
        [140, -92],
        [60, -86],
        [-100, -88],
        [-160, -96],
      ];
      shape(b, body, { tone: 0.04, smooth: true });
      for (const x of [-146, 70])
        shape(
          b,
          [
            [x - 12, -100],
            [x + 12, -100],
            [x + 10, 0],
            [x - 10, 0],
          ],
          { tone: 0.04, weight: 0.85 },
        );
      for (const x of [-146, 70, -108, 108])
        b.solids.push(
          flat(
            [
              [x - 11, -10],
              [x + 11, -10],
              [x + 11, 0],
              [x - 11, 0],
            ],
            3,
          ),
        );
      for (const spot of [
        [
          [-110, -190],
          [-60, -196],
          [-50, -150],
          [-90, -130],
          [-120, -150],
        ],
        [
          [20, -200],
          [70, -196],
          [80, -160],
          [40, -140],
          [10, -160],
        ],
      ]) {
        b.lines.push(loop(spot, { weight: 0.5 }));
        b.washes.push({ rings: [area(spot)], tone: 0.62 });
      }
      const head = [
        [130, -196],
        [170, -230],
        [210, -224],
        [226, -180],
        [220, -150],
        [190, -136],
        [150, -150],
      ];
      shape(b, head, { tone: 0.04, smooth: true });
      shape(
        b,
        [
          [192, -166],
          [226, -172],
          [232, -150],
          [216, -138],
          [192, -146],
        ],
        { tone: 0.3, smooth: true, weight: 0.75 },
      );
      b.solids.push(dot(196, -200, 2.6));
      for (const d of [0, 1])
        b.lines.push(
          line(
            [
              [170 + d * 30, -230],
              [160 + d * 40, -256],
              [176 + d * 30, -262],
            ],
            { weight: 0.8 },
          ),
        );
      b.lines.push(
        line(
          [
            [-170, -150],
            [-196, -110],
            [-188, -80],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        loop(
          [
            [-20, -90],
            [14, -90],
            [8, -70],
            [-14, -70],
          ],
          { weight: 0.6 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [-20, -90],
            [14, -90],
            [8, -70],
            [-14, -70],
          ]),
        ],
        tone: 0.2,
      });
      return b;
    },
  },
  shark: {
    label: "Shark fin",
    words: "sea ocean danger swim",
    zone: "line",
    build() {
      const b = build();
      const fin = [
        [-60, 0],
        [-20, -60],
        [10, -120],
        [30, -110],
        [26, -60],
        [50, 0],
      ];
      shape(b, fin, { tone: 0.55, smooth: true });
      b.lines.push(
        line(
          [
            [-140, 2],
            [-90, -6],
            [-60, 0],
            [50, 0],
            [90, -6],
            [140, 2],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        line(
          [
            [-110, 18],
            [-80, 12],
            [-50, 18],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [60, 16],
            [90, 10],
            [120, 16],
          ],
          { weight: 0.45 },
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
  rowboat: {
    label: "Rowboat",
    words: "boat sea lost castaway oars",
    zone: "line",
    build() {
      const b = build();
      const hull = [
        [-200, -80],
        [200, -80],
        [170, -20],
        [120, 10],
        [-120, 10],
        [-170, -20],
      ];
      shape(b, hull, { tone: 0.3, smooth: true });
      b.lines.push(
        line(
          [
            [-190, -66],
            [0, -60],
            [190, -66],
          ],
          { weight: 0.5 },
        ),
      );
      for (const d of [-1, 1])
        b.lines.push(
          poly(
            [
              [d * 60, -80],
              [d * 160, 30],
            ],
            { weight: 0.9 },
          ),
          poly(
            [
              [d * 150, 20],
              [d * 180, 44],
              [d * 170, 54],
              [d * 140, 30],
            ],
            { closed: true, weight: 0.75 },
          ),
        );
      waterline(b, 280, 6);
      return b;
    },
  },
  ark: {
    label: "Noah's ark",
    words: "boat flood animals rain",
    zone: "line",
    build() {
      const b = build();
      const hull = [
        [-320, -110],
        [320, -110],
        [290, -30],
        [220, 10],
        [-220, 10],
        [-290, -30],
      ];
      shape(b, hull, { tone: 0.42, smooth: true });
      for (const y of [-80, -50, -20])
        b.lines.push(
          line(
            [
              [-300, y],
              [0, y + 4],
              [300, y],
            ],
            { weight: 0.4 },
          ),
        );
      shape(b, box(-160, -230, 320, 120), { tone: 0.2 });
      shape(
        b,
        [
          [-190, -226],
          [0, -300],
          [190, -226],
        ],
        { tone: 0.42 },
      );
      for (const x of [-110, -30, 50]) shape(b, box(x, -200, 40, 34), { tone: 0.62, weight: 0.75 });
      b.lines.push(
        line(
          [
            [60, -196],
            [80, -214],
            [96, -200],
            [92, -180],
          ],
          { weight: 0.6 },
        ),
      );
      waterline(b, 400, 6);
      return b;
    },
  },
  lighthouse: {
    label: "Lighthouse",
    words: "sea coast keeper rock",
    zone: "floor",
    build() {
      const b = build();
      const tower = [
        [-70, 0],
        [-46, -420],
        [46, -420],
        [70, 0],
      ];
      shape(b, tower, { tone: 0.04 });
      for (const [y0, y1] of [
        [-80, -140],
        [-220, -280],
        [-360, -420],
      ]) {
        const w0 = 70 - (24 * -y0) / 420;
        const w1 = 70 - (24 * -y1) / 420;
        b.washes.push({
          rings: [
            flat(
              [
                [-w0, y0],
                [w0, y0],
                [w1, y1],
                [-w1, y1],
              ],
              4,
            ),
          ],
          tone: 0.55,
        });
      }
      shape(
        b,
        [
          [-60, -420],
          [60, -420],
          [60, -436],
          [-60, -436],
        ],
        { tone: 0.5, weight: 0.85 },
      );
      shape(b, box(-32, -500, 64, 64), { tone: 0.1, weight: 0.9 });
      shape(
        b,
        [
          [-42, -500],
          [0, -540],
          [42, -500],
        ],
        { tone: 0.55 },
      );
      for (const d of [-1, 1])
        b.lines.push(
          line(
            [
              [d * 40, -470],
              [d * 200, -500],
            ],
            { weight: 0.4 },
          ),
          line(
            [
              [d * 40, -466],
              [d * 200, -436],
            ],
            { weight: 0.4 },
          ),
        );
      shape(
        b,
        [
          [-14, 0],
          [-14, -50],
          [14, -50],
          [14, 0],
        ],
        { tone: 0.6, weight: 0.75 },
      );
      shape(
        b,
        [
          [-160, 0],
          [-120, -40],
          [-40, -50],
          [60, -44],
          [130, -30],
          [170, 0],
        ],
        { tone: 0.36, smooth: true },
      );
      return b;
    },
  },
  iceberg: {
    label: "Iceberg",
    words: "ice sea titanic cold",
    zone: "line",
    build() {
      const b = build();
      const top = [
        [-150, 0],
        [-110, -90],
        [-60, -110],
        [-20, -190],
        [30, -160],
        [70, -180],
        [120, -80],
        [160, 0],
      ];
      shape(b, top, { tone: 0.06 });
      b.lines.push(
        line(
          [
            [-20, -190],
            [0, -120],
            [-30, -40],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [70, -180],
            [60, -100],
          ],
          { weight: 0.45 },
        ),
      );
      const below = [
        [-150, 0],
        [-210, 80],
        [-150, 180],
        [0, 230],
        [170, 160],
        [220, 60],
        [160, 0],
      ];
      b.lines.push(line(below, { weight: 0.45 }));
      b.washes.push({ rings: [area(below.concat([[0, 0]]))], tone: 0.08 });
      waterline(b, 300, 0);
      return b;
    },
  },
  moon: {
    label: "Moon",
    words: "night sky crescent",
    zone: "sky",
    build() {
      const b = build();
      const outer = oval(0, 0, 70, 70, { overlap: 0, step: 3 });
      const crescent = [];
      for (let i = 0; i <= 30; i++) {
        const a = -Math.PI / 2 + (i / 30) * Math.PI;
        crescent.push([Math.cos(a) * 70, Math.sin(a) * 70]);
      }
      for (let i = 30; i >= 0; i--) {
        const a = -Math.PI / 2 + (i / 30) * Math.PI;
        crescent.push([Math.cos(a) * 34 + 6, Math.sin(a) * 64]);
      }
      shape(b, crescent, { tone: 0.12, smooth: true });
      return b;
    },
  },
  stars: {
    label: "Stars",
    words: "night sky twinkle",
    zone: "sky",
    build() {
      const b = build();
      const star = (x, y, r) => {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
          const rr = i % 2 ? r * 0.42 : r;
          pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
        }
        shape(b, pts, { weight: 0.7 });
      };
      star(-120, -40, 22);
      star(30, -90, 16);
      star(140, -20, 20);
      star(-30, 30, 12);
      for (const [x, y] of [
        [-60, -100],
        [80, 40],
        [-170, 40],
        [180, -90],
      ])
        b.solids.push(dot(x, y, 3));
      return b;
    },
  },
  planet: {
    label: "Ringed planet",
    words: "space saturn sky",
    zone: "sky",
    build() {
      const b = build();
      disc(b, 0, 0, 70, { tone: 0.26, weight: 1 });
      b.lines.push(
        line(
          [
            [-60, -30],
            [0, -40],
            [60, -26],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [-66, 10],
            [0, 4],
            [66, 16],
          ],
          { weight: 0.45 },
        ),
      );
      const ring = [];
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI;
        ring.push([Math.cos(a) * 140, Math.sin(a) * 30]);
      }
      b.lines.push(
        line(
          ring.map(([x, y]) => [x * Math.cos(-0.2) - y * Math.sin(-0.2), x * Math.sin(-0.2) + y * Math.cos(-0.2)]),
          { weight: 0.95 },
        ),
      );
      b.lines.push(
        line(
          [
            [-138, 28],
            [-110, 6],
            [-70, -6],
          ],
          { weight: 0.95 },
        ),
        line(
          [
            [70, -32],
            [110, -44],
            [136, -58],
          ],
          { weight: 0.95 },
        ),
      );
      return b;
    },
  },
  rocket: {
    label: "Rocket",
    words: "space launch moon",
    zone: "sky",
    build() {
      const b = build();
      const body = [
        [0, -260],
        [40, -200],
        [50, -100],
        [44, 0],
        [-44, 0],
        [-50, -100],
        [-40, -200],
      ];
      shape(b, body, { tone: 0.08, smooth: true });
      disc(b, 0, -150, 22, { tone: 0.5, weight: 0.85 });
      for (const d of [-1, 1])
        shape(
          b,
          [
            [d * 44, -70],
            [d * 90, -10],
            [d * 86, 20],
            [d * 44, 0],
          ],
          { tone: 0.5 },
        );
      shape(
        b,
        [
          [-30, 0],
          [30, 0],
          [24, 20],
          [-24, 20],
        ],
        { tone: 0.6, weight: 0.8 },
      );
      b.lines.push(
        line(
          [
            [-20, 30],
            [-30, 80],
            [0, 60],
            [10, 110],
            [24, 60],
            [34, 84],
            [22, 30],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        line(
          [
            [-36, -220],
            [0, -214],
            [36, -220],
          ],
          { weight: 0.5 },
        ),
      );
      return b;
    },
  },
  balloon: {
    label: "Hot-air balloon",
    main: "Balloon",
    parts: { basket: "Basket" },
    words: "sky flight basket",
    zone: "sky",
    build() {
      const b = build();
      const env = [
        [0, -300],
        [90, -270],
        [130, -190],
        [110, -100],
        [40, -30],
        [-40, -30],
        [-110, -100],
        [-130, -190],
        [-90, -270],
      ];
      shape(b, env, { tone: 0.12, smooth: true });
      for (const k of [-0.55, 0, 0.55])
        b.lines.push(
          line(
            [
              [0, -300],
              [k * 130, -200],
              [k * 60, -60],
              [k * 40, -30],
            ],
            { weight: 0.5 },
          ),
        );
      b.washes.push({
        rings: [
          area([
            [0, -298],
            [60, -260],
            [70, -100],
            [30, -32],
            [-30, -32],
            [-70, -100],
            [-60, -260],
          ]),
        ],
        tone: 0.3,
      });
      for (const d of [-1, 1]) b.lines.push(segment([d * 40, -30], [d * 28, 30], { weight: 0.6 }));
      shape(b, box(-34, 30, 68, 50), { tone: 0.4, weight: 0.9, part: "basket" });
      return b;
    },
  },
  pyramid: {
    label: "Pyramid",
    words: "egypt desert pharaoh",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-340, 0],
          [0, -330],
          [340, 0],
        ],
        { tone: 0.12 },
      );
      shape(
        b,
        [
          [0, -330],
          [120, 0],
          [340, 0],
        ],
        { tone: 0.32, knock: false },
      );
      for (let y = -300; y < 0; y += 34) {
        const k = (330 + y) / 330;
        b.lines.push(segment([-340 * k, y], [120 * k, y], { weight: 0.35 }));
      }
      b.lines.push(
        line(
          [
            [-420, 2],
            [0, 6],
            [420, 2],
          ],
          { weight: 0.6 },
        ),
      );
      return b;
    },
  },
  column: {
    label: "Greek column",
    words: "ancient ruins temple statue",
    zone: "floor",
    build() {
      const b = build();
      shape(b, box(-70, -30, 140, 30), { tone: 0.12 });
      shape(b, box(-50, -440, 100, 410), { tone: 0.08 });
      for (const x of [-30, -10, 10, 30]) b.lines.push(segment([x, -436], [x, -34], { weight: 0.45 }));
      shape(
        b,
        [
          [-80, -440],
          [80, -440],
          [80, -470],
          [-80, -470],
        ],
        { tone: 0.12 },
      );
      for (const d of [-1, 1]) b.lines.push({ pts: oval(d * 76, -456, 14, 14, { start: 0.4 }), weight: 0.8 });
      return b;
    },
  },
  brickwall: {
    label: "Brick wall",
    words: "wall prison alley backdrop",
    zone: "back",
    build() {
      const b = build();
      const top = -720;
      const row = 34;
      for (let y = 0, k = 0; y > top; y -= row, k++) {
        b.lines.push(segment([-500, y], [500, y], { weight: 0.42 }));
        for (let x = -500 + (k % 2 ? 40 : 0); x < 500; x += 80) b.lines.push(segment([x, y], [x, y - row], { weight: 0.38 }));
      }
      b.washes.push({ rings: [flat(box(-500, top, 1000, -top), 20)], tone: 0.14 });
      return b;
    },
  },
  curtain: {
    label: "Stage curtain",
    words: "theatre stage show comedy backdrop",
    zone: "back",
    build() {
      const b = build();
      const side = (d) => {
        const outer = d * 500;
        const pts = [
          [outer, -760],
          [d * 330, -760],
          [d * 300, -500],
          [d * 320, -300],
          [d * 380, -180],
          [d * 400, 0],
          [outer, 0],
        ];
        shape(b, pts, { tone: 0.5, knock: false, smooth: false });
        for (let k = 1; k < 4; k++)
          b.lines.push(
            line(
              [
                [d * (330 + k * 40), -760],
                [d * (320 + k * 44), -400],
                [d * (400 + k * 26), 0],
              ],
              { weight: 0.5 },
            ),
          );
      };
      side(-1);
      side(1);
      const valance = [
        [-500, -800],
        [500, -800],
        [500, -660],
      ];
      for (let x = 500; x >= -500; x -= 100) valance.push([x, -660], [x - 50, -640]);
      valance.push([-500, -660]);
      shape(b, valance, { tone: 0.55, knock: false });
      b.lines.push(segment([-500, 0], [500, 0], { weight: 0.8 }));
      return b;
    },
  },
};

function cover(b, ring) {
  const box = bounds(ring);
  const hidden = (p) => p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h && pointInRing(p, ring);
  b.lines = b.lines.flatMap((l) => {
    const runs = [];
    let run = [];
    for (const p of l.pts) {
      if (hidden(p)) {
        if (run.length > 1) runs.push(run);
        run = [];
      } else run.push(p);
    }
    if (run.length > 1) runs.push(run);
    return runs.map((pts) => ({ ...l, pts }));
  });
  b.solids = b.solids.filter((r) => !r.every((p) => hidden(p)));
}

function front(b, pts, opts) {
  const ring = opts?.circle ? ovalRing(pts[0], pts[1], pts[2] + 1, pts[2] + 1) : area(pts);
  cover(b, ring);
  if (opts?.circle) disc(b, pts[0], pts[1], pts[2], opts);
  else shape(b, pts, { smooth: true, ...opts });
}

function legs(b, xs, top, tone, w = 12) {
  for (const x of xs)
    shape(
      b,
      [
        [x - w, top],
        [x + w, top],
        [x + w * 0.8, -6],
        [x - w * 0.8, -6],
      ],
      { tone, weight: 0.85 },
    );
  for (const x of xs)
    b.solids.push(
      flat(
        [
          [x - w * 0.9, -12],
          [x + w * 0.9, -12],
          [x + w, 0],
          [x - w, 0],
        ],
        3,
      ),
    );
}

function eye(b, x, y, r = 2.8) {
  b.solids.push(dot(x, y, r));
}

export const ANIMALS = {
  horse: {
    label: "Horse",
    words: "pony farm ride",
    zone: "floor",
    build() {
      const b = build();
      legs(b, [-104, 96], -130, 0.4);
      const body = [
        [-156, -150],
        [-130, -206],
        [0, -214],
        [110, -204],
        [150, -176],
        [150, -140],
        [118, -118],
        [-120, -118],
        [-158, -128],
      ];
      front(b, body, { tone: 0.3 });
      front(
        b,
        [
          [96, -196],
          [128, -276],
          [160, -322],
          [196, -324],
          [246, -270],
          [240, -248],
          [206, -254],
          [180, -232],
          [150, -168],
        ],
        { tone: 0.3 },
      );
      shape(
        b,
        [
          [176, -320],
          [188, -350],
          [198, -318],
        ],
        { tone: 0.3, weight: 0.8 },
      );
      b.lines.push(
        line(
          scallop(
            spline([
              [122, -288],
              [146, -318],
              [176, -330],
            ]),
            5,
            16,
            3,
          ),
          { weight: 0.8 },
        ),
        line(
          [
            [106, -236],
            [124, -290],
          ],
          { weight: 0.6 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [110, -230],
            [130, -290],
            [170, -326],
            [176, -316],
            [140, -280],
            [124, -220],
          ]),
        ],
        tone: 0.62,
      });
      eye(b, 196, -296);
      b.solids.push(dot(236, -262, 2));
      b.lines.push(
        line(
          [
            [-156, -170],
            [-196, -130],
            [-190, -70],
            [-170, -60],
          ],
          { weight: 1.4 },
        ),
        line(
          [
            [-160, -164],
            [-188, -116],
            [-176, -74],
          ],
          { weight: 0.7 },
        ),
      );
      legs(b, [-136, 128], -130, 0.3);
      return b;
    },
  },
  pig: {
    label: "Pig",
    words: "farm pink mud",
    zone: "floor",
    build() {
      const b = build();
      legs(b, [-60, 70], -40, 0.2, 13);
      b.lines.push({ pts: oval(-10, -90, 120, 64, { start: -2 }), weight: 1 });
      b.washes.push({ rings: [ovalRing(-10, -90, 118, 62)], tone: 0.12 });
      b.knock.push(ovalRing(-10, -90, 121, 65));
      front(b, [110, -110, 50], { circle: true, tone: 0.12, weight: 1 });
      shape(
        b,
        [
          [96, -154],
          [112, -178],
          [126, -150],
        ],
        { tone: 0.2, weight: 0.8 },
      );
      b.lines.push({ pts: oval(158, -102, 14, 19, { start: 0.3 }), weight: 0.9 });
      b.washes.push({ rings: [ovalRing(158, -102, 13, 18)], tone: 0.24 });
      b.solids.push(dot(155, -108, 2.4), dot(161, -96, 2.4));
      eye(b, 126, -122);
      const tail = [];
      for (let i = 0; i <= 30; i++) {
        const a = (i / 30) * Math.PI * 3;
        tail.push([-130 - i * 0.8 + Math.cos(a) * 9, -110 + Math.sin(a) * 9]);
      }
      b.lines.push(line(tail, { weight: 0.7 }));
      legs(b, [-84, 46], -40, 0.12, 13);
      return b;
    },
  },
  chicken: {
    label: "Chicken",
    words: "hen rooster farm egg road",
    zone: "floor",
    build() {
      const b = build();
      for (const x of [-12, 18])
        b.lines.push(
          line(
            [
              [x, -44],
              [x + 2, -6],
              [x - 10, 0],
            ],
            { weight: 0.7 },
          ),
          line(
            [
              [x + 2, -6],
              [x + 14, 0],
            ],
            { weight: 0.7 },
          ),
        );
      const body = [
        [-60, -66],
        [-74, -112],
        [-36, -134],
        [10, -124],
        [32, -156],
        [52, -194],
        [82, -198],
        [98, -174],
        [86, -144],
        [72, -112],
        [62, -66],
        [20, -42],
        [-30, -42],
      ];
      front(b, body, { tone: 0.05 });
      const comb = scallop(
        spline([
          [54, -196],
          [70, -214],
          [88, -200],
        ]),
        4,
        10,
        1,
      );
      b.lines.push(line(comb, { weight: 0.8 }));
      b.washes.push({
        rings: [
          area([
            [54, -196],
            [62, -216],
            [74, -218],
            [86, -210],
            [88, -200],
          ]),
        ],
        tone: 0.55,
      });
      shape(
        b,
        [
          [96, -180],
          [118, -172],
          [96, -166],
        ],
        { tone: 0.4, weight: 0.75 },
      );
      b.lines.push(
        loop(
          [
            [94, -160],
            [100, -150],
            [92, -146],
            [88, -156],
          ],
          { weight: 0.6 },
        ),
      );
      eye(b, 82, -182, 2.4);
      for (const k of [0, 1, 2])
        b.lines.push(
          line(
            [
              [-60, -100 - k * 6],
              [-96, -130 - k * 22],
              [-80, -96 - k * 8],
            ],
            { weight: 0.75 },
          ),
        );
      b.lines.push(
        line(
          [
            [-30, -96],
            [0, -84],
            [30, -96],
          ],
          { weight: 0.55 },
        ),
        line(
          [
            [-20, -86],
            [10, -76],
          ],
          { weight: 0.45 },
        ),
      );
      return b;
    },
  },
  rabbit: {
    label: "Rabbit",
    words: "bunny hare magic hat",
    zone: "floor",
    build() {
      const b = build();
      const ears = [
        [
          [36, -186],
          [26, -250],
          [36, -282],
          [52, -256],
          [50, -190],
        ],
        [
          [64, -186],
          [70, -250],
          [88, -274],
          [94, -244],
          [78, -186],
        ],
      ];
      for (const ear of ears) shape(b, ear, { tone: 0.12, smooth: true });
      b.lines.push({ pts: oval(-6, -72, 76, 70, { start: -2 }), weight: 1 });
      b.washes.push({ rings: [ovalRing(-6, -72, 74, 68)], tone: 0.12 });
      b.knock.push(ovalRing(-6, -72, 77, 71));
      front(b, [62, -150, 42], { circle: true, tone: 0.12, weight: 1 });
      b.lines.push({ pts: scallop(oval(-84, -60, 18, 18, { overlap: 0.1, step: 3 }), 2.6, 8, 2), weight: 0.7 });
      eye(b, 76, -160);
      b.solids.push(dot(102, -142, 3));
      for (const k of [-1, 1])
        b.lines.push(
          line(
            [
              [100, -138],
              [130, -138 + k * 8],
            ],
            { weight: 0.4 },
          ),
        );
      b.lines.push(
        line(
          [
            [30, -6],
            [70, -2],
            [86, -10],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [-40, -6],
            [-10, -2],
          ],
          { weight: 0.8 },
        ),
      );
      return b;
    },
  },
  mouse: {
    label: "Mouse",
    words: "rat cheese hole small",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-50, -8],
        [-62, -40],
        [-30, -68],
        [24, -62],
        [56, -38],
        [78, -22],
        [52, -6],
      ];
      front(b, body, { tone: 0.4 });
      disc(b, 18, -66, 16, { tone: 0.28, weight: 0.8 });
      eye(b, 50, -40, 2.4);
      b.solids.push(dot(80, -22, 3));
      for (const k of [-1, 1])
        b.lines.push(
          line(
            [
              [76, -24],
              [104, -24 + k * 8],
            ],
            { weight: 0.35 },
          ),
        );
      b.lines.push(
        line(
          [
            [-50, -14],
            [-90, -12],
            [-110, -34],
            [-100, -60],
            [-80, -64],
          ],
          { weight: 0.65 },
        ),
      );
      return b;
    },
  },
  owl: {
    label: "Owl",
    words: "bird night wise branch",
    zone: "sky",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-110, 0],
            [0, -4],
            [110, 2],
          ],
          { weight: 1.2 },
        ),
        line(
          [
            [90, 0],
            [120, -20],
          ],
          { weight: 0.8 },
        ),
      );
      const body = [
        [-56, -20],
        [-66, -100],
        [-52, -170],
        [-40, -200],
        [-26, -184],
        [0, -190],
        [26, -184],
        [40, -200],
        [52, -170],
        [66, -100],
        [56, -20],
        [0, -8],
      ];
      front(b, body, { tone: 0.36 });
      for (const x of [-22, 22]) {
        disc(b, x, -148, 20, { tone: 0.02, weight: 0.85 });
        b.solids.push(dot(x + 3, -146, 6));
      }
      shape(
        b,
        [
          [-6, -128],
          [6, -128],
          [0, -110],
        ],
        { tone: 0.5, weight: 0.7 },
      );
      for (const k of [0, 1, 2])
        b.lines.push(
          line(
            [
              [-30 + k * 22, -80],
              [-22 + k * 22, -70],
              [-14 + k * 22, -80],
            ],
            { weight: 0.45 },
          ),
        );
      for (const x of [-16, 16])
        b.lines.push(
          line(
            [
              [x - 8, -10],
              [x, 2],
              [x + 8, -10],
            ],
            { weight: 0.7 },
          ),
        );
      return b;
    },
  },
  crow: {
    label: "Crow",
    words: "raven bird black omen",
    zone: "floor",
    build() {
      const b = build();
      for (const x of [-6, 14])
        b.lines.push(
          line(
            [
              [x, -34],
              [x + 2, 0],
            ],
            { weight: 0.75 },
          ),
          line(
            [
              [x - 8, 0],
              [x + 12, 0],
            ],
            { weight: 0.6 },
          ),
        );
      const body = [
        [-90, -24],
        [-50, -70],
        [10, -86],
        [52, -112],
        [86, -108],
        [96, -96],
        [70, -84],
        [52, -60],
        [10, -36],
        [-40, -32],
      ];
      front(b, body, { tone: 0.72 });
      shape(
        b,
        [
          [94, -102],
          [128, -94],
          [94, -88],
        ],
        { tone: 0.62, weight: 0.8 },
      );
      b.lines.push(
        line(
          [
            [-20, -60],
            [20, -66],
            [40, -52],
          ],
          { weight: 0.5, color: "chalk" },
        ),
      );
      b.solids.push(dot(74, -100, 2.6));
      b.lines.push({ pts: oval(74, -100, 4.6, 4.6), weight: 0.4, color: "chalk" });
      return b;
    },
  },
  fish: {
    label: "Big fish",
    words: "catch dinner sea trout",
    zone: "table",
    build() {
      const b = build();
      const body = [
        [-110, -50],
        [-40, -96],
        [50, -96],
        [120, -56],
        [130, -46],
        [118, -30],
        [50, 0],
        [-40, -2],
        [-110, -42],
      ];
      front(b, body, { tone: 0.22 });
      shape(
        b,
        [
          [-108, -46],
          [-160, -90],
          [-150, -46],
          [-164, 0],
        ],
        { tone: 0.3, weight: 0.9 },
      );
      shape(
        b,
        [
          [-10, -94],
          [20, -128],
          [40, -94],
        ],
        { tone: 0.3, weight: 0.8 },
      );
      b.lines.push(
        line(
          [
            [70, -86],
            [60, -50],
            [72, -14],
          ],
          { weight: 0.7 },
        ),
      );
      eye(b, 98, -62, 3.4);
      b.lines.push({ pts: oval(98, -62, 7, 7), weight: 0.5 });
      for (let x = -70; x < 50; x += 22)
        for (let y = -74; y < -10; y += 20)
          b.lines.push(
            line(
              [
                [x, y],
                [x + 8, y + 7],
                [x, y + 14],
              ],
              { weight: 0.35 },
            ),
          );
      return b;
    },
  },
  whale: {
    label: "Whale",
    words: "sea ocean spout moby",
    zone: "line",
    build() {
      const b = build();
      const body = [
        [-240, 0],
        [-200, -80],
        [-80, -140],
        [80, -136],
        [200, -90],
        [250, -30],
        [250, 0],
      ];
      front(b, body, { tone: 0.5 });
      shape(
        b,
        [
          [-230, -10],
          [-300, -100],
          [-280, -56],
          [-330, -40],
          [-260, -24],
        ],
        { tone: 0.5, weight: 0.9 },
      );
      b.lines.push(
        line(
          [
            [140, -50],
            [200, -40],
            [240, -46],
          ],
          { weight: 0.7 },
        ),
      );
      eye(b, 170, -76, 3.4);
      b.lines.push({ pts: oval(170, -76, 7, 7), weight: 0.5, color: "chalk" });
      b.lines.push(
        line(
          [
            [40, -136],
            [36, -180],
            [20, -200],
          ],
          { weight: 0.7 },
        ),
        line(
          [
            [40, -136],
            [46, -186],
            [64, -204],
          ],
          { weight: 0.7 },
        ),
        line(
          [
            [40, -140],
            [40, -196],
          ],
          { weight: 0.6 },
        ),
      );
      for (const [x, y] of [
        [14, -206],
        [70, -208],
        [40, -214],
      ])
        b.lines.push({ pts: oval(x, y, 6, 6), weight: 0.45 });
      waterline(b, 380, 0);
      return b;
    },
  },
  frog: {
    label: "Frog",
    words: "pond prince lily",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-70, -10],
        [-80, -60],
        [-50, -100],
        [0, -110],
        [50, -100],
        [80, -60],
        [70, -10],
        [0, 0],
      ];
      front(b, body, { tone: 0.34 });
      for (const x of [-34, 34]) {
        front(b, [x, -112, 22], { circle: true, tone: 0.04, weight: 0.9 });
        b.solids.push(dot(x, -110, 7));
      }
      b.lines.push(
        line(
          [
            [-40, -72],
            [0, -58],
            [40, -72],
          ],
          { weight: 0.8 },
        ),
      );
      for (const d of [-1, 1])
        b.lines.push(
          line(
            [
              [d * 60, -30],
              [d * 96, -16],
              [d * 110, 0],
              [d * 70, 0],
            ],
            { weight: 0.85 },
          ),
        );
      return b;
    },
  },
  turtle: {
    label: "Turtle",
    words: "tortoise slow shell race",
    zone: "floor",
    build() {
      const b = build();
      const shell = [
        [-110, -30],
        [-90, -100],
        [-30, -136],
        [40, -132],
        [96, -96],
        [114, -30],
      ];
      shape(b, shell, { tone: 0.36, smooth: true });
      b.lines.push(
        line(
          [
            [-120, -30],
            [0, -26],
            [124, -30],
          ],
          { weight: 0.9 },
        ),
      );
      for (const pts of [
        [
          [-60, -110],
          [-30, -80],
          [10, -90],
          [30, -124],
        ],
        [
          [-30, -80],
          [-40, -36],
        ],
        [
          [10, -90],
          [30, -40],
        ],
        [
          [30, -124],
          [60, -90],
          [100, -70],
        ],
        [
          [-60, -110],
          [-90, -60],
        ],
      ])
        b.lines.push(line(pts, { weight: 0.5 }));
      front(
        b,
        [
          [110, -50],
          [140, -70],
          [168, -66],
          [176, -50],
          [160, -36],
          [120, -34],
        ],
        { tone: 0.24 },
      );
      eye(b, 156, -56, 2.4);
      for (const x of [-80, 70])
        shape(
          b,
          [
            [x - 16, -28],
            [x + 16, -28],
            [x + 18, 0],
            [x - 14, 0],
          ],
          { tone: 0.24, weight: 0.8 },
        );
      return b;
    },
  },
  lion: {
    label: "Lion",
    words: "king jungle zoo circus mane",
    zone: "floor",
    build() {
      const b = build();
      legs(b, [-110, 90], -110, 0.36, 14);
      const body = [
        [-160, -110],
        [-150, -190],
        [-40, -210],
        [80, -200],
        [120, -150],
        [110, -110],
        [-130, -100],
      ];
      front(b, body, { tone: 0.2 });
      b.lines.push(
        line(
          [
            [-160, -150],
            [-210, -110],
            [-220, -60],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push({ pts: scallop(oval(-222, -52, 12, 14, { overlap: 0.1, step: 2 }), 2, 6, 1), weight: 0.6 });
      b.washes.push({ rings: [ovalRing(-222, -52, 11, 13)], tone: 0.55 });
      const mane = scallop(oval(130, -220, 86, 90, { overlap: 0, step: 3 }), 12, 30, 4, { outward: true });
      cover(b, mane);
      b.lines.push({ pts: mane, weight: 0.95 });
      b.washes.push({ rings: [mane], tone: 0.5 });
      b.knock.push(mane);
      disc(b, 144, -214, 52, { tone: 0.16, weight: 0.95 });
      eye(b, 130, -230);
      eye(b, 164, -230);
      shape(
        b,
        [
          [144, -212],
          [160, -212],
          [152, -200],
        ],
        { tone: 0.6, weight: 0.6 },
      );
      b.lines.push(
        line(
          [
            [136, -186],
            [152, -194],
            [168, -186],
          ],
          { weight: 0.6 },
        ),
      );
      legs(b, [-140, 116], -110, 0.2, 14);
      return b;
    },
  },
  giraffe: {
    label: "Giraffe",
    words: "tall zoo safari africa",
    zone: "floor",
    build() {
      const b = build();
      legs(b, [-70, 60], -230, 0.18, 10);
      const body = [
        [-100, -260],
        [-80, -320],
        [40, -340],
        [110, -320],
        [120, -270],
        [90, -230],
        [-90, -230],
      ];
      front(b, body, { tone: 0.1 });
      front(
        b,
        [
          [70, -320],
          [110, -460],
          [140, -600],
          [176, -600],
          [160, -480],
          [116, -290],
        ],
        { tone: 0.1 },
      );
      front(
        b,
        [
          [136, -610],
          [170, -640],
          [226, -620],
          [236, -600],
          [210, -586],
          [160, -584],
        ],
        { tone: 0.1 },
      );
      for (const x of [158, 172]) {
        b.lines.push(segment([x, -634], [x - 2, -666], { weight: 0.8 }));
        b.solids.push(dot(x - 2, -668, 5));
      }
      eye(b, 186, -616);
      for (const [x, y, r] of [
        [-60, -290, 18],
        [-10, -300, 20],
        [40, -296, 18],
        [86, -284, 14],
        [-30, -258, 12],
        [20, -260, 14],
        [110, -380, 12],
        [128, -460, 12],
        [140, -540, 10],
        [120, -320, 10],
      ]) {
        const spot = scallop(oval(x, y, r, r * 0.8, { overlap: 0, step: 2 }), 2, 9, x);
        b.washes.push({ rings: [spot], tone: 0.5 });
      }
      b.lines.push(
        line(
          [
            [-100, -270],
            [-130, -230],
            [-126, -200],
          ],
          { weight: 0.7 },
        ),
      );
      legs(b, [-96, 86], -230, 0.1, 10);
      return b;
    },
  },
  camel: {
    label: "Camel",
    words: "desert hump sahara",
    zone: "floor",
    build() {
      const b = build();
      legs(b, [-90, 70], -170, 0.32, 11);
      const body = [
        [-140, -200],
        [-100, -320],
        [-50, -330],
        [-20, -270],
        [20, -320],
        [70, -312],
        [120, -230],
        [110, -180],
        [-130, -176],
      ];
      front(b, body, { tone: 0.26 });
      front(
        b,
        [
          [100, -220],
          [150, -200],
          [180, -260],
          [200, -300],
          [240, -304],
          [250, -284],
          [220, -270],
          [194, -224],
          [160, -170],
          [110, -180],
        ],
        { tone: 0.26 },
      );
      eye(b, 222, -290);
      b.lines.push(
        line(
          [
            [-140, -210],
            [-170, -170],
            [-162, -130],
          ],
          { weight: 0.7 },
        ),
      );
      legs(b, [-116, 96], -170, 0.26, 11);
      return b;
    },
  },
  dinosaur: {
    label: "Dinosaur",
    words: "brontosaurus extinct jurassic prehistoric",
    zone: "floor",
    build() {
      const b = build();
      legs(b, [-110, 90], -150, 0.36, 22);
      const body = [
        [-360, -100],
        [-200, -150],
        [-120, -240],
        [40, -260],
        [130, -220],
        [180, -280],
        [210, -420],
        [250, -470],
        [300, -470],
        [320, -446],
        [290, -430],
        [250, -420],
        [230, -300],
        [190, -170],
        [120, -130],
        [-120, -130],
        [-240, -110],
      ];
      front(b, body, { tone: 0.3 });
      eye(b, 286, -456);
      b.lines.push(
        line(
          [
            [250, -450],
            [290, -440],
          ],
          { weight: 0.5 },
        ),
      );
      b.lines.push(
        line(
          [
            [-60, -230],
            [0, -200],
            [60, -230],
          ],
          { weight: 0.5 },
        ),
      );
      legs(b, [-150, 130], -150, 0.3, 22);
      return b;
    },
  },
  grizzly: {
    label: "Bear",
    words: "grizzly forest woods",
    zone: "floor",
    build() {
      const b = build();
      legs(b, [-100, 80], -120, 0.6, 22);
      const body = [
        [-170, -130],
        [-150, -230],
        [-40, -270],
        [60, -260],
        [140, -220],
        [160, -150],
        [130, -110],
        [-150, -110],
      ];
      front(b, body, { tone: 0.55 });
      disc(b, 150, -272, 14, { tone: 0.55, weight: 0.8 });
      front(
        b,
        [
          [110, -230],
          [140, -270],
          [190, -270],
          [234, -230],
          [240, -206],
          [210, -196],
          [170, -190],
          [130, -196],
        ],
        { tone: 0.55 },
      );
      eye(b, 196, -244);
      b.solids.push(dot(238, -218, 5));
      legs(b, [-134, 116], -120, 0.55, 22);
      return b;
    },
  },
};
