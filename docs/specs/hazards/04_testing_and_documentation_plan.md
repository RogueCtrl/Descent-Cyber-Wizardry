# Testing & Documentation Plan: Dungeon Hazards & Interactive Elements

## 1. Testing Strategy

### A. Manual Verification Path

**Test 1: Persistent Poison (Malware)**
1. **Pre-condition**: Enter the dungeon. Modify local code temporarily or find a `poison_dart` trap / `poison_fountain`.
2. **Action**: Trigger the poison effect. Ensure the UI states the character is poisoned.
3. **Action**: Take 10 steps around the dungeon.
4. **Expected Result**: 
   - The poisoned character loses 1 HP per step.
   - If their HP reaches 0, they fall unconscious and the game alerts the player.

**Test 2: Alarm System (Security Alert)**
1. **Pre-condition**: Enter the dungeon. Find an `alarm_trap`.
2. **Action**: Step on the alarm trap.
3. **Expected Result**: 
   - A UI warning appears indicating a security alert.
   - Walk around; encounters should trigger much more frequently.
   - After 20 steps, the alarm state clears, and encounter rates return to normal.

**Test 3: Search & Disarm (Hacking)**
1. **Pre-condition**: Have a Thief in the party. Locate a trap tile but do not step on it. Stand adjacent and facing it.
2. **Action**: Press the "Search" button.
3. **Expected Result**: 
   - The UI alerts that a trap is detected and offers a "Disarm" prompt.
4. **Action**: Attempt to disarm.
5. **Expected Result**: 
   - If successful, stepping on the tile afterward does nothing (it is added to `disarmedTraps`).
   - If it fails, the trap triggers immediately, dealing its respective effect.

### B. Unit & Integration Tests
- **`src/game/DungeonTest.ts`**:
  - Add a test asserting that `alarmSteps` decrements on `movePlayer()`.
  - Add a test asserting that `checkRandomEncounter()` returns a higher probability when `alarmSteps > 0`.
- **`src/game/EngineTest.ts`** (or create one):
  - Add a test for `applyStepEffects()` ensuring that characters with `status === 'poisoned'` lose HP when the function is called.

## 2. Documentation Updates

### `README.md`
- Move "Dungeon Mechanics (Poison, Alarms, Fountains, Teleporters)" from the "Outstanding Tasks" section to the "Key Features" section under Dungeon Exploration.

### `docs/systems/dungeon-system.md`
- **Encounter System**: Update the encounter chance formula documentation to include the 3x multiplier applied during an active Alarm state.
- **Exploration State**: Document the `alarmSteps` property.
- **Movement & Navigation**: Add a section detailing "Step Effects" (how Poison and other over-time effects resolve during movement).

### `docs/systems/core-engine.md`
- **Player Action Flow**: Update the diagram/flow for `handleSearchAction` to include the new Trap Detection and Disarm loop.
