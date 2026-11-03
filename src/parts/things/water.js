import { rng } from "../../core/random.js";
import { area, build, flat, line } from "../kit.js";
import { box, shape, waterline } from "./draw.js";

export const WATER = {
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
};
