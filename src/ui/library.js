import { newSeed } from "../core/random.js";
import { el, hairArt, paperAttrs, washAttrs, washColour, washTone } from "../core/scene.js";
import { THING_GROUPS, thingWords } from "../parts/catalog.js";
import { partSize, pieceGeometry } from "../parts/geometry.js";
import {
  ageOf,
  AGES,
  AIDS,
  ARM_POSES,
  armPose,
  armsFor,
  BODIES,
  bodyOf,
  CHASSIS,
  costumeHat,
  COSTUMES,
  EYES,
  GLASSES,
  HAIRS,
  HATS,
  HEADS,
  holdsFor,
  KINDS,
  kindOf,
  MOODS,
  NOSES,
  outfitsFor,
  randomPerson,
  ROBOT_LEGS,
  SEXES,
  SPECIES,
  SPECIES_NAMES,
  TONES,
} from "../parts/people.js";
import { PLACE_ORDER, PLACES } from "../parts/places.js";
import { THING_ORDER, THINGS } from "../parts/things.js";
import { animate, chips, EASE, EASE_IN_OUT, EASE_OUT, h, reducedMotion, segmented, SPRING } from "./dom.js";
import { icon } from "./icons.js";

export function drawing(pieces, view, { colors, prefix, weight, paper = "#fffefa" }) {
  const svg = el("svg", { viewBox: view, "aria-hidden": "true", focusable: "false", preserveAspectRatio: "xMidYMid meet" });
  for (const piece of pieces) {
    const g = pieceGeometry({ weight, flip: false, ...piece });
    const layer = pieces.length > 1 ? el("g", {}, svg) : svg;
    if (g.knock) el("path", { d: g.knock, transform: g.transform, fill: paper }, layer);
    const wash = el("g", { filter: `url(#${prefix}wash)` }, layer);
    const ink = el("g", { fill: piece.ink || colors.ink }, layer);
    for (const w of g.washes)
      el(
        "path",
        { d: w.d, transform: g.transform, ...(w.paper ? paperAttrs(paper) : washAttrs(washTone(w, piece), "nonzero", washColour(w, piece, colors.wash))) },
        wash,
      );
    if (g.solid) el("path", { d: g.solid, transform: g.transform, "fill-rule": "evenodd" }, ink);
    hairArt(g, piece, wash, ink);
    el("path", { d: g.ink, transform: g.transform }, ink);
    if (g.chalk) el("path", { d: g.chalk, transform: g.transform, fill: paper, "fill-opacity": "0.82" }, ink);
  }
  return svg;
}

const TABS = [
  { id: "people", label: "Characters" },
  { id: "things", label: "Things" },
  { id: "places", label: "Places" },
];

const NAMES = {
  head: { oval: "Oval", egg: "Egg", round: "Round", long: "Long", jowly: "Jowly", square: "Square", robot: "Robot" },
  nose: { button: "Button", long: "Long", hook: "Hooked", bulb: "Bulb", pointy: "Pointy", snub: "Snub" },
  eyes: { dots: "Dots", ovals: "Wide", lids: "Heavy lids", beads: "Beady", closed: "Closed" },
  glasses: { none: "None", round: "Round", square: "Square", sun: "Sunglasses", monocle: "Monocle", patch: "Eye patch" },
  aid: { none: "None", hearing: "Hearing aid", implant: "Cochlear implant" },
  hair: {
    short: "Short",
    part: "Side part",
    crew: "Crew cut",
    curly: "Curly",
    bun: "Bun",
    bob: "Bob",
    long: "Long",
    pigtails: "Pigtails",
    bald: "Balding",
    none: "Bald",
  },
  hairTone: { dark: "Dark", gray: "Grey", light: "Fair" },
  facial: { none: "None", mustache: "Moustache", beard: "Beard", stubble: "Stubble" },
  outfit: {
    bare: "Nothing",
    suit: "Suit",
    tuxedo: "Tuxedo",
    vest: "Sweater vest",
    sweater: "Sweater",
    tshirt: "T-shirt",
    hoodie: "Hoodie",
    jersey: "Football shirt",
    dress: "Dress",
    labcoat: "Lab coat",
    overalls: "Overalls",
    witch: "Witch",
    vampire: "Vampire",
    ghost: "Ghost",
    skeleton: "Skeleton",
    death: "Death",
    pumpkin: "Pumpkin",
    superhero: "Superhero",
    pirate: "Pirate",
    mummy: "Mummy",
    astronaut: "Astronaut",
  },
  hat: {
    none: "No hat",
    cap: "Cap",
    beanie: "Beanie",
    bowler: "Bowler",
    tophat: "Top hat",
    cowboy: "Cowboy",
    witch: "Witch's hat",
    pirate: "Tricorn",
    party: "Party hat",
    crown: "Crown",
    chef: "Chef's hat",
    santa: "Santa hat",
    helmet: "Space helmet",
  },
  species: SPECIES_NAMES,
  sex: { man: "Man", woman: "Woman" },
  chassis: { boxy: "Boxy", barrel: "Barrel", round: "Round" },
  legs: { legs: "Legs", treads: "Treads", wheel: "Wheel" },
  holding: {
    nothing: "Nothing",
    mug: "Mug",
    glass: "Glass",
    cocktail: "Cocktail",
    cigar: "Cigar",
    pipe: "Pipe",
    phone: "Phone",
    paper: "Paper",
    newspaper: "Newspaper",
    book: "Book",
    flowers: "Flowers",
    gift: "Present",
    icecream: "Ice cream",
    balloon: "Balloon",
    sign: "Sign",
    flag: "Flag",
    magnifier: "Magnifying glass",
    megaphone: "Megaphone",
    fishingrod: "Fishing rod",
    scythe: "Scythe",
    briefcase: "Briefcase",
    umbrella: "Umbrella",
    cane: "Cane",
    whitecane: "White cane",
    crutch: "Crutch",
    bag: "Shopping bag",
    lantern: "Lantern",
  },
};

const HINTS = ["cars", "sofas", "cats", "rockets", "pianos", "castles", "bicycles", "lamps", "whales", "trees"];

const named = (key, id) => NAMES[key]?.[id] || id;
export const optionName = named;
const standingUp = (p) => bodyOf(p) === "standing" || bodyOf(p) === "walking";
const full = (p) => bodyOf(p) !== "head";
const OPEN_SHUT = [
  { id: "dots", label: "Open" },
  { id: "closed", label: "Closed" },
];

