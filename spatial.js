import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js'

window.THREE = THREE

const VIDEO_URL = './assets/Termopolij_svađa1.mp4'
const PLACEMENT_DISTANCE = 2.65
const SCENE_HEIGHT = 2.12
const SCENE_WIDTH_SCALE = 1.1
const SCENE_ASPECT = 1
const SCENE_WIDTH = SCENE_HEIGHT * SCENE_ASPECT * SCENE_WIDTH_SCALE
const FADE_OUT_START = 28.55
const LOOP_AT = 29.25
const FADE_IN_END = 1.15
const LANGUAGE = ['hr', 'en', 'de'].includes(new URLSearchParams(location.search).get('lang'))
  ? new URLSearchParams(location.search).get('lang')
  : 'hr'
const COPY = {
  hr: {
    back: '← Projekt', title: 'Aedificia iam habemus. Sed ubi sunt homines?',
    intro: 'Usmjeri kameru prema podu i dodirni mjesto na kojem želiš otvoriti termopolij.',
    hint: 'Dodirni pod da se pojavi termopolij', replace: 'Postavi ponovno', play: 'Pokreni prizor i zvuk',
    pause: 'Pauziraj prizor', loadError: 'Prizor se nije učitao. Osvježi stranicu i pokušaj ponovno.',
    tapPlay: 'Termopolij je postavljen. Dodirni “Pokreni prizor i zvuk”.', opened: 'Termopolij je otvoren u prostoru.',
    replaceHint: 'Usmjeri kameru prema podu i dodirni novo mjesto za termopolij.', first: 'Najprije dodirni pod i postavi termopolij.'
  },
  en: {
    back: '← Project', title: 'Aedificia iam habemus. Sed ubi sunt homines?',
    intro: 'Point the camera at the floor and tap where you want to open the thermopolium.',
    hint: 'Tap the floor to reveal the thermopolium', replace: 'Place again', play: 'Play scene and sound',
    pause: 'Pause scene', loadError: 'The scene could not be loaded. Refresh the page and try again.',
    tapPlay: 'The thermopolium is placed. Tap “Play scene and sound”.', opened: 'The thermopolium is open in your space.',
    replaceHint: 'Point the camera at the floor and tap a new position for the thermopolium.', first: 'Tap the floor to place the thermopolium first.'
  },
  de: {
    back: '← Projekt', title: 'Aedificia iam habemus. Sed ubi sunt homines?',
    intro: 'Richten Sie die Kamera auf den Boden und tippen Sie auf die Stelle, an der das Thermopolium erscheinen soll.',
    hint: 'Auf den Boden tippen, um das Thermopolium zu öffnen', replace: 'Neu platzieren', play: 'Szene und Ton starten',
    pause: 'Szene pausieren', loadError: 'Die Szene konnte nicht geladen werden. Aktualisieren Sie die Seite und versuchen Sie es erneut.',
    tapPlay: 'Das Thermopolium ist platziert. Tippen Sie auf „Szene und Ton starten“.', opened: 'Das Thermopolium wurde im Raum geöffnet.',
    replaceHint: 'Richten Sie die Kamera auf den Boden und wählen Sie eine neue Position.', first: 'Tippen Sie zuerst auf den Boden, um das Thermopolium zu platzieren.'
  }
}
const copy = (key) => COPY[LANGUAGE][key]

let world = null
let livingScene = null
let video = null
let xrCamera = null
let statusTimer = null

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const $ = (id) => document.getElementById(id)

function setStatus(text, autoHideMs = 0) {
  const status = $('status')
  const card = document.querySelector('.status-card')
  if (!status || !card) return
  if (statusTimer) clearTimeout(statusTimer)
  status.textContent = text
  card.classList.remove('is-hidden')
  if (autoHideMs > 0) statusTimer = setTimeout(() => card.classList.add('is-hidden'), autoHideMs)
}

function createVideo() {
  const element = document.createElement('video')
  element.src = VIDEO_URL
  // The source contains 3.4 s of terminal black. We loop before it and let
  // the AR layer dissolve into the real room instead of showing a black plane.
  element.loop = false
  element.muted = false
  element.playsInline = true
  element.setAttribute('playsinline', '')
  element.setAttribute('webkit-playsinline', '')
  element.preload = 'auto'
  element.crossOrigin = 'anonymous'
  return element
}

