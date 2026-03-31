
// Sound Service using Web Audio API to avoid external asset dependencies
// Generates premium UI sounds procedurally

class SoundService {
    private AudioContext: typeof window.AudioContext;
    private context: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        this.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    }

    private init() {
        if (!this.context) {
            this.context = new this.AudioContext();
        }
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    public playClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.context) return;

        const osc = this.context.createOscillator();
        const gainNode = this.context.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.context.destination);

        // Metallic Click
        // High frequency sine/triangle quickly fading
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }

    public playHover() {
        if (this.isMuted) return;
        this.init();
        if (!this.context) return;

        const osc = this.context.createOscillator();
        const gainNode = this.context.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.context.destination);

        // Subtle Air/Whoosh
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(300, this.context.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.02, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, this.context.currentTime + 0.05);

        osc.start();
        osc.stop(this.context.currentTime + 0.05);
    }

    public playSuccess() {
        if (this.isMuted) return;
        this.init();
        if (!this.context) return;

        const t = this.context.currentTime;
        
        // Chord
        [440, 554, 659].forEach((freq, i) => {
            const osc = this.context!.createOscillator();
            const gain = this.context!.createGain();
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            osc.connect(gain);
            gain.connect(this.context!.destination);
            
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            
            osc.start(t + i * 0.05);
            osc.stop(t + 0.6);
        });
    }

    public playError() {
        if (this.isMuted) return;
        this.init();
        if (!this.context) return;

        const t = this.context.currentTime;
        
        // Dissonant low chord for error/warning
        [200, 215].forEach((freq, i) => {
            const osc = this.context!.createOscillator();
            const gain = this.context!.createGain();
            
            osc.frequency.value = freq;
            osc.type = 'sawtooth';
            
            osc.connect(gain);
            gain.connect(this.context!.destination);
            
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            
            osc.start(t + i * 0.02);
            osc.stop(t + 0.4);
        });
    }

    public playWhoosh() {
         if (this.isMuted) return;
        this.init();
        if (!this.context) return;

        // Noise buffer for whoosh
        const bufferSize = this.context.sampleRate * 0.5; // 0.5 sec
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.context.currentTime);
        filter.frequency.linearRampToValueAtTime(1000, this.context.currentTime + 0.2);

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.05, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.context.destination);

        noise.start();
    }
}

export const soundService = new SoundService();
