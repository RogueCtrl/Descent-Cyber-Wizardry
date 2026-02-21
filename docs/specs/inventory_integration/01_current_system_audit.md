# Current System Audit: Inventory, Rewards, and Auto-Party Integration

## 1. Overview
The game currently streamlines the first-time user experience by automatically generating a "Strike Team" of 4 agents (Fighter, Thief, Mage, Priest) and placing them directly into the dungeon. However, these characters are initialized without any equipment ("naked"). Additionally, while the `Equipment` and `InventorySystem` foundations exist, the UI is not fully connected to the underlying data models. Finally, combat encounters generate loot, but the logic to distribute and persist this loot is incomplete.

## 2. Key Components
- **`src/core/Engine.ts`**: Contains `generateQuickStartParty()`, which initializes the 4 default agents. Currently, it assigns attributes and classes but leaves equipment slots empty.
- **`src/game/Character.ts`**: Defines the character data model. It includes an `equipment` object (weapon, armor, shield, accessory) but does not explicitly define an `inventory` array for holding unequipped items.
- **`src/game/Party.ts`**: Manages the group of characters. It currently tracks `gold` but lacks a shared `inventory` pool for party-wide loot.
- **`src/game/Equipment.ts`**: A robust system that defines items, handles equipping/unequipping logic, class restrictions, and durability.
- **`src/game/InventorySystem.ts`**: The UI controller for managing inventory. It renders items but its action methods (`equipItem`, `unequipItem`, `useItem`, `dropItem`) are currently empty placeholders.
- **`src/rendering/UI.ts`**: Contains `applyRewardsToParty()`, which distributes experience and gold after combat but leaves a `TODO` for adding generated loot to the inventory.

## 3. Critical Implementation Details
- **Equipment Logic**: `Equipment.ts` provides `equipItem(character, item)` which validates class restrictions and updates `character.equipment`.
- **Loot Generation**: `Combat.ts` successfully generates loot arrays via `calculateCombatRewards()`. This is passed to `UI.ts`'s `applyRewardsToParty()` method, but the items disappear because they are not pushed to any persistent array.
- **State Management**: Both `Character` and `Party` classes have `getSaveData` and `loadFromSave` methods. Any new properties (like an `inventory` array) must be added to these serialization methods to persist across sessions.

## 4. Problem Statement
The disconnect between the generated combat loot, the UI inventory actions, and the character/party data models prevents players from engaging with the core RPG loop of finding, equipping, and managing gear. Furthermore, deploying a "naked" starting party creates severe early-game balance issues. The inventory system must be fully wired up, starting characters must be granted basic gear, and combat rewards must be securely persisted.
