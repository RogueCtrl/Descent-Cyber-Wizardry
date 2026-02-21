# Proposed System Changes: Quick Start Flow

## 1. Goal
Streamline the first-time user experience by bypassing the manual character creation process. After naming their Strike Team, the player will be given an auto-generated party of four and placed directly into the dungeon.

## 2. Auto-Generation Logic
Instead of redirecting the user to `town` after capturing the Strike Team name in `PartySetupModal`, the engine will intercept the `handlePartySetupComplete` flow for first-time players.

**Party Composition:**
A well-balanced party of 4 is required for early survivability. The system will create:
1. Fighter (Tank/Melee)
2. Thief (Utility/Melee)
3. Mage (Magic Damage)
4. Priest (Healer)

**Character Creation Process:**
For each of the four characters, the engine will:
- Choose a predefined or randomized name.
- Assign a random race.
- Use `AttributeRoller.rollAllAttributes()` to generate stats.
- Assign the specific class (Fighter, Thief, Mage, Priest).
- Automatically assign default starting equipment if not handled by the class initialization.

## 3. Flow Changes in `Engine.ts`
When `handlePartySetupComplete(partyName)` is called:
- Check if it's the player's first run (e.g., passing a flag from `checkFirstTimePlay`).
- If it is the first run:
  1. Auto-generate the 4 characters using `CharacterCreator` or manual `Character` instantiation.
  2. Save each character using `Storage.saveCharacter()`.
  3. Add the characters to the active party and save the party.
  4. Call `this.enterDungeon()` directly.
  5. Add UI messages welcoming the user directly to the dungeon / network.
- If it is not the first run (e.g. temporary party setup), behave as normal.

## 4. UI Adjustments
The `PartySetupModal` does not need significant changes since it only collects the game mode and team name. However, the success messages shown by `UI.ts` or `Engine.ts` must be updated to reflect the new entry point (Network/Dungeon instead of Town/Training Grounds).

## 5. Post-Dungeon Flow
Once the party "jacks out" or leaves the dungeon, the existing engine logic will return them to `town`. The player will then be able to use the Training Grounds, Tavern, and other facilities normally. This requires no changes as the dungeon exit mechanic already safely routes back to town.
