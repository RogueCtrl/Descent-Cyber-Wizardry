# Project Descent - Agent Context

> **Files**: `AGENTS.md` (this file)
> **Goal**: Provide high-level context and navigation for AI agents working on this codebase.

A browser-based Wizardry homage with dual-mode (fantasy/cyberpunk) aesthetics. Pure vanilla JavaScript, no dependencies.

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Tech** | Vanilla JS, HTML5 Canvas, IndexedDB (v7), Web Audio API |
| **Entry** | `index.html` → loads all scripts |
| **Run** | `python -m http.server 8000` then visit `localhost:8000` |
| **Test** | Browser only (uses Canvas, IndexedDB) |

## System Documentation

Detailed documentation for each system is in [`docs/systems/`](docs/systems/):

| System | File | Key Concepts |
|--------|------|--------------|
| **Core Engine** | [core-engine.md](docs/systems/core-engine.md) | Game loop, EventSystem, GameState machine |
| **Combat** | [combat-system.md](docs/systems/combat-system.md) | Turn-based, initiative, formation, AI |
| **Storage** | [storage-system.md](docs/systems/storage-system.md) | IndexedDB schema, migrations, CRUD |
| **Character/Party** | [character-party-system.md](docs/systems/character-party-system.md) | Races, classes, death, rest |
| **Dungeon** | [dungeon-system.md](docs/systems/dungeon-system.md) | Maze gen, encounters, multi-party |
| **Entities** | [entity-systems.md](docs/systems/entity-systems.md) | Monsters, equipment, spells |
| **Rendering** | [rendering-system.md](docs/systems/rendering-system.md) | 3D wireframe, portraits, mini-map |
| **Audio/Text** | [audio-terminology-system.md](docs/systems/audio-terminology-system.md) | Chiptune synthesis, dual-mode text |

---

## Architecture Overview

```
Engine.js (orchestrator, 60 FPS game loop)
    ├── EventSystem.js (pub/sub for all communication)
    ├── GameState.js (state machine with transitions)
    ├── Renderer.js → Viewport3D.js (3D wireframe)
    ├── UI.js (DOM-based interface)
    ├── AudioManager.js (Web Audio synthesis)
    └── Storage.js (IndexedDB persistence)

Game Systems:
    ├── Character.js, Party.js (player entities)
    ├── Combat.js, Formation.js (battle system)
    ├── Dungeon.js (exploration, encounters)
    ├── Monster.js, Equipment.js, Spells.js (entities)
    └── DeathSystem.js, RestSystem.js (mechanics)
```

---

## Key Patterns

### 1. Event-Driven Communication

All systems communicate via events, never direct calls:

```javascript
// Emit event
this.eventSystem.emit('combat-ended', { victory: true, rewards });

// Listen
this.eventSystem.on('combat-ended', (data) => this.handleCombatEnd(data));
```

**Key events**: `game-state-change`, `player-action`, `encounter-triggered`, `combat-ended`, `character-updated`, `party-update`

### 2. Dual-Mode Terminology

Every user-facing string needs both fantasy and cyber versions:

```javascript
// In terminology.js
classic: { party: "Party", dungeon: "Dungeon" },
cyber: { party: "Strike Team", dungeon: "Corrupted Network" }

// Usage
const text = TextManager.getText('party');  // Returns mode-appropriate text

// Auto-updating HTML
<span data-text-key="party">Strike Team</span>
```

### 3. Entity Migration System

Game data (monsters, equipment, spells) loaded from migration files:

```javascript
// src/data/migrations/weapons-v1.1.0.js
window.weaponsMigration = {
    version: '1.1.0',
    data: {
        'weapon_dagger': { name: 'Dagger', cyberName: 'Blade Subroutine', ... }
    }
};

// Loaded on startup
await Storage.loadEntitiesFromJSON();
```

### 4. Shared Dungeon World

Single dungeon instance shared by all parties; per-party position tracking:

```javascript
// Shared structure
await Storage.saveDungeon(dungeon, partyId);

// Per-party position
await Storage.savePartyPosition(partyId, dungeonId, { x, y, floor, direction });
```

---

## Common Tasks

### Adding New UI Text

1. Add to both modes in `src/data/terminology.js`:
```javascript
classic: { new_term: "Fantasy Text" },
cyber: { new_term: "Cyber Text" }
```

2. Use in HTML:
```html
<span data-text-key="new_term">Fantasy Text</span>
```

3. Apply TextManager (if dynamic):
```javascript
TextManager.applyToElement(element, 'new_term');
```

### Adding New Monster

