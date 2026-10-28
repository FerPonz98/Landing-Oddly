import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
// Compact derivatives of the supplied artwork. The source files stay intact.
async function artwork(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = 0, bottom = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 12) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  return sharp(path).extract({ left, top, width: right - left + 1, height: bottom - top + 1 }).png().toBuffer();
}
await mkdir('public/brand', { recursive: true });
const sources = {
  dark: 'public/logo/LOGO _ODDLY_AZUL_OBSCURO_.png',
  light: 'public/logo/LOGO_ODDLY_BLANCO.png',
  orange: 'public/logo/LOGO_ODDLY_NARANJA.png',
};
for (const [name, source] of Object.entries(sources)) {
  await sharp(await artwork(source)).resize({ width: 600 }).webp({ quality: 95 }).toFile(`public/brand/oddly-${name}.webp`);
}
const symbol = await artwork('public/logo/logo-03.png');
await sharp(symbol).resize({ width: 720 }).webp({ quality: 95 }).toFile('public/brand/oddly-symbol.webp');
for (const [name, size] of [['icon', 64], ['apple-icon', 180]]) {
  const inset = Math.round(size * .17);
  const mark = await sharp(symbol).resize(size - inset * 2, size - inset * 2, { fit: 'contain', background: '#fffdf9' }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#fffdf9' } })
    .composite([{ input: mark, gravity: 'centre' }]).png().toFile(`src/app/${name}.png`);
}
const logo = await sharp(await artwork(sources.dark)).resize({ width: 500 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#fffdf9' } })
  .composite([{ input: logo, gravity: 'centre' }]).png().toFile('src/app/opengraph-image.png');
console.log('Prepared Oddly brand assets from the supplied logos.');
