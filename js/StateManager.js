export const PHASES = {
  HEARTS: "hearts",
  TEXT: "text",
  BOOK: "book",
  PHOTOS: "photos",
};

const ORDER = [PHASES.HEARTS, PHASES.TEXT, PHASES.BOOK, PHASES.PHOTOS];

export class StateManager {
  constructor(initialPhase = PHASES.HEARTS) {
    this.state = {
      phase: initialPhase,
      data: {},
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  setPhase(nextPhase, patch = {}) {
    if (!ORDER.includes(nextPhase)) {
      return;
    }

    this.state = {
      ...this.state,
      phase: nextPhase,
      data: {
        ...this.state.data,
        ...patch,
      },
    };

    this.emit();
  }

  next(patch = {}) {
    const index = ORDER.indexOf(this.state.phase);
    const nextPhase = ORDER[Math.min(index + 1, ORDER.length - 1)];
    this.setPhase(nextPhase, patch);
  }

  previous() {
    const index = ORDER.indexOf(this.state.phase);
    const prevPhase = ORDER[Math.max(index - 1, 0)];
    this.setPhase(prevPhase);
  }

  reset() {
    this.state = {
      phase: PHASES.HEARTS,
      data: {},
    };
    this.emit();
  }

  emit() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
