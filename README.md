# Descent: Cyber Wizardry

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**A modern browser-based homage to the classic dungeon crawler Wizardry, featuring a unique dual-mode system that transforms the game between classic fantasy and cyberpunk aesthetics.**

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="assets/readme/dungeon-exploration.png" alt="Dungeon Exploration" width="400"/><br/>
      <b>3D Wireframe Dungeon</b>
    </td>
    <td align="center">
      <img src="assets/readme/combat-ogre.png" alt="Combat System" width="400"/><br/>
      <b>Turn-Based Combat</b>
    </td>
  </tr>
</table>

</div>

Experience authentic turn-based RPG combat, persistent dungeon exploration, and deep party management mechanics—all rendered in a striking 3D wireframe style with procedurally generated chiptune audio.

---

## Two Worlds, One Engine

Toggle between fantasy and cyberpunk at any time. This isn't just a skin—it's a complete semantic translation layer affecting all text, terminology, and theming.

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="assets/readme/tg-step3.jpg" alt="Fantasy Mode" width="400"/><br/>
      <b>Fantasy Mode</b><br/>
      <i>"Dwarven Priest" • "Dungeon" • "Party"</i>
    </td>
    <td align="center">
      <img src="assets/readme/ao-step3.jpg" alt="Cyber Mode" width="400"/><br/>
      <b>Cyber Mode</b><br/>
      <i>"Iron Kernel Infrastructure" • "Corrupted Network" • "Strike Team"</i>
    </td>
  </tr>
</table>

</div>

---

## Key Features

### 🧊 3D Wireframe Rendering
Authentic retro-3D rendering built from scratch using HTML5 Canvas. Features proper perspective, occlusion culling, and a real-time mini-map with fog of war.

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="assets/readme/door-open-corridor.png" alt="Corridor View" width="260"/>
    </td>
    <td align="center">
      <img src="assets/readme/door-closed.png" alt="Door View" width="260"/>
    </td>
    <td align="center">
      <img src="assets/readme/minimap-fogofwar.png" alt="Mini-map" width="260"/>
    </td>
  </tr>
  <tr>
    <td align="center"><i>Corridor Exploration</i></td>
    <td align="center"><i>Doors & Secrets</i></td>
    <td align="center"><i>Fog of War Mini-map</i></td>
  </tr>
</table>

</div>

### ⚔️ Grid Engagement Combat
Tactical turn-based combat with 3D wireframe monster portraits that react to damage with glitching and fragmentation effects.

<div align="center">
  <img src="assets/readme/ogre-encounter.png" alt="Monster Encounter" width="500"/><br/>
  <i>3D Monster Portraits with Health-Based Visual Effects</i>
</div>

<br/>

- **Formation Strategy**: Front/back row positioning affects damage and targeting
- **Initiative System**: Agility and class bonuses determine turn order
- **Monster AI**: Different behavior patterns (aggressive, tactical, pack, intelligent)

### 📜 Deep Party Management
Create characters from 5 races and 8 classes. Manage multiple parties in a persistent shared world. Handle permadeath, resurrection, and future rescue missions.

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="assets/readme/tg-step1.jpg" alt="Character Creation" width="400"/><br/>
      <i>Character Creation</i>
    </td>
    <td align="center">
      <img src="assets/readme/tg-step5.jpg" alt="Party Management" width="400"/><br/>
      <i>Party Formation</i>
    </td>
  </tr>
</table>

</div>

### 🎵 Procedural Audio
Custom-built audio engine generating situational chiptune music and sound effects using the Web Audio API. No external audio files—pure code-generated synthesis with 5 dynamic tracks and 19+ sound effects.

### 💾 Persistent World
Robust IndexedDB storage saves every step. Characters, parties, dungeon progress, and fog of war are all persistently stored locally. Multiple parties share the same dungeon instance.

---

## Recent Changes

### TypeScript Migration & Architecture Overhaul
The entire codebase has been migrated from vanilla JavaScript to **strict TypeScript** with **Vite** as the dev server and bundler. Key improvements:

- **55 modules** converted to TypeScript with full ES module imports/exports
- **`strict: true`** enabled — zero `tsc` errors across ~37,000 lines
- **Dependency injection** replaces all `window.engine` global references
- **Clean module boundaries** — no legacy `window.*` global assignments remain
- **Type definitions** for all game entities (400+ lines in `src/types/index.ts`)
- **IndexedDB entity migrations** imported directly via ES modules instead of window globals

### Mini-Map Navigation
Real-time 2D mini-map with fog of war rendering. Explored tiles persist across sessions and are shared between all parties in the same dungeon. The player arrow rotates to indicate facing direction.

