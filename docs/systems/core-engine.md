# Core Engine System

> **Files**: `src/core/Engine.js`, `src/core/EventSystem.js`, `src/core/GameState.js`
> **Total Lines**: ~2,800

## Architecture Overview

The core engine is built on three interconnected systems:

```
┌─────────────────────────────────────────────────────────────┐
│                    Engine.js (Orchestrator)                  │
│  - Game loop (60 FPS)                                        │
│  - System initialization                                     │
│  - Event routing                                             │
│  - State machine integration                                 │
└──────────────────┬──────────────────┬───────────────────────┘
                   │                  │
        ┌──────────▼────────┐  ┌──────▼──────────────────┐
        │  EventSystem.js   │  │  GameState.js           │
        │  (Pub/Sub)        │  │  (State Machine)        │
        └───────────────────┘  └─────────────────────────┘
```

---

## Engine.js

### Responsibilities
- Main game loop at 60 FPS
- Initializes all subsystems (renderer, UI, audio, storage)
- Handles state transitions
- Coordinates player input and actions
- Manages party lifecycle and dungeon exploration
- Orchestrates combat encounters

### Key Properties

```javascript
// Game Loop
this.isRunning              // Boolean - loop active
this.targetFPS = 60         // Target framerate
this.frameInterval = 16.67  // ms per frame

// Core Systems
this.gameState              // GameState instance
this.eventSystem            // EventSystem instance
this.renderer               // Renderer instance
this.ui                     // UI instance
this.audioManager           // AudioManager instance

// Game Objects
this.party                  // Current Party
this.dungeon                // Current Dungeon
this.player                 // Player position {x, y, facing}
this.combatInterface        // Combat controller
```

### Initialization Sequence

```javascript
async initialize() {
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

```javascript
gameLoop(currentTime) {
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

```javascript
handleStateChange(newState) {
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

## EventSystem.js

### Purpose
Provides pub/sub pattern for decoupled communication between all game systems.

### Core Methods

```javascript
// Register persistent listener
eventSystem.on('event-name', callback, context);

// Register one-time listener
eventSystem.once('event-name', callback);

// Remove listener
eventSystem.off('event-name', callback);

// Fire event immediately
eventSystem.emit('event-name', ...args);

// Queue event for batch processing
eventSystem.queue('event-name', ...args);

// Process queued events
eventSystem.processQueue();
```

### Advanced Features

```javascript
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

## GameState.js

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

```javascript
// Transition state
gameState.setState('combat', {enemyLevel: 5});

// Query state
gameState.getState();
gameState.isState('playing');
gameState.isAnyState(['town', 'playing']);

// Navigation
gameState.goToPreviousState();

// Data management
gameState.getStateData();
gameState.updateStateData({newData: true});
```

### State-Specific Updates

```javascript
update(deltaTime) {
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

## Common Patterns

### Adding a New Game State

1. **Define transitions in GameState.js:**
```javascript
this.validTransitions = {
    'your-state': ['target-1', 'target-2'],
    'other-state': [..., 'your-state']
};
```

2. **Handle in Engine.js:**
```javascript
case 'your-state':
    this.ui.showYourInterface();
    this.audioManager.fadeToTrack('your-track');
    break;
```

3. **Transition:**
```javascript
this.gameState.setState('your-state', {data});
```

### Adding a New Event

1. **Emit event:**
```javascript
this.eventSystem.emit('new-event', {payload});
```

2. **Listen in setupEventListeners():**
```javascript
this.eventSystem.on('new-event', this.handleNewEvent.bind(this));
```

3. **Create handler:**
```javascript
handleNewEvent(data) {
    // Handle event
}
```

### Adding a New Player Action

1. **Emit from input:**
```javascript
eventSystem.emit('player-action', {type: 'new-action', data});
```

2. **Handle in handlePlayerAction():**
```javascript
if (actionType === 'new-action') {
    this.handleNewAction(action);
}
```

---

## Debugging

```javascript
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
