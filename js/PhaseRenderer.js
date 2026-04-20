export class PhaseRenderer {
  constructor(root, stateManager, phaseMap) {
    this.root = root;
    this.stateManager = stateManager;
    this.phaseMap = phaseMap;
    this.cleanupCurrent = null;

    this.unsubscribe = this.stateManager.subscribe((state) => {
      this.render(state);
    });
  }

  render(state) {
    if (this.cleanupCurrent) {
      this.cleanupCurrent();
      this.cleanupCurrent = null;
    }

    const factory = this.phaseMap[state.phase];
    this.root.innerHTML = "";

    if (!factory) {
      this.root.textContent = "Fase no disponible.";
      return;
    }

    const instance = factory({
      state,
      stateManager: this.stateManager,
    });

    this.cleanupCurrent = instance.mount(this.root) || null;
  }

  destroy() {
    if (this.cleanupCurrent) {
      this.cleanupCurrent();
      this.cleanupCurrent = null;
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
