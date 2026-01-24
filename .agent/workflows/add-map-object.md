---
description: How to add a new interactive object (like doors, treasure, NPCs) to the dungeon map and 3D viewport
---

# Adding Interactive Map Objects

This skill documents the end-to-end process for adding a new interactive object to the dungeon crawler. Use this as a template when adding doors, levers, chests, portals, or any tile-based object.

## Overview

Adding a new object requires changes across multiple layers:
1. **Map Data** (`Dungeon.js`): Define the tile type and placement
2. **Visibility** (`Dungeon.getViewingInfo`): Include the object in the 3D view data
3. **Rendering** (`Viewport3D.js`): Draw the object in the 3D viewport
4. **UI** (`UI.js`, `index.html`, `main.css`): Add contextual interaction buttons
5. **Logic** (`Engine.js`, `Dungeon.js`): Handle interaction events

---

## Step 1: Define the Tile Type

In `Dungeon.js`, add the new tile type to the map generation logic.

**Example: Adding a door at (3,2)**
```javascript
// In generateTestMap() or floor generation logic
tiles[2][3] = 'door'; // y=2, x=3
```

**Common tile types:** `wall`, `floor`, `door`, `hidden_door`, `stairs_up`, `stairs_down`, `treasure`, `exit`

---

## Step 2: Add Visibility Logic

In `Dungeon.getViewingInfo()`, add detection for the new tile type within the visibility scan loop.

```javascript
// Inside the offset loop in getViewingInfo()
} else if (tile === 'door') {
    doors.push({ distance, x: offX, y: offY, offset, type: 'normal' });
    // Doors don't block centerBlocked unless you want them to
}
```

> **Note:** If the object should block the player's view (like a closed door), set `centerBlocked = true`.

---

## Step 3: Render in 3D Viewport

In `Viewport3D.js`, add a rendering method and call it from the main `render()` loop.

### 3.1 Create the Render Method
```javascript
renderDoor(perspective, centerX, doorType, offset = 0) {
    const { wallWidth, topY, bottomY } = perspective;
    const segmentCenterX = centerX + offset * wallWidth;
    const leftX = segmentCenterX - wallWidth / 2;
    const rightX = segmentCenterX + wallWidth / 2;
    const tileWidth = rightX - leftX;
    const tileHeight = bottomY - topY;

    // 1. Fill background (occlusion)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(leftX, topY, tileWidth, tileHeight);

    // 2. Draw frame connected to walls
    this.ctx.strokeStyle = this.colors.wall;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(leftX, topY, tileWidth, tileHeight);

    // 3. Draw details (inner panel, handle, etc.)
    // ...
}
```

### 3.2 Call from Render Loop
```javascript
// In render() method, within the distance loop
if (viewInfo.doors) {
    viewInfo.doors.forEach(door => {
        if (door.distance === distance) {
            this.renderDoor(perspective, centerX, door.type, door.offset);
        }
    });
}
```

---

## Step 4: Add Interaction UI

### 4.1 Add Button to HTML (`index.html`)
```html
<button id="open-door" style="display: none;">Open Door</button>
```

### 4.2 Register in UI.js
```javascript
// In initialize(), add to controlButtons
openDoor: document.getElementById('open-door')

// In setupEventListeners()
if (this.controlButtons.openDoor) {
    this.controlButtons.openDoor.addEventListener('click', () => {
        this.eventSystem.emit('player-action', 'open-door');
    });
}
```

### 4.3 Contextual Visibility (`UI.updateContextualActions`)
```javascript
updateContextualActions(dungeon) {
    if (!dungeon || !this.controlButtons.openDoor) return;
    
    const tileInFront = dungeon.getTileInFront();
    
    if (tileInFront === 'door') {
        this.controlButtons.openDoor.style.display = 'block';
        this.controlButtons.openDoor.classList.add('animate-flash-blue');
    } else {
        this.controlButtons.openDoor.style.display = 'none';
        this.controlButtons.openDoor.classList.remove('animate-flash-blue');
    }
}
```

### 4.4 Add Animation CSS (`main.css`)
```css
@keyframes flashBlue {
    0%, 100% { box-shadow: 0 0 5px var(--accent-primary); }
    50% { box-shadow: 0 0 20px var(--accent-secondary); background-color: rgba(59, 130, 246, 0.2); }
}
.animate-flash-blue { animation: flashBlue 1.5s infinite; }
```

---

## Step 5: Implement Interaction Logic

### 5.1 Helper Method in Dungeon.js
```javascript
getTileInFront() {
    let checkX = this.playerX, checkY = this.playerY;
    switch (this.playerDirection) {
        case 0: checkY -= 1; break; // North
        case 1: checkX += 1; break; // East
        case 2: checkY += 1; break; // South
        case 3: checkX -= 1; break; // West
    }
    return this.getTile(checkX, checkY);
}

openDoor() {
    // Calculate target coords, check tile, modify map
    // Return true on success
}
```

### 5.2 Handle Action in Engine.js
```javascript
// In handlePlayerAction() switch statement
case 'open-door':
    if (this.dungeon.openDoor()) {
        this.ui.addMessage('You open the door.');
        this.ui.updateContextualActions(this.dungeon);
    }
    break;
```

### 5.3 Trigger UI Update
Call `ui.updateContextualActions(dungeon)` in `updateDungeonView()` to refresh button state on movement.

---

## Rendering Vector Portraits (Advanced)

For rendering complex vector models (like monster portraits) in the dungeon view:

### Data Structure
```javascript
// In monster/entity data
portraitModel: {
    vertices: [
        { x: 0, y: -0.4, z: 0.1 },
        // ...
    ],
    edges: [
        [0, 1], [1, 2], // vertex index pairs
    ]
}
```

### Rendering Method
```javascript
renderMonsterWireframe(model, distance, centerX, centerY) {
    const scale = 200 / (distance + 1);
    const depthFactor = 1 / (distance * 0.5 + 1);
    
    this.ctx.strokeStyle = '#ef4444'; // Red for monsters
    this.ctx.beginPath();
    
    model.edges.forEach(edge => {
        const v1 = model.vertices[edge[0]];
        const v2 = model.vertices[edge[1]];
        
        const x1 = centerX + v1.x * scale * depthFactor;
        const y1 = centerY + v1.y * scale * depthFactor;
        // ... transform and draw
    });
    
    this.ctx.stroke();
}
```

---

## Checklist for New Objects

- [ ] Define tile type in map data (`Dungeon.js`)
- [ ] Add to visibility scan (`getViewingInfo`)
- [ ] Create render method (`Viewport3D.js`)
- [ ] Add to render loop at correct distance
- [ ] Add UI button if interactive (`index.html`)
- [ ] Register button and event listener (`UI.js`)
- [ ] Implement contextual visibility (`updateContextualActions`)
- [ ] Implement interaction logic (`Dungeon.js`, `Engine.js`)
- [ ] Update README map legend if applicable
