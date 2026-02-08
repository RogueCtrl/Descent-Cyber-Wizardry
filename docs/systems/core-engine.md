# Core Engine System

> **Files**: `src/core/Engine.ts`, `src/core/EventSystem.ts`, `src/core/GameState.ts`
> **Total Lines**: ~2,800

## Architecture Overview

The core engine is built on three interconnected systems:

```
┌─────────────────────────────────────────────────────────────┐
│                    Engine.ts (Orchestrator)                  │
│  - Game loop (60 FPS)                                        │
│  - System initialization                                     │
│  - Event routing                                             │
│  - State machine integration                                 │
└──────────────────┬──────────────────┬───────────────────────┘
                   │                  │
        ┌──────────▼────────┐  ┌──────▼──────────────────┐
        │  EventSystem.ts   │  │  GameState.ts           │
        │  (Pub/Sub)        │  │  (State Machine)        │
        └───────────────────┘  └─────────────────────────┘
```

---

## Engine.ts

### Responsibilities
- Main game loop at 60 FPS
- Initializes all subsystems (renderer, UI, audio, storage)
- Handles state transitions
- Coordinates player input and actions
- Manages party lifecycle and dungeon exploration
- Orchestrates combat encounters

### Key Properties

```typescript
export class Engine {
  // Game Loop
  isRunning: boolean;              // Boolean - loop active
  targetFPS: number = 60;          // Target framerate
  frameInterval: number = 16.67;   // ms per frame
  lastFrameTime: number;

  // Core Systems
  gameState: GameState;            // GameState instance
  eventSystem: EventSystem;        // EventSystem instance
  renderer: Renderer;              // Renderer instance
  ui: UI;                          // UI instance
  audioManager: AudioManager;      // AudioManager instance

  // Game Objects
  party: Party;                    // Current Party
  dungeon: Dungeon;                // Current Dungeon
  player: any;                     // Player position {x, y, facing}
  combatInterface: CombatInterface; // Combat controller

  // Canvas
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}
```

### Initialization Sequence

```typescript
async initialize(): Promise<void> {
    // 1. Get canvas/context
    // 2. Create EventSystem
    // 3. Create GameState
    // 4. Create Renderer, UI, AudioManager
    // 5. Initialize Storage (IndexedDB)
    // 6. Load entity migrations
    // 7. Initialize Party
    // 8. Create Dungeon, CombatInterface
    // 9. Setup event listeners
    // 10. Start game loop
    // 11. window.engine = this
}
```

### Game Loop

```typescript
gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastFrameTime;
    if (deltaTime >= this.frameInterval) {
        this.update(deltaTime);
        this.render();
        this.lastFrameTime = currentTime;
    }
    requestAnimationFrame(this.gameLoop);
}
```

### State Change Handler

```typescript
handleStateChange(newState: GameStateName): void {
    document.body.className = `game-state-${newState}`;

    switch(newState) {
        case 'town':
            this.ui.showTownInterface();
            this.audioManager.fadeToTrack('town');
            break;
        case 'playing':
            this.initializeDungeonInterface();
            this.audioManager.fadeToTrack('dungeon');
            break;
        case 'combat':
            this.ui.showCombatInterface();
            this.audioManager.fadeToTrack('combat');
            break;
        // ... other states
    }
}
```

### Player Action Flow

```
User Input (keyboard/click)
    ↓
emit('player-action', {type, direction})
    ↓
handlePlayerAction()
    ↓
├─ 'move' → handleMovementAction() → dungeon.movePlayer()
├─ 'turn' → handleTurnAction() → dungeon.turnPlayer()
├─ 'search' → Search area
├─ 'interact' → Handle special square
└─ 'camp' → Handle camping
    ↓
updateDungeonView()
```

---

## EventSystem.ts

### Purpose
Provides pub/sub pattern for decoupled communication between all game systems.

### Singleton Pattern

```typescript
export class EventSystem {
  static _instance: EventSystem | null = null;

  static getInstance(): EventSystem {
    if (!EventSystem._instance) {
      EventSystem._instance = new EventSystem();
    }
    return EventSystem._instance;
  }
}
```

### Core Methods

```typescript
// Register persistent listener
eventSystem.on(eventName: string, callback: Function, context?: any): this;

// Register one-time listener
eventSystem.once(eventName: string, callback: Function, context?: any): this;

// Remove listener
eventSystem.off(eventName: string, callback?: Function): void;

// Fire event immediately
eventSystem.emit(eventName: string, ...args: any[]): void;

// Queue event for batch processing
eventSystem.queue(eventName: string, ...args: any[]): void;

// Process queued events
eventSystem.processQueue(): void;
```

### Advanced Features

```typescript
// Promise-based waiting
const result = await eventSystem.waitFor('combat-ended', timeout);

// Namespaced events
const combat = eventSystem.createNamespace('combat');
combat.on('started', handler);  // Actually listens to 'combat:started'

// Chain multiple events
await eventSystem.chain(['event1', asyncFn, 'event2']);
```