function livingMaterial(map) {
  return new THREE.ShaderMaterial({
    uniforms: {map: {value: map}, opacity: {value: 1}},
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(map, vUv);
        vec2 edge = abs((vUv - .5) / .5);
        float shape = pow(pow(edge.x, 6.) + pow(edge.y, 6.), 1. / 6.);
        float irregular = sin(vUv.x * 31. + sin(vUv.y * 17.)) * .025
                        + sin((vUv.x + vUv.y) * 43.) * .014;
        // Keep Eumachus, the counter and the people immediately around it
        // dense. Only the outer perimeter dissolves into the real room.
        float feather = 1. - smoothstep(.74 + irregular, 1.02 + irregular, shape);
        // The source already ends at the figures' feet. Preserve virtually
        // all of that lower frame and soften only the terminal pixel strip.
        float floorBlend = smoothstep(0., .018, vUv.y);
        float alpha = opacity * feather * floorBlend;
        if (alpha < .012) discard;
        gl_FragColor = vec4(color.rgb, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
}

function curvePlane(geometry, strength = .085) {
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    position.setZ(i, -strength * x * x)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function build(scene) {
  world = new THREE.Group()
  world.visible = false
  scene.add(world)

  video = createVideo()
  const texture = new THREE.VideoTexture(video)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false

  livingScene = new THREE.Mesh(
    curvePlane(new THREE.PlaneGeometry(SCENE_WIDTH, SCENE_HEIGHT, 24, 1)),
    livingMaterial(texture)
  )
  livingScene.position.set(0, SCENE_HEIGHT / 2, 0)
  livingScene.renderOrder = 2
  world.add(livingScene)

  video.addEventListener('error', () => {
    setStatus(copy('loadError'))
  })

  video.addEventListener('ended', () => {
    video.currentTime = 0
    video.play().catch(() => {})
  })
}

function smoothstep(min, max, value) {
  const x = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

function updateTemporalBlend() {
  if (!video || !livingScene) return
  const material = livingScene.material
  const time = video.currentTime

  if (time >= LOOP_AT) {
    material.uniforms.opacity.value = 0
    video.currentTime = 0
    return
  }

  if (time >= FADE_OUT_START) {
    material.uniforms.opacity.value = 1 - smoothstep(FADE_OUT_START, LOOP_AT, time)
  } else if (time < FADE_IN_END) {
    material.uniforms.opacity.value = smoothstep(0, FADE_IN_END, time)
  } else {
    material.uniforms.opacity.value = 1
  }
}

async function startLivingScene() {
  try {
    video.muted = false
    await video.play()
    $('video-toggle').textContent = copy('pause')
    return true
  } catch {
    setStatus(copy('tapPlay'))
    return false
  }
}

function placeAt(clientX, clientY, canvas) {
  if (!world || !xrCamera) return

  const rect = canvas.getBoundingClientRect()
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, xrCamera)

  const hit = new THREE.Vector3()
  if (!raycaster.ray.intersectPlane(floorPlane, hit)) return

  // Raycaster intersections are in world space. XR cameras can be parented
  // under a tracking origin, so camera.position may be only a local pose.
  // Keeping both operands in world space prevents the first placement from
  // being pushed far away (and therefore appearing tiny).
  const cameraPosition = new THREE.Vector3()
  const cameraQuaternion = new THREE.Quaternion()
  xrCamera.getWorldPosition(cameraPosition)
  xrCamera.getWorldQuaternion(cameraQuaternion)

  const dx = hit.x - cameraPosition.x
  const dz = hit.z - cameraPosition.z
  const distance = Math.hypot(dx, dz)
  if (distance > .01) {
    hit.x = cameraPosition.x + (dx / distance) * PLACEMENT_DISTANCE
    hit.z = cameraPosition.z + (dz / distance) * PLACEMENT_DISTANCE
  } else {
    const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraQuaternion)
    facing.y = 0
    facing.normalize()
    hit.x = cameraPosition.x + facing.x * PLACEMENT_DISTANCE
    hit.z = cameraPosition.z + facing.z * PLACEMENT_DISTANCE
  }

  world.position.copy(hit)
  world.visible = true
  $('placement-hint').classList.add('is-hidden')
  setStatus(copy('opened'), 1800)
  startLivingScene()
}

const spatialModule = () => ({
  name: 'carnuntum-living-thermopolium',
  onStart: ({canvas}) => {
    const {scene, camera} = XR8.Threejs.xrScene()
    xrCamera = camera
    build(scene)
    canvas.addEventListener('touchmove', (event) => event.preventDefault(), {passive: false})
    canvas.addEventListener('pointerup', (event) => {
      if (event.target === canvas) placeAt(event.clientX, event.clientY, canvas)
    })
  },
  onUpdate: () => {
    if (!livingScene || !xrCamera || !world?.visible) return
    updateTemporalBlend()
    const scenePosition = new THREE.Vector3()
    const cameraPosition = new THREE.Vector3()
    livingScene.getWorldPosition(scenePosition)
    xrCamera.getWorldPosition(cameraPosition)
    const yaw = Math.atan2(
      cameraPosition.x - scenePosition.x,
      cameraPosition.z - scenePosition.z
    )
    livingScene.rotation.set(0, yaw, 0)
  },
})

function start() {
  document.documentElement.lang = LANGUAGE
  $('back-link').textContent = copy('back')
  $('scene-title').textContent = copy('title')
  $('status').textContent = copy('intro')
  $('placement-hint').textContent = copy('hint')
  $('replace').textContent = copy('replace')
  $('video-toggle').textContent = copy('play')
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
    LandingPage.pipelineModule(),
    XRExtras.FullWindowCanvas.pipelineModule(),
    XRExtras.Loading.pipelineModule(),
    XRExtras.RuntimeError.pipelineModule(),
    spatialModule(),
  ])

  XR8.run({canvas: $('camerafeed')})

  $('replace').addEventListener('click', () => {
    video?.pause()
    if (video) video.currentTime = 0
    XR8.XrController.recenter()
    world.visible = false
    $('placement-hint').classList.remove('is-hidden')
    $('video-toggle').textContent = copy('play')
    setStatus(copy('replaceHint'))
  })

  $('video-toggle').addEventListener('click', async () => {
    if (!video || !world?.visible) {
      setStatus(copy('first'))
      return
    }
    if (video.paused) await startLivingScene()
    else {
      video.pause()
      $('video-toggle').textContent = copy('play')
    }
  })
}

window.XR8 ? start() : window.addEventListener('xrloaded', start)
