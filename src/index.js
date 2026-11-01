import { Desk } from "./ui/desk.js";

export { Desk };
export { PENS, PEN_ORDER, TONES } from "./core/pens.js";
export { BRUSHES } from "./core/brushes.js";
export { FIGURES } from "./core/figures.js";
export { BUBBLES } from "./core/bubbles.js";
export { THINGS, THING_ORDER } from "./parts/things.js";
export { PLACES, PLACE_ORDER } from "./parts/places.js";
export { MOODS, BODIES, OUTFITS, HOLDING, randomPerson } from "./parts/people.js";
export { therapist as exampleTherapist, flyingCars as exampleFlyingCars } from "./examples.js";
export { defineInkling } from "./element.js";

export function createInkling(target, options) {
  return new Desk(target, options);
}
