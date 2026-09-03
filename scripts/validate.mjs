import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const javascriptFiles = [
  "src/app.js",
  "src/chronovisor.js",
  "src/content.js",
  "src/diorama.js",
  "src/experience.js",
];

const failures = [];

for (const localDependency of [
  "vendor/three/three.module.min.js",
  "vendor/three/addons/controls/OrbitControls.js",
  "vendor/three/addons/geometries/RoundedBoxGeometry.js",
  "vendor/three/LICENSE",
]) {
  if (!existsSync(join(root, localDependency))) failures.push(`${localDependency}: missing local dependency`);
}

for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ["--check", join(root, file)], {
    encoding: "utf8",
  });
  if (result.status !== 0) failures.push(`${file}: ${result.stderr.trim()}`);
}

for (const htmlFile of ["index.html", "legacy/index.html"]) {
  const html = readFileSync(join(root, htmlFile), "utf8");
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) failures.push(`${htmlFile}: duplicate ids ${duplicateIds.join(", ")}`);

  const references = [...html.matchAll(/(?:src|href)="(\.\.\/|\.\/)([^"?#]+)"/g)];
  for (const [, prefix, relativePath] of references) {
    const sourceDirectory = dirname(join(root, htmlFile));
    const path = resolve(sourceDirectory, prefix, relativePath);
    if (!existsSync(path)) failures.push(`${htmlFile}: missing ${prefix}${relativePath}`);
  }
}

const dioramaSource = readFileSync(join(root, "src/diorama.js"), "utf8");
for (const requiredFeature of [
  "makeThermopoliumArchitecture",
  "makeRomanEumachus",
  "THREE.CapsuleGeometry",
  "RoundedBoxGeometry",
]) {
  if (!dioramaSource.includes(requiredFeature)) {
    failures.push("src/diorama.js: " + requiredFeature + " is missing");
  }
}

const entryHtml = readFileSync(join(root, "index.html"), "utf8");
if (entryHtml.includes("cdn.jsdelivr.net")) {
  failures.push("index.html: runtime CDN dependency remains");
}
if (!entryHtml.includes("EumachusLoading") || !entryHtml.includes("setTimeout(showFailure, 8000)")) {
  failures.push("index.html: loading fail-safe is missing");
}
for (const removedFeature of ["makeTextSprite", "GLTFLoader", "hairCap", "beard"]) {
  if (dioramaSource.includes(removedFeature)) {
    failures.push("src/diorama.js: obsolete " + removedFeature + " remains");
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${javascriptFiles.length} modules, 2 routes, the thermopolium and the Roman figure.`);
