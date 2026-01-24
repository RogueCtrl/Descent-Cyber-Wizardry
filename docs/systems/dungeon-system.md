# Dungeon System

> **Files**: `src/game/Dungeon.js`
> **Total Lines**: ~1,500

## Overview

Persistent shared dungeon world with multi-party support, authentic Wizardry-style exploration, and event-driven encounter system.

---

## Dungeon Structure

### Configuration
```javascript
maxFloors: 10
currentFloor: 1  // 1-indexed

// Floor dimensions
testMode: 9×5 tiles
procedural: 20×20 tiles
```

### Tile Types

| Tile | Walkable | Description |
|------|----------|-------------|
| `wall` | No | Solid barrier |
| `floor` | Yes | Traversable |
| `door` | No | Closed door |
| `open_door` | Yes | Open door |
| `hidden_door` | Yes | Secret, appears as wall |
| `secret_passage` | Yes | Hidden passage |
| `exit` | Yes | Floor exit |
| `treasure` | Yes | Treasure chest |
| `trap_*` | Yes | Various traps |
| `stairs_up/down` | Yes | Floor transitions |

### Floor Data Structure
```javascript
{
    number: floorNumber,
    width: 20,
    height: 20,
    tiles: [][], // 2D array of tile types
    monsters: [],
    treasures: [],
    encounters: [],
    specialSquares: [],
    stairs: { up: {x,y}, down: {x,y} }
}
```

---

## Maze Generation

### Algorithm: `generateWizardryMaze()`

1. **Room Generation**: 3-6 tile rooms randomly placed
2. **Corridor Carving**: Primary horizontal/vertical corridors
3. **Room Connection**: Paths connecting rooms to corridors
4. **Maze Passages**: Additional random passages
5. **Secret Features**: Hidden doors and passages
6. **Traps**: Random trap placement
7. **Validation**: Ensure ≥30% walkable area

### Difficulty Scaling by Floor

```javascript
complexity = min(0.3 + (floor * 0.05), 0.8)   // 30%-80%
roomChance = max(0.4 - (floor * 0.02), 0.2)   // 40%-20%
secretChance = min(0.05 + (floor * 0.01), 0.15) // 5%-15%
trapChance = min(0.03 + (floor * 0.02), 0.12)   // 3%-12%
```

### Test Mode Layout
```
Room A (West)     Corridor     Room B (East)
┌─────────┐      ┌───┬───┐    ┌─────────┐
│ (0,1)   │      │   │ D │    │   (5,1) │
│ to      ├──────┤ O ├───┼────┤   to    │
│ (2,3)   │      │   │   │    │   (7,3) │
└─────────┘      └───┴───┘    └─────────┘
              Boss at (4,2)
              Player starts (1,2)
              Treasure at (6,2)
```

---

## Movement & Navigation

### Position Tracking
```javascript
{
    x: number,
    y: number,
    direction: 0|1|2|3,  // 0=N, 1=E, 2=S, 3=W
    floor: number
}
```

### Movement Methods
```javascript
dungeon.movePlayer('forward');   // Move in facing direction
dungeon.movePlayer('backward');  // Move opposite direction
dungeon.turnPlayer('left');      // Rotate counter-clockwise
dungeon.turnPlayer('right');     // Rotate clockwise
```

### Direction Vectors
| Direction | Δx | Δy |
|-----------|----|----|
| North (0) | 0 | -1 |
| East (1) | +1 | 0 |
| South (2) | 0 | +1 |
| West (3) | -1 | 0 |

### Wrap-Around Mechanics
```javascript
newX = ((newX % width) + width) % width;
newY = ((newY % height) + height) % height;
// Walk off edge → appear on opposite edge
```

---

## Encounter System

### Encounter Structure
```javascript
{
    x: number,
    y: number,
    level: number,
    triggered: boolean,
    type: 'normal' | 'boss',
    monsterId: string,
    monster: MonsterObject,
    message: string
}
```

### Encounter Triggering
```javascript
// Check on every move
checkRandomEncounter() {
    // 1. Check fixed encounter at position
    // 2. If none, calculate random chance:
    baseChance = 0.02 + (currentFloor * 0.005)
    // Floor 1: 2.5%, Floor 10: 7.5%

    // 3. If triggered, find encounter within ±1 tile
    // 4. Emit 'encounter-triggered' event
}
```

### Marking Defeated
```javascript
dungeon.markEncounterDefeated(x, y, floor);
// Sets encounter.triggered = true
// Persists across all parties
```

---

## Special Squares

