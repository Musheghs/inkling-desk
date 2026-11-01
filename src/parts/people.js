import { rng } from "../core/random.js";
import { bounds, resample, union } from "../core/geometry.js";
import { addHat, ALIENS, ANIMALS, BROWS, CHASSIS, HATS, headTop, MOUTHS, ROBOT_HEADS, ROBOT_LEGS, shutEye } from "./cast.js";
import { area, build, bump, dot, flat, hideUnder, layer, line, loop, oval, ovalRing, paint, polar, poly, scallop, segment, spline, sweep } from "./kit.js";

export { HATS };

export const HEADS = {
  oval: {
    pts: [
      [2, -58],
      [28, -50],
      [41, -26],
      [43, 2],
      [37, 28],
      [20, 50],
      [-4, 56],
      [-28, 44],
      [-43, 16],
      [-45, -16],
      [-34, -44],
      [-16, -56],
    ],
    eye: -6,
    mouth: 27,
    face: 0,
  },
  egg: {
    pts: [
      [0, -62],
      [30, -54],
      [46, -30],
      [45, 0],
      [36, 28],
      [18, 50],
      [-4, 54],
      [-28, 42],
      [-44, 14],
      [-48, -20],
      [-36, -48],
      [-18, -60],
    ],
    eye: -6,
    mouth: 26,
    face: 2,
  },
  round: {
    pts: [
      [0, -52],
      [30, -46],
      [47, -22],
      [48, 6],
      [38, 32],
      [16, 50],
      [-10, 52],
      [-34, 40],
      [-48, 14],
      [-50, -14],
      [-38, -40],
      [-20, -51],
    ],
    eye: -4,
    mouth: 24,
    face: 2,
  },
  long: {
    pts: [
      [0, -64],
      [24, -58],
      [35, -34],
      [36, 0],
      [33, 30],
      [22, 56],
      [2, 64],
      [-20, 54],
      [-34, 26],
      [-37, -10],
      [-32, -44],
      [-16, -61],
    ],
    eye: -10,
    mouth: 32,
    face: -2,
  },
  jowly: {
    pts: [
      [0, -56],
      [24, -50],
      [36, -28],
      [40, 2],
      [46, 26],
      [34, 48],
      [8, 58],
      [-20, 56],
      [-42, 40],
      [-46, 8],
      [-40, -26],
      [-22, -50],
    ],
    eye: -10,
    mouth: 26,
    face: 0,
  },
  square: {
    pts: [
      [0, -58],
      [27, -54],
      [40, -32],
      [42, 2],
      [42, 30],
      [30, 50],
      [8, 56],
      [-18, 55],
      [-38, 42],
      [-45, 10],
      [-42, -26],
      [-24, -52],
    ],
    eye: -6,
    mouth: 28,
    face: 0,
  },
  robot: {
    pts: [
      [0, -47],
      [32, -47],
      [45, -42],
      [47, -12],
      [47, 22],
      [43, 44],
      [16, 49],
      [-16, 49],
      [-43, 44],
      [-47, 22],
      [-47, -12],
      [-45, -42],
      [-32, -47],
    ],
    eye: -8,
    mouth: 18,
    face: 0,
    robot: true,
  },
};

export const NOSES = {
  button: [
    [0, 6],
    [5, 12],
    [9, 16],
    [6, 20],
    [0, 19],
  ],
  long: [
    [0, 0],
    [8, 12],
    [16, 23],
    [12, 28],
    [3, 26],
  ],
  hook: [
    [0, -2],
    [8, 3],
    [14, 12],
    [17, 22],
    [10, 26],
    [2, 23],
  ],
  bulb: [
    [0, 2],
    [3, 10],
    [11, 12],
    [17, 18],
    [13, 26],
    [3, 24],
  ],
  pointy: [
    [0, 2],
    [11, 13],
    [22, 21],
    [5, 22],
  ],
  snub: [
    [0, 7],
    [4, 15],
    [11, 15],
    [8, 20],
    [1, 19],
  ],
};

export const HAIRS = ["short", "part", "bald", "curly", "bun", "bob", "long", "pigtails", "crew", "none"];
export const TONES = ["dark", "gray", "light"];
export const EYES = ["dots", "ovals", "lids", "beads", "closed"];
export const GLASSES = ["none", "round", "square", "sun", "monocle", "patch"];
export const KINDS = [
  { id: "human", label: "Human" },
  { id: "alien", label: "Alien" },
  { id: "robot", label: "Robot" },
  { id: "animal", label: "Animal" },
];
export const SEXES = [
  { id: "man", label: "Man" },
  { id: "woman", label: "Woman" },
];
export const SPECIES = { alien: Object.keys(ALIENS), robot: Object.keys(ROBOT_HEADS), animal: Object.keys(ANIMALS) };
export const SPECIES_NAMES = Object.fromEntries(
  [...Object.entries(ALIENS), ...Object.entries(ROBOT_HEADS), ...Object.entries(ANIMALS)].map(([id, d]) => [id, d.label]),
);
export { CHASSIS, ROBOT_LEGS };
export const kindOf = (spec) => (spec.kind === "alien" || spec.kind === "robot" || spec.kind === "animal" ? spec.kind : "human");
export const MOODS = [
  { id: "neutral", label: "Neutral" },
  { id: "smug", label: "Smug" },
  { id: "worried", label: "Worried" },
  { id: "delighted", label: "Delighted" },
  { id: "deadpan", label: "Deadpan" },
  { id: "startled", label: "Startled" },
  { id: "sheepish", label: "Sheepish" },
  { id: "cross", label: "Cross" },
];
export const BODIES = [
  { id: "head", label: "Head" },
  { id: "bust", label: "Bust" },
  { id: "standing", label: "Standing" },
  { id: "walking", label: "Walking" },
  { id: "sitting", label: "Sitting" },
  { id: "wheelchair", label: "Wheelchair" },
  { id: "ground", label: "On the ground" },
  { id: "lying", label: "Lying down" },
];
export const OUTFITS = ["suit", "tuxedo", "vest", "sweater", "tshirt", "hoodie", "jersey", "dress", "labcoat", "overalls"];
export const COSTUMES = ["witch", "vampire", "ghost", "skeleton", "death", "pumpkin", "superhero", "pirate", "mummy", "astronaut"];
export const AGES = [
  { id: "kid", label: "Kid" },
  { id: "teen", label: "Teenager" },
  { id: "adult", label: "Adult" },
  { id: "old", label: "Old" },
];
export const ageOf = (spec) => (spec.age === "kid" || spec.age === "teen" || spec.age === "old" ? spec.age : "adult");
const HEAD_GROW = { kid: 1.24, teen: 1.16, adult: 1, old: 1 };
const CREATURE_GROW = { kid: 1.5, teen: 1.3, adult: 1, old: 1 };
export const headGrow = (spec) => {
  const own = kindOf(spec) === "alien" ? ALIENS[spec.species]?.grow : null;
  return (own || (kindOf(spec) === "alien" || kindOf(spec) === "animal" ? CREATURE_GROW : HEAD_GROW))[ageOf(spec)] ?? 1;
};

function wrinkles(b, made) {
  const eye = made.head?.eye ?? -6;
  const band = made.contour.filter((p) => Math.abs(p.y - (eye - 26)) < 8);
  if (band.length < 2) return;
  const lo = Math.min(...band.map((p) => p.x));
  const hi = Math.max(...band.map((p) => p.x));
  const cx = (lo + hi) / 2 + (hi - lo) * 0.1;
  const w = (hi - lo) * 0.16;
  for (const [dy, k] of [
    [-20, 1],
    [-27, 0.86],
    [-34, 0.7],
  ])
    b.lines.push(
      line(
        [
          [cx - w * k, eye + dy + 1.5],
          [cx, eye + dy - 1.5],
          [cx + w * k, eye + dy + 1.5],
        ],
        { weight: 0.42 },
      ),
    );
}
const HEM = { kid: [150, 122], teen: [176, 138], adult: [196, 150], old: [190, 146] };
const LEG = { kid: 150, teen: 186, adult: 210, old: 202 };
const COSTUME_HATS = { witch: "witch", pirate: "pirate", astronaut: "helmet" };
export const costumeHat = (outfit) => COSTUME_HATS[outfit] || null;
export const outfitsFor = (spec) => {
  const kind = kindOf(spec);
  if (kind === "robot") return [];
  return kind === "human" ? OUTFITS : ["bare", ...OUTFITS];
};
export const ARM_POSES = {
  down: { label: "Down" },
  pocket: { label: "In a pocket" },
  gesture: { label: "Explaining" },
  both: { label: "Casual" },
  crossed: { label: "Crossed" },
  hips: { label: "On the hips" },
  point: { label: "Pointing" },
  wave: { label: "Waving" },
  chin: { label: "Thinking" },
  shrug: { label: "Shrugging" },
  lap: { label: "In the lap" },
  knees: { label: "Round the knees" },
  chest: { label: "Folded" },
  pillow: { label: "Behind the head" },
};
const ARMS_BY_BODY = {
  head: [],
  bust: [],
  standing: ["down", "pocket", "gesture", "both", "crossed", "hips", "point", "wave", "chin", "shrug"],
  walking: ["down", "pocket", "gesture", "crossed", "point", "wave", "shrug"],
  sitting: ["lap", "crossed", "gesture", "chin", "wave", "shrug"],
  wheelchair: ["lap", "crossed", "gesture", "chin", "wave", "shrug"],
  ground: ["knees", "gesture"],
  lying: ["chest", "pillow"],
};
export const HOLDING = [
  "nothing",
  "mug",
  "glass",
  "cocktail",
  "cigar",
  "pipe",
  "phone",
  "paper",
  "newspaper",
  "book",
  "flowers",
  "gift",
  "icecream",
  "balloon",
  "sign",
  "flag",
  "magnifier",
  "megaphone",
  "fishingrod",
  "scythe",
  "briefcase",
  "umbrella",
  "cane",
  "whitecane",
  "crutch",
  "bag",
  "lantern",
];
export const AIDS = ["none", "hearing", "implant"];
const seatOf = (body) => (body === "wheelchair" ? "sitting" : body);

export const bodyOf = (spec) => (ARMS_BY_BODY[spec.body] ? spec.body : "standing");
export const armsFor = (body) => ARMS_BY_BODY[body] || [];
export const armPose = (spec) => {
  const list = armsFor(bodyOf(spec));
  return list.includes(spec.arms) ? spec.arms : list[0] || null;
};
const canHold = (spec) => armsFor(bodyOf(spec)).length > 0;

const STYLE = {
  suit: { sleeve: 0.3, trousers: 0.3 },
  tuxedo: { sleeve: 0.66, trousers: 0.6 },
  vest: { sleeve: 0, trousers: 0.42 },
  sweater: { sleeve: 0.16, trousers: 0.2 },
  tshirt: { sleeve: 0.12, trousers: 0.36, short: true },
  hoodie: { sleeve: 0.34, trousers: 0.24, ribbed: true },
  jersey: { sleeve: 0.08, trousers: 0.06, short: true, stripes: true },
  dress: { sleeve: 0.2, trousers: 0 },
  labcoat: { sleeve: 0, trousers: 0.3 },
  overalls: { sleeve: 0.08, trousers: 0.36, short: true },
  witch: { sleeve: 0.7, trousers: 0, robe: true },
  death: { sleeve: 0.86, trousers: 0, robe: true, hood: true },
  vampire: { sleeve: 0.66, trousers: 0.62, cape: 0.72 },
  ghost: { sleeve: 0.04, trousers: 0.04 },
  skeleton: { sleeve: 0.78, trousers: 0.78, bones: true },
  pumpkin: { sleeve: 0.6, trousers: 0.6 },
  superhero: { sleeve: 0.3, trousers: 0.3, cape: 0.56 },
  pirate: { sleeve: 0.04, trousers: 0.5 },
  mummy: { sleeve: 0.05, trousers: 0.05, wraps: true },
  astronaut: { sleeve: 0.08, trousers: 0.08, ribbed: true },
  bare: { sleeve: 0.22, trousers: 0.22, skin: true },
  robot: { sleeve: 0.2, trousers: 0.2, skin: true, ribs: true },
};
const styleOf = (spec) => (kindOf(spec) === "robot" ? STYLE.robot : STYLE[spec.outfit] || STYLE.suit);
const roleOf = (st) => (st.skin ? "skin" : "outfit");

const pickFrom = (r) => (list) => list[Math.floor(r() * list.length) % list.length];

export function randomPerson(seed, keep = {}) {
  const r = rng(seed);
  const pick = pickFrom(r);
  const kind = keep.kind || "human";
  const body = keep.body || "standing";
  const arms = armsFor(body);
  const age = keep.age || "adult";
  const base = {
    type: "person",
    kind,
    mood: "neutral",
    body,
    age,
    arms: arms.length ? pick(arms.concat(arms[0], arms[0])) : "down",
    holding: r() < 0.3 ? pick(["mug", "glass", "paper", "phone", "briefcase", "book"]) : "nothing",
    hat: "none",
    seed,
  };
  if (kind === "alien") {
    const outfit = pick(["bare", "bare", "bare", "astronaut", "suit", "sweater", "tshirt"]);
    return { ...base, species: pick(SPECIES.alien), outfit, eyes: "dots", ...keep };
  }
  if (kind === "robot") {
    return {
      ...base,
      species: pick(SPECIES.robot),
      chassis: pick(CHASSIS),
      legs: pick(ROBOT_LEGS),
      outfit: "robot",
      eyes: "dots",
      holding: r() < 0.25 ? pick(["mug", "briefcase", "flag", "sign"]) : "nothing",
      ...keep,
    };
  }
  if (kind === "animal") {
    const outfit = pick(["suit", "suit", "sweater", "vest", "tshirt", "hoodie", "dress", "overalls", "bare"]);
    return { ...base, species: pick(SPECIES.animal), outfit, eyes: "dots", hat: r() < 0.15 ? pick(["bowler", "cap", "tophat"]) : "none", ...keep };
  }
  const sex = keep.sex || (r() < 0.5 ? "woman" : "man");
  const young = age === "kid" || age === "teen";
  const old = age === "old";
  const woman = sex === "woman";
  const outfit = young
    ? pick(woman ? ["tshirt", "hoodie", "dress", "jersey", "sweater", "overalls"] : ["tshirt", "hoodie", "jersey", "sweater", "overalls"])
    : old
      ? pick(woman ? ["dress", "sweater", "suit", "vest"] : ["suit", "sweater", "vest", "tuxedo"])
      : pick(
          woman
            ? ["dress", "dress", "suit", "sweater", "tshirt", "labcoat", "hoodie"]
            : ["suit", "suit", "tuxedo", "vest", "sweater", "tshirt", "hoodie", "labcoat"],
        );
  const hair = woman
    ? pick(
        old
          ? ["bun", "bob", "curly", "short"]
          : young
            ? ["pigtails", "long", "pigtails", "bob", "bun", "curly"]
            : ["bob", "long", "bun", "curly", "long", "short"],
      )
    : pick(
        old
          ? ["bald", "bald", "part", "short", "none"]
          : young
            ? ["short", "curly", "crew", "part", "short"]
            : ["short", "part", "bald", "curly", "crew", "short"],
      );
  return {
    ...base,
    sex,
    head: pick(Object.keys(HEADS).filter((k) => !HEADS[k].robot)),
    nose: pick(Object.keys(NOSES)),
    eyes: pick(EYES.filter((e) => e !== "closed")),
    hair,
    hairTone: old ? pick(["gray", "light", "gray"]) : pick(TONES),
    glasses: r() < (old ? 0.6 : 0.25) ? pick(["round", "square", "round", "sun"]) : "none",
    facial: woman || young ? "none" : r() < 0.3 ? pick(["mustache", "beard", "stubble"]) : "none",
    outfit,
    aid: old && r() < 0.2 ? "hearing" : "none",
    ...keep,
  };
}

function hairMass(b, ring, tone, light = 0) {
  b.washes.push({ rings: [ring], tone: tone === "dark" ? 1 : tone === "gray" ? 0.42 : light, role: "hair" });
}

