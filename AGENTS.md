# Project Descent - Agent Context

> **Files**: `GEMINI.md` (this file)
> **Goal**: Provide high-level context and navigation for AI agents working on this codebase.

A browser-based Wizardry homage with dual-mode (fantasy/cyberpunk) aesthetics. TypeScript with Vite, no runtime dependencies.

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Tech** | TypeScript (strict), Vite, HTML5 Canvas, IndexedDB (v7), Web Audio API |
| **Entry** | `index.html` → `src/main.ts` (single ES module entry) |
| **Run** | `npm run dev` then visit `localhost:5173` |
| **Build** | `npm run build` (production bundle in `dist/`) |
| **Type Check** | `npx tsc --noEmit` (strict mode, zero errors) |
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
src/main.ts (ES module entry, imports all 55 modules)
    └── Engine.ts (orchestrator, 60 FPS game loop)
        ├── EventSystem.ts (pub/sub for all communication)
        ├── GameState.ts (state machine with transitions)
        ├── Renderer.ts → Viewport3D.ts (3D wireframe)
        ├── UI.ts (DOM-based interface)
        ├── AudioManager.ts (Web Audio synthesis)
        └── Storage.ts (IndexedDB persistence)

Game Systems:
    ├── Character.ts, Party.ts (player entities)
    ├── Combat.ts, Formation.ts (battle system)
    ├── Dungeon.ts (exploration, encounters)
    ├── Monster.ts, Equipment.ts, Spells.ts (entities)
    └── DeathSystem.ts, RestSystem.ts (mechanics)

Type Definitions:
    ├── src/types/index.ts (300+ lines: interfaces, union types)
    └── src/global.d.ts (window.engine declaration)
```

### TypeScript Configuration

- **`strict: true`** — full strictness enabled (strictNullChecks, strictPropertyInitialization, etc.)
- **`noImplicitAny: false`** — still using implicit `any` in many places (legacy from conversion)
- **No runtime deps** — TypeScript and Vite are dev-only dependencies
- **`window.engine`** — still used as global (~225 refs), declared in `src/global.d.ts`

### Type System (`src/types/index.ts`)

Core types already defined as union types:

```typescript
type GameStateName = 'loading' | 'title' | 'town' | 'playing' | 'combat' | ...;
type DeathState = 'alive' | 'dead' | 'ashes' | 'lost';
type CharacterStatus = 'OK' | 'DEAD' | 'ASHES' | 'POISONED' | ...;
type Direction = 0 | 1 | 2 | 3;  // N=0, E=1, S=2, W=3
type EquipmentSlot = 'weapon' | 'shield' | 'head' | 'body' | ...;
type SpellType = 'arcane' | 'divine';
type AIType = 'aggressive' | 'defensive' | 'caster' | 'support' | 'random';
```

Key interfaces: `CharacterData`, `PartyData`, `DungeonTile`, `MonsterData`, `EquipmentItem`, `SpellData`, `CombatAction`, `GameEventMap`

---

## Key Patterns

### 1. Event-Driven Communication

All systems communicate via events, never direct calls:

```typescript
// Emit event
this.eventSystem.emit('combat-ended', { victory: true, rewards });

// Listen
this.eventSystem.on('combat-ended', (data) => this.handleCombatEnd(data));
```

**Key events**: `game-state-change`, `player-action`, `encounter-triggered`, `combat-ended`, `character-updated`, `party-update`

### 2. Dual-Mode Terminology

Every user-facing string needs both fantasy and cyber versions:

```typescript
// In terminology.ts
classic: { party: "Party", dungeon: "Dungeon" },
cyber: { party: "Strike Team", dungeon: "Corrupted Network" }

// Usage
const text = TextManager.getText('party');  // Returns mode-appropriate text

// Auto-updating HTML
<span data-text-key="party">Strike Team</span>
```

### 3. Entity Migration System

Game data (monsters, equipment, spells) loaded from migration files:

```typescript
// src/data/migrations/weapons-v1.1.0.ts
export const weaponsMigrationV110 = {
    version: '1.1.0',
    data: {
        'weapon_dagger': { name: 'Dagger', cyberName: 'Blade Subroutine', ... }
    }
};

// Loaded on startup via main.ts imports
await Storage.loadEntitiesFromJSON();
```

### 4. Shared Dungeon World

Single dungeon instance shared by all parties; per-party position tracking:

```typescript
// Shared structure
await Storage.saveDungeon(dungeon, partyId);

// Per-party position
await Storage.savePartyPosition(partyId, dungeonId, { x, y, floor, direction });
```

### 5. Inventory Integration

Items are managed through a shared `Party` inventory system to pool resources, while `Character` objects track personal equipment and overflow. Both models persist their inventory states through IndexedDB, retaining unique equipment instantiations such as stats, durability, and curse states.

### 6. ES Module System

All files are ES modules imported through `src/main.ts`:

```typescript
// src/main.ts — single entry point
import { Engine } from './core/Engine.ts';
import { Storage } from './utils/Storage.ts';
// ... 50+ imports

// Legacy globals still exposed for window.engine compatibility
(window as any).Engine = Engine;
```

---

## Common Tasks

### Adding New UI Text

1. Add to both modes in `src/data/terminology.ts`:
```typescript
classic: { new_term: "Fantasy Text" },
cyber: { new_term: "Cyber Text" }
```

2. Use in HTML:
```html
<span data-text-key="new_term">Fantasy Text</span>
```

3. Apply TextManager (if dynamic):
```typescript
TextManager.applyToElement(element, 'new_term');
```

### Adding New Monster

1. Add to migration file `src/data/migrations/monsters-v1.X.X.ts`:
```typescript
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

