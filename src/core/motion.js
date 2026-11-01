const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

const linearEasing = typeof CSS !== "undefined" && CSS.supports?.("transition-timing-function", "linear(0, 1)");

export function spring({ stiffness = 260, damping = 24, mass = 1 } = {}) {
  const dt = 1 / 1000;
  let x = 0;
  let v = 0;
  let settled = 0;
  const samples = [];
  while (samples.length < 2000) {
    v += ((-stiffness * (x - 1) - damping * v) / mass) * dt;
    x += v * dt;
    samples.push(x);
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) {
      if (++settled > 30) break;
    } else settled = 0;
  }
  const n = Math.min(48, Math.max(16, Math.round(samples.length / 16)));
  const pts = [0];
  for (let i = 1; i < n; i++) pts.push(+samples[Math.round((i / n) * (samples.length - 1))].toFixed(4));
  pts.push(1);
  return { easing: linearEasing ? `linear(${pts.join(", ")})` : EASE_OUT, duration: samples.length };
}

export const SPRING = spring({ stiffness: 340, damping: 37 });
export const LIFT = spring({ stiffness: 460, damping: 34 });
