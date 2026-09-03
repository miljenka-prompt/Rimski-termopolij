import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MATERIAL_BASE_OPACITY = "baseOpacity";

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

function makeTextSprite(text, color = "#eadab9", width = 640, height = 180) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgba(8, 10, 12, .78)";
  context.strokeStyle = "rgba(224, 186, 120, .55)";
  context.lineWidth = 3;
  context.beginPath();
  if (typeof context.roundRect === "function") {
    context.roundRect(4, 4, width - 8, height - 8, 26);
  } else {
    context.rect(4, 4, width - 8, height - 8);
  }
  context.fill();
  context.stroke();
  context.fillStyle = color;
  context.font = "700 52px Georgia";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, width / 2, height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  material.userData[MATERIAL_BASE_OPACITY] = 1;
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.6, 0.73, 1);
  return sprite;
}

function makeColumn(height = 1.8) {
  const group = new THREE.Group();
  const stone = standardMaterial(0xb9ad96, { roughness: 1 });
  group.add(mesh(new THREE.CylinderGeometry(0.18, 0.22, height, 12), stone, [0, height / 2, 0]));
  group.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 12), stone, [0, 0.06, 0]));
  group.add(mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.12, 12), stone, [0, height - 0.03, 0]));
  return group;
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
    const handle = mesh(new THREE.TorusGeometry(0.12, 0.025, 7, 18, Math.PI), clay, [side * 0.13, 0.67, 0], [0, side * Math.PI / 2, Math.PI / 2]);
    group.add(handle);
  });
  group.scale.setScalar(scale);
  return group;
}

function makeShield() {
  const group = new THREE.Group();
  const wood = standardMaterial(0x6c3028, { roughness: 0.82 });
  const bronze = standardMaterial(0xc49652, { metalness: 0.58, roughness: 0.42 });
  group.add(mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 32), wood, [0, 0, 0], [Math.PI / 2, 0, 0]));
  group.add(mesh(new THREE.TorusGeometry(0.42, 0.035, 10, 36), bronze));
  group.add(mesh(new THREE.SphereGeometry(0.11, 14, 10), bronze, [0, 0, 0.06]));
  return group;
}

function makeHorseHouse() {
  const group = new THREE.Group();
  const timber = standardMaterial(0x5a402d, { roughness: 1 });
  const earth = standardMaterial(0x6e5840, { roughness: 1 });
  group.add(mesh(new THREE.BoxGeometry(2.9, 0.12, 1.8), earth, [0, 0.06, 0]));
  [-1.2, 1.2].forEach((x) => {
    [-0.65, 0.65].forEach((z) => {
      group.add(mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.75, 8), timber, [x, 0.9, z]));
    });
  });
  group.add(mesh(new THREE.BoxGeometry(2.75, 0.12, 0.12), timber, [0, 1.7, -0.65]));
  group.add(mesh(new THREE.BoxGeometry(2.75, 0.12, 0.12), timber, [0, 1.7, 0.65]));

  const shield = makeShield();
  shield.position.set(-0.86, 1.03, 0.72);
  shield.rotation.x = -0.12;
  group.add(shield);

  const spear = mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.25, 8), standardMaterial(0x7a5a39), [0.85, 1.05, 0.72], [0, 0, 0.18]);
  group.add(spear);
  const head = mesh(new THREE.ConeGeometry(0.075, 0.27, 5), standardMaterial(0xa4a7a2, { metalness: 0.72, roughness: 0.38 }), [0.65, 2.15, 0.72], [0, 0, 0.18]);
  group.add(head);
  const label = makeTextSprite("DOMVS · EQVI");
  label.position.set(0, 2.12, 0);
  label.scale.multiplyScalar(0.66);
  group.add(label);
  return group;
}

function makeNameToken() {
  const group = new THREE.Group();
  const bronze = standardMaterial(0xb68545, { metalness: 0.66, roughness: 0.38 });
  const token = mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.11, 48), bronze, [0, 1.1, 0], [Math.PI / 2, 0, 0]);
  group.add(token);
  const greek = makeTextSprite("ΕΥΜΑΧΟΣ");
  greek.position.set(0, 1.22, 0.09);
  greek.scale.multiplyScalar(0.58);
  group.add(greek);
  const latin = makeTextSprite("EVMACHVS", "#d5a45e");
  latin.position.set(0, 0.52, 0.2);
  latin.scale.multiplyScalar(0.52);
  group.add(latin);
  return group;
}

function makeBrokenLinks() {
  const group = new THREE.Group();
  const iron = standardMaterial(0x555b5c, { metalness: 0.72, roughness: 0.52 });
  for (let index = 0; index < 7; index += 1) {
    const link = mesh(new THREE.TorusGeometry(0.19, 0.045, 9, 22), iron, [-0.72 + index * 0.24, 0.18 + Math.sin(index) * 0.03, 0]);
    link.rotation.x = Math.PI / 2;
    link.rotation.y = index % 2 ? Math.PI / 2 : 0;
    if (index === 3) link.rotation.z = 0.42;
    group.add(link);
  }
  const stone = standardMaterial(0x716859, { roughness: 1 });
  group.add(mesh(new THREE.BoxGeometry(1.5, 0.18, 1.05), stone, [0, 0.02, 0]));
  const label = makeTextSprite("CAPTIVVS ?", "#caa072");
  label.position.set(0, 1.25, 0);
  label.scale.multiplyScalar(0.55);
  group.add(label);
  return group;
}

