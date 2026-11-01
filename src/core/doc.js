import { overlaps } from "./geometry.js";

let counter = 0;
export const uid = (prefix = "i") => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

export function applyEraser(items, eraser, toLocal, boxOf = (item) => item.box) {
  return items.map((item) => {
    if (item.kind === "erase" || !overlaps(boxOf(item), eraser.box)) return item;
    if (item.kind === "piece") {
      const local = toLocal(item, eraser);
      return local ? { ...item, erase: [...(item.erase || []), local] } : item;
    }
    return { ...item, erase: [...(item.erase || []), item.t ? { id: eraser.id, t: item.t } : eraser.id] };
  });
}

export function prune(items) {
  const used = new Set();
  for (const item of items) {
    for (const ref of item.erase || []) {
      if (typeof ref === "string") used.add(ref);
      else if (ref && ref.id) used.add(ref.id);
    }
  }
  return items.filter((item) => item.kind !== "erase" || used.has(item.id));
}

export class History {
  constructor(items = []) {
    this.items = items;
    this.past = [];
    this.future = [];
  }

  commit(items) {
    if (items === this.items) return false;
    this.past.push(this.items);
    if (this.past.length > 300) this.past.shift();
    this.future = [];
    this.items = items;
    return true;
  }

  replace(items) {
    this.items = items;
  }

  mark(before) {
    if (before === this.items) return;
    this.past.push(before);
    if (this.past.length > 300) this.past.shift();
    this.future = [];
  }

  undo() {
    if (!this.past.length) return false;
    this.future.push(this.items);
    this.items = this.past.pop();
    return true;
  }

  redo() {
    if (!this.future.length) return false;
    this.past.push(this.items);
    this.items = this.future.pop();
    return true;
  }

  reset(items = []) {
    this.items = items;
    this.past = [];
    this.future = [];
  }
}
