# Testing & Documentation Plan: Temple (Restoration Center) Integration

## 1. Testing Strategy

### A. Manual Verification Path

**Test 1: Opening the Temple**
1. **Pre-condition**: Have an active party in town.
2. **Action**: Click the "Temple" (or "Med-Bay") button.
3. **Expected Result**: 
   - A modal interface opens displaying the party members and the current party gold.
   - Healthy characters are marked as not needing services.

**Test 2: Basic Healing (Poison/Unconscious)**
1. **Pre-condition**: Have a character with the `poisoned` or `unconscious` status and sufficient gold.
2. **Action**: Open the Temple and click "Heal" on that character.
3. **Expected Result**: 
   - Gold is deducted by the service cost.
   - The character's status returns to `ok` and HP is fully restored.
   - Poison effects are removed.
   - Refreshing the browser confirms the changes persist.

**Test 3: Resurrection (Success)**
1. **Pre-condition**: Manually edit a character's save data (or let them die in combat) so their status is `dead`. Ensure the party has at least 500 gold.
2. **Action**: Open the Temple and click "Resurrect" on the dead character.
3. **Expected Result**: 
   - A dramatic prompt appears. Confirm the action.
   - *If successful* (based on the percentage roll): The character revives, status changes to `ok`, and full cost is deducted.

**Test 4: Resurrection (Failure & Degradation)**
1. **Pre-condition**: Same as Test 3, but artificially lower the character's vitality/luck or manually force the `Random.percent` roll to fail.
2. **Action**: Attempt resurrection.
3. **Expected Result**: 
   - The attempt fails.
   - Half the gold cost is deducted.
   - The character's status worsens from `dead` to `ashes`.
   - The UI updates to reflect the new `ashes` state, and the required service changes to "Restoration" (with a higher cost and lower success chance).

### B. Unit & Integration Tests
- **`src/game/DeathSystemTest.ts`** (If exists, or add to `ResourceManagementTest.ts`):
  - Ensure the existing `testDeathSystem()` coverage is passing.
  - Verify that `attemptResurrection()` correctly handles the cost deduction logic (full on success, half on failure) that the UI will rely on.

## 2. Documentation Updates

### `README.md`
- Remove any "Temple" or "Resurrection" related `TODO`s from the Outstanding Tasks section.
- Update the "Key Features" section to highlight the high-stakes, Wizardry-style progressive death and resurrection mechanics.

### `docs/systems/core-engine.md`
- **Player Action Flow**: Update the town state diagram to include transitions to the `temple` modal/state.

### `docs/systems/character-party-system.md`
- Ensure the "Temple Services" section accurately reflects the final implemented UI flow and costs.
