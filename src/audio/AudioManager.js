/**
 * Audio Manager
 * Handles background music and sound effects for retro dungeon crawler atmosphere
 */
class AudioManager {
    constructor() {
        this.currentTrack = null;
        this.isEnabled = true;
        this.volume = 0.3;
        this.fadeInterval = null;
        this.queuedTrack = null; // Track to play after user interaction
        
        // Track definitions - using Web Audio API to generate chiptune-style music
        this.tracks = {
            town: {
                name: 'Town Theme',
                tempo: 80, // Much slower, more contemplative
                pattern: this.createTownTheme()
            },
            dungeon: {
                name: 'Dungeon Exploration',
                tempo: 100,
                pattern: this.createDungeonTheme()
            },
            combat: {
                name: 'Battle Music',
                tempo: 140,
                pattern: this.createCombatTheme()
            },
            victory: {
                name: 'Victory Fanfare',
                tempo: 130,
                pattern: this.createVictoryTheme()
            },
            death: {
                name: 'Defeat',
                tempo: 80,
                pattern: this.createDeathTheme()
            }
        };
        
        this.audioContext = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.currentOscillators = [];
        this.patternTimeouts = []; // Track pattern loop timeouts
        
        this.initializeAudio();
        this.setupUserInteractionListener();
        this.setupSoundEffects();
    }
    
