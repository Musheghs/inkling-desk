import regular from "../fonts/newsreader-text-regular.woff2?inline";
import italic from "../fonts/newsreader-text-italic.woff2?inline";
import semibold from "../fonts/newsreader-text-semibold.woff2?inline";
import semiboldItalic from "../fonts/newsreader-text-semibold-italic.woff2?inline";

export const SERIF = '"Inkling Serif", Newsreader, Georgia, serif';

const face = (src, style, weight) =>
  `@font-face{font-family:"Inkling Serif";src:url(${src}) format("woff2");font-style:${style};font-weight:${weight};font-display:swap}`;

export function loadFonts() {
  if (typeof document === "undefined" || document.querySelector("style[data-inkling-fonts]")) return;
  const style = document.createElement("style");
  style.setAttribute("data-inkling-fonts", "");
  style.textContent = face(regular, "normal", 400) + face(italic, "italic", 400) + face(semibold, "normal", 600) + face(semiboldItalic, "italic", 600);
  document.head.append(style);
}
