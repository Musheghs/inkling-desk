import { createInkling } from "../src/index.js";

const params = new URLSearchParams(location.search);

const desk = createInkling(document.getElementById("desk"), {
  storageKey: params.has("fresh") ? null : "inkling:demo",
  rememberTools: !params.has("fresh"),
  theme: params.get("theme") || "auto",
});

window.inkling = desk;
