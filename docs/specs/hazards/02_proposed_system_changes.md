# Proposed System Changes: Dungeon Hazards & Interactive Elements

## 1. Goal
Fully implement the mechanics for all dungeon hazards and interactive fountains. Introduce a proactive "Search & Disarm" (Hacking) mechanic that allows skilled characters (Thief/Ninja/Hacker) to detect and bypass traps. Ensure status effects like Poison persist and drain health over time as the party explores.

## 2. Auto-Generation Logic / Core Logic Changes
- **Persistent Poison (Malware):** When a character is afflicted with poison (from a dart or fountain), their `status` will change to `'poisoned'`. For every N steps the party takes in the dungeon, poisoned characters will take a small amount of damage. If they reach 0 HP from poison, they fall unconscious.
- **Alarm System (Security Alert):** Triggering an alarm trap will set a new `alarmSteps` counter on the `Dungeon` object (e.g., 20 steps). While `alarmSteps > 0`, the random encounter chance is tripled, and the UI will display a "SECURITY ALERT" warning.
- **Interactive Fountains (Data Pools):**
  - *Healing/Stamina*: Consume the fountain (mark as `used`) to restore HP/SP.
  - *Poison (Corrupted Data)*: Risk/reward. 30% chance to restore full HP/SP, 70% chance to inflict heavy damage and the `POISONED` status.
- **Search & Disarm (Hacking):** Using the `search` action will now check the *current and adjacent* tiles for traps. If a trap is found, the party is prompted to "Disarm/Hack" it. The success chance relies on the highest Agility/Level of a Thief or Ninja in the party. Success adds the trap to `dungeon.disarmedTraps`. Failure immediately triggers the trap.

## 3. Flow Changes / Architectural Adjustments
- **When [Party Moves (takes a step)]:**
  1. Decrement `dungeon.alarmSteps` if greater than 0.
  2. Iterate through all active party members. If `status === 'poisoned'`, apply 1-2 damage. If HP drops to 0, update status to `unconscious` and notify via UI.
- **When [Search Action is triggered]:**
  1. Engine checks adjacent tiles in `Dungeon.tiles`.
  2. If `trap_` tile is found, prompt UI: "Trap detected! Attempt to disarm? (Y/N)".
  3. If Yes, calculate `disarmChance = base(40) + ThiefLevel * 5 + AgilityBonus`. Roll percentile.
  4. If Success: mark trap coordinates in `disarmedTraps`.
  5. If Failure: call `dungeon.triggerTrap()`.
- **When [Interact Action is triggered on Fountain]:**
  1. Execute the specific fountain logic (roll for poison fountain's 30/70 split).
  2. Mark the special square as `used: true`.

## 4. UI Adjustments
- **Main Dungeon View**: Add a persistent UI indicator when `alarmSteps > 0` (e.g., flashing red borders or a "SECURITY ALERT" badge).
- **Party Status**: Characters with the `poisoned` status should have a green/glitchy hue on their HP bar in the UI.
- **Dialog Prompts**: Add a simple Y/N or "Hack / Ignore" contextual button when a trap is discovered via searching.

## 5. Post-Action Flow / Edge Cases
- **Trap Triggers on Entry**: If a party walks onto an undiscovered trap, it triggers immediately as it does currently. Searching must be done *before* stepping onto the tile.
- **Town Healing**: Returning to Town must either halt the poison step-damage or automatically offer a temple cure so characters don't die while navigating menus.
