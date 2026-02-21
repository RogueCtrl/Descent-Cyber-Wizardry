# Current System Audit: Party Management & Advanced Character Sheets

## 1. Overview
The game includes robust data models for `CharacterRoster`, `Formation`, and an extensive but dormant `AdvancedCharacterSheet` UI class. However, the player currently has no integrated UI to swap characters in and out of their active party or view detailed character statistics. The "Manage Party" button and "View Character" actions in `UI.ts` are currently dead ends with `TODO` placeholders.

## 2. Key Components
- **`src/rendering/UI.ts`**: The central UI controller.
  - `viewCharacter(characterId)`: Displays a placeholder message (line ~414).
  - `showPartyManagement()`: Displays a placeholder message (line ~422).
  - `showCharacterRoster()`: Displays a list of all created and lost characters, but lacks drag-and-drop or select-to-swap mechanics to actively modify the Strike Team.
- **`src/game/AdvancedCharacterSheet.ts`**: A fully realized 900+ line UI class designed to show a character's Overview, Attributes, Equipment, Skills, Spells, and History in a thematic "Wizardry-Tron Fusion" style. It is currently uninstantiated.
- **`src/game/Party.ts` & `src/game/Formation.ts`**: Manage the maximum size of the party (currently capped at 4) and position requirements (Front/Back Row).

## 3. Critical Implementation Details
- **Active vs Inactive Agents**: All characters must technically belong to a team (enforced by `TeamAssignmentService`), but a player needs the ability to bench an active member (changing their `availability` to `'available'` or phasing them out) and slot a new recruit into the active `Party` object before descending into the dungeon.
- **Front vs Back Row**: `Formation.ts` handles row placement logic based on character class defaults (e.g., Fighters in Front, Mages in Back), but players need manual control over this formation to optimize their combat strategy.
- **The Disconnect**: The assets and logic for these features are already built (`AdvancedCharacterSheet.ts`), they just need to be wired to the click events in `UI.ts`.

## 4. Problem Statement
Players are unable to fully engage with the RPG mechanics because they cannot view detailed stats for their agents or modify the composition of their Strike Team. If a team member dies, there is currently no way to swap in a new recruit from the Training Grounds. We need to implement the Party Management Modal and wire up the Advanced Character Sheet to resolve these two major "Outstanding Tasks" from the project requirements.
