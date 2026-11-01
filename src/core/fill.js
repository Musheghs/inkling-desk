import { relax, resample, simplify } from "./geometry.js";

function dilate(src, w, h, radius) {
  if (radius <= 0) return src;
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let run = -Infinity;
    for (let x = 0; x < w; x++) {
      if (src[row + x]) run = x;
      if (x - run <= radius) tmp[row + x] = 1;
    }
    run = Infinity;
    for (let x = w - 1; x >= 0; x--) {
      if (src[row + x]) run = x;
      if (run - x <= radius) tmp[row + x] = 1;
    }
  }
  for (let x = 0; x < w; x++) {
    let run = -Infinity;
    for (let y = 0; y < h; y++) {
      if (tmp[y * w + x]) run = y;
      if (y - run <= radius) out[y * w + x] = 1;
    }
    run = Infinity;
    for (let y = h - 1; y >= 0; y--) {
      if (tmp[y * w + x]) run = y;
      if (run - y <= radius) out[y * w + x] = 1;
    }
  }
  return out;
}

function flood(blocked, w, h, sx, sy) {
  const region = new Uint8Array(w * h);
  if (sx < 0 || sy < 0 || sx >= w || sy >= h || blocked[sy * w + sx]) return { region, count: 0 };
  const stack = [sx, sy];
  let count = 0;
  while (stack.length) {
    const y = stack.pop();
    let x = stack.pop();
    let i = y * w + x;
    while (x > 0 && !blocked[i - 1] && !region[i - 1]) {
      x--;
      i--;
    }
    let up = false;
    let down = false;
    while (x < w && !blocked[i] && !region[i]) {
      region[i] = 1;
      count++;
      if (y > 0) {
        const a = i - w;
        const open = !blocked[a] && !region[a];
        if (open && !up) stack.push(x, y - 1);
        up = open;
      }
      if (y < h - 1) {
        const b = i + w;
        const open = !blocked[b] && !region[b];
        if (open && !down) stack.push(x, y + 1);
        down = open;
      }
      x++;
      i++;
    }
  }
  return { region, count };
}

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

function trace(mask, w, h) {
  const W = w + 1;
  const out = new Uint8Array(W * (h + 1));
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      if (!at(x, y - 1)) out[y * W + x] |= 1;
      if (!at(x + 1, y)) out[y * W + x + 1] |= 2;
      if (!at(x, y + 1)) out[(y + 1) * W + x + 1] |= 4;
      if (!at(x - 1, y)) out[(y + 1) * W + x] |= 8;
    }
  }
  const rings = [];
  for (let v = 0; v < out.length; v++) {
    while (out[v]) {
      let d = 0;
      while (!(out[v] & (1 << d))) d++;
      const ring = [];
      let cur = v;
      let dir = d;
      let guard = 0;
      do {
        out[cur] &= ~(1 << dir);
        const x = cur % W;
        const y = (cur - x) / W;
        const nx = x + DX[dir];
        const ny = y + DY[dir];
        const next = ny * W + nx;
        const options = [(dir + 1) & 3, dir, (dir + 3) & 3];
        let chosen = -1;
        for (const o of options) {
          if (out[next] & (1 << o)) {
            chosen = o;
            break;
          }
        }
        if (chosen !== dir) ring.push({ x: nx, y: ny });
        cur = next;
        dir = chosen;
        if (++guard > 4 * W * (h + 1)) break;
      } while (dir >= 0 && cur !== v);
      if (ring.length > 2) rings.push(ring);
    }
  }
  return rings;
}

export function regionAt(alpha, w, h, point, { gap = 3, grow = 2, threshold = 70 } = {}) {
  const blocked = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) blocked[i] = alpha[i * 4 + 3] > threshold ? 1 : 0;
  const closed = dilate(blocked, w, h, gap);
  const { region, count } = flood(closed, w, h, Math.round(point.x), Math.round(point.y));
  if (!count) return null;
  const grown = dilate(region, w, h, gap + grow);
  return { mask: grown, count, share: count / (w * h) };
}

export function maskRings(mask, w, h, scale = 1) {
  return trace(mask, w, h)
    .map((ring) =>
      simplify(
        ring.map((p) => ({ x: p.x / scale, y: p.y / scale })),
        0.7 / scale + 0.25,
      ),
    )
    .filter((ring) => ring.length > 2)
    .map((ring) => {
      const dense = resample(ring.concat([ring[0]]), 3);
      dense.pop();
      return relax(dense, 1, true);
    });
}