1. Add to migration file `src/data/migrations/monsters-v1.X.X.js`:
```javascript
"monster_new_001": {
    id: "monster_new_001",
    name: "New Monster",
    cyberName: "Cyber Name",
    level: 3,
    hitDie: 8,
    attacks: [{ name: "Bite", damage: { dice: 2, sides: 6 } }],
    aiType: "aggressive",
    portraitModel: { vertices: [...], edges: [...] }
}
```

### Adding New Sound Effect

In `src/audio/AudioManager.js`:
```javascript
this.soundEffects = {
    newSound: {
        freq: 440,
        duration: 0.3,
        wave: 'sine',
        volume: 0.4,
        sweep: { start: 440, end: 880 }  // Optional
    }
};

// Play
audioManager.playSoundEffect('newSound');
```

### Adding New Game State

1. Define transitions in `GameState.js`:
```javascript
this.validTransitions = {
    'new-state': ['town', 'playing'],
    'playing': [..., 'new-state']
};
```

2. Handle in `Engine.js`:
```javascript
case 'new-state':
    this.ui.showNewInterface();
    this.audioManager.fadeToTrack('new-track');
    break;
```

### Modifying Storage Schema

1. Increment `DB_VERSION` in `Storage.js`
2. Add store creation in `onupgradeneeded`
3. Create migration file if adding entity types
4. Test with existing saved data

---

## File Reference

### Core (`src/core/`)
| File | Purpose |
|------|---------|
| `Engine.js` | Main orchestrator, game loop, state routing |
| `EventSystem.js` | Pub/sub event bus |
| `GameState.js` | State machine with validated transitions |

### Game (`src/game/`)
| File | Purpose |
|------|---------|
| `Character.js` | Character entity, attributes, leveling |
| `Party.js` | Party management, membership |
| `Combat.js` | Turn-based combat engine |
| `Formation.js` | Front/back row mechanics |
| `Dungeon.js` | Maze generation, exploration |
| `Monster.js` | Monster data, AI behaviors |
| `Equipment.js` | Items, cursed items, identification |
| `Spells.js` | Spell data, casting, effects |
| `DeathSystem.js` | Death states, resurrection |
| `RestSystem.js` | Rest locations, recovery |
| `Class.js` | Class data, requirements, progression |

### Rendering (`src/rendering/`)
| File | Purpose |
|------|---------|
| `Renderer.js` | Main renderer, routes to subsystems |
| `Viewport3D.js` | 3D wireframe dungeon view |
| `MonsterPortraitRenderer.js` | 3D monster portraits with health effects |
| `MiniMapRenderer.js` | 2D fog-of-war mini-map |
| `UI.js` | DOM-based UI management |
| `CharacterUI.js` | Character creation wizard |

### Utils (`src/utils/`)
| File | Purpose |
|------|---------|
| `Storage.js` | IndexedDB wrapper, all persistence |
| `TextManager.js` | Terminology mode switching |
| `Random.js` | Dice rolling, RNG utilities |
| `Modal.js` | Modal dialog framework |

### Data (`src/data/`)
| File | Purpose |
|------|---------|
| `terminology.js` | 80+ dual-mode term mappings |
| `migrations/*.js` | Entity data (weapons, armor, spells, monsters) |

---

## Debugging

```javascript
// Access engine
window.engine

// Event debugging
window.engine.eventSystem.setDebugMode(true);
window.engine.eventSystem.getDebugInfo();

// Game state
window.engine.gameState.getDebugInfo();

// Dungeon
window.engine.dungeon.getPlayerPosition();
window.engine.dungeon.getViewingInfo();

// Storage
await Storage.getStorageInfo();
await Storage.getEntityVersionInfo();
```

---

## Critical Rules

1. **No Dependencies**: Pure vanilla JS only
2. **Dual-Mode**: All UI text needs both fantasy/cyber versions
3. **Event Communication**: Systems talk via events, not direct calls
4. **Browser Testing**: Must test in browser (Canvas, IndexedDB, Audio)
5. **Migration System**: Entity data changes require migration files
6. **Shared World**: Dungeon structure shared; party positions separate

---

## Project Stats

- ~32,000 lines JavaScript (51 files)
- ~4,500 lines CSS
- IndexedDB v7 with 14 object stores
- 80+ terminology mappings
- 5 music tracks, 19+ sound effects
- 5 races, 8 classes
- 50+ spells, 75+ equipment items, 12+ monster types

---

## Resources

- **Detailed Docs**: [`docs/systems/`](docs/systems/)
- **Test Files**: `src/game/*Test.js`
- **License**: MIT
