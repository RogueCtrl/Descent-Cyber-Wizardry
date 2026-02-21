# Testing & Documentation Plan: Quick Start Flow

## 1. Testing Strategy

### A. Manual Verification Path
1. **Clear Local Storage**: Open DevTools, navigate to Application > Local Storage, and clear all entries for the app (specifically `descent_has_played` and the IndexedDB store if needed to simulate a completely fresh start).
2. **Start Game**: Reload the browser. The `PartySetupModal` should appear.
3. **Submit Form**: Enter a Strike Team name and click 'Begin Mission'.
4. **Expected Result**: 
   - The game transitions directly into the 3D Dungeon view.
   - A party of 4 characters is visible in the bottom-left party roster UI.
   - The characters should consist of a Fighter, Thief, Mage, and Priest.
   - The UI console displays welcome messages acknowledging network insertion.
5. **Jack Out**: Click the "Exit" or "Jack Out" button (since the player starts at the stairs/jack).
6. **Town Transition**: Verify the party successfully returns to town and the roster remains fully intact with the auto-generated members.

### B. Unit & Integration Tests (If applicable)
- Add a new test case in `src/game/DungeonTest.ts` or a new `EngineTest.ts` to simulate `handlePartySetupComplete` with `isFirstTimePlay = true`.
- Assert that `party.members.length === 4`.
- Assert that `party.members` contain the specific requested classes.
- Assert that `gameState.currentState === 'playing'`.

## 2. Documentation Updates

### `README.md`
- Update the "Getting Started" or "Gameplay Loop" section to note that players are immediately dropped into action upon their first playthrough with a pre-assembled team.

### `AGENTS.md`
- Mention that a default Strike Team of 4 Agents (Fighter, Thief, Mage, Priest) is assembled automatically for new commanders to expedite their first incursion.

### `docs/systems/`
- If there is a `GameFlow.md` or `Initialization.md` inside `docs/systems`, update the flowchart/description to reflect the bypassed town phase for brand new players.
- Document the new `generateQuickStartParty()` method and auto-generation mechanics in `PartySystem.md` or equivalent.
