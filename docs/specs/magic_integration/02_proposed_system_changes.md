# Proposed System Changes: Magic Integration (Programs & Execution)

## 1. Goal
Fully integrate the Magic system (Cyber: "Program Execution") into the core gameplay loop. Allow players to memorize spells while resting, cast utility/healing spells during dungeon exploration, and cast offensive/defensive spells during combat encounters. Ensure all UI elements respect the dual-mode terminology (Fantasy vs. Cyberpunk).

## 2. Auto-Generation Logic / Core Logic Changes
- **Spell Memorization (Resting/Camp):** When the party triggers a `camp` or `rest` action, the UI will present a "Spell Preparation" phase for any caster. The player can select spells up to their class/level slot limits. Upon completing the rest, Spell Points (SP) are fully restored to `maxSP`.
- **Exploration Casting:** The "Cast Spell" button on the main UI will open a modal listing all memorized spells available for out-of-combat use (e.g., `Cure Light Wounds`, `Identify`). Selecting a spell will prompt for a target (if applicable), execute `Spells.castSpell()`, and deduct SP.
- **Combat Casting:** During a player character's turn in combat, a "Cast Spell" option will be added to the combat action menu. Choosing it opens a modal of memorized combat spells. The player selects a spell, selects valid enemy/ally targets, and the action is queued as `{ type: 'spell', caster: char, spellName: '...', target: entity }`.

## 3. Flow Changes / Architectural Adjustments
- **When [Party Camps/Rests]:**
  1. `Engine.handleCampAction()` triggers.
  2. Before finishing camp, `UI.showSpellMemorizationInterface(casters)` is displayed.
  3. Player selects spells for each caster based on `Class.getSpellSlots()`.
  4. `SpellMemorization.prepareSpells()` updates the character data.
  5. `character.currentSP = character.maxSP` is applied.
  6. Party state is saved.
- **When [Cast Spell button clicked during Exploration]:**
  1. `Engine.handlePlayerAction('cast-spell')` triggers.
  2. `UI.showExplorationSpellCasting(party.casters)` is displayed.
  3. Player selects a Caster -> Spell -> Target.
  4. Engine evaluates `Spells.canCastSpell()`. If valid, deducts SP and calls `Spells.castSpell()`.
  5. UI updates party status and closes modal.
- **When [Player Turn begins in Combat]:**
  1. `CombatInterface.ts` renders action buttons including "Cast Spell" (if character is a caster).
  2. Clicking "Cast Spell" shows available combat spells and validates SP.
  3. Selecting a spell filters valid targets (e.g., only enemies for a Fireball).
  4. Action is pushed to `combat.processAction()`.

## 4. UI Adjustments
- **Spell Memorization Modal**: A new UI component to list available vs. memorized spells with drag-and-drop or simple click-to-toggle mechanics, respecting slot limits.
- **Casting Modal (Exploration)**: A streamlined modal that filters out combat-only spells and allows targeting party members.
- **Combat Action Menu**: Add the "Cast / Execute" button alongside "Attack", "Defend", "Item", "Flee".
- **Terminology & Styling**: Ensure "SP" renders as "RAM" or "Memory" in Cyber Mode. Add visual flair for casting (e.g., glowing effects, glitch text for cyber programs).

## 5. Post-Action Flow / Edge Cases
- **Insufficient SP/RAM**: Prevent spell selection or grey out options if the caster lacks the required SP.
- **Silence/Disruption Status**: Prevent casting if the character has a `cannotCastSpells` or `silenced` status condition.
- **Invalid Targets**: Ensure single-target spells cannot be cast on entire groups, and that dead characters cannot be targeted by anything other than Resurrection spells.