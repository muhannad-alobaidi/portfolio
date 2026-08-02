/*
  Warms the workstation scene ahead of the user reaching it.

  These fetches used to happen at module scope inside Muha2.jsx/Desk.jsx, which
  meant they fired during entry-chunk evaluation — 61.5MB of glTF competing with
  the hero swarm's first paint. Two things changed:

  - the models are ~12MB now, so loading them eagerly is cheap, and it keeps
    SplashScreen's useProgress() reporting real numbers (it watches three's
    DefaultLoadingManager, which only sees requests that have started)
  - KTX2 textures cannot be transcoded until a WebGLRenderer has primed the
    loader, so the fetch has to wait for the first Canvas rather than racing it

  Called once the hero canvas exists. Idempotent.
*/
import { useGLTF } from '@react-three/drei';
import { MUHA_MODEL, DESK_MODEL } from '../components/modelPaths';
import { extendGLTFLoader, onKTX2Ready } from './gltfLoader';

let started = false;

export function preloadScenes() {
  if (started) return;
  started = true;

  // the JS chunk can start now — it needs no renderer, and having it parsed
  // means mounting the section later is a render, not a network round trip
  import('./../components/PCSection');

  onKTX2Ready(() => {
    useGLTF.preload(MUHA_MODEL, true, true, extendGLTFLoader);
    useGLTF.preload(DESK_MODEL, true, true, extendGLTFLoader);
  });
}
