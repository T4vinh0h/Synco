import { MediaItem, MediaPlayerState } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export class MediaSyncService {
  private player: any = null;
  private isReady: boolean = false;
  private readyCallbacks: Array<() => void> = [];
  private syncInterval: number | null = null;
  private clockDriftCorrection: number = 0;

  loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve) => {
      if (window.YT) {
        resolve();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.isReady = true;
        this.readyCallbacks.forEach((cb) => cb());
        this.readyCallbacks = [];
        resolve();
      };
    });
  }

  onReady(callback: () => void): void {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  initializePlayer(
    containerId: string,
    videoId: string,
    onStateChange?: (event: any) => void
  ): void {
    this.onReady(() => {
      this.player = new window.YT.Player(containerId, {
        height: '360',
        width: '640',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            console.log('YouTube player ready');
          },
          onStateChange: onStateChange,
        },
      });
    });
  }

  play(): void {
    if (this.player && this.player.playVideo) {
      this.player.playVideo();
    }
  }

  pause(): void {
    if (this.player && this.player.pauseVideo) {
      this.player.pauseVideo();
    }
  }

  seekTo(seconds: number): void {
    if (this.player && this.player.seekTo) {
      this.player.seekTo(seconds, true);
    }
  }

  getCurrentTime(): number {
    if (this.player && this.player.getCurrentTime) {
      return this.player.getCurrentTime();
    }
    return 0;
  }

  getDuration(): number {
    if (this.player && this.player.getDuration) {
      return this.player.getDuration();
    }
    return 0;
  }

  setPlaybackRate(rate: number): void {
    if (this.player && this.player.setPlaybackRate) {
      this.player.setPlaybackRate(rate);
    }
  }

  setVolume(volume: number): void {
    if (this.player && this.player.setVolume) {
      this.player.setVolume(volume * 100);
    }
  }

  getVolume(): number {
    if (this.player && this.player.getVolume) {
      return this.player.getVolume() / 100;
    }
    return 1;
  }

  getPlayerState(): number {
    if (this.player && this.player.getPlayerState) {
      return this.player.getPlayerState();
    }
    return -1;
  }

  isPlaying(): boolean {
    const state = this.getPlayerState();
    return state === 1;
  }

  extractVideoId(url: string): string | null {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  startSync(targetState: MediaPlayerState): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = window.setInterval(() => {
      this.synchronize(targetState);
    }, 1000);
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private synchronize(targetState: MediaPlayerState): void {
    if (!this.player || !targetState.currentItem) {
      return;
    }

    const currentTime = this.getCurrentTime();
    const targetTime = targetState.currentTime + this.clockDriftCorrection;
    const diff = Math.abs(currentTime - targetTime);

    if (diff > 0.5) {
      this.seekTo(targetTime);
    }

    if (targetState.isPlaying !== this.isPlaying()) {
      if (targetState.isPlaying) {
        this.play();
      } else {
        this.pause();
      }
    }

    if (this.getPlaybackRate() !== targetState.playbackRate) {
      this.setPlaybackRate(targetState.playbackRate);
    }
  }

  updateClockDrift(localTime: number, remoteTime: number): void {
    this.clockDriftCorrection = remoteTime - localTime;
  }

  destroy(): void {
    this.stopSync();
    if (this.player && this.player.destroy) {
      this.player.destroy();
    }
    this.player = null;
  }
}
