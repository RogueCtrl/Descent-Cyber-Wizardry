# Audio & Terminology Systems

> **Files**: `src/audio/AudioManager.js`, `src/data/terminology.js`, `src/utils/TextManager.js`
> **Total Lines**: ~1,900

## Part 1: Audio System

### Overview
Procedurally generated chiptune music and sound effects using Web Audio API. No external audio files.

### Architecture

```javascript
class AudioManager {
    constructor() {
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
    }
}
```

### User Interaction Requirement
Browser security requires user interaction before audio:

```javascript
setupUserInteractionListener() {
    const resume = () => {
        this.resumeContext();
        document.removeEventListener('click', resume);
        document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
}
```

---

### Music Tracks

| Track | BPM | Purpose |
|-------|-----|---------|
| `town` | 80 | Hub/safe zone, somber |
| `dungeon` | 110 | Exploration, dynamic modes |
| `combat` | 140 | Battle, intense |
| `victory` | 70 | Post-combat, bittersweet |
| `death` | 80 | Game over, descending |

### Dungeon Theme Dynamic Modes

```javascript
state = {
    mode: 'stealth',    // or 'active'
    intensity: 0.2,     // 20% base
    scareCooldown: 0
};

// Mode transitions:
// Stealth → Active: 15% chance per measure
// Active → Stealth: 40% chance

// Jump scare: 5% chance in stealth (with cooldown)
```

### Track Control

```javascript
// Play track
audioManager.playTrack('town');

// Fade between tracks
audioManager.fadeToTrack('combat', 1000);  // 1 second fade

// Stop
audioManager.stopCurrentTrack();
```

---

### Sound Effects

#### UI Sounds
| Effect | Frequency | Use |
|--------|-----------|-----|
| `buttonClick` | 800 Hz | General button |
| `trainingGroundsClick` | 523-659 Hz | Training area |
| `dungeonClick` | 349-294 Hz | Dungeon entrance |
| `deletePartyWarning` | 220-110 Hz | Danger tone |

#### Combat Sounds
| Effect | Frequency | Use |
|--------|-----------|-----|
| `attack` | 300→200 Hz | Player attack |
| `hit` | 150→100 Hz | Successful hit |
| `miss` | 400→600 Hz | Attack miss |
| `monsterAttack` | 120→80 Hz | Enemy attack |
| `characterDeath` | 220→110 Hz | Character dies |
| `partyWipe` | 150→75 Hz | TPK |

#### Dungeon Sounds
| Effect | Frequency | Use |
|--------|-----------|-----|
| `exitAvailable` | 440→880 Hz | Exit proximity |
| `treasureAvailable` | 523→1047 Hz | Treasure found |
| `treasureOpen` | 784→1568 Hz | Opening chest |
| `victory` | 523→784 Hz | Combat victory |

### Playing Sound Effects

```javascript
audioManager.playSoundEffect('buttonClick');
```

---

### Adding New Sounds

#### New Sound Effect

```javascript
// In AudioManager.setupSoundEffects()
this.soundEffects = {
    newSound: {
        freq: 440,
        duration: 0.5,
        wave: 'sine',      // sine, square, triangle, sawtooth
        volume: 0.4,
        sweep: {           // Optional frequency sweep
            start: 440,
            end: 880
        }
    }
};
```

#### New Music Track

```javascript
// 1. Create theme function
createCustomTheme() {
    return [
        { freq: 262, duration: 1.0, wave: 'sine' },  // C4
        { freq: 330, duration: 1.0, wave: 'sine' },  // E4
        { freq: 0, duration: 0.5 }                    // Rest
    ];
}

// 2. Register track
this.tracks = {
    custom: {
        name: 'Custom Track',
        tempo: 100,
        pattern: this.createCustomTheme()
    }
};

// 3. Play
audioManager.playTrack('custom');
```

#### Dynamic Track (Generator)

```javascript
createDynamicTheme() {
    let state = { variation: 0 };

    return () => {
        state.variation++;
        return [
            { freq: state.variation % 2 ? 262 : 330, duration: 2.0, wave: 'sine' }
        ];
    };
}
```

---

## Part 2: Terminology System

### Overview
80+ term mappings supporting dual-mode (fantasy/cyberpunk) text throughout the game.

### Structure

```javascript
const TERMINOLOGY = {
    classic: {
        party: "Party",
        character: "Character",
        dungeon: "Dungeon",
        // ...
    },
    cyber: {
        party: "Strike Team",
        character: "Agent",
        dungeon: "Corrupted Network",
        // ...
    }
};
```

---

### Key Mappings

