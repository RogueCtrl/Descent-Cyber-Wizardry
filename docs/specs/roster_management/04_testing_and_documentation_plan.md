# Testing & Documentation Plan: Party Management & Advanced Character Sheets

## 1. Testing Strategy

### A. Manual Verification Path

**Test 1: Advanced Character Sheet Integration**
1. **Pre-condition**: Have an active party in town.
2. **Action**: Click the "View Stats" or equivalent button on a character's summary card in the Town UI.
3. **Expected Result**: 
   - The large `AdvancedCharacterSheet` modal opens.
   - All 6 tabs (Overview, Attributes, Equipment, Skills, Spells, History) are clickable and display the correct contextual data for that specific character.
   - Closing the modal returns smoothly to the Town dashboard.

**Test 2: Party Management - Swapping Members**
1. **Pre-condition**: Have a full active party of 4, and at least 1 extra character in the Roster.
2. **Action**: Click "Manage Party" in the Town or Training Grounds UI.
3. **Action**: Attempt to move a 5th character from the Roster into the Active Party pane.
4. **Expected Result**: The UI rejects the action or shows an error indicating the party is full.
5. **Action**: Move an active member back to the Roster, then move the new character into the empty slot. Click "Save Team".
6. **Expected Result**: The Town dashboard updates to reflect the new party composition.

**Test 3: Party Management - Formation Settings**
1. **Pre-condition**: Open the Party Management modal.
2. **Action**: Move all 4 characters into the "Back Row" zone.
3. **Expected Result**: The UI rejects the 4th character, enforcing the 3-character maximum per row.
4. **Action**: Arrange 2 in the Front Row and 2 in the Back Row. Save the team.
5. **Expected Result**: Entering combat in the dungeon respects the manual formation setting, placing the correct characters in the front and back lines.

### B. Unit & Integration Tests
- **`src/game/PartyTest.ts`** (If exists, or add to `ResourceManagementTest.ts`):
  - Add test asserting `party.members` correctly updates and enforces `maxSize` constraints when `TeamAssignmentService` or manual overrides are applied.
  - Verify that `Formation` respects manual row assignments and properly penalizes melee damage for back-row characters without reach weapons.

## 2. Documentation Updates

### `README.md`
- Remove the "Add character sheet modal" and "Implement party management modal" tasks from the Outstanding Tasks section.
- Add screenshots of the newly integrated Advanced Character Sheet and Party Management UI to the "Deep Party Management" section of the README.

### `docs/systems/character-party-system.md`
- **Party Management**: Document the UI flow for swapping members and how manual `Formation` settings are persisted to the database.

### `docs/systems/rendering-system.md`
- Update the documentation to reflect that `AdvancedCharacterSheet.ts` is now fully operational and handles all detailed stat views.
