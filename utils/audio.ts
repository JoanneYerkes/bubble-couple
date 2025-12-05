
import { SoundType, MusicTheme } from '../types';

const NOTES: Record<string, number> = {
  // Octave 2 (Bass)
  'c2': 65.41, 'd2': 73.42, 'e2': 82.41, 'f2': 87.31, 'g2': 98.00, 'a2': 110.00, 'b2': 123.47,
  // Octave 3
  'c3': 130.81, 'c#3': 138.59, 'd3': 146.83, 'd#3': 155.56, 'e3': 164.81, 'f3': 174.61, 'f#3': 185.00, 'g3': 196.00, 'g#3': 207.65, 'a3': 220.00, 'a#3': 233.08, 'b3': 246.94,
  // Octave 4
  'c4': 261.63, 'c#4': 277.18, 'd4': 293.66, 'd#4': 311.13, 'e4': 329.63, 'f4': 349.23, 'f#4': 369.99, 'g4': 392.00, 'g#4': 415.30, 'a4': 440.00, 'a#4': 466.16, 'b4': 493.88,
  // Octave 5
  'c5': 523.25, 'd5': 587.33, 'e5': 659.25, 'f5': 698.46, 'g5': 783.99, 'a5': 880.00, 'b5': 987.77,
};

interface NoteEvent {
  note: string;
  len: number; // in beats (0.25 = 16th note, 1 = quarter note)
}

// 1. PVE THEME: Cheerful, Major Scale (C Major)
const SEQ_PVE: NoteEvent[] = [
  // Bar 1
  { note: 'c4', len: 0.25 }, { note: 'e4', len: 0.25 }, { note: 'g4', len: 0.25 }, { note: 'c5', len: 0.25 },
  { note: 'g4', len: 0.25 }, { note: 'e4', len: 0.25 }, { note: 'c4', len: 0.5 },
  // Bar 2
  { note: 'a3', len: 0.25 }, { note: 'c4', len: 0.25 }, { note: 'f4', len: 0.25 }, { note: 'a4', len: 0.25 },
  { note: 'f4', len: 0.25 }, { note: 'c4', len: 0.25 }, { note: 'a3', len: 0.5 },
  // Bar 3
  { note: 'g3', len: 0.25 }, { note: 'b3', len: 0.25 }, { note: 'd4', len: 0.25 }, { note: 'g4', len: 0.25 },
  { note: 'd4', len: 0.25 }, { note: 'b3', len: 0.25 }, { note: 'g3', len: 0.5 },
  // Bar 4
  { note: 'c4', len: 0.25 }, { note: 'e4', len: 0.25 }, { note: 'd4', len: 0.25 }, { note: 'f4', len: 0.25 },
  { note: 'e4', len: 0.25 }, { note: 'g4', len: 0.25 }, { note: 'c5', len: 0.5 },
];

// 2. PVP THEME: Faster, Minor Scale (A Minor), more tense
const SEQ_PVP: NoteEvent[] = [
  // Bar 1 (Am arpeggio)
  { note: 'a2', len: 0.25 }, { note: 'a3', len: 0.25 }, { note: 'c4', len: 0.25 }, { note: 'e4', len: 0.25 },
  { note: 'a4', len: 0.25 }, { note: 'e4', len: 0.25 }, { note: 'c4', len: 0.25 }, { note: 'a3', len: 0.25 },
  // Bar 2 (F Major 7)
  { note: 'f2', len: 0.25 }, { note: 'f3', len: 0.25 }, { note: 'a3', len: 0.25 }, { note: 'c4', len: 0.25 },
  { note: 'e4', len: 0.25 }, { note: 'c4', len: 0.25 }, { note: 'a3', len: 0.25 }, { note: 'f3', len: 0.25 },
  // Bar 3 (Dm)
  { note: 'd2', len: 0.25 }, { note: 'd3', len: 0.25 }, { note: 'f3', len: 0.25 }, { note: 'a3', len: 0.25 },
  { note: 'd4', len: 0.25 }, { note: 'a3', len: 0.25 }, { note: 'f3', len: 0.25 }, { note: 'd3', len: 0.25 },
  // Bar 4 (E7)
  { note: 'e2', len: 0.25 }, { note: 'e3', len: 0.25 }, { note: 'g#3', len: 0.25 }, { note: 'b3', len: 0.25 },
  { note: 'e4', len: 0.25 }, { note: 'b3', len: 0.25 }, { note: 'd4', len: 0.25 }, { note: 'e4', len: 0.25 },
];

