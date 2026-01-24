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
            },

            // Town/Hub Menu Button Sounds
            trainingGroundsClick: {
                freq: 523,
                duration: 0.15,
                wave: 'square',
                volume: 0.3,
                sweep: { start: 523, end: 659 }  // C5 to E5
            },
            templeClick: {
                freq: 440,
                duration: 0.2,
                wave: 'sine',
                volume: 0.3,
                sweep: { start: 440, end: 554 }  // A4 to C#5
            },
            shopClick: {
                freq: 698,
                duration: 0.12,
                wave: 'triangle',
                volume: 0.3,
                sweep: { start: 698, end: 784 }  // F5 to G5
            },
            tavernClick: {
                freq: 392,
                duration: 0.18,
                wave: 'square',
                volume: 0.3,
                sweep: { start: 392, end: 494 }  // G4 to B4
            },
            strikeTeamClick: {
                freq: 587,
                duration: 0.15,
                wave: 'sawtooth',
                volume: 0.3,
                sweep: { start: 587, end: 698 }  // D5 to F5
            },
            characterRosterClick: {
                freq: 494,
                duration: 0.16,
                wave: 'square',
                volume: 0.3,
                sweep: { start: 494, end: 622 }  // B4 to D#5
            },
            dungeonClick: {
                freq: 349,
                duration: 0.2,
                wave: 'sawtooth',
                volume: 0.3,
                sweep: { start: 349, end: 294 }  // F4 to D4
            },
            deletePartyWarning: {
                freq: 220,
                duration: 2.0,
                wave: 'sawtooth',
                volume: 0.4,
                sweep: { start: 220, end: 110 }  // A3 to A2, ominous
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
            { freq: 0, duration: 0.5 },                  // Rest
            { freq: 349, duration: 1.0, wave: 'sine' },    // F4
            { freq: 330, duration: 1.5, wave: 'sine' },    // E4
            { freq: 294, duration: 2.5, wave: 'sine' },    // D4 (long, sad note)
            { freq: 0, duration: 1.0 },                  // Rest

            // Part B - Counter melody with harmonies
            { freq: 262, duration: 1.0, wave: 'sine' },    // C4
            { freq: 294, duration: 1.0, wave: 'sine' },    // D4
            { freq: 330, duration: 1.5, wave: 'sine' },    // E4
            { freq: 349, duration: 0.5, wave: 'sine' },    // F4
            { freq: 392, duration: 2.0, wave: 'sine' },    // G4 (hold)
            { freq: 349, duration: 1.0, wave: 'sine' },    // F4
            { freq: 330, duration: 3.0, wave: 'sine' },    // E4 (very long)
            { freq: 0, duration: 1.5 },                  // Rest

            // Part C - Deep bass foundation (creates atmosphere)
            { freq: 131, duration: 4.0, wave: 'triangle' }, // C3 (very low, atmospheric)
            { freq: 147, duration: 4.0, wave: 'triangle' }, // D3
            { freq: 165, duration: 4.0, wave: 'triangle' }, // E3
            { freq: 131, duration: 4.0, wave: 'triangle' }, // C3

            // Part D - Sparse high notes (like distant bells)
            { freq: 0, duration: 2.0 },                  // Rest
            { freq: 523, duration: 0.75, wave: 'sine' },   // C5 (soft)
            { freq: 0, duration: 1.5 },                  // Rest
            { freq: 494, duration: 0.5, wave: 'sine' },    // B4
            { freq: 0, duration: 2.0 },                  // Rest
            { freq: 440, duration: 1.0, wave: 'sine' },    // A4
            { freq: 0, duration: 3.0 },                  // Long rest

            // Part E - Return to main theme with variation
            { freq: 349, duration: 1.0, wave: 'sine' },    // F4
            { freq: 330, duration: 1.0, wave: 'sine' },    // E4
            { freq: 294, duration: 1.5, wave: 'sine' },    // D4
            { freq: 262, duration: 2.0, wave: 'sine' },    // C4 (resolution, but sad)
            { freq: 0, duration: 2.0 },                  // Rest
            { freq: 294, duration: 1.5, wave: 'sine' },    // D4
            { freq: 330, duration: 1.0, wave: 'sine' },    // E4
            { freq: 349, duration: 3.0, wave: 'sine' },    // F4 (final, long note)
            { freq: 0, duration: 4.0 },                  // Long silence before repeat
        ];
    }

    /**
     * Create dungeon theme - Dynamic Cyber Generator
     */
    createDungeonTheme() {
        // Return a generator function that maintains state
        let state = {
            mode: 'stealth', // 'stealth', 'active', 'transition'
            intensity: 0.2,
            measureCount: 0,
            scareCooldown: 0
        };

        return () => {
            const pattern = [];
            state.measureCount++;

            // Randomly switch modes occasionally
            // Check less frequently in stealth mode to keep it longer
            const switchCheckInterval = state.mode === 'stealth' ? 4 : 4;

            if (state.measureCount % switchCheckInterval === 0) {
                if (state.mode === 'stealth') {
                    // Harder to enter active mode (15% chance)
                    if (Math.random() < 0.15) {
                        state.mode = 'active';
                        state.intensity = 0.8;
                        console.log('🎵 Audio: Switching to ACTIVE mode');
                    }
                } else {
                    // Easier to return to stealth mode (40% chance)
                    if (Math.random() < 0.4) {
                        state.mode = 'stealth';
                        state.intensity = 0.3;
                        console.log('🎵 Audio: Switching to STEALTH mode');
                    }
                }
            }

            // Reduce cooldown
            if (state.scareCooldown > 0) state.scareCooldown--;

            // JUMP SCARE LOGIC
            // Higher chance in stealth mode to be more startling
            const scareChance = state.mode === 'stealth' ? 0.05 : 0.01;
            if (state.scareCooldown === 0 && Math.random() < scareChance) {
                console.log('💀 Audio: JUMP SCARE!');
                state.scareCooldown = 8; // Don't scare again too soon
                return this.generateJumpScare();
            }

            // Generate music based on mode
            if (state.mode === 'active') {
                return this.generateCyberActiveSegment(state);
            } else {
                return this.generateCyberStealthSegment(state);
            }
        };
    }

    /**
     * Generate a jump scare segment
     */
    generateJumpScare() {
        // Burst of dissonance and noise
        return [
            { freq: 523, duration: 0.1, wave: 'sawtooth', volume: 0.8 }, // C5
            { freq: 740, duration: 0.1, wave: 'sawtooth', volume: 0.9 }, // F#5 (tritone)
            { freq: 494, duration: 0.1, wave: 'square', volume: 0.8 },   // B4
            { freq: 110, duration: 0.5, wave: 'sawtooth', volume: 0.9 }, // A2 (low crash)
            { freq: 0, duration: 2.0 }  // Stunned silence
        ];
    }

    /**
     * Generate active cyber segment (driving beat)
     */
    generateCyberActiveSegment(state) {
        const segment = [];
        const baseFreq = 110; // A2

        // 16-step bassline (driving)
        for (let i = 0; i < 8; i++) { // 2 measures of 4 quarter notes = 8 beats total? 
            // Actually playTrack uses beatDuration. Let's make a 1-measure loop of 4 beats
            // 4 beats broken into 16th notes = 16 steps? 
            // Let's keep it simple: 4 beat loop

            // Bass: Steady pulse
            segment.push({ freq: baseFreq, duration: 0.25, wave: 'sawtooth', volume: 0.6 });
            segment.push({ freq: baseFreq * 2, duration: 0.25, wave: 'sawtooth', volume: 0.4 });
            segment.push({ freq: baseFreq, duration: 0.25, wave: 'sawtooth', volume: 0.6 });
            segment.push({ freq: Math.random() > 0.5 ? baseFreq * 3 : baseFreq, duration: 0.25, wave: 'sawtooth', volume: 0.5 });
        }

        // Glitchy melody overlay
        const numGlitches = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < numGlitches; i++) {
            // High frequency bleeps inserted via "tracks" effectively? 
            // Since this simple player is monophonic (sequential), we can't do true polyphony easily without changing the whole engine.
            // But we CAN intersperse them or use short chords if we hacked it.
            // For this sequential player, we have to serialize it.

            // WAIT - the simple player is sequential. 
            // Rework strategy: Return a sequence that IS the music.
            // For a driving beat, we need the bass to BE the sequence.
            // We can add "melody" notes by replacing some bass notes or inserting between them if tempo allows.
        }

        // Since playPattern is sequential, let's construct a cool mono-synth riff
        const riff = [];
        const scale = [220, 261, 293, 311, 329, 392, 440]; // Minor/Cyber scale (A C D D# E G A)

        for (let beat = 0; beat < 4; beat++) {
            // Beat start: Bass kick
            riff.push({ freq: 110, duration: 0.25, wave: 'sawtooth', volume: 0.7 });

            // 2nd 16th: High hat / glitch
            if (Math.random() < 0.5) {
                riff.push({ freq: 880 + Math.random() * 100, duration: 0.1, wave: 'square', volume: 0.3 });
                riff.push({ freq: 0, duration: 0.15 });
            } else {
                riff.push({ freq: 110, duration: 0.25, wave: 'sawtooth', volume: 0.5 });
            }

            // 3rd 16th: Melody note?
            if (Math.random() < 0.4) {
                const note = scale[Math.floor(Math.random() * scale.length)];
                riff.push({ freq: note, duration: 0.25, wave: 'square', volume: 0.6 });
            } else {
                riff.push({ freq: 220, duration: 0.25, wave: 'sawtooth', volume: 0.5 }); // Octave bass
            }

            // 4th 16th: Bass
            riff.push({ freq: 110, duration: 0.25, wave: 'sawtooth', volume: 0.6 });
        }
        return riff;
    }

    /**
     * Generate stealth cyber segment (atmospheric)
     */
    generateCyberStealthSegment(state) {
        const segment = [];

        // Sparse, echoey pings
        // 4 beats total duration

        // Beat 1: Low atmospheric drone tick
        segment.push({ freq: 55, duration: 0.5, wave: 'triangle', volume: 0.7 });
        segment.push({ freq: 0, duration: 0.5 });

        // Beat 2: Random high sonar ping
        if (Math.random() < 0.3) {
            const ping = Math.random() < 0.5 ? 880 : 659; // A5 or E5
            segment.push({ freq: ping, duration: 0.1, wave: 'sine', volume: 0.4 });
            segment.push({ freq: 0, duration: 0.9 });
        } else {
            segment.push({ freq: 0, duration: 1.0 });
        }

        // Beat 3: Bass rumble
        segment.push({ freq: 65, duration: 0.8, wave: 'triangle', volume: 0.6 });
        segment.push({ freq: 0, duration: 0.2 });

        // Beat 4: Silence or tick
        if (Math.random() < 0.2) {
            segment.push({ freq: 110, duration: 0.1, wave: 'sawtooth', volume: 0.2 });
            segment.push({ freq: 0, duration: 0.9 });
        } else {
            segment.push({ freq: 0, duration: 1.0 });
        }

        return segment;
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
            { freq: 0, duration: 0.25 },                  // Brief rest
            { freq: 392, duration: 0.5, wave: 'sine' },     // G4 (lowered from C5)
            { freq: 440, duration: 0.75, wave: 'sine' },    // A4 (lowered from D5)
            { freq: 392, duration: 0.5, wave: 'sine' },     // G4 (lowered from C5)
            { freq: 349, duration: 1.0, wave: 'sine' },     // F4 (lowered from B4)
            { freq: 0, duration: 0.5 },                   // Rest

            // Part B - Lower register melody (warm, not harsh)
            { freq: 220, duration: 0.75, wave: 'triangle' }, // A3 (warmer wave)
            { freq: 246, duration: 0.5, wave: 'triangle' },  // B3
            { freq: 262, duration: 1.0, wave: 'triangle' },  // C4 (hold)
            { freq: 294, duration: 0.5, wave: 'triangle' },  // D4
            { freq: 330, duration: 0.75, wave: 'triangle' }, // E4
            { freq: 294, duration: 0.5, wave: 'triangle' },  // D4
            { freq: 262, duration: 1.5, wave: 'triangle' },  // C4 (long hold)
            { freq: 0, duration: 0.75 },                   // Rest
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
            { freq: 0, duration: 0.25 },                 // Rest
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
            { freq: 0, duration: 1.0 },                  // Rest
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
        // Increase initial punch for cyber feel if using sawtooth
        const attackTime = waveType === 'sawtooth' ? 0.005 : 0.01;
        const decayTime = waveType === 'sawtooth' ? 0.1 : 0.3;

        noteGain.gain.setValueAtTime(0, this.audioContext.currentTime + startTime);
        noteGain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + startTime + attackTime);
        noteGain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + startTime + duration * decayTime);
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
        let beatDuration = 60 / track.tempo; // seconds per beat

        // Cyber adjustment: Increase tempo for dungeon!
        if (trackName === 'dungeon') {
            beatDuration = 60 / 110; // 110 BPM for cyber feel
        }

        console.log(`🎵 Playing: ${track.name}`);

        this.playPattern(track.pattern, beatDuration);
    }

    /**
     * Play a pattern of notes
     */
    playPattern(pattern, beatDuration) {
        if (!this.isPlaying) return;

        let sequence = pattern;
        let isDynamic = false;

        // Handle dynamic patterns (generators)
        if (typeof pattern === 'function') {
            sequence = pattern();
            isDynamic = true;
        }

        let currentTime = 0;

        sequence.forEach((note) => {
            if (this.isPlaying) {
                // Determine volume based on note or default
                const vol = note.volume || (note.wave === 'sawtooth' ? 0.15 : 0.2); // Reduce base volume slightly as we have more notes

                // Hack: We don't have volume passed to playNote in the simplified method signature...
                // I need to update playNote to check for note.volume? 
                // Wait, playNote helper: playNote(frequency, duration, waveType = 'square', startTime = 0)
                // It generates its own gain node. I can't easily pass volume without modifying playNote.
                // Let's rely on ADSR for now, or assume playNote uses a fixed max.
                // Actually, I can modify playNote above to accept volume optional arg? 
                // Or just assume standard mix.

                this.playNote(note.freq, note.duration * beatDuration, note.wave || 'square', currentTime);
                currentTime += note.duration * beatDuration;
            }
        });

        // Loop the pattern
        if (this.isPlaying) {
            const loopTimeout = setTimeout(() => {
                if (this.isPlaying && this.currentTrack) {
                    // For dynamic patterns, pass the ORIGINAL function reference back to loop it
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