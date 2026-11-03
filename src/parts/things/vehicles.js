import { area, build, dot, flat, hideUnder, line, loop, oval, ovalRing, poly, segment } from "../kit.js";
import { arch, box, disc, shape, waterline } from "./draw.js";

function plainWheel(b, x, y, r) {
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

function tyre(b, x, y, r) {
  b.lines.push({ pts: oval(x, y, r, r, { start: -1.2 }), weight: 1 });
  b.lines.push({ pts: oval(x, y, r * 0.45, r * 0.45), weight: 0.7 });
  b.washes.push({ rings: [ovalRing(x, y, r, r)], tone: 0.62, part: "wheels" });
  b.knock.push(ovalRing(x, y, r + 1, r + 1));
}

function occlude(b, ring) {
  b.lines = hideUnder(b.lines, [ring]);
  b.washes.push({ rings: [ring], paper: true });
}

function wheel(b, x, y, r, { spokes = 0, tone = 0.62, hub = 0.45 } = {}) {
  if (!spokes) occlude(b, ovalRing(x, y, r, r));
  b.lines.push({ pts: oval(x, y, r, r, { start: -1.2 }), weight: 1 });
  b.knock.push(ovalRing(x, y, r + 1, r + 1));
  if (spokes) {
    b.lines.push({ pts: oval(x, y, r - 5, r - 5), weight: 0.5 });
    b.washes.push({ rings: [ovalRing(x, y, r, r)], tone: 0.6, part: "wheels" }, { rings: [ovalRing(x, y, r - 5, r - 5)], paper: true });
    for (let k = 0; k < spokes; k++) {
      const a = (k / spokes) * Math.PI;
      b.lines.push(segment([x + Math.cos(a) * (r - 5), y + Math.sin(a) * (r - 5)], [x - Math.cos(a) * (r - 5), y - Math.sin(a) * (r - 5)], { weight: 0.3 }));
    }
    b.solids.push(dot(x, y, Math.max(2, r * 0.08)));
    return;
  }
  b.lines.push({ pts: oval(x, y, r * 0.45, r * 0.45), weight: 0.7 });
  b.washes.push({ rings: [ovalRing(x, y, r, r)], tone, part: "wheels" }, { rings: [ovalRing(x, y, r * 0.45, r * 0.45)], tone: hub, part: "wheels" });
}

function windows(b, x, y, w, h, n, gap, tone = 0.45) {
  for (let i = 0; i < n; i++)
    shape(
      b,
      [
        [x + i * (w + gap), y],
        [x + i * (w + gap) + w, y],
        [x + i * (w + gap) + w, y + h],
        [x + i * (w + gap), y + h],
      ],
      { tone, weight: 0.75, knock: false, part: "windows" },
    );
}

function carWith(extra) {
  return () => {
    const b = VEHICLES.car.build();
    extra(b);
    return b;
  };
}

export const VEHICLES = {
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
  taxi: {
    label: "Taxi",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    words: "cab car yellow city ride",
    zone: "floor",
    build: carWith((b) => {
      shape(
        b,
        [
          [-6, -184],
          [-4, -212],
          [46, -212],
          [48, -184],
        ],
        { tone: 0.12, weight: 0.85 },
      );
      for (let x = 2; x < 42; x += 10) b.lines.push(segment([x, -205], [x + 4, -191], { weight: 0.45 }));
      for (let x = -240; x < 240; x += 16)
        b.washes.push({
          rings: [
            flat(
              [
                [x, -82],
                [x + 8, -82],
                [x + 8, -74],
                [x, -74],
              ],
              2,
            ),
          ],
          tone: 0.55,
        });
    }),
  },
  police: {
    label: "Police car",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    words: "cop law siren patrol",
    zone: "floor",
    build: carWith((b) => {
      shape(
        b,
        [
          [-30, -184],
          [-28, -198],
          [58, -198],
          [60, -184],
        ],
        { tone: 0.4, weight: 0.85 },
      );
      shape(
        b,
        [
          [-22, -198],
          [-14, -210],
          [-2, -210],
          [6, -198],
        ],
        { tone: 0.15, weight: 0.7, smooth: true },
      );
      shape(
        b,
        [
          [24, -198],
          [32, -210],
          [44, -210],
          [52, -198],
        ],
        { tone: 0.55, weight: 0.7, smooth: true },
      );
      for (const [x, y] of [
        [-20, -226],
        [-8, -232],
        [4, -226],
        [36, -226],
        [48, -232],
        [60, -226],
      ])
        b.lines.push(segment([x, y], [x + (x < 20 ? -4 : 4), y - 8], { weight: 0.4 }));
      shape(
        b,
        [
          [20, -96],
          [44, -96],
          [44, -72],
          [32, -62],
          [20, -72],
        ],
        { tone: 0.06, weight: 0.7, knock: false },
      );
    }),
  },
  bus: {
    label: "Bus",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    words: "coach transit city stop",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-300, -34],
        [-304, -250],
        [-290, -270],
        [290, -270],
        [304, -244],
        [306, -60],
        [300, -34],
      ];
      shape(b, body, { tone: 0.24, weight: 1.05 });
      windows(b, -270, -246, 62, 70, 7, 16, 0.5);
      shape(
        b,
        [
          [244, -246],
          [292, -246],
          [296, -150],
          [244, -150],
        ],
        { tone: 0.45, weight: 0.8, knock: false, part: "windows" },
      );
      shape(
        b,
        [
          [-264, -160],
          [-214, -160],
          [-214, -46],
          [-264, -46],
        ],
        { tone: 0.42, weight: 0.8, knock: false },
      );
      b.lines.push(
        segment([-239, -160], [-239, -46], { weight: 0.5 }),
        segment([-300, -150], [306, -150], { weight: 0.5 }),
        segment([-300, -132], [306, -132], { weight: 0.5 }),
      );
      b.lines.push({ pts: oval(294, -70, 8, 10), weight: 0.7 });
      shape(
        b,
        [
          [-286, -286],
          [-200, -286],
          [-200, -270],
          [-286, -270],
        ],
        { tone: 0.1, weight: 0.7 },
      );
      wheel(b, -190, -36, 36);
      wheel(b, 190, -36, 36);
      return b;
    },
  },
  truck: {
    label: "Lorry",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    words: "truck delivery cargo lorry",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-300, -40],
          [-300, -300],
          [120, -300],
          [120, -40],
        ],
        { tone: 0.12, weight: 1.05 },
      );
      for (let x = -260; x < 110; x += 60) b.lines.push(segment([x, -294], [x, -46], { weight: 0.35 }));
      const cab = [
        [128, -40],
        [128, -230],
        [220, -230],
        [262, -150],
        [272, -110],
        [272, -40],
      ];
      shape(b, cab, { tone: 0.3, weight: 1.05 });
      shape(
        b,
        [
          [150, -214],
          [210, -214],
          [244, -150],
          [150, -150],
        ],
        { tone: 0.5, weight: 0.8, knock: false, part: "windows" },
      );
      b.lines.push(segment([150, -130], [170, -130], { weight: 0.9 }), { pts: oval(264, -84, 7, 9), weight: 0.7 });
      wheel(b, -230, -36, 36);
      wheel(b, -150, -36, 36);
      wheel(b, 200, -36, 36);
      return b;
    },
  },
  van: {
    label: "Camper van",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    words: "van road trip hippie camper",
    zone: "floor",
    build() {
      const b = build();
      const body = [
        [-230, -40],
        [-236, -220],
        [-210, -246],
        [150, -246],
        [196, -210],
        [226, -150],
        [234, -90],
        [230, -40],
      ];
      shape(b, body, { tone: 0.16, weight: 1.05, smooth: true });
      shape(
        b,
        [
          [-232, -150],
          [232, -150],
          [234, -40],
          [-230, -40],
        ],
        { tone: 0.32, weight: 0.6 },
      );
      windows(b, -206, -224, 70, 56, 3, 14, 0.48);
      shape(
        b,
        [
          [120, -224],
          [154, -224],
          [200, -164],
          [120, -164],
        ],
        { tone: 0.5, weight: 0.8, knock: false, part: "windows" },
      );
      b.lines.push(segment([110, -228], [110, -46], { weight: 0.55 }), segment([94, -120], [104, -120], { weight: 0.9 }));
      b.lines.push(
        { pts: oval(-30, -100, 26, 26), weight: 0.6 },
        segment([-30, -126], [-30, -74], { weight: 0.5 }),
        segment([-30, -100], [-48, -82], { weight: 0.5 }),
        segment([-30, -100], [-12, -82], { weight: 0.5 }),
      );
      wheel(b, -150, -36, 36);
      wheel(b, 150, -36, 36);
      return b;
    },
  },
  ambulance: {
    label: "Ambulance",
    main: "Body",
    parts: { windows: "Windows", wheels: "Wheels" },
    words: "hospital emergency siren doctor",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-250, -40],
          [-250, -270],
          [90, -270],
          [90, -40],
        ],
        { tone: 0.04, weight: 1.05 },
      );
      const cab = [
        [96, -40],
        [96, -220],
        [176, -220],
        [222, -140],
        [232, -96],
        [232, -40],
      ];
      shape(b, cab, { tone: 0.06, weight: 1.05 });
      shape(
        b,
        [
          [116, -204],
          [168, -204],
          [204, -140],
          [116, -140],
        ],
        { tone: 0.48, weight: 0.8, knock: false, part: "windows" },
      );
      shape(
        b,
        [
          [-100, -210],
          [-60, -210],
          [-60, -170],
          [-20, -170],
          [-20, -130],
          [-60, -130],
          [-60, -90],
          [-100, -90],
          [-100, -130],
          [-140, -130],
          [-140, -170],
          [-100, -170],
        ],
        { tone: 0.5, weight: 0.8, knock: false },
      );
      b.lines.push(segment([-250, -70], [232, -70], { weight: 0.5 }), segment([-250, -60], [232, -60], { weight: 0.5 }));
      shape(
        b,
        [
          [-10, -270],
          [-6, -290],
          [30, -290],
          [34, -270],
        ],
        { tone: 0.4, weight: 0.8 },
      );
      wheel(b, -170, -36, 36);
      wheel(b, 160, -36, 36);
      return b;
    },
  },
  motorbike: {
    label: "Motorbike",
    main: "Body",
    parts: { wheels: "Wheels" },
    words: "motorcycle moto bike biker ride",
    zone: "floor",
    build() {
      const b = build();
      wheel(b, -120, -46, 46, { spokes: 8 });
      wheel(b, 128, -46, 46, { spokes: 8 });
      b.lines.push(
        line(
          [
            [128, -46],
            [104, -110],
            [92, -164],
          ],
          { weight: 1.1 },
        ),
        line(
          [
            [118, -46],
            [96, -110],
            [84, -160],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push(
        line(
          [
            [78, -170],
            [92, -176],
            [112, -190],
            [124, -192],
          ],
          { weight: 1 },
        ),
      );
      shape(
        b,
        [
          [-30, -126],
          [10, -150],
          [74, -150],
          [90, -126],
          [60, -104],
          [-10, -106],
        ],
        { tone: 0.55, weight: 0.95, smooth: true },
      );
      shape(
        b,
        [
          [-120, -126],
          [-34, -132],
          [-30, -116],
          [-110, -108],
        ],
        { tone: 0.7, weight: 0.85, smooth: true },
      );
      shape(
        b,
        [
          [-40, -100],
          [40, -100],
          [52, -60],
          [-30, -50],
        ],
        { tone: 0.3, weight: 0.85 },
      );
      b.lines.push(
        line(
          [
            [-120, -46],
            [-60, -96],
            [-40, -100],
          ],
          { weight: 0.9 },
        ),
        line(
          [
            [-30, -50],
            [-60, -40],
            [-140, -34],
          ],
          { weight: 0.9 },
        ),
      );
      b.lines.push(
        line(
          [
            [-60, -56],
            [-160, -60],
            [-176, -54],
          ],
          { weight: 1.3 },
        ),
      );
      shape(
        b,
        [
          [96, -150],
          [114, -162],
          [124, -146],
          [108, -134],
        ],
        { tone: 0.15, weight: 0.8, smooth: true },
      );
      return b;
    },
  },
  bicycle: {
    label: "Bicycle",
    main: "Frame",
    parts: { wheels: "Wheels" },
    words: "bike cycle pedal",
    zone: "floor",
    build() {
      const b = build();
      wheel(b, -96, -48, 48, { spokes: 10 });
      wheel(b, 100, -48, 48, { spokes: 10 });
      const crank = [-6, -44];
      const seat = [-40, -132];
      const head = [70, -130];
      b.lines.push(
        poly([[-96, -48], crank, seat, [-96, -48]], { weight: 0.9 }),
        poly([crank, head, seat], { weight: 0.9 }),
        line([head, [86, -90], [100, -48]], { weight: 0.9 }),
      );
      b.lines.push(line([seat, [-46, -148]], { weight: 0.9 }));
      shape(
        b,
        [
          [-72, -150],
          [-24, -154],
          [-20, -146],
          [-66, -142],
        ],
        { tone: 0.62, weight: 0.8, smooth: true },
      );
      b.lines.push(line([head, [64, -156], [80, -162], [96, -158]], { weight: 0.9 }));
      b.lines.push(
        { pts: oval(crank[0], crank[1], 10, 10), weight: 0.7 },
        segment([-6, -44], [10, -24], { weight: 0.9 }),
        segment([2, -22], [20, -22], { weight: 1.2 }),
      );
      return b;
    },
  },
  scooter: {
    label: "Scooter",
    main: "Body",
    parts: { wheels: "Wheels" },
    words: "vespa moped italy",
    zone: "floor",
    build() {
      const b = build();
      wheel(b, -110, -28, 28);
      wheel(b, 118, -28, 28);
      shape(
        b,
        [
          [-170, -60],
          [-160, -120],
          [-110, -146],
          [-40, -146],
          [-30, -120],
          [-40, -70],
          [-130, -50],
        ],
        { tone: 0.3, weight: 1, smooth: true },
      );
      shape(
        b,
        [
          [-150, -150],
          [-60, -156],
          [-56, -144],
          [-140, -138],
        ],
        { tone: 0.62, weight: 0.85, smooth: true },
      );
      shape(
        b,
        [
          [-40, -70],
          [70, -70],
          [74, -54],
          [-40, -54],
        ],
        { tone: 0.2, weight: 0.85 },
      );
      shape(
        b,
        [
          [60, -64],
          [70, -170],
          [96, -176],
          [112, -110],
          [104, -60],
        ],
        { tone: 0.3, weight: 1, smooth: true },
      );
      b.lines.push(
        line(
          [
            [80, -172],
            [84, -196],
            [70, -206],
            [110, -210],
            [120, -204],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push({ pts: oval(108, -170, 9, 11), weight: 0.75 });
      b.lines.push(
        line(
          [
            [104, -60],
            [118, -28],
          ],
          { weight: 0.9 },
        ),
      );
      return b;
    },
  },
  skateboard: {
    label: "Skateboard",
    main: "Board",
    parts: { wheels: "Wheels" },
    words: "skate board deck",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-130, -40],
          [-110, -30],
          [110, -30],
          [130, -40],
          [126, -26],
          [104, -18],
          [-104, -18],
          [-126, -26],
        ],
        { tone: 0.42, weight: 1, smooth: true },
      );
      for (const x of [-80, 80]) {
        b.lines.push(
          poly(
            [
              [x - 12, -18],
              [x + 12, -18],
              [x + 6, -10],
              [x - 6, -10],
            ],
            { closed: true, weight: 0.7 },
          ),
        );
        wheel(b, x - 10, -10, 10, { hub: 0.2, tone: 0.3 });
        wheel(b, x + 12, -10, 10, { hub: 0.2, tone: 0.3 });
      }
      return b;
    },
  },
  tractor: {
    label: "Tractor",
    words: "farm field plough",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-60, -120],
          [150, -120],
          [176, -100],
          [180, -40],
          [-60, -40],
        ],
        { tone: 0.32, weight: 1.05 },
      );
      shape(
        b,
        [
          [-110, -120],
          [-100, -280],
          [20, -280],
          [30, -120],
        ],
        { tone: 0, weight: 1 },
      );
      shape(
        b,
        [
          [-90, -260],
          [6, -260],
          [12, -150],
          [-86, -150],
        ],
        { tone: 0.46, weight: 0.8, knock: false },
      );
      shape(
        b,
        [
          [-118, -280],
          [32, -280],
          [36, -296],
          [-122, -296],
        ],
        { tone: 0.5, weight: 0.85 },
      );
      b.lines.push(
        poly(
          [
            [110, -120],
            [110, -210],
            [122, -210],
            [122, -120],
          ],
          { closed: true, weight: 0.85 },
        ),
      );
      b.lines.push(
        line(
          [
            [118, -214],
            [126, -238],
            [116, -262],
            [130, -290],
          ],
          { weight: 0.45 },
        ),
      );
      for (let x = 50; x < 170; x += 14) b.lines.push(segment([x, -112], [x, -50], { weight: 0.4 }));
      for (const [x, r] of [
        [-60, 78],
        [140, 42],
      ]) {
        occlude(b, ovalRing(x, -r, r, r));
        b.lines.push({ pts: oval(x, -r, r, r, { start: -1.2 }), weight: 1.1 });
        b.washes.push({ rings: [ovalRing(x, -r, r, r)], tone: 0.62 }, { rings: [ovalRing(x, -r, r * 0.5, r * 0.5)], tone: 0.25 });
        b.lines.push({ pts: oval(x, -r, r * 0.5, r * 0.5), weight: 0.75 });
        b.knock.push(ovalRing(x, -r, r + 1, r + 1));
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          b.lines.push(segment([x + Math.cos(a) * r * 0.86, -r + Math.sin(a) * r * 0.86], [x + Math.cos(a) * r, -r + Math.sin(a) * r], { weight: 0.5 }));
        }
      }
      return b;
    },
  },
  train: {
    label: "Steam train",
    main: "Engine",
    parts: { wheels: "Wheels" },
    words: "locomotive railway engine choo",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-60, -230],
          [220, -230],
          [234, -200],
          [234, -100],
          [220, -80],
          [-60, -80],
        ],
        { tone: 0.6, weight: 1.05, smooth: true },
      );
      for (const x of [20, 100, 180]) b.lines.push(segment([x, -228], [x, -82], { weight: 0.5, color: "chalk" }));
      shape(
        b,
        [
          [-230, -80],
          [-230, -320],
          [-40, -320],
          [-40, -80],
        ],
        { tone: 0.42, weight: 1.05 },
      );
      shape(
        b,
        [
          [-250, -320],
          [-20, -320],
          [-14, -340],
          [-256, -340],
        ],
        { tone: 0.66, weight: 0.9 },
      );
      shape(
        b,
        [
          [-196, -300],
          [-80, -300],
          [-80, -210],
          [-196, -210],
        ],
        { tone: 0.04, weight: 0.8, knock: false },
      );
      shape(
        b,
        [
          [160, -230],
          [150, -310],
          [196, -310],
          [190, -230],
        ],
        { tone: 0.66, weight: 1 },
      );
      shape(
        b,
        [
          [140, -310],
          [206, -310],
          [210, -326],
          [136, -326],
        ],
        { tone: 0.7, weight: 0.85 },
      );
      for (const [x, y, r] of [
        [180, -370, 26],
        [220, -420, 34],
        [280, -446, 40],
      ]) {
        const ring = ovalRing(x, y, r * 1.2, r);
        b.lines.push({ pts: oval(x, y, r * 1.2, r, { start: 0.4, sweep: Math.PI * 1.7 }), weight: 0.6 });
        b.washes.push({ rings: [ring], tone: 0.1 });
      }
      shape(
        b,
        [
          [234, -80],
          [234, -140],
          [254, -140],
          [290, -20],
          [234, -20],
        ],
        { tone: 0.3, weight: 0.9 },
      );
      shape(
        b,
        [
          [-240, -80],
          [250, -80],
          [250, -60],
          [-240, -60],
        ],
        { tone: 0.7, weight: 0.85 },
      );
      for (const x of [-180, -90]) wheel(b, x, -48, 46, { spokes: 6 });
      for (const x of [40, 140]) wheel(b, x, -48, 46, { spokes: 6 });
      b.lines.push(segment([-180, -48], [140, -48], { weight: 1.2 }));
      b.lines.push(segment([-300, 0], [320, 0], { weight: 0.9 }));
      for (let x = -290; x < 320; x += 30) b.lines.push(segment([x, 2], [x + 14, 10], { weight: 0.5 }));
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
  sailboat: {
    label: "Sailboat",
    words: "yacht sail boat sea regatta",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-200, -90],
          [210, -90],
          [160, -20],
          [-150, -20],
        ],
        { tone: 0.32, weight: 1.05 },
      );
      b.lines.push(segment([-180, -70], [200, -70], { weight: 0.5 }));
      b.lines.push(
        poly(
          [
            [0, -90],
            [-4, -470],
            [4, -470],
            [8, -90],
          ],
          { closed: true, weight: 0.9 },
        ),
      );
      shape(
        b,
        [
          [-6, -460],
          [-6, -110],
          [-170, -110],
        ],
        { tone: 0.04, weight: 0.95, smooth: false },
      );
      shape(
        b,
        [
          [12, -430],
          [12, -110],
          [170, -110],
          [120, -260],
        ],
        { tone: 0.08, weight: 0.95, smooth: true },
      );
      shape(
        b,
        [
          [-2, -470],
          [40, -458],
          [-2, -446],
        ],
        { tone: 0.5, weight: 0.7 },
      );
      b.lines.push(
        line(
          [
            [-260, -4],
            [-180, -12],
            [-80, -2],
            [40, -10],
            [140, 0],
            [260, -8],
          ],
          { weight: 0.6 },
        ),
      );
      return b;
    },
  },
  submarine: {
    label: "Submarine",
    words: "sub underwater navy periscope yellow",
    build() {
      const b = build();
      shape(
        b,
        [
          [-240, -60],
          [-200, -110],
          [180, -110],
          [250, -70],
          [240, -30],
          [180, -10],
          [-200, -10],
          [-250, -40],
        ],
        { tone: 0.32, weight: 1.05, smooth: true },
      );
      shape(
        b,
        [
          [-60, -110],
          [-50, -180],
          [60, -180],
          [80, -110],
        ],
        { tone: 0.32, weight: 1 },
      );
      b.lines.push(
        poly(
          [
            [20, -180],
            [20, -250],
            [70, -250],
            [70, -238],
            [32, -238],
            [32, -180],
          ],
          { closed: true, weight: 0.85 },
        ),
      );
      for (const x of [-140, -60, 20, 100]) {
        b.lines.push({ pts: oval(x, -60, 16, 16), weight: 0.8 });
        b.washes.push({ rings: [ovalRing(x, -60, 12, 12)], tone: 0.08 }, { rings: [ovalRing(x, -60, 16, 16)], tone: 0.1 });
      }
      b.lines.push(
        poly(
          [
            [-250, -40],
            [-290, -90],
            [-276, -40],
            [-290, 6],
          ],
          { closed: true, weight: 0.85 },
        ),
      );
      for (const [x, y, r] of [
        [120, -150, 7],
        [150, -176, 5],
        [170, -200, 4],
      ])
        b.lines.push({ pts: oval(x, y, r, r), weight: 0.5 });
      return b;
    },
  },
  plane: {
    label: "Aeroplane",
    words: "airplane jet flight travel airline",
    zone: "sky",
    build() {
      const b = build();
      shape(
        b,
        [
          [-50, -20],
          [-10, -20],
          [70, -120],
          [110, -120],
          [60, -20],
        ],
        { tone: 0.3, weight: 0.95 },
      );
      const body = [
        [-300, -10],
        [-280, -40],
        [-240, -50],
        [230, -50],
        [290, -36],
        [310, -14],
        [290, 4],
        [230, 10],
        [-240, 10],
        [-290, 4],
      ];
      shape(b, body, { tone: 0.08, weight: 1.05, smooth: true });
      shape(
        b,
        [
          [-260, -48],
          [-300, -150],
          [-270, -150],
          [-200, -48],
        ],
        { tone: 0.3, weight: 0.95 },
      );
      shape(
        b,
        [
          [-60, 2],
          [-20, 2],
          [80, 110],
          [40, 110],
        ],
        { tone: 0.3, weight: 0.95 },
      );
      for (let x = -200; x < 220; x += 26) b.lines.push({ pts: oval(x, -26, 5, 7), weight: 0.55 });
      shape(
        b,
        [
          [256, -40],
          [290, -34],
          [296, -20],
          [262, -24],
        ],
        { tone: 0.5, weight: 0.75, knock: false },
      );
      b.lines.push(segment([-240, -6], [230, -6], { weight: 0.45 }));
      return b;
    },
  },
  helicopter: {
    label: "Helicopter",
    words: "chopper rotor heli",
    zone: "sky",
    build() {
      const b = build();
      shape(
        b,
        [
          [-60, -40],
          [-50, -120],
          [20, -140],
          [90, -120],
          [120, -70],
          [100, -30],
          [-40, -20],
        ],
        { tone: 0.28, weight: 1.05, smooth: true },
      );
      shape(
        b,
        [
          [40, -122],
          [86, -112],
          [112, -72],
          [60, -66],
        ],
        { tone: 0.55, weight: 0.8, smooth: true, knock: false },
      );
      shape(
        b,
        [
          [-56, -90],
          [-250, -90],
          [-260, -76],
          [-56, -60],
        ],
        { tone: 0.28, weight: 0.95 },
      );
      shape(
        b,
        [
          [-250, -90],
          [-270, -140],
          [-250, -140],
          [-232, -90],
        ],
        { tone: 0.28, weight: 0.9 },
      );
      b.lines.push({ pts: oval(-256, -84, 22, 22), weight: 0.5 });
      b.lines.push(
        segment([10, -140], [10, -160], { weight: 1.1 }),
        line(
          [
            [-200, -164],
            [10, -160],
            [220, -164],
          ],
          { weight: 1.3 },
        ),
      );
      b.lines.push(
        line(
          [
            [-40, 0],
            [100, 0],
            [120, -10],
          ],
          { weight: 1.1 },
        ),
        segment([-10, -24], [-14, 0], { weight: 0.9 }),
        segment([70, -28], [74, 0], { weight: 0.9 }),
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
  ufo: {
    label: "Flying saucer",
    words: "ufo alien spaceship saucer martian abduction",
    zone: "sky",
    build() {
      const b = build();
      b.washes.push({
        rings: [
          area([
            [-80, 0],
            [80, 0],
            [190, 300],
            [-190, 300],
          ]),
        ],
        tone: 0.08,
      });
      b.lines.push(
        line(
          [
            [-80, 4],
            [-190, 300],
          ],
          { weight: 0.4 },
        ),
        line(
          [
            [80, 4],
            [190, 300],
          ],
          { weight: 0.4 },
        ),
      );
      shape(
        b,
        [
          [-60, -50],
          [-50, -96],
          [0, -120],
          [50, -96],
          [60, -50],
        ],
        { tone: 0.04, weight: 1, smooth: true },
      );
      b.lines.push(
        line(
          [
            [-30, -96],
            [-20, -108],
            [-4, -112],
          ],
          { weight: 0.45 },
        ),
      );
      shape(
        b,
        [
          [-200, -24],
          [-150, -56],
          [-60, -66],
          [60, -66],
          [150, -56],
          [200, -24],
          [150, 2],
          [0, 10],
          [-150, 2],
        ],
        { tone: 0.36, weight: 1.05, smooth: true },
      );
      b.lines.push(
        line(
          [
            [-196, -26],
            [-100, -18],
            [0, -16],
            [100, -18],
            [196, -26],
          ],
          { weight: 0.55 },
        ),
      );
      for (const x of [-140, -80, -20, 40, 100, 150]) b.lines.push({ pts: oval(x, -36, 7, 5), weight: 0.6, color: "chalk" });
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
      plainWheel(b, -82, -6, 18);
      plainWheel(b, 73, -6, 18);
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
      plainWheel(b, -85, -6, 21);
      plainWheel(b, 77, -6, 21);
      jet(b, -30, -2, 40);
      jet(b, 22, -2, 40);
      speed(b, -150, [-58, -40, -22], 46);
      b.knock.push(flat(body));
      return b;
    },
  },
};
