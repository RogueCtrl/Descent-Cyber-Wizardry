
/**
 * Create Cyber Town Theme (Dashboard)
 * Synthwave style: Arpeggios, driving bass, crisp sawtooth leads
 */
createTownThemeCyber() {
    const theme = [];

    // --- SECTION 1: The 'Scan' (Arpeggiated intro) ---
    // A minor arpeggio (A3, C4, E4, A4) repeated
    for (let i = 0; i < 4; i++) {
        theme.push({ freq: 220, duration: 0.25, wave: 'square', volume: 0.15 }); // A3
        theme.push({ freq: 261, duration: 0.25, wave: 'square', volume: 0.15 }); // C4
        theme.push({ freq: 329, duration: 0.25, wave: 'square', volume: 0.15 }); // E4
        theme.push({ freq: 440, duration: 0.25, wave: 'square', volume: 0.15 }); // A4
    }

    // F Major Arpeggio (F3, A3, C4, F4)
    for (let i = 0; i < 4; i++) {
        theme.push({ freq: 174, duration: 0.25, wave: 'square', volume: 0.15 }); // F3
        theme.push({ freq: 220, duration: 0.25, wave: 'square', volume: 0.15 }); // A3
        theme.push({ freq: 261, duration: 0.25, wave: 'square', volume: 0.15 }); // C4
        theme.push({ freq: 349, duration: 0.25, wave: 'square', volume: 0.15 }); // F4
    }

    // --- SECTION 2: The 'Datasteam' (Bass + Melody) ---

    // Bassline: Steady A2 pulse (Active)
    // Melody: High sawtooth tech-lead

    // Measure 1
    theme.push({ freq: 110, duration: 0.25, wave: 'sawtooth', volume: 0.4 }); // Bass kick
    theme.push({ freq: 880, duration: 0.25, wave: 'sine', volume: 0.2 });     // High ping
    theme.push({ freq: 110, duration: 0.25, wave: 'sawtooth', volume: 0.3 }); // Bass
    theme.push({ freq: 110, duration: 0.25, wave: 'sawtooth', volume: 0.3 }); // Bass

    theme.push({ freq: 880, duration: 0.25, wave: 'sine', volume: 0.2 });     // High ping
    theme.push({ freq: 110, duration: 0.25, wave: 'sawtooth', volume: 0.3 }); // Bass
    theme.push({ freq: 0, duration: 0.25 });                              // Gap
    theme.push({ freq: 659, duration: 0.25, wave: 'square', volume: 0.3 });   // E5 melody

    // Measure 2
    theme.push({ freq: 587, duration: 0.5, wave: 'square', volume: 0.3 });    // D5
    theme.push({ freq: 523, duration: 0.5, wave: 'square', volume: 0.3 });    // C5
    theme.push({ freq: 440, duration: 1.0, wave: 'square', volume: 0.3 });    // A4 (Hold)

    theme.push({ freq: 110, duration: 0.5, wave: 'sawtooth', volume: 0.4 });  // Bass reset
    theme.push({ freq: 174, duration: 0.5, wave: 'sawtooth', volume: 0.4 });  // F3 Bass move
    theme.push({ freq: 220, duration: 1.0, wave: 'sawtooth', volume: 0.4 });  // A3 Bass resolve

    // --- SECTION 3: The 'Cooling' (Fade out) ---
    theme.push({ freq: 55, duration: 2.0, wave: 'triangle', volume: 0.5 });  // A1 Sub-bass drone
    theme.push({ freq: 0, duration: 1.0 });                               // Silence

    return theme;
}
