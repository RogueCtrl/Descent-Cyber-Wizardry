# Implementation Plan: Trading Post (Data Exchange)

This document details the technical implementation steps for adding the Trading Post merchant system to the town hub.

## 1. Create `src/game/ShopSystem.ts`
Implement the core transactional logic for the merchant.

### New Class: `ShopSystem`
- **Dependencies**: Imports `Equipment.ts` and `Storage.ts`.
- **Property `standardStock`**: An array of item names that are always available for purchase (e.g., `['Dagger', 'Short Sword', 'Mace', 'Staff', 'Leather Armor', 'Small Shield']`).
- **Method `getStandardInventory(equipmentSystem)`**: Maps the `standardStock` names to actual item data objects (with prices) so the UI can render them.
- **Method `buyItem(party, itemName, equipmentSystem)`**:
  - Validates `party.gold >= itemData.value`.
  - Deducts gold: `party.gold -= itemData.value`.
  - Creates instance: `const instance = await equipmentSystem.createItemInstance(itemName)`.
  - Adds to inventory: `party.inventory.push(instance)`.
  - Saves: `await Storage.saveParty(party)`.
  - Returns `{ success: true, item: instance }`.
- **Method `sellItem(party, itemIndex)`**:
  - Retrieves item from `party.inventory[itemIndex]`.
  - Calculates price: `const price = Math.floor((item.value || 0) / 2)`.
  - If item is cursed or unidentified, apply penalties or reject the sale.
  - Removes item: `party.inventory.splice(itemIndex, 1)`.
  - Adds gold: `party.gold += price`.
  - Saves party and returns success.
- **Method `identifyItem(party, itemIndex, equipmentSystem)`**:
  - Calculates identify fee (e.g., 50 gold or 10% of value).
  - Validates and deducts gold.
  - Updates item state to identified (revealing true name/stats).
  - Saves party and returns success.

## 2. Modify `src/core/Engine.ts`
Instantiate the `ShopSystem` and route town actions.

- **Initialization**: Create `this.shopSystem = new ShopSystem()` during `Engine.initialize()`.
- **Event Listener**: Add a handler for the trading post button click that calls `this.ui.showTradingPost(this.party, this.shopSystem, this.equipment)`.

## 3. Modify `src/rendering/UI.ts`
Enable the town button and build the merchant modal.

### Updated Method: `renderDefaultScreen()` (or equivalent Town render)
- Remove the `disabled` class and "COMING SOON" text from the `#trading-post-btn`.
- Attach an event listener to `#trading-post-btn` that emits `town-action: trading-post` to the Engine.

### New Method: `showTradingPost(party, shopSystem, equipmentSystem)`
- Create and append a new modal element (`.trading-post-modal`).
- Render the Merchant's stock (Left column) by iterating over `await shopSystem.getStandardInventory()`. Each row should have a "Buy" button displaying the cost.
- Render the Party's inventory (Right column). Each row should have a "Sell" button (displaying the 50% return value). If the item is unidentified, it should also have an "Identify" button displaying the fee.
- Display `party.gold` prominently in the header.

### New Method: `setupTradingPostListeners(modal, party, shopSystem, equipmentSystem)`
- **Buy Clicks**: Call `shopSystem.buyItem()`, display a success/error message (e.g., "Not enough gold!"), and re-render the modal content to update the gold balance.
- **Sell Clicks**: Call `shopSystem.sellItem()`, re-render the modal.
- **Identify Clicks**: Call `shopSystem.identifyItem()`, re-render the modal so the item's true name is revealed.
- **Close Click**: Remove the modal from the DOM.

## 4. Edge Cases & Constraints
- **Inventory Synchronization**: Ensure that when an item is sold, the exact instance is removed from the `party.inventory` array. Use unique IDs or reliable array indices to avoid selling the wrong item.
- **Terminology**: Ensure the UI uses `TextManager.getText('gold')` or equivalent so that the currency matches the current mode (Fantasy vs. Cyber).
- **Empty Inventory**: Gracefully handle the UI state when `party.inventory` is empty (display a message like "No items to sell").
