import { useCallback, useEffect, useRef, useState } from 'react';
import { primeKTX2 } from './gltfLoader';

/*
  WebGL context-loss recovery for @react-three/fiber canvases.

  three.js silently sets _isContextLost and early-returns from render() when a
  context is lost (GPU memory pressure / driver eviction), and browsers often
  never fire 'webglcontextrestored' for a real loss — so the canvas stays
  permanently blank (the white screen). R3F ships no recovery of its own.

  This hook drives a deterministic recovery: on 'webglcontextlost' we let the
  browser reclaim the GPU (preventDefault), then bump a React key to fully
  remount the <Canvas>, rebuilding the renderer + scene + textures on a fresh
  context. A retry cap stops a remount⇄re-lose thrash loop if pressure persists.

  Usage:
    const { canvasKey, onCreated } = useWebGLRecovery();
    <Canvas key={canvasKey} onCreated={onCreated} ... />

  IMPORTANT: the `key` goes on the <Canvas>, NOT on the component calling this
  hook — the guard/retry refs must survive the remount, so they live here.
*/
export function useWebGLRecovery({ maxRetries = 3, cooldownMs = 300 } = {}) {
  const [canvasKey, setCanvasKey] = useState(0);
  // the live canvas element + r3f state, refreshed on each (re)mount via onCreated
  const [canvasEl, setCanvasEl] = useState(null);
  const stateRef = useRef(null);
  const retries = useRef(0);
  const recovering = useRef(false);

  const onCreated = useCallback(state => {
    stateRef.current = state;
    setCanvasEl(state.gl.domElement);
    // a clean (re)mount means earlier pressure cleared — allow future recoveries
    recovering.current = false;
    // every canvas routes onCreated through here, which makes this the earliest
    // point a WebGLRenderer reliably exists — what KTX2 transcoding needs before
    // it can decode the models' textures. Idempotent past the first canvas.
    primeKTX2(state.gl);
  }, []);

  useEffect(() => {
    if (!canvasEl) return;
    const onLost = e => {
      // lets the browser restore the underlying GPU context instead of killing
      // it outright (three calls this too, but we gate the remount on it)
      e.preventDefault();
      if (recovering.current) return;
      recovering.current = true;
      if (retries.current >= maxRetries) {
        // give up rather than thrash; leave the (blank) canvas as-is
        console.warn('WebGL context lost; max recovery attempts reached.');
        return;
      }
      retries.current += 1;
      // give the GPU a beat to free memory, then force a full rebuild
      setTimeout(() => setCanvasKey(k => k + 1), cooldownMs);
    };
    // if the browser DOES restore in place, repaint (covers frameloop="never")
    const onRestored = () => stateRef.current?.invalidate?.();
    canvasEl.addEventListener('webglcontextlost', onLost, false);
    canvasEl.addEventListener('webglcontextrestored', onRestored, false);
    return () => {
      canvasEl.removeEventListener('webglcontextlost', onLost);
      canvasEl.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [canvasEl, maxRetries, cooldownMs]);

  return { canvasKey, onCreated };
}
