export class App {
  private root: HTMLElement;

  constructor() {
    this.root = document.getElementById('app') as HTMLElement;
  }

  mount(): void {
    this.render();
  }

  private render(): void {
    this.root.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>Synco</h1>
          <p>Colaboração Síncrona</p>
        </header>
        <main class="app-main">
          <div class="placeholder">
            <p>Inicializando Synco...</p>
          </div>
        </main>
      </div>
    `;
  }
}
