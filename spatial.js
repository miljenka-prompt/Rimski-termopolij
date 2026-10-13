import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js'

window.THREE = THREE

const VIDEO_URL = './assets/Termopolij_svađa1.mp4'
const PLACEMENT_DISTANCE = 2.15
const SCENE_HEIGHT = 2.05

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
  element.loop = true
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
        float shape = pow(pow(edge.x, 7.) + pow(edge.y, 7.), 1. / 7.);
        float irregular = sin(vUv.x * 31. + sin(vUv.y * 17.)) * .025
                        + sin((vUv.x + vUv.y) * 43.) * .014;
        float feather = 1. - smoothstep(.77 + irregular, 1. + irregular, shape);
        float alpha = opacity * feather;
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
    curvePlane(new THREE.PlaneGeometry(3.65, SCENE_HEIGHT, 24, 1)),
    livingMaterial(texture)
  )
  livingScene.position.set(0, SCENE_HEIGHT / 2, 0)
  livingScene.renderOrder = 2
  world.add(livingScene)

  video.addEventListener('loadedmetadata', () => {
    const aspect = video.videoWidth / video.videoHeight
    const width = SCENE_HEIGHT * aspect
    livingScene.geometry.dispose()
    livingScene.geometry = curvePlane(new THREE.PlaneGeometry(width, SCENE_HEIGHT, 24, 1))
  }, {once: true})

  video.addEventListener('error', () => {
    setStatus('Prizor se nije učitao. Osvježi stranicu i pokušaj ponovno.')
  })
}

async function startLivingScene() {
  try {
    video.muted = false
    await video.play()
    $('video-toggle').textContent = 'Pauziraj prizor'
    return true
  } catch {
    setStatus('Termopolij je postavljen. Dodirni “Pokreni prizor i zvuk”.')
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

  const dx = hit.x - xrCamera.position.x
  const dz = hit.z - xrCamera.position.z
  const distance = Math.hypot(dx, dz)
  if (distance > .01) {
    hit.x = xrCamera.position.x + (dx / distance) * PLACEMENT_DISTANCE
    hit.z = xrCamera.position.z + (dz / distance) * PLACEMENT_DISTANCE
  } else {
    const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(xrCamera.quaternion)
    facing.y = 0
    facing.normalize()
    hit.x = xrCamera.position.x + facing.x * PLACEMENT_DISTANCE
    hit.z = xrCamera.position.z + facing.z * PLACEMENT_DISTANCE
  }

  world.position.copy(hit)
  world.visible = true
  $('placement-hint').classList.add('is-hidden')
  setStatus('Termopolij je otvoren u prostoru.', 1800)
  startLivingScene()
}

const spatialModule = () => ({
  name: 'carnuntum-living-thermopolium',
  onStart: ({canvas}) => {
    const {scene, camera} = XR8.Threejs.xrScene()
    xrCamera = camera
    build(scene)
    camera.position.set(0, 1.6, 2.5)
    XR8.XrController.updateCameraProjectionMatrix({origin: camera.position, facing: camera.quaternion})
    canvas.addEventListener('touchmove', (event) => event.preventDefault(), {passive: false})
    canvas.addEventListener('pointerup', (event) => {
      if (event.target === canvas) placeAt(event.clientX, event.clientY, canvas)
    })
  },
  onUpdate: () => {
    if (!livingScene || !xrCamera || !world?.visible) return
    const scenePosition = new THREE.Vector3()
    livingScene.getWorldPosition(scenePosition)
    const yaw = Math.atan2(
      xrCamera.position.x - scenePosition.x,
      xrCamera.position.z - scenePosition.z
    )
    livingScene.rotation.set(0, yaw, 0)
  },
})

function start() {
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
    $('video-toggle').textContent = 'Pokreni prizor i zvuk'
    setStatus('Usmjeri kameru prema podu i dodirni novo mjesto za termopolij.')
  })

  $('video-toggle').addEventListener('click', async () => {
    if (!video || !world?.visible) {
      setStatus('Najprije dodirni pod i postavi termopolij.')
      return
    }
    if (video.paused) await startLivingScene()
    else {
      video.pause()
      $('video-toggle').textContent = 'Pokreni prizor i zvuk'
    }
  })
}

window.XR8 ? start() : window.addEventListener('xrloaded', start)