### Monster Rendering
Monsters now appear in both the 3D dungeon viewport and on the mini-map. Encounter positions are tracked and displayed, giving players situational awareness before engaging in combat.

### Visual & Audio Polish
- Updated CSS styling with improved cyberpunk glow effects
- New victory chiptune track
- Refined dungeon theme with dynamic intensity modes
- Enhanced UI transitions and feedback

---

## Getting Started

```bash
# Clone
git clone https://github.com/RogueCtrl/Descent-Cyber-Wizardry.git
cd Descent-Cyber-Wizardry

# Install dev dependencies
npm install

# Start development server
npm run dev
# Then open http://localhost:5173
```

**No runtime dependencies** — TypeScript and Vite are dev-only. The game runs entirely on browser APIs (Canvas, IndexedDB, Web Audio).

---

## Development Workflow

### Quality Automation

The project uses GitHub Actions for automated testing and releases:

```bash
# Run CI checks locally before pushing
npm run build         # TypeScript compile check
npm run lint          # ESLint validation
npm run format:check  # Prettier formatting check
npm test             # Vitest unit tests
```

### Automated Releases

This project uses **semantic versioning** with automated releases based on conventional commits. When you merge a PR to `main`, the version is automatically bumped and a changelog is generated.

#### Conventional Commit Format

Use these prefixes in your **PR titles** (not individual commit messages):

| PR Title Prefix | Version Bump | Example |
|-----------------|--------------|---------|
| `major:` or `BREAKING CHANGE` | **Major** (1.0.0 → 2.0.0) | `major: redesign combat system` |
| `feat:` or `refactor:` | **Minor** (1.0.0 → 1.1.0) | `feat: add spell memorization` |
| `fix:`, `docs:`, `chore:` | **Patch** (1.0.0 → 1.0.1) | `fix: repair broken portraits` |

**Examples:**
- `feat: add multi-party dungeon sharing`
- `fix: resolve IndexedDB migration error`
- `docs: update architecture diagrams`
- `refactor: improve combat initiative system`

#### Release Workflow

1. **Open a PR** with a conventional commit prefix in the title
2. **Merge to main** (after CI passes and review)
3. **Automatic release PR** is created with:
   - Updated version in `package.json`
   - Generated `CHANGELOG.md` entry
   - Git tag `vX.Y.Z`
4. **Review and merge** the release PR to complete the release

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

---

## Technical Architecture

Zero runtime dependencies — all game logic uses only browser-native APIs:

| Component | Technology |
|-----------|------------|
| **Language** | TypeScript (strict mode) |
| **Tooling** | Vite (dev server & bundler) |
| **Rendering** | HTML5 Canvas (2D Context for 3D projection) |
| **Audio** | Web Audio API (Oscillator synthesis) |
| **Storage** | IndexedDB v7 with migration system |
| **Styling** | Modern CSS3 (Variables, Grid, Flexbox) |

**~37,000 lines of TypeScript** across 55 modules, organized into:
- `src/core/` — Engine, events, state machine
- `src/game/` — Combat, dungeon, characters, parties
- `src/rendering/` — 3D viewport, portraits, UI
- `src/audio/` — Procedural music and sound
- `src/data/` — Terminology, entity migrations
- `src/types/` — Shared interfaces and union types
- `src/utils/` — Storage, text manager, helpers

Type checking: `npx tsc --noEmit` (strict mode, zero errors)

Detailed system documentation: [`docs/systems/`](docs/systems/)

---

## Game Content

| Category | Content |
|----------|---------|
| **Races** | Human, Elf, Dwarf, Hobbit, Gnome |
| **Classes** | Fighter, Mage, Priest, Thief, Bishop, Samurai, Lord, Ninja |
| **Spells** | 50+ across 7 levels (arcane & divine) |
| **Equipment** | 75+ items with dual terminology |
| **Monsters** | 12+ types with 3D wireframe portraits |
| **Audio** | 5 tracks, 19+ sound effects |

---

## Development & Credits

This project explores AI-assisted software engineering.

**Built by**: Matt Cox

**AI Assistants**:
- **Anthropic**: Claude Sonnet (2025) & Opus 4 (2025), Sonnet 4.5 (2026), Opus 4.5 (2026)
- **Google**: Gemini 3 Flash & Pro (2026)
- **IDE**: Cursor (2025), Antigravity (2026)

**License**: [MIT](LICENSE)

---

<div align="center">
  <i>A passion project exploring the intersection of classic RPG mechanics and modern web technologies.</i>
</div>
