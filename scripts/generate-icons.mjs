// Generates public/icons/icon-192.png and icon-512.png
// Run: node scripts/generate-icons.mjs
// No external dependencies needed — uses Node.js built-in zlib only.

import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";

function crc32(buf) {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = t[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function drawIcon(size) {
  const BG = [0x0a, 0x0e, 0x17];
  const MUTED = [0x1e, 0x2a, 0x42];
  const GREEN = [0x00, 0xc0, 0x87];

  const px = new Uint8Array(size * size * 3);

  // Fill background
  for (let i = 0; i < size * size; i++) {
    px[i * 3] = BG[0]; px[i * 3 + 1] = BG[1]; px[i * 3 + 2] = BG[2];
  }

  function rect(x0, y0, w, h, color) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const i = (y * size + x) * 3;
        px[i] = color[0]; px[i + 1] = color[1]; px[i + 2] = color[2];
      }
    }
  }

  const pad = Math.round(size * 0.16);
  const bw = Math.round(size * 0.13); // bar width
  const gap = Math.round(size * 0.05);
  const bot = size - pad;

  const bars = [
    { color: MUTED, h: Math.round(size * 0.30) },
    { color: GREEN, h: Math.round(size * 0.50) },
    { color: GREEN, h: Math.round(size * 0.38) },
    { color: GREEN, h: Math.round(size * 0.62) },
  ];

  bars.forEach((bar, i) => {
    const x = pad + i * (bw + gap);
    rect(x, bot - bar.h, bw, bar.h, bar.color);
  });

  return px;
}

function makePNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB (no alpha)
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  const pixels = drawIcon(size);

  // Scanlines: filter byte (0x00 = None) + RGB row
  const stride = 1 + size * 3;
  const raw = Buffer.allocUnsafe(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 3;
      const dst = y * stride + 1 + x * 3;
      raw[dst] = pixels[src]; raw[dst + 1] = pixels[src + 1]; raw[dst + 2] = pixels[src + 2];
    }
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", makePNG(192));
writeFileSync("public/icons/icon-512.png", makePNG(512));
console.log("Generated public/icons/icon-192.png and icon-512.png");