function makeTriclinium() {
  const group = new THREE.Group();
  const couch = standardMaterial(0x7b3d32, { roughness: 0.96 });
  const wood = standardMaterial(0x4e3427, { roughness: 0.92 });
  const mosaic = standardMaterial(0xb6aa91, { roughness: 1 });
  group.add(mesh(new THREE.BoxGeometry(3.1, 0.1, 2.25), mosaic, [0, 0.05, 0]));
  [-1, 1].forEach((x) => {
    group.add(mesh(new THREE.BoxGeometry(0.68, 0.28, 1.75), couch, [x, 0.28, 0]));
    group.add(mesh(new THREE.BoxGeometry(0.68, 0.48, 0.18), couch, [x, 0.49, -0.78]));
  });
  group.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 24), wood, [0, 0.45, 0]));
  const scroll = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.72, 12), standardMaterial(0xd4c49f), [0, 0.55, 0], [0, 0, Math.PI / 2]);
  group.add(scroll);
  const label = makeTextSprite("μῆνιν ἄειδε…", "#dfc895");
  label.position.set(0, 1.62, -0.25);
  label.scale.multiplyScalar(0.58);
  group.add(label);
  return group;
}

function makeRoute() {
  const group = new THREE.Group();
  const terrain = standardMaterial(0x4c5149, { roughness: 1 });
  const road = standardMaterial(0xc19a60, { roughness: 0.9, opacity: 0.92 });
  group.add(mesh(new THREE.BoxGeometry(3.4, 0.12, 2), terrain, [0, 0.02, 0]));

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.25, 0.13, 0.55),
    new THREE.Vector3(-0.45, 0.14, -0.18),
    new THREE.Vector3(0.36, 0.14, 0.18),
    new THREE.Vector3(1.28, 0.14, -0.48),
  ]);
  group.add(mesh(new THREE.TubeGeometry(curve, 36, 0.055, 8, false), road));

  const markerMaterial = standardMaterial(0xa64d38, { roughness: 0.72 });
  [[-1.25, 0.55], [1.28, -0.48]].forEach(([x, z]) => {
    group.add(mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.65, 10), markerMaterial, [x, 0.44, z]));
  });
  const siscia = makeTextSprite("SISCIA");
  siscia.position.set(-1.18, 1.04, 0.55);
  siscia.scale.multiplyScalar(0.4);
  group.add(siscia);
  const andautonia = makeTextSprite("ANDAVTONIA");
  andautonia.position.set(1.08, 1.03, -0.5);
  andautonia.scale.multiplyScalar(0.46);
  group.add(andautonia);
  return group;
}

function makeThermopolium() {
  const group = new THREE.Group();
  const plaster = standardMaterial(0x9d654c, { roughness: 0.96 });
  const stone = standardMaterial(0xc0b49b, { roughness: 0.98 });
  const darkStone = standardMaterial(0x5c554c, { roughness: 1 });

  group.add(mesh(new THREE.BoxGeometry(3.25, 1.02, 0.76), plaster, [0, 0.57, 0.15]));
  group.add(mesh(new THREE.BoxGeometry(3.42, 0.12, 0.92), stone, [0, 1.1, 0.15]));
  group.add(mesh(new THREE.BoxGeometry(0.72, 1.02, 1.8), plaster, [-1.3, 0.57, -0.36]));
  group.add(mesh(new THREE.BoxGeometry(0.84, 0.12, 1.94), stone, [-1.3, 1.1, -0.36]));
  [-0.55, 0.35, 1.12].forEach((x, index) => {
    group.add(mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.28, 24), darkStone, [x, 1.08, 0.15]));
    const amphora = makeAmphora(0.72 + index * 0.03, [0xa26243, 0x8a503d, 0xb4734e][index]);
    amphora.position.set(x, 0.02, -0.82);
    group.add(amphora);
  });
  const sign = makeTextSprite("THERMOPOLIVM");
  sign.position.set(0.35, 1.82, 0.1);
  sign.scale.multiplyScalar(0.58);
  group.add(sign);
  return group;
}

function makePlaceholderPerson() {
  const group = new THREE.Group();
  const cloth = standardMaterial(0x526b70, { roughness: 0.98 });
  const skin = standardMaterial(0xb77b55, { roughness: 0.92 });
  group.add(mesh(new THREE.CylinderGeometry(0.24, 0.38, 1.02, 12), cloth, [0, 0.84, 0]));
  group.add(mesh(new THREE.SphereGeometry(0.18, 16, 12), skin, [0, 1.52, 0]));
  const shoulder = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.92, 8), cloth, [0, 1.12, 0], [0, 0, Math.PI / 2]);
  group.add(shoulder);
  return group;
}

