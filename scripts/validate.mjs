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
  "vendor/three/addons/loaders/GLTFLoader.js",
  "vendor/three/addons/utils/BufferGeometryUtils.js",
  "vendor/three/LICENSE",
  "assets/models/eumachus-human.glb",
  "assets/chronovisor-poster.jpg",
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
const experienceSource = readFileSync(join(root, "src/experience.js"), "utf8");
const chronovisorSource = readFileSync(join(root, "src/chronovisor.js"), "utf8");
const contentSource = readFileSync(join(root, "src/content.js"), "utf8");
const stylesheet = readFileSync(join(root, "styles.css"), "utf8");
for (const requiredFeature of [
  "makeThermopoliumArchitecture",
  "loadRomanEumachus",
  "EumachusHumanFigure",
  "SimpleRomanTunic",
  "mixamorigRightArm",
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
if (!entryHtml.includes('poster="./assets/chronovisor-poster.jpg"') || !entryHtml.includes('id="chronovisorRetry"')) {
  failures.push("index.html: chronovisor poster or retry control is missing");
}
for (const incorrectCroatianTerm of ["rimski auxiliary", "rimskom auxiliaryju"]) {
  if (contentSource.includes(incorrectCroatianTerm)) {
    failures.push(`src/content.js: incorrect Croatian term ${incorrectCroatianTerm} remains`);
  }
}
for (const requiredCroatianTerm of ["rimski auxiliar", "rimskom auxiliaru"]) {
  if (!contentSource.includes(requiredCroatianTerm)) {
    failures.push(`src/content.js: corrected Croatian term ${requiredCroatianTerm} is missing`);
  }
}
for (const requiredARFeature of ["external-ar", "intent://", "needsExternalARBrowser"]) {
  if (!experienceSource.includes(requiredARFeature)) {
    failures.push(`src/experience.js: ${requiredARFeature} is missing`);
  }
}
for (const requiredChronovisorFeature of ["chronovisorRetry", "is-waiting"]) {
  if (!chronovisorSource.includes(requiredChronovisorFeature)) {
    failures.push(`src/chronovisor.js: ${requiredChronovisorFeature} is missing`);
  }
}
if (!stylesheet.includes("#toggleView") || !stylesheet.includes("grid-template-columns: minmax(0, 1fr) 46px 46px")) {
  failures.push("styles.css: labeled mobile chronovisor control is missing");
}
if (/\.control-button:nth-child\(2\)\s+span\s*\{[^}]*display:\s*none/s.test(stylesheet)) {
  failures.push("styles.css: mobile chronovisor label is still hidden");
}
if (dioramaSource.includes("Promise.race") || dioramaSource.includes("!this.arSupported || !navigator.xr")) {
  failures.push("src/diorama.js: obsolete eager AR rejection remains");
}
for (const removedFeature of ["makeTextSprite", "makeRomanEumachus", "THREE.CapsuleGeometry", "RoundedBoxGeometry", "hairCap", "beard"]) {
  if (dioramaSource.includes(removedFeature)) {
    failures.push("src/diorama.js: obsolete " + removedFeature + " remains");
  }
}

const model = readFileSync(join(root, "assets/models/eumachus-human.glb"));
if (model.length < 500_000 || model.subarray(0, 4).toString("ascii") !== "glTF") {
  failures.push("assets/models/eumachus-human.glb: invalid or unexpectedly small GLB");
} else {
  try {
    const jsonLength = model.readUInt32LE(12);
    const gltf = JSON.parse(
      model.subarray(20, 20 + jsonLength).toString("utf8").replace(/\0+$/u, "").trim(),
    );
    const nodeNames = new Set((gltf.nodes ?? []).map((node) => node.name));
    for (const requiredBone of [
      "mixamorig:Hips",
      "mixamorig:Head",
      "mixamorig:LeftArm",
      "mixamorig:RightArm",
    ]) {
      if (!nodeNames.has(requiredBone)) failures.push(`assets/models/eumachus-human.glb: ${requiredBone} is missing`);
    }
    if (!(gltf.skins?.length > 0)) failures.push("assets/models/eumachus-human.glb: skinned rig is missing");
  } catch (error) {
    failures.push(`assets/models/eumachus-human.glb: ${error.message}`);
  }
}

const poster = readFileSync(join(root, "assets/chronovisor-poster.jpg"));
if (poster.length < 20_000 || poster[0] !== 0xff || poster[1] !== 0xd8) {
  failures.push("assets/chronovisor-poster.jpg: invalid or unexpectedly small JPEG");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${javascriptFiles.length} modules, 2 routes, the thermopolium and the anatomical Roman figure.`);
