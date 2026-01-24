# [BUG] Incorrect "spidery" connector lines rendered for distant walls

## Description
When the player is positioned in an area with no walls at distance 1, but walls exist at distance 2 or further, the rendering engine incorrectly draws connector lines from the four corners of the viewport to the corners of the distant wall. This creates a "spidery" or "convergent" wireframe effect that is mathematically incorrect for a 3D perspective, as these lines should only be visible when walls are adjacent to the observer.

## Steps to Reproduce
1. Launch the game and enter the dungeon with any agent.
2. Navigate to position `(1, 2)` on Floor 1.
3. Face **North**.
4. Observe the viewport.

## Expected Behavior
The viewport should show the front-facing wall at distance 2. No lines should connect the screen corners `(0,0)`, `(0, height)`, etc., to the distant wall unless there are side walls continuing from the observer's position.

## Actual Behavior
Four bright green lines originate from the corners of the screen and converge onto the front-facing wall at distance 2.

## Visual Proof
![Distant Wall Bug](file:///Users/mattcox/.gemini/antigravity/brain/cb43a7cd-e4eb-4a2e-849e-3a60c2cc70a7/pos_1_2_north_1769211542649.png)
*Figure 1: Spidery lines at (1,2) North*

![Correct Rendering Benchmark](file:///Users/mattcox/.gemini/antigravity/brain/cb43a7cd-e4eb-4a2e-849e-3a60c2cc70a7/pos_0_1_north_1769211606665.png)
*Figure 2: Correct rendering at (0,1) North where walls are at distance 1*

## Implementation Details
The issue is located in `src/rendering/Viewport3D.js`:
- `renderLeftWallSegment`: Lines 292-296 draw connections to `(0,0)` and `(0, height)` for any wall at `distance > 1` if `hasPreviousWall` is false.
- `renderRightWallSegment`: Lines 357-361 draw connections to `(width, 0)` and `(width, height)` under similar conditions.

These connections should only be drawn if `distance === 1`.
