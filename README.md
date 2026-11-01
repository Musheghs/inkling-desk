# Inkling

Inkling is a drawing desk for single-panel cartoons. It brings together steady pens, a ruler, shapes that snap clean, a library of characters, things and places, speech bubbles and a typeset caption, then exports the finished panel as SVG or PNG. It runs in the browser and has no dependencies.

## Install

```sh
npm install inkling-desk
```

## Usage

```js
import { createInkling } from "inkling-desk";

const desk = createInkling(document.querySelector("#desk"), {
  theme: "dark",
  storageKey: "my-cartoon",
});
```

The desk fills its container, so give the container a height.

### Web component

```html
<script type="module">
  import { defineInkling } from "inkling-desk";
  defineInkling();
</script>

<inkling-desk style="height: 640px" theme="light" tools="nib pencil wash"></inkling-desk>
```

### Script tag

```html
<script src="https://unpkg.com/inkling-desk/dist/inkling.js"></script>
<script>
  Inkling.createInkling(document.querySelector("#desk"));
</script>
```

The build is about 275 KB gzipped, including the caption typeface. The interface renders inside a Shadow DOM, so it neither inherits nor affects your page styles.

## Features

- **Pens.** Dip pen, fineliner, brush with thirteen heads, wash, hatching, an area eraser and a sketch pencil. Every pen has a steady-hand setting and its own colour, and draws that colour exactly as picked; opacity is a separate, deliberate choice. Sketch pencil lines are guides and never appear in exports.
- **Ruler.** Lay the ruler on the paper, drag it into place, turn it by either end and draw along its edge. Hold ⇧ to turn in 15° steps.
- **Shapes.** Rectangle, ellipse, line, arrow, triangle, diamond, polygon, star, heart, cloud and burst, drawn neat, hand-drawn or sketchy, with no fill, a wash or a solid fill. Pause at the end of a rough stroke and it settles into a clean shape.
- **Text.** Serif, serif italic, sans or capitals, set on the paper or along a path.
- **Speech bubbles.** Speech, thought, shout, whisper and box, with a tail that points at a character's mouth.
- **Characters.** People, aliens, robots and animals, assembled like an avatar. Choose age, pose (including a wheelchair), mood, face, hair, clothes, costumes, hats, arm positions, things to hold, glasses and hearing aids, and colour each part separately.
- **Things and places.** 181 things in ten searchable groups and 42 ready-made places.
- **Caption.** Set in Newsreader, centred and balanced, with smart quotes, bold and underline, roman or italic, in three sizes.
- **Editing.** Select, move, resize, rotate, flip, reorder, duplicate and recolour anything on the paper. Rotate from just outside a corner; hold ⇧ for 15° steps.
- **Finishing.** Trace over a photo, sign the cartoon, and frame it with a wash, a ruled line or nothing at all. Without a frame the whole sheet is drawable, and the caption sits on a soft paper label that can be turned off.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `board` | `{ w: 1000, h: 800 }` | Drawing size in board units |
| `tools` | all pens | Any of `nib`, `fineliner`, `brush`, `wash`, `hatch`, `eraser`, `pencil`, in the order given |
| `cast` | `true` | Characters, things and places library |
| `shapes`, `text`, `bubbles` | `true` | Shape, text and speech bubble tools |
| `trace`, `signature` | `true` | Photo tracing and signing |
| `caption` | `true` | Caption below the drawing |
| `quotes` | `true` | Wrap the caption in quotation marks |
| `placeholder` | `"Write the caption"` | Text shown while the caption is empty |
| `frame` | `"wash"` | `"wash"`, `"line"` or `"none"` |
| `contain` | `true` | Keep the drawing inside the frame |
| `theme` | `"auto"` | `"light"`, `"dark"` or `"auto"` |
| `paper`, `desk` | `#fffefa`, none | Sheet colour and the background behind it |
| `ink`, `pencil`, `wash` | | Default colours |
| `captionFont`, `uiFont` | Newsreader, system | Typefaces for the caption and the interface |
| `exportPencils` | `false` | Include sketch pencil lines in exports |
| `storageKey` | | Save the drawing to `localStorage` under this key |
| `rememberTools` | `true` | Remember the last tool and colours between visits; sizes always start from their defaults |
| `initial` | | A drawing from `getDrawing()` to open with |
| `shortcuts` | `true` | Single-key shortcuts |
| `inset` | `20` | Distance between the toolbars and the edges |
| `minSize` | `{ width: 375, height: 640 }` | Below this size the desk shows a "not enough room" message instead of the tools; `false` turns it off |
| `readonly` | `false` | Show the cartoon without any tools |
| `onChange` | | Called with the drawing after every change |