// 3. BOSS THEME: Very Fast, Chromatic/Dissonant, High Tension
const SEQ_BOSS: NoteEvent[] = [
  // Driving Bass with chromatic stabs
  { note: 'c2', len: 0.125 }, { note: 'c2', len: 0.125 }, { note: 'c3', len: 0.125 }, { note: 'eb3', len: 0.125 },
  { note: 'c2', len: 0.125 }, { note: 'c2', len: 0.125 }, { note: 'gb3', len: 0.25 },
  
  { note: 'c2', len: 0.125 }, { note: 'c2', len: 0.125 }, { note: 'c3', len: 0.125 }, { note: 'f3', len: 0.125 },
  { note: 'c2', len: 0.125 }, { note: 'c2', len: 0.125 }, { note: 'e3', len: 0.25 },

  { note: 'c2', len: 0.125 }, { note: 'c2', len: 0.125 }, { note: 'eb3', len: 0.125 }, { note: 'd3', len: 0.125 },
  { note: 'db3', len: 0.125 }, { note: 'c3', len: 0.125 }, { note: 'b2', len: 0.125 }, { note: 'bb2', len: 0.125 },
];

const SEQUENCES: Record<MusicTheme, NoteEvent[]> = {
  [MusicTheme.MENU]: [],
  [MusicTheme.PVE]: SEQ_PVE,
  [MusicTheme.PVP]: SEQ_PVP,
  [MusicTheme.BOSS]: SEQ_BOSS,
};