function addHair(b, R, spec, head) {
  const tone = spec.hairTone;
  const front = head.eye - 22;
  const styles = {
    short: { from: -0.32, to: -3.0, thick: 7, inset: 6 },
    part: { from: -0.25, to: -3.0, thick: 10, inset: 7, part: true },
    crew: { from: -0.4, to: -2.95, thick: 4.5, inset: 4, ticks: true },
    bald: { from: -2.5, to: -3.45, thick: 6, inset: 0, fuzzy: true },
    curly: { from: -0.2, to: -3.15, thick: 13, inset: 6, curls: true },
    bun: { from: -0.3, to: -3.05, thick: 6, inset: 6, bun: true },
    bob: { from: 0.55, to: -3.75, thick: 12, inset: 0, bangs: true },
    long: { from: 0.6, to: -3.55, thick: 13, inset: 0, bangs: true, fall: true },
    pigtails: { from: 0.2, to: -3.45, thick: 9, inset: 0, bangs: true, tails: true },
  };
  const s = styles[spec.hair];
  if (!s) return { covers: () => false, ear: true };

  const thick = (t) => s.thick * bump(t, s.fuzzy ? 0.35 : 0.14) * (0.85 + 0.25 * Math.sin(t * 3.1));
  let outer = sweep(s.from, s.to, (a, t) => R.at(a, thick(t)), 0.025);
  if (s.curls) outer = scallop(outer, 4.2, 9.5, 2);
  if (s.fuzzy) outer = scallop(outer, 1.8, 4.5, 5);
  const inner = sweep(
    s.from,
    s.to,
    (a, t) => {
      const p = R.at(a, 0);
      const dip = s.inset * Math.max(0, Math.cos(((a + 0.9) * Math.PI) / 1.6)) * (t < 0.5 ? 1 : 0.4);
      const len = Math.hypot(p.x, p.y) || 1;
      return { x: p.x - (p.x / len) * dip, y: p.y - (p.y / len) * dip };
    },
    0.025,
  );

  if (s.bangs) {
    const start = R.at(-0.3, 0);
    const end = R.at(-1.95, 0);
    for (let i = 0; i < inner.length; i++) {
      const p = inner[i];
      if (p.x > end.x && p.y < front + 6) {
        const t = (p.x - end.x) / (start.x - end.x);
        p.y = Math.max(p.y, front - 2 + Math.sin(t * Math.PI) * 3);
      }
    }
  }

  let massRing = outer.concat(inner.slice().reverse());
  let edge = outer;
  if (s.fall) {
    const end = outer[outer.length - 1];
    const hang = spline(
      [
        [end.x, end.y],
        [end.x - 1, end.y + 34],
        [end.x + 6, end.y + 62],
        [end.x + 22, end.y + 70],
        [-20, 62],
      ],
      { step: 2.4 },
    );
    edge = outer.concat(hang.slice(1));
    massRing = edge.concat(inner.slice().reverse());
  }

  hairMass(b, massRing, tone);

  b.lines.push({ pts: edge, weight: 0.95 });
  const hairline = inner.filter((p) => p.x > R.at(-2.2, 0).x - 2);
  if (hairline.length > 2) b.lines.push({ pts: hairline, weight: 0.85 });

  if (tone !== "dark") {
    const r = rng(spec.seed + 3);
    for (let i = 0; i < 5; i++) {
      const t = 0.18 + i * 0.15 + r() * 0.05;
      const a = s.from + (s.to - s.from) * t;
      const p0 = R.at(a, thick(t) * 0.25);
      const p1 = R.at(a - 0.18, thick(t) * 0.75);
      b.lines.push({ pts: spline([p0, { x: (p0.x + p1.x) / 2 + 1, y: (p0.y + p1.y) / 2 - 1 }, p1]), weight: 0.55 });
    }
  }

  if (s.part) {
    const p0 = R.at(-1.1, 0);
    const p1 = R.at(-1.25, s.thick * 0.9);
    b.lines.push(segment(p0, p1, { weight: 0.7 }));
  }
  if (s.ticks) {
    for (let a = s.from - 0.15; a > s.to + 0.15; a -= 0.16) {
      const p0 = R.at(a, 1);
      const p1 = R.at(a, s.thick + 2.5);
      b.lines.push(segment(p0, p1, { weight: 0.45 }));
    }
  }
  if (s.tails) {
    for (const [angle, side] of [
      [-3.05, -1],
      [-0.1, 1],
    ]) {
      const a = R.at(angle, s.thick * 0.5);
      const pts = [
        [0, -7],
        [12, -11],
        [24, -6],
        [29, 6],
        [25, 19],
        [15, 26],
        [8, 18],
        [3, 7],
      ].map(([x, y]) => [a.x + side * x, a.y + y]);
      const ring = area(pts);
      hairMass(b, ring, tone);
      b.lines.push({ pts: ring.concat(ring.slice(0, 3)), weight: 0.9 });
      b.knock.push(ring);
      const tie = ovalRing(a.x + side * 3, a.y, 4.2, 5.4);
      b.washes.push({ rings: [tie], paper: true });
      b.lines.push({ pts: oval(a.x + side * 3, a.y, 4.2, 5.4), weight: 0.75 });
    }
  }
  if (s.bun) {
    const c = R.at(-2.35, s.thick + 9);
    const ring = ovalRing(c.x, c.y, 11, 10);
    hairMass(b, ring, tone);
    b.lines.push({ pts: oval(c.x, c.y, 11, 10, { start: 0.4 }), weight: 0.95 });
    b.knock.push(ring);
  }

  b.knock.push(massRing);
  const lo = Math.min(s.from, s.to);
  const hi = Math.max(s.from, s.to);
  const covers = (angle) => {
    for (const k of [-1, 0, 1]) {
      const a = angle + k * Math.PI * 2;
      if (a > lo + 0.05 && a < hi - 0.05) return true;
    }
    return false;
  };
  return { covers, ear: !(spec.hair === "bob" || spec.hair === "long" || spec.hair === "pigtails") };
}

function addFace(b, spec, head) {
  const mood = spec.mood || "neutral";
  const fx = head.face;
  const near = { x: fx + 6, y: head.eye };
  const far = { x: fx + 30, y: head.eye - 0.5 };
  const eyes = spec.eyes;
  const woman = spec.sex === "woman";
  const age = ageOf(spec);
  const kid = age === "kid";

  const lashes = (e, scale, side, closed) => {
    const ox = e.x + side * 4 * scale;
    const oy = e.y + (closed ? 1.6 : -1.6);
    const up = closed ? 1 : -1;
    b.lines.push(segment([ox, oy], [ox + side * 3 * scale, oy + up * 2.4], { weight: 0.45 }));
    b.lines.push(segment([ox - side * 1.8 * scale, oy + up * 0.8], [ox - side * 0.6 * scale, oy + up * 3.6], { weight: 0.42 }));
  };

  const eye = (e, scale, side) => {
    if (eyes === "closed") {
      shutEye(b, { x: e.x, y: e.y + 0.5 }, 4.8 * scale, 0.8);
      if (woman) lashes(e, scale, side, true);
      return;
    }
    openEye(e, scale);
    if (woman && mood !== "delighted") lashes(e, scale, side, false);
  };

  const openEye = (e, scale) => {
    if (mood === "delighted") {
      b.lines.push(
        line(
          [
            [e.x - 4.5 * scale, e.y + 1.5],
            [e.x, e.y - 2.6],
            [e.x + 4.5 * scale, e.y + 1.5],
          ],
          { weight: 0.8 },
        ),
      );
      return;
    }
    if (mood === "startled") {
      b.lines.push({ pts: oval(e.x, e.y, 4.6 * scale, 6.2, { start: -1.4 }), weight: 0.7 });
      b.solids.push(dot(e.x + 0.8, e.y, 1.5));
      return;
    }
    const lidded = eyes === "lids" || mood === "deadpan" || mood === "smug";
    if (eyes === "ovals") {
      b.lines.push({ pts: oval(e.x, e.y, 4 * scale, 5.4, { start: -1.4 }), weight: 0.7 });
      b.solids.push(dot(e.x + 1.4 * scale, e.y + (lidded ? 1.4 : 0.6), 1.9));
      if (lidded)
        b.lines.push(
          line(
            [
              [e.x - 4.6 * scale, e.y - 0.6],
              [e.x, e.y - 1.6],
              [e.x + 4.6 * scale, e.y - 0.4],
            ],
            { weight: 0.8 },
          ),
        );
      return;
    }
    const r = (eyes === "beads" ? 1.8 : 2.6) * (kid ? 1.25 : age === "teen" ? 1.12 : 1);
    b.solids.push(dot(e.x, e.y + (lidded ? 1.2 : 0), r * (scale < 1 ? 0.9 : 1)));
    if (lidded)
      b.lines.push(
        line(
          [
            [e.x - 4.8 * scale, e.y - 0.6],
            [e.x, e.y - 1.8],
            [e.x + 4.8 * scale, e.y - 0.2],
          ],
          { weight: 0.75 },
        ),
      );
  };
  eye(near, 1, -1);
  eye(far, 0.8, 1);

  const brow = BROWS[mood] || BROWS.neutral;
  b.lines.push(
    line(
      [
        [near.x - 7, near.y + brow.near[0]],
        [near.x, near.y + brow.near[1]],
        [near.x + 6, near.y + brow.near[2]],
      ],
      { weight: 0.8 },
    ),
  );
  b.lines.push(
    line(
      [
        [far.x - 4.5, far.y + brow.far[0]],
        [far.x + 0.5, far.y + brow.far[1]],
        [far.x + 5, far.y + brow.far[2]],
      ],
      { weight: 0.75 },
    ),
  );

  if (!kid && (mood === "worried" || mood === "sheepish")) {
    b.lines.push(
      line(
        [
          [near.x + 9, near.y - 17],
          [near.x + 12, near.y - 19],
          [near.x + 15, near.y - 18],
        ],
        { weight: 0.4 },
      ),
    );
  }
  if (mood === "cross") {
    b.lines.push(
      line(
        [
          [near.x + 9, near.y - 13],
          [near.x + 11, near.y - 9],
        ],
        { weight: 0.45 },
      ),
    );
  }

  const bridge = { x: fx + 18, y: head.eye - 2 };
  const nose = NOSES[spec.nose] || NOSES.button;
  const ns = kid ? 0.62 : 1;
  b.lines.push(
    line(
      nose.map(([x, y]) => [bridge.x + x * ns, bridge.y + y * ns]),
      { weight: 0.95 },
    ),
  );
  if (spec.nose === "bulb" && !kid)
    b.lines.push(
      line(
        [
          [bridge.x + 8, bridge.y + 21],
          [bridge.x + 10, bridge.y + 22.5],
        ],
        { weight: 0.5 },
      ),
    );

  const m = { x: fx + 17, y: head.mouth };
  if (mood === "delighted") {
    b.lines.push({
      pts: spline(
        [
          [m.x - 12, m.y - 3],
          [m.x, m.y - 1],
          [m.x + 12, m.y - 5],
          [m.x + 7, m.y + 6],
          [m.x - 2, m.y + 8],
          [m.x - 10, m.y + 3],
        ],
        { closed: true, overlap: 0.08 },
      ),
      weight: 0.85,
    });
    b.washes.push({
      rings: [
        area([
          [m.x - 10, m.y - 1],
          [m.x, m.y + 0.5],
          [m.x + 10, m.y - 3],
          [m.x + 6, m.y + 5],
          [m.x - 2, m.y + 6.5],
          [m.x - 8, m.y + 2.5],
        ]),
      ],
      tone: 0.55,
    });
    b.lines.push(
      line(
        [
          [m.x - 15, m.y - 6],
          [m.x - 13, m.y - 2.5],
        ],
        { weight: 0.45 },
      ),
    );
  } else if (mood === "startled") {
    b.lines.push({ pts: oval(m.x, m.y + 2, 4, 6, { start: -1.2 }), weight: 0.8 });
    b.washes.push({ rings: [ovalRing(m.x, m.y + 2, 3, 4.6)], tone: 0.55 });
  } else {
    b.lines.push(
      line(
        (MOUTHS[mood] || MOUTHS.neutral).map(([x, y]) => [m.x + x, m.y + y]),
        { weight: 0.85 },
      ),
    );
    if (mood === "smug")
      b.lines.push(
        line(
          [
            [m.x + 13, m.y - 9],
            [m.x + 14.5, m.y - 5],
          ],
          { weight: 0.4 },
        ),
      );
    if (woman && spec.facial !== "beard")
      b.lines.push(
        line(
          [
            [m.x - 5, m.y + 4.4],
            [m.x, m.y + 6],
            [m.x + 5, m.y + 4],
          ],
          { weight: 0.42 },
        ),
      );
  }

  if (age === "teen")
    for (const [x, y] of [
      [near.x - 3, near.y + 9],
      [near.x + 2, near.y + 11],
      [near.x + 7, near.y + 9.5],
      [far.x - 3, far.y + 9],
      [far.x + 1.5, far.y + 10.5],
    ])
      b.solids.push(dot(x, y, 0.85));

  if (age === "old") {
    b.lines.push(
      line(
        [
          [fx - 4, head.eye - 27],
          [fx + 10, head.eye - 29],
          [fx + 26, head.eye - 27],
        ],
        { weight: 0.38 },
      ),
      line(
        [
          [fx + 2, head.eye - 33],
          [fx + 12, head.eye - 34.5],
          [fx + 22, head.eye - 33],
        ],
        { weight: 0.34 },
      ),
    );
    for (const [dy, len] of [
      [-3, 5],
      [0.5, 6],
      [4, 5],
    ])
      b.lines.push(segment([near.x - 8, near.y + dy], [near.x - 8 - len, near.y + dy * 1.6], { weight: 0.32 }));
    b.lines.push(
      line(
        [
          [near.x - 3, near.y + 6],
          [near.x + 1, near.y + 7.5],
          [near.x + 5, near.y + 6],
        ],
        { weight: 0.32 },
      ),
    );
    b.lines.push(
      line(
        [
          [bridge.x + 4, bridge.y + 27],
          [m.x - 11, m.y - 3],
          [m.x - 13, m.y + 5],
        ],
        { weight: 0.4 },
      ),
    );
  }

  const style = spec.glasses;
  if (style === "patch") {
    const ring = ovalRing(near.x + 0.5, near.y + 0.5, 8.5, 7.5);
    b.solids.push(ring);
    b.knock.push(ring);
    b.lines.push(
      line(
        [
          [near.x - 6, near.y - 5],
          [near.x - 22, near.y - 12],
          [fx - 34, near.y - 16],
        ],
        { weight: 0.6 },
      ),
      line(
        [
          [near.x + 7, near.y - 5],
          [fx + 22, near.y - 15],
          [far.x + 12, far.y - 20],
        ],
        { weight: 0.55 },
      ),
    );
  } else if (style === "monocle") {
    b.lines.push({ pts: oval(near.x + 0.5, near.y + 0.5, 8.5, 8.5, { start: -1.8 }), weight: 0.85 });
    b.lines.push(
      line(
        [
          [near.x - 7, near.y + 6],
          [near.x - 12, near.y + 22],
          [fx - 6, head.mouth + 18],
          [fx - 2, head.mouth + 32],
        ],
        { weight: 0.35 },
      ),
    );
  } else if (style === "sun") {
    const pts = (c, rx, ry) => [
      [c.x - rx, c.y - ry + 1],
      [c.x + rx, c.y - ry],
      [c.x + rx, c.y + ry - 4],
      [c.x + rx - 4, c.y + ry],
      [c.x - rx + 4, c.y + ry],
      [c.x - rx, c.y + ry - 4],
    ];
    for (const [c, rx, ry] of [
      [{ x: near.x + 0.5, y: near.y + 1 }, 9.5, 7.5],
      [{ x: far.x + 0.5, y: far.y + 1 }, 7, 7],
    ]) {
      const ring = area(pts(c, rx, ry), 2);
      b.solids.push(ring);
      b.knock.push(ring);
      b.lines.push(segment([c.x + rx * 0.2, c.y - ry * 0.45], [c.x + rx * 0.6, c.y - ry * 0.05], { weight: 0.5, color: "chalk" }));
    }
    b.lines.push(
      line(
        [
          [near.x + 10, near.y - 3],
          [fx + 19, near.y - 4.5],
          [far.x - 6.5, far.y - 3],
        ],
        { weight: 0.7 },
      ),
    );
    b.lines.push(
      line(
        [
          [near.x - 9, near.y - 3],
          [near.x - 22, near.y - 3],
          [fx - 30, near.y],
        ],
        { weight: 0.65 },
      ),
    );
  } else if (style && style !== "none") {
    const lens = (c, rx, ry) =>
      style === "round"
        ? oval(c.x, c.y, rx, ry, { start: -1.8 })
        : spline(
            [
              [c.x - rx, c.y - ry + 2],
              [c.x - rx + 2, c.y - ry],
              [c.x + rx - 2, c.y - ry],
              [c.x + rx, c.y - ry + 2],
              [c.x + rx, c.y + ry - 3],
              [c.x + rx - 3, c.y + ry],
              [c.x - rx + 3, c.y + ry],
              [c.x - rx, c.y + ry - 3],
            ],
            { closed: true, overlap: 0.06 },
          );
    b.lines.push({ pts: lens({ x: near.x + 0.5, y: near.y + 0.5 }, 9, 8), weight: 0.75 });
    b.lines.push({ pts: lens({ x: far.x + 0.5, y: far.y + 0.5 }, 6.8, 7.6), weight: 0.7 });
    b.lines.push(
      line(
        [
          [near.x + 9.5, near.y - 1],
          [fx + 19, near.y - 3],
          [far.x - 6.5, far.y - 1],
        ],
        { weight: 0.6 },
      ),
    );
    b.lines.push(
      line(
        [
          [near.x - 9, near.y - 1],
          [near.x - 22, near.y - 2],
          [fx - 30, near.y + 1],
        ],
        { weight: 0.6 },
      ),
    );
  }

  if (spec.facial === "mustache") {
    const ring = area([
      [m.x - 14, m.y - 4],
      [m.x - 8, m.y - 12],
      [m.x, m.y - 12.5],
      [m.x + 8, m.y - 14],
      [m.x + 15, m.y - 6],
      [m.x + 9, m.y - 6],
      [m.x + 1, m.y - 7],
      [m.x - 7, m.y - 5.5],
    ]);
    hairMass(b, ring, spec.hairTone, 0.42);
    b.lines.push({ pts: ring.concat([ring[0]]), weight: 0.6 });
  }
  if (spec.facial === "beard") {
    const ring = area([
      [fx - 20, head.eye + 8],
      [fx - 12, head.mouth - 6],
      [m.x - 12, m.y - 3],
      [m.x, m.y - 6],
      [m.x + 14, m.y - 4],
      [fx + 38, head.mouth - 2],
      [fx + 34, head.mouth + 20],
      [fx + 14, head.mouth + 34],
      [fx - 10, head.mouth + 30],
      [fx - 28, head.mouth + 12],
    ]);
    hairMass(b, ring, spec.hairTone, 0.4);
    b.lines.push({ pts: scallop(ring.slice(Math.floor(ring.length * 0.55)).concat(ring.slice(0, 4)), 1.4, 5, 3), weight: 0.6 });
    b.knock.push(ring);
    b.lines.push(
      line(
        (MOUTHS[mood] || MOUTHS.neutral).map(([x, y]) => [m.x + x, m.y + y]),
        { weight: 0.9, pen: "fineliner" },
      ),
    );
  }
  if (spec.facial === "stubble") {
    const r = rng(spec.seed + 11);
    for (let i = 0; i < 26; i++) {
      const x = fx - 18 + r() * 52;
      const y = head.mouth - 6 + r() * 26;
      if (Math.abs(x - m.x) < 13 && Math.abs(y - m.y) < 5) continue;
      b.lines.push(segment([x, y], [x + 0.4, y + 0.6], { weight: 0.32, pen: "fineliner" }));
    }
  }
}

function addEar(b, head) {
  const x = head.face - 28;
  const y = head.eye + 6;
  b.lines.push(
    line(
      [
        [x + 5, y - 11],
        [x - 3, y - 13],
        [x - 8, y - 5],
        [x - 7, y + 5],
        [x - 1, y + 11],
        [x + 4, y + 9],
      ],
      { weight: 0.85 },
    ),
  );
  b.lines.push(
    line(
      [
        [x + 1, y - 5],
        [x - 3, y - 1],
        [x, y + 4],
      ],
      { weight: 0.5 },
    ),
  );
}

function skullFace(b, head) {
  const fx = head.face;
  const near = { x: fx + 6, y: head.eye };
  const far = { x: fx + 30, y: head.eye - 0.5 };
  for (const [e, rx, ry] of [
    [near, 8.5, 8.5],
    [far, 7, 8],
  ]) {
    b.solids.push(ovalRing(e.x, e.y + 1, rx, ry));
    b.lines.push({ pts: oval(e.x + 1.5, e.y + 1.5, 1.6, 1.6), weight: 0.9, color: "chalk" });
  }
  const n = { x: fx + 18, y: head.eye + 15 };
  b.solids.push(
    area(
      [
        [n.x - 3.5, n.y + 5],
        [n.x, n.y - 4],
        [n.x + 3.5, n.y + 5],
        [n.x, n.y + 3],
      ],
      1.5,
    ),
  );
  const m = { x: fx + 17, y: head.mouth };
  b.lines.push(
    line(
      [
        [m.x - 15, m.y - 1],
        [m.x, m.y + 1.5],
        [m.x + 15, m.y - 1],
      ],
      { weight: 0.85 },
    ),
  );
  for (const dx of [-10, -5, 0, 5, 10]) b.lines.push(segment([m.x + dx, m.y - 3.5], [m.x + dx, m.y + 4.5], { weight: 0.5 }));
}

