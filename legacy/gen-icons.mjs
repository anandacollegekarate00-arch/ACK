import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Minimal PNG encoder (truecolor, no filter) — enough for flat-color icons.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, px) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = px[y * size + x];
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // bit depth 8, truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Icon: royal blue field, white belt band with a gold knot dot in the middle.
// (AKC colors — matches the app header gradient.)
function beltIcon(size) {
  const px = [];
  const bg = [0x0b, 0x2a, 0x5b];
  const white = [0xff, 0xff, 0xff];
  const gold = [0xfd, 0xd5, 0x35];
  const bandTop = Math.floor(size * 0.4),
    bandBottom = Math.floor(size * 0.6);
  const dotR = Math.max(2, Math.floor(size * 0.06));
  const cx = Math.floor(size / 2),
    cy = Math.floor(size / 2);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inBand = y >= bandTop && y < bandBottom;
      const d = Math.hypot(x - cx, y - cy);
      px.push(inBand ? (d < dotR ? gold : white) : bg);
    }
  }
  return px;
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(outDir, { recursive: true });

for (const [name, size] of [
  ['ack-logo.png', 512],
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
]) {
  writeFileSync(join(outDir, name), encodePng(size, beltIcon(size)));
  console.log(`wrote public/${name} (${size}x${size})`);
}
