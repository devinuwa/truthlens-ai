import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const LILAC = [239, 228, 251, 255];
const PURPLE = [109, 58, 168, 255];
const WHITE = [247, 244, 251, 255];
const SUN = [255, 209, 102, 255];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function png(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const color = paint(x, y, size);
      const offset = row + 1 + x * 4;
      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
      raw[offset + 3] = color[3];
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function inside(x, y, points) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0001) + xi;
    if (crosses) hit = !hit;
  }
  return hit;
}

function distanceToSegment(x, y, x1, y1, x2, y2) {
  const length = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (length === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / length));
  return Math.hypot(x - (x1 + t * (x2 - x1)), y - (y1 + t * (y2 - y1)));
}

function shield(size, scale) {
  const cx = size / 2;
  const top = size * (0.5 - 0.34 * scale);
  const shoulder = size * (0.5 - 0.22 * scale);
  const side = size * 0.3 * scale;
  const bottom = size * (0.5 + 0.36 * scale);
  const left = [
    [cx, top],
    [cx - side, shoulder],
    [cx - side, size * 0.5],
  ];
  for (let step = 1; step <= 6; step += 1) {
    const t = step / 6;
    left.push([cx - side * (1 - t * t), size * 0.5 + (bottom - size * 0.5) * t]);
  }
  const right = left
    .slice(0, -1)
    .reverse()
    .map(([x, y]) => [cx + (cx - x), y]);
  return [...left, ...right];
}

function paint(x, y, size, scale, fullBleed) {
  const radius = size * 0.22;
  if (!fullBleed) {
    const inset = x < radius && y < radius
      ? (x - radius) ** 2 + (y - radius) ** 2 > radius ** 2
      : x > size - radius && y < radius
        ? (x - (size - radius)) ** 2 + (y - radius) ** 2 > radius ** 2
        : x < radius && y > size - radius
          ? (x - radius) ** 2 + (y - (size - radius)) ** 2 > radius ** 2
          : x > size - radius && y > size - radius
            ? (x - (size - radius)) ** 2 + (y - (size - radius)) ** 2 > radius ** 2
            : false;
    if (inset) return [0, 0, 0, 0];
  }
  if (inside(x + 0.5, y + 0.5, shield(size, scale))) {
    const cx = size / 2;
    const cy = size * 0.48;
    const lens = size * 0.075 * scale;
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    if (dx * dx + dy * dy < lens * lens) return WHITE;
    const startX = cx + lens * 0.55;
    const startY = cy + lens * 0.55;
    const endX = cx + lens * 1.85;
    const endY = cy + lens * 1.85;
    if (distanceToSegment(x + 0.5, y + 0.5, startX, startY, endX, endY) < Math.max(2.5, size * 0.03 * scale)) return SUN;
    return PURPLE;
  }
  return LILAC;
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", png(192, (x, y, size) => paint(x, y, size, 1, false)));
writeFileSync("public/icons/icon-512.png", png(512, (x, y, size) => paint(x, y, size, 1, false)));
writeFileSync("public/icons/apple-touch-icon.png", png(180, (x, y, size) => paint(x, y, size, 1, true)));
writeFileSync("public/icons/icon-maskable-512.png", png(512, (x, y, size) => paint(x, y, size, 0.62, true)));
