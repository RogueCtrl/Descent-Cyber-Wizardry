# Current System Audit: New Game Flow

## 1. Overview
The current new game flow requires multiple manual steps from the user before they can enter the game loop (the dungeon/network).

**Current Flow:**
1. Game boots and `Engine.initialize()` runs.
2. The game checks `localStorage.getItem('descent_has_played')`.
3. If not played, `checkFirstTimePlay()` is called, which displays the `PartySetupModal`.
4. The user selects a game mode (Cyber/Fantasy) and inputs a Strike Team Name.
5. `PartySetupModal` completes and invokes `Engine.handlePartySetupComplete()`.
6. The new party is saved as permanent to IndexedDB via `Storage`, and marked as active.
7. The game state is set to `town`. The user is instructed to point to the "Training Grounds" to create their party.
8. The user manually creates characters via `CharacterCreator` (race, attributes, class, name).
9. Characters are added to the Strike Team.
10. The user clicks "Begin Mission" / "Enter Network" (triggering `Engine.enterDungeon()`) from the UI.

## 2. Key Components
- **`src/main.ts`**: Bootstraps the application, calling `Engine.initialize()`.
- **`src/core/Engine.ts`**: Manages initialization logic (`checkFirstTimePlay()`, `handlePartySetupComplete()`). Responsible for creating the initial Party object and changing the state to `town`.
- **`src/utils/PartySetupModal.ts`**: The UI modal for capturing the Strike Team Name and Mode preference. Calls the callback with the chosen party name.
- **`src/game/Party.ts` & `src/game/TeamAssignmentService.ts`**: Handle assigning characters to a party / strike team and managing the party state. `TeamAssignmentService` enforces that agents are always part of a team.
- **`src/game/CharacterCreator.ts`**: Manages step-by-step character creation. Currently used by the user manually in the Training Grounds.

## 3. Critical Implementation Details

### The Initial Modal Sequence
Currently, `Engine.ts` calls `partySetupModal.show(callback)` while waiting on a Promise. Once complete, it sets `descent_has_played` to `true`, saves the party, and forcefully sets the game state to `town`.

```typescript
// From Engine.ts (handlePartySetupComplete)
this.party!.name = partyName;
this.party!._isTemporary = false;
await this.party!.save();
Storage.setActiveParty(this.party!.id);

// Goes to town
this.gameState!.setState('town');
```

### Party Constraints
`Party` limits capacity to 5-6 members depending on UI setup (the screenshot shows 0/5 Squad Capacity, but the core limit might be 6). A valid party needs at least one member to survive the dungeon. In this scope, we need to create 4 characters.

### Dungeon Entry
Dungeon entry is triggered by `await this.enterDungeon()`. This function presumably checks if the party has living members.

## 4. Problem Statement
The user experiences high friction in creating characters one by one. The goal is to bypass the town & training ground steps entirely during the first run-through and jump directly into the dungeon with an auto-generated party of 4.
