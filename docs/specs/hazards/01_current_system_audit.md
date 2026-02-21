# Current System Audit: Dungeon Hazards & Interactive Elements

## 1. Overview
The dungeon currently generates a variety of interactive elements during floor creation, including traps (`pit_trap`, `poison_dart`, `teleport_trap`, `alarm_trap`) and special squares (healing/stamina/poison fountains, teleporters). While the generation and basic event routing exist, the actual consequences of these hazards are either incomplete or entirely missing. Furthermore, while the game tracks `disarmedTraps`, there is no proactive mechanism for players to search for and disarm traps before stepping on them.

## 2. Key Components
- **`src/game/Dungeon.ts`**: Handles the procedural generation of traps (`addTraps`) and special squares. Emits `trap-triggered` when a player steps on a trap tile, and tracks bypassed traps in the `disarmedTraps` Set.
- **`src/core/Engine.ts`**: Listens for the emitted events. 
  - `handleTrapTriggered()` resolves the effects. Currently, it deals raw damage for pit traps but has `TODO` comments for applying poison status or alarm effects.
  - `handleSearchAction()` allows players to search, but only returns generic secret door discoveries, ignoring traps.
  - `handleInteractAction()` delegates SPACE-bar presses to methods like `handleHealingFountain` or `handlePoisonFountain`, some of which lack full risk/reward mechanics.
- **`src/game/Character.ts` & `src/types/index.ts`**: The `POISONED` status exists in the type definitions and condition migrations but lacks an active damage-over-time (DoT) loop during dungeon exploration.

## 3. Critical Implementation Details
- **Trap Triggering**: When `movePlayer` lands on a `trap_` tile, it checks the `disarmedTraps` Set. If not present, it emits the trigger event.
- **Alarms**: The alarm trap is meant to increase encounter rates, but `checkRandomEncounter()` currently only uses a static formula based on floor level (`baseChance = 0.02 + (currentFloor * 0.005)`).
- **Poison**: Poison currently just deals flat immediate damage in `handlePoisonFountain` and doesn't persist the `POISONED` status condition onto the character sheet for ongoing effects.

## 4. Problem Statement
The dungeon lacks the promised danger and interactivity. Traps are unavoidable damage taxes because there is no "Disarm" / "Hack" mechanic. Status effects like Poison don't function as damage-over-time threats, removing the necessity for antidotes/spells. Alarms do nothing, removing the tactical tension of stealth. We need to fully realize these systems to make exploration engaging and to leverage the "Cyber" hacking themes.
