# Implementation Plan: Quick Start Flow

This document details the exact technical implementation steps for adding the quick start flow.

## 1. Modify `Engine.ts`
The core changes will reside within `src/core/Engine.ts`.

### Updated Method: `checkFirstTimePlay()`
Modify `checkFirstTimePlay()` to pass a flag indicating it is the first time play to the modal callback.
```typescript
partySetupModal.show((partyName: string) => {
  this.handlePartySetupComplete(partyName, true); // true = isFirstTimePlay
  resolve(undefined as any);
});
```

### Updated Method: `handlePartySetupComplete(partyName: string, isFirstTimePlay: boolean = false)`
Update the signature to accept the `isFirstTimePlay` flag.

```typescript
async handlePartySetupComplete(partyName: string, isFirstTimePlay: boolean = false) {
  // ... existing code to set party name and save party ...

  // Mark as played before
  localStorage.setItem('descent_has_played', 'true');

  if (isFirstTimePlay) {
    // Generate 4 characters
    await this.generateQuickStartParty();
    
    // Enter dungeon directly
    await this.enterDungeon();
    this.ui!.addMessage("Your Strike Team has been deployed directly into the network.");
  } else {
    // Original town transition logic
    this.gameState!.setState('town');
    this.ui!.addMessage("You arrive at the town near the Mad Overlord's castle.");
    this.ui!.addMessage('Visit the Training Grounds to create your party of adventurers.');
  }
}
```

### New Method: `generateQuickStartParty()`
Add a new async method to `Engine` to handle creating the characters and saving them.
This method should:
1. Use `import { Character } from '../game/Character.ts'` and `import { AttributeRoller } from '../utils/AttributeRoller.ts'`.
2. Define an array of 4 required classes: `['Fighter', 'Thief', 'Mage', 'Priest']`.
3. Loop through the array. For each:
   - Instantiate a `new Character()`.
   - Set `.name` (e.g. "Agent 1", "Agent 2", etc. or random).
   - Set `.race` (e.g., chosen randomly from `['Human', 'Elf', 'Dwarf', 'Hobbit', 'Gnome']`).
   - Set `.class` to the current class from the array.
   - Set `.attributes` using `AttributeRoller.rollAllAttributes()`.
   - Initialize specific fields (`partyId`, `availability = 'in_party'`).
   - Call `await Storage.saveCharacter(character)`.
   - Add the character's `id` to `this.party!.memberIds`.
   - Add the character to `this.party!.members` array directly.
4. Update `this.party!.memberCount` and `this.party!.aliveCount`.
5. Call `await this.party!.save()`.
6. Call `this.ui!.updatePartyDisplay(this.party)` to refresh the UI before dungeon entry.

## 2. Refinements in `PartySetupModal.ts` (Optional)
If necessary, the button text for "Begin Adventure" / "Begin Mission" could be tweaked, but it already says "Begin Adventure" (or "Begin Mission" via terminology), which fits perfectly with entering the dungeon. No drastic changes needed here.

## 3. Edge Cases
- **Duplicate Teams**: `TeamAssignmentService` doesn't need to be called manually if `Engine` properly bounds the character creation and assigns the `partyId`. `generateQuickStartParty` should manually mimic `TeamAssignmentService.assignCharacterToTeam()` logic or call it directly. Calling `TeamAssignmentService.assignCharacterToTeam(character)` is highly recommended to ensure all necessary team metrics (`teamLoyalty`, `teamAssignmentDate`) are correctly setup.
