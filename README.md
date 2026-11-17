# Synco

Uma plataforma híbrida (Web e Desktop) de colaboração e produtividade síncrona, projetada para grupos pequenos de até 5 usuários simultâneos. O Synco une comunicação em tempo real, entretenimento compartilhado e ferramentas de foco em um único ambiente leve e sem atritos — ideal para sessões de estudo em grupo (study with me), co-working remoto e reuniões rápidas.

## 🚀 Premissa e Proposta de Valor

Ao eliminar a necessidade de alternar entre múltiplas abas e aplicativos (como Discord, YouTube e timers externos), o Synco centraliza a experiência de colaboração em equipe com baixa latência, controle inteligente de áudio e ergonomia digital. O projeto foi estruturado para demonstrar rigor arquitetural sênior, código limpo e engenharia de produto autoral, servindo como peça central de portfólio para recrutadores.

## 🛠️ Funcionalidades Principais (Core Features)

- **Videochamada P2P (Malha):** Comunicação direta de áudio e vídeo entre até 5 participantes em arquitetura Full Mesh, garantindo baixa latência e eliminando a sobrecarga de servidores de mídia centrais.
- **Player de Mídia Sincronizado:** Fila compartilhada e reprodução em tempo real (play, pause, seek e ajuste de velocidade sincronizados milimetricamente para todos na sala) com suporte a múltiplas fontes (YouTube, Google Drive, TikTok e Instagram).
- **Controle de Áudio Inteligente (Audio Ducking):** Redução automática e suave do volume da mídia compartilhada sempre que um participante começa a falar no microfone, restaurando o volume original ao final da fala.
- **Gestão de Foco e Bem-Estar:** Temporizador Pomodoro compartilhado pela sala aliado a alertas nativos de saúde e ergonomia (lembretes de hidratação, postura e descanso visual).
- **Chat em Tempo Real:** Troca instantânea de mensagens de texto e links contextuais dentro da sala.

## 📐 Stack Tecnológica Completa

Desenvolvido sem o uso de frameworks de interface pesados, priorizando TypeScript puro para demonstrar domínio profundo dos fundamentos da web, manipulação eficiente do DOM e controle total sobre o ciclo de vida das conexões.

### 1. Core, Frontend & Interface (Web Renderer)
- **Linguagem Principal:** TypeScript (Strict Mode) — Tipagem estrita ponta a ponta e contratos de sinalização blindados.
- **Arquitetura de UI:** Vanilla DOM + Web Components — Manipulação performática e modular, sem overhead de Virtual DOM.
- **Gerenciamento de Estado:** Custom Store (Pub/Sub Pattern) — Padrão reativo nativo em TypeScript para sincronizar estado da sala, peers e player.
- **Estilização:** Modern CSS3 (CSS Variables, Grid/Flexbox) — Design system modular e Dark Mode nativo.
- **Build & Dev Server:** Vite — Empacotamento ultrarrápido e Hot Module Replacement (HMR).

### 2. Comunicação em Tempo Real, Áudio & Mídia
- **Videochamada P2P:** Native WebRTC (RTCPeerConnection) — Transmissão direta de MediaStreams em malha para até 5 pares.
- **Travessia de NAT/Firewall:** STUN / TURN Servers (ICE Protocol) — Descoberta de IPs e fallback para conexões restritas.
- **Engenharia de Áudio:** Web Audio API (AudioContext) — Análise de frequência vocal em tempo real (AnalyserNode) e ganho dinâmico (GainNode) para o Audio Ducking.
- **Integração de Mídia:** YouTube IFrame API & HTML5 Media / Embeds — Controle programático e correção de desvio de clock (clock drift).

### 3. Desktop & Sistema Operacional
- **Desktop Runtime:** Electron — Execução multiplataforma (Windows, macOS, Linux).
- **Segurança Desktop:** Context Isolation & IPC Bridge (preload.ts) — Isolamento estrito entre o processo Node.js e o navegador.
- **Recursos Nativos:** Electron Notification, Tray & GlobalShortcut — Notificações de foco/saúde, minimização para a bandeja (System Tray) e atalhos globais de Mute/Deafen.
- **Empacotamento:** Electron Builder — Geração de instaladores nativos (.exe, .dmg, .AppImage).

### 4. Backend, Banco de Dados & Infraestrutura
- **BaaS & Realtime:** Supabase — Infraestrutura gerenciada para autenticação, banco de dados e mensageria.
- **Banco de Dados:** PostgreSQL — Persistência de perfis, configurações de salas e histórico de filas.
- **Segurança de Dados:** Row Level Security (RLS) — Políticas granulares garantindo privacidade por sala.
- **Sinalização & Sync:** Supabase Realtime (Broadcast & Presence) — Canal WebSocket de baixa latência para troca de dados SDP/ICE do WebRTC e sincronia de estados.
- **Autenticação:** Supabase Auth — Gestão de sessões JWT seguras.

### 5. Qualidade, Testes & DevOps
- **Linting & Formatação:** ESLint + Prettier — Padronização rigorosa de código.
- **Testes Unitários:** Vitest — Validação rápida da lógica em src/core/ (máquina de estados do Pomodoro e Store Pub/Sub).
- **CI/CD:** Git + GitHub Actions — Pipeline automatizado para validação de tipagem, lint e build.

## 💎 Diferenciais Técnicos (Vitrine de Engenharia)

- **Arquitetura Zero-Framework:** Demonstração de domínio real da plataforma Web com reatividade construída em TypeScript nativo.
- **Sinalização Desacoplada:** Uso inteligente do Supabase Realtime apenas para sinalização e metadados, mantendo o fluxo pesado de áudio e vídeo 100% P2P.
- **Resiliência de Sincronização:** Algoritmos de correção de latência para assegurar reprodução idêntica de mídia entre os participantes.
- **Blindagem de Segurança:** Combinação de criptografia nativa DTLS-SRTP (WebRTC), RLS no banco e Context Isolation no Electron.

## 🚀 Getting Started

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase (para backend e sinalização)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/synco.git
cd synco

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do Supabase

# Executar em modo desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento (Vite)
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm run electron:dev # Inicia versão Desktop em desenvolvimento
npm run test         # Executa testes unitários (Vitest)
npm run lint         # Executa ESLint
npm run format       # Executa Prettier
```

## 📄 Licença

Este projeto está licenciado sob a MIT License.
