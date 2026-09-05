# Third-party assets

The thermopolium is built from native Three.js geometry. Eumachus uses a local,
rigged human mesh with a project-authored tunic and pose. The preview no longer
loads the provisional Quaternius fantasy character.

## Eumachus human base mesh

- Source asset: `parametric-base.glb` from https://github.com/nirholas/three.ws/tree/main/avatar-sources/anny
- Upstream provenance: MakeHuman / MPFB2, derived through the `naver/anny` project
- License: CC0 1.0 / public domain dedication
- Local changes: masculine, age and facial morphs baked into the mesh; unused morph
  targets removed; skin material adjusted; project-authored Roman tunic and pose
  applied at runtime.

## Three.js

- Source: https://threejs.org/
- License: MIT
- Version: 0.169.0
- Delivery: vendored ES modules served with the preview, without a runtime CDN dependency.

## A-Frame and AR.js

Used only by the preserved marker-based demo under `legacy/`.

- A-Frame: MIT
- AR.js: MIT