function hood(b, contour) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of contour) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const W = maxX - minX;
  const H = maxY - minY;
  const cx = (minX + maxX) / 2;
  const outer = spline(
    [
      [cx - 14, minY - 30],
      [maxX - W * 0.12, minY - 12],
      [maxX + 10, minY + H * 0.34],
      [maxX + 8, maxY - H * 0.12],
      [maxX - W * 0.04, maxY + 20],
      [cx, maxY + 30],
      [minX + W * 0.08, maxY + 32],
      [minX - 18, maxY + 4],
      [minX - 24, minY + H * 0.42],
      [minX - 12, minY + H * 0.06],
    ],
    { closed: true, step: 3 },
  );
  const fx = minX + W * 0.6;
  const fy = minY + H * 0.6;
  const opening = oval(fx, fy, W * 0.38, H * 0.42, { overlap: 0, step: 3 });
  const ring = outer.concat(outer[0], opening.slice().reverse(), opening[opening.length - 1]);
  const g = layer();
  g.lines.push({ pts: outer.concat(outer.slice(0, 4)), weight: 1.05 });
  g.lines.push({ pts: oval(fx, fy, W * 0.38, H * 0.42, { start: 1.2 }), weight: 0.9 });
  g.cover.push(ring);
  paint(b, g);
  b.washes.push({ rings: [outer], tone: 0.86, role: "top" }, { rings: [opening], paper: true });
  b.washes.push({ rings: [opening], tone: 0.34 }, { rings: [oval(fx + W * 0.05, fy + H * 0.04, W * 0.3, H * 0.36, { overlap: 0, step: 3 })], paper: true });
  b.knock.push(outer);
}

function addAid(b, head, aid) {
  const x = head.face - 28;
  const y = head.eye + 6;
  const unit = area(
    [
      [x - 3, y - 17],
      [x + 3, y - 15],
      [x - 3, y - 12],
      [x - 9, y - 6],
      [x - 11, y + 4],
      [x - 15, y + 2],
      [x - 14, y - 8],
      [x - 9, y - 15],
    ],
    2,
  );
  b.lines.push({ pts: unit.concat(unit.slice(0, 3)), weight: 0.75 });
  b.washes.push({ rings: [unit], tone: 0.42, role: "aid" });
  b.knock.push(unit);
  b.lines.push(
    line(
      [
        [x + 3, y - 15],
        [x + 6, y - 11],
        [x + 3, y - 5],
        [x, y - 2],
      ],
      { weight: 0.5 },
    ),
  );
  if (aid === "implant") {
    const c = { x: x - 4, y: y - 34 };
    b.lines.push(
      line(
        [
          [x - 6, y - 16],
          [x - 7, y - 22],
          [c.x - 2, c.y + 6],
        ],
        { weight: 0.55 },
      ),
    );
    b.solids.push(ovalRing(c.x, c.y, 7, 7));
    b.knock.push(ovalRing(c.x, c.y, 7, 7));
    b.lines.push({ pts: oval(c.x, c.y, 4, 4), weight: 0.55, color: "chalk" });
  }
}

const childHead = (h) => ({ ...h, pts: h.pts.map(([x, y]) => [x * 1.05, y < 0 ? y * 1.02 : y * 0.8]), eye: h.eye + 9, mouth: h.eye + 30 });

function addHead(b, spec) {
  const kind = kindOf(spec);
  if (kind !== "human") {
    const table = kind === "alien" ? ALIENS : kind === "robot" ? ROBOT_HEADS : ANIMALS;
    const def = table[spec.species] || Object.values(table)[0];
    const made = def.draw(b, spec);
    let top = made.top ?? Infinity;
    if (made.top == null) for (const p of made.contour) if (Math.abs(p.x) < 30 && p.y < top) top = p.y;
    addHat(b, spec.hat, { top: Number.isFinite(top) ? top : -60, seed: spec.seed });
    return made;
  }
  const shape = HEADS[spec.head] || HEADS.oval;
  const head = ageOf(spec) === "kid" && !shape.robot ? childHead(shape) : shape;
  const contour = spline(head.pts, { closed: true, step: 1.5 });
  const R = polar(contour);
  const hair = addHair(b, R, spec.outfit === "death" ? { ...spec, hair: "none" } : spec, head);

  const runs = [];
  let run = [];
  for (const p of contour) {
    const covered = hair.covers(Math.atan2(p.y, p.x));
    if (covered) {
      if (run.length > 2) runs.push(run);
      run = [];
    } else run.push(p);
  }
  if (run.length > 2) runs.push(run);
  if (runs.length > 1 && !hair.covers(Math.atan2(contour[0].y, contour[0].x))) {
    const first = runs.shift();
    runs[runs.length - 1] = runs[runs.length - 1].concat(first);
  }
  if (!runs.length) runs.push(contour.concat(contour.slice(0, 8)));
  for (const r of runs) b.lines.push({ pts: r, weight: 1.05 });

  b.knock.push(contour);
  if (!head.robot) b.washes.unshift({ rings: [contour], tone: 0, role: "skin" });
  if (head.robot) addRobotFace(b, spec);
  else {
    if (hair.ear) addEar(b, head);
    if (hair.ear && spec.aid && spec.aid !== "none") addAid(b, head, spec.aid);
    if (spec.outfit === "death") skullFace(b, head);
    else addFace(b, spec, head);
  }
  addHat(b, spec.hat, { top: headTop(b), seed: spec.seed });
  return { head, contour };
}

function addRobotFace(b, spec) {
  const mood = spec.mood || "neutral";
  const screen = [
    [-34, -32],
    [34, -32],
    [36, -28],
    [36, 30],
    [32, 34],
    [-32, 34],
    [-36, 30],
    [-36, -28],
  ];
  b.lines.push(loop(screen, { weight: 0.8, overlap: 0.04 }));
  b.washes.push({
    rings: [
      area([
        [-46, -46],
        [46, -46],
        [47, 46],
        [-47, 46],
      ]),
    ],
    tone: 0.24,
  });
  b.washes.push({ rings: [area(screen)], tone: 0.06 });
  const slant = mood === "cross" || mood === "smug" ? 4 : mood === "worried" || mood === "sheepish" ? -4 : 0;
  if (mood === "delighted") {
    b.lines.push(
      line(
        [
          [-24, -8],
          [-16, -15],
          [-8, -8],
        ],
        { weight: 1.3 },
      ),
      line(
        [
          [8, -8],
          [16, -15],
          [24, -8],
        ],
        { weight: 1.3 },
      ),
    );
  } else if (mood === "startled") {
    b.lines.push({ pts: oval(-16, -10, 6, 6), weight: 0.9 }, { pts: oval(16, -10, 6, 6), weight: 0.9 });
    b.solids.push(dot(-16, -10, 2), dot(16, -10, 2));
  } else {
    b.solids.push(
      area([
        [-25, -12 - slant],
        [-8, -12 + slant],
        [-8, -5 + slant],
        [-25, -5 - slant],
      ]),
    );
    b.solids.push(
      area([
        [8, -12 + slant],
        [25, -12 - slant],
        [25, -5 - slant],
        [8, -5 + slant],
      ]),
    );
  }
  if (mood === "startled") b.lines.push({ pts: oval(0, 18, 7, 8), weight: 0.9 });
  else if (mood === "deadpan" || mood === "neutral") b.lines.push(segment([-16, 18], [16, 18], { weight: 1.1 }));
  else if (mood === "worried" || mood === "sheepish" || mood === "cross")
    b.lines.push(
      line(
        [
          [-16, 22],
          [-8, 16],
          [0, 21],
          [8, 16],
          [16, 22],
        ],
        { weight: 1 },
      ),
    );
  else {
    const grin = [
      [-26, 8],
      [26, 8],
      [24, 24],
      [-24, 24],
    ];
    b.lines.push(poly(grin, { closed: true, weight: 0.9 }));
    for (let x = -18; x <= 18; x += 6) b.lines.push(segment([x, 8], [x, 24], { weight: 0.55 }));
    b.lines.push(segment([-25, 16], [25, 16], { weight: 0.55 }));
  }
  for (const side of [-1, 1]) {
    b.lines.push(
      line(
        [
          [side * 26, -47],
          [side * 30, -62],
          [side * 34, -74],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push({ pts: oval(side * 35, -80, 4.5, 6), weight: 0.8 });
    b.lines.push(
      poly(
        [
          [side * 47, -6],
          [side * 54, -6],
          [side * 54, 8],
          [side * 47, 8],
        ],
        { weight: 0.75 },
      ),
    );
  }
}

const cap = (a, b, ra, rb = ra) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const dx = (b[0] - a[0]) / len;
  const dy = (b[1] - a[1]) / len;
  const end = (o, r, from) => {
    const out = [];
    for (let i = 0; i <= 8; i++) {
      const t = from + (Math.PI * i) / 8;
      out.push([o[0] + r * (dx * Math.cos(t) - dy * Math.sin(t)), o[1] + r * (dy * Math.cos(t) + dx * Math.sin(t))]);
    }
    return out;
  };
  const side = (p, q) => {
    const n = Math.max(1, Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) / 2));
    return Array.from({ length: n - 1 }, (_, i) => [p[0] + ((q[0] - p[0]) * (i + 1)) / n, p[1] + ((q[1] - p[1]) * (i + 1)) / n]);
  };
  const tip = end(b, rb, -Math.PI / 2);
  const heel = end(a, ra, Math.PI / 2);
  return [...tip, ...side(tip[8], heel[0]), ...heel, ...side(heel[8], tip[0])];
};

const HAND_SCALE = 1.12;

const HANDS = {
  mitt: [
    {
      smooth: [
        [0, -7.5],
        [9, -9],
        [19, -8.5],
        [25.5, -4],
        [26.5, 3],
        [22, 8.5],
        [12, 9.5],
        [0, 7.5],
      ],
    },
    { ring: cap([6, -7], [15.5, -10.5], 3.8, 3.3), merge: true },
    {
      line: [
        [18.5, 1.5],
        [25.5, 2],
      ],
    },
  ],
  open: [
    {
      smooth: [
        [0, -7],
        [9, -8.5],
        [16, -8],
        [19, -1],
        [18, 7],
        [9, 9],
        [0, 7.5],
      ],
    },
    { ring: cap([15, 5], [29, 6.5], 3.3, 3), merge: true },
    { ring: cap([16, 0.5], [32, 0], 3.4, 3.1), merge: true },
    { ring: cap([15, -4.5], [31, -6.5], 3.4, 3.1), merge: true },
    { ring: cap([7, -6], [14, -14.5], 3.8, 3.2), merge: true },
  ],
  point: [
    {
      smooth: [
        [0, -7.5],
        [8, -10],
        [16, -10],
        [20.5, -4],
        [20, 4],
        [14.5, 9.5],
        [6, 10],
        [0, 8],
      ],
    },
    { ring: cap([13, -6.5], [34, -6.5], 3.4, 3.1), merge: true },
    {
      line: [
        [4, -3.5],
        [10, -2.2],
        [15.5, -2.6],
      ],
    },
    {
      line: [
        [20, 3.5],
        [15.5, 4.2],
      ],
    },
  ],
  wave: [
    {
      smooth: [
        [0, -8],
        [8, -10.5],
        [16, -10],
        [19, 0],
        [16, 10],
        [8, 10.5],
        [0, 8],
      ],
    },
    { ring: cap([13, 7], [26, 11], 3.1, 2.8), merge: true },
    { ring: cap([15, 2.5], [31, 4.5], 3.3, 3), merge: true },
    { ring: cap([15, -2.3], [32, -3], 3.3, 3), merge: true },
    { ring: cap([13, -7], [28, -11], 3.2, 2.9), merge: true },
    { ring: cap([5, -8], [12, -17.5], 3.6, 3.1), merge: true },
  ],
  claw: [
    {
      smooth: [
        [0, -7],
        [9, -10],
        [21, -13],
        [27, -7],
        [19, -6],
        [13, -2],
        [19, 2],
        [27, 5],
        [21, 11],
        [9, 10],
        [0, 7],
      ],
    },
  ],
};

function paw(p, x, y, angle, kind = "mitt", flip = false) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const at = ([u, v]) => {
    const w = (flip ? -v : v) * HAND_SCALE;
    return { x: x + u * HAND_SCALE * c - w * s, y: y + u * HAND_SCALE * s + w * c };
  };
  let lines = [];
  let base = null;
  const rings = [];
  for (const part of HANDS[kind] || HANDS.mitt) {
    if (part.line) {
      lines.push(line(part.line.map(at), { weight: 0.55 }));
      continue;
    }
    const ring = part.smooth ? area(part.smooth.map(at)) : part.ring.map(at);
    lines = hideUnder(lines, [ring]);
    const outline = { pts: ring.concat(ring.slice(0, 3)), weight: 0.8 };
    lines.push(...(part.merge && base ? hideUnder([outline], [base]) : [outline]));
    rings.push(ring);
    base = base || ring;
  }
  p.lines.push(...lines);
  p.knock.push(...rings);
  p.cover.push(...rings);
  p.washes.push({ rings, tone: 0, role: "skin" });
}

function lengthOf(pts) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return total;
}

function cut(pts, f) {
  const target = lengthOf(pts) * f;
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + seg >= target) {
      const t = (target - acc) / (seg || 1);
      out.push({ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t });
      return out;
    }
    out.push(pts[i]);
    acc += seg;
  }
  return out;
}

function stations(pts, n) {
  const out = resample(pts, Math.max(0.5, lengthOf(pts) / (n - 1)));
  while (out.length < n) out.push(out[out.length - 1]);
  return out.slice(0, n);
}

function sleeve(p, outer, inner, st) {
  const O = spline(outer);
  const I = spline(inner);
  p.lines.push({ pts: O }, { pts: I });
  const ring = area(outer.concat(inner.slice().reverse()));
  p.knock.push(ring);
  p.cover.push(ring);
  if (st.short) {
    const o = cut(O, 0.4);
    const i = cut(I, 0.36);
    const a = o[o.length - 1];
    const c = i[i.length - 1];
    if (st.tone) p.washes.push({ rings: [o.concat(i.slice().reverse())], tone: st.tone, role: st.role });
    p.lines.push(
      line(
        [
          [a.x, a.y],
          [(a.x + c.x) / 2, (a.y + c.y) / 2 + 2],
          [c.x, c.y],
        ],
        { weight: 0.75 },
      ),
    );
    if (st.stripes) {
      const o2 = cut(O, 0.32);
      const i2 = cut(I, 0.27);
      p.lines.push(segment(o2[o2.length - 1], i2[i2.length - 1], { weight: 0.6 }));
    }
  } else if (st.tone) p.washes.push({ rings: [ring], tone: st.tone, role: st.role });
  if (st.bones || st.wraps || st.ribs) {
    const n = 14;
    const a = stations(O, n);
    const c = stations(I, n);
    if (st.bones)
      p.lines.push(
        line(
          a.slice(1, -1).map((q, k) => [(q.x + c[k + 1].x) / 2, (q.y + c[k + 1].y) / 2]),
          { weight: 1.2, color: "chalk" },
        ),
      );
    if (st.wraps) for (let k = 1; k < n - 2; k += 2) p.lines.push(segment(a[k], c[k + 1], { weight: 0.42 }));
    if (st.ribs) for (let k = 2; k < n - 1; k += 2) p.lines.push(segment(a[k], c[k], { weight: 0.45 }));
  }
}

const cuffLine = (p, a, c) => p.lines.push(line([a, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 + 2], c], { weight: 0.7 }));

const HANG = new Set(["briefcase", "umbrella", "cane", "whitecane", "crutch", "bag", "lantern"]);

export function holdsFor(spec) {
  return canHold(spec) ? HOLDING : ["nothing"];
}

function fist(p, x, y) {
  const ring = area([
    [x - 8, y - 6],
    [x + 4, y - 9],
    [x + 9, y],
    [x + 5, y + 9],
    [x - 6, y + 8],
  ]);
  p.lines.push({ pts: ring.concat(ring.slice(0, 3)), weight: 0.8 });
  p.knock.push(ring);
  p.cover.push(ring);
}

const GROUNDED = { briefcase: 70, umbrella: 246, cane: 240, whitecane: 248, crutch: 246, bag: 92, lantern: 96 };

function lean(p, kind, x, y, floor) {
  const q = layer();
  held(q, kind, x, y, { grip: false });
  const length = GROUNDED[kind] || 200;
  const angle = -Math.acos(Math.max(-1, Math.min(1, (floor - y) / length)));
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  const turn = (pt) => ({ ...pt, x: x + (pt.x - x) * c - (pt.y - y) * sn, y: y + (pt.x - x) * sn + (pt.y - y) * c });
  const ring = (r) => r.map(turn);
  p.lines.push(...q.lines.map((l) => ({ ...l, pts: l.pts.map(turn) })));
  p.solids.push(...q.solids.map(ring));
  p.washes.push(...q.washes.map((w) => ({ ...w, rings: w.rings.map(ring) })));
  p.knock.push(...q.knock.map(ring));
  p.cover.push(...q.cover.map(ring));
}

function held(p, kind, x, y, options) {
  const from = p.washes.length;
  heldArt(p, kind, x, y, options);
  for (let i = from; i < p.washes.length; i++) if (!p.washes[i].paper && !p.washes[i].role) p.washes[i] = { ...p.washes[i], role: "held" };
}

