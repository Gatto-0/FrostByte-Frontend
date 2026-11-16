/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');

/**
 * Generates a mobile campsite image with the boy and logs removed.
 */
async function generateMobileCampsite() {
  const inputPath = path.join(process.cwd(), 'public/scenery/campsite-clean.png');
  const outputPath = path.join(process.cwd(), 'public/scenery/campsite-mobile-clean.png');

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const out = Buffer.from(data);
  const getPix = (buf, x, y) => {
    const idx = (y * width + x) * channels;
    return [buf[idx], buf[idx + 1], buf[idx + 2], buf[idx + 3]];
  };
  const setPix = (buf, x, y, r, g, b, a) => {
    const idx = (y * width + x) * channels;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = a;
  };

  const removeBoyAndLogs = (out) => {
    const masks = [
      { x1: 345, x2: 515, y1: 438, y2: 728, sourceX1: 700, sourceX2: 800 },
      { x1: 225, x2: 435, y1: 602, y2: 754, sourceX1: 645, sourceX2: 755 },
      { x1: 425, x2: 625, y1: 568, y2: 728, sourceX1: 755, sourceX2: 875 },
    ];

    for (const { x1, x2, y1, y2, sourceX1, sourceX2 } of masks) {
      for (let x = x1; x <= x2; x++) {
        const t = (x - x1) / (x2 - x1);
        const sourceX = Math.round(sourceX1 + t * (sourceX2 - sourceX1));

        for (let y = y1; y <= y2; y++) {
          const edgeDistance = Math.min(x - x1, x2 - x, y - y1, y2 - y);
          const feather = Math.min(1, Math.max(0, edgeDistance / 12));
          const edgeBlend = feather * feather * (3 - 2 * feather);
          const [sourceR, sourceG, sourceB, sourceA] = getPix(data, sourceX, y);
          const [originalR, originalG, originalB, originalA] = getPix(data, x, y);
          setPix(
            out,
            x,
            y,
            Math.round(sourceR * edgeBlend + originalR * (1 - edgeBlend)),
            Math.round(sourceG * edgeBlend + originalG * (1 - edgeBlend)),
            Math.round(sourceB * edgeBlend + originalB * (1 - edgeBlend)),
            Math.round(sourceA * edgeBlend + originalA * (1 - edgeBlend)),
          );
        }
      }
    }
  };

  removeBoyAndLogs(out);
  await sharp(out, { raw: { width, height, channels } }).png().toFile(outputPath);

  console.log(`Generated: ${outputPath}`);
}

generateMobileCampsite().catch((err) => {
  console.error('Error generating mobile campsite image:', err);
  process.exit(1);
});
