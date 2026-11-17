import { AppState } from '../types';

type Listener<T> = (state: T) => void;
type KeySelector<T, K> = (state: T) => K;

export class Store<T extends AppState> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return { ...this.state };
  }

  setState(partial: Partial<T> | ((state: T) => Partial<T>)): void {
    const newState =
      typeof partial === 'function' ? partial(this.state) : partial;
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  select<K>(selector: KeySelector<T, K>): K {
    return selector(this.state);
  }
}
