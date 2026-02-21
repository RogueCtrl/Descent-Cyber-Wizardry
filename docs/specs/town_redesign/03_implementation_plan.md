# Implementation Plan: Town UI Redesign

This document details the exact technical implementation steps for the Town UI Redesign feature.

## 1. Modify `src/rendering/UI.ts`
The HTML generation within the town UI requires complete replacement.

### Updated Method: `showTown()`
Replace the `townContent` template literal:
- Keep the outer `.town-menu`, `.noise-overlay`, `.crt-overlay`, and `.dashboard-logo`.
- Remove the `.dashboard-body` 3-column wrapper completely.
- Add a new `.town-grid-container` wrapper with a structure consisting of:
  - A primary flex row containing the `Training Grounds` button alongside a column grouping `Dungeon Entrance` and `Trading Post`.
  - A secondary flex row grouping `Temple` and `Camp`.
  - The `.party-status-footer` spanning the bottom width.
- Bind the correct `data-text-key` attributes so `applyGlobalTextManager()` correctly themes the locations.
- Map the buttons directly, removing arbitrary dashboard data logic (e.g., Med-Bay "biomass depleted").

### Updated Method: `setupTownCenterEventListeners()`
Update event selectors:
- `#training-grounds-btn` emits `'town-location-selected', 'training-grounds'`
- `#dungeon-entrance-btn` emits `'town-location-selected', 'dungeon'`
- (Currently inactive buttons can be disabled without listeners or mapped to empty placeholders)

## 2. Refinements in `styles/dashboard.css`
- Delete `.dashboard-body` and `.dashboard-column` constraints.
- Create new grid structures:
  - `.town-grid-container`: Flex/Grid based tight layout centered underneath the logo.
  - `.town-card`: Utilize existing `.dashboard-panel` baseline properties:
    ```css
    .town-card {
        background: rgba(0, 20, 25, 0.75);
        border: 1px solid rgba(0, 242, 255, 0.25);
        box-shadow: 0 0 8px rgba(0, 242, 255, 0.08), inset 0 0 4px rgba(0, 242, 255, 0.04);
        backdrop-filter: blur(8px);
        border-radius: var(--radius-lg);
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        /* Custom layout for icons + text */
        cursor: pointer;
    }
    .town-card:hover { /* Glowing outline */ }
    ```
- Style `.party-status-footer` to float below the grid with an elegant, single-line readout showing active party configuration and save status.

## 3. Edge Cases & Constraints
- Ensure the structural changes remain contained within `.town-modal`, so the standard background and global event bindings are not disrupted.
- Test both the "classic" (fantasy) and "cyber" views via the terminology mode toggle to make sure the CSS grid doesn't break due to varying text lengths.
