# CLAUDE.MD - Descent: Cyber Wizardry Project Documentation

## Project Overview

**Descent: Cyber Wizardry** is a modern browser-based homage to the classic dungeon crawler Wizardry, featuring a unique dual-mode system that switches between classic fantasy and cyberpunk aesthetics. Built entirely with vanilla JavaScript, HTML5, and CSS3, this project demonstrates advanced web game development without external dependencies.

### Key Features
- **Dual-Mode System**: Seamlessly toggle between classic fantasy (Wizardry) and cyberpunk (Tron) terminology and aesthetics
- **Browser-Based**: Runs entirely in the browser using modern Web APIs (Canvas, IndexedDB, Web Audio API)
- **No Dependencies**: Pure vanilla JavaScript implementation - no frameworks or libraries
- **Persistent World**: Shared dungeon world with IndexedDB storage supporting multiple parties
- **3D Wireframe Graphics**: Authentic retro rendering with wireframe monster portraits
- **Dynamic Audio**: Procedurally generated chiptune music and sound effects

## Tech Stack

- **HTML5** - Structure and Canvas rendering
- **CSS3** - Styling with cyberpunk/fantasy dual themes
- **JavaScript (Vanilla)** - All game logic and systems
- **IndexedDB** - Persistent storage (v6 schema)
- **Web Audio API** - Music and sound synthesis
- **Canvas API** - 3D wireframe rendering

## Project Structure

```
Descent-Cyber-Wizardry/
├── index.html                 # Main entry point
├── README.md                  # User-facing documentation
├── CLAUDE.MD                  # This file - AI assistant context
├── LICENSE                    # MIT License
├── .gitignore                 # Git ignore rules
│
├── src/                       # Source code (51 files, ~32,000 lines)
│   ├── core/                  # Core engine systems
│   │   ├── Engine.js          # Main game loop and coordination (2,706 lines)
│   │   ├── EventSystem.js     # Event pub/sub system
│   │   └── GameState.js       # Central state management
│   │
│   ├── game/                  # Game logic (24 files)
│   │   ├── Character.js       # Character data and mechanics
│   │   ├── Party.js           # Party lifecycle management
│   │   ├── Combat.js          # Turn-based combat system
│   │   ├── Dungeon.js         # Maze generation and exploration
│   │   ├── Monster.js         # Monster AI and behaviors
│   │   ├── Equipment.js       # Item and equipment system
│   │   ├── Spells.js          # Magic system with 50+ spells
│   │   ├── Formation.js       # Party formation system
│   │   ├── DeathSystem.js     # Character death mechanics
│   │   └── RestSystem.js      # Rest and recovery
│   │
│   ├── data/                  # Game data and migrations
│   │   ├── terminology.js     # Dual-mode terminology mappings (80+ terms)
│   │   └── migrations/        # Entity data migrations (11 files)
│   │
│   ├── rendering/             # Rendering systems
│   │   ├── Renderer.js        # Main renderer
│   │   ├── Viewport3D.js      # 3D wireframe viewport
│   │   ├── MonsterPortraitRenderer.js  # 3D monster portraits
│   │   ├── CharacterUI.js     # Character display
│   │   └── UI.js              # UI management
│   │
│   ├── utils/                 # Utility systems
│   │   ├── Storage.js         # IndexedDB wrapper (v6 schema, 4,869 lines)
│   │   ├── TextManager.js     # Terminology switching
│   │   ├── Helpers.js         # Helper functions
│   │   ├── Random.js          # RNG utilities
│   │   ├── Modal.js           # Modal dialogs
│   │   └── PartySetupModal.js # Party setup UI
│   │
│   └── audio/                 # Audio system
│       └── AudioManager.js    # Music and sound synthesis
│
├── styles/                    # Styling
│   └── main.css              # All styles (4,531 lines)
│
├── assets/                    # Assets
│   └── readme/               # Documentation screenshots
│
└── .github/                  # GitHub configuration
    └── workflows/
        ├── claude.yml        # Claude Code integration
        └── claude-code-review.yml  # Code review workflow
```

## Architecture & Design Patterns

### Core Systems

1. **Event-Driven Architecture**
   - `EventSystem.js` provides pub/sub pattern for decoupled communication
   - All major systems communicate through events
   - UI updates are event-driven

2. **Entity-Based Data System**
   - `Storage.js` manages IndexedDB with migration support
   - Version 6 schema with entity-based architecture
   - Supports: characters, parties, dungeons, loot, encounters

3. **Dual-Terminology System**
   - `terminology.js` maps 80+ terms between classic/cyber modes
   - `TextManager.js` handles real-time terminology switching
   - Affects all UI, combat text, and game messaging

4. **Modular Game Engine**
   - `Engine.js` orchestrates all subsystems
   - Manages game loop at 60 FPS
   - Handles state transitions and module coordination

### Key Gameplay Systems

1. **Character System**
   - 5 Races: Human, Elf, Dwarf, Hobbit, Gnome
   - 8 Classes: Fighter, Mage, Priest, Thief, Bishop, Samurai, Lord, Ninja
   - Attribute rolling with race modifiers
   - Equipment and inventory management
   - Death and recovery mechanics

