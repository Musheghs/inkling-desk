function blur(src, w, h, sigma) {
  const radius = Math.max(1, Math.ceil(sigma * 3));
  const kernel = new Float32Array(radius * 2 + 1);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) sum += kernel[i + radius] = Math.exp(-(i * i) / (2 * sigma * sigma));
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = x + k < 0 ? 0 : x + k >= w ? w - 1 : x + k;
        acc += src[row + xx] * kernel[k + radius];
      }
      tmp[row + x] = acc;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const yy = y + k < 0 ? 0 : y + k >= h ? h - 1 : y + k;
        acc += tmp[yy * w + x] * kernel[k + radius];
      }
      out[y * w + x] = acc;
    }
  }
  return out;
}

export function drawCover(source, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const sw = source.width;
  const sh = source.height;
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return canvas;
}

export function inkLines(photo, { sigma = 1.1, k = 1.6, tau = 0.985, epsilon = 0.012, phi = 70 } = {}) {
  const w = photo.width;
  const h = photo.height;
  const ctx = photo.getContext("2d", { willReadFrequently: true });
  const data = ctx.getImageData(0, 0, w, h);
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data.data[i * 4];
    const g = data.data[i * 4 + 1];
    const b = data.data[i * 4 + 2];
    gray[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  const g1 = blur(gray, w, h, sigma);
  const g2 = blur(gray, w, h, sigma * k);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  const img = octx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const d = g1[i] - tau * g2[i];
    const v = d >= epsilon ? 1 : 1 + Math.tanh(phi * (d - epsilon));
    const c = Math.max(0, Math.min(255, Math.round(v * 255)));
    img.data[i * 4] = c;
    img.data[i * 4 + 1] = c;
    img.data[i * 4 + 2] = c;
    img.data[i * 4 + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}
