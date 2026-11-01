const PARTS = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

export function splitColour(colour) {
  const m = PARTS.exec(colour || "");
  if (!m) return { hex: colour, alpha: 1 };
  return { hex: `#${m[1]}`, alpha: m[2] ? parseInt(m[2], 16) / 255 : 1 };
}

export function withAlpha(colour, alpha) {
  const { hex } = splitColour(colour);
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  return a >= 255 ? hex : `${hex}${a.toString(16).padStart(2, "0")}`;
}

export const alphaOf = (colour) => splitColour(colour).alpha;

export const sameColour = (a, b) => (a || "").toLowerCase() === (b || "").toLowerCase();
