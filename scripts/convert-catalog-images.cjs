/**
 * Converts the catalogue images to WebP, laid out by their storage path:
 *
 *   node scripts/convert-catalog-images.cjs
 *
 * Reads data/private/image-sources.csv (written by build-catalog.cjs) and writes
 * data/catalog-images/<image_path>. Upload that folder as it is to the "catalog"
 * storage bucket. Files that are already converted are skipped.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const parent = path.resolve(ROOT, "..");
const outer = fs.readdirSync(parent).find((d) => d.startsWith("תיקיית קבצים עידו סולודור"));
const SRC = path.join(parent, outer, "תיקיית קבצים עידו סולודור");
const OUT = path.join(ROOT, "data", "catalog-images");
const MAX_EDGE = 1600;
const QUALITY = 82;

const rows = fs
  .readFileSync(path.join(ROOT, "data", "private", "image-sources.csv"), "utf8")
  .replace(/^﻿/, "")
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => {
    const i = line.indexOf(",");
    return { imagePath: line.slice(0, i), source: line.slice(i + 1).replace(/^"|"$/g, "").replace(/""/g, '"') };
  });

(async () => {
  let done = 0;
  let skipped = 0;
  const failed = [];
  for (const { imagePath, source } of rows) {
    const from = path.join(SRC, source);
    const to = path.join(OUT, imagePath);
    if (fs.existsSync(to)) {
      skipped++;
      continue;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    try {
      await sharp(from).rotate().resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(to);
      done++;
    } catch {
      // sharp's prebuilt binaries cannot read HEIC; ffmpeg can.
      try {
        execFileSync("ffmpeg", ["-v", "error", "-y", "-i", from, "-vf", `scale='min(${MAX_EDGE},iw)':-2`, "-quality", String(QUALITY), to]);
        done++;
      } catch (e) {
        failed.push(source);
      }
    }
  }
  console.log(`converted ${done}, skipped ${skipped}, failed ${failed.length}`);
  failed.forEach((f) => console.log("FAILED:", f));
})();
