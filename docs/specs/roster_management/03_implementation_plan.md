# Implementation Plan: Party Management & Advanced Character Sheets

This document outlines the technical implementation steps to wire up the Character Sheet and build the Party Management interface.

## 1. Integrate `AdvancedCharacterSheet` into `UI.ts`
Replace the `TODO` placeholder for viewing character details.

### Updated Method: `UI.ts -> viewCharacter(characterId)`
1. Fetch the character: `const character = await Storage.getCharacter(characterId);`
2. Instantiate the sheet (if not already done): `if (!this.advancedSheet) this.advancedSheet = new AdvancedCharacterSheet(this.eventSystem);`
3. Show it: `this.advancedSheet.showCharacterSheet(character);`
4. Ensure `AdvancedCharacterSheet` is imported at the top of `UI.ts`.

## 2. Build the Party Management Interface
Replace the `TODO` placeholder for managing the active party.

### New Method: `UI.ts -> showPartyManagement()`
1. Fetch `activeParty` and `allCharacters` from `Storage`.
2. Filter `allCharacters` to create an `availableRoster` (characters whose `status` is `ok` and who are not currently in the `activeParty`).
3. Build the HTML for the modal. It needs three main zones:
   - `<div id="roster-pool" class="drop-zone">`
   - `<div id="front-row" class="drop-zone max-3">`
   - `<div id="back-row" class="drop-zone max-3">`
4. Populate the Front/Back row zones based on the current `activeParty` members and their evaluated positions from `Formation.ts`.
5. Attach the HTML to a new `Modal` instance and display it.

### New Method: `UI.ts -> setupPartyManagementListeners()`
Implement click-to-swap or drag-and-drop logic.
- **Constraints Validation**:
  - Total characters in `front-row` + `back-row` <= `party.maxSize` (4).
  - Characters in `front-row` <= 3.
  - Characters in `back-row` <= 3.
- **Confirm Action**:
  - On clicking "Save Team":
  1. Rebuild `party.memberIds` and `party.members` arrays based on the DOM state of the Front and Back row containers.
  2. Update each character's `partyId` and `availability` (`in_party` vs `available`).
  3. Instantiate a `new Formation()` and set the specific front/back assignments. Save this to `party.formation`.
  4. Execute `await Promise.all()` on all modified characters via `Storage.saveCharacter()`.
  5. Execute `await Storage.saveParty(party)`.
  6. Close modal and call `this.showTown()` to refresh the dashboard.

## 3. Refinements in `src/game/Formation.ts`
Ensure the Formation class can accurately serialize and deserialize specific manual assignments rather than just relying on default class-based assignments.
- If `Formation.ts` does not currently save manual overrides to the database, ensure the `setFormation(frontRow, backRow)` method updates a persistent array/object on the `Party` model that is returned during `party.getSaveData()`.

## 4. Edge Cases & Constraints
- **Party Leader**: If the character designated as `party.currentLeader` is moved back to the roster, a new leader must automatically be assigned from the remaining active members.
- **Sole Survivor**: Prevent players from removing the last character from the active party, leaving it empty. The UI must enforce a minimum party size of 1.
