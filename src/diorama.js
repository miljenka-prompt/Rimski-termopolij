import * as THREE from "../vendor/three/three.module.min.js";
import { OrbitControls } from "../vendor/three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "../vendor/three/addons/geometries/RoundedBoxGeometry.js";

const MATERIAL_BASE_OPACITY = "baseOpacity";
const UP = new THREE.Vector3(0, 1, 0);

function clampPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

function standardMaterial(color, options = {}) {
  const opacity = options.opacity ?? 1;
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.9,
    metalness: options.metalness ?? 0,
    transparent: opacity < 1,
    opacity,
    side: options.side ?? THREE.FrontSide,
  });
  material.userData[MATERIAL_BASE_OPACITY] = opacity;
  return material;
}

function markMaterialOpacity(object, factor) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      const baseOpacity = material.userData[MATERIAL_BASE_OPACITY] ?? material.opacity ?? 1;
      material.userData[MATERIAL_BASE_OPACITY] = baseOpacity;
      material.transparent = factor < 0.99 || baseOpacity < 0.99;
      material.opacity = Math.max(0.16, baseOpacity * factor);
      material.depthWrite = material.opacity > 0.64;
      material.needsUpdate = true;
    });
  });
}

function mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.rotation.set(...rotation);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function cylinderBetween(start, end, radius, material, radialSegments = 10) {
  const startPoint = new THREE.Vector3(...start);
  const endPoint = new THREE.Vector3(...end);
  const direction = endPoint.clone().sub(startPoint);
  const object = mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments),
    material,
  );
  object.position.copy(startPoint).add(endPoint).multiplyScalar(0.5);
  object.quaternion.setFromUnitVectors(UP, direction.normalize());
  return object;
}

function capsuleBetween(start, end, radius, material, capSegments = 5, radialSegments = 12) {
  const startPoint = new THREE.Vector3(...start);
  const endPoint = new THREE.Vector3(...end);
  const direction = endPoint.clone().sub(startPoint);
  const straightLength = Math.max(direction.length() - radius * 2, 0.001);
  const object = mesh(
    new THREE.CapsuleGeometry(radius, straightLength, capSegments, radialSegments),
    material,
  );
  object.position.copy(startPoint).add(endPoint).multiplyScalar(0.5);
  object.quaternion.setFromUnitVectors(UP, direction.normalize());
  return object;
}

function makeAmphora(scale = 1, color = 0x985d3f) {
  const group = new THREE.Group();
  const clay = standardMaterial(color, { roughness: 0.94 });
  const body = mesh(new THREE.SphereGeometry(0.22, 16, 12), clay, [0, 0.38, 0]);
  body.scale.set(0.86, 1.38, 0.86);
  group.add(body);
  group.add(mesh(new THREE.CylinderGeometry(0.085, 0.12, 0.32, 12), clay, [0, 0.68, 0]));
  group.add(mesh(new THREE.TorusGeometry(0.085, 0.025, 8, 20), clay, [0, 0.855, 0], [Math.PI / 2, 0, 0]));
  [-1, 1].forEach((side) => {
    group.add(mesh(
      new THREE.TorusGeometry(0.12, 0.025, 7, 18, Math.PI),
      clay,
      [side * 0.13, 0.67, 0],
      [0, side * Math.PI / 2, Math.PI / 2],
    ));
  });
  group.scale.setScalar(scale);
  return group;
}

function makeShield() {
  const group = new THREE.Group();
  const wood = standardMaterial(0x6c3028, { roughness: 0.82 });
  const bronze = standardMaterial(0xc49652, { metalness: 0.58, roughness: 0.42 });
  group.add(mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.07, 32), wood, [0, 0, 0], [Math.PI / 2, 0, 0]));
  group.add(mesh(new THREE.TorusGeometry(0.37, 0.032, 10, 36), bronze));
  group.add(mesh(new THREE.SphereGeometry(0.1, 14, 10), bronze, [0, 0, 0.055]));
  return group;
}

