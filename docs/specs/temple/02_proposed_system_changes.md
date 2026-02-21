# Proposed System Changes: Temple (Restoration Center) Integration

## 1. Goal
Implement a functional Temple system accessible from the Town menu. The Temple will allow the active party to spend gold to heal wounds, cure diseases/poison, and attempt to resurrect dead or ashen characters using the existing `DeathSystem.ts` mechanics. 

## 2. Core Logic Changes
- **Temple Integration**: The UI will interface directly with the existing `DeathSystem.ts` (which is already imported globally in `src/main.ts` or available via `new DeathSystem()`).
  - **Service Selection**: The Temple will iterate through all characters in the active party. For each character, it will determine the appropriate service based on their status (e.g., `dead` requires `resurrection`, `ashes` requires `restoration`, `poisoned/unconscious` requires `healing`).
  - **Cost Validation**: The system will verify `party.gold >= cost` before allowing an attempt.
  - **Transaction & Outcome**: If gold is sufficient, the party's gold is deducted (full cost on success, half cost on failure as per `attemptResurrection`), and the success/failure logic from `DeathSystem` is applied. The character is then saved to IndexedDB.

## 3. Flow Changes / Architectural Adjustments
- **When [User clicks Temple in Town]:**
  1. `UI.ts` captures the click event and notifies `Engine.ts`.
  2. `Engine.ts` ensures `DeathSystem` is initialized and opens the Temple modal via `UI.showTemple()`.
- **When [User views the Temple interface]:**
  1. The modal displays a list of all party members (or potentially all characters in the roster, depending on design) and their current status.
  2. Next to each afflicted character, the specific required service, its cost, and the chance of success are displayed (calculated via `DeathSystem`).
- **When [User selects a service for a character]:**
  1. A confirmation prompt warns the player of the stakes (e.g., "Failure will turn them to ashes. Proceed?").
  2. If confirmed, gold is deducted.
  3. `deathSystem.attemptResurrection()` or `deathSystem.healCharacter()` is executed.
  4. The UI displays the dramatic result (Success: Character revives. Failure: Character turns to ash/lost).
  5. The character and party data are immediately saved to `Storage`.

## 4. UI Adjustments
- **Enable the Button**: Remove the `disabled` class and "COMING SOON" text from the Temple button in `src/rendering/UI.ts`.
- **Temple Modal**: Create a new modal interface:
  - **Header**: Shows the party's current Gold balance.
  - **Main List**: A grid/list of characters needing services. Healthy characters can be filtered out or displayed as "Healthy".
  - **Action Area**: Buttons for the specific services with clear cost indicators.
- **Terminology Mapping**: Ensure the interface uses `TextManager` to support Cyber Mode (e.g., "Med-Bay", "Data Recovery", "Corrupted", "Unrecoverable").

## 5. Post-Action Flow / Edge Cases
- **Permanent Loss**: If a character becomes `lost` (permanently dead), the UI must clearly indicate this finality and potentially offer to move them to the Memorial (which already exists in `UI.createLostAgentsContent`).
- **Insufficient Funds**: Buttons should be disabled or show clear visual feedback if the party lacks the required gold for a service.
- **Aging Effects**: `DeathSystem` applies aging penalties on resurrection. The UI should notify the player if the character ages significantly.