### Key Events

| Event | Emitter | Payload |
|-------|---------|---------|
| `game-state-change` | GameState | `{newState, oldState, data}` |
| `player-action` | Input | `{type, direction}` |
| `encounter-triggered` | Dungeon | `{encounter, x, y, floor}` |
| `combat-ended` | Combat | `{victory, rewards, casualties}` |
| `character-updated` | Various | `{character}` |
| `party-update` | Party | `{party}` |

---

## GameState.ts

### Purpose
Manages game state machine with validated transitions.

### Valid States & Transitions

```
loading   → town, playing
town      → training-grounds, dungeon, menu, playing
training-grounds → town, character-creation, playing
character-creation → training-grounds
dungeon   → playing, town
playing   → combat, menu, paused, town
combat    → playing, game-over, town
menu      → town, playing
paused    → playing, menu
game-over → town
```

### Core Methods

```typescript
export class GameState {
  constructor(eventSystem: EventSystem | null = null);

  // Transition state
  setState(newState: string, data?: Record<string, any>): boolean;

  // Query state
  getState(): string;
  isState(state: string): boolean;
  isAnyState(states: string[]): boolean;

  // Navigation
  goToPreviousState(): void;

  // Data management
  getStateData(): Record<string, any>;
  updateStateData(data: Record<string, any>): void;
}
```

### State-Specific Updates

```typescript
update(deltaTime: number): void {
    switch(this.currentState) {
        case 'playing':
            // Auto-save every 30 seconds
            break;
        case 'combat':
            // Combat timer and action delays
            break;
    }
}
```

---

## Type Definitions

Core engine types are defined in `src/types/index.ts`:

```typescript
// Game state type
export type GameStateName =
  | 'loading'
  | 'title'
  | 'town'
  | 'playing'
  | 'combat'
  | 'menu'
  | 'paused'
  | 'game-over'
  | 'training-grounds'
  | 'character-creation'
  | 'dungeon';

// Event map for type-safe event handling
export interface GameEventMap {
  'game-state-change': { newState: GameStateName; oldState: GameStateName; data: any };
  'player-action': { type: string; direction?: number; data?: any };
  'encounter-triggered': { encounter: any; x: number; y: number; floor: number };
  'combat-ended': { victory: boolean; rewards: any; casualties: any };
  'character-updated': { character: CharacterData };
  'party-update': { party: PartyData };
}
```

### Global Window Type

The `window.engine` global is defined in `global.d.ts`:

```typescript
import type { Engine } from './src/core/Engine.ts';

declare global {
    interface Window {
        engine: Engine;
    }
}
```

---

## Common Patterns

### Adding a New Game State

1. **Define transitions in GameState.ts:**
```typescript
this.validTransitions = {
    'your-state': ['target-1', 'target-2'],
    'other-state': [..., 'your-state']
};
```

2. **Handle in Engine.ts:**
```typescript
case 'your-state':
    this.ui.showYourInterface();
    this.audioManager.fadeToTrack('your-track');
    break;
```

3. **Transition:**
```typescript
this.gameState.setState('your-state', {data});
```

4. **(Optional) Add to type definition in `src/types/index.ts`:**
```typescript
export type GameStateName = ... | 'your-state';
```

### Adding a New Event

1. **Emit event:**
```typescript
this.eventSystem.emit('new-event', {payload});
```

2. **Listen in setupEventListeners():**
```typescript
this.eventSystem.on('new-event', this.handleNewEvent.bind(this));
```

3. **Create handler:**
```typescript
handleNewEvent(data: any): void {
    // Handle event
}
```

4. **(Optional) Add to GameEventMap in `src/types/index.ts`:**
```typescript
export interface GameEventMap {
  'new-event': { yourData: string };
}
```

### Adding a New Player Action

1. **Emit from input:**
```typescript
eventSystem.emit('player-action', {type: 'new-action', data});
```

2. **Handle in handlePlayerAction():**
```typescript
if (actionType === 'new-action') {
    this.handleNewAction(action);
}
```

---

## Debugging

```typescript
// Enable event debugging
window.engine.eventSystem.setDebugMode(true);

// Get event info
window.engine.eventSystem.getDebugInfo();

// Get game state info
window.engine.gameState.getDebugInfo();

// Check listeners
window.engine.eventSystem.getListenerCount('event-name');
```

---

## Key Principles

1. **Event-Driven**: Systems communicate via events, not direct calls
2. **State Machine**: All transitions validated
3. **Modular**: Single responsibility per system
4. **Decoupled**: Systems depend on EventSystem, not each other
5. **Framerate-Independent**: Uses deltaTime
6. **Type-Safe**: TypeScript strict mode with explicit types
