# Rendering System

> **Files**: `src/rendering/Renderer.js`, `src/rendering/Viewport3D.js`, `src/rendering/MonsterPortraitRenderer.js`, `src/rendering/CharacterUI.js`, `src/rendering/UI.js`, `src/rendering/MiniMapRenderer.js`
> **Total Lines**: ~7,500

## Overview

Pure Canvas 2D rendering system implementing 3D wireframe dungeon views, monster portraits, and UI management.

---

## Architecture

```
┌─────────────────────────────────────────┐
│              Renderer.js                 │
│  Main entry, routes to subsystems        │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌──────────┐    ┌──────────────────┐
│Viewport3D│    │MonsterPortrait   │
│  (3D)    │    │   Renderer       │
└──────────┘    └──────────────────┘
    │
    ▼
┌──────────────┐
│MiniMapRenderer│
│   (2D Map)    │
└──────────────┘
```

---

## Renderer.js

### Core Methods

```javascript
class Renderer {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.backgroundColor = '#000000';
        this.wireframeColor = '#00ff00';
        this.viewport3D = new Viewport3D(canvas, context);
    }

    clear() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    renderDungeon(dungeon, party) {
        this.viewport3D.render(dungeon, party);
    }
}
```

---

## Viewport3D.js (3D Wireframe Dungeon)

### Key Parameters

```javascript
fov = 60;                    // Field of view
maxViewDistance = 5;         // Max render distance
wallHeight = 200;            // Base wall height
floorLevel = height * 0.7;   // Floor line
ceilingLevel = height * 0.3; // Ceiling line

colors = {
    background: '#050505',
    wall: '#3b82f6',         // Cyber Blue
    hiddenDoor: '#60a5fa',
    secretPassage: '#1d4ed8',
    specialSquare: '#10b981',
    trap: '#ef4444',
    stairs: '#ffffff'
};
```

### Perspective Calculation

```javascript
calculatePerspective(distance) {
    const scale = 1 / (distance * 0.5 + 0.5);
    // Distance 1: scale = 1.0 (full size)
    // Distance 3: scale = 0.5 (half size)
    // Distance 5: scale = 0.33

    return {
        scale,
        wallWidth: width * scale,
        wallHeight: 200 * scale,
        leftX: (width - wallWidth) / 2,
        rightX: (width + wallWidth) / 2,
        topY: ceilingLevel + offset,
        bottomY: floorLevel - offset
    };
}
```

### Render Pipeline (Painter's Algorithm)

```javascript
render(dungeon, party) {
    this.clear();

    // Far to near (painter's algorithm)
    for (let distance = maxViewDistance; distance >= 1; distance--) {
        this.renderWallsAtDistance(viewInfo, distance);
        this.renderDoorsAtDistance(viewInfo, distance);
        this.renderPassagesAtDistance(viewInfo, distance);
        this.renderObjectsAtDistance(viewInfo, distance);
        this.renderMonstersAtDistance(viewInfo, distance);
    }

    // Overlay
    this.renderStatusInfo(dungeon);
    this.renderSpecialIndicators(dungeon);
    this.miniMapRenderer.render(ctx, dungeon, width, height);
}
```

### Wall Rendering

```javascript
renderFrontWall(perspective, centerX, offset = 0) {
    const { wallWidth, topY, bottomY } = perspective;
    const leftX = centerX + (offset - 0.5) * wallWidth;
    const rightX = centerX + (offset + 0.5) * wallWidth;

    // Occlusion fill (hides distant objects)
    ctx.fillStyle = '#000000';
    ctx.fillRect(leftX, topY, rightX - leftX, bottomY - topY);

    // Wireframe outline
    ctx.strokeStyle = colors.wall;
    ctx.strokeRect(leftX, topY, rightX - leftX, bottomY - topY);
}
```

### Door Rendering

```javascript
renderDoor(perspective, centerX, doorType, offset) {
    // 1. Occlusion fill
    // 2. Frame outline
    // 3. Door details (panels, bracing, handle)
    // 4. Hidden door indicator (dashed + '?')
}
```

---

## MonsterPortraitRenderer.js

### Purpose
Renders 3D wireframe monster models in combat with health-based visual effects.

### Configuration

```javascript
portraitScale = 0.8;
portraitOffset = { x: 0, y: -10 };
portraitRotation = { x: 0, y: 15, z: 0 };

animationSpeed = 0.005;
breathingAmount = 2;  // Subtle breathing

portraitColors = {
    healthy: '#00ff00',   // > 70% HP
    injured: '#ffaa00',   // 30-70% HP
    critical: '#ff4400',  // < 30% HP
    dead: '#888888'       // 0% HP
};
```

### 3D Transformation Pipeline

```javascript
transformPortraitVertices(vertices, scale, rotation) {
    return vertices.map(([x, y, z]) => {
        // 1. Apply scale
        x *= scale;
        y *= scale;
        z *= scale;

        // 2. Apply Y rotation (portrait angle)
        if (rotY !== 0) {
            const cos = Math.cos(rotY * PI/180);
            const sin = Math.sin(rotY * PI/180);
            [x, z] = [x*cos - z*sin, x*sin + z*cos];
        }

        // 3. Apply breathing animation
        const breathing = 1 + sin(animationTime * 200) * 0.02;
        return [x * breathing, y * breathing, z];
    });
}
```

### Health-Based Effects

| HP % | Color | Grid | Corruption | Pulse |
|------|-------|------|------------|-------|
| > 70% | Green | 30% | None | Slow |
| 30-70% | Orange | 20% | 20-40% | Medium |
| < 30% | Red | 10% | 60-70% | Fast |
| 0% | Gray | None | Max + darken | None |

### Effect Methods

