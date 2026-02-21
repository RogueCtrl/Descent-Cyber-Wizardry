# Testing & Documentation Plan: Inventory, Rewards, and Auto-Party Integration

## 1. Testing Strategy

### A. Manual Verification Path

**Test 1: Default Equipment Initialization**
1. **Pre-condition**: Clear local storage / indexedDB to simulate a first-time play. Refresh the browser.
2. **Action**: Name your Strike Team and enter the dungeon.
3. **Expected Result**: 
   - The party of 4 is generated.
   - Open the character detail sheet/inventory for each character.
   - Verify that the Fighter and Thief have a weapon and armor equipped.
   - Verify that the Mage has a Staff equipped.

**Test 2: Combat Loot Distribution**
1. **Pre-condition**: Have an active party in the dungeon.
2. **Action**: Trigger an encounter and win the combat.
3. **Expected Result**: 
   - The victory screen displays the XP, Gold, and any Loot generated.
   - Open the Inventory UI for any character.
   - Verify that the generated loot appears in the "Available Items" (Party Inventory) section.

**Test 3: Inventory Management UI**
1. **Pre-condition**: Have items in the Party Inventory.
2. **Action**: 
   - Select an item from the Available Items list and click "Equip/Install".
   - Select an equipped item and click "Unequip/Uninstall".
   - Select an item from the Available Items list and click "Drop/Delete".
3. **Expected Result**:
   - Equipping moves the item to the "Currently Equipped" section. If an item was already there, it swaps places and returns to the "Available Items" list.
   - Unequipping moves the item from "Currently Equipped" down to "Available Items".
   - Dropping removes the item permanently from the interface.
   - Refreshing the browser preserves the new equipment and inventory states.

### B. Unit & Integration Tests
- **`src/game/EquipmentTest.ts`** (If exists, or add to `CombatTest.ts`):
  - Add test case to ensure `applyRewardsToParty` properly pushes items to the `party.inventory` array.
  - Add test case to ensure `InventorySystem.equipItem` correctly swaps items between the character equipment slots and the party inventory array.

## 2. Documentation Updates

### `README.md`
- Remove the "Inventory System Integration" tasks from the "Outstanding Tasks" section.
- Update the "Key Features" section to highlight the shared party inventory and persistent loot economy.

### `AGENTS.md`
- No major changes required for AI guidelines, but future agents should be aware that `Party.inventory` is the primary source of truth for pooled unequipped items.

### `docs/systems/`
- **`docs/systems/character-party-system.md`**: Update the Party section to document the `inventory` property. Explain that unequipped items are shared collectively by the Strike Team rather than siloed in individual character backpacks.
- **`docs/systems/combat-system.md`**: Update the "Combat End" flow to explicitly state that `rewards.loot` is saved to the active `Party` object.