function heldArt(p, kind, x, y, { grip = true, mirror = false } = {}) {
  if (!kind || kind === "nothing") return;
  if (mirror) {
    const q = layer();
    heldArt(q, kind, x, y, { grip });
    const m = (pt) => ({ ...pt, x: 2 * x - pt.x });
    const ring = (r) => r.map(m);
    p.lines.push(...q.lines.map((l) => ({ ...l, pts: l.pts.map(m) })));
    p.solids.push(...q.solids.map(ring));
    p.washes.push(...q.washes.map((w) => ({ ...w, rings: w.rings.map(ring) })));
    p.knock.push(...q.knock.map(ring));
    p.cover.push(...q.cover.map(ring));
    return;
  }
  const item = (ring, tone, weight = 0.85, closed = true) => {
    p.lines.push(closed ? { pts: ring.concat(ring.slice(0, 3)), weight } : { pts: ring, weight });
    if (tone) p.washes.push({ rings: [ring], tone });
    p.knock.push(ring);
    p.cover.push(ring);
  };
  if (kind === "mug") {
    item(
      flat(
        [
          [x - 2, y - 18],
          [x + 20, y - 18],
          [x + 19, y + 6],
          [x + 15, y + 9],
          [x + 2, y + 9],
          [x - 1, y + 6],
        ],
        3,
      ),
      0,
      0.85,
    );
    p.lines.push(
      line(
        [
          [x + 20, y - 12],
          [x + 27, y - 11],
          [x + 28, y - 3],
          [x + 20, y],
        ],
        { weight: 0.75 },
      ),
    );
    p.lines.push(
      line(
        [
          [x + 6, y - 24],
          [x + 9, y - 30],
          [x + 6, y - 36],
        ],
        { weight: 0.4 },
      ),
    );
  } else if (kind === "glass") {
    item(
      flat(
        [
          [x - 2, y - 16],
          [x + 18, y - 16],
          [x + 16, y + 8],
          [x, y + 8],
        ],
        3,
      ),
      0,
      0.8,
    );
    p.washes.push({
      rings: [
        flat(
          [
            [x, y - 4],
            [x + 16, y - 4],
            [x + 15, y + 7],
            [x + 1, y + 7],
          ],
          3,
        ),
      ],
      tone: 0.42,
    });
    p.lines.push(
      poly(
        [
          [x + 4, y - 9],
          [x + 11, y - 10],
          [x + 12, y - 3],
          [x + 5, y - 2],
        ],
        { closed: true, weight: 0.45 },
      ),
    );
  } else if (kind === "cocktail") {
    item(
      flat(
        [
          [x - 16, y - 40],
          [x + 24, y - 40],
          [x + 4, y - 16],
        ],
        3,
      ),
      0,
      0.8,
    );
    p.washes.push({
      rings: [
        flat(
          [
            [x - 10, y - 36],
            [x + 18, y - 36],
            [x + 4, y - 20],
          ],
          3,
        ),
      ],
      tone: 0.3,
    });
    p.lines.push(
      segment([x + 4, y - 16], [x + 4, y + 10], { weight: 0.8 }),
      line(
        [
          [x - 8, y + 12],
          [x + 4, y + 9],
          [x + 16, y + 12],
        ],
        { weight: 0.75 },
      ),
    );
    p.lines.push(segment([x + 10, y - 50], [x + 2, y - 30], { weight: 0.5 }));
    p.solids.push(dot(x + 8, y - 34, 3));
  } else if (kind === "paper") {
    item(
      flat(
        [
          [x - 4, y - 34],
          [x + 32, y - 40],
          [x + 38, y + 6],
          [x + 2, y + 12],
        ],
        3,
      ),
      0,
      0.75,
    );
    for (let k = 0; k < 4; k++) p.lines.push(segment([x + 4, y - 26 + k * 9], [x + 28, y - 30 + k * 9], { weight: 0.4 }));
  } else if (kind === "newspaper") {
    item(
      flat(
        [
          [x - 8, y - 50],
          [x + 50, y - 58],
          [x + 56, y + 6],
          [x - 2, y + 14],
        ],
        3,
      ),
      0.05,
      0.8,
    );
    p.washes.push({
      rings: [
        flat(
          [
            [x - 2, y - 42],
            [x + 44, y - 48],
            [x + 45, y - 36],
            [x - 1, y - 30],
          ],
          3,
        ),
      ],
      tone: 0.5,
    });
    for (let k = 0; k < 4; k++)
      p.lines.push(
        segment([x + 2, y - 22 + k * 9], [x + 22, y - 25 + k * 9], { weight: 0.38 }),
        segment([x + 28, y - 26 + k * 9], [x + 48, y - 29 + k * 9], { weight: 0.38 }),
      );
  } else if (kind === "book") {
    item(
      flat(
        [
          [x - 6, y - 36],
          [x + 30, y - 42],
          [x + 36, y + 4],
          [x, y + 10],
        ],
        3,
      ),
      0.45,
      0.85,
    );
    p.lines.push(
      line(
        [
          [x + 30, y - 42],
          [x + 34, y - 40],
          [x + 40, y + 2],
          [x + 36, y + 4],
        ],
        { weight: 0.6 },
      ),
    );
    p.lines.push(segment([x + 4, y - 26], [x + 22, y - 29], { weight: 0.5, color: "chalk" }));
  } else if (kind === "cigar") {
    item(
      flat(
        [
          [x + 4, y - 6],
          [x + 32, y - 16],
          [x + 34, y - 11],
          [x + 6, y - 1],
        ],
        3,
      ),
      0.5,
      0.7,
    );
    p.lines.push(
      line(
        [
          [x + 34, y - 18],
          [x + 30, y - 30],
          [x + 38, y - 42],
          [x + 33, y - 56],
        ],
        { weight: 0.35, pen: "fineliner" },
      ),
    );
  } else if (kind === "pipe") {
    item(
      flat(
        [
          [x + 4, y - 6],
          [x + 26, y - 14],
          [x + 28, y - 10],
          [x + 6, y - 2],
        ],
        3,
      ),
      0.55,
      0.7,
    );
    item(
      area([
        [x + 22, y - 32],
        [x + 40, y - 32],
        [x + 38, y - 12],
        [x + 30, y - 6],
        [x + 22, y - 12],
      ]),
      0.55,
      0.8,
    );
    p.lines.push(
      line(
        [
          [x + 32, y - 36],
          [x + 28, y - 48],
          [x + 36, y - 60],
          [x + 30, y - 74],
        ],
        { weight: 0.35, pen: "fineliner" },
      ),
    );
  } else if (kind === "phone") {
    item(
      flat(
        [
          [x - 2, y - 26],
          [x + 13, y - 27],
          [x + 15, y + 4],
          [x, y + 5],
        ],
        3,
      ),
      0.55,
      0.8,
    );
  } else if (kind === "flowers") {
    item(
      flat(
        [
          [x - 6, y + 10],
          [x + 4, y + 12],
          [x + 30, y - 30],
          [x + 4, y - 40],
        ],
        3,
      ),
      0,
      0.75,
    );
    p.lines.push(segment([x + 2, y - 14], [x + 14, y - 30], { weight: 0.4 }));
    for (const [bx, by, r] of [
      [x + 6, y - 50, 9],
      [x + 24, y - 46, 10],
      [x + 14, y - 64, 9],
      [x + 32, y - 62, 8],
      [x - 4, y - 62, 7],
    ]) {
      const bloom = scallop(ovalRing(bx, by, r, r), 1.8, 5, bx);
      item(bloom, 0.2, 0.6);
      p.solids.push(dot(bx, by, 1.6));
    }
  } else if (kind === "gift") {
    item(
      flat(
        [
          [x - 16, y - 42],
          [x + 32, y - 42],
          [x + 32, y - 4],
          [x - 16, y - 4],
        ],
        3,
      ),
      0.3,
      0.9,
    );
    p.lines.push(segment([x + 8, y - 42], [x + 8, y - 4], { weight: 0.7 }), segment([x - 16, y - 24], [x + 32, y - 24], { weight: 0.7 }));
    p.lines.push(
      loop(
        [
          [x + 8, y - 42],
          [x - 6, y - 56],
          [x - 2, y - 46],
        ],
        { weight: 0.6 },
      ),
      loop(
        [
          [x + 8, y - 42],
          [x + 22, y - 56],
          [x + 18, y - 46],
        ],
        { weight: 0.6 },
      ),
    );
  } else if (kind === "icecream") {
    item(
      flat(
        [
          [x - 10, y - 12],
          [x + 16, y - 12],
          [x + 3, y + 22],
        ],
        3,
      ),
      0.3,
      0.8,
    );
    p.lines.push(segment([x - 6, y - 4], [x + 10, y + 6], { weight: 0.4 }), segment([x + 12, y - 4], [x - 2, y + 8], { weight: 0.4 }));
    item(scallop(ovalRing(x + 3, y - 24, 15, 14), 2, 8, 2), 0.12, 0.8);
  } else if (kind === "balloon") {
    p.lines.push(
      line(
        [
          [x + 2, y - 6],
          [x + 14, y - 60],
          [x + 4, y - 120],
          [x + 24, y - 176],
        ],
        { weight: 0.45 },
      ),
    );
    item(ovalRing(x + 28, y - 212, 26, 34), 0.35, 0.85);
    p.lines.push(
      poly(
        [
          [x + 22, y - 176],
          [x + 28, y - 180],
          [x + 34, y - 176],
        ],
        { closed: true, weight: 0.6 },
      ),
    );
    p.lines.push(
      line(
        [
          [x + 16, y - 226],
          [x + 20, y - 236],
        ],
        { weight: 0.5, color: "chalk" },
      ),
    );
  } else if (kind === "sign") {
    p.lines.push(
      poly(
        [
          [x - 1, y + 24],
          [x - 1, y - 150],
          [x + 5, y - 150],
          [x + 5, y + 24],
        ],
        { weight: 0.8 },
      ),
    );
    p.knock.push(
      flat(
        [
          [x - 1, y + 24],
          [x - 1, y - 150],
          [x + 5, y - 150],
          [x + 5, y + 24],
        ],
        4,
      ),
    );
    item(
      flat(
        [
          [x - 62, y - 254],
          [x + 70, y - 258],
          [x + 72, y - 156],
          [x - 60, y - 152],
        ],
        4,
      ),
      0.04,
      0.95,
    );
  } else if (kind === "flag") {
    p.lines.push(
      poly(
        [
          [x + 1, y + 10],
          [x + 1, y - 96],
          [x + 5, y - 96],
          [x + 5, y + 10],
        ],
        { weight: 0.75 },
      ),
    );
    item(
      area([
        [x + 5, y - 96],
        [x + 34, y - 100],
        [x + 64, y - 90],
        [x + 60, y - 62],
        [x + 32, y - 70],
        [x + 5, y - 64],
      ]),
      0.4,
      0.8,
    );
  } else if (kind === "magnifier") {
    p.lines.push(
      poly(
        [
          [x + 2, y - 4],
          [x + 24, y - 26],
          [x + 28, y - 22],
          [x + 6, y],
        ],
        { closed: true, weight: 0.8 },
      ),
    );
    item(ovalRing(x + 40, y - 38, 18, 18), 0.06, 0.95);
    p.lines.push(
      line(
        [
          [x + 30, y - 46],
          [x + 36, y - 52],
        ],
        { weight: 0.5 },
      ),
    );
  } else if (kind === "megaphone") {
    item(
      flat(
        [
          [x + 2, y - 10],
          [x + 62, y - 34],
          [x + 66, y + 22],
          [x + 2, y + 8],
        ],
        3,
      ),
      0.28,
      0.9,
    );
    p.lines.push({ pts: oval(x + 64, y - 6, 6, 28), weight: 0.75 });
    for (const k of [-1, 0, 1])
      p.lines.push(
        line(
          [
            [x + 80, y - 6 + k * 18],
            [x + 92, y - 8 + k * 26],
          ],
          { weight: 0.45 },
        ),
      );
  } else if (kind === "fishingrod") {
    p.lines.push(
      line(
        [
          [x - 6, y + 22],
          [x + 60, y - 70],
          [x + 150, y - 180],
        ],
        { weight: 0.75 },
      ),
    );
    p.lines.push(
      line(
        [
          [x + 150, y - 180],
          [x + 176, y - 60],
          [x + 184, y + 80],
        ],
        { weight: 0.35 },
      ),
    );
    item(ovalRing(x - 2, y + 16, 7, 7), 0.4, 0.7);
  } else if (kind === "scythe") {
    p.lines.push(
      poly(
        [
          [x - 2, y + 300],
          [x - 9, y - 228],
          [x - 3, y - 228],
          [x + 4, y + 300],
        ],
        { closed: true, weight: 0.85 },
      ),
    );
    p.knock.push(
      flat(
        [
          [x - 2, y + 300],
          [x - 9, y - 228],
          [x - 3, y - 228],
          [x + 4, y + 300],
        ],
        6,
      ),
    );
    item(
      area([
        [x - 8, y - 228],
        [x + 60, y - 262],
        [x + 140, y - 246],
        [x + 170, y - 206],
        [x + 120, y - 226],
        [x + 60, y - 232],
        [x - 4, y - 214],
      ]),
      0.36,
      0.9,
    );
  } else if (kind === "briefcase") {
    item(
      flat(
        [
          [x - 32, y + 18],
          [x + 34, y + 18],
          [x + 36, y + 70],
          [x - 34, y + 70],
        ],
        4,
      ),
      0.42,
      0.95,
    );
    p.lines.push(
      line(
        [
          [x - 10, y + 18],
          [x - 9, y + 8],
          [x + 10, y + 8],
          [x + 11, y + 18],
        ],
        { weight: 0.8 },
      ),
    );
    p.lines.push(segment([x - 33, y + 30], [x + 35, y + 30], { weight: 0.45 }));
    p.solids.push(
      flat(
        [
          [x - 3, y + 26],
          [x + 5, y + 26],
          [x + 5, y + 34],
          [x - 3, y + 34],
        ],
        2,
      ),
    );
  } else if (kind === "bag") {
    p.lines.push(
      line(
        [
          [x - 18, y + 26],
          [x - 10, y + 2],
          [x + 2, y - 2],
          [x + 10, y + 2],
          [x + 18, y + 26],
        ],
        { weight: 0.75 },
      ),
    );
    item(
      flat(
        [
          [x - 30, y + 24],
          [x + 30, y + 24],
          [x + 34, y + 92],
          [x - 34, y + 92],
        ],
        4,
      ),
      0.24,
      0.9,
    );
    p.lines.push(segment([x - 30, y + 36], [x + 30, y + 36], { weight: 0.4 }));
  } else if (kind === "lantern") {
    p.lines.push(
      line(
        [
          [x - 2, y + 4],
          [x - 12, y + 20],
          [x, y + 30],
          [x + 12, y + 20],
          [x + 2, y + 4],
        ],
        { weight: 0.75 },
      ),
    );
    item(
      flat(
        [
          [x - 18, y + 30],
          [x + 18, y + 30],
          [x + 22, y + 40],
          [x + 18, y + 88],
          [x - 18, y + 88],
          [x - 22, y + 40],
        ],
        3,
      ),
      0.06,
      0.85,
    );
    p.lines.push(segment([x - 22, y + 40], [x + 22, y + 40], { weight: 0.6 }), segment([x - 20, y + 96], [x + 20, y + 96], { weight: 0.8 }));
    p.lines.push(
      loop(
        [
          [x, y + 52],
          [x + 6, y + 66],
          [x, y + 74],
          [x - 6, y + 66],
        ],
        { weight: 0.5 },
      ),
    );
  } else if (kind === "umbrella") {
    const top = y + 12;
    p.lines.push(
      line(
        [
          [x + 3, y - 3],
          [x + 11, y - 8],
          [x + 18, y - 3],
          [x + 17, y + 6],
        ],
        { weight: 0.9 },
      ),
    );
    p.lines.push(
      line(
        [
          [x, top - 2],
          [x + 1, top + 18],
        ],
        { weight: 0.8 },
      ),
    );
    item(
      area([
        [x + 1, top + 16],
        [x + 10, top + 50],
        [x + 15, top + 120],
        [x + 14, top + 186],
        [x + 8, top + 190],
        [x + 2, top + 120],
        [x - 6, top + 50],
      ]),
      0.5,
      0.85,
    );
    p.lines.push(
      line(
        [
          [x + 1, top + 30],
          [x + 6, top + 110],
          [x + 10, top + 180],
        ],
        { weight: 0.4 },
      ),
      line(
        [
          [x - 3, top + 70],
          [x + 11, top + 78],
        ],
        { weight: 0.5 },
      ),
    );
    p.lines.push(
      line(
        [
          [x + 11, top + 188],
          [x + 13, top + 222],
        ],
        { weight: 0.8 },
      ),
    );
  } else if (kind === "cane") {
    p.lines.push(
      line(
        [
          [x - 2, y + 6],
          [x - 4, y - 6],
          [x + 8, y - 14],
          [x + 20, y - 8],
          [x + 20, y + 4],
        ],
        { weight: 1.1 },
      ),
    );
    p.lines.push(
      poly(
        [
          [x - 3, y + 6],
          [x + 6, y + 240],
          [x + 11, y + 240],
          [x + 3, y + 6],
        ],
        { closed: true, weight: 0.85 },
      ),
    );
    p.knock.push(
      flat(
        [
          [x - 3, y + 6],
          [x + 6, y + 240],
          [x + 11, y + 240],
          [x + 3, y + 6],
        ],
        6,
      ),
    );
  } else if (kind === "whitecane") {
    const tip = [x + 58, y + 238];
    const len = Math.hypot(tip[0] - x, tip[1] - y + 14);
    const ux = (tip[0] - x) / len;
    const uy = (tip[1] - y + 14) / len;
    const at = (t, side) => [x + ux * t - uy * side, y - 14 + uy * t + ux * side];
    const band = (from, to, w) => [at(from, -w), at(to, -w), at(to, w), at(from, w)];
    const shaft = band(0, len, 4);
    p.lines.push(poly(shaft, { closed: true, weight: 0.6 }));
    p.knock.push(flat(shaft, 6));
    p.solids.push(flat(band(0, 30, 4.4), 4));
    const red = flat(band(len - 72, len + 1, 6), 4);
    p.washes.push({ rings: [red], tone: 0.72 });
    p.lines.push(segment(at(len - 72, -4), at(len - 72, 4), { weight: 0.55 }));
    p.solids.push(dot(tip[0], tip[1], 3.4));
  } else if (kind === "crutch") {
    const tube = [
      [x - 1, y - 58],
      [x + 6, y - 58],
      [x + 9, y + 228],
      [x + 2, y + 228],
    ];
    p.lines.push(poly(tube, { closed: true, weight: 0.8 }));
    p.washes.push({ rings: [flat(tube, 6)], tone: 0.34 });
    p.knock.push(flat(tube, 6));
    p.solids.push(
      flat(
        [
          [x, y + 226],
          [x + 11, y + 226],
          [x + 12, y + 238],
          [x - 1, y + 238],
        ],
        3,
      ),
    );
    const grip = [
      [x - 10, y - 4],
      [x + 22, y - 6],
      [x + 22, y + 4],
      [x - 10, y + 5],
    ];
    p.lines.push(poly(grip, { closed: true, weight: 0.85 }));
    p.washes.push({ rings: [flat(grip, 4)], tone: 0.62 });
    p.lines.push({ pts: oval(x + 2, y - 60, 14, 8, { start: 0.2, sweep: 4.9 }), weight: 1.1 });
  }
  if (grip && !HANG.has(kind)) fist(p, x, y);
}

