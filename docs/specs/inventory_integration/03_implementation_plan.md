# Implementation Plan: Inventory, Rewards, and Auto-Party Integration

This document details the exact technical implementation steps for wiring up the inventory system, combat rewards, and default party equipment.

## 1. Modify `src/core/Engine.ts`
Provide the auto-generated party with basic equipment.

### Updated Method: `generateQuickStartParty()`
After assigning the character's class and attributes, retrieve and equip default items before saving:
1. Ensure the `Equipment` system is initialized (`await this.equipment.initializeEntities()`).
2. Map classes to default gear:
   - **Fighter/Lord/Samurai**: 'Short Sword', 'Leather Armor'
   - **Thief/Ninja**: 'Dagger', 'Leather Armor'
   - **Priest/Bishop**: 'Mace', 'Leather Armor'
   - **Mage**: 'Staff'
3. For each character, create item instances using `this.equipment.createItemInstance(itemName)` and equip them using `this.equipment.equipItem(character, itemInstance)`.

## 2. Refinements in Data Models (`src/game/Character.ts` & `src/game/Party.ts`)
Add inventory arrays to both models to hold unequipped items.

### Modify `src/game/Party.ts`
- Add `this.inventory = [];` to the constructor.
- Update `getSaveData()` to include `inventory: [...this.inventory]`.
- Update `loadFromSave(saveData)` to restore `this.inventory = saveData.inventory || [];`.

### Modify `src/game/Character.ts`
- Add `this.inventory = [];` to the constructor.
- Update `getSaveData()` and `loadFromSave()` to handle the `inventory` array.

## 3. Modify `src/rendering/UI.ts`
Distribute combat loot into the new Party inventory.

### Updated Method: `applyRewardsToParty(rewards: Record<string, any>)`
Replace the `TODO: Add to party inventory` comment with logic to persist loot:
```typescript
if (rewards.loot && rewards.loot.length > 0) {
  if (!party.inventory) party.inventory = [];
  rewards.loot.forEach((item: any) => {
    this.addMessage(`Found: ${item.name}`, 'loot');
    party.inventory.push(item);
  });
  // Note: Ensure Storage.saveParty(party) is called after modifying the inventory.
}
```

## 4. Modify `src/game/InventorySystem.ts`
Replace the UI placeholder methods with functional logic.

### Updated Method: `renderInventoryItems()`
Update the data source to pull from the shared party pool:
```typescript
// Replace: const inventory = this.currentCharacter.inventory || [];
const party = this.eventSystem.engine?.party;
const inventory = party?.inventory || [];
```

### Updated Method: `equipItem(itemId: any)`
1. Locate the item in `party.inventory`.
2. Attempt to equip it using `this.equipment.equipItem(this.currentCharacter, item)`.
3. If successful, remove it from `party.inventory`.
4. If an item was previously equipped in that slot (returned via the `EquipResult`), push the old item back into `party.inventory`.
5. Call `Storage.saveCharacter()` and `Storage.saveParty()`.
6. Call `this.renderInventoryContent()` to refresh the UI.

### Updated Method: `unequipItem(slot: any)`
1. Call `this.equipment.unequipItem(this.currentCharacter, slot)`.
2. If successful, push the unequipped item into `party.inventory`.
3. Save the character and party, then re-render the UI.

### Updated Method: `dropItem(itemId: any)`
1. Locate the item in `party.inventory` and remove it using `splice()` or `filter()`.
2. Save the party and re-render the UI.

## 5. Edge Cases & Constraints
- **Deep Copying**: When moving items between arrays, ensure references are handled correctly so we don't accidentally duplicate items or create ghost references.
- **Asynchronous Saves**: `Storage.saveCharacter()` and `Storage.saveParty()` are asynchronous. Ensure they are `await`ed or properly handled so the UI doesn't fall out of sync with the database.
- **Equip Validation**: Always check `this.equipment.canUseItem()` before moving items out of the inventory; if a character cannot equip an item, it must remain in the inventory.
