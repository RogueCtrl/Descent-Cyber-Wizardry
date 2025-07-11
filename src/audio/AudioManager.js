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
                tempo: 60, // Much slower, more atmospheric
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
            },
            
            // Special Action Sounds
            exitAvailable: {
                freq: 440,
                duration: 0.3,
                wave: 'sine',
                volume: 0.4,
                sweep: { start: 440, end: 880 }
            },
            treasureAvailable: {
                freq: 523,
                duration: 0.4,
                wave: 'triangle',
                volume: 0.5,
                sweep: { start: 523, end: 1047 }
            },
            treasureOpen: {
                freq: 784,
                duration: 0.6,
                wave: 'sine',
                volume: 0.6,
                sweep: { start: 784, end: 1568 }
            },
            exitDungeon: {
                freq: 880,
                duration: 0.5,
                wave: 'square',
                volume: 0.5,
                sweep: { start: 880, end: 440 }
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
     * Create dungeon theme - long, dark, atmospheric with distant sounds
     */
    createDungeonTheme() {
        return [
            // Part A - More audible opening, then fade to atmospheric
            { freq: 220, duration: 2.0, wave: 'sine' },     // A3 (audible start)
            { freq: 196, duration: 2.0, wave: 'sine' },     // G3 (descending)
            { freq: 175, duration: 3.0, wave: 'sine' },     // F3 (getting lower)
            { freq: 147, duration: 4.0, wave: 'sine' },     // D3 (low but audible)
            { freq: 0,   duration: 2.0 },                   // Short silence
            { freq: 110, duration: 4.0, wave: 'sine' },     // A2 (low drone)
            { freq: 0,   duration: 3.0 },                   // Silence
            
            // Part B - Distant echoing sounds (like footsteps or dripping)
            { freq: 220, duration: 0.25, wave: 'sine' },    // A3 (distant sound)
            { freq: 0,   duration: 1.5 },                   // Silence
            { freq: 220, duration: 0.25, wave: 'sine' },    // A3 (echo)
            { freq: 0,   duration: 2.0 },                   // Silence
            { freq: 196, duration: 0.3, wave: 'sine' },     // G3 (different pitch, like dripping)
            { freq: 0,   duration: 5.0 },                   // Long silence
            
            // Part C - Unsettling harmonic intervals (creates tension)
            { freq: 147, duration: 4.0, wave: 'triangle' }, // D3 (tritone interval - "devil's interval")
            { freq: 208, duration: 4.0, wave: 'triangle' }, // G#3 (dissonant harmony)
            { freq: 0,   duration: 6.0 },                   // Silence
            
            // Part D - Very distant, barely audible sounds
            { freq: 330, duration: 0.2, wave: 'sine' },     // E4 (like a distant scream)
            { freq: 0,   duration: 8.0 },                   // Long silence
            { freq: 311, duration: 0.15, wave: 'sine' },    // D#4 (another distant sound)
            { freq: 0,   duration: 6.0 },                   // Silence
            
            // Part E - Subtle movement, like something stalking
            { freq: 131, duration: 2.0, wave: 'sine' },     // C3 (barely audible)
            { freq: 139, duration: 2.0, wave: 'sine' },     // C#3 (chromatic movement)
            { freq: 147, duration: 2.0, wave: 'sine' },     // D3
            { freq: 0,   duration: 4.0 },                   // Silence
            { freq: 123, duration: 3.0, wave: 'sine' },     // B2 (lower, more ominous)
            { freq: 0,   duration: 7.0 },                   // Long silence
            
            // Part F - Environmental sounds (wind through passages)
            { freq: 87,  duration: 12.0, wave: 'triangle' }, // F2 (very low, like wind)
            { freq: 0,   duration: 5.0 },                    // Silence
            
            // Part G - Sparse, eerie high frequencies (like distant whispers)
            { freq: 523, duration: 0.1, wave: 'sine' },     // C5 (very brief, like a whisper)
            { freq: 0,   duration: 3.0 },                   // Silence
            { freq: 466, duration: 0.1, wave: 'sine' },     // A#4 (another whisper)
            { freq: 0,   duration: 4.0 },                   // Silence
            { freq: 440, duration: 0.15, wave: 'sine' },    // A4 (slightly longer whisper)
            { freq: 0,   duration: 8.0 },                   // Long silence
            
            // Part H - Return to deep foundation with subtle variation
            { freq: 104, duration: 6.0, wave: 'sine' },     // G#2 (slightly different from opening)
            { freq: 0,   duration: 4.0 },                   // Silence
            { freq: 116, duration: 8.0, wave: 'sine' },     // A#2 (building slight dissonance)
            { freq: 0,   duration: 6.0 },                   // Silence
            
            // Part I - Final distant sounds before cycle
            { freq: 185, duration: 0.2, wave: 'triangle' }, // F#3 (distant metallic sound)
            { freq: 0,   duration: 5.0 },                   // Silence
            { freq: 175, duration: 0.25, wave: 'triangle' }, // F3 (like distant chain)
            { freq: 0,   duration: 3.0 },                   // Silence
            { freq: 165, duration: 0.3, wave: 'triangle' }, // E3 (getting closer?)
            { freq: 0,   duration: 10.0 },                  // Very long silence before repeat
        ];
    }
    
    /**
     * Create combat theme - strategic and subtle, mid-range focused
     */
    createCombatTheme() {
        return [
            // Part A - Main combat theme (mid-range, not piercing)
            { freq: 294, duration: 0.75, wave: 'sine' },    // D4 (lowered from G4)
            { freq: 330, duration: 0.5, wave: 'sine' },     // E4 (lowered from A4)
            { freq: 349, duration: 1.0, wave: 'sine' },     // F4 (lowered from B4)
            { freq: 0,   duration: 0.25 },                  // Brief rest
            { freq: 392, duration: 0.5, wave: 'sine' },     // G4 (lowered from C5)
            { freq: 440, duration: 0.75, wave: 'sine' },    // A4 (lowered from D5)
            { freq: 392, duration: 0.5, wave: 'sine' },     // G4 (lowered from C5)
            { freq: 349, duration: 1.0, wave: 'sine' },     // F4 (lowered from B4)
            { freq: 0,   duration: 0.5 },                   // Rest
            
            // Part B - Lower register melody (warm, not harsh)
            { freq: 220, duration: 0.75, wave: 'triangle' }, // A3 (warmer wave)
            { freq: 246, duration: 0.5, wave: 'triangle' },  // B3
            { freq: 262, duration: 1.0, wave: 'triangle' },  // C4 (hold)
            { freq: 294, duration: 0.5, wave: 'triangle' },  // D4
            { freq: 330, duration: 0.75, wave: 'triangle' }, // E4
            { freq: 294, duration: 0.5, wave: 'triangle' },  // D4
            { freq: 262, duration: 1.5, wave: 'triangle' },  // C4 (long hold)
            { freq: 0,   duration: 0.75 },                   // Rest
            
            // Part C - Bass foundation (steady, grounding)
            { freq: 147, duration: 1.0, wave: 'triangle' }, // D3
            { freq: 165, duration: 1.0, wave: 'triangle' }, // E3
            { freq: 175, duration: 1.0, wave: 'triangle' }, // F3
            { freq: 165, duration: 1.0, wave: 'triangle' }, // E3
            { freq: 147, duration: 2.0, wave: 'triangle' }, // D3 (long)
            { freq: 0,   duration: 1.0 },                   // Rest
            
            // Part D - Subtle tension (no harsh sawtooth)
            { freq: 277, duration: 1.5, wave: 'sine' },     // C#4 (subtle dissonance)
            { freq: 311, duration: 1.5, wave: 'sine' },     // D#4 (mild tension)
            { freq: 0,   duration: 1.0 },                   // Silence for effect
            { freq: 262, duration: 2.0, wave: 'triangle' }, // C4 (gentle resolution)
            { freq: 0,   duration: 0.5 },                   // Rest
            
            // Part E - Rhythmic variation (gentle, not sharp)
            { freq: 392, duration: 0.5, wave: 'triangle' }, // G4 (lowered from C5)
            { freq: 0,   duration: 0.25 },                  // Rest
            { freq: 349, duration: 0.5, wave: 'triangle' }, // F4 (lowered from B4)
            { freq: 0,   duration: 0.25 },                  // Rest
            { freq: 330, duration: 0.75, wave: 'triangle' }, // E4 (lowered from A4)
            { freq: 294, duration: 0.75, wave: 'triangle' }, // D4 (lowered from G4)
            { freq: 0,   duration: 0.5 },                   // Rest
            { freq: 262, duration: 1.0, wave: 'triangle' }, // C4 (lowered from F4)
            { freq: 0,   duration: 1.0 },                   // Longer rest
            
            // Part F - Gentle echoes (no piercing highs)
            { freq: 440, duration: 0.3, wave: 'triangle' }, // A4 (much lower than G5)
            { freq: 0,   duration: 0.7 },                   // Rest
            { freq: 392, duration: 0.3, wave: 'triangle' }, // G4 (much lower than F5)
            { freq: 0,   duration: 0.7 },                   // Rest
            { freq: 349, duration: 0.4, wave: 'triangle' }, // F4 (much lower than E5)
            { freq: 0,   duration: 1.6 },                   // Long rest
            
            // Part G - Deep foundation return
            { freq: 131, duration: 3.0, wave: 'triangle' }, // C3 (very low, warm)
            { freq: 147, duration: 3.0, wave: 'triangle' }, // D3 (grounding)
            { freq: 0,   duration: 2.0 },                   // Silence before repeat
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
     * Refresh track patterns (useful after updating compositions)
     */
    refreshTracks() {
        const wasPlaying = this.currentTrack;
        const wasEnabled = this.isEnabled;
        
        if (wasPlaying) {
            this.stopCurrentTrack();
        }
        
        // Reinitialize track patterns
        this.tracks = {
            town: {
                name: 'Town Theme',
                tempo: 80,
                pattern: this.createTownTheme()
            },
            dungeon: {
                name: 'Dungeon Exploration',
                tempo: 60,
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
        
        console.log('🎵 Audio tracks refreshed');
        
        // Restart the same track if it was playing
        if (wasPlaying && wasEnabled) {
            setTimeout(() => {
                this.playTrack(wasPlaying);
            }, 100);
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