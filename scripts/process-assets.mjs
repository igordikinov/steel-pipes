/**
 * Turns the generated 1024×1024 renders in `uploads/` into web-sized assets in
 * `src/assets/img/`.
 *
 * The renders come back from the image model on solid white with a soft ground
 * shadow. White is keyed out with a ramp so antialiased edges survive, the
 * result is trimmed tight and scaled to the size the component actually draws.
 *
 * Run with:  npm run assets      (needs sharp: npm install --no-save sharp)
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'uploads');
const target = join(root, 'src', 'assets', 'img');

/** Output width per folder, in device pixels — twice the drawn size. */
const WIDTHS = { machines: 512, pipe: 512, anatomy: 900, forming: 320 };

/** Renders kept as source material only: the canvas draws these racks in SVG. */
const SKIP = new Set(['machines/buffer-rack.png', 'machines/warehouse-rack.png']);

/** Luminance at which a pixel is fully transparent; the ramp starts lower. */
const WHITE_CUT = 252;
const WHITE_RAMP = 238;

/** Replaces the alpha channel with one derived from how white the pixel is. */
async function keyWhite(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += 4) {
    const luma = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
    if (luma >= WHITE_CUT) {
      data[index + 3] = 0;
    } else if (luma > WHITE_RAMP) {
      data[index + 3] = Math.round(255 * (1 - (luma - WHITE_RAMP) / (WHITE_CUT - WHITE_RAMP)));
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

let processed = 0;
let bytes = 0;

for (const folder of Object.keys(WIDTHS)) {
  const from = join(source, folder);
  if (!statSync(from, { throwIfNoEntry: false })?.isDirectory()) continue;
  mkdirSync(join(target, folder), { recursive: true });

  for (const name of readdirSync(from)) {
    if (!name.endsWith('.png') || SKIP.has(`${folder}/${name}`)) continue;
    const out = join(target, folder, name);
    await (await keyWhite(join(from, name)))
      .trim({ threshold: 6 })
      .resize({ width: WIDTHS[folder], withoutEnlargement: true })
      .png({ compressionLevel: 9, effort: 10, palette: true, quality: 88 })
      .toFile(out);
    processed += 1;
    bytes += statSync(out).size;
    console.log(`${folder}/${name} → ${(statSync(out).size / 1024).toFixed(0)} KB`);
  }
}

console.log(`\n${processed} assets, ${(bytes / 1024 / 1024).toFixed(2)} MB total`);