function jaw(contour, x) {
  let best = null;
  for (const p of contour) if (p.y > 0 && Math.abs(p.x - x) < 2.5 && (!best || p.y > best.y)) best = p;
  return best ? best.y : 40;
}

function neck(b, head, contour, length = 22) {
  const bottom = head.pts.reduce((m, p) => Math.max(m, p[1]), 0);
  const end = bottom + length;
  const a = jaw(contour, -17) - 1.5;
  const c = jaw(contour, 11) - 1.5;
  b.lines.push(
    line(
      [
        [-17, a],
        [-16.5, (a + end) / 2],
        [-16, end],
      ],
      { weight: 0.95 },
    ),
  );
  b.lines.push(
    line(
      [
        [11, c],
        [11.5, (c + end) / 2],
        [11, end],
      ],
      { weight: 0.95 },
    ),
  );
  const throat = [
    { x: -17, y: a - 4 },
    { x: 11, y: c - 4 },
    { x: 11, y: end },
    { x: -16, y: end },
  ];
  b.knock.push(throat);
  b.washes.unshift({ rings: [throat], tone: 0, role: "skin" });
  return end;
}

function silhouette(spec, top, hem) {
  const sh = top + 6;
  const curvy = spec.sex === "woman" && ageOf(spec) !== "kid";
  const back = curvy
    ? [
        [-15, top - 2],
        [-44, sh + 2],
        [-56, sh + 22],
        [-56, sh + 58],
        [-50, sh + 90],
        [-60, hem],
      ]
    : [
        [-16, top - 2],
        [-46, sh + 2],
        [-60, sh + 22],
        [-64, sh + 70],
        [-62, hem],
      ];
  const front = curvy
    ? [
        [11, top - 2],
        [38, sh + 1],
        [51, sh + 22],
        [54, sh + 46],
        [48, sh + 72],
        [46, sh + 90],
        [56, hem],
      ]
    : [
        [12, top - 2],
        [40, sh],
        [54, sh + 22],
        [60, sh + 74],
        [56, hem],
      ];
  const bottom = [
    [-30, hem + 4],
    [0, hem + 5],
    [30, hem + 4],
  ];
  const edge = (side, y) => {
    const pts = side < 0 ? back : front;
    for (let i = 1; i < pts.length; i++) {
      if (y <= pts[i][1]) {
        const t = (y - pts[i - 1][1]) / (pts[i][1] - pts[i - 1][1] || 1);
        return pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * Math.max(0, Math.min(1, t));
      }
    }
    return pts[pts.length - 1][0];
  };
  return { back, front, bottom, sh, edge, ring: area(back.concat(bottom, front.slice().reverse())) };
}

