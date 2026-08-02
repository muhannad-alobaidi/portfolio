/*
  KTX2 wiring for the workstation models.

  The models ship BasisU-supercompressed textures (see scripts/build-assets.mjs),
  which is what took their GPU footprint from ~368MB down to a fraction of that —
  the thing that makes the PC scene cheap enough to stay resident across scroll
  instead of being torn down and rebuilt at every threshold. drei's useGLTF
  handles Draco and meshopt but not KTX2, so the loader is extended by hand.

  Two constraints shape this file:
  - KTX2Loader.detectSupport(renderer) must run before any KTX2 texture is
    parsed, or the transcode throws. It needs a live WebGLRenderer, which only
    exists inside a Canvas — hence primeKTX2(), called from onCreated.
  - The transcoder is self-hosted from /basis rather than a CDN, so the scene
    isn't hostage to a third party at load time.
*/
import { KTX2Loader } from 'three-stdlib';

let ktx2Loader = null;
let primed = false;
const waiting = new Set();

function getKTX2Loader() {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/');
  }
  return ktx2Loader;
}

/*
  Hands the loader a renderer so it can pick a transcode target the GPU
  supports, then releases anything queued behind that. Every Canvas calls this
  (via useWebGLRecovery); only the first one does any work.
*/
export function primeKTX2(gl) {
  if (primed || !gl) return;
  getKTX2Loader().detectSupport(gl);
  primed = true;
  for (const cb of waiting) cb();
  waiting.clear();
}

/*
  Runs `cb` once a renderer has primed the loader — immediately if one already
  has. Used to hold model preloading until KTX2 can actually be decoded.
*/
export function onKTX2Ready(cb) {
  if (primed) cb();
  else waiting.add(cb);
}

/* Pass as useGLTF's 4th argument. */
export function extendGLTFLoader(loader) {
  loader.setKTX2Loader(getKTX2Loader());
}