2. **Party System**
   - Party lifecycle management with naming
   - Multi-party support in shared world
   - Temporary party handling
   - Party switching and persistence

3. **Combat System**
   - Turn-based party vs monster encounters
   - Formation system (front/back rows)
   - Spell casting with memorization
   - Health-based visual effects
   - Dual terminology ("Combat" ↔ "Grid Engagement")

4. **Dungeon System**
   - Persistent shared dungeon world
   - Multiple parties can explore same instance
   - Treasure chest generation
   - Random encounter system
   - Position-based tracking

5. **3D Rendering**
   - Wireframe viewport rendering
   - Five 3D monster portrait models
   - Cyberpunk visual effects
   - Health-based animation states

6. **Audio System**
   - Procedurally generated chiptune music
   - 12+ sound effects
   - Contextual audio triggers
   - Web Audio API synthesis

## Game Content

### Characters
- **5 Races** with unique stat modifiers
- **8 Classes** with different abilities
- **Attribute System**: Strength, IQ, Piety, Vitality, Agility, Luck
- **Alignment**: Good, Neutral, Evil

### Magic
- **50+ Spells** across 7 levels
- **Spell Schools**: Mage spells, Priest spells
- **Memorization System**: Rest to memorize spells
- **Dual Names**: e.g., "Fireball" ↔ "Thermal Cascade Program"

### Equipment
- **75+ Items** with dual terminology
- **Types**: Weapons, Armor, Shields, Accessories
- **Properties**: Damage, AC, special effects
- **Example**: "Dagger" ↔ "Blade Subroutine"

### Monsters
- **12+ Monster Types** with AI behaviors
- **3D Models**: 5 wireframe portraits
- **Cyber Classifications**: Displayed as digital entities in cyber mode
- **Encounter System**: Random and fixed encounters

### Dungeons
- **Training Grounds**: Test environment (9x5 grid)
- **Fixed Encounters**: Ogre at specific location
- **Treasure Chests**: Random loot generation
- **Shared World**: Multi-party persistence

## Current Development Status

### ✅ Completed Features
- Party Lifecycle Management (complete with naming, multi-party support)
- Dual-Mode System (80+ term mappings)
- Character Creation (full workflow)
- 3D Monster Portraits (5 wireframe models)
- Combat System (turn-based with Grid Engagement)
- Persistent Dungeons (shared world with IndexedDB v6)
- Audio System (dynamic chiptune + SFX)
- Advanced RPG Mechanics (death, rest, spell memorization, equipment)

### 🔄 In Development (75% Complete)
- Wizardry-Tron Fusion Completion
- Advanced Treasure Mechanics (chest types, traps)
- Rescue Party System (multi-party interactions)

### 🎯 Future Enhancements
- Additional dungeon levels
- More monster varieties
- Enhanced AI behaviors
- Extended equipment system
- Advanced magic mechanics

## Storage Schema (v6)

The game uses IndexedDB with the following stores:

1. **characters** - Character entities with full stats
2. **parties** - Party definitions and composition
3. **dungeonState** - Persistent dungeon world state
4. **loot** - Treasure chest contents
5. **encounters** - Monster encounter tracking
6. **gameSettings** - Global game settings (mode, audio, etc.)

## Development Guidelines

### Code Style
- Use ES6+ features (classes, arrow functions, async/await)
- Modular design with single responsibility
- Event-driven communication between systems
- Comprehensive error handling
- Detailed console logging for debugging

### File Organization
- Core systems in `src/core/`
- Game logic in `src/game/`
- Rendering in `src/rendering/`
- Utilities in `src/utils/`
- Data and migrations in `src/data/`

### Event System Usage
```javascript
// Emit events
this.eventSystem.emit('combat:started', { monster, party });

// Listen to events
this.eventSystem.on('combat:victory', this.handleVictory.bind(this));
```

### Storage Operations
```javascript
// Save character
await window.Storage.saveCharacter(character);

// Load party
const party = await window.Storage.loadParty(partyId);

// Update dungeon state
await window.Storage.saveDungeonState(dungeonState);
```

### Terminology System
```javascript
// Get translated term
const termKey = 'party'; // Returns "Party" or "Strike Team"
const displayText = TextManager.getText(termKey);

// Add data-text-key attribute for auto-updates
<h3 data-text-key="party">Party</h3>
```

## Getting Started (Development)

1. **Clone Repository**
   ```bash
   git clone https://github.com/RogueCtrl/Descent-Cyber-Wizardry.git
   cd Descent-Cyber-Wizardry
   ```

2. **Open in Browser**
   ```bash
   # Simple HTTP server (choose one):
   python -m http.server 8000
   # or
   npx serve .
   # or
   php -S localhost:8000
   ```

3. **Access Game**
   - Open browser to `http://localhost:8000`
   - No build step required
   - Uses local IndexedDB for storage

4. **Development Tools**
   - Browser DevTools for debugging
   - Console logs for game state tracking
   - IndexedDB inspector for storage debugging

