export interface Peer {
  id: string;
  userId: string;
  displayName: string;
  status: 'online' | 'offline' | 'connecting';
  stream?: MediaStream;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  participants: Peer[];
  createdAt: Date;
}

export interface MediaItem {
  id: string;
  type: 'youtube' | 'vimeo' | 'direct';
  url: string;
  title: string;
  duration: number;
  thumbnail?: string;
  addedBy: string;
  addedAt: Date;
}

export interface MediaPlayerState {
  currentItem: MediaItem | null;
  queue: MediaItem[];
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  volume: number;
}

export interface PomodoroState {
  isRunning: boolean;
  isWorkSession: boolean;
  timeRemaining: number;
  workDuration: number;
  breakDuration: number;
  cycleCount: number;
  currentCycle: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  timestamp: Date;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  senderId: string;
  targetId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface AppState {
  currentRoom: Room | null;
  localPeer: Peer | null;
  mediaPlayer: MediaPlayerState;
  pomodoro: PomodoroState;
  chat: ChatMessage[];
  isConnected: boolean;
}