const WHO = {
  human: { label: "Person", sections: (p) => [{ key: "sex", title: "Who", view: full(p) ? "figure" : "face", options: SEXES }] },
  alien: { label: "Alien", sections: () => [{ key: "species", title: "Alien", view: "face", options: SPECIES.alien }] },
  robot: {
    label: "Robot",
    sections: (p) =>
      [
        { key: "species", title: "Head", view: "face", options: SPECIES.robot },
        full(p) && bodyOf(p) !== "bust" ? { key: "chassis", title: "Body", view: "figure", options: CHASSIS } : null,
        full(p) && standingUp(p) ? { key: "legs", title: "Legs", view: "figure", options: ROBOT_LEGS } : null,
      ].filter(Boolean),
  },
  animal: { label: "Animal", sections: () => [{ key: "species", title: "Animal", view: "face", options: SPECIES.animal }] },
};

const BODY = {
  id: "body",
  label: "Body",
  sections: (p) =>
    [
      full(p) && bodyOf(p) !== "bust"
        ? { key: "age", title: "Age", view: "figure", options: kindOf(p) === "robot" ? AGES.filter((a) => a.id !== "old") : AGES }
        : null,
      {
        key: "body",
        title: "Pose",
        view: "figure",
        options: BODIES.filter((b) => b.id !== "wheelchair" || kindOf(p) !== "robot").map((b) => ({ id: b.id, label: b.label })),
      },
    ].filter(Boolean),
};

const MOOD = {
  id: "mood",
  label: "Mood",
  sections: (p) =>
    [
      { key: "mood", title: "Mood", view: "face", options: MOODS.map((m) => ({ id: m.id, label: m.label })) },
      kindOf(p) !== "human" ? { key: "eyes", title: "Eyes", view: "face", options: OPEN_SHUT } : null,
    ].filter(Boolean),
};

const FACE = {
  id: "face",
  label: "Face",
  sections: (p) =>
    [
      { key: "head", title: "Shape", view: "face", options: Object.keys(HEADS).filter((k) => !HEADS[k].robot) },
      { key: "nose", title: "Nose", view: "face", options: Object.keys(NOSES) },
      { key: "eyes", title: "Eyes", view: "face", options: EYES },
      { key: "glasses", title: "Glasses", view: "face", options: GLASSES },
      ["bob", "long", "pigtails"].includes(p.hair) ? null : { key: "aid", title: "Hearing", view: "face", options: AIDS },
    ].filter(Boolean),
};

const HAIR = {
  id: "hair",
  label: "Hair",
  sections: (p) =>
    [
      { key: "hair", title: "Style", view: "face", options: HAIRS },
      p.hair === "none" ? null : { key: "hairTone", title: "Colour", view: "face", options: TONES },
      p.sex === "woman" || ageOf(p) === "kid" || ageOf(p) === "teen"
        ? null
        : { key: "facial", title: "Beard", view: "face", options: ["none", "mustache", "beard", "stubble"] },
    ].filter(Boolean),
};

const CLOTHES = {
  id: "clothes",
  label: "Clothes",
  sections: (p) =>
    kindOf(p) === "robot"
      ? [{ key: "hat", title: "Hats", view: "face", options: HATS.filter((id) => id !== "helmet") }]
      : full(p)
        ? [
            { key: "outfit", title: "Everyday", view: "figure", options: outfitsFor(p) },
            { key: "outfit", title: "Costumes", view: "figure", options: COSTUMES },
            p.outfit === "death" ? null : { key: "hat", title: "Hats", view: "face", options: HATS },
          ].filter(Boolean)
        : [{ key: "hat", title: "Hats", view: "face", options: HATS }],
};

const HANDS = {
  id: "hands",
  label: "Hands",
  sections: (p) =>
    [
      armsFor(bodyOf(p)).length > 1
        ? { key: "arms", title: "Arms", view: "hands", options: armsFor(bodyOf(p)).map((id) => ({ id, label: ARM_POSES[id].label })) }
        : null,
      holdsFor(p).length > 1 ? { key: "holding", title: "Holding", view: "hands", options: holdsFor(p) } : null,
    ].filter(Boolean),
};

function categories(p) {
  const kind = kindOf(p);
  const who = { id: "who", ...WHO[kind] };
  const list =
    kind === "human" ? [who, BODY, MOOD, FACE, HAIR, CLOTHES, HANDS] : [who, BODY, MOOD, { ...CLOTHES, label: kind === "robot" ? "Hat" : "Clothes" }, HANDS];
  return list
    .map((c) => ({
      id: c.id,
      label: c.label,
      sections: c
        .sections(p)
        .map((sct) => ({ ...sct, options: sct.options.map((raw) => (typeof raw === "string" ? { id: raw, label: named(sct.key, raw) } : raw)) })),
    }))
    .filter((c) => c.sections.length);
}

const EXEMPLARS = {
  human: {
    type: "person",
    kind: "human",
    sex: "man",
    head: "oval",
    nose: "button",
    eyes: "dots",
    hair: "short",
    hairTone: "dark",
    glasses: "none",
    facial: "none",
    mood: "neutral",
    body: "head",
    hat: "none",
    seed: 7,
  },
  alien: { type: "person", kind: "alien", species: "martian", mood: "delighted", eyes: "dots", body: "head", hat: "none", seed: 7 },
  robot: { type: "person", kind: "robot", species: "box", mood: "neutral", eyes: "dots", body: "head", hat: "none", seed: 7 },
  animal: { type: "person", kind: "animal", species: "cat", mood: "neutral", eyes: "dots", body: "head", hat: "none", seed: 7 },
};

const DRAG = 6;
const HOLD = 280;

const ALL_THINGS = [...new Set([...THING_GROUPS.flatMap((g) => g.ids), ...THING_ORDER])].filter((id) => THINGS[id]);

