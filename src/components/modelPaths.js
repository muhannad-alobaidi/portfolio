/*
  Shared model URLs. Muha2.jsx and screen.jsx both load the workstation model
  (drei's cache dedupes the fetch), and preloadScenes.js has to name the exact
  same strings or the preload warms a different cache entry.
*/
export const MUHA_MODEL = '/muha/muha.glb';
export const DESK_MODEL = '/muha/desk.glb';