function robotChassis(b, spec, top, hem) {
  const sh = top + 6;
  const style = spec.chassis || "boxy";
  let ring;
  if (style === "round") {
    const ry = (hem - top - 8) / 2;
    const cy = top - 2 + ry;
    const rx = 62;
    const belly = [];
    for (let deg = 160; deg <= 380; deg += 20) {
      const a = (deg * Math.PI) / 180;
      belly.push([-2 + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    const pts = [[-58, hem + 3], [-61, hem - 18], ...belly, [57, hem - 18], [54, hem + 3]];
    ring = area(pts);
    b.lines.push(line(pts, { weight: 1.05 }));
    b.lines.push(
      line(
        [
          [-60, hem - 12],
          [-2, hem - 4],
          [56, hem - 12],
        ],
        { weight: 0.6 },
      ),
    );
    for (const x of [-34, -2, 30]) b.solids.push(dot(x, hem - (x === -2 ? 0 : 3), 1.6));
    const gauge = { x: -2, y: cy - ry * 0.12, r: 15 };
    b.lines.push({ pts: oval(gauge.x, gauge.y, gauge.r, gauge.r, { start: -1.6 }), weight: 0.75 });
    b.washes.push({ rings: [ovalRing(gauge.x, gauge.y, gauge.r, gauge.r)], paper: true });
    b.lines.push({ pts: oval(gauge.x, gauge.y, gauge.r - 5, gauge.r - 5, { start: Math.PI * 1.15, sweep: Math.PI * 0.7 }), weight: 0.45 });
    b.lines.push(segment([gauge.x, gauge.y], [gauge.x + 7, gauge.y - 6], { weight: 1.1 }));
    b.solids.push(dot(gauge.x, gauge.y, 2));
  } else if (style === "barrel") {
    const mid = (sh + hem) / 2;
    const pts = [
      [-48, top - 2],
      [-60, sh + 20],
      [-66, mid],
      [-62, hem - 10],
      [-48, hem + 4],
      [44, hem + 4],
      [58, hem - 10],
      [62, mid],
      [56, sh + 20],
      [44, top - 2],
    ];
    ring = area(pts);
    b.lines.push(loop(pts, { weight: 1.05 }));
    for (const y of [sh + 22, mid, hem - 22])
      b.lines.push(
        line(
          [
            [-62, y - 4],
            [-2, y + 4],
            [58, y - 4],
          ],
          { weight: 0.6 },
        ),
      );
    for (let x = -30; x <= 22; x += 10) b.lines.push(segment([x, sh + 36], [x, sh + 60], { weight: 0.45 }));
    b.solids.push(dot(-40, mid + 18, 3), dot(-28, mid + 18, 3));
  } else {
    const pts = [
      [-52, top - 2],
      [48, top - 2],
      [56, top + 8],
      [56, hem - 6],
      [48, hem + 2],
      [-52, hem + 2],
      [-60, hem - 6],
      [-60, top + 8],
    ];
    ring = flat(pts, 3);
    b.lines.push(poly(pts, { closed: true, weight: 1.05 }));
    const panel = [
      [-30, top + 28],
      [26, top + 28],
      [26, top + 82],
      [-30, top + 82],
    ];
    b.lines.push(poly(panel, { closed: true, weight: 0.75 }));
    b.washes.push({ rings: [flat(panel, 3)], tone: 0.08 });
    b.lines.push({ pts: oval(-14, top + 50, 9, 9), weight: 0.7 }, segment([-14, top + 50], [-8, top + 44], { weight: 0.7 }));
    for (const [x, k] of [
      [8, 1],
      [16, 1],
      [8, 0.8],
      [16, 0.8],
    ])
      b.solids.push(dot(x, k === 1 ? top + 44 : top + 56, 2.6));
    b.lines.push(segment([-22, top + 72], [18, top + 72], { weight: 0.5 }), segment([-4, top + 68], [-4, top + 76], { weight: 1.2 }));
    for (const [x, y] of [
      [-54, top + 4],
      [50, top + 4],
      [-54, hem - 4],
      [50, hem - 4],
    ])
      b.solids.push(dot(x, y, 1.6));
  }
  b.washes.push({ rings: [ring], tone: 0.2, role: "skin" });
  b.knock.push(ring);
  return { hem };
}

function digits(b, text, x, y, h) {
  let cx = x;
  for (const ch of text) {
    if (ch === "1")
      b.lines.push(
        line(
          [
            [cx + h * 0.15, y + h * 0.2],
            [cx + h * 0.35, y],
            [cx + h * 0.35, y + h],
          ],
          { weight: 1.5 },
        ),
      );
    else if (ch === "0") b.lines.push({ pts: oval(cx + h * 0.3, y + h / 2, h * 0.27, h * 0.5, { start: -1.6 }), weight: 1.4 });
    else if (ch === "7")
      b.lines.push(
        line(
          [
            [cx, y],
            [cx + h * 0.55, y],
            [cx + h * 0.2, y + h],
          ],
          { weight: 1.5 },
        ),
      );
    cx += h * 0.62;
  }
}

function torso(b, spec, top, { hem, sitting = false, leg = 210, headRing = null }) {
  if (kindOf(spec) === "robot") return robotChassis(b, spec, top, hem);
  const o = spec.outfit || "suit";
  const st = styleOf(spec);
  const role = roleOf(st);
  const S = silhouette(spec, top, hem);
  const sh = S.sh;
  const wash = (ring, tone, r = role) => tone && b.washes.push({ rings: [ring], tone, role: r });

  if (o === "dress" || st.robe) {
    const waist = sh + 92;
    const skirt = sitting ? hem : hem + (st.robe ? Math.round(leg * 0.9) : 70);
    const flare = st.robe ? 76 : 70;
    const left = [
      [-16, top - 2],
      [-42, sh + 2],
      [-52, sh + 22],
      [-46, waist],
      [-flare, skirt],
    ];
    const right = [
      [12, top - 2],
      [36, sh],
      [46, sh + 22],
      [42, waist],
      [flare - 4, skirt],
    ];
    b.lines.push(line(left), line(right));
    b.lines.push(
      line(
        [
          [-flare, skirt],
          [-36, skirt + 5],
          [0, skirt + 2],
          [34, skirt + 6],
          [flare - 4, skirt],
        ],
        { weight: 0.95 },
      ),
    );
    b.lines.push(
      line(
        st.robe
          ? [
              [-14, top + 2],
              [-2, top + 26],
              [12, top + 2],
            ]
          : [
              [-14, top + 2],
              [-2, top + 16],
              [12, top + 2],
            ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [-45, waist],
          [-2, waist + 4],
          [41, waist],
        ],
        { weight: st.robe ? 0.9 : 0.6 },
      ),
    );
    if (st.robe)
      b.lines.push(
        line(
          [
            [-6, waist + 4],
            [-10, waist + 40],
            [-4, waist + 64],
          ],
          { weight: 0.6 },
        ),
        line(
          [
            [0, waist + 4],
            [4, waist + 46],
          ],
          { weight: 0.6 },
        ),
      );
    const ring = area([
      [-16, top - 2],
      [-52, sh + 22],
      [-46, waist],
      [-flare, skirt],
      [0, skirt + 4],
      [flare - 4, skirt],
      [42, waist],
      [46, sh + 22],
      [12, top - 2],
    ]);
    wash(ring, st.robe ? st.sleeve : 0.2);
    b.knock.push(ring);
    return { hem: skirt, skirt: true };
  }

  if (o === "pumpkin") {
    const cy = (top + hem) / 2 + 8;
    const ry = (hem - top) / 2 + 12;
    const ring = ovalRing(-2, cy, 74, ry);
    b.lines.push({ pts: oval(-2, cy, 74, ry, { start: -2.2 }), weight: 1.05 });
    for (const k of [-0.62, -0.28, 0.06, 0.4])
      b.lines.push(
        line(
          [
            [-2 + k * 74, top + 4],
            [-2 + k * 100, cy],
            [-2 + k * 74, cy + ry - 4],
          ],
          { weight: 0.5 },
        ),
      );
    b.lines.push(
      line(
        [
          [-6, top],
          [-4, top - 10],
          [4, top - 16],
        ],
        { weight: 0.9 },
      ),
    );
    b.solids.push(
      area([
        [-28, cy - 26],
        [-14, cy - 42],
        [-4, cy - 26],
      ]),
      area([
        [8, cy - 26],
        [20, cy - 42],
        [30, cy - 26],
      ]),
    );
    b.solids.push(
      area([
        [-34, cy + 4],
        [-22, cy + 12],
        [-12, cy + 4],
        [0, cy + 12],
        [12, cy + 4],
        [24, cy + 12],
        [34, cy + 2],
        [20, cy + 26],
        [-20, cy + 26],
      ]),
    );
    wash(ring, 0.38);
    b.knock.push(ring);
    return { hem: cy + ry - 8 };
  }

  b.lines.push(line(S.back), line(S.front));
  b.lines.push(line([S.back[S.back.length - 1], ...S.bottom, S.front[S.front.length - 1]], { weight: 0.95 }));
  b.knock.push(S.ring);
  const notch = [
    [-22, top + 4],
    [18, top + 2],
    [12, top + 30],
    [2, top + 48],
    [-14, top + 30],
  ];
  const jacket = area([notch[0], ...S.back.slice(1), ...S.bottom, ...S.front.slice(1).reverse(), notch[1], notch[2], notch[3], notch[4]]);
  const collar = () =>
    b.lines.push(
      line(
        [
          [-15, top + 1],
          [-2, top + 7],
          [11, top + 1],
        ],
        { weight: 0.8 },
      ),
    );
  const ribs = (y, step = 9, len = 9) => {
    for (let x = S.edge(-1, y) + 4; x <= S.edge(1, y) - 4; x += step) b.lines.push(segment([x, y - len], [x + 0.6, y + 2], { weight: 0.4 }));
  };
  let cover = null;

  if (o === "suit" || o === "tuxedo" || o === "vampire") {
    b.lines.push(
      line(
        [
          [-16, top],
          [-6, top + 24],
          [-2, top + 46],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [12, top],
          [6, top + 24],
          [2, top + 46],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [-22, top + 4],
          [-14, top + 30],
          [-1, top + 48],
        ],
        { weight: 0.85 },
      ),
    );
    b.lines.push(
      line(
        [
          [18, top + 2],
          [12, top + 30],
          [2, top + 48],
        ],
        { weight: 0.85 },
      ),
    );
    b.lines.push(
      line(
        [
          [2, top + 48],
          [3, (top + 48 + hem) / 2],
          [4, hem + 4],
        ],
        { weight: 0.8 },
      ),
    );
    if (o === "suit") {
      b.solids.push(
        area([
          [-3.5, top + 9],
          [3, top + 9],
          [2, top + 15],
          [4, top + 42],
          [0, top + 48],
          [-4, top + 42],
          [-2, top + 15],
        ]),
      );
      b.solids.push(dot(7, top + 70, 1.6), dot(7.5, top + 90, 1.6));
    } else {
      b.solids.push(
        area([
          [-1, top + 12],
          [-12, top + 6],
          [-13, top + 18],
        ]),
        area([
          [-1, top + 12],
          [10, top + 6],
          [11, top + 18],
        ]),
        dot(-1, top + 12, 2.6),
      );
      for (const y of [top + 24, top + 34, top + 44]) b.solids.push(dot(-1, y, 1.3));
      b.solids.push(dot(7, top + 80, 1.8));
    }
    wash(jacket, st.sleeve);
  } else if (o === "vest") {
    b.lines.push(
      line(
        [
          [-16, top],
          [-8, top + 8],
        ],
        { weight: 0.75 },
      ),
      line(
        [
          [12, top],
          [4, top + 8],
        ],
        { weight: 0.75 },
      ),
    );
    b.solids.push(
      area([
        [-3.5, top + 9],
        [3, top + 9],
        [2, top + 15],
        [3, top + 40],
        [0, top + 45],
        [-3, top + 40],
        [-2, top + 15],
      ]),
    );
    const f14 = S.edge(1, sh + 14) - 14;
    const f72 = S.edge(1, sh + 72) - 10;
    const b14 = S.edge(-1, sh + 14) + 16;
    const b72 = S.edge(-1, sh + 72) + 8;
    const vest = [
      [-20, top + 6],
      [-2, top + 66],
      [16, top + 4],
      [f14, sh + 14],
      [f72, sh + 72],
      [S.edge(1, hem - 2) - 2, hem - 2],
      [S.edge(-1, hem - 2) + 2, hem - 2],
      [b72, sh + 72],
      [b14, sh + 14],
    ];
    b.lines.push(
      line(
        [
          [-20, top + 6],
          [-2, top + 66],
          [16, top + 4],
        ],
        { weight: 0.85 },
      ),
    );
    b.lines.push(
      line(
        [
          [b14, sh + 14],
          [b14 - 6, sh + 46],
          [b72, sh + 72],
        ],
        { weight: 0.75 },
      ),
      line(
        [
          [f14, sh + 14],
          [f14 + 6, sh + 46],
          [f72, sh + 72],
        ],
        { weight: 0.75 },
      ),
    );
    ribs(hem - 2, 8, 10);
    wash(area(vest), 0.34);
  } else if (o === "hoodie") {
    const outer = [
      [-38, top + 10],
      [-34, top - 6],
      [-18, top - 14],
      [4, top - 15],
      [22, top - 9],
      [32, top + 8],
    ];
    const inner = [
      [20, top + 6],
      [12, top - 2],
      [-2, top - 4],
      [-16, top - 2],
      [-26, top + 8],
    ];
    const hoodLines = [
      line(outer, { weight: 0.9 }),
      line(inner, { weight: 0.6 }),
      line(
        [
          [-30, top + 2],
          [-22, top - 4],
        ],
        { weight: 0.4 },
      ),
      line(
        [
          [26, top + 1],
          [18, top - 4],
        ],
        { weight: 0.4 },
      ),
    ];
    b.lines.push(...(headRing ? hideUnder(hoodLines, [headRing]) : hoodLines));
    wash(area(outer.concat(inner)), 0.42);
    b.lines.push(
      line(
        [
          [-14, top + 2],
          [-2, top + 10],
          [11, top + 2],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [-4, top + 9],
          [-6, top + 30],
          [-4, top + 44],
        ],
        { weight: 0.5 },
      ),
      line(
        [
          [4, top + 8],
          [6, top + 30],
          [5, top + 40],
        ],
        { weight: 0.5 },
      ),
    );
    b.solids.push(dot(-4, top + 46, 1.6), dot(5, top + 42, 1.6));
    const pocket = [
      [-30, hem - 52],
      [26, hem - 52],
      [36, hem - 16],
      [-40, hem - 16],
    ];
    b.lines.push(poly(pocket, { closed: true, weight: 0.7 }));
    b.lines.push(
      line(
        [
          [S.edge(-1, hem - 12), hem - 12],
          [-2, hem - 10],
          [S.edge(1, hem - 12), hem - 12],
        ],
        { weight: 0.6 },
      ),
    );
    wash(S.ring, st.sleeve);
  } else if (o === "jersey") {
    b.lines.push(
      line(
        [
          [-16, top + 1],
          [-2, top + 20],
          [11, top + 1],
        ],
        { weight: 0.85 },
      ),
      line(
        [
          [-11, top + 1],
          [-2, top + 14],
          [7, top + 1],
        ],
        { weight: 0.5 },
      ),
    );
    digits(b, "10", -26, top + 46, 34);
    for (const y of [hem - 18, hem - 12])
      b.lines.push(
        line(
          [
            [S.edge(-1, y) + 2, y],
            [-2, y + 2],
            [S.edge(1, y) - 2, y],
          ],
          { weight: 0.5 },
        ),
      );
    wash(S.ring, st.sleeve);
  } else if (o === "labcoat") {
    const drop = sitting ? 16 : Math.round(leg * 0.42);
    const low = hem + drop;
    const left = [S.back[S.back.length - 1], [-68, low]];
    const right = [S.front[S.front.length - 1], [62, low]];
    b.lines.push(
      line(left),
      line(right),
      line(
        [
          [-68, low],
          [-30, low + 4],
          [0, low + 3],
          [30, low + 4],
          [62, low],
        ],
        { weight: 0.9 },
      ),
    );
    b.lines.push(
      line(
        [
          [-16, top],
          [-6, top + 24],
          [-2, top + 46],
        ],
        { weight: 0.8 },
      ),
      line(
        [
          [12, top],
          [6, top + 24],
          [2, top + 46],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [-22, top + 4],
          [-14, top + 30],
          [-1, top + 48],
        ],
        { weight: 0.85 },
      ),
      line(
        [
          [18, top + 2],
          [12, top + 30],
          [2, top + 48],
        ],
        { weight: 0.85 },
      ),
    );
    b.lines.push(
      line(
        [
          [2, top + 48],
          [3, (top + low) / 2],
          [4, low + 3],
        ],
        { weight: 0.8 },
      ),
    );
    b.solids.push(
      area([
        [-3.5, top + 9],
        [3, top + 9],
        [2, top + 15],
        [4, top + 42],
        [0, top + 48],
        [-4, top + 42],
        [-2, top + 15],
      ]),
    );
    b.lines.push(
      poly(
        [
          [22, top + 40],
          [42, top + 38],
          [43, top + 56],
          [23, top + 58],
        ],
        { closed: true, weight: 0.6 },
      ),
      segment([30, top + 30], [30, top + 48], { weight: 0.8 }),
    );
    for (const x of [-52, 20])
      b.lines.push(
        poly(
          [
            [x, hem + 6],
            [x + 26, hem + 6],
            [x + 26, hem + 34],
            [x, hem + 34],
          ],
          { closed: true, weight: 0.55 },
        ),
      );
    cover = area([S.back[S.back.length - 1], [-68, low], [0, low + 3], [62, low], S.front[S.front.length - 1]]);
    b.knock.push(cover);
  } else if (o === "overalls") {
    const bib = [
      [-30, top + 46],
      [26, top + 46],
      [28, sh + 92],
      [S.edge(1, sh + 92) - 1, sh + 92],
      [S.edge(1, hem), hem],
      ...S.bottom.slice().reverse(),
      [S.edge(-1, hem), hem],
      [S.edge(-1, sh + 92) + 1, sh + 92],
      [-32, sh + 92],
    ];
    b.lines.push(
      poly(
        [
          [-30, top + 46],
          [26, top + 46],
          [28, sh + 92],
        ],
        { weight: 0.8 },
      ),
      line(
        [
          [-32, sh + 92],
          [-30, top + 46],
        ],
        { weight: 0.8 },
      ),
      line(
        [
          [S.edge(-1, sh + 92), sh + 92],
          [-2, sh + 94],
          [S.edge(1, sh + 92), sh + 92],
        ],
        { weight: 0.7 },
      ),
    );
    b.lines.push(
      line(
        [
          [-30, top + 46],
          [-36, top + 18],
          [-40, top + 2],
        ],
        { weight: 0.8 },
      ),
      line(
        [
          [26, top + 46],
          [30, top + 18],
          [32, top + 2],
        ],
        { weight: 0.8 },
      ),
    );
    b.solids.push(dot(-26, top + 50, 2.4), dot(22, top + 50, 2.4));
    b.lines.push(
      poly(
        [
          [-14, top + 58],
          [10, top + 58],
          [10, top + 76],
          [-14, top + 76],
        ],
        { closed: true, weight: 0.55 },
      ),
    );
    collar();
    wash(S.ring, 0.06);
    wash(area(bib), st.trousers);
  } else if (o === "skeleton") {
    collar();
    wash(S.ring, st.sleeve);
    b.lines.push(
      line(
        [
          [-2, top + 10],
          [-1, (top + hem) / 2],
          [-2, hem - 14],
        ],
        { weight: 1.3, color: "chalk" },
      ),
    );
    for (let k = 0; k < 4; k++) {
      const y = top + 24 + k * 15;
      b.lines.push(
        line(
          [
            [-2, y],
            [-24, y + 2],
            [-40, y + 12],
          ],
          { weight: 1, color: "chalk" },
        ),
        line(
          [
            [-2, y],
            [18, y + 2],
            [34, y + 12],
          ],
          { weight: 1, color: "chalk" },
        ),
      );
    }
    b.lines.push(
      loop(
        [
          [-28, hem - 30],
          [-2, hem - 36],
          [24, hem - 30],
          [16, hem - 8],
          [-2, hem - 14],
          [-20, hem - 8],
        ],
        { weight: 1, color: "chalk" },
      ),
    );
  } else if (o === "superhero") {
    wash(S.ring, st.sleeve);
    const c = { x: -2, y: top + 46 };
    const badge = [
      [c.x, c.y - 20],
      [c.x + 22, c.y - 6],
      [c.x, c.y + 22],
      [c.x - 22, c.y - 6],
    ];
    b.lines.push(poly(badge, { closed: true, weight: 0.85 }));
    b.washes.push({ rings: [flat(badge, 3)], paper: true });
    b.lines.push(
      poly(
        [
          [c.x + 4, c.y - 14],
          [c.x - 6, c.y + 2],
          [c.x + 2, c.y + 2],
          [c.x - 4, c.y + 16],
        ],
        { weight: 1.1 },
      ),
    );
    for (const y of [hem - 22, hem - 10])
      b.lines.push(
        line(
          [
            [S.edge(-1, y), y],
            [-2, y + 2],
            [S.edge(1, y), y],
          ],
          { weight: 0.75 },
        ),
      );
    b.lines.push(
      poly(
        [
          [-10, hem - 22],
          [6, hem - 22],
          [6, hem - 10],
          [-10, hem - 10],
        ],
        { closed: true, weight: 0.7 },
      ),
    );
  } else if (o === "pirate") {
    collar();
    wash(S.ring, st.sleeve);
    for (let y = sh + 24; y < hem - 28; y += 16)
      wash(
        flat(
          [
            [S.edge(-1, y) + 3, y],
            [S.edge(1, y) - 3, y],
            [S.edge(1, y + 7) - 3, y + 7],
            [S.edge(-1, y + 7) + 3, y + 7],
          ],
          3,
        ),
        0.34,
      );
    for (const side of [-1, 1]) {
      const x0 = S.edge(side, sh + 10);
      const panel =
        side < 0
          ? [
              [-16, top],
              [x0, sh + 10],
              [S.edge(-1, hem), hem],
              [-30, hem + 2],
              [-20, top + 40],
            ]
          : [
              [12, top],
              [x0, sh + 10],
              [S.edge(1, hem), hem],
              [26, hem + 2],
              [16, top + 40],
            ];
      b.lines.push(poly(panel.slice(2).concat([panel[0]]), { weight: 0.8 }));
      wash(area(panel), 0.62);
    }
    const sash = [
      [S.edge(-1, hem - 30), hem - 30],
      [S.edge(1, hem - 30), hem - 30],
      [S.edge(1, hem - 14), hem - 14],
      [S.edge(-1, hem - 14), hem - 14],
    ];
    b.lines.push(
      poly(sash, { closed: true, weight: 0.75 }),
      line(
        [
          [30, hem - 16],
          [40, hem + 18],
          [32, hem + 30],
        ],
        { weight: 0.7 },
      ),
    );
    wash(flat(sash, 3), 0.5);
  } else if (o === "mummy") {
    wash(S.ring, st.sleeve);
    for (let y = top + 10, k = 0; y < hem - 4; y += 13, k++)
      b.lines.push(
        line(
          [
            [S.edge(-1, y) + 1, y + (k % 2 ? 6 : 0)],
            [-2, y + 4],
            [S.edge(1, y + 8) - 1, y + (k % 2 ? 0 : 8)],
          ],
          { weight: 0.45 },
        ),
      );
    b.lines.push(
      line(
        [
          [S.edge(1, hem - 20), hem - 20],
          [S.edge(1, hem - 20) + 18, hem - 4],
          [S.edge(1, hem - 20) + 14, hem + 16],
        ],
        { weight: 0.55 },
      ),
    );
  } else if (o === "astronaut") {
    wash(S.ring, st.sleeve);
    const box = [
      [-24, top + 30],
      [18, top + 30],
      [18, top + 66],
      [-24, top + 66],
    ];
    b.lines.push(poly(box, { closed: true, weight: 0.8 }));
    wash(flat(box, 3), 0.36, "outfit");
    for (const [x, y] of [
      [-14, top + 40],
      [-4, top + 40],
      [8, top + 40],
    ])
      b.lines.push({ pts: oval(x, y, 3, 3), weight: 0.6, color: "chalk" });
    b.lines.push(segment([-16, top + 54], [10, top + 54], { weight: 0.7, color: "chalk" }));
    b.lines.push(
      line(
        [
          [S.edge(-1, hem - 16), hem - 16],
          [-2, hem - 14],
          [S.edge(1, hem - 16), hem - 16],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [-24, top + 60],
          [-40, top + 80],
          [-54, top + 70],
        ],
        { weight: 0.6 },
      ),
    );
    b.lines.push(
      line(
        [
          [-34, top + 2],
          [-2, top + 12],
          [28, top + 2],
        ],
        { weight: 1 },
      ),
    );
  } else if (o === "bare") {
    wash(S.ring, st.sleeve, "skin");
    if (kindOf(spec) === "animal") {
      const belly = ovalRing(-4, (top + hem) / 2 + 14, 30, (hem - top) / 2 - 12);
      b.washes.push({ rings: [belly], paper: true });
      b.lines.push({ pts: oval(-4, (top + hem) / 2 + 14, 30, (hem - top) / 2 - 12, { start: 0.3, sweep: Math.PI * 1.3 }), weight: 0.45 });
    }
  } else if (o === "tshirt") {
    b.lines.push(
      {
        pts: spline([
          [-15, top + 1],
          [-2, top + 9],
          [11, top + 1],
        ]),
        weight: 0.85,
      },
      {
        pts: spline([
          [-13, top + 4],
          [-2, top + 12],
          [9, top + 4],
        ]),
        weight: 0.45,
      },
    );
    wash(S.ring, st.sleeve);
  } else {
    collar();
    ribs(hem, 9, 9);
    wash(S.ring, st.sleeve);
  }
  return { hem, cover };
}

function bust(b, spec, top) {
  const sh = top + 6;
  if (kindOf(spec) === "robot") {
    const pts = [
      [-52, top - 2],
      [48, top - 2],
      [56, top + 8],
      [60, sh + 60],
      [-64, sh + 60],
      [-60, top + 8],
    ];
    b.lines.push(poly(pts.slice(3).concat(pts.slice(0, 3)), { weight: 1.05 }));
    b.washes.push({ rings: [flat(pts, 3)], tone: 0.2, role: "skin" });
    b.lines.push(
      poly(
        [
          [-26, top + 24],
          [22, top + 24],
          [22, sh + 60],
        ],
        { weight: 0.7 },
      ),
      segment([-26, top + 24], [-26, sh + 60], { weight: 0.7 }),
    );
    b.solids.push(dot(-12, top + 36, 2.6), dot(0, top + 36, 2.6), dot(12, top + 36, 2.6));
    b.knock.push(flat(pts, 3));
    return;
  }
  const o = spec.outfit || "suit";
  const st = styleOf(spec);
  b.lines.push(
    line([
      [-16, top - 2],
      [-46, sh + 2],
      [-60, sh + 22],
      [-66, sh + 60],
    ]),
  );
  b.lines.push(
    line([
      [12, top - 2],
      [40, sh],
      [54, sh + 22],
      [60, sh + 60],
    ]),
  );
  const full = area([
    [-16, top],
    [-46, sh + 2],
    [-66, sh + 60],
    [60, sh + 60],
    [40, sh],
    [12, top],
  ]);
  if (o === "suit" || o === "tuxedo" || o === "vampire" || o === "labcoat") {
    b.lines.push(
      line(
        [
          [-16, top],
          [-6, top + 24],
          [-2, top + 46],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [12, top],
          [6, top + 24],
          [2, top + 46],
        ],
        { weight: 0.8 },
      ),
    );
    b.lines.push(
      line(
        [
          [-22, top + 4],
          [-14, top + 30],
          [-1, top + 50],
        ],
        { weight: 0.85 },
      ),
    );
    b.lines.push(
      line(
        [
          [18, top + 2],
          [12, top + 30],
          [2, top + 50],
        ],
        { weight: 0.85 },
      ),
    );
    if (o === "tuxedo" || o === "vampire")
      b.solids.push(
        area([
          [-1, top + 12],
          [-12, top + 6],
          [-13, top + 18],
        ]),
        area([
          [-1, top + 12],
          [10, top + 6],
          [11, top + 18],
        ]),
        dot(-1, top + 12, 2.6),
      );
    else
      b.solids.push(
        area([
          [-3.5, top + 9],
          [3, top + 9],
          [2, top + 15],
          [4, top + 42],
          [0, top + 48],
          [-4, top + 42],
          [-2, top + 15],
        ]),
      );
    if (st.sleeve)
      b.washes.push({
        rings: [
          area([
            [-22, top + 4],
            [-46, sh + 2],
            [-66, sh + 60],
            [60, sh + 60],
            [40, sh],
            [18, top + 2],
            [12, top + 30],
            [2, top + 50],
            [-14, top + 30],
          ]),
        ],
        tone: st.sleeve,
        role: "outfit",
      });
  } else if (o === "vest") {
    b.lines.push(
      line(
        [
          [-20, top + 6],
          [-2, top + 60],
          [16, top + 4],
        ],
        { weight: 0.85 },
      ),
    );
    b.solids.push(
      area([
        [-3.5, top + 9],
        [3, top + 9],
        [2, top + 15],
        [3, top + 40],
        [0, top + 45],
        [-3, top + 40],
        [-2, top + 15],
      ]),
    );
    b.washes.push({
      rings: [
        area([
          [-20, top + 6],
          [-2, top + 60],
          [16, top + 4],
          [40, sh + 14],
          [50, sh + 60],
          [-56, sh + 60],
          [-44, sh + 14],
        ]),
      ],
      tone: 0.34,
      role: "outfit",
    });
  } else if (o === "dress" || st.robe) {
    b.lines.push(
      line(
        st.robe
          ? [
              [-14, top + 2],
              [-2, top + 26],
              [12, top + 2],
            ]
          : [
              [-14, top + 2],
              [-2, top + 16],
              [12, top + 2],
            ],
        { weight: 0.8 },
      ),
    );
    b.washes.push({ rings: [full], tone: st.robe ? st.sleeve : 0.2, role: "outfit" });
  } else if (o === "jersey") {
    b.lines.push(
      line(
        [
          [-16, top + 1],
          [-2, top + 20],
          [11, top + 1],
        ],
        { weight: 0.85 },
      ),
    );
    digits(b, "10", -22, top + 34, 26);
    b.washes.push({ rings: [full], tone: st.sleeve, role: "outfit" });
  } else if (o === "hoodie") {
    b.lines.push(
      line(
        [
          [-14, top + 2],
          [-2, top + 10],
          [11, top + 2],
        ],
        { weight: 0.8 },
      ),
      line(
        [
          [-4, top + 9],
          [-6, top + 34],
        ],
        { weight: 0.5 },
      ),
      line(
        [
          [4, top + 8],
          [6, top + 30],
        ],
        { weight: 0.5 },
      ),
    );
    b.washes.push({ rings: [full], tone: st.sleeve, role: "outfit" });
  } else if (o === "skeleton") {
    b.washes.push({ rings: [full], tone: st.sleeve, role: "outfit" });
    b.lines.push(
      line(
        [
          [-2, top + 10],
          [-2, sh + 58],
        ],
        { weight: 1.2, color: "chalk" },
      ),
    );
    for (let k = 0; k < 3; k++)
      b.lines.push(
        line(
          [
            [-2, top + 22 + k * 14],
            [-26, top + 26 + k * 14],
            [-42, top + 34 + k * 14],
          ],
          { weight: 1, color: "chalk" },
        ),
        line(
          [
            [-2, top + 22 + k * 14],
            [20, top + 26 + k * 14],
            [36, top + 34 + k * 14],
          ],
          { weight: 1, color: "chalk" },
        ),
      );
  } else {
    b.lines.push(
      line(
        [
          [-15, top + 1],
          [-2, top + 7],
          [11, top + 1],
        ],
        { weight: 0.8 },
      ),
    );
    b.washes.push({ rings: [full], tone: st.sleeve, role: roleOf(st) });
  }
  b.knock.push(
    area([
      [-16, top - 2],
      [-46, sh + 2],
      [-66, sh + 62],
      [60, sh + 62],
      [40, sh],
      [12, top - 2],
    ]),
  );
}

function arms(b, spec, top) {
  const sh = top + 6;
  const st = styleOf(spec);
  const look = { tone: st.sleeve, role: roleOf(st), short: st.short, stripes: st.stripes, bones: st.bones, wraps: st.wraps, ribs: st.ribs };
  const robot = kindOf(spec) === "robot";
  const mitt = (p, x, y, angle, kind = "mitt", flip = false) => paw(p, x, y, angle, robot && kind !== "point" ? "claw" : kind, flip);
  const cuff = (p, a, c) => !st.short && !st.skin && cuffLine(p, a, c);
  const age = ageOf(spec);
  const body = seatOf(bodyOf(spec));
  const pose = armPose(spec);
  const item = spec.holding && spec.holding !== "nothing" && holdsFor(spec).includes(spec.holding) ? spec.holding : null;
  const hang = !!item && HANG.has(item);
  const chest = !!item && !hang;
  const upright = body === "standing" || body === "walking";
  const floor = upright
    ? sh + { kid: 294, teen: 356, adult: 400, old: 392 }[age]
    : body === "ground"
      ? sh + 186
      : sh + { kid: 226, teen: 268, adult: 300, old: 296 }[age];
  const add = (fn) => {
    const p = layer();
    fn(p);
    for (const l of p.lines) b.reach = union(b.reach, bounds(l.pts));
    paint(b, p);
  };
  const sl = (p, outer, inner) => sleeve(p, outer, inner, look);
  const grounded = (x) => add((p) => held(p, item, x, floor - GROUNDED[item], { grip: false }));

  const nearDown = (p, grip) => {
    sl(
      p,
      [
        [-50, sh + 10],
        [-68, sh + 60],
        [-72, sh + 120],
        [-70, sh + 158],
      ],
      [
        [-55, sh + 60],
        [-57, sh + 118],
        [-54, sh + 156],
      ],
    );
    cuff(p, [-71, sh + 155], [-53, sh + 153]);
    if (grip === "chest") return held(p, item, -62, sh + 166, { mirror: true });
    mitt(p, -62, sh + 158, Math.PI / 2, "mitt", true);
    if (grip === "hang") held(p, item, -62, sh + 163);
  };
  const nearPocket = (p) => {
    sl(
      p,
      [
        [-50, sh + 10],
        [-70, sh + 56],
        [-80, sh + 96],
        [-60, sh + 138],
        [-46, sh + 150],
      ],
      [
        [-54, sh + 60],
        [-62, sh + 92],
        [-50, sh + 124],
        [-40, sh + 136],
      ],
    );
    p.lines.push(
      line(
        [
          [-48, sh + 150],
          [-40, sh + 140],
        ],
        { weight: 0.7 },
      ),
    );
  };
  const nearLap = (p, grip) => {
    sl(
      p,
      [
        [-56, sh + 14],
        [-70, sh + 70],
        [-60, sh + 116],
        [-10, sh + 132],
        [42, sh + 126],
      ],
      [
        [-50, sh + 58],
        [-46, sh + 100],
        [-8, sh + 114],
        [40, sh + 112],
      ],
    );
    if (grip === "chest") held(p, item, 48, sh + 118);
    else mitt(p, 44, sh + 120, 0.1);
  };
  const farDown = (p, grip) => {
    sl(
      p,
      [
        [44, sh + 8],
        [62, sh + 58],
        [66, sh + 122],
        [66, sh + 154],
      ],
      [
        [46, sh + 60],
        [50, sh + 118],
        [50, sh + 152],
      ],
    );
    cuff(p, [50, sh + 150], [67, sh + 151]);
    mitt(p, 58, sh + 155, Math.PI / 2);
    if (grip === "hang") held(p, item, 58, sh + 160);
  };
  const farChest = (p) => {
    sl(
      p,
      [
        [44, sh + 8],
        [60, sh + 50],
        [70, sh + 96],
        [84, sh + 100],
        [100, sh + 88],
      ],
      [
        [46, sh + 58],
        [54, sh + 84],
        [64, sh + 84],
        [94, sh + 70],
      ],
    );
    cuff(p, [94, sh + 70], [100, sh + 88]);
    held(p, item, 104, sh + 78);
  };
  const farHold = (p) => (hang ? farDown(p, "hang") : farChest(p));
  const farLean = (p) => {
    sl(
      p,
      [
        [44, sh + 8],
        [60, sh + 50],
        [70, sh + 96],
        [84, sh + 100],
        [100, sh + 88],
      ],
      [
        [46, sh + 58],
        [54, sh + 84],
        [64, sh + 84],
        [94, sh + 70],
      ],
    );
    cuff(p, [94, sh + 70], [100, sh + 88]);
    lean(p, item, 104, sh + 80, floor);
    fist(p, 104, sh + 80);
  };
  const farGesture = (p) => {
    sl(
      p,
      [
        [44, sh + 8],
        [62, sh + 52],
        [70, sh + 92],
        [104, sh + 82],
        [124, sh + 64],
      ],
      [
        [46, sh + 58],
        [54, sh + 98],
        [70, sh + 108],
        [108, sh + 98],
        [130, sh + 80],
      ],
    );
    cuff(p, [124, sh + 63], [131, sh + 80]);
    if (chest) held(p, item, 134, sh + 72);
    else mitt(p, 130, sh + 77, 0, "open");
  };
  const near = body === "sitting" ? nearLap : nearDown;

  if (pose === "knees") {
    add((p) => {
      sl(
        p,
        [
          [-56, sh + 14],
          [-68, sh + 66],
          [-44, sh + 104],
          [36, sh + 100],
          [88, sh + 84],
        ],
        [
          [-50, sh + 58],
          [-36, sh + 88],
          [30, sh + 86],
          [84, sh + 72],
        ],
      );
      mitt(p, 92, sh + 74, 0.3);
    });
    if (hang) return add(farLean);
    add((p) => {
      if (chest) {
        sl(
          p,
          [
            [48, sh + 12],
            [62, sh + 50],
            [78, sh + 76],
            [112, sh + 62],
            [124, sh + 50],
          ],
          [
            [44, sh + 56],
            [60, sh + 86],
            [90, sh + 86],
            [118, sh + 70],
          ],
        );
        held(p, item, 126, sh + 60);
      } else {
        sl(
          p,
          [
            [48, sh + 12],
            [62, sh + 52],
            [80, sh + 80],
            [104, sh + 76],
            [116, sh + 70],
          ],
          [
            [44, sh + 56],
            [60, sh + 90],
            [92, sh + 92],
            [112, sh + 86],
          ],
        );
        mitt(p, 116, sh + 76, 0.15);
      }
    });
    return;
  }

  if (pose === "lap") {
    add((p) => nearLap(p));
    if (hang) return add(farLean);
    add((p) => {
      if (chest) {
        sl(
          p,
          [
            [48, sh + 12],
            [62, sh + 56],
            [66, sh + 92],
            [92, sh + 86],
            [108, sh + 72],
          ],
          [
            [44, sh + 58],
            [50, sh + 100],
            [70, sh + 106],
            [98, sh + 96],
            [112, sh + 86],
          ],
        );
        held(p, item, 116, sh + 80);
      } else {
        sl(
          p,
          [
            [48, sh + 12],
            [60, sh + 60],
            [56, sh + 100],
            [76, sh + 124],
            [92, sh + 124],
          ],
          [
            [42, sh + 56],
            [44, sh + 92],
            [64, sh + 110],
            [90, sh + 110],
          ],
        );
        mitt(p, 92, sh + 117, 0.1);
      }
    });
    return;
  }

  if (pose === "crossed") {
    if (hang) grounded(upright ? -126 : 150);
    add((p) =>
      sl(
        p,
        [
          [-50, sh + 10],
          [-66, sh + 48],
          [-72, sh + 86],
          [-64, sh + 106],
          [-30, sh + 110],
          [20, sh + 108],
          [52, sh + 102],
        ],
        [
          [-55, sh + 56],
          [-58, sh + 78],
          [-48, sh + 88],
          [-20, sh + 90],
          [20, sh + 88],
          [50, sh + 84],
        ],
      ),
    );
    add((p) => {
      sl(
        p,
        [
          [44, sh + 8],
          [60, sh + 48],
          [66, sh + 80],
          [60, sh + 98],
          [30, sh + 99],
          [-20, sh + 94],
          [-44, sh + 88],
        ],
        [
          [50, sh + 54],
          [50, sh + 66],
          [30, sh + 71],
          [-20, sh + 67],
          [-44, sh + 63],
        ],
      );
      cuff(p, [-44, sh + 63], [-44, sh + 88]);
      if (chest) held(p, item, -52, sh + 72, { mirror: true });
      else mitt(p, -46, sh + 74, Math.PI + 0.35, "mitt", true);
    });
    return;
  }

  if (pose === "hips") {
    add((p) => {
      sl(
        p,
        [
          [-50, sh + 8],
          [-80, sh + 48],
          [-102, sh + 86],
          [-88, sh + 114],
          [-70, sh + 134],
        ],
        [
          [-58, sh + 50],
          [-74, sh + 72],
          [-84, sh + 88],
          [-74, sh + 104],
          [-60, sh + 120],
        ],
      );
      cuff(p, [-70, sh + 134], [-60, sh + 120]);
      mitt(p, -64, sh + 128, 0.95, "mitt", true);
    });
    if (item) return add(farHold);
    add((p) => {
      sl(
        p,
        [
          [44, sh + 8],
          [78, sh + 48],
          [100, sh + 86],
          [86, sh + 114],
          [66, sh + 134],
        ],
        [
          [50, sh + 50],
          [70, sh + 72],
          [80, sh + 88],
          [70, sh + 104],
          [56, sh + 120],
        ],
      );
      cuff(p, [66, sh + 134], [56, sh + 120]);
      mitt(p, 60, sh + 128, Math.PI - 0.95);
    });
    return;
  }

  if (pose === "shrug") {
    add((p) => {
      sl(
        p,
        [
          [-50, sh + 8],
          [-68, sh + 50],
          [-74, sh + 92],
          [-96, sh + 96],
          [-124, sh + 84],
        ],
        [
          [-56, sh + 56],
          [-60, sh + 80],
          [-90, sh + 78],
          [-120, sh + 66],
        ],
      );
      cuff(p, [-124, sh + 84], [-120, sh + 66]);
      mitt(p, -122, sh + 70, Math.PI, "open", true);
    });
    if (hang && !upright) return add(farLean);
    add((p) => {
      sl(
        p,
        [
          [44, sh + 8],
          [62, sh + 50],
          [68, sh + 92],
          [92, sh + 96],
          [120, sh + 84],
        ],
        [
          [50, sh + 56],
          [54, sh + 80],
          [86, sh + 78],
          [116, sh + 66],
        ],
      );
      cuff(p, [120, sh + 84], [116, sh + 66]);
      if (chest) held(p, item, 124, sh + 72);
      else if (hang && upright) {
        fist(p, 124, sh + 74);
        held(p, item, 124, sh + 74);
      } else mitt(p, 118, sh + 70, 0, "open");
    });
    return;
  }

  if (pose === "chest" || pose === "pillow") {
    if (pose === "chest") {
      add((p) => {
        sl(
          p,
          [
            [-50, sh + 10],
            [-66, sh + 60],
            [-68, sh + 110],
            [-58, sh + 132],
            [-20, sh + 136],
          ],
          [
            [-55, sh + 60],
            [-56, sh + 104],
            [-44, sh + 116],
            [-20, sh + 118],
          ],
        );
        mitt(p, -18, sh + 127, 0);
      });
      if (item) add((p) => held(p, item, 2, sh + 116, { grip: false }));
      add((p) => {
        sl(
          p,
          [
            [44, sh + 8],
            [60, sh + 60],
            [60, sh + 110],
            [50, sh + 130],
            [16, sh + 132],
          ],
          [
            [48, sh + 60],
            [46, sh + 104],
            [36, sh + 114],
            [14, sh + 114],
          ],
        );
        mitt(p, 12, sh + 123, Math.PI, "mitt", true);
      });
    } else {
      add((p) =>
        sl(
          p,
          [
            [-46, sh + 4],
            [-72, sh - 28],
            [-88, sh - 80],
            [-86, sh - 108],
            [-72, sh - 120],
            [-56, sh - 116],
          ],
          [
            [-54, sh + 32],
            [-66, sh - 18],
            [-72, sh - 70],
            [-68, sh - 92],
            [-56, sh - 96],
          ],
        ),
      );
      add((p) =>
        sl(
          p,
          [
            [42, sh + 4],
            [68, sh - 28],
            [84, sh - 80],
            [82, sh - 108],
            [68, sh - 120],
            [54, sh - 116],
          ],
          [
            [50, sh + 32],
            [62, sh - 18],
            [68, sh - 70],
            [64, sh - 92],
            [54, sh - 96],
          ],
        ),
      );
      if (item) add((p) => held(p, item, 2, sh + 116, { grip: false }));
    }
    return;
  }

  if (pose === "down" || pose === "pocket") {
    add(pose === "pocket" ? nearPocket : (p) => near(p));
    if (hang && !upright) return add(farLean);
    return add(item && (upright || chest) ? farHold : farDown);
  }

  if (pose === "gesture" || pose === "both") {
    const pocket = pose === "both" && body !== "sitting";
    add((p) => (pocket ? nearPocket(p) : near(p, hang && upright ? "hang" : null)));
    if (hang && !upright) return add(farLean);
    return add(hang && upright && pocket ? (p) => farDown(p, "hang") : farGesture);
  }

  if (hang && !upright) grounded(150);
  add((p) => near(p, chest ? "chest" : hang && upright ? "hang" : null));
  if (pose === "point") {
    return add((p) => {
      sl(
        p,
        [
          [44, sh + 6],
          [72, sh + 12],
          [110, sh + 18],
          [140, sh + 20],
        ],
        [
          [50, sh + 46],
          [78, sh + 42],
          [110, sh + 40],
          [138, sh + 38],
        ],
      );
      cuff(p, [140, sh + 20], [138, sh + 38]);
      mitt(p, 140, sh + 29, 0.04, "point");
    });
  }
  if (pose === "wave") {
    return add((p) => {
      sl(
        p,
        [
          [44, sh + 6],
          [78, sh + 4],
          [106, sh + 14],
          [116, sh - 22],
          [112, sh - 58],
        ],
        [
          [50, sh + 44],
          [76, sh + 38],
          [90, sh + 28],
          [94, sh - 8],
          [94, sh - 54],
        ],
      );
      cuff(p, [112, sh - 58], [94, sh - 54]);
      mitt(p, 103, sh - 58, -Math.PI / 2 - 0.12, "wave");
      p.lines.push(
        line(
          [
            [128, sh - 72],
            [134, sh - 84],
            [132, sh - 96],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [80, sh - 74],
            [74, sh - 86],
            [76, sh - 98],
          ],
          { weight: 0.45 },
        ),
      );
    });
  }
  if (pose === "chin") {
    add((p) =>
      sl(
        p,
        [
          [44, sh + 8],
          [62, sh + 50],
          [68, sh + 96],
          [64, sh + 114],
        ],
        [
          [48, sh + 56],
          [50, sh + 96],
          [50, sh + 110],
        ],
      ),
    );
    return add((p) => {
      sl(
        p,
        [
          [33, sh - 16],
          [47, sh + 46],
          [60, sh + 104],
          [58, sh + 116],
          [51, sh + 121],
          [44, sh + 116],
        ],
        [
          [15, sh - 11],
          [29, sh + 50],
          [43, sh + 110],
        ],
      );
      cuff(p, [33, sh - 16], [15, sh - 11]);
      mitt(p, 24, sh - 14, -1.8, "mitt", true);
    });
  }
  add(farDown);
}

function limbs(b, st, segs) {
  for (const [a, c] of segs) {
    if (st.bones) b.lines.push(line([a, c], { weight: 1.2, color: "chalk" }));
    if (!st.wraps && !st.ribs) continue;
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const n = Math.max(3, Math.round(len / 16));
    for (let k = 1; k < n; k++) {
      const x = a[0] + (dx * k) / n;
      const y = a[1] + (dy * k) / n;
      const tilt = st.wraps ? (k % 2 ? 4 : -2) : 0;
      b.lines.push(segment([x - nx * 15, y - ny * 15 - tilt], [x + nx * 15, y + ny * 15 + tilt], { weight: 0.42 }));
    }
  }
}

function robotBase(b, spec, hem) {
  const strut = [
    [-18, hem - 2],
    [16, hem - 2],
    [12, hem + 36],
    [-14, hem + 36],
  ];
  b.lines.push(poly(strut, { closed: true, weight: 0.85 }));
  b.washes.push({ rings: [flat(strut, 3)], tone: 0.32, role: "skin" });
  b.knock.push(flat(strut, 3));
  if (spec.legs === "wheel") {
    const cy = hem + 36 + 50;
    b.lines.push({ pts: oval(-1, cy, 50, 50, { start: -1.2 }), weight: 1.05 }, { pts: oval(-1, cy, 37, 37), weight: 0.75 });
    b.washes.push({ rings: [ovalRing(-1, cy, 50, 50)], tone: 0.62 }, { rings: [ovalRing(-1, cy, 37, 37)], paper: true });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      b.lines.push(segment([-1 + Math.cos(a) * 8, cy + Math.sin(a) * 8], [-1 + Math.cos(a) * 36, cy + Math.sin(a) * 36], { weight: 0.55 }));
    }
    b.solids.push(dot(-1, cy, 7));
    b.lines.push(segment([-12, hem + 34], [-8, cy - 6], { weight: 0.9 }), segment([10, hem + 34], [6, cy - 6], { weight: 0.9 }));
    b.knock.push(ovalRing(-1, cy, 51, 51));
    return;
  }
  const top = hem + 36;
  const ring = [
    [-58, top],
    [54, top],
    [76, top + 16],
    [80, top + 36],
    [70, top + 58],
    [54, top + 68],
    [-58, top + 68],
    [-74, top + 58],
    [-84, top + 36],
    [-80, top + 16],
  ];
  b.lines.push(loop(ring, { weight: 1.05 }));
  b.washes.push({ rings: [area(ring)], tone: 0.5 });
  b.knock.push(area(ring));
  for (const x of [-48, -2, 44]) {
    b.lines.push({ pts: oval(x, top + 34, 20, 20), weight: 0.8 });
    b.washes.push({ rings: [ovalRing(x, top + 34, 19, 19)], paper: true });
    b.solids.push(dot(x, top + 34, 5));
  }
  for (let x = -70; x <= 66; x += 11)
    b.lines.push(segment([x, top - 1], [x + 3, top + 6], { weight: 0.45 }), segment([x, top + 62], [x + 3, top + 69], { weight: 0.45 }));
}

function legs(b, spec, hem, pose) {
  const st = styleOf(spec);
  const role = roleOf(st);
  const age = ageOf(spec);
  if (kindOf(spec) === "robot" && (pose === "standing" || pose === "walking") && (spec.legs === "treads" || spec.legs === "wheel"))
    return robotBase(b, spec, hem);
  const shoe = (x, y, dir = 1, tilt = 0) => {
    const c = Math.cos(tilt);
    const s = Math.sin(tilt);
    const ring = area(
      [
        [-10, -4],
        [-12, 8],
        [30, 11],
        [33, 3],
        [18, -4],
      ].map(([u, v]) => [x + (u * c - v * s) * dir, y + u * s * dir + v * c]),
    );
    b.solids.push(ring);
    b.knock.push(ring);
  };
  const trouserTone = st.trousers;
  if (pose === "ground") {
    const ground = hem + 42;
    b.lines.push(
      line([
        [-58, hem - 6],
        [-64, hem + 18],
        [-40, ground - 2],
      ]),
    );
    b.lines.push(
      line([
        [-50, hem - 6],
        [30, hem - 22],
        [104, hem - 58],
      ]),
    );
    b.lines.push(
      line([
        [-40, ground - 2],
        [40, hem + 18],
        [94, hem - 28],
      ]),
    );
    b.lines.push(
      line([
        [104, hem - 58],
        [122, hem - 48],
        [146, ground - 12],
      ]),
    );
    b.lines.push(
      line([
        [94, hem - 28],
        [110, hem - 8],
        [126, ground - 12],
      ]),
    );
    shoe(128, ground - 6, 1);
    b.lines.push(
      line(
        [
          [-90, ground + 2],
          [0, ground + 4],
          [180, ground + 2],
        ],
        { weight: 0.5 },
      ),
    );
    const legs = [
      [-58, hem - 6],
      [30, hem - 22],
      [104, hem - 58],
      [122, hem - 48],
      [146, ground - 12],
      [126, ground - 12],
      [110, hem - 8],
      [94, hem - 28],
      [40, hem + 18],
      [-40, ground - 2],
      [-64, hem + 18],
    ];
    if (trouserTone) b.washes.push({ rings: [area(legs)], tone: trouserTone, role });
    b.knock.push(area(legs));
    return;
  }
  if (pose === "sitting") {
    const knee = { kid: 108, teen: 120, adult: 128, old: 126 }[age];
    const shin = { kid: 104, teen: 132, adult: 150, old: 146 }[age];
    const far = [
      [knee - 30, hem + 28],
      [knee - 31, hem + shin * 0.6],
      [knee - 32, hem + shin - 2],
      [knee - 52, hem + shin - 2],
      [knee - 50, hem + shin * 0.6],
      [knee - 48, hem + 26],
    ];
    b.lines.push(line(far.slice(0, 3)), line(far.slice(3)));
    if (trouserTone) b.washes.push({ rings: [area(far)], tone: trouserTone, role });
    b.knock.push(area(far));
    shoe(knee - 46, hem + shin + 2, 1, 0.42);
    b.lines.push(
      line([
        [-58, hem - 6],
        [10, hem - 12],
        [knee, hem - 10],
      ]),
    );
    b.lines.push(
      line([
        [-58, hem - 6],
        [-63, hem + 12],
        [-48, hem + 28],
        [10, hem + 34],
        [knee - 14, hem + 32],
      ]),
    );
    b.lines.push(
      line([
        [knee, hem - 10],
        [knee + 10, hem + 6],
        [knee + 6, hem + shin],
      ]),
    );
    b.lines.push(
      line([
        [knee - 14, hem + 32],
        [knee - 12, hem + shin * 0.6],
        [knee - 14, hem + shin],
      ]),
    );
    shoe(knee - 8, hem + shin + 6, 1);
    const near = [
      [-58, hem - 6],
      [knee, hem - 10],
      [knee + 8, hem + shin],
      [knee - 14, hem + shin],
      [knee - 14, hem + 32],
      [10, hem + 34],
      [-48, hem + 28],
      [-63, hem + 12],
    ];
    if (trouserTone) b.washes.push({ rings: [area(near)], tone: trouserTone, role });
    b.knock.push(
      area([
        [-60, hem - 8],
        [knee + 4, hem - 12],
        [knee + 12, hem + shin + 4],
        [knee - 16, hem + shin + 4],
        [knee - 16, hem + 34],
        [10, hem + 36],
        [-50, hem + 30],
        [-65, hem + 12],
      ]),
    );
    limbs(b, st, [
      [
        [-24, hem + 12],
        [knee - 18, hem + 10],
      ],
      [
        [knee - 2, hem + 20],
        [knee - 5, hem + shin - 8],
      ],
    ]);
    return;
  }
  const dress = spec.outfit === "dress" || !!st.robe;
  const foot = hem + (st.robe ? 16 : dress ? Math.round(LEG[age] * 0.53) : LEG[age]);
  if (pose === "walking") {
    if (dress) {
      b.lines.push(
        line([
          [-30, hem + 2],
          [-38, foot - 50],
          [-52, foot - 6],
        ]),
        line([
          [-14, hem + 2],
          [-22, foot - 50],
          [-36, foot - 8],
        ]),
      );
      b.lines.push(
        line([
          [12, hem + 4],
          [24, foot - 50],
          [40, foot],
        ]),
        line([
          [28, hem + 2],
          [40, foot - 50],
          [56, foot - 2],
        ]),
      );
      shoe(-48, foot - 2, 1, 0.35);
      shoe(44, foot + 4, 1);
      b.knock.push(
        area([
          [-32, hem],
          [30, hem],
          [58, foot + 4],
          [-56, foot + 4],
        ]),
      );
      return;
    }
    const c = [-2, hem + 46];
    b.lines.push(
      line([
        [-58, hem + 2],
        [-62, hem + 92],
        [-84, foot - 8],
      ]),
      line([
        [54, hem + 2],
        [66, hem + 96],
        [94, foot - 6],
      ]),
    );
    b.lines.push(line([c, [-28, hem + 120], [-56, foot - 12]], { weight: 0.95 }), line([c, [24, hem + 118], [64, foot - 6]], { weight: 0.95 }));
    const both = flat(
      [
        [-58, hem + 2],
        [-62, hem + 92],
        [-84, foot - 8],
        [-56, foot - 12],
        [-28, hem + 120],
        c,
        [24, hem + 118],
        [64, foot - 6],
        [94, foot - 6],
        [66, hem + 96],
        [54, hem + 2],
      ],
      5,
    );
    if (trouserTone) b.washes.push({ rings: [both], tone: trouserTone, role });
    b.knock.push(both);
    shoe(-74, foot - 4, 1, 0.42);
    shoe(78, foot, 1);
    limbs(b, st, [
      [
        [-40, hem + 40],
        [-66, foot - 14],
      ],
      [
        [24, hem + 44],
        [72, foot - 12],
      ],
    ]);
    return;
  }
  if (dress) {
    b.lines.push(
      line([
        [-34, hem + 2],
        [-32, foot - 30],
        [-30, foot],
      ]),
      line([
        [-18, hem + 2],
        [-18, foot - 30],
        [-17, foot],
      ]),
    );
    b.lines.push(
      line([
        [14, hem + 4],
        [12, foot - 30],
        [12, foot],
      ]),
      line([
        [30, hem + 2],
        [28, foot - 30],
        [28, foot],
      ]),
    );
    shoe(-28, foot + 2, 1);
    shoe(16, foot + 4, 1);
    b.knock.push(
      area([
        [-36, hem],
        [32, hem],
        [30, foot + 4],
        [-32, foot + 4],
      ]),
    );
    return;
  }
  const crotch = hem + 48;
  b.lines.push(
    line([
      [-58, hem + 2],
      [-54, (hem + foot) / 2],
      [-50, foot],
    ]),
  );
  b.lines.push(
    line([
      [54, hem + 2],
      [52, (hem + foot) / 2],
      [50, foot],
    ]),
  );
  b.lines.push(
    poly(
      [
        [-12, foot],
        [-6, crotch + 30],
        [-1, crotch],
        [4, crotch + 30],
        [10, foot],
      ],
      { weight: 0.95 },
    ),
  );
  shoe(-44, foot + 3, 1);
  shoe(14, foot + 4, 1);
  limbs(b, st, [
    [
      [-33, crotch + 8],
      [-31, foot - 8],
    ],
    [
      [29, crotch + 8],
      [30, foot - 8],
    ],
  ]);
  if (trouserTone)
    b.washes.push({
      rings: [
        flat(
          [
            [-58, hem + 2],
            [-51, foot - 6],
            [-13, foot - 6],
            [-1, crotch + 4],
            [10, foot - 6],
            [49, foot - 6],
            [54, hem + 2],
          ],
          5,
        ),
      ],
      tone: trouserTone,
      role,
    });
  b.knock.push(
    flat([
      [-60, hem],
      [56, hem],
      [52, foot + 4],
      [12, foot + 4],
      [-1, crotch + 6],
      [-14, foot + 4],
      [-52, foot + 4],
    ]),
  );
}

function turn(b) {
  const t = (p) => ({ ...p, x: p.y, y: -p.x });
  return {
    lines: b.lines.map((l) => ({ ...l, pts: l.pts.map(t) })),
    solids: b.solids.map((ring) => ring.map(t)),
    washes: b.washes.map((w) => ({ ...w, rings: w.rings.map((ring) => ring.map(t)) })),
    knock: b.knock.map((ring) => ring.map(t)),
  };
}

function grow(b, contour, k) {
  const bottom = contour.reduce((m, p) => Math.max(m, p.y), -Infinity);
  const t = (p) => ({ ...p, x: p.x * k, y: bottom + (p.y - bottom) * k });
  b.lines = b.lines.map((l) => ({ ...l, pts: l.pts.map(t), weight: (l.weight ?? 1) * Math.sqrt(k) }));
  b.solids = b.solids.map((ring) => ring.map(t));
  b.washes = b.washes.map((w) => ({ ...w, rings: w.rings.map((ring) => ring.map(t)) }));
  b.knock = b.knock.map((ring) => ring.map(t));
  return contour.map(t);
}

function cape(b, spec, top, tone) {
  let low = -Infinity;
  for (const l of b.lines) for (const p of l.pts) if (p.y > low) low = p.y;
  const sh = top + 6;
  const pts = [
    [-20, top - 4],
    [-50, sh + 4],
    [-74, sh + 110],
    [-96, low - 12],
    [-56, low],
    [0, low - 6],
    [50, low - 4],
    [72, low - 16],
    [60, sh + 110],
    [42, sh + 4],
    [12, top - 4],
  ];
  const rings = [area(pts)];
  const lines = [
    loop(pts, { weight: 0.95 }),
    line(
      [
        [-58, sh + 60],
        [-76, low - 24],
      ],
      { weight: 0.45 },
    ),
  ];
  if (spec.outfit === "vampire") {
    for (const spike of [
      [
        [-26, top + 4],
        [-60, top - 46],
        [-40, top - 4],
      ],
      [
        [22, top + 4],
        [48, top - 48],
        [34, top - 4],
      ],
    ]) {
      lines.push(poly(spike, { weight: 0.9 }));
      rings.push(area(spike));
    }
  }
  b.lines.push(...hideUnder(lines, b.knock));
  b.washes.unshift({ rings, tone, role: "cape" }, { rings: b.knock.slice(), paper: true });
  b.knock.unshift(...rings);
}

function extent(b) {
  const box = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (const l of b.lines) {
    for (const p of l.pts) {
      if (p.x < box.minX) box.minX = p.x;
      if (p.x > box.maxX) box.maxX = p.x;
      if (p.y < box.minY) box.minY = p.y;
      if (p.y > box.maxY) box.maxY = p.y;
    }
  }
  return box;
}

function ghost(b, spec, made, contour, k) {
  const box = extent(b);
  const bottomC = contour.reduce((m, p) => Math.max(m, p.y), -Infinity);
  const gy = (y) => bottomC + (y - bottomC) * k;
  const R = 62 * k;
  const cy = gy(-6);
  const left = Math.min(box.minX - 12, -R - 22);
  const right = Math.max(box.maxX + 12, R + 18);
  const bottom = box.maxY + 6;
  const reach = (side) => {
    let best = null;
    for (const l of b.lines) for (const p of l.pts) if (p.y > cy + R && p.y < bottom - 60 && (!best || side * p.x > side * best.x)) best = p;
    return best;
  };
  const far = reach(1);
  const near = reach(-1);
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI + 0.25 + (i / 16) * (Math.PI - 0.5);
    pts.push([-2 + Math.cos(a) * R, cy + Math.sin(a) * R * 1.08]);
  }
  pts.push([R + 6, cy + 46]);
  if (far && far.x > R + 30) pts.push([far.x + 10, far.y - 12], [far.x + 14, far.y + 14]);
  pts.push([right, bottom - 24]);
  for (let x = right; x >= left; x -= 10) pts.push([x, bottom + Math.sin(x / 9) * 7]);
  pts.push([left, bottom - 24]);
  if (near && near.x < -R - 30) pts.push([near.x - 14, near.y + 14], [near.x - 10, near.y - 12]);
  pts.push([-R - 10, cy + 46]);
  const g = layer();
  const ring = area(pts);
  g.lines.push(loop(pts, { weight: 1.05 }));
  g.washes.push({ rings: [ring], tone: 0.03, role: "top" });
  g.knock.push(ring);
  g.cover.push(ring);
  g.lines.push(
    line(
      [
        [left + 20, bottom - 30],
        [left + 34, cy + 120],
      ],
      { weight: 0.4 },
    ),
    line(
      [
        [right - 24, bottom - 40],
        [right - 36, cy + 140],
      ],
      { weight: 0.4 },
    ),
  );
  paint(b, g);
  const eye = made.head.eye ?? -6;
  for (const [x, rx] of [
    [6, 6],
    [30, 5],
  ])
    b.solids.push(ovalRing(x * k, gy(eye), rx * k, 8 * k));
  if (spec.mood === "startled" || spec.mood === "worried") b.solids.push(ovalRing(18 * k, gy(made.head.mouth ?? 27), 4 * k, 6 * k));
}

function helmet(b, contour) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of contour) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2 - 4;
  const r = Math.max(maxX - minX, maxY - minY) / 2 + 20;
  b.lines.push({ pts: oval(cx, cy, r, r * 1.02, { start: 2.2 }), weight: 1 });
  b.lines.push({ pts: oval(cx, cy, r - 9, r - 9, { start: -2.7, sweep: 0.9, overlap: 0 }), weight: 0.5 });
  b.washes.push({ rings: [ovalRing(cx, cy, r, r * 1.02)], tone: 0.035 });
}

