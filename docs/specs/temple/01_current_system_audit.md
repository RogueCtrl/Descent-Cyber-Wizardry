# Current System Audit: Temple (Restoration Center) Integration

## 1. Overview
The town menu features a button for the "Temple" (rendered as "Med-Bay" or "Restoration Center" in Cyber Mode). However, this button is currently inactive, hardcoded with a "disabled" class, and displays "COMING SOON". Meanwhile, the game already possesses a robust backend `DeathSystem.ts` that handles Wizardry-style progressive death states (`unconscious` -> `dead` -> `ashes` -> `lost`), but players have no UI mechanism to utilize its resurrection services or cure status ailments outside of camping/spells.

## 2. Key Components
- **`src/rendering/UI.ts`**: Renders the town interface. The `#temple-btn` is explicitly disabled (line ~533) without an event listener attached.
- **`src/game/DeathSystem.ts`**: Contains all logic for death states and resurrection services (`healing`, `resurrection`, `restoration`, `miracle`). It calculates success chances based on vitality, luck, and age, and calculates costs based on character level and service type. It also handles the consequence of failed resurrections (degrading state to `ashes` or `lost`) and applies aging penalties.
- **`src/game/Party.ts` & `src/game/Character.ts`**: The party tracks gold, and characters track their status (`dead`, `ashes`, `poisoned`, etc.) and age.

## 3. Critical Implementation Details
- **Progressive Death Mechanics**: If a character is `dead` and resurrection fails, their state degrades to `ashes`. If restoration from `ashes` fails, they become permanently `lost`. This high-stakes mechanic is a core feature of the game but is currently completely inaccessible.
- **Cost and Probability**: `DeathSystem.ts` already has perfectly functional formulas for determining how much a service costs (`calculateRevivalCost`) and the percentage chance of success (`calculateResurrectionChance`).
- **Data Persistence**: When a character is successfully resurrected or degrades to a worse state, `Storage.saveCharacter(character)` must be called to persist the outcome.

## 4. Problem Statement
The penalty of death is currently absolute because players cannot access the Temple to revive fallen party members. The intricate `DeathSystem` exists in the codebase but lies dormant. We need to build a Temple UI that interfaces with `DeathSystem.ts` to allow players to spend party gold on healing and risky resurrection attempts, thereby completing the classic dungeon-crawler risk/reward loop.