#### Core Elements
| Classic | Cyber |
|---------|-------|
| Party | Strike Team |
| Character | Agent |
| Town | Terminal Hub |
| Dungeon | Corrupted Network |
| Level | Clearance Level |

#### Races
| Classic | Cyber |
|---------|-------|
| Human | Core Shell |
| Elf | Quantum Thread |
| Dwarf | Iron Kernel |
| Hobbit | Embedded System |
| Gnome | Blockchain Node |

#### Classes
| Classic | Cyber |
|---------|-------|
| Fighter | Hacker |
| Mage | Vibecoder |
| Priest | Infrastructure |
| Thief | Trojan |
| Bishop | Architect |
| Samurai | CircuitBreaker |
| Lord | SysAdmin |
| Ninja | Backdoor |

#### Combat
| Classic | Cyber |
|---------|-------|
| Combat | Grid Engagement |
| Attack | Execute Attack |
| Cast Spell | Run Program |
| Flee | Disconnect |

---

### TextManager API

```javascript
// Get text for current mode
TextManager.getText('party');  // "Strike Team" or "Party"

// Get with fallback
TextManager.getText('unknown', 'Default');

// Get both versions
TextManager.getAllText('party');
// { classic: "Party", cyber: "Strike Team" }

// Mode control
TextManager.updateMode('cyber');
TextManager.updateMode('classic');
TextManager.toggleMode();

// Mode checks
TextManager.getMode();        // 'classic' or 'cyber'
TextManager.isCyberMode();    // boolean
TextManager.isClassicMode();  // boolean
```

---

### data-text-key Attribute

Auto-updating HTML elements:

```html
<!-- Define element -->
<h3 data-text-key="party">Strike Team</h3>
<label data-text-key="party_name_label">Strike Team Name:</label>
```

```javascript
// Apply TextManager to elements
const elements = document.querySelectorAll('[data-text-key]');
elements.forEach(el => {
    const key = el.getAttribute('data-text-key');
    TextManager.applyToElement(el, key);
});
```

### Mode Change Callbacks

```javascript
// Register callback
TextManager.onModeChange((newMode, oldMode) => {
    console.log(`Changed: ${oldMode} → ${newMode}`);
    updateUI();
});

// Unregister
TextManager.offModeChange(updateUI);
```

### Create Reactive Element

```javascript
const heading = TextManager.createTextElement('party', 'h3', 'party-title');
// Automatically updates when mode changes
container.appendChild(heading);
```

---

### TerminologyUtils

For entities with dual names (monsters, equipment):

```javascript
// Get both names
TerminologyUtils.getDualNames(monster);
// { classic: "Ogre", cyber: "Guardian Program" }

// Get current mode name
TerminologyUtils.getContextualName(monster);
// "Guardian Program" (if cyber mode)

// Format for display
TerminologyUtils.formatDualDisplay(monster);
// "Ogre / Guardian Program"
```

---

### Adding New Terminology

1. **Add to both dictionaries**:
```javascript
// In terminology.js
classic: {
    new_term: "Fantasy Version",
    new_term_desc: "Fantasy description"
},
cyber: {
    new_term: "Cyber Version",
    new_term_desc: "Cyber description"
}
```

2. **Use in HTML**:
```html
<span data-text-key="new_term">Fantasy Version</span>
```

3. **Use in JavaScript**:
```javascript
const text = TextManager.getText('new_term');
```

---

### Integration Example

Mode toggle in PartySetupModal:

```javascript
handleModeToggle() {
    // 1. Toggle mode
    TextManager.toggleMode();

    // 2. Update title
    const title = TextManager.isCyberMode()
        ? 'Initialize Strike Team'
        : 'Create Party';
    titleElement.textContent = title;

    // 3. Update all data-text-key elements
    const elements = modal.querySelectorAll('[data-text-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-text-key');
        TextManager.applyToElement(el, key);
    });
}
```

---

## System Integration

### Audio + Terminology

- Sound effects have no text (pure synthesis)
- Track names can be localized
- UI buttons that trigger sounds use terminology

### Typical Usage

```javascript
// Engine initialization
this.audioManager = new AudioManager();

// State transitions
handleStateChange(newState) {
    switch(newState) {
        case 'town':
            this.audioManager.fadeToTrack('town');
            break;
        case 'combat':
            this.audioManager.fadeToTrack('combat');
            break;
    }
}

// UI with terminology
const button = document.createElement('button');
button.setAttribute('data-text-key', 'enter_dungeon');
button.onclick = () => {
    audioManager.playSoundEffect('dungeonClick');
    enterDungeon();
};
TextManager.applyToElement(button, 'enter_dungeon');
```