function addDolia(group, x, z) {
  const clay = standardMaterial(0x9a5d3f, { roughness: 1 });
  const interior = standardMaterial(0x241c17, { roughness: 1 });
  group.add(mesh(new THREE.CylinderGeometry(0.21, 0.18, 0.035, 24), interior, [x, 1.105, z]));
  group.add(mesh(new THREE.TorusGeometry(0.225, 0.036, 9, 30), clay, [x, 1.13, z], [Math.PI / 2, 0, 0]));
}

function makeThermopoliumArchitecture() {
  const group = new THREE.Group();
  group.name = "AndautoniaThermopolium";

  const floorStone = standardMaterial(0x6d675b, { roughness: 1 });
  const grout = standardMaterial(0x4b4740, { roughness: 1 });
  const warmPlaster = standardMaterial(0x9b684d, { roughness: 0.98 });
  const palePlaster = standardMaterial(0xc1aa7f, { roughness: 1 });
  const darkDado = standardMaterial(0x563c35, { roughness: 1 });
  const limestone = standardMaterial(0xc1b69e, { roughness: 0.96 });
  const wood = standardMaterial(0x5c3c28, { roughness: 0.94 });
  const doorway = standardMaterial(0x17191a, { roughness: 1 });

  group.add(mesh(new THREE.BoxGeometry(5.45, 0.16, 3.85), floorStone, [0, -0.08, 0]));
  for (let x = -2.15; x <= 2.15; x += 0.72) {
    group.add(mesh(new THREE.BoxGeometry(0.016, 0.012, 3.58), grout, [x, 0.008, 0]));
  }
  for (let z = -1.45; z <= 1.45; z += 0.58) {
    group.add(mesh(new THREE.BoxGeometry(5.16, 0.012, 0.016), grout, [0, 0.009, z]));
  }

  group.add(mesh(new THREE.BoxGeometry(5.45, 2.5, 0.16), palePlaster, [0, 1.25, -1.84]));
  group.add(mesh(new THREE.BoxGeometry(5.48, 0.72, 0.035), darkDado, [0, 0.42, -1.745]));
  group.add(mesh(new THREE.BoxGeometry(0.16, 2.12, 2.65), palePlaster, [-2.65, 1.06, -0.58]));

  [-1.75, -0.65, 0.45].forEach((x, index) => {
    const panelColor = [0x7e4035, 0xb48a57, 0x755a43][index];
    group.add(mesh(new THREE.BoxGeometry(0.82, 0.72, 0.025), standardMaterial(panelColor), [x, 1.55, -1.745]));
    group.add(mesh(new THREE.BoxGeometry(0.7, 0.06, 0.03), limestone, [x, 1.24, -1.725]));
  });

  group.add(mesh(new THREE.BoxGeometry(1.02, 2.12, 0.03), doorway, [1.82, 1.06, -1.744]));
  group.add(mesh(new THREE.BoxGeometry(1.18, 0.14, 0.24), limestone, [1.82, 2.16, -1.72]));
  [-1, 1].forEach((side) => {
    group.add(mesh(new THREE.BoxGeometry(0.14, 2.2, 0.22), limestone, [1.82 + side * 0.58, 1.1, -1.72]));
  });

  group.add(mesh(new THREE.BoxGeometry(1.55, 0.1, 0.34), wood, [-1.45, 1.43, -1.55]));
  [-1.96, -0.94].forEach((x) => {
    group.add(mesh(new THREE.BoxGeometry(0.08, 0.48, 0.08), wood, [x, 1.2, -1.56], [0, 0, x < -1.5 ? -0.34 : 0.34]));
  });
  [
    [-1.85, 0x9a5d3f, 0.56],
    [-1.43, 0xb4714d, 0.5],
    [-1.04, 0x81503c, 0.54],
  ].forEach(([x, color, scale]) => {
    const amphora = makeAmphora(scale, color);
    amphora.position.set(x, 1.44, -1.54);
    group.add(amphora);
  });

  group.add(mesh(new THREE.BoxGeometry(3.62, 0.98, 0.8), warmPlaster, [0.3, 0.49, -0.46]));
  group.add(mesh(new THREE.BoxGeometry(3.76, 0.11, 0.94), limestone, [0.3, 1.035, -0.46]));
  group.add(mesh(new THREE.BoxGeometry(0.82, 0.98, 1.72), warmPlaster, [-1.28, 0.49, 0.02]));
  group.add(mesh(new THREE.BoxGeometry(0.96, 0.11, 1.86), limestone, [-1.28, 1.035, 0.02]));

  [-0.62, 0.34, 1.28].forEach((x) => addDolia(group, x, -0.46));
  addDolia(group, -1.28, 0.28);

  [-0.68, 0.3, 1.28].forEach((x, index) => {
    const panel = standardMaterial([0x6b4137, 0x77513f, 0x5c4639][index], { roughness: 1 });
    group.add(mesh(new THREE.BoxGeometry(0.7, 0.45, 0.025), panel, [x, 0.5, -0.045]));
  });

  const bowl = standardMaterial(0xb97850, { roughness: 0.96, side: THREE.DoubleSide });
  group.add(mesh(new THREE.CylinderGeometry(0.18, 0.11, 0.1, 20, 1, true), bowl, [1.88, 1.14, -0.5]));
  group.add(mesh(new THREE.TorusGeometry(0.18, 0.018, 7, 24), bowl, [1.88, 1.2, -0.5], [Math.PI / 2, 0, 0]));
  return group;
}

