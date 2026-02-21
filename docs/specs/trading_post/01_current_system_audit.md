# Current System Audit: Trading Post (Data Exchange)

## 1. Overview
The town menu serves as the central hub between dungeon runs. It contains a button for the "Trading Post" (rendered as "Data Exchange" in Cyber Mode). However, this button is currently inactive, hardcoded with a "disabled" class, and displays "COMING SOON". There is no merchant or shop system in the game to allow the player to buy or sell equipment.

## 2. Key Components
- **`src/rendering/UI.ts`**: Renders the town interface. The `#trading-post-btn` is explicitly disabled (line ~508) without an event listener attached.
- **`src/game/Equipment.ts`**: Manages all items, which already possess a `value` property (representing base gold cost) and an `unidentified` state.
- **`src/game/Party.ts`**: Tracks the party's collective `gold` and maintains the newly added shared `inventory` array.

## 3. Critical Implementation Details
- **Economic Disconnect**: The party accumulates gold and loot from combat (`Combat.calculateCombatRewards`), but there is no mechanism to spend that gold or liquidate unwanted loot.
- **Identification Mechanics**: `Equipment.ts` has identification logic (`identifyItem`), but it currently relies on a character having a specific spell or skill. Without a merchant to identify items for a fee, players lacking specific classes (like Bishops) or spells are severely handicapped when dealing with unidentified loot.
- **Item Values**: Items have a static `value` property which should serve as the foundation for the economy.

## 4. Problem Statement
The RPG gameplay loop is broken because the party has no economic outlet. Unwanted loot accumulates infinitely in the shared inventory, and the party's amassed gold serves no mechanical purpose. We need a fully functional Trading Post to buy standard gear, sell excess loot, and identify unknown items for a fee, completing the core dungeon-crawling economy.
