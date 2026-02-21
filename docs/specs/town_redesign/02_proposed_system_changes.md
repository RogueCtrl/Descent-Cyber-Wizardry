# Proposed System Changes: Town UI Redesign

## 1. Goal
The primary goal is to merge the simplicity of the classic 5-location town grid with the stylish cyberpunk aesthetic recently implemented. This will create a clean, tightly focused "fusion" Town Menu where actions are obvious and prominent, presented against the electric atmosphere of the new `Descent: Cyber Wizardry` logo and circuit board environment.

## 2. Auto-Generation Logic / Core Logic Changes
- Modifying `src/rendering/UI.ts`: The `showTown` logic will generate a simplified container focused only on the five primary town destinations:
  - Training Grounds (Create/Manage Party)
  - Dungeon Entrance (Enter the maze)
  - Trading Post (Coming Soon)
  - Temple (Coming Soon)
  - Camp (Coming Soon)
- Integrating `styles/dashboard.css` styles: The new grid cards will apply the existing cyber glassmorphism, neon glowing borders, and scanline overlays to the classic tight, responsive box layout. A status bar footer will span across the bottom outlining the active party status.

## 3. Flow Changes / Architectural Adjustments
- The overarching game flow and event system remains untouched.
- `setupTownCenterEventListeners(viewport)` will require selector updates matching the simplified IDs of the 5 main cards (e.g., `#dungeon-entrance-btn`).
- The center logic handling party counts (`activePartiesCount`) will map directly to the active state of the new Training Grounds / Dungeon Entrance cards.

## 4. UI Adjustments
- Overhaul `.dashboard-body` into a `.town-grid-body` with max-width bounding (similarly constrained to the 1024x1024 circuit board layout). The grid will center align 5 uniform `<div class="town-card">` elements.
- The new `.town-card` will leverage the styles of `.dashboard-panel` (translucent background, inset shadows, hover glow) but structured as a large click target featuring an icon, title, and descriptive subtext.
- Introduce a specialized `.party-status-footer` visually constrained to match the new UI.

## 5. Post-Action Flow / Edge Cases
- When clicking a disabled card (e.g., "Trading Post"), a visual lock indicator or simple "ACCESS DENIED" should be evident.
- Edge Case: Missing an active party when clicking "Dungeon Entrance" should preserve the current disabled behavior, perhaps using the red/alert accent established in `dashboard.css`.
