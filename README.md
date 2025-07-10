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

### 🏗️ In Progress
- **Training Grounds Enhancement**: Character roster and management improvements
- **Dungeon Exploration**: Navigation and interaction systems
- **Combat System**: Turn-based battle mechanics
- **Magic System**: Spell casting and memorization
- **Party Management**: Multi-character coordination

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

</div>

## Test room
```text
  0 1 2 3 4 5 6 7 8  (x coordinates)
0 █ █ █ █ █ █ █ █ █  
1 . . . █ █ . . . █  (Room A)    (Room B)
2 . p . . . . . . █  (Room A)(corridor)(Room B)
3 . . . █ █ . . . █  (Room A)    (Room B)
4 █ █ █ █ █ █ █ █ █  
```

There is no Western wall in Room A as that is the Eastern wall of Room B due to our wrap-around mapping implementations

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

## Contributing

Currently in early development with foundational systems being established. The project has basic character creation and UI systems working. Issues and pull requests welcome as development continues.

## License

MIT License - see [LICENSE](LICENSE) file for details.