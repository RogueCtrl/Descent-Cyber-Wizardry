# Proposed System Changes: Party Management & Advanced Character Sheets

## 1. Goal
Complete the UI integration for character and party management. Clicking on a character portrait or "View Stats" will open the existing `AdvancedCharacterSheet.ts` interface. Clicking "Manage Party" will open a new modal allowing players to swap characters between the Active Party and the Roster, and adjust their Front/Back row formation.

## 2. Core Logic Changes
- **Advanced Character Sheet Integration**: Rather than building a new modal, `UI.ts`'s `viewCharacter(id)` will instantiate `new AdvancedCharacterSheet(this.eventSystem)` and call `.showCharacterSheet(character)`. This instantly solves the missing character stat view.
- **Party Management Modal**: A new UI interface will be created (either within `UI.ts` or as a new `PartyManagementUI.ts` class).
  - **Left Pane (Roster)**: Displays all available characters not currently in the active party.
  - **Right Pane (Active Party & Formation)**: Displays the current active party divided into two drop-zones or toggle sections: "Front Row" (Max 3) and "Back Row" (Max 3). Maximum total party size remains 4.
  - **Swapping Logic**: Clicking or dragging a character moves them between the Roster and the Active Party. Moving a character updates `party.memberIds`, `party.members`, and `character.availability`.

## 3. Flow Changes / Architectural Adjustments
- **When [User clicks a Character Card or 'View Character']:**
  1. `UI.viewCharacter(characterId)` fetches the full `Character` object from `Storage`.
  2. If the sheet instance doesn't exist, it is created.
  3. `advancedSheet.showCharacterSheet(character)` is called, taking over the screen with the detailed multi-tab interface.
- **When [User clicks 'Manage Party' in Town/Training Grounds]:**
  1. `UI.showPartyManagement()` fetches the `activeParty` and all `available` characters from `Storage`.
  2. The modal renders the Front/Back row slots and the available roster pool.
  3. The user modifies the composition. Validation ensures the total size does not exceed 4, and no row exceeds 3.
  4. Upon clicking "Confirm / Save Formation", the new composition is saved to `Storage`, and `TeamAssignmentService` ensures all orphaned agents are safely parked.

## 4. UI Adjustments
- **Remove `TODO`s**: Replace the console logs in `UI.ts` with actual modal invocations.
- **Drag and Drop / Click-to-Swap**: The Party Management UI should ideally support drag-and-drop HTML5 API for moving characters between the Roster list and the Formation slots, providing a tactile, modern experience. Alternatively, a simpler "Click to Select -> Click destination to Move" pattern is acceptable.
- **Cyber Theming**: Ensure the Party Management modal uses the `crt-overlay` and `cyber-border` CSS classes to match the rest of the Town dashboard.

## 5. Post-Action Flow / Edge Cases
- **Invalid Formations**: A party cannot enter the dungeon with 0 members. The "Confirm" button on the Party Management modal must be disabled if the active party is empty.
- **Dead Characters**: Dead or Ashen characters cannot be added to the Active Party for a dungeon run unless specifically forming a "Rescue Mission" (which is handled separately by `CharacterRoster.createRescueParty`). They should be grayed out in the Roster pane.
