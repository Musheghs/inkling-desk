import { rng } from "../../core/random.js";
import { area, build, flat, line, poly, segment } from "../kit.js";
import { box, shape } from "./draw.js";

export const BACKDROPS = {
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
  wallpaper: {
    label: "Wallpaper",
    zone: "back",
    build() {
      const b = build();
      const r = rng(2);
      const inRound = (x, y) => {
        const r0 = 90;
        const cx = Math.max(-440 + r0, Math.min(440 - r0, x));
        const cy = Math.max(-560 + r0, y);
        return Math.abs(x) <= 440 && y >= -560 && Math.hypot(x - cx, y - cy) <= r0;
      };
      for (let y = -545; y < -10; y += 40) {
        const shift = (Math.round(y / 40) % 2) * 22;
        for (let x = -430 + shift; x < 430; x += 44) {
          if (!inRound(x, y)) continue;
          const jx = x + (r() - 0.5) * 3;
          const jy = y + (r() - 0.5) * 3;
          b.lines.push(
            line(
              [
                [jx, jy + 8],
                [jx - 5, jy],
                [jx, jy - 7],
                [jx + 5, jy],
                [jx, jy + 8],
              ],
              { weight: 0.42 },
            ),
          );
        }
      }
      return b;
    },
  },
  wainscot: {
    label: "Wainscoting",
    zone: "back",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-462, -150],
            [-200, -151],
            [200, -149],
            [462, -150],
          ],
          { weight: 0.9 },
        ),
        line(
          [
            [-462, -140],
            [462, -140],
          ],
          { weight: 0.5 },
        ),
      );
      for (let x = -440; x < 420; x += 80) b.lines.push(poly(box(x + 8, -126, 62, 110), { closed: true, weight: 0.5 }));
      b.washes.push({
        rings: [
          flat(
            [
              [-462, -150],
              [462, -150],
              [462, 0],
              [-462, 0],
            ],
            10,
          ),
        ],
        tone: 0.14,
      });
      return b;
    },
  },
  floorboards: {
    label: "Floorboards",
    zone: "back",
    build() {
      const b = build();
      const r = rng(6);
      let y = 0;
      let gap = 10;
      while (y < 190) {
        b.lines.push(
          line(
            [
              [-465, y],
              [0, y + (r() - 0.5) * 2],
              [465, y],
            ],
            { weight: 0.5 },
          ),
        );
        for (let x = -440 + r() * 120; x < 440; x += 160 + r() * 120) b.lines.push(segment([x, y], [x, y + gap], { weight: 0.4 }));
        y += gap;
        gap *= 1.22;
      }
      b.washes.push({
        rings: [
          area([
            [-465, 0],
            [465, 0],
            [462, 120],
            [420, 160],
            [0, 166],
            [-420, 160],
            [-462, 120],
          ]),
        ],
        tone: 0.18,
      });
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
