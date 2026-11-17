export class AudioDuckingService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private mediaStream: MediaStream | null = null;
  private voiceThreshold: number = -30;
  private duckingAmount: number = 0.5;
  private isMonitoring: boolean = false;
  private animationFrameId: number | null = null;

  async initialize(stream: MediaStream): Promise<void> {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);

    this.mediaStream = stream;
  }

  setVoiceThreshold(db: number): void {
    this.voiceThreshold = db;
  }

  setDuckingAmount(amount: number): void {
    this.duckingAmount = Math.max(0, Math.min(1, amount));
  }

  applyToMediaElement(mediaElement: HTMLAudioElement | HTMLVideoElement): void {
    if (!this.audioContext || !this.gainNode) {
      throw new Error('AudioDuckingService not initialized');
    }

    const source = this.audioContext.createMediaElementSource(mediaElement);
    source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
  }

  startMonitoring(): void {
    if (this.isMonitoring || !this.analyser || !this.gainNode) {
      return;
    }

    this.isMonitoring = true;
    this.monitorVoice();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.gainNode) {
      this.gainNode.gain.value = 1;
    }
  }

  private monitorVoice(): void {
    if (!this.isMonitoring || !this.analyser || !this.gainNode) {
      return;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const average = this.calculateAverageVolume(dataArray);
    const db = this.linearToDecibels(average / 255);

    if (db > this.voiceThreshold) {
      this.gainNode.gain.setTargetAtTime(
        this.duckingAmount,
        this.audioContext.currentTime,
        0.1
      );
    } else {
      this.gainNode.gain.setTargetAtTime(
        1,
        this.audioContext.currentTime,
        0.3
      );
    }

    this.animationFrameId = requestAnimationFrame(() => this.monitorVoice());
  }

  private calculateAverageVolume(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length;
  }

  private linearToDecibels(linear: number): number {
    return 20 * Math.log10(linear);
  }

  destroy(): void {
    this.stopMonitoring();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.gainNode = null;
    this.mediaStream = null;
  }
}