function wheelchair(b, spec, hem, from) {
  const age = ageOf(spec);
  const knee = { kid: 108, teen: 120, adult: 128, old: 126 }[age];
  const shin = { kid: 104, teen: 132, adult: 150, old: 146 }[age];
  const ground = hem + shin + 36;
  const R = Math.round((shin + 30) / 2);
  const cx = -24;
  const cy = ground - R;
  const frame = layer();
  frame.lines.push(
    line(
      [
        [-70, hem + 38],
        [-74, hem - 40],
        [-78, hem - 118],
        [-86, hem - 126],
        [-104, hem - 124],
      ],
      { weight: 1 },
    ),
  );
  frame.solids.push(
    flat(
      [
        [-90, hem - 129],
        [-106, hem - 128],
        [-106, hem - 120],
        [-90, hem - 121],
      ],
      3,
    ),
  );
  frame.lines.push(
    line(
      [
        [-72, hem + 38],
        [10, hem + 40],
        [88, hem + 38],
      ],
      { weight: 0.95 },
    ),
  );
  frame.lines.push(
    line(
      [
        [88, hem + 38],
        [knee - 10, hem + shin * 0.7],
        [knee - 4, hem + shin + 8],
      ],
      { weight: 0.95 },
    ),
  );
  frame.lines.push(
    poly(
      [
        [knee - 24, hem + shin + 8],
        [knee + 26, hem + shin + 8],
        [knee + 26, hem + shin + 14],
        [knee - 24, hem + shin + 14],
      ],
      { closed: true, weight: 0.8 },
    ),
  );
  frame.lines.push(
    line(
      [
        [knee - 34, hem + shin + 12],
        [knee - 38, ground - 14],
      ],
      { weight: 0.8 },
    ),
  );
  frame.lines.push({ pts: oval(knee - 40, ground - 12, 12, 12, { start: -1.2 }), weight: 0.9 });
  frame.washes.push({ rings: [ovalRing(knee - 40, ground - 12, 12, 12)], tone: 0.55, role: "chair" });
  frame.lines = hideUnder(frame.lines, b.knock.slice(from));
  b.lines.push(...frame.lines);
  b.solids.push(...frame.solids);
  b.washes.push(...frame.washes);
  const wheel = layer();
  const outer = oval(cx, cy, R, R, { overlap: 0, step: 3 });
  const inner = oval(cx, cy, R - 8, R - 8, { overlap: 0, step: 3 });
  wheel.lines.push({ pts: oval(cx, cy, R, R, { start: -1.2 }), weight: 1.05 });
  wheel.lines.push({ pts: oval(cx, cy, R - 8, R - 8, { start: 0.6 }), weight: 0.7 });
  wheel.lines.push({ pts: oval(cx, cy, R - 13, R - 13, { start: 2.2 }), weight: 0.55 });
  wheel.washes.push({ rings: [outer.concat(inner.slice().reverse())], tone: 0.62, role: "chair" });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.13;
    wheel.lines.push(segment([cx + Math.cos(a) * 7, cy + Math.sin(a) * 7], [cx + Math.cos(a) * (R - 9), cy + Math.sin(a) * (R - 9)], { weight: 0.28 }));
  }
  wheel.lines.push({ pts: oval(cx, cy, 7, 7), weight: 0.7 });
  wheel.solids.push(dot(cx, cy, 2.6));
  const disk = ovalRing(cx, cy, R, R);
  wheel.knock.push(disk);
  wheel.cover.push(disk);
  paint(b, wheel);
}

