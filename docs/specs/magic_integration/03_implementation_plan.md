# Implementation Plan: Magic Integration (Programs & Execution)

This document details the exact technical implementation steps for wiring up the Magic/Program system into the UI and gameplay loop.

## 1. Modify `src/core/Engine.ts`
Hook up the exploration casting action and tie memorization into the resting logic.

### Updated Method: `handlePlayerAction(action)`
Locate the `case 'cast-spell':` block. Replace the placeholder message with a call to the UI:
```typescript
case 'cast-spell':
  // Filter party for alive members that have memorized spells and > 0 SP
  const casters = this.party!.aliveMembers.filter(m => 
    m.memorizedSpells && 
    (m.memorizedSpells.arcane?.length > 0 || m.memorizedSpells.divine?.length > 0) &&
    (m.currentSP || 0) > 0
  );
  if (casters.length === 0) {
    this.ui!.addMessage('No one in the party is currently able to cast spells.');
    return;
  }
  // Open the UI modal for exploration casting
  this.ui!.showExplorationSpellCasting(casters);
  break;
```

### Updated Method: `handleCampAction()`
Before concluding the camp/rest action, call a new UI method `showSpellMemorizationInterface` to allow casters to prepare their loadout for the next run. Also ensure `currentSP` is restored to `maxSP` for all casters upon resting.

## 2. Modify `src/rendering/UI.ts`
Create the interfaces required for the player to select and target spells.

### New Method: `showExplorationSpellCasting(casters: CharacterData[])`
1. Render a modal listing the available casters.
2. Upon selecting a caster, render a list of their `memorizedSpells` filtered by `spell.combatOnly !== true`.
3. Upon selecting a spell, check its `targetType`. If it requires a target (e.g., `party_member`), render a list of valid party members.
4. Add a "Cast" button that emits an event back to `Engine.ts` (e.g., `'execute-exploration-spell'`, with payload `{ casterId, spellName, targetId }`).

### New Method: `showSpellMemorizationInterface(casters: CharacterData[])`
1. Render a modal for use during the Camp/Town phase.
2. For each caster, display their known spells and their available slots (using `Class.getSpellSlots()`).
3. Allow the user to toggle spells into their memorized lists up to the slot limit.
4. Provide a "Confirm Preparation" button that calls `SpellMemorization.prepareSpells()` and updates the character objects.

## 3. Modify `src/game/CombatInterface.ts`
Integrate casting into the turn-based combat menu.

### Updated Method: `renderActionMenu(character)`
Add a "Cast Spell" button to the primary combat menu if the character has memorized spells. Ensure `TextManager` is used to label it "Execute Program" in Cyber Mode.

### New Method: `handleSpellSelection(character)`
1. Open a sub-menu listing the character's `memorizedSpells` filtered by `spell.explorationOnly !== true`.
2. Disable any spells where `spell.spCost > character.currentSP`.
3. Upon selecting a spell, transition to a targeting phase based on the spell's `targetType` (e.g., `single_enemy`, `enemy_group`, `all_enemies`, `party_member`).
4. Once a target is selected, resolve the action choice by returning the payload:
```typescript
{
  type: 'spell',
  actorId: character.id,
  spellId: selectedSpell.name,
  targetId: selectedTarget.id
}
```

## 4. Refinements in `src/game/Combat.ts`
Ensure `resolveAction()` correctly handles the `type: 'spell'` payload by interfacing with `Spells.ts`.
1. Call `this.spellSystem.castSpell(actor, action.spellId, target)`.
2. Deduct the SP cost from the actor.
3. Parse the `CastSpellResult` to generate the correct combat log messages and apply damage/healing/status effects to the target(s).

## 5. Edge Cases & Constraints
- **SP Restoration**: Ensure `currentSP` and `maxSP` are correctly calculated based on class and level during leveling up, and fully restored during resting.
- **Dual-Mode Terminology**: Rely strictly on `TextManager.getText('spell_points')` or similar keys when rendering SP, Spells, and Arcane/Divine labels to preserve the Cyber Wizardry aesthetic.
- **Dead/Unconscious Targets**: Healing spells generally cannot target dead characters. Only specific Resurrection spells can target `status === 'dead'`. Ensure the UI filtering logic respects this.