function morph(host, next) {
  const old = [...host.children];
  const from = old[old.length - 1]?.viewBox?.baseVal;
  const to = next.getAttribute("viewBox");
  const a = from ? [from.x, from.y, from.width, from.height] : null;
  const b = to.split(/[\s,]+/).map(Number);
  if (!a || !a[2] || reducedMotion() || a.every((v, i) => Math.abs(v - b[i]) < 2)) return swap(host, next);
  host.append(next);
  const nodes = [...old, next];
  const start = performance.now();
  const token = (host.morphing = {});
  const finish = () => {
    if (host.morphing !== token) return;
    host.morphing = null;
    next.setAttribute("viewBox", to);
  };
  const step = (now) => {
    if (host.morphing !== token) return;
    const t = Math.min(1, (now - start) / 380);
    const e = 1 - (1 - t) ** 3;
    const view = a.map((v, i) => (v + (b[i] - v) * e).toFixed(2)).join(" ");
    for (const n of nodes) n.setAttribute("viewBox", view);
    if (t < 1) requestAnimationFrame(step);
    else finish();
  };
  for (const n of nodes) n.setAttribute("viewBox", a.join(" "));
  requestAnimationFrame(step);
  setTimeout(finish, 440);
  animate(next, [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "linear" });
  for (const node of old) {
    const out = animate(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "linear", fill: "forwards" });
    out.done.then(() => node.remove());
  }
}

function swap(host, next, { dir = 0 } = {}) {
  const old = [...host.children];
  host.append(next);
  if (!old.length) {
    animate(next, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "linear" });
    return;
  }
  if (dir) {
    animate(next, [{ transform: `translateX(${dir * 24}%)` }, { transform: "none" }], { duration: 420, easing: EASE_OUT });
    animate(next, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 60, easing: "linear", fill: "backwards" });
  } else animate(next, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "linear" });
  for (const node of old) {
    const out = animate(
      node,
      dir
        ? [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: `translateX(${dir * -24}%)` },
          ]
        : [{ opacity: 1 }, { opacity: 0 }],
      { duration: dir ? 240 : 180, easing: EASE, fill: "forwards" },
    );
    out.done.then(() => node.remove());
  }
}

const plural = (w) => {
  const out = [w];
  if (w.length > 4 && w.endsWith("ies")) out.push(`${w.slice(0, -3)}y`);
  if (w.length > 3 && /(ses|xes|ches|shes)$/.test(w)) out.push(w.slice(0, -2));
  if (w.length > 2 && w.endsWith("s")) out.push(w.slice(0, -1));
  return out;
};

const hay = new Map();
const matches = (id, words) => {
  let tokens = hay.get(id);
  if (!tokens)
    hay.set(
      id,
      (tokens = thingWords(id)
        .split(/[^a-z0-9]+/)
        .filter(Boolean)),
    );
  return words.every((w) => {
    const [typed, ...singular] = plural(w);
    return tokens.some((t) => t.startsWith(typed) || singular.includes(t));
  });
};

const same = (a, b) => {
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (k !== "seed" && a[k] !== b[k]) return false;
  return true;
};

export class Library {
  constructor(desk) {
    this.desk = desk;
    this.tab = "people";
    this.isOpen = false;
    this.editing = null;
    this.query = "";
    this.generation = 0;
    this.jobs = [];
    this.person = randomPerson(newSeed(), { kind: "human", body: "standing" });
    this.el = this.build();
    setTimeout(() => this.warmThings(), 600);
  }

  get colors() {
    return this.desk.colors;
  }

  build() {
    this.tabs = segmented(TABS, this.tab, (id) => this.show(id), { label: "Library" });
    const close = h("button", {
      type: "button",
      class: "icon-button icon-button-sm",
      "aria-label": "Close",
      "data-tip": "Close",
      "data-key": "Esc",
      html: icon("x"),
      onclick: () => this.close(),
    });
    this.body = h("div", { class: "library-body" });
    return h(
      "aside",
      { class: "library", role: "dialog", "aria-label": "Characters, things and places", hidden: true },
      h("div", { class: "library-head" }, this.tabs, close),
      this.body,
    );
  }

  toggle(tab) {
    if (this.isOpen && this.tab === tab) this.close();
    else this.open(tab);
  }

  open(tab = this.tab) {
    const was = this.isOpen;
    this.isOpen = true;
    if (tab !== this.tab || !was) {
      this.tab = tab;
      this.tabs.set(tab);
      this.render({ slide: was });
    }
    this.desk.dock.refreshLibrary(tab);
    this.warmThings();
    if (!was) {
      this.el.hidden = false;
      this.desk.onLibrary(true);
      requestAnimationFrame(() => {
        this.tabs.place(true);
        this.chips?.refresh();
      });
    }
    this.syncSelection();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.editing = null;
    this.generation++;
    this.desk.dock.refreshLibrary(null);
    this.desk.onLibrary(false);
  }

  show(tab) {
    this.tab = tab;
    this.desk.dock.refreshLibrary(tab);
    this.render();
    this.syncSelection();
  }

