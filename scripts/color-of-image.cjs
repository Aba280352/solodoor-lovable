/**
 * Works out the colour family of a product photo from its pixels, so products whose
 * names carry no colour can still be filtered by colour.
 *
 *   node scripts/color-of-image.cjs <image> [<image> ...]   prints the family of each image
 *
 * `door` mode looks only at the door leaf of the designed-door renders (a centred,
 * white-framed door on a grey wall); `whole` mode looks at the whole picture.
 */
const sharp = require("sharp");

function toHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s, l };
}

/** Family of one colour. */
function familyOf({ h, s, l }) {
  // Near-black and near-white pixels have unstable hue and saturation, so lightness decides alone.
  if (l < 0.14 || (l < 0.2 && s < 0.5)) return "black";
  if (l > 0.95) return "white";
  if (s < 0.14) return l > 0.86 ? "white" : "grey";
  if (h >= 175 && h < 255) return "blue";
  if (h >= 75 && h < 175) return "green";
  if (h >= 255 && h < 335) return "purple";
  // Warm hues: reds, oranges, yellows.
  if (l > 0.84) return s < 0.45 ? (l > 0.92 ? "white" : "cream") : "cream";
  if (l > 0.66 && s < 0.5) return "cream";
  return "brown";
}

const median = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];

/** Median colour of a rectangle (fractions of the picture), robust to handles and glass. */
async function colorOfRegion(file, box) {
  const meta = await sharp(file).metadata();
  const left = Math.round(box.x0 * meta.width), top = Math.round(box.y0 * meta.height);
  const width = Math.max(2, Math.round((box.x1 - box.x0) * meta.width));
  const height = Math.max(2, Math.round((box.y1 - box.y0) * meta.height));
  const { data } = await sharp(file).extract({ left, top, width, height }).resize(32, 32, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rs = [], gs = [], bs = [];
  for (let i = 0; i < data.length; i += 3) { rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); }
  return { r: median(rs), g: median(gs), b: median(bs) };
}

// The strip of the leaf beside the frame: it avoids the glass in the middle and the handle on the right.
const DOOR_BOX = { x0: 0.345, y0: 0.22, x1: 0.395, y1: 0.86 };
const WHOLE_BOX = { x0: 0.15, y0: 0.15, x1: 0.85, y1: 0.85 };

async function colorOfImage(file, mode = "door") {
  const { r, g, b } = await colorOfRegion(file, mode === "door" ? DOOR_BOX : WHOLE_BOX);
  const hsl = toHsl(r, g, b);
  return { family: familyOf(hsl), rgb: `rgb(${r},${g},${b})`, hsl };
}

module.exports = { colorOfImage, familyOf, toHsl };

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const json = args[0] === "--json";
    const files = json ? args.slice(1) : args;
    const results = [];
    for (const file of files) results.push({ file, ...(await colorOfImage(file)) });
    if (json) console.log(JSON.stringify(results.map(({ family, rgb }) => ({ family, rgb }))));
    else results.forEach((c) => console.log(c.family, c.rgb, c.file));
  })();
}
