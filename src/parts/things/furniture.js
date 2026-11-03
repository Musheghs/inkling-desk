import { rng } from "../../core/random.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, poly, scallop, segment, spline } from "../kit.js";
import { box, boxLine, disc, rounded, shape } from "./draw.js";

function bricks(b, x0, y0, w, h, row = 18, len = 42) {
  for (let y = y0 + row, k = 0; y < y0 + h; y += row, k++) {
    b.lines.push(segment([x0, y], [x0 + w, y], { weight: 0.42 }));
  }
  for (let y = y0, k = 0; y < y0 + h - 2; y += row, k++) {
    for (let x = x0 + (k % 2 ? len / 2 : len); x < x0 + w - 4; x += len) b.lines.push(segment([x, y], [x, Math.min(y0 + h, y + row)], { weight: 0.38 }));
  }
}

export const FURNITURE = {
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
  clubchair: {
    label: "Club chair",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(4);
      const outer = [
        [-104, -10],
        [-110, -100],
        [-96, -118],
        [-74, -116],
        [-70, -190],
        [-40, -214],
        [0, -218],
        [40, -214],
        [70, -190],
        [74, -116],
        [96, -118],
        [110, -100],
        [104, -10],
      ];
      b.lines.push(line(outer, { weight: 1.05 }));
      b.lines.push(
        line([
          [-74, -116],
          [-70, -70],
          [-68, -40],
        ]),
        line([
          [74, -116],
          [70, -70],
          [68, -40],
        ]),
      );
      b.lines.push(
        loop(
          [
            [-70, -46],
            [0, -50],
            [70, -46],
            [72, -24],
            [0, -20],
            [-72, -24],
          ],
          { overlap: 0.03, weight: 0.9 },
        ),
      );
      b.lines.push(
        line([
          [-104, -10],
          [0, -6],
          [104, -10],
        ]),
      );
      for (let i = 0; i < 10; i++) b.solids.push(dot(-46 + (i % 5) * 23 + r() * 3, -186 + Math.floor(i / 5) * 40, 1.8));
      b.washes.push({ rings: [area(outer.concat([[0, -6]]))], tone: 0.62 });
      b.knock.push(
        area(
          outer.concat([
            [80, 4],
            [-80, 4],
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
  schoolchair: {
    label: "Classroom chair",
    zone: "floor",
    build() {
      const b = build();
      for (const [x0, x1] of [
        [-44, -40],
        [44, 40],
      ])
        b.lines.push(segment([x0, -50], [x1, -6], { weight: 0.8 }));
      const seat = [
        [-70, -64],
        [70, -64],
        [62, -48],
        [-62, -48],
      ];
      b.lines.push(poly(seat, { closed: true, weight: 0.95 }));
      b.washes.push({ rings: [flat(seat, 4)], tone: 0.3 });
      for (const [x0, x1] of [
        [-64, -70],
        [64, 70],
      ])
        b.lines.push(segment([x0, -48], [x1, 0], { weight: 1 }));
      for (const x of [-34, 34]) b.lines.push(segment([x, -128], [x * 1.06, -62], { weight: 1 }));
      const back = [
        [-56, -198],
        [56, -198],
        [64, -188],
        [60, -134],
        [52, -126],
        [-52, -126],
        [-60, -134],
        [-64, -188],
      ];
      b.lines.push(loop(back, { weight: 1.05, overlap: 0.03 }));
      b.washes.push({ rings: [area(back)], tone: 0.36 });
      const grip = [
        [-24, -178],
        [24, -178],
        [27, -171],
        [24, -164],
        [-24, -164],
        [-27, -171],
      ];
      b.lines.push(loop(grip, { weight: 0.7, overlap: 0.04 }));
      b.washes.push({ rings: [area(grip)], tone: 0.62 });
      b.knock.push(
        area([
          [-64, -200],
          [64, -200],
          [60, -126],
          [36, -126],
          [36, -64],
          [70, -64],
          [70, 0],
          [-70, 0],
          [-70, -64],
          [-36, -64],
          [-36, -126],
          [-60, -126],
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
  sidetable: {
    label: "Side table & decanter",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, -96, 48, 10, { start: 2.6 }), weight: 1 });
      b.lines.push(
        line(
          [
            [-48, -96],
            [-46, -86],
            [0, -80],
            [46, -86],
            [48, -96],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(segment([-30, -84], [-36, 0], { weight: 0.9 }), segment([30, -84], [36, 0], { weight: 0.9 }), segment([0, -80], [0, -4], { weight: 0.7 }));
      const dec = [
        [-10, -150],
        [-6, -170],
        [-10, -176],
        [10, -176],
        [6, -170],
        [10, -150],
        [22, -130],
        [20, -104],
        [-20, -104],
        [-22, -130],
      ];
      b.lines.push(loop(dec, { weight: 0.85, overlap: 0.04 }));
      b.washes.push({
        rings: [
          area([
            [-20, -132],
            [20, -132],
            [18, -106],
            [-18, -106],
          ]),
        ],
        tone: 0.5,
      });
      b.lines.push(
        poly(
          [
            [24, -124],
            [40, -124],
            [38, -102],
            [26, -102],
          ],
          { closed: true, weight: 0.7 },
        ),
      );
      b.knock.push(
        area(dec),
        ovalRing(0, -92, 50, 14),
        flat([
          [-36, -86],
          [36, -86],
          [36, 0],
          [-36, 0],
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
  bookshelf: {
    label: "Bookshelf",
    zone: "floor",
    build() {
      const b = build();
      boxLine(b, -100, -380, 200, 380, { weight: 1.05 });
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
  barcart: {
    label: "Bar cart",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(19);
      b.lines.push(
        poly(
          [
            [-90, -140],
            [90, -140],
            [90, -130],
            [-90, -130],
          ],
          { closed: true },
        ),
        poly(
          [
            [-90, -60],
            [90, -60],
            [90, -50],
            [-90, -50],
          ],
          { closed: true },
        ),
      );
      b.lines.push(segment([-84, -130], [-84, -20], { weight: 0.9 }), segment([84, -130], [84, -20], { weight: 0.9 }));
      for (const x of [-80, 80]) b.lines.push({ pts: oval(x, -12, 12, 12), weight: 0.85 });
      let x = -78;
      while (x < 70) {
        const h = 40 + r() * 40;
        const w = 9 + r() * 7;
        const pts = [
          [x - w, -140],
          [x - w, -140 - h * 0.6],
          [x - 3, -140 - h * 0.8],
          [x - 3, -140 - h],
          [x + 3, -140 - h],
          [x + 3, -140 - h * 0.8],
          [x + w, -140 - h * 0.6],
          [x + w, -140],
        ];
        b.lines.push(poly(pts, { weight: 0.75 }));
        b.washes.push({ rings: [flat(pts, 3)], tone: 0.2 + r() * 0.4 });
        x += w * 2 + 6;
      }
      for (let gx = -70; gx < 70; gx += 34)
        b.lines.push(
          poly(
            [
              [gx - 8, -88],
              [gx + 8, -88],
              [gx + 6, -60],
              [gx - 6, -60],
            ],
            { closed: true, weight: 0.6 },
          ),
        );
      b.knock.push(
        flat([
          [-92, -142],
          [92, -142],
          [92, -48],
          [-92, -48],
        ]),
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
  fireplace: {
    label: "Fireplace",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-170, -262],
            [170, -262],
            [176, -246],
            [-176, -246],
          ],
          { closed: true, weight: 1.05 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-150, -246],
            [-150, 0],
            [150, 0],
            [150, -246],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-90, 0],
            [-90, -150],
            [90, -150],
            [90, 0],
          ],
          { weight: 1 },
        ),
      );
      bricks(b, -150, -246, 60, 246, 18, 30);
      bricks(b, 90, -246, 60, 246, 18, 30);
      bricks(b, -90, -246, 180, 96, 18, 36);
      b.washes.push({
        rings: [
          flat(
            [
              [-88, -148],
              [88, -148],
              [88, 0],
              [-88, 0],
            ],
            5,
          ),
        ],
        tone: 0.7,
      });
      b.washes.push({
        rings: [
          flat(
            [
              [-150, -246],
              [150, -246],
              [150, 0],
              [-150, 0],
            ],
            8,
          ),
        ],
        tone: 0.14,
      });
      const flame = [
        [-40, -14],
        [-46, -50],
        [-30, -84],
        [-24, -60],
        [-6, -104],
        [8, -66],
        [24, -92],
        [30, -56],
        [46, -46],
        [40, -14],
      ];
      b.lines.push({ pts: spline(flame, { closed: true, overlap: 0.04 }), weight: 0.85, color: "chalk" });
      b.lines.push(
        line(
          [
            [-60, -10],
            [60, -18],
          ],
          { weight: 1.6 },
        ),
        line(
          [
            [-56, -20],
            [52, -6],
          ],
          { weight: 1.4 },
        ),
      );
      b.knock.push(
        flat([
          [-176, -262],
          [176, -262],
          [176, -246],
          [150, -246],
          [150, 0],
          [-150, 0],
          [-150, -246],
          [-176, -246],
        ]),
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
  wastebasket: {
    label: "Wastebasket",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(9);
      b.lines.push(
        poly(
          [
            [-34, -78],
            [34, -78],
            [26, 0],
            [-26, 0],
          ],
          { closed: true, weight: 0.95 },
        ),
      );
      for (let x = -28; x <= 28; x += 8) b.lines.push(segment([x, -76], [x * 0.78, -2], { weight: 0.4 }));
      for (let y = -60; y < 0; y += 14) b.lines.push(segment([-32 + (y + 78) * 0.1, y], [32 - (y + 78) * 0.1, y], { weight: 0.35 }));
      for (let i = 0; i < 4; i++) {
        const cx = -18 + i * 12 + r() * 4;
        const cy = -84 - r() * 10;
        b.lines.push({ pts: scallop(oval(cx, cy, 10, 9, { overlap: 0.1 }), 1.6, 6, i), weight: 0.6 });
        b.knock.push(ovalRing(cx, cy, 10, 9));
      }
      b.knock.push(
        flat([
          [-34, -78],
          [34, -78],
          [26, 0],
          [-26, 0],
        ]),
      );
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
      boxLine(b, -84, -392, 168, 392);
      boxLine(b, -66, -370, 132, 150, { weight: 0.7 });
      boxLine(b, -66, -196, 132, 170, { weight: 0.7 });
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
};