```javascript
// Grid lines (fade with damage)
renderGridLines(monster);

// Corruption glitches (appear with damage)
renderDataCorruption(monster);

// Pulsing rings (health-based speed/color)
renderSystemPulse(monster);
```

---

## MiniMapRenderer.js

### Configuration

```javascript
size = 200;           // 200x200 pixels
padding = 20;         // From edge
tileSize = 20;        // Per tile
viewRadius = 4;       // Tiles visible

colors = {
    background: 'rgba(5, 5, 5, 0.85)',
    border: '#3b82f6',
    floor: '#1f2937',
    wall: '#3b82f6',
    door: '#d97706',
    player: '#10b981'
};
```

### Render Pipeline

```javascript
render(ctx, dungeon, viewportWidth, viewportHeight) {
    // 1. Position (bottom-right)
    // 2. Shadow glow effect
    // 3. Background with rounded corners
    // 4. Border
    // 5. Clip to rounded region
    // 6. Center on player
    // 7. Render explored tiles only (fog of war)
    // 8. Render monsters (explored areas only)
    // 9. Render player arrow (rotated by facing)
    // 10. Label "2D-NAV"
}
```

### Fog of War
```javascript
const explorationKey = `${floor}:${x}:${y}`;
const isExplored = dungeon.exploredTiles.has(explorationKey);
if (!isExplored) continue;  // Skip unexplored tiles
```

### Player Arrow
```javascript
renderPlayerArrow(ctx, x, y, direction) {
    // Rotate based on facing
    // 0=N: -90°, 1=E: 0°, 2=S: 90°, 3=W: 180°
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw arrowhead
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, 4);
    ctx.lineTo(-4, -4);
    ctx.closePath();
    ctx.fill();
}
```

---

## UI.js

### Event-Driven Updates

```javascript
setupEventListeners() {
    eventSystem.on('character-updated', () => {
        this.refreshCombatDisplay();
        this.updatePartyDisplay(party);
    });

    eventSystem.on('combat-ended', (data) => {
        this.showPostCombatResults(data.rewards);
    });

    eventSystem.on('party-defeated', (data) => {
        this.showTotalPartyKillScreen(data.casualties);
    });

    eventSystem.on('terminology-mode-changed', () => {
        this.applyGlobalTextManager();
    });
}
```

### Combat Display

```javascript
updateCombatStatus() {
    this.updatePartyStatus();      // HP bars
    this.updateWaveIndicator();    // Enemy count
    this.updateMonsterVisual();    // 3D portrait
    this.updateActionContext();    // Buttons
}

updateMonsterVisual() {
    if (monster.portraitModel) {
        // Use 3D portrait renderer
        portraitRenderer.renderMonsterPortrait(monster, {
            healthRatio: monster.currentHP / monster.maxHP
        });
    } else {
        // Fallback to ASCII art
        asciiDiv.textContent = monster.asciiArt;
    }
}
```

### Health Bars

```javascript
const hpPercent = (currentHP / maxHP) * 100;
const barClass = hpPercent > 50 ? 'healthy' :
                 hpPercent > 25 ? 'wounded' : 'critical';

// HTML: <div class="hp-bar ${barClass}" style="width: ${hpPercent}%">
```

---

## CharacterUI.js

### Modal Steps

```javascript
steps = ['race', 'attributes', 'class', 'details', 'confirm'];

renderCurrentStep() {
    switch (this.currentStep) {
        case 'race':
            this.renderRaceSelection(container);
            break;
        case 'attributes':
            this.renderAttributeGeneration(container);
            break;
        // ... etc
    }
}
```

---

## Coordinate Systems

### Canvas (2D)
```
(0,0) ──────────────► X (width)
  │
  │
  │
  ▼
  Y (height)
```

### 3D View Space
```
Distance: 1 (closest) → 5 (farthest)
Offset: -2 (left) → 0 (center) → 2 (right)
Scale: 100% → 33%
```

### Mini-Map
```
Center: Player position
Radius: ±4 tiles
```

---

## Adding New Visual Elements

### New Dungeon Object

```javascript
// In Viewport3D.renderObjectsAtDistance()
if (objectType === 'newObject') {
    this.renderNewObject(perspective, centerX, offset);
}

renderNewObject(perspective, centerX, offset) {
    const { wallWidth, wallHeight, topY, bottomY } = perspective;
    const objX = centerX + offset * wallWidth;

    ctx.strokeStyle = '#ff00ff';
    ctx.beginPath();
    // Draw shape...
    ctx.stroke();
}
```

### New Monster Portrait Model

```javascript
const model = {
    vertices: [
        [0, 1, 0],   // Head
        [1, 0, 0],   // Right
        [-1, 0, 0],  // Left
        [0, -1, 0]   // Bottom
    ],
    edges: [
        [0, 1], [0, 2],  // Head to shoulders
        [1, 3], [2, 3]   // Shoulders to bottom
    ],
    scale: 1.0,
    rotation: [0, 15, 0]
};

monster.portraitModel = model;
```

### New Mini-Map Tile

```javascript
// In MiniMapRenderer.renderTile()
else if (type === 'newTile') {
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
}
```

### New Health Effect

```javascript
// In MonsterPortraitRenderer
renderNewEffect(monster) {
    const healthRatio = monster.currentHP / monster.maxHP;
    if (healthRatio < 0.5) {
        ctx.globalAlpha = (1 - healthRatio) * 0.5;
        // Draw effect...
        ctx.globalAlpha = 1.0;
    }
}
```

---

## Performance Tips

1. **Perspective Cache**: Pre-calculated per distance
2. **Save/Restore Context**: Use `ctx.save()` / `ctx.restore()`
3. **Global Alpha**: Use instead of creating new colors
4. **Animation Time**: Update per-frame, not with setInterval
