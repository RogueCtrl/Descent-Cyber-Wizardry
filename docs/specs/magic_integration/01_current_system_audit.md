# Current System Audit: Magic Integration (Programs & Execution)

## 1. Overview
The current system has a robust data model for magic (`Spells.ts` and `SpellMemorization.ts`), but it is almost entirely disconnected from the active gameplay loop. Characters have defined spell slots and spell lists based on their class (Mage, Priest, Bishop, etc.), but there is no functional UI for players to memorize spells during rest or execute them during exploration/combat. The engine intercepts the `cast-spell` action and simply prints a placeholder message indicating it will be implemented in a future phase.

## 2. Key Components
- **`src/game/Spells.ts`**: Contains the full database of Arcane and Divine spells, including damage formulas, status effects, and the `castSpell()` execution method.
- **`src/game/SpellMemorization.ts`**: Handles the logic for checking class capabilities, calculating available spell slots (`Class.getSpellSlots()`), and selecting spells to memorize (`prepareSpells()`).
- **`src/game/Combat.ts`**: Has partial backend logic to resolve `type: 'spell'` actions within the combat loop (`resolveAction()`), but lacks a frontend hook for the player to intentionally select and target a spell.
- **`src/core/Engine.ts`**: Listens for the `cast-spell` action via `handlePlayerAction()`, but returns an early exit message: `"Spell casting will be implemented in Phase 5."`
- **`src/rendering/UI.ts`**: Capable of rendering spell lists on the Character Sheet, but the main game UI's "Cast Spell" button is not wired up to a spell selection modal.

## 3. Critical Implementation Details
- **Spell Slots vs. Spell Points**: The system is designed to use "Spell Points" (SP) for casting, while "Spell Slots" determine how many distinct spells a character can memorize. Currently, SP is not restored during resting, and there is no UI to manage memorization.
- **Terminology (Cyber Mode)**: The `TextManager` maps "Spells" to "Programs", "Spell Points" to "System Memory/RAM", and "Arcane/Divine" to "Offensive/Diagnostic". The UI must dynamically reflect this based on the current mode.
- **Targeting Types**: Spells have distinct targeting requirements defined in their data (e.g., `self`, `party_member`, `enemy`, `enemy_group`, `all_enemies`). The missing UI needs a way to filter valid targets based on these types.

## 4. Problem Statement
Spellcasting classes (Mage, Priest, Bishop, Samurai, Lord) are currently severely underpowered because their primary mechanic is completely inaccessible to the player. Without the ability to heal the party outside of combat, buff allies, or deal area-of-effect damage to enemies, the game relies entirely on melee and consumable items. The Magic system needs full frontend and backend wiring for Exploration, Combat, and Resting phases.