function upright(spec, pose) {
  const chair = pose === "wheelchair";
  const body = seatOf(pose);
  const b = build();
  const age = ageOf(spec);
  const kind = kindOf(spec);
  const made = addHead(b, kind === "human" && (age === "kid" || age === "teen") ? { ...spec, facial: "none" } : spec);
  const head = made.head;
  if (kind !== "human" && kind !== "robot" && age === "old") wrinkles(b, made);
  const k = headGrow(spec);
  const contour = k !== 1 ? grow(b, made.contour, k) : made.contour;
  const finish = () => {
    if (kind !== "robot" && spec.outfit === "death") hood(b, contour);
    else if (kind !== "robot" && spec.hat === "helmet") helmet(b, contour);
  };
  if (body === "head") {
    neck(b, head, contour, 14);
    made.after?.(b, { contour, k });
    finish();
    return b;
  }
  const top = neck(b, head, contour, made.neck ?? (age === "kid" ? 10 : 16));
  if (kind === "robot") for (const dy of [12, 6]) b.lines.push(segment([-17, top - dy], [11, top - dy], { weight: 0.5 }));
  if (body === "bust") {
    const from = b.washes.length;
    bust(b, spec, top);
    for (let i = from; i < b.washes.length; i++) if (b.washes[i].role === "outfit") b.washes[i] = { ...b.washes[i], role: "top" };
    made.after?.(b, { contour, k });
    finish();
    return b;
  }
  const seated = body === "sitting" || body === "ground";
  const hem = top + HEM[age][seated ? 1 : 0];
  const tag = (from, role) => {
    for (let i = from; i < b.washes.length; i++) if (b.washes[i].role === "outfit") b.washes[i] = { ...b.washes[i], role };
  };
  let w0 = b.washes.length;
  const k0 = b.knock.length;
  const t = torso(b, spec, top, { hem, sitting: seated, leg: LEG[age], headRing: contour });
  tag(w0, "top");
  const mark = b.lines.length;
  w0 = b.washes.length;
  legs(b, spec, t.hem, body === "lying" ? "standing" : body);
  tag(w0, "bottom");
  if (t.cover) {
    b.lines = b.lines.slice(0, mark).concat(hideUnder(b.lines.slice(mark), [t.cover]));
    b.washes.push({ rings: [t.cover], paper: true });
  }
  if (chair) wheelchair(b, spec, t.hem, k0);
  const st = styleOf(spec);
  w0 = b.washes.length;
  if (st.cape && kind !== "robot") cape(b, spec, top, st.cape);
  tag(w0, "top");
  made.after?.(b, { contour, k });
  w0 = b.washes.length;
  arms(b, spec, top);
  tag(w0, "top");
  if (b.reach) b.focus = union(b.reach, bounds(contour));
  if (kind !== "robot" && spec.outfit === "ghost") ghost(b, spec, made, contour, k);
  finish();
  return b;
}

export function buildPerson(spec) {
  const body = bodyOf(spec);
  const b = upright({ ...spec, body }, body);
  return body === "lying" ? turn(b) : b;
}
