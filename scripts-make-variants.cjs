// Makes phone-size copies of the site's large pictures (480px and 828px wide, WebP), next to the originals,
// and writes the list the components use for srcset. The originals are never touched.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const WIDTHS = [480, 828];
const DIRS = ["public/images", "public/articles"];
(async () => {
  const manifest = {};
  let made = 0, bytes = 0;
  for (const dir of DIRS) {
    for (const f of fs.readdirSync(dir).sort()) {
      if (!/\.webp$/.test(f) || /-\d+w\.webp$/.test(f)) continue;
      const file = path.join(dir, f);
      const { width } = await sharp(file).metadata();
      if (!width || width <= 900) continue;
      for (const w of WIDTHS) {
        const out = path.join(dir, f.replace(/\.webp$/, `-${w}w.webp`));
        if (!fs.existsSync(out)) {
          await sharp(file).resize({ width: w }).webp({ quality: 78, effort: 5 }).toFile(out);
          made++;
        }
        bytes += fs.statSync(out).size;
      }
      manifest["/" + dir.replace(/^public\//, "") + "/" + f] = width;
    }
  }
  const lines = Object.entries(manifest).map(([k, v]) => `  ${JSON.stringify(k)}: ${v},`).join("\n");
  fs.writeFileSync(
    "src/components/solodoor/image-variants.ts",
    `/**\n * The site's own pictures that have phone-size copies (480w and 828w, made by scripts-make-variants.cjs), with the\n * original's width. Generated: do not edit by hand.\n */\nexport const IMAGE_WIDTHS: Record<string, number> = {\n${lines}\n};\n`,
  );
  console.log("pictures with copies:", Object.keys(manifest).length, "new files:", made, "copies total KB:", Math.round(bytes / 1024));
})();
