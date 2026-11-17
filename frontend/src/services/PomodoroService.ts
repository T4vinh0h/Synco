import { PomodoroState } from '../types';

export class PomodoroService {
  private state: PomodoroState;
  private intervalId: number | null = null;
  private callbacks: Set<(state: PomodoroState) => void> = new Set();

  constructor() {
    this.state = {
      isRunning: false,
      isWorkSession: true,
      timeRemaining: 25 * 60,
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
      cycleCount: 4,
      currentCycle: 1,
    };
  }

  getState(): PomodoroState {
    return { ...this.state };
  }

  subscribe(callback: (state: PomodoroState) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  start(): void {
    if (this.state.isRunning) {
      return;
    }

    this.state.isRunning = true;
    this.notify();

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  pause(): void {
    if (!this.state.isRunning) {
      return;
    }

    this.state.isRunning = false;
    this.notify();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.pause();
    this.state.timeRemaining = this.state.isWorkSession
      ? this.state.workDuration
      : this.state.breakDuration;
    this.state.currentCycle = 1;
    this.notify();
  }

  skip(): void {
    this.transitionToNextSession();
  }

  setWorkDuration(minutes: number): void {
    this.state.workDuration = minutes * 60;
    if (!this.state.isRunning && this.state.isWorkSession) {
      this.state.timeRemaining = this.state.workDuration;
    }
    this.notify();
  }

  setBreakDuration(minutes: number): void {
    this.state.breakDuration = minutes * 60;
    if (!this.state.isRunning && !this.state.isWorkSession) {
      this.state.timeRemaining = this.state.breakDuration;
    }
    this.notify();
  }

  setCycleCount(count: number): void {
    this.state.cycleCount = count;
    this.notify();
  }

  syncFromRemote(remoteState: PomodoroState): void {
    const wasRunning = this.state.isRunning;
    this.state = { ...remoteState };

    if (remoteState.isRunning && !wasRunning) {
      this.start();
    } else if (!remoteState.isRunning && wasRunning) {
      this.pause();
    }

    this.notify();
  }

  private tick(): void {
    if (this.state.timeRemaining > 0) {
      this.state.timeRemaining--;
      this.notify();
    } else {
      this.transitionToNextSession();
    }
  }

  private transitionToNextSession(): void {
    if (this.state.isWorkSession) {
      if (this.state.currentCycle >= this.state.cycleCount) {
        this.state.currentCycle = 1;
        this.state.isWorkSession = true;
        this.state.timeRemaining = this.state.workDuration;
        this.pause();
      } else {
        this.state.isWorkSession = false;
        this.state.timeRemaining = this.state.breakDuration;
      }
    } else {
      this.state.currentCycle++;
      this.state.isWorkSession = true;
      this.state.timeRemaining = this.state.workDuration;
    }

    this.notify();
  }

  private notify(): void {
    this.callbacks.forEach((callback) => callback(this.state));
  }

  destroy(): void {
    this.pause();
    this.callbacks.clear();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    const total = this.state.isWorkSession
      ? this.state.workDuration
      : this.state.breakDuration;
    return ((total - this.state.timeRemaining) / total) * 100;
  }
}