The web component accepts the same options as kebab-case attributes (`storage-key`, `caption-font`). Turn a feature off with `="false"`.

## Methods

| Method | Description |
| --- | --- |
| `getDrawing()`, `setDrawing(drawing)` | Read or replace the drawing as plain JSON |
| `toSvg()` | Return the cartoon as an SVG string |
| `toPng(scale)` | Return the cartoon as a PNG blob |
| `download(name, "png" \| "svg", scale)` | Save the cartoon as a file |
| `undo()`, `redo()`, `clear()` | Step through or reset the history |
| `setTool(id)` | Switch to `"hand"` or a pen |
| `setCaption(text, html?)` | Set the caption |
| `place(part)`, `placeScene(name)` | Add a piece, or set the place |
| `setFrame(mode)`, `setOptions(options)` | Change settings |
| `destroy()` | Remove the desk |

The web component fires a `change` event with the drawing in `event.detail`.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| <kbd>V</kbd> | Move |
| <kbd>N</kbd> <kbd>F</kbd> <kbd>B</kbd> <kbd>W</kbd> <kbd>H</kbd> <kbd>E</kbd> <kbd>P</kbd> | Dip pen, fineliner, brush, wash, hatching, eraser, sketch pencil |
| <kbd>R</kbd> <kbd>O</kbd> <kbd>L</kbd> <kbd>⇧L</kbd> | Rectangle, ellipse, line, arrow |
| <kbd>T</kbd> <kbd>C</kbd> | Text, speech bubble |
| <kbd>[</kbd> <kbd>]</kbd> | Smaller, larger |
| <kbd>1</kbd>–<kbd>9</kbd> <kbd>0</kbd> | Opacity of the current colour, 10–90% or 100% |
| <kbd>⌘Z</kbd> <kbd>⇧⌘Z</kbd> | Undo, redo |
| <kbd>⌘D</kbd> <kbd>⌘A</kbd> <kbd>⌫</kbd> | Duplicate, select all, delete |
| <kbd>⇧I</kbd> | Open or close the library |
| <kbd>⌘\</kbd> | Hide or show the tools |
| <kbd>Esc</kbd> | Close a menu, then clear the selection |

## Theming

Every colour, radius, size, font and timing in the interface is a CSS custom property. Override them on `inkling-desk`, or on the `.inkling` wrapper, to restyle the desk. The light and dark themes define the same set:

- **Brand:** `--color-primary`, `--color-primary-hover`, `--color-primary-pressed`. The primary button, sliders, switches and selection follow it.
- **Surfaces and text:** `--bg-*`, `--text-*`, `--border-*`
- **Buttons:** `--button-primary-*`, `--button-secondary-*`, `--button-ghost-*`, `--button-selected-*`
- **Shape:** `--radius-wrapper`, `--radius-inner-wrapper`, `--radius-small`, `--radius-full`
- **Type:** `--font-family`, `--font-family-caption`, `--font-size-*`, `--font-weight-*`
- **Layout:** `--space-*`, `--control-sm` to `--control-xl`, `--layout-margin`
- **Depth and motion:** `--shadow-*`, `--ease-*`, `--duration-*`

## Small screens

Below 820px the desk switches to a layout built for touch. A rail on the right of the paper holds Draw, Shapes, Text, Speech bubble, the three libraries, Frame, Save, More and Hide the tools. Choosing Draw, Shapes, Text or Speech bubble tucks the rail away and opens that tool from the bottom, with its choices in one bar and its colour and size just above. Done brings the rail back, and undo and redo stay centred at the top.

## Accessibility

Controls carry accessible labels, menus can be driven from the keyboard, and with Reduce Motion turned on, animations become simple fades.

## Browser support

Current versions of Chrome, Edge, Safari and Firefox.

## Development

```sh
npm install
npm run dev      # demo at http://localhost:5799
npm run build    # dist/inkling.mjs and dist/inkling.js
npm run format   # Prettier
```

## License

MIT. Icons are from [Lucide](https://lucide.dev) (ISC). The caption typeface is [Newsreader](https://github.com/productiontype/Newsreader) by Production Type, under the SIL Open Font License 1.1. The full texts are in `LICENSE`.
