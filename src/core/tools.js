import { PENS } from "./pens.js";

export const INSERTS = {
  shape: { id: "shape", label: "Shape", size: [1, 14, 3.4] },
  text: { id: "text", label: "Text", key: "t", size: [12, 120, 24] },
  bubble: { id: "bubble", label: "Speech bubble", key: "c", size: [12, 64, 24] },
};

export const INSERT_ORDER = ["shape", "text", "bubble"];

export const toolMeta = (id) => PENS[id] || INSERTS[id] || null;

export const INKED = new Set(["nib", "fineliner", "brush", "hatch", "shape", "text", "bubble"]);

export const OPACITY = [0.01, 1];

export const LIBRARY_TABS = [
  { id: "people", label: "Characters", icon: "smile" },
  { id: "things", label: "Things", icon: "lamp" },
  { id: "places", label: "Places", icon: "map" },
];

export const TEXT_MODES = [
  { id: "text", label: "Text", icon: "type", key: "T" },
  { id: "path", label: "Text on a path", icon: "spline" },
];
