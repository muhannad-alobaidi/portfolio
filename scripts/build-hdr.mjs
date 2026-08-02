/*
  Downsamples the environment map.

  Computers.jsx consumes it at resolution={128} with blur={0.5} — it only ever
  contributes soft ambient light — so shipping a 2K 6.5MB Radiance file meant
  decoding and PMREM-convolving ~6MB of pixels on every mount to produce a 128px
  cubemap. A 512px source is visually identical after the blur.

  Reads with three's RGBELoader, box-filters in linear float, and writes flat
  (uncompressed) RGBE, which is valid Radiance and trivially small at this size.

  Usage: npm run assets:hdr
*/
import { readFile, writeFile } from 'node:fs/promises';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FloatType } from 'three';

const SRC = 'assets-src/blue_photo_studio_2k.hdr';
const OUT = 'public/images/blue_photo_studio_2k.hdr';
const TARGET_WIDTH = 512;

const loader = new RGBELoader();
loader.type = FloatType;

const buf = await readFile(SRC);
const tex = loader.parse(
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
);
const { width: sw, height: sh, data: src } = tex;

const dw = TARGET_WIDTH;
const dh = Math.max(1, Math.round((sh / sw) * dw));
const bx = sw / dw;
const by = sh / dh;

// box filter in linear space — averaging RGBE bytes directly would be wrong
const dst = new Float32Array(dw * dh * 3);
for (let y = 0; y < dh; y++) {
  const y0 = Math.floor(y * by);
  const y1 = Math.max(y0 + 1, Math.floor((y + 1) * by));
  for (let x = 0; x < dw; x++) {
    const x0 = Math.floor(x * bx);
    const x1 = Math.max(x0 + 1, Math.floor((x + 1) * bx));
    let r = 0, g = 0, b = 0, n = 0;
    for (let sy = y0; sy < y1; sy++) {
      for (let sx = x0; sx < x1; sx++) {
        const i = (sy * sw + sx) * 4; // RGBELoader yields RGBA
        r += src[i];
        g += src[i + 1];
        b += src[i + 2];
        n++;
      }
    }
    const o = (y * dw + x) * 3;
    dst[o] = r / n;
    dst[o + 1] = g / n;
    dst[o + 2] = b / n;
  }
}

// float RGB -> shared-exponent RGBE bytes
const pixels = Buffer.alloc(dw * dh * 4);
for (let p = 0; p < dw * dh; p++) {
  const r = dst[p * 3];
  const g = dst[p * 3 + 1];
  const b = dst[p * 3 + 2];
  const max = Math.max(r, g, b);
  if (max < 1e-32) continue; // leaves 0,0,0,0 — the RGBE encoding of black
  const e = Math.ceil(Math.log2(max));
  const scale = 2 ** (-e) * 256;
  pixels[p * 4] = Math.min(255, Math.floor(r * scale));
  pixels[p * 4 + 1] = Math.min(255, Math.floor(g * scale));
  pixels[p * 4 + 2] = Math.min(255, Math.floor(b * scale));
  pixels[p * 4 + 3] = e + 128;
}

const header = Buffer.from(
  `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${dh} +X ${dw}\n`,
  'ascii'
);
await writeFile(OUT, Buffer.concat([header, pixels]));

const before = (buf.length / 1024 / 1024).toFixed(1);
const after = ((header.length + pixels.length) / 1024).toFixed(0);
console.log(`  ${sw}x${sh} (${before}MB) -> ${dw}x${dh} (${after}KB)`);
