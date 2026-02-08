/**
 * Mini-Map 2D Renderer
 * Renders a picture-in-picture 2D map with Fog-of-War
 */
export class MiniMapRenderer {
  size: number;
  padding: number;
  tileSize: number;
  viewRadius: number;
  colors: Record<string, string>;

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
      unknown: '#000000',
    };
  }

  /**
   * Render the mini-map
   * @param {CanvasRenderingContext2D} ctx - The main canvas context
   * @param {Dungeon} dungeon - The dungeon instance
   * @param {number} viewportWidth - Width of the viewport
   * @param {number} viewportHeight - Height of the viewport
   */
  render(ctx: CanvasRenderingContext2D, dungeon: any, viewportWidth: number, viewportHeight: number) {
    if (!dungeon || !dungeon.currentFloorData) return;

    // Calculate map position (bottom right)
    const mapX = viewportWidth - this.size - this.padding;
    const mapY = viewportHeight - this.size - this.padding;
    const radius = 8; // Border radius to match --radius-lg

    // Save context
    ctx.save();

    // 1. Draw Shadow (before background for layering)
    ctx.shadowColor = 'rgba(59, 130, 246, 0.4)'; // --glow-primary
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 2. Draw Background with rounded corners
    ctx.fillStyle = this.colors.background;
    this.roundRect(ctx, mapX, mapY, this.size, this.size, radius, true, false);

    // Reset shadow for border
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 3. Draw Border with rounded corners
    ctx.strokeStyle = this.colors.border;
    ctx.lineWidth = 2;
    this.roundRect(ctx, mapX, mapY, this.size, this.size, radius, false, true);

    // Clip to map area with rounded corners
    ctx.beginPath();
    this.roundRect(ctx, mapX, mapY, this.size, this.size, radius, false, false);
    ctx.clip();

    // 4. Calculate transform to center on player
    const playerX = dungeon.playerX;
    const playerY = dungeon.playerY;

    // Center of the mini-map
    const centerX = mapX + this.size / 2;
    const centerY = mapY + this.size / 2;

    // 5. Render Tiles
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

        let tileType = floor.tiles[y][x];

        // Handle hidden doors and secret passages
        // They should appear as walls until discovered
        if (tileType === 'hidden_door' || tileType === 'secret_passage') {
          const secretKey = `${floorNum}:${x}:${y}:${tileType}`;
          if (!dungeon.discoveredSecrets || !dungeon.discoveredSecrets.has(secretKey)) {
            tileType = 'wall'; // Show as wall until discovered
          }
        }

        // Calculate position on screen
        // (x - playerX) gives relative position
        const drawX = centerX + (x - playerX) * this.tileSize - this.tileSize / 2;
        const drawY = centerY + (y - playerY) * this.tileSize - this.tileSize / 2;

        this.renderTile(ctx, drawX, drawY, tileType);
      }
    }

    // 6. Render Monsters
    this.renderMonsters(ctx, dungeon, startX, endX, startY, endY, centerX, centerY);

    // 7. Render Player
    this.renderPlayerArrow(ctx, centerX, centerY, dungeon.playerDirection);

    // 8. Restore context
    ctx.restore();

    // 9. Draw "2D-NAV" Label (outside of clipping region)
    ctx.fillStyle = this.colors.border;
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('2D-NAV', mapX + 5, mapY + 12);
  }

  /**
   * Helper function to draw rounded rectangles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Corner radius
   * @param {boolean} fill - Whether to fill
   * @param {boolean} stroke - Whether to stroke
   */
  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: boolean, stroke: boolean) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Render a single tile
   */
  renderTile(ctx: CanvasRenderingContext2D, x: number, y: number, type: string) {
    ctx.beginPath();

    // Floor background
    ctx.fillStyle = this.colors.floor;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    if (type === 'wall') {
      ctx.fillStyle = this.colors.wall;
      // Draw wall as a block
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
    } else if (type === 'door' || type === 'hidden_door' || type === 'secret_passage') {
      // Draw closed door as emoji 🚪
      ctx.font = `${this.tileSize - 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚪', x + this.tileSize / 2, y + this.tileSize / 2);
    } else if (
      type === 'open_door' ||
      type === 'open_hidden_door' ||
      type === 'open_secret_passage'
    ) {
      // Draw open door as emoji ⬜
      ctx.font = `${this.tileSize - 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⬜', x + this.tileSize / 2, y + this.tileSize / 2);
    } else if (type === 'jack_entry' || type === 'stairs_up') {
      // Jack entry - return to previous node / town (🔌 plug icon)
      ctx.fillStyle = '#22c55e'; // Green for entry/exit
      ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
      ctx.font = `${this.tileSize - 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔌', x + this.tileSize / 2, y + this.tileSize / 2);
    } else if (type === 'jack_deep' || type === 'stairs_down') {
      // Jack deep - go to next node / deeper (🔌 plug icon)
      ctx.fillStyle = '#06b6d4'; // Cyan for deeper
      ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
      ctx.font = `${this.tileSize - 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔌', x + this.tileSize / 2, y + this.tileSize / 2);
    } else if (type === 'exit') {
      // Draw exit/jack-out point as emoji 🔌
      ctx.font = `${this.tileSize - 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔌', x + this.tileSize / 2, y + this.tileSize / 2);
    } else if (type === 'treasure') {
      // Draw data cache/treasure as emoji 🔶
      ctx.font = `${this.tileSize - 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔶', x + this.tileSize / 2, y + this.tileSize / 2);
    }

    // Grid lines (optional, distinct look)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
  }

  /**
   * Render visible monsters on the mini-map
   */
  renderMonsters(ctx: CanvasRenderingContext2D, dungeon: any, startX: number, endX: number, startY: number, endY: number, centerX: number, centerY: number) {
    if (!dungeon.currentFloorData || !dungeon.currentFloorData.encounters) return;

    const encounters = dungeon.currentFloorData.encounters;
    const playerX = dungeon.playerX;
    const playerY = dungeon.playerY;

    encounters.forEach((encounter) => {
      // Only render if not triggered/defeated
      if (!encounter.triggered) {
        // Check if tile is explored
        const explorationKey = `${dungeon.currentFloor}:${encounter.x}:${encounter.y}`;
        if (dungeon.exploredTiles.has(explorationKey)) {
          // Convert world coordinates to screen coordinates
          // Relative to player
          const drawX = centerX + (encounter.x - playerX) * this.tileSize;
          const drawY = centerY + (encounter.y - playerY) * this.tileSize;

          // Render monster icon (red skull/dot)
          ctx.fillStyle = '#ef4444'; // Red
          ctx.beginPath();
          ctx.arc(drawX, drawY, this.tileSize * 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Optional: distinct icon for Boss
          if (encounter.type === 'boss') {
            ctx.strokeStyle = '#fbbf24'; // Gold outline
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }
    });
  }

  /**
   * Render player arrow
   */
  renderPlayerArrow(ctx: CanvasRenderingContext2D, x: number, y: number, direction: number) {
    ctx.save();
    ctx.translate(x, y);

    // Rotation: 0=North (up), 1=East (right), etc.
    // Canvas 0 rotation is East (right).
    // Direction 0 (North) -> -90 deg
    let rotation = 0;
    switch (direction) {
      case 0:
        rotation = -Math.PI / 2;
        break; // North
      case 1:
        rotation = 0;
        break; // East
      case 2:
        rotation = Math.PI / 2;
        break; // South
      case 3:
        rotation = Math.PI;
        break; // West
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
