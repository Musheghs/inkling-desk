import { bounds, pointInRing } from "../../core/geometry.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, scallop, segment, spline } from "../kit.js";
import { box, disc, shape, waterline } from "./draw.js";

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
};
