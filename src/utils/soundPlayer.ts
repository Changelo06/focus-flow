/**
 * Sound Player Utility for Timer Alarms
 * Plays notification and ringtone sounds
 */

class SoundPlayer {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private playCount: number = 0;
  private maxPlays: number = 2;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) this.audioContext = new AudioContextClass();
    }
  }

  /**
   * Play notification sound
   */
  async playNotification(): Promise<void> {
    return this.playSound('/NOTIFICATION.mp3', 1);
  }

  /**
   * Play ringtone sound (plays once)
   */
  async playRingtone(): Promise<void> {
    return this.playSound('/RINGTONE.mp3', 1);
  }

  /**
   * Generic sound player
   */
  private async playSound(path: string, repeatCount: number = 1): Promise<void> {
    return new Promise((resolve) => {
      this.stopSound(); // Stop any currently playing sound
      
      this.playCount = 0;
      this.maxPlays = repeatCount;

      const playNext = () => {
        if (this.playCount >= this.maxPlays) {
          resolve();
          return;
        }

        this.currentAudio = new Audio(path);
        this.currentAudio.volume = 1.0;
        
        this.currentAudio.onended = () => {
          this.playCount++;
          if (this.playCount < this.maxPlays) {
            playNext();
          } else {
            this.currentAudio = null;
            resolve();
          }
        };

        this.currentAudio.onerror = (error) => {
          console.error('Error playing sound:', error);
          this.currentAudio = null;
          resolve();
        };

        this.currentAudio.play().catch((error) => {
          console.error('Failed to play sound:', error);
          resolve();
        });
      };

      playNext();
    });
  }

  /**
   * Stop currently playing sound
   */
  stopSound(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.playCount = this.maxPlays; // Prevent further plays
  }

  /**
   * Check if sound is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}

export const soundPlayer = new SoundPlayer();
