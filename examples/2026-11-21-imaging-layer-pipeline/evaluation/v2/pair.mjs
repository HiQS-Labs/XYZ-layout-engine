// Produce two image-only judging rooms. The caller keeps the input order private.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const [first, second, dest] = process.argv.slice(2);
if (!dest || !first || !second) throw Error('Usage: node pair.mjs first.png second.png NEW_SESSION');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const pairs = [];
  for (const file of [first, second]) {
    const data = (await fs.readFile(file)).toString('base64');
    pairs.push(await page.evaluate(async data => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + data;
      await image.decode();
      return [image.width, 400].map(width => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = Math.max(1, Math.round(image.height * width / image.width));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL().split(',')[1];
      });
    }, data));
  }
  await fs.mkdir(dest);
  for (const [room, order] of [['forward', [0, 1]], ['reverse', [1, 0]]]) {
    const dir = path.join(dest, room);
    await fs.mkdir(dir);
    for (const [side, index] of order.entries()) {
      for (const [size, bytes] of pairs[index].entries()) {
        await fs.writeFile(path.join(dir, ['A','B'][side] + ['-native.png','-400.png'][size]), Buffer.from(bytes, 'base64'));
      }
    }
  }
} finally { await browser.close(); }