function makeRomanEumachus() {
  const group = new THREE.Group();
  group.name = "EumachusRomanFigure";

  const skin = standardMaterial(0xb67958, { roughness: 0.96 });
  const tunic = standardMaterial(0xc7b38a, { roughness: 1 });
  const clavus = standardMaterial(0x765044, { roughness: 0.98 });
  const leather = standardMaterial(0x513325, { roughness: 0.9 });
  const bronze = standardMaterial(0xa97843, { metalness: 0.28, roughness: 0.7 });
  const features = standardMaterial(0x4b3028, { roughness: 1 });

  const chest = mesh(new RoundedBoxGeometry(0.58, 0.44, 0.28, 5, 0.065), tunic, [0, 1.43, 0]);
  chest.scale.x = 1.05;
  group.add(chest);

  const skirt = mesh(new THREE.CylinderGeometry(0.285, 0.35, 0.55, 18), tunic, [0, 1.06, 0]);
  skirt.scale.set(1.03, 1, 0.54);
  group.add(skirt);

  const belt = mesh(new RoundedBoxGeometry(0.61, 0.06, 0.3, 4, 0.018), leather, [0, 1.265, 0]);
  group.add(belt);
  group.add(mesh(new RoundedBoxGeometry(0.075, 0.065, 0.022, 3, 0.009), bronze, [0, 1.265, 0.163]));
  [-0.09, 0.09].forEach((x) => {
    group.add(mesh(new RoundedBoxGeometry(0.035, 0.64, 0.012, 3, 0.005), clavus, [x, 1.32, 0.174]));
  });

  const leftHip = [-0.12, 0.81, 0.01];
  const leftAnkle = [-0.14, 0.18, 0.07];
  const rightHip = [0.12, 0.81, -0.01];
  const rightAnkle = [0.16, 0.18, -0.035];
  group.add(capsuleBetween(leftHip, leftAnkle, 0.057, skin));
  group.add(capsuleBetween(rightHip, rightAnkle, 0.057, skin));

  const leftSandal = mesh(new RoundedBoxGeometry(0.15, 0.065, 0.28, 5, 0.028), leather, [-0.14, 0.09, 0.13], [0, -0.035, 0]);
  const rightSandal = mesh(new RoundedBoxGeometry(0.15, 0.065, 0.28, 5, 0.028), leather, [0.16, 0.09, 0.035], [0, 0.05, 0]);
  group.add(leftSandal, rightSandal);
  [
    [-0.2, 0.13, 0.07, -0.08, 0.13, 0.17],
    [0.1, 0.13, -0.03, 0.22, 0.13, 0.07],
  ].forEach(([x1, y1, z1, x2, y2, z2]) => {
    group.add(cylinderBetween([x1, y1, z1], [x2, y2, z2], 0.009, leather, 6));
  });

  const leftShoulder = [-0.31, 1.54, 0];
  const leftSleeve = [-0.36, 1.39, 0.025];
  const leftElbow = [-0.4, 1.18, 0.075];
  const leftWrist = [-0.34, 0.995, 0.145];
  const rightShoulder = [0.31, 1.54, 0];
  const rightSleeve = [0.37, 1.39, 0.035];
  const rightElbow = [0.43, 1.22, 0.115];
  const rightWrist = [0.24, 1.13, 0.305];

  group.add(capsuleBetween(leftShoulder, leftSleeve, 0.085, tunic));
  group.add(capsuleBetween(leftSleeve, leftElbow, 0.053, skin));
  group.add(capsuleBetween(leftElbow, leftWrist, 0.048, skin));
  group.add(capsuleBetween(leftWrist, [-0.335, 0.92, 0.17], 0.044, skin, 4, 10));
  group.add(capsuleBetween(rightShoulder, rightSleeve, 0.085, tunic));
  group.add(capsuleBetween(rightSleeve, rightElbow, 0.053, skin));
  group.add(capsuleBetween(rightElbow, rightWrist, 0.048, skin));
  group.add(capsuleBetween(rightWrist, [0.16, 1.12, 0.37], 0.044, skin, 4, 10));

  group.add(mesh(new THREE.CylinderGeometry(0.082, 0.09, 0.13, 12), skin, [0, 1.69, 0]));
  const head = mesh(new THREE.SphereGeometry(0.17, 24, 18), skin, [0, 1.89, 0]);
  head.scale.set(0.79, 1.06, 0.83);
  group.add(head);
  [-0.145, 0.145].forEach((x) => {
    const ear = mesh(new THREE.SphereGeometry(0.035, 12, 8), skin, [x, 1.89, 0]);
    ear.scale.set(0.42, 0.72, 0.36);
    group.add(ear);
  });
  group.add(mesh(new THREE.ConeGeometry(0.026, 0.075, 8), skin, [0, 1.89, 0.145], [Math.PI / 2, 0, 0]));
  [-0.051, 0.051].forEach((x) => {
    group.add(mesh(new THREE.SphereGeometry(0.009, 8, 6), features, [x, 1.925, 0.139]));
  });
  group.add(mesh(new RoundedBoxGeometry(0.052, 0.007, 0.008, 2, 0.003), features, [0, 1.82, 0.143]));
  group.scale.setScalar(0.92);
  return group;
}

