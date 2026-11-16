import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(
  __dirname,
  '../public/scenes/Pixel-Art_Campfire_Flicker_Animation.gif',
);
const outputPath = path.join(__dirname, '../public/scenery/campfire-sprite.png');

async function generate() {
  const metadata = await sharp(inputPath, { animated: true }).metadata();
  const frameDelay = metadata.delay?.[0];
  if (
    metadata.format !== 'gif'
    || !metadata.pages
    || !metadata.pageHeight
    || !frameDelay
    || !metadata.delay?.every((delay) => delay === frameDelay)
  ) {
    throw new Error('Campfire GIF must have fixed-delay full frames.');
  }

  const frames = [];
  for (let page = 0; page < metadata.pages; page++) {
    frames.push(await sharp(inputPath, { page }).png().toBuffer());
  }
  frames.push(frames[0]);

  await sharp({
    create: {
      width: metadata.width * frames.length,
      height: metadata.pageHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      frames.map((input, frame) => ({
        input,
        left: frame * metadata.width,
        top: 0,
      })),
    )
    .png()
    .toFile(outputPath);

  console.log(
    `Created ${outputPath}; ${metadata.pages} frames at ${frameDelay}ms each`,
  );
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
