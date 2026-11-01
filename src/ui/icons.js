import DATA from "./icon-data.js";

const attrs = (a) =>
  Object.entries(a)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

export function icon(name) {
  const nodes = (DATA[name] || []).map(([tag, a], i) => `<${tag} data-n="${i}" pathLength="1" ${attrs(a)}/>`);
  return `<svg class="icon" data-icon="${name}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${nodes.join("")}</svg>`;
}