function makeNameTokens() {
  const group = new THREE.Group();
  const bronze = standardMaterial(0xb68545, { metalness: 0.62, roughness: 0.42 });
  const silver = standardMaterial(0xaaa08d, { metalness: 0.46, roughness: 0.52 });
  [[-0.16, bronze], [0.3, silver]].forEach(([x, material], index) => {
    group.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.045, 36), material, [x, 1.13, -0.18], [0, 0, index ? 0.08 : -0.08]));
    group.add(mesh(new THREE.TorusGeometry(0.145, 0.012, 7, 24), material, [x, 1.158, -0.18], [Math.PI / 2, 0, 0]));
  });
  return group;
}

function makeHorseMemory() {
  const group = new THREE.Group();
  const shield = makeShield();
  shield.position.set(-2.13, 1.26, -1.62);
  shield.rotation.z = -0.08;
  group.add(shield);
  const timber = standardMaterial(0x6b4930, { roughness: 1 });
  const iron = standardMaterial(0x9b9c95, { metalness: 0.68, roughness: 0.4 });
  group.add(mesh(new THREE.CylinderGeometry(0.026, 0.026, 1.9, 8), timber, [-1.67, 1.03, -1.58], [0, 0, 0.17]));
  group.add(mesh(new THREE.ConeGeometry(0.07, 0.25, 6), iron, [-1.84, 1.98, -1.58], [0, 0, 0.17]));
  group.add(mesh(new THREE.TorusGeometry(0.26, 0.035, 8, 28), standardMaterial(0x4b3026), [-1.12, 1.72, -1.62]));
  return group;
}

