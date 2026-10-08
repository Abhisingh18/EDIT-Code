import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const comp = await selectComposition({ serveUrl, id: "Pragyan" });
for (const f of frames) {
  await renderStill({ composition: comp, serveUrl, frame: f, output: `out/check/f_${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
  console.log("still", f);
}
