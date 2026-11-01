import { PLACES } from "./parts/places.js";

const person = (spec) => ({ type: "person", eyes: "dots", glasses: "none", facial: "none", arms: "down", holding: "nothing", ...spec });

function scene(name, seed, next) {
  return PLACES[name].pieces.map((p, i) => ({
    id: next(),
    kind: "piece",
    place: name,
    part: { ...p.part, seed: seed + i * 7 },
    x: p.x,
    y: p.y,
    scale: p.scale,
    flip: !!p.flip,
    weight: 3.6,
    erase: [],
  }));
}

function counter() {
  let n = 0;
  return () => `x${(n++).toString(36)}`;
}

export function therapist() {
  const id = counter();
  const cast = [
    {
      part: person({ head: "egg", nose: "long", hair: "bald", hairTone: "gray", mood: "worried", body: "sitting", outfit: "sweater", seed: 211 }),
      x: 318,
      y: 404,
      scale: 0.76,
      flip: false,
    },
    {
      part: person({
        head: "long",
        nose: "hook",
        eyes: "lids",
        hair: "bun",
        hairTone: "gray",
        glasses: "round",
        mood: "deadpan",
        body: "sitting",
        outfit: "dress",
        seed: 977,
      }),
      x: 812,
      y: 446,
      scale: 0.76,
      flip: true,
    },
  ].map((c) => ({ id: id(), kind: "piece", weight: 3.6, erase: [], ...c }));
  return { version: 2, board: { w: 1000, h: 800 }, items: [...scene("therapist", 40, id), ...cast], caption: "", quotes: true };
}

function haze(id, top, bottom, tone, { bumps = 0, seed = 1 } = {}) {
  const pts = [];
  if (bumps) {
    let x = -60;
    let i = 0;
    while (x < 1060) {
      const r = 34 + ((Math.sin(seed * 7 + i * 2.3) + 1) / 2) * 30;
      const y0 = top + Math.sin(seed + i * 1.7) * 26;
      for (let k = 0; k <= 8; k++) {
        const a = Math.PI + (Math.PI * k) / 8;
        pts.push([x + r + Math.cos(a) * r, y0 + Math.sin(a) * r * 0.8]);
      }
      x += r * 2 * 0.86;
      i++;
    }
  } else pts.push([-60, top], [1060, top]);
  pts.push([1060, bottom], [-60, bottom]);
  const d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
  return { id: id(), kind: "wash", d, box: { x: -60, y: top - 80, w: 1120, h: bottom - top + 80 }, tone };
}

export function flyingCars() {
  const id = counter();
  const thing = (name, x, y, scale, flip = false, seed = 7) => ({
    id: id(),
    kind: "piece",
    part: { type: "thing", name, seed },
    x,
    y,
    scale,
    flip,
    weight: 3.6,
    erase: [],
  });
  const who = (spec, x, y, scale, flip = false) => ({ id: id(), kind: "piece", part: person(spec), x, y, scale, flip, weight: 3.6, erase: [] });
  const stumps = [
    [96, 520, 0.12],
    [212, 508, 0.1],
    [262, 534, 0.15],
    [388, 512, 0.1],
    [452, 540, 0.14],
    [540, 516, 0.11],
    [612, 536, 0.13],
    [690, 510, 0.1],
    [752, 530, 0.12],
    [846, 514, 0.11],
    [930, 540, 0.15],
    [500, 588, 0.18],
    [40, 580, 0.2],
  ].map(([x, y, k], i) => thing("stump", x, y, k, i % 2 === 1, 3 + i));
  const sky = [
    haze(id, -60, 505, 0.1),
    haze(id, 250, 505, 0.1, { bumps: true, seed: 2 }),
    haze(id, 340, 505, 0.1, { bumps: true, seed: 5 }),
    haze(id, 430, 505, 0.09, { bumps: true, seed: 8 }),
    thing("flyingtruck", 735, 96, 0.36, true, 22),
    thing("flyingtruck", 590, 214, 0.22, false, 23),
    thing("flyingtruck", 905, 262, 0.17, true, 24),
  ];
  const land = [
    thing("cracks", 500, 492, 1.5),
    thing("floor", 500, 500, 1),
    thing("factory", 175, 500, 0.4, true, 13),
    thing("factory", 330, 497, 0.2, false, 14),
    thing("factory", 470, 494, 0.26, false, 11),
    thing("factory", 640, 498, 0.32, true, 17),
    thing("factory", 770, 499, 0.2, true, 15),
    thing("factory", 885, 502, 0.46, false, 19),
    thing("deadtree", 318, 512, 0.4),
    thing("deadtree", 975, 520, 0.34, true),
    ...stumps,
    who(
      {
        head: "oval",
        nose: "hook",
        hair: "bald",
        hairTone: "gray",
        mood: "worried",
        body: "walking",
        arms: "down",
        holding: "bag",
        outfit: "sweater",
        seed: 62,
      },
      48,
      432,
      0.16,
      true,
    ),
    who(
      {
        head: "egg",
        nose: "button",
        hair: "bun",
        hairTone: "dark",
        sex: "woman",
        mood: "worried",
        body: "walking",
        arms: "down",
        holding: "bag",
        outfit: "dress",
        seed: 63,
      },
      104,
      436,
      0.15,
      true,
    ),
    who(
      { head: "long", nose: "snub", hair: "curly", hairTone: "dark", age: "kid", mood: "worried", body: "walking", arms: "down", outfit: "tshirt", seed: 64 },
      148,
      452,
      0.14,
      true,
    ),
  ];
  const kid = (spec, x, y, scale) => who({ age: "kid", body: "ground", arms: "knees", ...spec }, x, y, scale, true);
  const cast = [
    who(
      {
        head: "jowly",
        nose: "bulb",
        hair: "bald",
        hairTone: "gray",
        glasses: "round",
        facial: "mustache",
        age: "old",
        mood: "delighted",
        body: "ground",
        arms: "gesture",
        outfit: "vest",
        seed: 1407,
      },
      190,
      555,
      0.8,
    ),
    kid({ head: "round", nose: "button", hair: "curly", hairTone: "dark", mood: "worried", outfit: "hoodie", seed: 523 }, 600, 616, 0.46),
    kid({ head: "round", nose: "snub", hair: "pigtails", hairTone: "dark", sex: "woman", mood: "startled", outfit: "dress", seed: 524 }, 732, 612, 0.46),
    kid({ head: "round", nose: "button", hair: "crew", hairTone: "dark", mood: "startled", outfit: "sweater", seed: 525 }, 862, 618, 0.46),
    kid({ head: "round", nose: "button", hair: "long", hairTone: "dark", sex: "woman", mood: "worried", outfit: "dress", seed: 526 }, 668, 684, 0.5),
    kid({ head: "oval", nose: "snub", hair: "short", hairTone: "dark", mood: "worried", outfit: "tshirt", seed: 527 }, 805, 688, 0.5),
  ];
  const line = "Yes, the planet got destroyed—but we have flying cars now.";
  const bubble = {
    id: id(),
    kind: "bubble",
    text: line,
    x: 330,
    y: 300,
    tail: { x: 236, y: 512 },
    style: "speech",
    face: "serif",
    size: 26,
    seed: 7,
    weight: 3,
  };
  return {
    version: 2,
    board: { w: 1000, h: 800 },
    items: [...sky, ...land, ...cast, bubble],
    caption: "",
    showCaption: false,
    quotes: true,
    frame: "wash",
  };
}