### Types
| Type | Effect |
|------|--------|
| `healing_fountain` | Restore HP (one-time) |
| `stamina_fountain` | Restore SP (one-time) |
| `poison_fountain` | 30% heal, 70% damage |
| `teleporter` | Random location (reusable) |
| `message_square` | Display text |
| `treasure_chest` | Loot container |

### Interaction Flow
```
Player moves → checkPositionEvents()
    ├─ Treasure tile → emit('treasure-tile-entered')
    ├─ Exit tile → emit('exit-tile-entered')
    ├─ Trap tile → emit('trap-triggered')
    └─ Special square → emit('special-square-found')
```

---

## Multi-Party Shared World

### Architecture

**Shared (dungeons store)**:
- Floor structure and tiles
- Defeated encounters
- Discovered secrets (tile changes)

**Per-Party (party_positions store)**:
- Position (x, y, floor, direction)
- Exploration state (fog of war)
- Personal progress (disarmed traps, used specials)

### Save/Load Flow
```javascript
// Save
await Storage.saveDungeon(dungeon, partyId);      // Shared
await Storage.savePartyPosition(partyId, 'corrupted_network', position);

// Load
const dungeon = await Storage.loadDungeon('corrupted_network');
const position = await Storage.loadPartyPosition(partyId);
```

### Multi-Party Behavior
- Party A defeats encounter → saved to dungeon
- Party B loads dungeon → sees defeated encounter
- Both parties see same map layout
- Each maintains independent position

---

## Exploration State

### Tracked Data
```javascript
exploredTiles = new Set()       // "floor:x:y"
discoveredSecrets = new Set()   // "floor:x:y:type"
disarmedTraps = new Set()       // "floor:x:y"
usedSpecials = new Set()        // "floor:x:y"
```

### Fog of War
```javascript
markExplored(centerX, centerY, radius = 4) {
    // Mark tiles within radius that have line of sight
    for each tile in radius {
        if (hasLineOfSight(player, tile)) {
            exploredTiles.add(`${floor}:${x}:${y}`);
        }
    }
}
```

### Line of Sight
```javascript
hasLineOfSight(x0, y0, x1, y1) {
    // Bresenham's line algorithm
    // Returns false if line intersects: wall, door, hidden_door
}
```

---

## Events

| Event | Data | Handler |
|-------|------|---------|
| `encounter-triggered` | `{encounter, x, y, floor}` | Engine.handleEncounterTriggered() |
| `trap-triggered` | `{type, x, y, floor}` | Engine.handleTrapTriggered() |
| `special-square-found` | `{special, x, y, floor}` | Engine.handleSpecialSquareFound() |
| `exit-tile-entered` | `{x, y, floor}` | UI.showExitButton() |
| `treasure-tile-entered` | `{x, y, floor, treasureKey}` | UI.showTreasureButton() |

---

## Adding New Features

### New Tile Type

1. **Add to walkable list**:
```javascript
const walkableTiles = [..., 'new_tile'];
```

2. **Add placement logic**:
```javascript
// In generateWizardryMaze()
if (Random.percent(chance)) {
    tiles[y][x] = 'new_tile';
}
```

3. **Handle interaction**:
```javascript
// In checkPositionEvents()
if (tile === 'new_tile') {
    emit('new-tile-triggered', {x, y, floor});
}
```

### New Trap Type

1. **Define trap**:
```javascript
const trapTypes = [..., 'petrification_trap'];
```

2. **Add handler**:
```javascript
case 'petrification_trap':
    // Apply petrification to random member
    break;
```

### New Monster Placement

```javascript
// Fixed boss
encounters.push({
    x: 10, y: 10,
    level: 8,
    type: 'boss',
    monsterId: 'monster_dragon_001',
    message: 'A dragon appears!'
});
```

### Modify Encounter Rate

```javascript
// In checkRandomEncounter()
const baseChance = 0.04 + (floor * 0.01);  // Double rate
```

---

## Debugging

```javascript
// Get dungeon state
window.engine.dungeon

// Get position
window.engine.dungeon.getPlayerPosition()

// Get viewing info (for 3D)
window.engine.dungeon.getViewingInfo()

// Get floor info
window.engine.dungeon.getCurrentFloorInfo()

// Manual encounter check
window.engine.dungeon.checkRandomEncounter()

// Search for secrets
window.engine.dungeon.searchArea()

// Get tile
window.engine.dungeon.getTile(x, y)

// Check walkable
window.engine.dungeon.isWalkable(x, y)
```

---

## Floor Navigation

```javascript
// Change floor
dungeon.changeFloor('down');  // Descend
dungeon.changeFloor('up');    // Ascend

// Validates player is on stairs
// Initializes new floor if needed
// Positions player at corresponding stairs
```
