# Testing & Documentation Plan: Trading Post (Data Exchange)

## 1. Testing Strategy

### A. Manual Verification Path

**Test 1: Opening the Trading Post**
1. **Pre-condition**: Have an active party in town.
2. **Action**: Click the "Trading Post" (or "Data Exchange") button.
3. **Expected Result**: 
   - A modal interface opens displaying the Merchant's stock on the left and the Party's inventory on the right.
   - The party's current gold balance is accurately displayed at the top.

**Test 2: Buying an Item**
1. **Pre-condition**: The party has at least 100 gold.
2. **Action**: Click the "Buy" button next to a standard item (e.g., 'Dagger').
3. **Expected Result**: 
   - The gold balance decreases by the item's value.
   - A new instance of the item immediately appears in the Party's inventory pane on the right.
   - (Negative Test): Attempt to buy an item when gold is 0. The UI should block the transaction or show an "Insufficient Funds" error.

**Test 3: Selling an Item**
1. **Pre-condition**: The party has an item in their shared inventory.
2. **Action**: Click the "Sell" button next to the item in the right pane.
3. **Expected Result**: 
   - The item disappears from the inventory list.
   - The party's gold balance increases by the calculated sell value (50% of base value).
   - Refreshing the browser confirms the gold and inventory changes are saved to IndexedDB.

**Test 4: Identifying an Item**
1. **Pre-condition**: The party has an `unidentified` item in their inventory and sufficient gold to pay the fee.
2. **Action**: Click the "Identify" (or "Decrypt") button next to the item.
3. **Expected Result**: 
   - The gold balance decreases by the fee amount.
   - The item's name updates from its disguised/unidentified name to its true name.
   - The "Identify" button disappears, leaving only the "Sell" button.

### B. Unit & Integration Tests
- **`src/game/ShopSystemTest.ts`** (New File):
  - Add test asserting `buyItem()` correctly deducts gold and returns a valid item instance.
  - Add test asserting `buyItem()` returns `false` (or throws) when `party.gold` is insufficient.
  - Add test asserting `sellItem()` correctly calculates the 50% return value and removes the specific item from the array.

## 2. Documentation Updates

### `README.md`
- Remove any "Trading Post" or "Economy" related `TODO`s.
- Update the "Key Features" or "Town" section to advertise the fully functional merchant and identification system.

### `docs/systems/core-engine.md`
- **Player Action Flow**: Update the town state diagram to include transitions to the `trading-post` modal/state.

### `docs/systems/storage-system.md`
- Note that the `Party` object's `gold` and `inventory` arrays are actively mutated and saved by the new `ShopSystem`.
