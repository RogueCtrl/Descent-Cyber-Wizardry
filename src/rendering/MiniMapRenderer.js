/**
 * Mini-Map 2D Renderer
 * Renders a picture-in-picture 2D map with Fog-of-War
 */
class MiniMapRenderer {
    constructor() {
        // Configuration
        this.size = 200; // Width/Height in pixels
        this.padding = 20; // Padding from bottom-right corner
        this.tileSize = 20; // Size of each tile in the mini-map
        this.viewRadius = 4; // How many tiles radius to show in mini-map

        // Colors
        this.colors = {
            background: 'rgba(5, 5, 5, 0.85)',
            border: '#3b82f6', // Cyber Blue
            floor: '#1f2937', // Dark Gray
            wall: '#3b82f6', // Cyber Blue
            door: '#d97706', // Brown/Amber
            player: '#10b981', // Matrix Green
            fog: '#000000', // Black
            unknown: '#000000'
        };
    }

    /**
     * Render the mini-map
     * @param {CanvasRenderingContext2D} ctx - The main canvas context
     * @param {Dungeon} dungeon - The dungeon instance
     * @param {number} viewportWidth - Width of the viewport
     * @param {number} viewportHeight - Height of the viewport
     */
    render(ctx, dungeon, viewportWidth, viewportHeight) {
        if (!dungeon || !dungeon.currentFloorData) return;

        // Calculate map position (bottom right)
        const mapX = viewportWidth - this.size - this.padding;
        const mapY = viewportHeight - this.size - this.padding;

        // Save context
        ctx.save();

        // 1. Draw Background & Frame
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(mapX, mapY, this.size, this.size);

        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX, mapY, this.size, this.size);

        // Clip to map area
        ctx.beginPath();
        ctx.rect(mapX, mapY, this.size, this.size);
        ctx.clip();

        // 2. Calculate transform to center on player
        const playerX = dungeon.playerX;
        const playerY = dungeon.playerY;

        // Center of the mini-map
        const centerX = mapX + this.size / 2;
        const centerY = mapY + this.size / 2;

        // 3. Render Tiles
        const floor = dungeon.currentFloorData;
        const floorNum = dungeon.currentFloor;

        // Determine visible range to render (optimization)
        const tilesInView = Math.ceil(this.size / (this.tileSize * 2)) + 2;

        // Don't clamp coordinates - allow rendering of wrapped tiles
        const startX = playerX - tilesInView;
        const endX = playerX + tilesInView;
        const startY = playerY - tilesInView;
        const endY = playerY + tilesInView;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                // Strict bounds check - no wrapping
                if (x < 0 || x >= floor.width || y < 0 || y >= floor.height) {
                    continue;
                }

                // Check if tile is explored
                const explorationKey = `${floorNum}:${x}:${y}`;
                const isExplored = dungeon.exploredTiles && dungeon.exploredTiles.has(explorationKey);

                if (!isExplored) continue; // Skip unexplored tiles (Fog of War)

                const tileType = floor.tiles[y][x];

                // Calculate position on screen
                // (x - playerX) gives relative position
                const drawX = centerX + (x - playerX) * this.tileSize - (this.tileSize / 2);
                const drawY = centerY + (y - playerY) * this.tileSize - (this.tileSize / 2);

                this.renderTile(ctx, drawX, drawY, tileType);
            }
        }

        // 4. Render Player
        this.renderPlayerArrow(ctx, centerX, centerY, dungeon.playerDirection);

        // 5. Restore context
        ctx.restore();

        // 6. Draw "2D MAP" Label
        ctx.fillStyle = this.colors.border;
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('2D-NAV', mapX + 5, mapY + 12);
    }

    /**
     * Render a single tile
     */
    renderTile(ctx, x, y, type) {
        ctx.beginPath();

        // Floor background
        ctx.fillStyle = this.colors.floor;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        if (type === 'wall') {
            ctx.fillStyle = this.colors.wall;
            // Draw wall as a block
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
        } else if (type === 'door' || type === 'hidden_door') {
            ctx.fillStyle = this.colors.door;
            // Draw door as a plus sign (+)
            const midX = x + this.tileSize / 2;
            const midY = y + this.tileSize / 2;
            const thickness = 2;
            const size = this.tileSize - 4;

            // Vertical part
            ctx.fillRect(midX - thickness / 2, midY - size / 2, thickness, size);
            // Horizontal part
            ctx.fillRect(midX - size / 2, midY - thickness / 2, size, thickness);
        } else if (type === 'open_door') {
            ctx.fillStyle = this.colors.door;
            // Draw open door as a hash (#)
            const midX = x + this.tileSize / 2;
            const midY = y + this.tileSize / 2;
            const thickness = 2;
            const size = this.tileSize - 6;
            const gap = 4;

            // Two vertical lines
            ctx.fillRect(midX - gap / 2 - thickness, midY - size / 2, thickness, size);
            ctx.fillRect(midX + gap / 2, midY - size / 2, thickness, size);

            // Two horizontal lines
            ctx.fillRect(midX - size / 2, midY - gap / 2 - thickness, size, thickness);
            ctx.fillRect(midX - size / 2, midY + gap / 2, size, thickness);
        } else if (type.startsWith('stairs')) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6);
        }

        // Grid lines (optional, distinct look)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    }

    /**
     * Render player arrow
     */
    renderPlayerArrow(ctx, x, y, direction) {
        ctx.save();
        ctx.translate(x, y);

        // Rotation: 0=North (up), 1=East (right), etc.
        // Canvas 0 rotation is East (right).
        // Direction 0 (North) -> -90 deg
        let rotation = 0;
        switch (direction) {
            case 0: rotation = -Math.PI / 2; break; // North
            case 1: rotation = 0; break; // East
            case 2: rotation = Math.PI / 2; break; // South
            case 3: rotation = Math.PI; break; // West
        }

        ctx.rotate(rotation);

        ctx.beginPath();
        ctx.fillStyle = this.colors.player;
        // Draw an arrowhead
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, 4);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
