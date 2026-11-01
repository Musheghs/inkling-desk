export function rng(seed) {
  let a = seed >>> 0 || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function noise(seed) {
  const r = rng(seed);
  const table = Float32Array.from({ length: 256 }, () => r() * 2 - 1);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const t = f * f * (3 - 2 * f);
    const a = table[i & 255];
    return a + (table[(i + 1) & 255] - a) * t;
  };
}

export const newSeed = () => (Math.random() * 2147483647) | 0;

export const pick = (r, list) => list[Math.floor(r() * list.length) % list.length];