function makeBrokenLinks() {
  const group = new THREE.Group();
  const iron = standardMaterial(0x555b5c, { metalness: 0.72, roughness: 0.52 });
  for (let index = 0; index < 7; index += 1) {
    group.add(mesh(
      new THREE.TorusGeometry(0.12, 0.03, 8, 18),
      iron,
      [-1.52 + (index % 3) * 0.22, 1.16 + index * 0.003, -0.18 + Math.floor(index / 3) * 0.2],
      [Math.PI / 2, index % 2 ? Math.PI / 2 : 0, index * 0.12],
    ));
  }
  return group;
}

function makeTricliniumMemory() {
  const group = new THREE.Group();
  const couch = standardMaterial(0x754237, { roughness: 0.96 });
  const wood = standardMaterial(0x4e3427, { roughness: 0.92 });
  const scroll = standardMaterial(0xd4c49f, { roughness: 0.9 });
  group.add(mesh(new THREE.BoxGeometry(1.05, 0.28, 0.5), couch, [-1.95, 0.24, -0.72]));
  group.add(mesh(new THREE.BoxGeometry(0.16, 0.5, 0.5), couch, [-2.42, 0.42, -0.72]));
  group.add(mesh(new THREE.BoxGeometry(0.92, 0.08, 0.44), wood, [-1.95, 0.08, -0.72]));
  group.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.58, 12), scroll, [0.78, 1.18, -0.21], [0, 0, Math.PI / 2]));
  return group;
}

function makeRouteMemory() {
  const group = new THREE.Group();
  const mapStone = standardMaterial(0x827563, { roughness: 1 });
  const road = standardMaterial(0xc39961, { roughness: 0.9 });
  const marker = standardMaterial(0x8e4939, { roughness: 0.82 });
  group.add(mesh(new THREE.BoxGeometry(0.88, 0.05, 1.05), mapStone, [-2.05, 0.05, 0.78]));
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.35, 0.09, 1.04),
    new THREE.Vector3(-2.12, 0.1, 0.7),
    new THREE.Vector3(-1.95, 0.1, 0.88),
    new THREE.Vector3(-1.72, 0.1, 0.5),
  ]);
  group.add(mesh(new THREE.TubeGeometry(curve, 24, 0.025, 7, false), road));
  [[-2.35, 1.04], [-1.72, 0.5]].forEach(([x, z]) => {
    group.add(mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.26, 8), marker, [x, 0.22, z]));
  });
  return group;
}

function makeServingSet() {
  const group = new THREE.Group();
  const clay = standardMaterial(0xa96845, { roughness: 0.98, side: THREE.DoubleSide });
  [0.62, 0.93].forEach((x, index) => {
    group.add(mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.09, 18, 1, true), clay, [x, 1.14, -0.18 - index * 0.04]));
    group.add(mesh(new THREE.TorusGeometry(0.16, 0.015, 7, 22), clay, [x, 1.195, -0.18 - index * 0.04], [Math.PI / 2, 0, 0]));
  });
  const jug = makeAmphora(0.42, 0xb1714f);
  jug.position.set(1.42, 1.09, -0.2);
  group.add(jug);
  return group;
}

