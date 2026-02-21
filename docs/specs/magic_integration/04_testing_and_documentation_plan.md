# Testing & Documentation Plan: Magic Integration (Programs & Execution)

## 1. Testing Strategy

### A. Manual Verification Path

**Test 1: Spell Memorization & SP Restoration (Rest/Camp)**
1. **Pre-condition**: Have a Mage or Priest in the party. Ensure they are missing some SP or have empty spell slots.
2. **Action**: Trigger the "Camp" action in the dungeon (or visit the Inn/Guild in Town).
3. **Expected Result**: 
   - A UI modal appears prompting for Spell Preparation.
   - The UI correctly displays the number of available slots based on the character's level.
   - The player can select spells up to the limit but no further.
   - Upon confirming, the character's `memorizedSpells` array is updated, and their `currentSP` is restored to maximum.

**Test 2: Exploration Casting (Utility/Healing)**
1. **Pre-condition**: Have a Priest with "Cure Light Wounds" (or equivalent healing spell) memorized and sufficient SP. Have another party member missing some HP.
2. **Action**: Click the "Cast Spell" button on the main exploration UI.
3. **Expected Result**: 
   - A modal opens allowing the player to select the Priest, then the spell.
   - The UI prompts for a target, displaying party members.
   - Select the injured party member.
   - The spell executes, the target's HP increases, the Priest's SP decreases, and a confirmation message is added to the log.

**Test 3: Combat Casting**
1. **Pre-condition**: Engage in a combat encounter with a Mage who has an offensive spell (e.g., "Fireball") memorized and sufficient SP.
2. **Action**: Wait for the Mage's turn. Select "Cast Spell" from the combat action menu.
3. **Expected Result**: 
   - A sub-menu displays the available combat spells.
   - Select the offensive spell. The UI prompts for an enemy target (or enemy group).
   - Select the target and confirm the action.
   - When the turn resolves, the spell effect fires, dealing damage to the enemy and deducting SP from the Mage. The combat log accurately reflects the spellcast.

### B. Unit & Integration Tests
- **`src/game/MagicTest.ts`**:
  - Update or add tests verifying `Spells.canCastSpell()` returns `false` if the caster lacks SP or is silenced.
  - Assert that `Combat.resolveAction()` correctly routes `type: 'spell'` actions and applies the effects to the `target`.
  - Assert that `SpellMemorization.prepareSpells()` rejects invalid configurations (e.g., trying to memorize a spell above the character's level capabilities).

## 2. Documentation Updates

### `README.md`
- Remove "Spell System (Restore spell points after rest, integration)" from the "Outstanding Tasks" section.
- Add a bullet point to the "Key Features" section highlighting the robust dual-mode Magic/Program execution system.

### `docs/systems/combat-system.md`
- **Action Types**: Update the `Spell` subsection to reflect that the UI selection flow is fully implemented and SP is actively deducted.

### `docs/systems/core-engine.md`
- **Player Action Flow**: Update the diagram to include the branching path for `cast-spell`, demonstrating the UI modal sequence and execution resolution during exploration.
- **State Updates**: Add a note under resting/camping regarding the SP restoration and spell preparation phase.