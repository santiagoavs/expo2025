// services/HistoryManager.js
export class HistoryManager {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.history = [];
    this.currentIndex = -1;
  }

  push(state, description = '') {
    const historyEntry = {
      state: JSON.parse(JSON.stringify(state)),
      description,
      timestamp: Date.now()
    };

    // Remover entradas futuras si estamos en el medio del historial
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(historyEntry);
    this.currentIndex = this.history.length - 1;

    // Limitar tamaño del historial
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex = Math.max(0, this.currentIndex - 1);
    }
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return null;
    this.currentIndex--;
    return this.history[this.currentIndex].state;
  }

  redo() {
    if (!this.canRedo()) return null;
    this.currentIndex++;
    return this.history[this.currentIndex].state;
  }

  getCurrentState() {
    return this.history[this.currentIndex]?.state || null;
  }

  getHistory() {
    return this.history.map((entry, index) => ({
      ...entry,
      isCurrent: index === this.currentIndex
    }));
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}
