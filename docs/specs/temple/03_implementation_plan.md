# Implementation Plan: Temple (Restoration Center) Integration

This document details the technical implementation steps for adding the Temple UI and wiring it to the existing `DeathSystem`.

## 1. Modify `src/core/Engine.ts`
Route town actions to the new Temple UI and ensure `DeathSystem` is accessible.

- **Initialization**: Ensure `DeathSystem` is instantiated and available (e.g., `this.deathSystem = new DeathSystem()`).
- **Event Listener**: Update `setupEventListeners()` or `handlePlayerAction()` to catch the town action for the temple. Call `this.ui.showTemple(this.party, this.deathSystem)`.

## 2. Modify `src/rendering/UI.ts`
Enable the town button and build the Temple modal.

### Updated Method: `renderDefaultScreen()` (or equivalent Town render)
- Remove the `disabled` class and "COMING SOON" text from the `#temple-btn`.
- Attach an event listener to `#temple-btn` that emits the appropriate action to the Engine.

### New Method: `showTemple(party, deathSystem)`
- Create and append a new modal element (`.temple-modal`).
- Render the Party's gold balance in the header.
- Iterate over `party.members` (or potentially all characters in `Storage` if players need to revive characters not currently active, but starting with `party.members` is safer).
- For each member:
  - Check their `status` (e.g., `dead`, `ashes`, `poisoned`, `unconscious`).
  - If they need a service, determine which one:
    - `dead` -> `resurrection`
    - `ashes` -> `restoration`
    - `lost` -> `miracle` (optional, based on design)
    - `poisoned`/`unconscious` -> `healing`
  - Call `deathSystem.calculateRevivalCost(member, serviceType)` to get the price.
  - Call `deathSystem.calculateResurrectionChance(member, serviceType)` to get the success rate (for display purposes).
  - Render a row/card for the character showing their status, the service name, cost, success chance, and an action button (e.g., "Attempt Recovery").

### New Method: `setupTempleListeners(modal, party, deathSystem)`
- **Action Clicks**: When an action button is clicked:
  1. Validate `party.gold >= cost`.
  2. If sufficient, optionally show a confirmation dialog.
  3. If confirmed, call `deathSystem.attemptResurrection(member, serviceType)` (or a healing equivalent if just curing poison).
  4. Deduct the cost returned by the `attemptResurrection` result object (it returns half cost on failure).
  5. Show a dramatic UI message based on `result.success` and `result.message`.
  6. Call `Storage.saveCharacter(member)` and `Storage.saveParty(party)`.
  7. Re-render the Temple modal to update status and gold.

## 3. Refinements in `src/game/DeathSystem.ts`
Verify that `DeathSystem.ts` has a simple method for basic healing (curing poison/restoring HP) alongside its complex resurrection logic. If not, add a small helper method.

### Method Check/Addition: `attemptHealing(character)`
- If a character is `poisoned` or `unconscious`, they don't need a resurrection roll, they just need guaranteed healing for a flat fee.
- Create or update `attemptHealing(character, temple)`:
  - Deduct the `healing` service base cost.
  - Set `character.status = 'ok'`.
  - Set `character.currentHP = character.maxHP`.
  - Remove poison/disease from `character.temporaryEffects`.

## 4. Edge Cases & Constraints
- **Lost Characters**: If a character's status becomes `lost` after a failed `restoration`, ensure they are appropriately handled by the party roster logic (e.g., removed from active duty and sent to the memorial).
- **Terminology**: Use `TextManager` to label the modal and services correctly for Cyber Mode.
- **Asynchronous Saves**: Ensure `Storage.saveCharacter` and `saveParty` are `await`ed before refreshing the UI to prevent desyncs.