  render({ slide = true } = {}) {
    this.generation++;
    this.jobs = [];
    this.observer?.disconnect();
    this.observer = null;
    this.chips = null;
    this.peopleKey = null;
    const view = this.tab === "people" ? this.peopleTab() : this.tab === "things" ? this.thingsTab() : this.placesTab();
    const old = [...this.body.children].filter((n) => !n.classList.contains("library-leaving"));
    const index = TABS.findIndex((t) => t.id === this.tab);
    const dir = this.lastTab == null ? 0 : Math.sign(index - this.lastTab);
    this.lastTab = index;
    if (!slide || !old.length || !dir || reducedMotion()) {
      this.body.replaceChildren(view);
      return;
    }
    for (const o of old) {
      for (const a of o.getAnimations()) a.cancel();
      o.classList.add("library-leaving");
    }
    this.body.append(view);
    animate(view, [{ transform: `translateX(${dir * 16}%)` }, { transform: "none" }], { duration: SPRING.duration, easing: SPRING.easing });
    animate(view, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 80, easing: "linear", fill: "backwards" });
    for (const o of old) {
      const out = animate(
        o,
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: `translateX(${-dir * 10}%)` },
        ],
        { duration: 240, easing: EASE_IN_OUT, fill: "forwards" },
      );
      out.done.then(() => o.remove());
    }
  }

  schedule(fn, keep = false) {
    const gen = keep ? null : this.generation;
    this.jobs.push({ fn, gen });
    if (this.pumping) return;
    this.pumping = true;
    const pump = () => {
      const start = performance.now();
      while (this.jobs.length && performance.now() - start < 10) {
        const job = this.jobs.shift();
        if (job.gen === null || job.gen === this.generation) job.fn();
      }
      if (this.jobs.length) requestAnimationFrame(pump);
      else this.pumping = false;
    };
    requestAnimationFrame(pump);
  }

  lazy(scroller) {
    const visible = new Set();
    const tiles = new WeakMap();
    const list = [];
    let order = 0;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const tile = tiles.get(e.target);
          if (!tile) continue;
          if (e.isIntersecting) {
            visible.add(tile);
            if (tile.dirty) this.paintTile(tile, order++);
          } else visible.delete(tile);
        }
        requestAnimationFrame(() => (order = 0));
      },
      { root: scroller, rootMargin: "160px 0px" },
    );
    return {
      watch: (tile) => {
        tiles.set(tile.node, tile);
        list.push(tile);
        this.observer.observe(tile.node);
      },
      prime: (count, now = 12) => {
        list.slice(0, count).forEach((tile, i) => {
          if (!tile.dirty || (i >= now && !tile.ready?.())) return;
          tile.dirty = false;
          tile.art.append(tile.paint());
        });
      },
      refresh: () => {
        let i = 0;
        for (const tile of visible) if (tile.dirty) this.paintTile(tile, i++, true);
      },
    };
  }

  paintTile(tile, index, quiet = false) {
    const version = (tile.version = (tile.version || 0) + 1);
    const gen = this.generation;
    this.schedule(() => {
      if (gen !== this.generation || version !== tile.version) return;
      tile.dirty = false;
      const art = tile.paint();
      if (!tile.art.children.length && !quiet) {
        tile.art.append(art);
        animate(art, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, delay: Math.min(index, 8) * 12, easing: "linear", fill: "backwards" });
      } else swap(tile.art, art);
    }, true);
  }

  spy(scroller, sections, chipsRow) {
    let lock = 0;
    let frame = 0;
    const current = () => {
      const shown = sections.filter((s) => !s.el.hidden);
      if (!shown.length) return null;
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) return shown[shown.length - 1].id;
      let id = shown[0].id;
      for (const s of shown) if (s.el.offsetTop <= scroller.scrollTop + 24) id = s.id;
      return id;
    };
    scroller.addEventListener(
      "scroll",
      () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const id = current();
          if (performance.now() < lock || !id) return;
          chipsRow.set(id);
        });
      },
      { passive: true },
    );
    scroller.addEventListener("scrollend", () => (lock = 0));
    return (id) => {
      const target = sections.find((s) => s.id === id);
      if (!target) return;
      lock = performance.now() + 900;
      chipsRow.set(id);
      scroller.scrollTo({ top: Math.max(0, target.el.offsetTop - 4), behavior: reducedMotion() ? "auto" : "smooth" });
    };
  }

  draw(pieces, view, weight) {
    return drawing(pieces, view, { colors: this.colors, prefix: this.desk.prefix, weight, paper: this.desk.options.paper });
  }

  personArt(part, view, aspect = 1) {
    const figure = view !== "face" && view !== "avatar";
    const piece = { part: figure ? part : { ...part, body: "head" }, x: 0, y: 0, scale: 1, weight: figure ? 6.4 : 3.6 };
    const geo = pieceGeometry(piece);
    const b = geo.box;
    let x;
    let y;
    let w;
    if (view === "avatar") {
      w = Math.max(b.w, b.h) * 0.94;
      x = b.x + b.w / 2 - w / 2;
      y = b.y + b.h * 0.44 - w / 2;
    } else if (view === "hands" && geo.focus) {
      const f = geo.focus;
      w = Math.max(f.w, f.h) * 1.18;
      x = f.x + f.w / 2 - w / 2;
      y = f.y + f.h / 2 - w / 2 - f.h * 0.04;
    } else if (view === "hold" && b.h > b.w) {
      w = Math.max(b.w * 1.12, b.h * 0.8);
      x = b.x + b.w / 2 - w / 2 + b.w * 0.06;
      y = b.y + b.h * 0.12;
    } else if (view === "upper" && bodyOf(part) !== "lying") {
      w = Math.max(b.w * 1.08, 300);
      x = b.x + b.w / 2 - w / 2;
      y = b.y - 12;
    } else {
      const pad = figure ? 0.08 : 0.12;
      w = Math.max(b.w, b.h / aspect) * (1 + pad);
      x = b.x + b.w / 2 - w / 2;
      y = b.y + b.h / 2 - (w * aspect) / 2;
    }
    const svg = this.draw([piece], `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${(w * aspect).toFixed(1)}`, piece.weight);
    svg.dataset.box = [b.x, b.y, b.w, b.h].map((v) => v.toFixed(1)).join(",");
    return svg;
  }

  peopleTab() {
    const wrap = h("div", { class: "people" });
    this.kinds = h("div", { class: "kinds", role: "radiogroup", "aria-label": "Kind of character" });
    this.kindRing = h("span", { class: "kinds-indicator", "aria-hidden": "true" });
    this.kindSizes?.disconnect();
    this.kindSizes = new ResizeObserver(() => this.placeKindRing(true));
    this.kindSizes.observe(this.kinds);
    this.kinds.append(this.kindRing);
    this.kindTiles = {};
    for (const k of KINDS) {
      const art = h("span", { class: "kind-art" });
      const tile = h(
        "button",
        {
          type: "button",
          class: "kind",
          role: "radio",
          "aria-checked": "false",
          "aria-label": k.label,
          "data-tip": k.label,
          onclick: () => (kindOf(this.person) === k.id ? this.roll() : this.setKind(k.id)),
        },
        art,
      );
      this.kindTiles[k.id] = tile;
      this.kinds.append(tile);
      this.schedule(() => art.append(this.personArt(EXEMPLARS[k.id], "avatar")), true);
    }
    this.preview = h("div", { class: "preview", role: "img", "aria-roledescription": "character", tabindex: "-1" });
    this.badge = h("span", { class: "preview-badge", text: "Editing", hidden: true });
    this.shuffleIcon = h("span", { class: "shuffle-icon", html: icon("shuffle") });
    this.shuffleButton = h(
      "button",
      { type: "button", class: "shuffle", "aria-label": "Shuffle: a new random character", onclick: () => this.roll() },
      this.shuffleIcon,
      h("span", { text: "Shuffle" }),
    );
    const stage = h("div", { class: "preview-wrap" }, this.preview, this.badge, this.shuffleButton);
    this.dragSource(this.preview, () => ({ ...this.person }), { allowed: () => this.editing == null, click: false });
    this.chipSlot = h("div", { class: "chip-slot" });
    this.scroller = h("div", { class: "options-grid", role: "tabpanel" });
    this.tiles = this.lazy(this.scroller);
    this.primary = h("button", {
      type: "button",
      class: "button button-primary button-block",
      onclick: () => (this.editing ? this.desk.select([]) : this.addPerson()),
    });
    const shuffle = h(
      "button",
      { type: "button", class: "button button-secondary library-shuffle", onclick: () => this.roll() },
      h("span", { html: icon("shuffle") }),
      h("span", { text: "Shuffle" }),
    );
    wrap.append(this.kinds, stage, this.chipSlot, this.scroller, h("div", { class: "library-foot" }, shuffle, this.primary));
    this.renderPreview();
    this.renderPeople();
    requestAnimationFrame(() => this.placeKindRing(true));
    return wrap;
  }

  placeKindRing(instant = false) {
    const tile = this.kindTiles?.[kindOf(this.person)];
    if (!tile || !tile.offsetWidth) return;
    if (instant) this.kindRing.style.transition = "none";
    this.kindRing.style.width = `${tile.offsetWidth}px`;
    this.kindRing.style.translate = `${tile.offsetLeft}px 0`;
    if (instant) {
      void this.kindRing.offsetWidth;
      this.kindRing.style.transition = "";
    }
  }

  setKind(kind) {
    if (kindOf(this.person) === kind) return;
    const p = this.person;
    const dir = Math.sign(KINDS.findIndex((k) => k.id === kind) - KINDS.findIndex((k) => k.id === kindOf(p)));
    this.update(
      randomPerson(newSeed(), {
        kind,
        body: p.body,
        arms: p.arms,
        holding: p.holding,
        mood: p.mood,
        age: kind === "robot" && ageOf(p) === "old" ? "adult" : ageOf(p),
      }),
      { dir },
    );
    this.scroller.scrollTo({ top: 0 });
  }

  roll() {
    const p = this.person;
    const keep = { kind: kindOf(p), body: p.body, age: ageOf(p), arms: p.arms };
    if (this.editing) Object.assign(keep, { holding: p.holding, mood: p.mood });
    if (keep.kind === "human") keep.sex = p.sex || "man";
    this.update(randomPerson(newSeed(), keep), { shuffle: true });
    animate(this.shuffleIcon, [{ transform: "none" }, { transform: "scaleX(-1)" }, { transform: "none" }], { duration: 480, easing: EASE_OUT });
  }

  renderPeople() {
    if (!this.scroller) return;
    const p = this.person;
    const kind = kindOf(p);
    for (const [id, tile] of Object.entries(this.kindTiles)) {
      tile.setAttribute("aria-checked", String(id === kind));
      tile.dataset.tip = KINDS.find((k) => k.id === id).label;
    }
    this.placeKindRing();
    const cats = categories(p);
    const key = `${kind}|${cats.map((c) => `${c.id}:${c.sections.map((s) => `${s.key}/${s.title}/${s.options.map((o) => o.id).join(",")}`).join(";")}`).join("|")}`;
    if (key !== this.peopleKey) this.buildPeople(cats, key, kind !== this.peopleKind);
    this.peopleKind = kind;
    for (const tile of this.personTiles) {
      tile.variant = this.variant(tile.key, tile.id);
      tile.node.setAttribute("aria-checked", String(this.current(tile.key) === tile.id));
      tile.dirty = true;
    }
    this.tiles.refresh();
    this.primary.textContent = this.editing ? "Done" : "Add to the cartoon";
    if (this.badge.hidden === !!this.editing) {
      this.badge.hidden = !this.editing;
      if (this.editing) animate(this.badge, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "linear" });
    }
  }

  current(key) {
    const p = this.person;
    if (key === "arms") return armPose(p);
    if (key === "body") return bodyOf(p);
    if (key === "age") return ageOf(p);
    if (key === "sex") return p.sex || "man";
    if (key === "hat") return p.hat || "none";
    if (key === "aid") return p.aid || "none";
    if (key === "eyes" && kindOf(p) !== "human") return p.eyes === "closed" ? "closed" : "dots";
    return p[key];
  }

  buildPeople(cats, key, reset) {
    const keepTop = reset ? 0 : this.scroller.scrollTop;
    this.peopleKey = key;
    this.observer?.disconnect();
    this.tiles = this.lazy(this.scroller);
    this.personTiles = [];
    const blocks = [];
    const sections = [];
    for (const cat of cats) {
      const block = h("section", { class: "option-block", "aria-label": cat.label });
      for (const section of cat.sections) {
        const grid = h("div", { class: `option-tiles tiles-${section.view}`, role: "radiogroup", "aria-label": section.title });
        for (const o of section.options) {
          const art = h("span", { class: "tile-art" });
          const node = h("button", { type: "button", class: "tile", role: "radio", "aria-label": o.label, "data-tip": o.label }, art);
          const view = section.view;
          const shown = () => (section.key === "species" ? { ...tile.variant, age: "adult" } : tile.variant);
          const tile = { node, art, key: section.key, id: o.id, dirty: true, paint: () => this.personArt(shown(), view, section.view === "figure" ? 1.25 : 1) };
          node.addEventListener("click", () => {
            if (node.dataset.dragged == null) this.update(tile.variant);
          });
          this.dragSource(node, () => ({ ...tile.variant }), { click: false, art: () => this.personArt(tile.variant, "figure") });
          grid.append(node);
          this.personTiles.push(tile);
          this.tiles.watch(tile);
        }
        block.append(h("h3", { class: "section-title", text: section.title }), grid);
      }
      blocks.push(block);
      sections.push({ id: cat.id, el: block });
    }
    this.scroller.replaceChildren(...blocks);
    this.scroller.scrollTop = keepTop;
    const active = this.chips?.value && cats.some((c) => c.id === this.chips.value) ? this.chips.value : cats[0].id;
    const row = chips(
      cats.map((c) => ({ id: c.id, label: c.label })),
      active,
      (id) => jump(id),
      { label: "Change" },
    );
    row.value = active;
    const set = row.set;
    row.set = (id, opts) => {
      row.value = id;
      set(id, opts);
    };
    const jump = this.spy(this.scroller, sections, row);
    this.chips = row;
    this.chipSlot.replaceChildren(row);
  }

  variant(key, id) {
    const p = this.person;
    const next = { ...p, [key]: id };
    if (key === "body") {
      const arms = armsFor(id);
      if (!arms.includes(p.arms)) next.arms = arms[0] || p.arms;
    }
    if (key === "age" && id === "old" && (!p.holding || p.holding === "nothing") && ["standing", "walking"].includes(bodyOf(p))) next.holding = "cane";
    if (key === "outfit") {
      const was = costumeHat(p.outfit);
      const hat = costumeHat(id);
      if (hat && (!p.hat || p.hat === "none" || p.hat === was)) next.hat = hat;
      else if (!hat && was && p.hat === was) next.hat = "none";
      if (id === "death") {
        next.hat = "none";
        if ((!p.holding || p.holding === "nothing") && holdsFor(next).includes("scythe")) next.holding = "scythe";
      }
    }
    if (key === "sex" && id === "woman") {
      next.facial = "none";
      if (["short", "part", "crew", "bald", "none"].includes(p.hair)) next.hair = "bob";
    }
    if (key === "sex" && id === "man") {
      if (["bob", "long", "bun", "pigtails"].includes(p.hair)) next.hair = "short";
      if (p.outfit === "dress") next.outfit = "suit";
    }
    return next;
  }

  update(person, { shuffle = false, dir = 0 } = {}) {
    this.person = { ...person };
    if (this.editing) this.desk.replacePart(this.editing, this.person);
    this.renderPreview(true, { shuffle, dir });
    this.renderPeople();
  }

  turn(svg) {
    const stage = this.preview;
    const token = (this.turning = {});
    for (const a of stage.getAnimations()) a.cancel();
    if (reducedMotion()) return swap(stage, svg);
    const out = stage.animate([{ transform: "perspective(700px) rotateY(0deg)" }, { transform: "perspective(700px) rotateY(90deg) scale(0.92)" }], {
      duration: 160,
      easing: "cubic-bezier(0.5, 0, 0.9, 0.6)",
      fill: "forwards",
    });
    out.finished
      .then(() => {
        if (this.turning !== token) return;
        stage.replaceChildren(svg);
        stage.animate([{ transform: "perspective(700px) rotateY(-90deg) scale(0.92)" }, { transform: "none" }], { duration: 420, easing: EASE_OUT });
        out.cancel();
      })
      .catch(() => {});
  }

  renderPreview(fresh = false, { shuffle = false, dir = 0 } = {}) {
    if (!this.preview) return;
    const svg = this.personArt(this.person, "figure", 1.2);
    if (fresh && shuffle) this.turn(svg);
    else if (fresh && dir) swap(this.preview, svg, { dir });
    else if (fresh) morph(this.preview, svg);
    else this.preview.replaceChildren(svg);
    const p = this.person;
    const who = kindOf(p) === "human" ? named("sex", p.sex || "man") : named("species", p.species);
    this.preview.setAttribute("aria-label", `${who}, ${p.mood || "neutral"}, ${bodyOf(p)}`);
  }

  addPerson() {
    this.desk.place(this.person, { from: this.preview });
  }

  edit(piece) {
    this.editing = piece.id;
    this.person = { ...piece.part };
    if (!this.isOpen || this.tab !== "people") this.open("people");
    else {
      this.renderPreview(true);
      this.renderPeople();
    }
  }

  syncSelection() {
    if (!this.isOpen || this.tab !== "people") {
      if (this.tab === "places" && this.isOpen) this.markPlace();
      return;
    }
    const id = this.desk.selected;
    const piece = id && this.desk.items.find((i) => i.id === id);
    if (piece?.kind === "piece" && piece.part.type === "person") {
      if (this.editing === piece.id && same(piece.part, this.person)) return;
      this.editing = piece.id;
      this.person = { ...piece.part };
      this.renderPreview(true);
      this.renderPeople();
      return;
    }
    if (this.editing) {
      this.editing = null;
      this.renderPeople();
    }
  }

  searchField() {
    const input = h("input", {
      type: "search",
      class: "search-input",
      "aria-label": "Search things",
      value: this.query,
      autocomplete: "off",
      spellcheck: "false",
    });
    const word = h("span", { class: "search-word", text: HINTS[0] });
    const roll = h("span", { class: "search-roll" }, word);
    const hint = h("span", { class: "search-hint", "aria-hidden": "true" }, h("span", { text: "Search" }), roll);
    const clear = h("button", { type: "button", class: "search-clear", tabindex: "-1", html: icon("x"), onpointerdown: (e) => e.preventDefault() });
    const lead = h("button", {
      type: "button",
      class: "search-icon",
      tabindex: "-1",
      "aria-label": "Search",
      html: icon("search"),
      onpointerdown: (e) => e.preventDefault(),
    });
    const label = h("label", { class: "search" }, lead, input, hint, clear);
    let n = 0;
    const tick = () => {
      if (!this.desk.root.isConnected) return;
      if (label.isConnected && !this.query) {
        n = (n + 1) % HINTS.length;
        const old = roll.lastElementChild;
        const next = h("span", { class: "search-word", text: HINTS[n] });
        roll.style.width = `${old.offsetWidth}px`;
        roll.append(next);
        roll.style.width = `${next.offsetWidth}px`;
        const lift = roll.clientHeight;
        const ticker = { duration: 900, easing: SPRING.easing };
        animate(next, [{ transform: `translateY(${lift}px)` }, { transform: "none" }], { ...ticker, fill: "backwards" });
        animate(old, [{ transform: "none" }, { transform: `translateY(${-lift}px)` }], { ...ticker, fill: "forwards" }).done.then(() => old.remove());
      }
      this.hintTimer = setTimeout(tick, 2600);
    };
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(tick, 2600);
    const sync = () => {
      label.toggleAttribute("data-filled", !!this.query);
      clear.setAttribute("aria-label", this.query ? "Clear the search" : "Close search");
      clear.dataset.tip = this.query ? "Clear" : "Close";
    };
    sync();
    return { label, input, clear, lead, sync };
  }

  thingsTab() {
    const wrap = h("div", { class: "things" });
    const search = this.searchField();
    const groups = THING_GROUPS.filter((g) => g.ids.some((id) => THINGS[id]));
    const scroller = h("div", { class: "scroll" });
    const tiles = this.lazy(scroller);
    const tileFor = (id) => {
      const art = h("span", { class: "tile-art" });
      const node = h("button", { type: "button", class: "tile thing", role: "listitem", "aria-label": THINGS[id].label, "data-tip": THINGS[id].label }, art);
      this.dragSource(node, () => ({ type: "thing", name: id }));
      tiles.watch({ node, art, dirty: true, paint: () => this.thingArt(id), ready: () => !!this.thingCache?.has(id) });
      return node;
    };
    const sections = groups.map((g) => {
      const el = h(
        "section",
        { class: "option-block", "aria-label": g.label },
        h("h3", { class: "section-title", text: g.label }),
        h("div", { class: "thing-grid", role: "list" }, ...g.ids.filter((id) => THINGS[id]).map(tileFor)),
      );
      return { id: g.id, el };
    });
    const results = h("div", { class: "thing-grid", role: "list", hidden: true });
    const found = new Map();
    const emptyTitle = h("p", { class: "empty-title" });
    const empty = h(
      "div",
      { class: "empty", role: "status", hidden: true },
      emptyTitle,
      h("p", { class: "empty-note", text: "Try another word, like lamp or sofa." }),
    );
    scroller.append(...sections.map((s) => s.el), results, empty);
    const row = chips(
      groups.map((g) => ({ id: g.id, label: g.label })),
      groups[0].id,
      (id) => {
        if (this.query) {
          search.input.value = "";
          this.query = "";
          fill();
        }
        jump(id);
      },
      { label: "Kinds of things" },
    );
    const jump = this.spy(scroller, sections, row);
    this.chips = row;
    const mode = () => {
      const open = this.desk.shadow.activeElement === search.input || !!this.query;
      if (wrap.hasAttribute("data-open") === open) return;
      wrap.toggleAttribute("data-open", open);
      search.lead.toggleAttribute("data-still", open);
      search.clear.tabIndex = open ? 0 : -1;
      if (!open) row.refresh();
    };
    search.lead.addEventListener("click", (e) => {
      e.preventDefault();
      search.input.focus();
    });
    search.input.addEventListener("focus", mode);
    search.input.addEventListener("blur", () => setTimeout(mode, 0));
    search.label.addEventListener("click", () => setTimeout(mode, 0));
    const fill = () => {
      const q = this.query.trim().toLowerCase();
      search.sync();
      mode();
      const wasSearching = !results.hidden;
      for (const s of sections) s.el.hidden = !!q;
      results.hidden = !q;
      if (wasSearching && !q && !reducedMotion())
        for (const s of sections) animate(s.el, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "linear" });
      if (!q) {
        results.replaceChildren();
        empty.hidden = true;
        return;
      }
      const words = q.split(/\s+/).filter(Boolean);
      const ids = ALL_THINGS.filter((id) => matches(id, words));
      const before = new Map(wasSearching ? [...results.children].map((n) => [n, n.getBoundingClientRect()]) : []);
      const nodes = ids.map((id) => found.get(id) || found.set(id, tileFor(id)).get(id));
      results.replaceChildren(...nodes);
      if (!ids.length && !empty.querySelector(".empty-art")) {
        const art = h("span", { class: "empty-art", "aria-hidden": "true" });
        art.append(
          this.personArt(
            { ...randomPerson(7, { kind: "human", body: "standing" }), mood: "worried", holding: "magnifier", glasses: "none", hat: "none" },
            "figure",
            1.2,
          ),
        );
        empty.prepend(art);
      }
      if (!ids.length && empty.hidden && !reducedMotion())
        animate(
          empty,
          [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: SPRING.duration, easing: SPRING.easing },
        );
      empty.hidden = ids.length > 0;
      emptyTitle.textContent = `Nothing called “${this.query.trim()}” yet`;
      scroller.scrollTop = 0;
      if (reducedMotion()) return;
      const view = scroller.getBoundingClientRect();
      for (const n of nodes) {
        const b = n.getBoundingClientRect();
        if (b.top > view.bottom) break;
        const a = before.get(n);
        if (!a)
          animate(
            n,
            [
              { opacity: 0, transform: "scale(0.92)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 240, easing: EASE_OUT },
          );
        else if (Math.abs(a.left - b.left) + Math.abs(a.top - b.top) > 1)
          animate(n, [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: "none" }], {
            duration: SPRING.duration * 0.7,
            easing: SPRING.easing,
          });
      }
    };
    search.input.addEventListener("input", () => {
      this.query = search.input.value;
      fill();
    });
    search.clear.addEventListener("click", (e) => {
      e.preventDefault();
      const typed = !!this.query;
      search.input.value = "";
      this.query = "";
      if (!typed) search.input.blur();
      fill();
      if (typed) search.input.focus();
    });
    search.input.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (!search.input.value) return search.input.blur();
      search.input.value = "";
      this.query = "";
      fill();
    });
    fill();
    wrap.append(h("div", { class: "search-row" }, row, search.label), scroller);
    tiles.prime(36);
    this.warmThings();
    return wrap;
  }

  thingArt(name) {
    this.thingCache ??= new Map();
    let svg = this.thingCache.get(name);
    if (!svg) {
      const part = { type: "thing", name, seed: 3 };
      const size = partSize(part);
      const piece = { part, x: 0, y: 0, scale: 1, weight: Math.max(size.w, size.h) * 0.026 };
      const b = pieceGeometry(piece).box;
      const side = Math.max(b.w, b.h) * 1.16;
      svg = this.draw(
        [piece],
        `${(b.x + b.w / 2 - side / 2).toFixed(1)} ${(b.y + b.h / 2 - side / 2).toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`,
        piece.weight,
      );
      svg.dataset.box = [b.x, b.y, b.w, b.h].map((v) => v.toFixed(1)).join(",");
      this.thingCache.set(name, svg);
    }
    return svg.cloneNode(true);
  }

  warmThings() {
    if (this.warming) return;
    this.warming = true;
    const things = ALL_THINGS.filter((id) => !this.thingCache?.has(id)).map((id) => () => this.thingArt(id));
    const places = PLACE_ORDER.filter((id) => !this.placeCache?.has(id)).map((id) => () => this.placeArt(id));
    const queue = [...things.slice(0, 36), ...places.slice(0, 16), ...things.slice(36), ...places.slice(16)];
    const idle = window.requestIdleCallback || ((fn) => setTimeout(() => fn({ timeRemaining: () => 8 }), 60));
    const step = (deadline) => {
      while (queue.length && deadline.timeRemaining() > 4) queue.shift()();
      if (queue.length) idle(step);
      else this.warming = false;
    };
    idle(step);
  }

  placesTab() {
    const grid = h("div", { class: "place-grid", role: "radiogroup", "aria-label": "Places" });
    const scroller = h("div", { class: "scroll scroll-places" }, grid);
    const tiles = this.lazy(scroller);
    const none = h(
      "button",
      {
        type: "button",
        class: "tile place",
        role: "radio",
        "data-place": "",
        "aria-label": "No place",
        "data-tip": "No place",
        onclick: () => this.pickPlace(null),
      },
      h("span", { class: "tile-art tile-empty", html: icon("square-dashed") }),
    );
    grid.append(none);
    for (const id of PLACE_ORDER) {
      const art = h("span", { class: "tile-art" });
      const node = h(
        "button",
        {
          type: "button",
          class: "tile place",
          role: "radio",
          "data-place": id,
          "aria-label": PLACES[id].label,
          "data-tip": PLACES[id].label,
          onclick: () => node.dataset.dragged == null && this.pickPlace(id, node),
        },
        art,
      );
      this.dragSource(node, () => null, { click: false, drop: (ghost) => this.pickPlace(id, ghost) });
      grid.append(node);
      tiles.watch({ node, art, dirty: true, paint: () => this.placeArt(id), ready: () => !!this.placeCache?.has(id) });
    }
    this.placeGrid = grid;
    this.markPlace();
    tiles.prime(16);
    this.warmThings();
    return scroller;
  }

  markPlace() {
    if (!this.placeGrid) return;
    const current = this.desk.currentPlace || "";
    for (const tile of this.placeGrid.children) tile.setAttribute("aria-checked", String(tile.dataset.place === current));
  }

  pickPlace(id, from = null) {
    this.desk.placeScene(id, { from });
    this.markPlace();
  }

  placeArt(name) {
    this.placeCache ??= new Map();
    let svg = this.placeCache.get(name);
    if (!svg) {
      const { w, h: hgt } = this.desk.board;
      const pieces = PLACES[name].pieces.map((p) => ({
        part: { ...p.part, seed: 3 },
        x: (p.x * w) / 1000,
        y: (p.y * hgt) / 800,
        scale: (p.scale * hgt) / 800,
        flip: p.flip,
        weight: 7,
      }));
      svg = this.draw(pieces, `0 0 ${w} ${hgt}`, 7);
      this.placeCache.set(name, svg);
    }
    return svg.cloneNode(true);
  }

  dragSource(node, partFor, { allowed = () => true, click = true, art: artFor = null, drop = null } = {}) {
    node.addEventListener("touchmove", (e) => node.hasAttribute("data-held") && e.cancelable && e.preventDefault(), { passive: false });
    node.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || !allowed()) return;
      const start = { x: e.clientX, y: e.clientY };
      const scrolls = e.pointerType === "touch" && getComputedStyle(node).touchAction !== "none";
      let held = !scrolls;
      const hold = scrolls
        ? setTimeout(() => {
            held = true;
            node.toggleAttribute("data-held", true);
          }, HOLD)
        : 0;
      let ghost = null;
      const move = (ev) => {
        const far = Math.hypot(ev.clientX - start.x, ev.clientY - start.y) >= DRAG;
        if (!held) {
          if (far) up(ev);
          return;
        }
        if (!ghost && !far) return;
        if (!ghost) {
          ghost = h("div", { class: "ghost", "aria-hidden": "true" });
          const art = artFor ? artFor() : node.querySelector("svg")?.cloneNode(true);
          if (art) ghost.append(art);
          this.desk.root.append(ghost);
          animate(
            ghost,
            [
              { opacity: 0, transform: "scale(0.94)" },
              { opacity: 0.92, transform: "none" },
            ],
            { duration: 140, easing: EASE_OUT },
          );
          node.setAttribute("data-dragging", "");
          this.desk.panel.toggleAttribute("data-drop", true);
        }
        const host = this.desk.root.getBoundingClientRect();
        ghost.style.left = `${ev.clientX - host.left}px`;
        ghost.style.top = `${ev.clientY - host.top}px`;
        const over = this.overPaper(ev);
        ghost.toggleAttribute("data-over", over);
      };
      const up = (ev) => {
        clearTimeout(hold);
        node.removeAttribute("data-held");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        if (!ghost) {
          if (ev.type === "pointerup" && click) this.placeFromTile(partFor(), undefined, node);
          return;
        }
        node.removeAttribute("data-dragging");
        this.desk.panel.removeAttribute("data-drop");
        node.dataset.dragged = "";
        setTimeout(() => delete node.dataset.dragged, 0);
        if (ev.type === "pointerup" && this.overPaper(ev)) {
          const r = this.desk.panel.getBoundingClientRect();
          if (drop) drop(ghost);
          else
            this.placeFromTile(
              partFor(),
              { x: ((ev.clientX - r.left) / r.width) * this.desk.board.w, y: ((ev.clientY - r.top) / r.height) * this.desk.board.h },
              ghost,
            );
          ghost.remove();
        } else {
          const back = node.getBoundingClientRect();
          const g = ghost.getBoundingClientRect();
          const out = animate(
            ghost,
            [
              { transform: "none", opacity: 0.92 },
              {
                transform: `translate(${back.left + back.width / 2 - (g.left + g.width / 2)}px, ${back.top + back.height / 2 - (g.top + g.height / 2)}px) scale(0.6)`,
                opacity: 0,
              },
            ],
            { duration: 260, easing: EASE, fill: "forwards" },
          );
          out.done.then(() => ghost.remove());
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    });
    node.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && node.getAttribute("role") === "listitem") {
        e.preventDefault();
        this.placeFromTile(partFor(), undefined, node);
      }
    });
  }

  overPaper(e) {
    const r = this.desk.panel.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }

  placeFromTile(part, at, from) {
    this.desk.place(part, { at, from });
  }
}