function fitModelToHeight(model, targetHeight) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  if (size.y > 0) model.scale.setScalar(targetHeight / size.y);
  const fittedBox = new THREE.Box3().setFromObject(model);
  model.position.y -= fittedBox.min.y;
}

function makeDioramaRoot() {
  const root = new THREE.Group();
  root.name = "EumachusDiorama";

  const baseMaterial = standardMaterial(0x48443c, { roughness: 1 });
  const rimMaterial = standardMaterial(0xa77a44, { metalness: 0.38, roughness: 0.62 });
  root.add(mesh(new THREE.CylinderGeometry(3.2, 3.28, 0.2, 64), baseMaterial, [0, -0.1, 0]));
  root.add(mesh(new THREE.TorusGeometry(3.17, 0.035, 10, 72), rimMaterial, [0, 0.01, 0], [Math.PI / 2, 0, 0]));

  const columns = new THREE.Group();
  [[-2.48, -1.58], [2.48, -1.58]].forEach(([x, z]) => {
    const column = makeColumn(1.55);
    column.position.set(x, 0, z);
    columns.add(column);
  });
  root.add(columns);

  const stageGroups = {
    name: makeNameToken(),
    house: makeHorseHouse(),
    fall: makeBrokenLinks(),
    voice: makeTriclinium(),
    siscia: makeRoute(),
    thermopolium: makeThermopolium(),
  };

  Object.values(stageGroups).forEach((group) => {
    group.visible = false;
    group.position.z = 0.2;
    root.add(group);
  });

  const character = new THREE.Group();
  character.name = "Eumachus";
  const placeholder = makePlaceholderPerson();
  character.add(placeholder);
  root.add(character);

  return { root, stageGroups, character, placeholder };
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
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.xr.enabled = true;
    this.renderer.setPixelRatio(clampPixelRatio());

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x11171a, 0.048);
    this.scene.background = new THREE.Color(0x11171a);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
    this.camera.position.set(5.25, 3.45, 6.3);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.065;
    this.controls.target.set(0, 0.78, 0);
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI * 0.49;

    const hemi = new THREE.HemisphereLight(0xb9d2d3, 0x3e261b, 2.2);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffd79a, 3.6);
    key.position.set(-4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);
    const edge = new THREE.PointLight(0x6ba1b2, 15, 9, 2);
    edge.position.set(3.4, 2.2, -2.8);
    this.scene.add(edge);

    const built = makeDioramaRoot();
    this.root = built.root;
    this.stageGroups = built.stageGroups;
    this.character = built.character;
    this.placeholder = built.placeholder;
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

    this.arSupported = Boolean(
      navigator.xr &&
        typeof navigator.xr.isSessionSupported === "function" &&
        (await navigator.xr.isSessionSupported("immersive-ar").catch(() => false)),
    );
    this.callbacks.onARSupport?.(this.arSupported);

    await this.loadCharacter();
    this.callbacks.onReady?.();
    return this;
  }

  async loadCharacter() {
    const loader = new GLTFLoader();
    const url =
      "https://raw.githubusercontent.com/miljenka-prompt/Psefizma_AR/main/public/models/lumbarda/Greek_Male_Peasant.gltf";
    try {
      const gltf = await loader.loadAsync(url);
      const model = gltf.scene;
      model.name = "EumachusProvisionalModel";
      fitModelToHeight(model, 1.75);
      model.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        child.material = materials.map((source) => {
          const material = source.clone();
          material.roughness = Math.max(material.roughness ?? 0.6, 0.82);
          material.metalness = Math.min(material.metalness ?? 0, 0.08);
          material.userData[MATERIAL_BASE_OPACITY] = material.opacity ?? 1;
          return material;
        });
        if (child.material.length === 1) child.material = child.material[0];
      });
      this.placeholder.visible = false;
      this.character.add(model);
      this.model = model;
      if (this.currentScene) this.setScene(this.currentScene);
    } catch (error) {
      console.warn("Provisional Eumachus model could not be loaded; using fallback figure.", error);
    }
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
      name: { position: [1.35, 0, 0.25], rotation: -0.48 },
      house: { position: [0.1, 0, -0.55], rotation: 0.08 },
      fall: { position: [0.85, 0, -0.35], rotation: -0.42 },
      voice: { position: [0, 0.08, 0.78], rotation: Math.PI },
      siscia: { position: [0, 0.12, 0.2], rotation: 0.1 },
      thermopolium: { position: [-1.12, 0, -0.75], rotation: 0.48 },
    };
    const pose = poses[sceneData.visual] ?? poses.name;
    this.character.position.set(...pose.position);
    this.character.userData.baseY = pose.position[1];
    this.character.rotation.y = pose.rotation;
    markMaterialOpacity(this.character, Math.max(sceneData.opacity, 0.52));

    this.root.rotation.y = -0.18;
    this.root.scale.setScalar(this.arSession ? 0.27 : 1);
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
      this.root.scale.setScalar(0.27);
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
    this.scene.fog = new THREE.FogExp2(0x11171a, 0.048);
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
    this.root.scale.setScalar(0.27);
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
    this.camera.position.set(5.25, 3.45, 6.3);
    this.controls.target.set(0, 0.78, 0);
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
