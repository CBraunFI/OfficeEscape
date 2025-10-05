// Simple Web Audio API sound effects using oscillators
class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.musicGain = null;
        this.musicOscillators = [];
        this.musicTimeouts = []; // Track all setTimeout IDs for music loops
    }

    playJump() {
        if (!this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 400;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playThrow() {
        if (!this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    playHit() {
        if (!this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 150;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playPickup() {
        if (!this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playDeath() {
        if (!this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    playLevelComplete() {
        if (!this.enabled) return;

        // Happy ascending melody
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'square';

            const startTime = this.audioContext.currentTime + (index * 0.15);
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        });
    }

    toggle() {
        this.enabled = !this.enabled;
    }

    startBackgroundMusic(level = 1) {
        if (!this.enabled) return;

        // Stop any existing music first
        this.stopBackgroundMusic();

        // Create master gain for music
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = 0.15;
        this.musicGain.connect(this.audioContext.destination);

        // Play level-specific music
        switch(level) {
            case 1:
                this.playLevel1Music();
                break;
            case 2:
                this.playLevel2Music();
                break;
            case 3:
                this.playLevel3Music();
                break;
            case 4:
                this.playLevel4Music();
                break;
            case 5:
                this.playLevel5Music();
                break;
            default:
                this.playLevel1Music();
        }
    }

    // Level 1: Corporate chaos - fast upbeat
    playLevel1Music() {
        const bassNotes = [
            { freq: 130.81, duration: 0.25 },  // C3
            { freq: 146.83, duration: 0.25 },  // D3
            { freq: 164.81, duration: 0.25 },  // E3
            { freq: 174.61, duration: 0.25 },  // F3
            { freq: 196.00, duration: 0.25 },  // G3
            { freq: 174.61, duration: 0.25 },  // F3
            { freq: 164.81, duration: 0.25 },  // E3
            { freq: 146.83, duration: 0.25 }   // D3
        ];

        const melodyNotes = [
            { freq: 523.25, duration: 0.15 },  // C5
            { freq: 587.33, duration: 0.15 },  // D5
            { freq: 659.25, duration: 0.15 },  // E5
            { freq: 587.33, duration: 0.15 },  // D5
            { freq: 523.25, duration: 0.2 },   // C5
            { freq: 659.25, duration: 0.15 },  // E5
            { freq: 698.46, duration: 0.15 },  // F5
            { freq: 783.99, duration: 0.3 },   // G5
            { freq: 659.25, duration: 0.15 },  // E5
            { freq: 523.25, duration: 0.3 }    // C5
        ];

        this.playMusicLoop(bassNotes, melodyNotes, 2000, 2300, 'square');
    }

    // Level 2: Tech office - electronic beeps
    playLevel2Music() {
        const bassNotes = [
            { freq: 110.00, duration: 0.3 },  // A2
            { freq: 123.47, duration: 0.3 },  // B2
            { freq: 146.83, duration: 0.3 },  // D3
            { freq: 123.47, duration: 0.3 }   // B2
        ];

        const melodyNotes = [
            { freq: 659.25, duration: 0.12 },  // E5
            { freq: 783.99, duration: 0.12 },  // G5
            { freq: 987.77, duration: 0.12 },  // B5
            { freq: 880.00, duration: 0.12 },  // A5
            { freq: 783.99, duration: 0.18 },  // G5
            { freq: 659.25, duration: 0.12 },  // E5
            { freq: 783.99, duration: 0.12 },  // G5
            { freq: 659.25, duration: 0.24 }   // E5
        ];

        this.playMusicLoop(bassNotes, melodyNotes, 1200, 1800, 'sawtooth');
    }

    // Level 3: Presentation room - dramatic
    playLevel3Music() {
        const bassNotes = [
            { freq: 130.81, duration: 0.4 },   // C3
            { freq: 98.00, duration: 0.4 },    // G2
            { freq: 110.00, duration: 0.4 },   // A2
            { freq: 123.47, duration: 0.4 }    // B2
        ];

        const melodyNotes = [
            { freq: 523.25, duration: 0.25 },  // C5
            { freq: 659.25, duration: 0.25 },  // E5
            { freq: 587.33, duration: 0.25 },  // D5
            { freq: 523.25, duration: 0.25 },  // C5
            { freq: 698.46, duration: 0.35 },  // F5
            { freq: 659.25, duration: 0.35 }   // E5
        ];

        this.playMusicLoop(bassNotes, melodyNotes, 1600, 2200, 'triangle');
    }

    // Level 4: Kitchen - playful and bouncy
    playLevel4Music() {
        const bassNotes = [
            { freq: 146.83, duration: 0.2 },   // D3
            { freq: 164.81, duration: 0.2 },   // E3
            { freq: 196.00, duration: 0.2 },   // G3
            { freq: 164.81, duration: 0.2 },   // E3
            { freq: 146.83, duration: 0.2 },   // D3
            { freq: 130.81, duration: 0.2 }    // C3
        ];

        const melodyNotes = [
            { freq: 587.33, duration: 0.15 },  // D5
            { freq: 659.25, duration: 0.15 },  // E5
            { freq: 783.99, duration: 0.15 },  // G5
            { freq: 880.00, duration: 0.15 },  // A5
            { freq: 783.99, duration: 0.15 },  // G5
            { freq: 659.25, duration: 0.15 },  // E5
            { freq: 587.33, duration: 0.2 },   // D5
            { freq: 523.25, duration: 0.2 }    // C5
        ];

        this.playMusicLoop(bassNotes, melodyNotes, 1200, 1600, 'square');
    }

    // Level 5: Boss office - tense and slow
    playLevel5Music() {
        const bassNotes = [
            { freq: 87.31, duration: 0.5 },    // F2
            { freq: 98.00, duration: 0.5 },    // G2
            { freq: 110.00, duration: 0.5 },   // A2
            { freq: 98.00, duration: 0.5 }     // G2
        ];

        const melodyNotes = [
            { freq: 349.23, duration: 0.3 },   // F4
            { freq: 392.00, duration: 0.3 },   // G4
            { freq: 440.00, duration: 0.4 },   // A4
            { freq: 392.00, duration: 0.3 },   // G4
            { freq: 349.23, duration: 0.4 },   // F4
            { freq: 293.66, duration: 0.5 }    // D4
        ];

        this.playMusicLoop(bassNotes, melodyNotes, 2000, 2500, 'triangle');
    }

    playMusicLoop(bassNotes, melodyNotes, bassLoopTime, melodyLoopTime, waveType = 'square') {
        // Play bass line
        const playBassLoop = () => {
            let bassTime = this.audioContext.currentTime;
            bassNotes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.musicGain);

                osc.type = waveType;
                osc.frequency.value = note.freq;

                gain.gain.setValueAtTime(0.2, bassTime);
                gain.gain.exponentialRampToValueAtTime(0.01, bassTime + note.duration);

                osc.start(bassTime);
                osc.stop(bassTime + note.duration);

                bassTime += note.duration;
            });

            const timeoutId = setTimeout(playBassLoop, bassLoopTime);
            this.musicTimeouts.push(timeoutId);
        };

        // Play melody
        const playMelodyLoop = () => {
            let melodyTime = this.audioContext.currentTime + 0.1;
            melodyNotes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.musicGain);

                osc.type = waveType;
                osc.frequency.value = note.freq;

                gain.gain.setValueAtTime(0.12, melodyTime);
                gain.gain.exponentialRampToValueAtTime(0.01, melodyTime + note.duration);

                osc.start(melodyTime);
                osc.stop(melodyTime + note.duration);

                melodyTime += note.duration;
            });

            const timeoutId = setTimeout(playMelodyLoop, melodyLoopTime);
            this.musicTimeouts.push(timeoutId);
        };

        // Add percussion blips
        const playPercussionLoop = () => {
            const percTime = this.audioContext.currentTime;

            for (let i = 0; i < 4; i++) {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.musicGain);

                osc.type = 'square';
                osc.frequency.value = 1200;

                const startTime = percTime + (i * 0.25);
                gain.gain.setValueAtTime(0.08, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

                osc.start(startTime);
                osc.stop(startTime + 0.05);
            }

            const timeoutId = setTimeout(playPercussionLoop, 1000);
            this.musicTimeouts.push(timeoutId);
        };

        // Start all music layers
        playBassLoop();
        playMelodyLoop();
        playPercussionLoop();
    }

    stopBackgroundMusic() {
        // Clear all music loop timeouts to prevent overlapping
        this.musicTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.musicTimeouts = [];

        if (this.musicGain) {
            this.musicGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            // Disconnect after fade out
            setTimeout(() => {
                if (this.musicGain) {
                    this.musicGain.disconnect();
                    this.musicGain = null;
                }
            }, 600);
        }

        this.musicOscillators.forEach(osc => {
            try {
                osc.stop(this.audioContext.currentTime + 0.5);
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.musicOscillators = [];
    }
}
