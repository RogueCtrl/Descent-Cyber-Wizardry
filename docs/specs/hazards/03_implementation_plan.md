# Implementation Plan: Dungeon Hazards & Interactive Elements

## 1. Modify `src/game/Dungeon.ts`
Implement the Alarm state and expose trap checking for the search mechanic.

### New Properties
- Add `alarmSteps: number = 0;` to track the remaining duration of an triggered alarm.
- Update `getSaveData()` and `loadFromDatabase()` to persist `alarmSteps`.

### Updated Method: `checkRandomEncounter()`
- Modify the `baseChance` calculation:
```typescript
let baseChance = 0.02 + (this.currentFloor * 0.005);
if (this.alarmSteps > 0) {
    baseChance *= 3; // 3x encounter rate during alarms
}
// Existing random roll logic...
```

### Updated Method: `movePlayer(direction)`
- Add a hook to decrement alarms:
```typescript
if (this.alarmSteps > 0) {
    this.alarmSteps--;
}
```

## 2. Modify `src/core/Engine.ts`
Implement the trap effects, fountain logic, and the new Disarm mechanic.

### Updated Method: `handleTrapTriggered(data)`
- **`poison_dart`**: Update the `TODO`. Set the target character's status to `'poisoned'`. Add a UI message: `"[Name] has been poisoned!"`.
- **`alarm_trap`**: Update the `TODO`. Set `this.dungeon.alarmSteps = 20;`. Add a UI message: `"SECURITY ALERT! Encounter rate increased!"`.

### New Method: `applyStepEffects()`
- Create a method that runs every time the player successfully moves a square.
- Iterate `this.party.aliveMembers`. If `member.status === 'poisoned'`, deduct 1 HP.
- If `member.currentHP <= 0`, set status to `'unconscious'` and emit a UI message.
- Call this method at the end of `handleMovementAction()` or `handlePlayerAction()`.

### Updated Method: `handleSearchAction()`
- Enhance the search logic to look for traps on the current and forward-facing tiles.
- If a trap is found (that isn't in `disarmedTraps`), pause execution and show a UI prompt (e.g., using a new or existing modal/button for "Attempt Disarm").

### New Method: `attemptDisarmTrap(x, y, trapType)`
- Calculate success chance based on the party's best Thief/Ninja/Agility stat.
- Roll `Random.percent(chance)`.
- If successful: add `${floor}:${x}:${y}` to `this.dungeon.disarmedTraps` and notify UI.
- If failed: explicitly call `this.dungeon.triggerTrap(trapTile)` at those coordinates.

### Updated Methods: Fountain Handlers
- Update `handlePoisonFountain(special)`:
  - Roll `Random.percent(30)`.
  - If true: Heal the interacting character fully.
  - If false: Deal damage and set `status = 'poisoned'`.
  - Mark `special.used = true` and update `this.dungeon.specialSquares`.

## 3. Modify `src/rendering/UI.ts` (or `CharacterUI.ts`)
- Add visual indicators for the Alarm state (e.g., checking `engine.dungeon.alarmSteps > 0` during the render loop or via an event listener).
- Ensure character cards display a distinct color or icon when `status === 'poisoned'`.

## 4. Edge Cases & Constraints
- Ensure `applyStepEffects()` does not trigger during combat or while in town.
- Make sure traps cannot be disarmed multiple times (check `disarmedTraps` before offering the prompt).
- Ensure that the `used` state of fountains persists properly to the `dungeon` IndexedDB save so players cannot infinitely farm the 30% heal chance.