In `src/audio/AudioManager.ts`:
```typescript
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

1. Define transitions in `GameState.ts`:
```typescript
this.validTransitions = {
    'new-state': ['town', 'playing'],
    'playing': [..., 'new-state']
};
```

2. Handle in `Engine.ts`:
```typescript
case 'new-state':
    this.ui.showNewInterface();
    this.audioManager.fadeToTrack('new-track');
    break;
```

3. (Optional) Add to `GameStateName` type in `src/types/index.ts`:
```typescript
export type GameStateName = ... | 'new-state';
```

### Modifying Storage Schema

1. Increment `DB_VERSION` in `Storage.ts`
2. Add store creation in `onupgradeneeded`
3. Create migration file if adding entity types
4. Test with existing saved data

### Adding New Types

Add interfaces/types to `src/types/index.ts`:
```typescript
export interface NewDataType {
    id: string;
    name: string;
    // ...
}
```

Import in consuming files:
```typescript
import type { NewDataType } from '../types/index.ts';
```

---

## File Reference

### Core (`src/core/`)
| File | Purpose |
|------|---------|
| `Engine.ts` | Main orchestrator, game loop, state routing |
| `EventSystem.ts` | Pub/sub event bus |
| `GameState.ts` | State machine with validated transitions |

### Game (`src/game/`)
| File | Purpose |
|------|---------|
| `Character.ts` | Character entity, attributes, leveling |
| `Party.ts` | Party management, membership |
| `Combat.ts` | Turn-based combat engine |
| `Formation.ts` | Front/back row mechanics |
| `Dungeon.ts` | Maze generation, exploration |
| `Monster.ts` | Monster data, AI behaviors |
| `Equipment.ts` | Items, cursed items, identification |
| `Spells.ts` | Spell data, casting, effects |
| `DeathSystem.ts` | Death states, resurrection |
| `RestSystem.ts` | Rest locations, recovery |
| `CharacterClass.ts` | Class data, requirements, progression |
| `Race.ts` | Race data, attribute modifiers |
| `SpellMemorization.ts` | Spell slot management |
| `TeamAssignmentService.ts` | Party composition service |
| `InventorySystem.ts` | Item management |

### Rendering (`src/rendering/`)
| File | Purpose |
|------|---------|
| `Renderer.ts` | Main renderer, routes to subsystems |
| `Viewport3D.ts` | 3D wireframe dungeon view |
| `MonsterPortraitRenderer.ts` | 3D monster portraits with health effects |
| `MiniMapRenderer.ts` | 2D fog-of-war mini-map |
| `UI.ts` | DOM-based UI management (~5,900 lines) |
| `CharacterUI.ts` | Character creation wizard |

### Utils (`src/utils/`)
| File | Purpose |
|------|---------|
| `Storage.ts` | IndexedDB wrapper, all persistence |
| `TextManager.ts` | Terminology mode switching |
| `Random.ts` | Dice rolling, RNG utilities |
| `Modal.ts` | Modal dialog framework |

### Data (`src/data/`)
| File | Purpose |
|------|---------|
| `terminology.ts` | 80+ dual-mode term mappings |
| `migrations/*.ts` | Entity data (weapons, armor, spells, monsters) |

### Types (`src/types/`)
| File | Purpose |
|------|---------|
| `index.ts` | Core interfaces and union types (400+ lines) |

### Config (root)
| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config (strict: true) |
| `vite.config.ts` | Vite bundler config |
| `package.json` | Dev dependencies (vite, typescript) |
| `src/global.d.ts` | `window.engine` type declaration |

---

## Debugging

```typescript
// Access engine (still available as global)
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

// Type checking
// Run: npx tsc --noEmit
```

---

## Critical Rules

1. **No Runtime Dependencies**: TypeScript + Vite are dev-only; no npm packages in game code
2. **Dual-Mode**: All UI text needs both fantasy/cyber versions
3. **Event Communication**: Systems talk via events, not direct calls
4. **Browser Testing**: Must test in browser (Canvas, IndexedDB, Audio)
5. **Migration System**: Entity data changes require migration files
6. **Shared World**: Dungeon structure shared; party positions separate
7. **TypeScript Strict**: `tsc --noEmit` must pass with zero errors before merging
8. **ES Modules**: All files use `import`/`export`, loaded via `src/main.ts`
9. **Prompt Files**: Always create actual `.md` files for prompts/instructions to be handed off. Do not rely on chat previews.

---

## Project Stats

- ~37,000 lines TypeScript (55 files)
- ~4,500 lines CSS
- IndexedDB v7 with 14 object stores
- 80+ terminology mappings
- 5 music tracks, 19+ sound effects
- 5 races, 8 classes
- 50+ spells, 75+ equipment items, 12+ monster types
- 400+ lines of type definitions in `src/types/index.ts`

---

## Resources

- **Detailed Docs**: [`docs/systems/`](docs/systems/)
- **Type Definitions**: [`src/types/index.ts`](src/types/index.ts)
- **Test Files**: `src/game/*Test.ts`
- **License**: MIT
