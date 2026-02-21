# Testing & Documentation Plan: Town UI Redesign

## 1. Testing Strategy

### A. Manual Verification Path
1. **Pre-condition**: Load the game at `http://localhost:5173`. Ensure no parties are loaded, or click "New Game".
2. **Action**: View the Town Menu layout.
3. **Expected Result**: 
   - A clean 5-card layout is displayed against the circuit-board background and new logo.
   - The "Dungeon Entrance" button should be distinctly styled as disabled or locked since no party exists.
   - The "Training Grounds" card possesses a glowing hover effect and clicks through to UI Character Creation successfully.
4. **Pre-condition**: Proceed into Training Grounds and assemble an active party.
5. **Action**: Return to the Town Menu.
6. **Expected Result**: 
   - The "Party Status" footer reads out the active party configuration correctly.
   - The "Dungeon Entrance" button is brightly lit and clickable.

### B. Viewport & Responsiveness Check
- Change browser window size down to mobile bounds (<768px). The 5-card grid should gracefully collapse into a single column.
- Toggle between Fantasy and Cyber modes to confirm TextManager rethemes the locations without overflowing bounds.

### C. Unit & Integration Tests (If applicable)
- The game leverages Canvas / IndexedDB / Browser UI, meaning there are no automated suites for layout tests. No changes are required.

## 2. Documentation Updates

### `README.md`
- Provide updated screenshots in the README. The old "Dungeon Exploration / 3D Wireframe / Fantasy Mode" sections utilize screenshots of the primary hub which should be superseded by the new Fusion 5-card layout. Add screenshots capturing the newly rendered menu.

### `AGENTS.md`
- No new subsystems were created, only layout manipulation. No modifications required.

### `docs/systems/`
- No changes required. The `rendering-system` logic remains structurally sound, routing modals globally precisely as it did previously.