## Breaking Changes & Migration

### Version Compatibility
> ⚠️ **Current Version Not Compatible with Previous Versions**
>
> If upgrading from an earlier version, delete the `DescentCyberWizardy` IndexedDB instance before running.

**To reset storage:**
1. Open Browser DevTools (F12)
2. Go to Application/Storage tab
3. Find IndexedDB → `DescentCyberWizardy`
4. Right-click and delete
5. Refresh page

## Testing

### Manual Testing Areas
- **Character Creation**: Test all race/class combinations
- **Combat**: Verify turn-based mechanics work correctly
- **Storage**: Test save/load with multiple parties
- **Terminology**: Verify dual-mode switching updates all UI
- **Audio**: Test music and sound effect triggers
- **3D Rendering**: Check monster portraits render correctly

### Test Environments Available
- `src/game/CombatTest.js` - Combat system testing
- `src/game/DungeonTest.js` - Dungeon exploration testing
- `src/game/MagicTest.js` - Magic system testing
- `src/game/ResourceManagementTest.js` - Resource testing

## Known Limitations

### Current Constraints
- **Single Dungeon**: Only training grounds available
- **Basic AI**: Monster behaviors are functional but simple
- **Limited Equipment**: Core items only, no advanced mechanics
- **Simple Magic**: Spell system is basic implementation
- **No Multiplayer**: Single-player only

### Technical Limitations
- **Browser Storage**: IndexedDB has size limits (varies by browser)
- **No Server**: All data stored locally
- **Audio API**: Chiptune generation can be CPU-intensive
- **Canvas Performance**: 3D rendering is client-side only

## Contributing

### Areas for Contribution
1. **Content Creation**
   - New dungeon designs
   - Additional monsters and AI behaviors
   - More equipment and items
   - Extended spell library

2. **Feature Enhancements**
   - Advanced magic system mechanics
   - Enhanced combat AI
   - Additional treasure types and traps
   - Multi-party rescue mechanics

3. **UI/UX Improvements**
   - Better visual feedback
   - Enhanced animations
   - Accessibility features
   - Mobile optimization

4. **Audio Expansion**
   - New music tracks
   - Additional sound effects
   - Ambient audio

### Contribution Guidelines
- Follow existing code style and patterns
- Test thoroughly with both classic and cyber modes
- Ensure IndexedDB migrations work correctly
- Update terminology.js for new UI text
- Add appropriate console logging
- Document complex logic

## AI Assistant Guidelines

### When Working on This Project

1. **Always Review Dual-Mode Impact**
   - Any UI text needs both classic and cyber terminology
   - Update `src/data/terminology.js` for new terms
   - Test terminology switching works

2. **Storage Considerations**
   - Understand the v6 schema before modifying storage
   - Create migration files for schema changes
   - Test with existing save data

3. **Event System Usage**
   - Use events for cross-system communication
   - Don't create tight coupling between modules
   - Document event names and payloads

4. **Testing Requirements**
   - Test in browser, not Node.js
   - Verify both fantasy and cyber modes
   - Check IndexedDB persistence
   - Validate 3D rendering

5. **Architecture Respect**
   - Keep modular structure
   - Don't mix responsibilities
   - Follow established patterns
   - Maintain vanilla JS (no dependencies)

### Common Tasks

**Adding New UI Text:**
1. Add to `src/data/terminology.js` under both `classic` and `cyber`
2. Use `data-text-key` attribute in HTML
3. Call `TextManager.updateAllText()` to refresh

**Adding New Monster:**
1. Define in `src/game/Monster.js`
2. Add 3D model to `src/rendering/MonsterPortraitRenderer.js`
3. Update spawn logic in `src/game/Dungeon.js`
4. Add cyber classification name

**Modifying Storage:**
1. Update schema version in `src/utils/Storage.js`
2. Create migration function
3. Test with existing data
4. Document breaking changes

**Adding New Sound:**
1. Define in `src/audio/AudioManager.js`
2. Create synthesis function
3. Add event trigger
4. Test in both modes

## Project Statistics

- **51 JavaScript files** (~32,000 lines of code)
- **4,531 lines of CSS**
- **80+ terminology mappings**
- **50+ spells** across 7 levels
- **75+ equipment items**
- **12+ monster types** with 5 3D models
- **5 audio tracks** with 12+ sound effects
- **8 character classes**, **5 races**
- **Complete IndexedDB v6 schema** with migrations

## Resources & Links

- **Repository**: https://github.com/RogueCtrl/Descent-Cyber-Wizardry
- **License**: MIT
- **Inspiration**: Classic Wizardry RPG series + Tron aesthetic
- **Built With**: Cursor + Claude Code (Claude 4.0 Opus & Sonnet)

## License

MIT License - See LICENSE file for full details.

---

**Last Updated**: October 2025
**Schema Version**: v6
**Development Status**: Active (75% toward full Wizardry-Tron fusion)

*A passion project exploring the intersection of classic RPG mechanics and modern web technologies, with a unique dual-mode system that transforms the entire game experience.*
