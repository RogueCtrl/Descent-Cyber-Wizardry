# Proposed System Changes: Inventory, Rewards, and Auto-Party Integration

## 1. Goal
Fully integrate the game's item economy. The auto-generated starting party will be equipped with basic, class-appropriate gear to ensure early-game survivability. Combat loot will be automatically deposited into a shared Party Inventory. The player will be able to use the Inventory UI to equip, unequip, and drop items, with all changes persisting to the database.

## 2. Auto-Generation Logic / Core Logic Changes
- **Default Equipment Initialization**: When `Engine.generateQuickStartParty()` creates the 4 default agents, it will query `Equipment.ts` for basic starter gear (e.g., 'Dagger' and 'Leather Armor' for the Thief, 'Staff' for the Mage). It will then use the existing `equipItem` logic to install these items before the characters enter the dungeon.
- **Shared Party Inventory**: A new `inventory: any[] = []` property will be added to the `Party` class. This acts as a centralized pool for all unequipped items and loot, simplifying distribution compared to managing 4-6 individual character backpacks.
- **Character Inventory Fallback**: A fallback `inventory: any[] = []` property will also be added to `Character.ts` for future personal item management, though the UI will primarily draw from the Party pool for available items.

## 3. Flow Changes / Architectural Adjustments
- **When [Combat Ends with Victory]:**
  1. `Combat.ts` generates `rewards.loot`.
  2. `UI.applyRewardsToParty(rewards)` executes.
  3. The `TODO` is replaced with logic that pushes each item in `rewards.loot` into `this.engine.party.inventory`.
  4. The party state is saved to the database (`Storage.saveParty()`).
- **When [User equips an item via Inventory UI]:**
  1. `InventorySystem.equipItem(itemId)` is triggered.
  2. The item is found in the `Party.inventory` and validated against the character's class using `Equipment.canUseItem()`.
  3. The item is removed from the `Party.inventory`.
  4. Any previously equipped item in that slot is unequipped and pushed back into the `Party.inventory`.
  5. The new item is equipped to the character.
  6. Both the Character and Party states are saved, and the UI re-renders.

## 4. UI Adjustments
- The `InventorySystem.ts` modal will be updated to display items from the `Party.inventory` under the "Available Items" section when viewing a specific character's loadout.
- The placeholder methods (`equipItem`, `unequipItem`, `dropItem`) will be populated with the actual data-mutation logic described above.
- No new UI elements need to be created; the existing structural HTML in `InventorySystem.ts` is sufficient once the data binding is complete.

## 5. Post-Action Flow / Edge Cases
- **Class Restrictions**: If a player attempts to equip an item restricted from their class (e.g., a Mage trying to equip Plate Mail), the UI must catch the failure from `Equipment.equipItem` and display an error message using `TextManager` or `UI.addMessage`.
- **Unique Item IDs**: Ensure that when items are moved between the party inventory and character equipment slots, their unique instance IDs are preserved so durability and identification states are not lost.