    /**
     * Initialize Web Audio API
     */
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.volume;
            
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.isEnabled = false;
        }
    }
    
    /**
     * Set up listener for first user interaction to enable audio
     */
    setupUserInteractionListener() {
        const resumeAudio = () => {
            this.resumeContext();
            // Remove listeners after first interaction
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
        };
        
        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
    }
    
    /**
     * Set up sound effect definitions
     */
    setupSoundEffects() {
        this.soundEffects = {
            // UI Sounds
            buttonClick: {
                freq: 800,
                duration: 0.1,
                wave: 'square',
                volume: 0.3
            },
            buttonHover: {
                freq: 600,
                duration: 0.05,
                wave: 'sine',
                volume: 0.2
            },
            
            // Combat Action Sounds
            attack: {
                freq: 300,
                duration: 0.2,
                wave: 'sawtooth',
                volume: 0.4,
                sweep: { start: 300, end: 200 }
            },
            hit: {
                freq: 150,
                duration: 0.3,
                wave: 'square',
                volume: 0.5,
                sweep: { start: 150, end: 100 }
            },
            miss: {
                freq: 400,
                duration: 0.15,
                wave: 'sine',
                volume: 0.3,
                sweep: { start: 400, end: 600 }
            },
            
            // Monster Sounds
            monsterAttack: {
                freq: 120,
                duration: 0.4,
                wave: 'sawtooth',
                volume: 0.6,
                sweep: { start: 120, end: 80 }
            },
            monsterHit: {
                freq: 200,
                duration: 0.25,
                wave: 'square',
                volume: 0.4
            },
            
            // Death/Defeat Sounds
            characterDeath: {
                freq: 220,
                duration: 1.0,
                wave: 'sine',
                volume: 0.5,
                sweep: { start: 220, end: 110 }
            },
            partyWipe: {
                freq: 150,
                duration: 2.0,
                wave: 'triangle',
                volume: 0.6,
                sweep: { start: 150, end: 75 }
            },
            
            // Victory Sounds
            victory: {
                freq: 523,
                duration: 0.5,
                wave: 'square',
                volume: 0.4,
                sweep: { start: 523, end: 784 }
            }
        };
    }
    
    /**
     * Create town theme - somber but calm, extended composition
     */
    createTownTheme() {
        return [
            // Part A - Main melancholy melody (lower register, slower tempo)
            { freq: 349, duration: 1.5, wave: 'sine' },    // F4 (somber start)
            { freq: 392, duration: 1.0, wave: 'sine' },    // G4
            { freq: 440, duration: 2.0, wave: 'sine' },    // A4 (hold)
            { freq: 0,   duration: 0.5 },                  // Rest
            { freq: 349, duration: 1.0, wave: 'sine' },    // F4
            { freq: 330, duration: 1.5, wave: 'sine' },    // E4
            { freq: 294, duration: 2.5, wave: 'sine' },    // D4 (long, sad note)
            { freq: 0,   duration: 1.0 },                  // Rest
            
            // Part B - Counter melody with harmonies
            { freq: 262, duration: 1.0, wave: 'sine' },    // C4
            { freq: 294, duration: 1.0, wave: 'sine' },    // D4
            { freq: 330, duration: 1.5, wave: 'sine' },    // E4
            { freq: 349, duration: 0.5, wave: 'sine' },    // F4
            { freq: 392, duration: 2.0, wave: 'sine' },    // G4 (hold)
            { freq: 349, duration: 1.0, wave: 'sine' },    // F4
            { freq: 330, duration: 3.0, wave: 'sine' },    // E4 (very long)
            { freq: 0,   duration: 1.5 },                  // Rest
            
            // Part C - Deep bass foundation (creates atmosphere)
            { freq: 131, duration: 4.0, wave: 'triangle' }, // C3 (very low, atmospheric)
            { freq: 147, duration: 4.0, wave: 'triangle' }, // D3
            { freq: 165, duration: 4.0, wave: 'triangle' }, // E3
            { freq: 131, duration: 4.0, wave: 'triangle' }, // C3
            
            // Part D - Sparse high notes (like distant bells)
            { freq: 0,   duration: 2.0 },                  // Rest
            { freq: 523, duration: 0.75, wave: 'sine' },   // C5 (soft)
            { freq: 0,   duration: 1.5 },                  // Rest
            { freq: 494, duration: 0.5, wave: 'sine' },    // B4
            { freq: 0,   duration: 2.0 },                  // Rest
            { freq: 440, duration: 1.0, wave: 'sine' },    // A4
            { freq: 0,   duration: 3.0 },                  // Long rest
            
            // Part E - Return to main theme with variation
            { freq: 349, duration: 1.0, wave: 'sine' },    // F4
            { freq: 330, duration: 1.0, wave: 'sine' },    // E4
            { freq: 294, duration: 1.5, wave: 'sine' },    // D4
            { freq: 262, duration: 2.0, wave: 'sine' },    // C4 (resolution, but sad)
            { freq: 0,   duration: 2.0 },                  // Rest
            { freq: 294, duration: 1.5, wave: 'sine' },    // D4
            { freq: 330, duration: 1.0, wave: 'sine' },    // E4
            { freq: 349, duration: 3.0, wave: 'sine' },    // F4 (final, long note)
            { freq: 0,   duration: 4.0 },                  // Long silence before repeat
        ];
    }
    
    /**
     * Create dungeon theme - mysterious and atmospheric
     */
    createDungeonTheme() {
        return [
            { freq: 220, duration: 1.0, wave: 'sawtooth' }, // A3
            { freq: 247, duration: 1.0, wave: 'sawtooth' }, // B3
            { freq: 262, duration: 0.5, wave: 'sawtooth' }, // C4
            { freq: 294, duration: 0.5, wave: 'sawtooth' }, // D4
            { freq: 330, duration: 1.0, wave: 'sawtooth' }, // E4
            { freq: 294, duration: 0.5, wave: 'sawtooth' }, // D4
            { freq: 262, duration: 0.5, wave: 'sawtooth' }, // C4
            { freq: 247, duration: 2.0, wave: 'sawtooth' }, // B3
            
            // Atmospheric drone
            { freq: 110, duration: 4.0, wave: 'sine' },     // A2 (low drone)
        ];
    }
    
    /**
     * Create combat theme - intense and driving
     */
    createCombatTheme() {
        return [
            { freq: 392, duration: 0.25, wave: 'square' }, // G4
            { freq: 440, duration: 0.25, wave: 'square' }, // A4
            { freq: 494, duration: 0.25, wave: 'square' }, // B4
            { freq: 523, duration: 0.25, wave: 'square' }, // C5
            { freq: 587, duration: 0.5, wave: 'square' },  // D5
            { freq: 523, duration: 0.25, wave: 'square' }, // C5
            { freq: 494, duration: 0.25, wave: 'square' }, // B4
            { freq: 440, duration: 0.5, wave: 'square' },  // A4
            
            // Driving bass
            { freq: 196, duration: 0.5, wave: 'triangle' }, // G3
            { freq: 196, duration: 0.5, wave: 'triangle' }, // G3
            { freq: 220, duration: 0.5, wave: 'triangle' }, // A3
            { freq: 220, duration: 0.5, wave: 'triangle' }, // A3
        ];
    }
    
    /**
     * Create victory theme - triumphant fanfare
     */
    createVictoryTheme() {
        return [
            { freq: 523, duration: 0.5, wave: 'square' },  // C5
            { freq: 659, duration: 0.5, wave: 'square' },  // E5
            { freq: 784, duration: 0.5, wave: 'square' },  // G5
            { freq: 1047, duration: 1.0, wave: 'square' }, // C6
            { freq: 0,   duration: 0.25 },                 // Rest
            { freq: 1047, duration: 0.25, wave: 'square' }, // C6
            { freq: 1175, duration: 0.25, wave: 'square' }, // D6
            { freq: 1319, duration: 1.5, wave: 'square' }, // E6
        ];
    }
    
    /**
     * Create death theme - somber and final
     */
    createDeathTheme() {
        return [
            { freq: 523, duration: 1.0, wave: 'sine' },    // C5
            { freq: 494, duration: 1.0, wave: 'sine' },    // B4
            { freq: 440, duration: 1.0, wave: 'sine' },    // A4
            { freq: 392, duration: 2.0, wave: 'sine' },    // G4
            { freq: 349, duration: 2.0, wave: 'sine' },    // F4
            { freq: 0,   duration: 1.0 },                  // Rest
        ];
    }
    
    /**
     * Play a musical note
     */
    playNote(frequency, duration, waveType = 'square', startTime = 0) {
        if (!this.isEnabled || !this.audioContext) return;
        
        if (frequency === 0) return; // Rest
        
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();
        
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTime);
        
        // ADSR envelope for chiptune sound
        noteGain.gain.setValueAtTime(0, this.audioContext.currentTime + startTime);
        noteGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + startTime + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.05, this.audioContext.currentTime + startTime + duration * 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + startTime + duration);
        
        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);
        
        oscillator.start(this.audioContext.currentTime + startTime);
        oscillator.stop(this.audioContext.currentTime + startTime + duration);
        
        this.currentOscillators.push(oscillator);
        
        // Clean up oscillator after it finishes
        setTimeout(() => {
            const index = this.currentOscillators.indexOf(oscillator);
            if (index > -1) {
                this.currentOscillators.splice(index, 1);
            }
        }, (startTime + duration) * 1000 + 100);
    }
    
    /**
     * Play a track pattern
     */
    playTrack(trackName) {
        if (!this.isEnabled || !this.tracks[trackName] || !this.audioContext) return;
        
        // Check if audio context is suspended (needs user interaction)
        if (this.audioContext.state === 'suspended') {
            console.log(`🎵 Audio queued: ${this.tracks[trackName].name} (waiting for user interaction)`);
            this.queuedTrack = trackName;
            return;
        }
        
        this.stopCurrentTrack();
        this.currentTrack = trackName;
        this.isPlaying = true;
        
        const track = this.tracks[trackName];
        const beatDuration = 60 / track.tempo; // seconds per beat
        
        console.log(`🎵 Playing: ${track.name}`);
        
        this.playPattern(track.pattern, beatDuration);
    }
    
    /**
     * Play a pattern of notes
     */
    playPattern(pattern, beatDuration) {
        if (!this.isPlaying) return;
        
        let currentTime = 0;
        
        pattern.forEach((note) => {
            if (this.isPlaying) {
                this.playNote(note.freq, note.duration * beatDuration, note.wave || 'square', currentTime);
                currentTime += note.duration * beatDuration;
            }
        });
        
        // Loop the pattern
        if (this.isPlaying) {
            const loopTimeout = setTimeout(() => {
                if (this.isPlaying && this.currentTrack) {
                    this.playPattern(pattern, beatDuration);
                }
            }, currentTime * 1000);
            
            // Track the timeout so we can clear it later
            this.patternTimeouts.push(loopTimeout);
        }
    }
    
    /**
     * Stop current track
     */
    stopCurrentTrack() {
        this.isPlaying = false;
        
        // Stop all current oscillators
        this.currentOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.currentOscillators = [];
        
        // Clear all pattern loop timeouts
        this.patternTimeouts.forEach(timeout => {
            clearTimeout(timeout);
        });
        this.patternTimeouts = [];
        
        if (this.currentTrack) {
            console.log(`🔇 Stopped: ${this.tracks[this.currentTrack]?.name || this.currentTrack}`);
            this.currentTrack = null;
        }
    }
    
    /**
     * Fade to a new track
     */
    fadeToTrack(trackName, fadeTime = 1000) {
        if (!this.isEnabled) return;
        
        if (this.currentTrack === trackName && this.isPlaying) return; // Already playing this track
        
        // Always stop current track and clear any queued track
        this.stopCurrentTrack();
        this.queuedTrack = null;
        
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }
        
        // If audio context is suspended, just queue the new track
        if (this.audioContext && this.audioContext.state === 'suspended') {
            if (trackName) {
                console.log(`🎵 Audio queued: ${this.tracks[trackName]?.name || trackName} (waiting for user interaction)`);
                this.queuedTrack = trackName;
            }
            return;
        }
        
        // Audio context is ready, start new track immediately
        if (trackName) {
            this.playTrack(trackName);
        }
    }
    
    /**
     * Fade in current track
     */
    fadeIn(targetVolume, fadeTime = 1000) {
        if (!this.isEnabled) return;
        
        const steps = 20;
        const stepTime = fadeTime / steps;
        let currentStep = 0;
        
        this.setVolume(0);
        
        const fadeInInterval = setInterval(() => {
            currentStep++;
            const fadeVolume = targetVolume * (currentStep / steps);
            this.setVolume(fadeVolume);
            
            if (currentStep >= steps) {
                clearInterval(fadeInInterval);
            }
        }, stepTime);
    }
    
    /**
     * Set volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }
    
    /**
     * Toggle audio on/off
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        
        if (!this.isEnabled) {
            this.stopCurrentTrack();
        }
        
        console.log(`🎵 Audio ${this.isEnabled ? 'enabled' : 'disabled'}`);
        return this.isEnabled;
    }
    
    /**
     * Play a sound effect
     */
    playSoundEffect(effectName) {
        if (!this.isEnabled || !this.audioContext || !this.soundEffects[effectName]) return;
        
        // Don't play sound effects if audio context is suspended
        if (this.audioContext.state === 'suspended') return;
        
        const effect = this.soundEffects[effectName];
        const oscillator = this.audioContext.createOscillator();
        const effectGain = this.audioContext.createGain();
        
        oscillator.type = effect.wave;
        oscillator.frequency.setValueAtTime(effect.freq, this.audioContext.currentTime);
        
        // Apply frequency sweep if defined
        if (effect.sweep) {
            oscillator.frequency.exponentialRampToValueAtTime(
                effect.sweep.end, 
                this.audioContext.currentTime + effect.duration * 0.8
            );
        }
        
        // Set volume envelope
        effectGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        effectGain.gain.linearRampToValueAtTime(effect.volume, this.audioContext.currentTime + 0.01);
        effectGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + effect.duration);
        
        oscillator.connect(effectGain);
        effectGain.connect(this.gainNode);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + effect.duration);
        
        // Clean up
        setTimeout(() => {
            try {
                oscillator.disconnect();
                effectGain.disconnect();
            } catch (e) {
                // Already disconnected
            }
        }, effect.duration * 1000 + 100);
    }
    
    /**
     * Resume audio context (required for user interaction)
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('🎵 Audio context resumed');
            
            // Play any queued track
            if (this.queuedTrack) {
                const trackToPlay = this.queuedTrack;
                this.queuedTrack = null;
                this.playTrack(trackToPlay);
            }
        }
    }
    
    /**
     * Get current track info
     */
    getCurrentTrackInfo() {
        if (!this.currentTrack) return null;
        
        return {
            name: this.currentTrack,
            title: this.tracks[this.currentTrack]?.name || this.currentTrack,
            isPlaying: this.isPlaying,
            volume: this.volume,
            enabled: this.isEnabled
        };
    }
}