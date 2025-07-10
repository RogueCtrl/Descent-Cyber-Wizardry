# Descent: Cyber Wizardry

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**Built with:** Cursor + Claude Code | **Models:** Claude 4.0 Sonnet

A modern browser-based homage to the classic dungeon crawler Wizardry, reimagined with a cyberpunk aesthetic. Currently in early development with foundational systems being built.

## Current Development Status

🚧 **Early Development** - Core foundation systems are in place with character creation and basic game structure implemented.

### ✅ Implemented Features
- **Character Creation System**: Complete with race and class selection
- **Core Game Engine**: Event system, game state management, and rendering foundation
- **UI Framework**: Modal dialogs, character interfaces, and game menus
- **Storage System**: Character persistence and game state management
- **Cyberpunk Aesthetic**: Terminal-inspired interface with retro-modern styling
- **3D Wireframe Viewport**: Basic dungeon rendering system
- **Combat System**: Full party vs party turn-based battles with unconscious/death mechanics
- **Retro Chiptune Audio**: Dynamic background music system with Web Audio API synthesis
- **Dungeon Encounters**: Fixed boss placement and deterministic encounter triggering

### 🏗️ In Progress
- **Magic System**: Spell casting and memorization mechanics
- **Equipment System**: Weapon and armor management beyond unarmed combat
- **Advanced Dungeon Features**: More encounter types, traps, and exploration mechanics
- **Party Formation**: Strategic positioning and formation-based combat bonuses

## Screenshots

### Character Creation Flow
<div align="center">

**Town Menu**
![Town Menu](assets/readme/town-menu.jpg)

**Race Selection**
![Character Creation - Race Selection](assets/readme/cc-race.jpg)

**Class Selection**
![Character Creation - Class Selection](assets/readme/cc-class.jpg)

**Character Confirmation**
![Character Creation - Confirmation](assets/readme/cc-confirmation.jpg)

**Character Roster**
![Character Roster](assets/readme/character-roster.jpg)

**Character Detail**
![Character Detail](assets/readme/character-detail.jpg)

**Dungeon Interface**
![Dungeon Interface](assets/readme/dungeon-preview.jpg)

**Encounters & Combat**
![Combat](assets/readme/combat.jpg)

**Post Combat**
![Party Wipe](assets/readme/combat-partywipe.jpg)

</div>

## Test Room & Combat System

### Training Grounds Layout
```text
  0 1 2 3 4 5 6 7 8  (x coordinates)
0 █ █ █ █ █ █ █ █ █  
1 . . . █ █ . . . █  (Room A)    (Room B)
2 . p . . O . . . █  (Room A)(corridor)(Room B)
3 . . . █ █ . . . █  (Room A)    (Room B)
4 █ █ █ █ █ █ █ █ █  

p = player start position (1,2)
O = fixed Ogre encounter at (4,2)
```

### First Doomed Exploration
Players my experience the new encounter, combat, and death system in the test room

### Combat Features
- **Party vs Party**: Authentic multi-wave encounter system supporting sequential enemy groups
- **Turn-based Initiative**: Proper Wizardry-style turn order with unconscious character handling
- **Real-time UI Updates**: Character health and status update dynamically during combat
- **Dramatic Combat Log**: Color-coded messages with emojis and flavor text for all actions

## Planned Features

- **Classic Dungeon Crawling**: First-person 3D wireframe exploration
- **Rich Character System**:
  - 5 Playable Races: Human, Elf, Dwarf, Hobbit, Gnome
  - 8 Character Classes: Fighter, Mage, Priest, Thief + 4 Elite Classes
  - Authentic attribute system with racial modifiers
- **Party Management**: Form and lead a party of up to 6 adventurers
- **Turn-Based Combat**: Strategic battles with classic RPG mechanics
- **Retro-Modern Interface**: Cyberpunk-themed UI with terminal aesthetics

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No additional installation or dependencies required

## Development

The project uses vanilla JavaScript and HTML5 Canvas for rendering, with a focus on modularity and maintainability. Early development stage with foundational architecture established.

### Project Structure
```
src/
  ├── core/      # Game engine and state management
  ├── rendering/ # Canvas and UI systems
  ├── game/      # Game logic and mechanics
  ├── utils/     # Helper functions and utilities
  └── data/      # Game data and migrations
```

### Key Systems
- **Engine.js**: Core game loop and initialization
- **GameState.js**: State management and persistence
- **EventSystem.js**: Event handling and communication
- **UI.js**: Interface components and modal systems
- **Storage.js**: Data persistence and character management
- **Combat.js**: Turn-based battle system with party vs party mechanics
- **AudioManager.js**: Retro chiptune music synthesis and dynamic soundtrack
- **CombatInterface.js**: Combat UI and player action processing

## Contributing

Currently in early development with foundational systems being established. The project now features working combat encounters, dynamic chiptune audio, and a working "first doomed exploration" experience in the training grounds. While playable, many RPG systems still need implementation. Issues and pull requests welcome as development continues.

**Current State**: You can create characters, enter the training grounds, face the Ogre in glorious unarmed combat, and experience either victory or a dramatic party wipe with appropriate musical accompaniment. It's rough around the edges but captures the authentic Wizardry feel of sending hapless adventurers to their doom!

## License

MIT License - see [LICENSE](LICENSE) file for details.