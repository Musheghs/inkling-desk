# Inkling

A drawing desk for single-panel cartoons, built for people who say they can't draw. Steady pens, shapes that snap, a wash that fills, a cast of characters, things and places, speech bubbles, and a typeset caption. Exports SVG and PNG. No dependencies.

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

The desk fills its parent, so give the parent a height.

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

The build is about 275 KB gzipped, including the caption typeface. The interface renders in a Shadow DOM, so page styles don't leak in.

## Features

- **Pens:** dip pen, fineliner, brush (thirteen heads), wash, hatching, an area eraser and a sketch pencil. Each has a steady-hand setting and its own colour, drawn exactly as picked; only the colour's own opacity makes it see-through. Sketch pencil lines are a guide only; they don't print or save. The wooden ruler at the end of the tray lies on the paper: drag it into place, turn it by either end (⇧ snaps to 15°) and draw along its edge.
- **Shapes:** rectangle, ellipse, line, arrow, triangle, diamond, polygon, star, heart, cloud and burst. Neat, hand-drawn or sketchy, with no fill, a wash or a solid fill. A rough shape snaps clean when you hold still at the end of the stroke.
- **Text:** serif, serif italic, sans or capitals, on the paper or along a path.
- **Speech bubbles:** speech, thought, shout, whisper or box, with a tail aimed at a character's mouth.
- **Characters:** people, aliens, robots and animals, built like an avatar maker. Age, pose (including a wheelchair), mood, face, hair, clothes, costumes, hats, arm positions, things to hold, glasses and hearing aids. Every part can be coloured separately.
- **Things and places:** 181 things in ten groups, with search, and 42 places.
- **Caption:** set in Newsreader, centred and balanced, with smart quotes, bold and underline, roman or italic, and three sizes.
- **Hand:** select, move, resize, rotate, flip, reorder, duplicate and recolour anything. Rotate from just outside a corner; ⇧ snaps to 15°.
- **Extras:** trace over a photo, sign the cartoon, and choose a washed, ruled or plain frame. Without a frame the whole paper is drawable, and the caption sits on a soft paper label you can switch off (Caption background).

## Options

| Option | Default | Description |
| --- | --- | --- |
| `board` | `{ w: 1000, h: 800 }` | Drawing size in board units |
| `tools` | all pens | Any of `nib`, `fineliner`, `brush`, `pencil`, `wash`, `hatch`, `eraser`, in order |
| `cast` | `true` | Characters, things and places panel |
| `shapes`, `text`, `bubbles` | `true` | Shape, text and speech bubble tools |
| `trace`, `signature` | `true` | Photo tracing and signing |
| `caption` | `true` | Caption under the drawing |
| `quotes` | `true` | Wrap the caption in quotation marks |
| `placeholder` | `"Write the caption"` | Empty caption text |
| `frame` | `"wash"` | `"wash"`, `"line"` or `"none"` |
| `contain` | `true` | Keep the drawing inside the frame |
| `theme` | `"auto"` | `"light"`, `"dark"` or `"auto"` |
| `paper`, `desk` | `#fffefa`, none | Sheet colour and background behind it |
| `ink`, `pencil`, `wash` | | Default colours |
| `captionFont`, `uiFont` | Newsreader, system | Typefaces |
| `exportPencils` | `false` | Include sketch pencil lines in exports |
| `storageKey` | | Save the drawing to `localStorage` under this key |
| `rememberTools` | `true` | Remember the last tool and colours between visits (sizes always start at their defaults) |
| `initial` | | A drawing from `getDrawing()` to open with |
| `shortcuts` | `true` | Single-key shortcuts |
| `inset` | `20` | Distance from the bars to the edges |
| `minSize` | `{ width: 375, height: 640 }` | Below this size the desk shows a "not enough room" message instead of the tools; `false` turns it off |
| `readonly` | `false` | Show the cartoon without tools |
| `onChange` | | Called with the drawing after every change |

The web component takes the same options as attributes in kebab case (`storage-key`, `caption-font`), and boolean features turn off with `="false"`.

