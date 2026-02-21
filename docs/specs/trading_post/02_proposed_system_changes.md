# Proposed System Changes: Trading Post (Data Exchange)

## 1. Goal
Implement a functional merchant system accessible from the Town menu. The Trading Post will allow the active party to purchase a standard stock of basic items, sell unwanted items from their shared inventory, and pay to have unidentified items appraised. 

## 2. Core Logic Changes
- **Shop System / Merchant**: A new class (`ShopSystem` or `Merchant`) will be created to manage the Trading Post's inventory and transactions.
  - **Stock**: The shop will maintain a static list of basic, low-level items (e.g., Dagger, Short Sword, Leather Armor, Small Shield, basic potions) always available for purchase.
  - **Buying**: Purchasing an item deducts its `value` from `party.gold` and pushes a new instance of the item into `party.inventory`.
  - **Selling**: Selling an item removes it from `party.inventory` and adds gold to the party (typically 50% of the item's base `value`).
  - **Identification Service**: Unidentified items can be appraised by the merchant for a flat fee or a percentage of their true value.

## 3. Flow Changes / Architectural Adjustments
- **When [User clicks Trading Post in Town]:**
  1. `UI.ts` captures the click event and notifies `Engine.ts`.
  2. `Engine.ts` opens the Trading Post modal/interface via `UI.showTradingPost()`.
- **When [User selects 'Buy' on an item]:**
  1. The system verifies `party.gold >= item.value`.
  2. If sufficient, gold is deducted, a new item instance is generated via `Equipment.createItemInstance()`, and it is added to `party.inventory`.
  3. The UI updates the party's gold display and optionally plays a purchase sound.
- **When [User selects 'Sell' on an item]:**
  1. The system calculates the sell value (e.g., `Math.floor(item.value / 2)`).
  2. The item is removed from `party.inventory`.
  3. `party.gold` is increased by the sell value.
  4. The UI refreshes the inventory and gold displays.
- **When [User selects 'Identify' on an unappraised item]:**
  1. The system calculates the fee.
  2. If the party has enough gold, the gold is deducted.
  3. The item's true identity and stats are revealed (updating the `state` to `IDENTIFIED`).

## 4. UI Adjustments
- **Enable the Button**: Remove the `disabled` class and "COMING SOON" text from the Trading Post button in `src/rendering/UI.ts`.
- **Trading Post Modal**: Create a new modal interface consisting of a split view:
  - **Left Pane (Merchant)**: Displays the merchant's available stock and prices.
  - **Right Pane (Party)**: Displays the party's shared inventory with actions to "Sell" or "Identify".
  - **Header/Footer**: Shows the party's current Gold balance and a "Leave Shop" button.
- **Terminology Mapping**: Ensure the interface uses `TextManager` to support the Cyber Mode aesthetic (e.g., "Data Exchange", "Credits/Bits" instead of Gold, "Decrypt" instead of Identify).

## 5. Post-Action Flow / Edge Cases
- **Unidentified Item Values**: Unidentified items should sell for a fraction of their true value to encourage players to identify them first (or the merchant may refuse to buy them until identified).
- **Cursed Items**: Cursed items should either sell for 0 gold or the merchant should refuse to buy them, requiring a Temple visit first.
- **Save State**: Every transaction (buy, sell, identify) must call `Storage.saveParty(party)` to ensure economic changes are immediately persisted to IndexedDB.