const TEMPOS: Record<MusicTheme, number> = {
  [MusicTheme.MENU]: 100,
  [MusicTheme.PVE]: 135,
  [MusicTheme.PVP]: 155,
  [MusicTheme.BOSS]: 175,
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;
  
  // BGM State
  private currentTheme: MusicTheme | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private nextNoteTime: number = 0;
  private currentNoteIndex: number = 0;
  private isPlayingBGM: boolean = false;
  private timerID: number | null = null;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s

  constructor() {
    // Lazy init handled in init()
  }

  init() {
    if (this.initialized) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.2; // Default Master Volume

      // BGM Sub-mix
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.masterGain);
      this.bgmGain.gain.value = 0.4; // Relative to master (so it's quieter than SFX)

      this.initialized = true;
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.2, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  // --- BGM Logic ---

  playBGM(theme: MusicTheme) {
    if (!this.initialized || !this.ctx) return;
    this.resume();

    // If already playing this theme, do nothing
    if (this.isPlayingBGM && this.currentTheme === theme) return;

    // Stop current
    this.stopBGM();

    // Start new
    this.currentTheme = theme;
    if (SEQUENCES[theme].length === 0) return; // No music for this theme (e.g. Menu)

    this.isPlayingBGM = true;
    this.currentNoteIndex = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduler();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    this.currentTheme = null;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    // Stop all currently playing notes
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.bgmOscillators = [];
  }

  private nextNote() {
    if (!this.currentTheme) return;
    
    const tempo = TEMPOS[this.currentTheme] || 120;
    const secondsPerBeat = 60.0 / tempo;
    const sequence = SEQUENCES[this.currentTheme];
    const note = sequence[this.currentNoteIndex];
    
    this.nextNoteTime += note.len * secondsPerBeat * 4; 
    
    this.currentNoteIndex++;
    if (this.currentNoteIndex === sequence.length) {
      this.currentNoteIndex = 0;
    }
  }

  private scheduleNote(index: number, time: number) {
    if (!this.ctx || !this.bgmGain || !this.currentTheme) return;
    
    const sequence = SEQUENCES[this.currentTheme];
    const noteData = sequence[index];
    const freq = NOTES[noteData.note];
    const tempo = TEMPOS[this.currentTheme] || 120;
    
    // Create Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = this.currentTheme === MusicTheme.BOSS ? 'sawtooth' : 'square'; // Aggressive synth for Boss
    osc.frequency.setValueAtTime(freq, time);

    // Envelope
    const gain = this.ctx.createGain();
    const length = (60.0 / tempo) * (noteData.len * 4) * 0.9; // staccato

    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + length);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + length);
    
    this.bgmOscillators.push(osc);
    if (this.bgmOscillators.length > 20) this.bgmOscillators.shift();
  }

  private scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentNoteIndex, this.nextNoteTime);
      this.nextNote();
    }
    if (this.isPlayingBGM) {
       this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  // --- SFX Logic ---

  play(type: SoundType) {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;

    switch (type) {
      case SoundType.BOMB_PLACE:
        this.playTone(300, 'sine', 0.1, t);
        this.playTone(600, 'square', 0.05, t); 
        break;
      
      case SoundType.EXPLOSION:
        this.playNoise(0.5, t);
        this.playTone(100, 'sawtooth', 0.3, t, 0.3); 
        break;

      case SoundType.ITEM_GET:
        this.playTone(600, 'square', 0.1, t);
        this.playTone(800, 'square', 0.1, t + 0.08);
        this.playTone(1200, 'square', 0.15, t + 0.16);
        break;

      case SoundType.TRAPPED:
        this.playOscillatorWithLFO(300, 400, 15, 0.4, t);
        break;

      case SoundType.DIE:
        this.playTone(400, 'sawtooth', 0.1, t);
        this.playTone(300, 'sawtooth', 0.1, t + 0.1);
        this.playTone(200, 'sawtooth', 0.4, t + 0.2);
        break;

      case SoundType.RESCUE:
        this.playTone(400, 'sine', 0.1, t);
        this.playTone(600, 'sine', 0.1, t + 0.1);
        this.playTone(1000, 'sine', 0.2, t + 0.2);
        break;

      case SoundType.CLICK:
        this.playTone(800, 'triangle', 0.05, t);
        break;

      case SoundType.GAME_START:
        this.playTone(440, 'square', 0.1, t);
        this.playTone(554, 'square', 0.1, t + 0.1);
        this.playTone(659, 'square', 0.4, t + 0.2);
        break;
      
      case SoundType.GAME_OVER:
        this.playTone(300, 'sawtooth', 0.3, t);
        this.playTone(250, 'sawtooth', 0.3, t + 0.25);
        this.playTone(200, 'sawtooth', 0.6, t + 0.5);
        break;
        
      case SoundType.KICK:
        this.playTone(150, 'square', 0.05, t);
        break;

      case SoundType.SHIELD_LOST:
        this.playTone(800, 'sawtooth', 0.1, t);
        this.playTone(400, 'sawtooth', 0.2, t + 0.1);
        break;
        
      case SoundType.BOSS_SPAWN:
        this.playTone(100, 'sawtooth', 1.0, t);
        this.playTone(80, 'sawtooth', 1.0, t + 0.2);
        this.playTone(60, 'sawtooth', 2.0, t + 0.4);
        break;

      case SoundType.ENEMY_HIT:
        this.playTone(200, 'square', 0.1, t);
        break;
    }
  }

  // --- Helpers ---

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number, volume = 0.5) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playNoise(duration: number, startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, startTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, startTime + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(startTime);
  }

  private playOscillatorWithLFO(startFreq: number, endFreq: number, lfoFreq: number, duration: number, startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration / 2);
    osc.frequency.linearRampToValueAtTime(startFreq, startTime + duration);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioManager = new AudioManager();
