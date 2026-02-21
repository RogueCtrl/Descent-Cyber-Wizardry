# Current System Audit: Town UI Redesign

## 1. Overview
The town menu is the central hub where players manage their characters, form parties, and prepare to enter the dungeon. Recently, the UI was overhauled from a clean, 5-card grid (Training Grounds, Dungeon Entrance, Trading Post, Temple, Camp) into a complex "cyber dashboard" composed of a 3-column layout featuring 6 detailed data panels (AgentOps Status, Med-Bay, Strike Team, Link Status, Data Vault, Signal Feed). While this firmly established the new cyberpunk thematic identity, it abandoned the polished simplicity and direct structural mapping of the original classic town square.

## 2. Key Components
- **`src/rendering/UI.ts`**: Contains the `showTown(party)` method, which dynamically generates the HTML structure for the town menu. Also houses `setupTownCenterEventListeners(viewport)` which binds clicks to game state transitions.
- **`styles/dashboard.css`**: Defines the layout, neon glow effects, glassmorphism panel styles, and background CRT/scanline animations for the new cyber dashboard.
- **`src/data/terminology.ts`**: Provides the dual-mode text mappings, ensuring the conceptual "Training Grounds" can be rendered as "Agent Registry" depending on the active theme.

## 3. Critical Implementation Details
- The current layout in `dashboard.css` uses a strict `.dashboard-body` grid (`grid-template-columns: 300px 1fr 300px`) overlaid on a `.town-menu` container. 
- The background utilizes a centered circuit board texture and layered CRT scanline animations (`.noise-overlay`, `.crt-overlay`).
- The center column is deliberately left empty, while the left and right columns are filled with heavily stylized `<div class="dashboard-panel">` features populated with complex internal data structures and nested interactive buttons.

## 4. Problem Statement
The current 3-column dashboard UI feels overly complex and unpolished compared to the original tight layout. By scattering the primary game actions (like entering the dungeon or managing the party) across detailed data terminals, the core loop of returning to town and preparing for the next dive became visually overwhelming. The goal is to return to the functional roots of the original 5-card grid layout, while fusing it seamlessly with the newly introduced high-quality cyberpunk aesthetic (the background, logo, CRT FX, and neon glowing borders).