## Methods

| Method | |
| --- | --- |
| `getDrawing()` / `setDrawing(drawing)` | Read or replace the drawing as plain JSON |
| `toSvg()` | The cartoon as an SVG string |
| `toPng(scale)` | The cartoon as a PNG blob |
| `download(name, "png" \| "svg", scale)` | Save a file |
| `undo()`, `redo()`, `clear()` | History |
| `setTool(id)` | Switch tool (`"hand"` or a pen id) |
| `setCaption(text, html?)` | Set the caption |
| `place(part)`, `placeScene(name)` | Add a piece or set the place |
| `setFrame(mode)`, `setOptions(options)` | Change settings |
| `destroy()` | Remove the desk |

The element fires a `change` event with the drawing in `event.detail`.

## Keyboard

| Key | |
| --- | --- |
| <kbd>V</kbd> | Move |
| <kbd>N</kbd> <kbd>F</kbd> <kbd>B</kbd> <kbd>P</kbd> <kbd>W</kbd> <kbd>H</kbd> <kbd>E</kbd> | Dip pen, fineliner, brush, pencil, wash, hatching, eraser |
| <kbd>R</kbd> <kbd>O</kbd> <kbd>L</kbd> | Rectangle, ellipse, line |
| <kbd>T</kbd> <kbd>C</kbd> | Text, speech bubble |
| <kbd>[</kbd> <kbd>]</kbd> | Smaller, larger |
| <kbd>1</kbd>–<kbd>9</kbd> <kbd>0</kbd> | Opacity of the current colour, 10–90%, 100% |
| <kbd>⌘Z</kbd> <kbd>⇧⌘Z</kbd> | Undo, redo |
| <kbd>⌘D</kbd> <kbd>⌘A</kbd> <kbd>⌫</kbd> | Duplicate, select all, remove |
| <kbd>⇧I</kbd> | Open or close the characters, things and places panel |
| <kbd>⌘\</kbd> | Hide or show the tools |
| <kbd>Esc</kbd> | Close a menu, then clear the selection |

## Theming

Every colour, radius, size, font and timing in the interface is a custom property on the element. Override them on `inkling-desk` (or the `.inkling` wrapper) to restyle it. Light and dark themes define the same set:

- Brand: `--color-primary`, `--color-primary-hover`, `--color-primary-pressed` (the primary button, sliders, switches and selection all follow it)
- Surfaces and text: `--bg-*`, `--text-*`, `--border-*`
- Buttons: `--button-primary-*`, `--button-secondary-*`, `--button-ghost-*`, `--button-selected-*`
- Shape: `--radius-wrapper`, `--radius-inner-wrapper`, `--radius-small`, `--radius-full`
- Type: `--font-family`, `--font-family-caption`, `--font-size-*`, `--font-weight-*`
- Layout: `--space-*`, `--control-sm` to `--control-xl`, `--layout-margin`
- Depth and motion: `--shadow-*`, `--ease-*`, `--duration-*`

On narrow screens (below 820px) the desk works like a story editor. A rail floats on the right of the paper with Draw, Shapes, Text, Speech bubble, the three libraries, Frame, Save, More and Hide the tools. Hidden tools leave one button at the bottom, below the paper. Picking Draw, Shapes, Text or Speech bubble tucks the rail away and opens that tool from the bottom: its choices (pens, shapes, kinds of text or bubble styles) in one bar, and its colour and size above, with everything else under the ⋯ button. Done brings the rail back. Undo and redo stay centred at the top.

With Reduce Motion turned on, animations become simple fades.

## Browser support

The current versions of Chrome, Edge, Safari and Firefox.

## Development

```sh
npm install
npm run dev      # demo at http://localhost:5799
npm run build    # dist/inkling.mjs and dist/inkling.js
npm run format   # Prettier
```

## License

MIT. Icons from [Lucide](https://lucide.dev) (ISC). The caption typeface is [Newsreader](https://github.com/productiontype/Newsreader) by Production Type (SIL Open Font License 1.1). Full texts are in `LICENSE`.