function makeDioramaRoot() {
  const root = new THREE.Group();
  root.name = "EumachusDiorama";
  const architecture = makeThermopoliumArchitecture();
  root.add(architecture);

  const stageGroups = {
    name: makeNameTokens(),
    house: makeHorseMemory(),
    fall: makeBrokenLinks(),
    voice: makeTricliniumMemory(),
    siscia: makeRouteMemory(),
    thermopolium: makeServingSet(),
  };
  Object.values(stageGroups).forEach((group) => {
    group.visible = false;
    root.add(group);
  });

  const character = makeRomanEumachus();
  root.add(character);
  return { root, architecture, stageGroups, character };
}

export class Diorama {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.arSession = null;
    this.hitTestSource = null;
    this.arPlaced = false;
    this.arSupported = false;
    this.currentScene = null;
  }

  async init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.xr.enabled = true;
    this.renderer.setPixelRatio(clampPixelRatio());

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x11171a, 0.042);
    this.scene.background = new THREE.Color(0x11171a);
    this.camera = new THREE.PerspectiveCamera(39, 1, 0.01, 100);
    this.camera.position.set(5.5, 3.4, 6.6);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.065;
    this.controls.target.set(0, 0.95, -0.3);
    this.controls.minDistance = 4.5;
    this.controls.maxDistance = 11;
    this.controls.maxPolarAngle = Math.PI * 0.49;

    const hemi = new THREE.HemisphereLight(0xc5d3cf, 0x3e261b, 2.35);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffd39a, 3.9);
    key.position.set(-4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);
    const edge = new THREE.PointLight(0x6ba1b2, 13, 9, 2);
    edge.position.set(3.4, 2.2, -2.8);
    this.scene.add(edge);

    const built = makeDioramaRoot();
    this.root = built.root;
    this.architecture = built.architecture;
    this.stageGroups = built.stageGroups;
    this.character = built.character;
    this.scene.add(this.root);
    if (this.currentScene) this.setScene(this.currentScene);

    this.reticle = mesh(
      new THREE.RingGeometry(0.1, 0.135, 40).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xe0ba78 }),
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas.parentElement);
    } else {
      this.boundResize = () => this.resize();
      window.addEventListener("resize", this.boundResize);
    }
    this.resize();
    this.renderer.setAnimationLoop((time, frame) => this.render(time, frame));
    this.renderer.render(this.scene, this.camera);
    this.callbacks.onReady?.();

    this.arSupported = false;
    this.callbacks.onARSupport?.(false);
    const xr = navigator.xr;
    if (xr && typeof xr.isSessionSupported === "function") {
      let timeoutId;
      const timeout = new Promise((resolve) => {
        timeoutId = window.setTimeout(() => resolve(false), 1800);
      });
      const supportCheck = Promise.resolve()
        .then(() => xr.isSessionSupported("immersive-ar"))
        .catch(() => false);
      void Promise.race([supportCheck, timeout]).then((supported) => {
        window.clearTimeout(timeoutId);
        this.arSupported = Boolean(supported);
        this.callbacks.onARSupport?.(this.arSupported);
      });
    }
    return this;
  }

  setScene(sceneData) {
    this.currentScene = sceneData;
    if (!this.stageGroups || !this.character) return;
    Object.values(this.stageGroups).forEach((group) => {
      group.visible = false;
    });
    const active = this.stageGroups[sceneData.visual];
    if (active) {
      active.visible = true;
      markMaterialOpacity(active, sceneData.opacity);
    }

    const poses = {
      name: { position: [1.3, 0, 0.82], rotation: 0.42 },
      house: { position: [1.36, 0, 0.84], rotation: 0.5 },
      fall: { position: [1.22, 0, 0.82], rotation: 0.34 },
      voice: { position: [1.32, 0, 0.84], rotation: 0.52 },
      siscia: { position: [1.25, 0, 0.86], rotation: 0.36 },
      thermopolium: { position: [1.38, 0, 0.84], rotation: 0.46 },
    };
    const pose = poses[sceneData.visual] ?? poses.name;
    this.character.position.set(...pose.position);
    this.character.userData.baseY = pose.position[1];
    this.character.rotation.y = pose.rotation;
    markMaterialOpacity(this.character, Math.max(sceneData.opacity, 0.68));

    this.root.rotation.y = -0.12;
    this.root.scale.setScalar(this.arSession ? 0.24 : 1);
  }

  async startAR() {
    if (!this.arSupported || !navigator.xr) return false;
    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay", "local-floor"],
        domOverlay: { root: document.body },
      });
      this.arSession = session;
      this.arPlaced = false;
      this.controls.enabled = false;
      this.scene.background = null;
      this.scene.fog = null;
      this.root.visible = false;
      this.root.scale.setScalar(0.24);
      document.body.classList.add("xr-active");

      session.addEventListener("end", () => this.endARState(), { once: true });
      session.addEventListener("select", () => this.placeAtReticle());
      await this.renderer.xr.setSession(session);
      const viewerSpace = await session.requestReferenceSpace("viewer");
      this.hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
      this.callbacks.onARState?.("finding");
      return true;
    } catch (error) {
      console.warn("WebXR session could not start.", error);
      this.endARState();
      this.callbacks.onARState?.("failed");
      return false;
    }
  }

  async stopAR() {
    if (this.arSession) await this.arSession.end();
  }

  endARState() {
    this.hitTestSource?.cancel?.();
    this.hitTestSource = null;
    this.arSession = null;
    this.arPlaced = false;
    this.reticle.visible = false;
    this.root.visible = true;
    this.root.position.set(0, 0, 0);
    this.root.quaternion.identity();
    this.root.scale.setScalar(1);
    this.scene.background = new THREE.Color(0x11171a);
    this.scene.fog = new THREE.FogExp2(0x11171a, 0.042);
    this.controls.enabled = true;
    document.body.classList.remove("xr-active");
    this.callbacks.onARState?.("ended");
    if (this.currentScene) this.setScene(this.currentScene);
    this.resetView();
  }

  placeAtReticle() {
    if (!this.arSession || !this.reticle.visible) return;
    this.root.visible = true;
    this.root.position.setFromMatrixPosition(this.reticle.matrix);
    this.root.quaternion.setFromRotationMatrix(this.reticle.matrix);
    this.root.scale.setScalar(0.24);
    this.arPlaced = true;
    this.callbacks.onARState?.("placed");
  }

  resetView() {
    if (this.arSession) {
      this.root.visible = false;
      this.arPlaced = false;
      this.callbacks.onARState?.("finding");
      return;
    }
    this.camera.position.set(5.5, 3.4, 6.6);
    this.controls.target.set(0, 0.95, -0.3);
    this.controls.update();
  }

  resize() {
    if (!this.renderer || this.arSession) return;
    const container = this.canvas.parentElement;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(clampPixelRatio());
  }

  render(_time, frame) {
    const elapsed = this.clock.getElapsedTime();
    if (!this.arSession) {
      this.controls.update();
      this.character.position.y =
        (this.character.userData.baseY ?? 0) + Math.sin(elapsed * 1.2) * 0.006;
    } else if (frame && this.hitTestSource) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const hit = frame.getHitTestResults(this.hitTestSource)[0];
      if (hit) {
        const pose = hit.getPose(referenceSpace);
        this.reticle.visible = !this.arPlaced;
        if (pose) this.reticle.matrix.fromArray(pose.transform.matrix);
        if (!this.arPlaced) this.callbacks.onARState?.("ready");
      } else {
        this.reticle.visible = false;
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.resizeObserver?.disconnect();
    if (this.boundResize) window.removeEventListener("resize", this.boundResize);
    this.renderer?.setAnimationLoop(null);
    this.controls?.dispose();
    this.renderer?.dispose();
  }
}
