import { PHASES, StateManager } from "./StateManager.js";
import { PhaseRenderer } from "./PhaseRenderer.js";
import { HeartsPhase } from "./phases/HeartsPhase.js";
import { TextPhase } from "./phases/TextPhase.js";
import { BookPhase } from "./phases/BookPhase.js";
import { PhotosPhase } from "./phases/PhotosPhase.js";

const root = document.getElementById("app");

if (!root) {
  throw new Error("No se encontro el nodo #app.");
}

const state = new StateManager(PHASES.HEARTS);

new PhaseRenderer(root, state, {
  [PHASES.HEARTS]: HeartsPhase,
  [PHASES.TEXT]:   TextPhase,
  [PHASES.BOOK]:   BookPhase,
  [PHASES.PHOTOS]: PhotosPhase,
});
