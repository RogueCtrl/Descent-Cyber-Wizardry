import { MiniMapRenderer } from './MiniMapRenderer.ts';

/**
 * 3D Viewport Renderer
 * Handles authentic Wizardry-style 3D wireframe rendering for dungeon exploration
 */
export class Viewport3D {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  fov: number;
  maxViewDistance: number;
  wallHeight: number;
  floorLevel: number;
  ceilingLevel: number;
  colors: Record<string, string>;
  perspectiveCache: Map<number, any>;
  miniMapRenderer: MiniMapRenderer;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;

    // 3D rendering parameters
    this.fov = 60; // Field of view in degrees
    this.maxViewDistance = 5;
    this.wallHeight = 200;
    this.floorLevel = this.height * 0.7; // Floor line position
    this.ceilingLevel = this.height * 0.3; // Ceiling line position

    // Color scheme (Pentagon Pizza Index Style)
    this.colors = {
      background: '#050505',
      wall: '#3b82f6', // Cyber Blue
      hiddenDoor: '#60a5fa', // Light Blue (Unused for wall-style)
      door: '#ef4444', // Dangerous Red
      doorHidden: '#000000', // Void Black
      secretPassage: '#1d4ed8', // Darker Blue
      specialSquare: '#10b981', // Matrix Green
      trap: '#ef4444', // Alert Red
      stairs: '#ffffff',
      text: '#3b82f6',
    };

    // Perspective calculation cache
    this.perspectiveCache = new Map();

    // MiniMap Renderer
    this.miniMapRenderer = new MiniMapRenderer();
  }

  /**
   * Clear the viewport
   */
  clear() {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Render 3D dungeon view based on actual dungeon data
   */
  render(dungeon: any, party: any) {
    if (!dungeon || !dungeon.getViewingInfo) {
      this.renderPlaceholder();
      return;
    }

    this.clear();

    const viewInfo = dungeon.getViewingInfo();
    const centerX = this.width / 2;

    // Set up drawing context for walls (thicker lines)
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Render walls and structures - Painter's Algorithm (far to near)
    // Opaque walls will naturally cover distant objects
    for (let distance = this.maxViewDistance; distance >= 1; distance--) {
      this.renderWallsAtDistance(viewInfo, distance, centerX);
      this.renderDoorsAtDistance(viewInfo, distance, centerX);
      this.renderPassagesAtDistance(viewInfo, distance, centerX);
      this.renderObjectsAtDistance(viewInfo, distance, centerX);
      this.renderMonstersAtDistance(viewInfo, distance, centerX);
    }

    // Render status information
    this.renderStatusInfo(dungeon, viewInfo);

    // Render special indicators
    this.renderSpecialIndicators(dungeon);

    // Render Mini-Map
    if (this.miniMapRenderer) {
      this.miniMapRenderer.render(this.ctx, dungeon, this.width, this.height);
    }
  }

  /**
   * Check if a wall exists in viewInfo at specific distance and side
   */
  hasWallInViewInfo(viewInfo: any, distance: number, side: string) {
    return viewInfo.walls.some((wall: any) => wall.distance === distance && wall.side === side);
  }

  /**
   * Render walls at a specific distance
   */
  renderWallsAtDistance(viewInfo: any, distance: number, centerX: number) {
    const perspective = this.calculatePerspective(distance);
    this.ctx.strokeStyle = this.colors.wall;

    // Separate walls by type for proper depth sorting
    const frontWalls: any[] = [];
    const leftWalls: any[] = [];
    const rightWalls: any[] = [];

    viewInfo.walls.forEach((wall: any) => {
      if (wall.distance === distance) {
        if (wall.side === 'left') {
          leftWalls.push(wall);
        } else if (wall.side === 'right') {
          rightWalls.push(wall);
        } else {
          // Front wall
          frontWalls.push(wall);
        }
      }
    });

    // Render in proper depth order: front walls first (back), then side walls (front)
    frontWalls.forEach((wall) => {
      this.renderFrontWall(perspective, centerX, wall.offset || 0);
    });

    leftWalls.forEach((wall) => {
      this.renderLeftWallSegment(perspective, centerX, distance, viewInfo, wall.offset || -1);
    });

    rightWalls.forEach((wall) => {
      this.renderRightWallSegment(perspective, centerX, distance, viewInfo, wall.offset || 1);
    });
  }

  /**
   * Render doors at a specific distance
   */
  renderDoorsAtDistance(viewInfo: any, distance: number, centerX: number) {
    const perspective = this.calculatePerspective(distance);

    viewInfo.doors.forEach((door: any) => {
      if (door.distance === distance) {
        if (door.type === 'hidden') {
          this.ctx.strokeStyle = this.colors.hiddenDoor;
        } else {
          this.ctx.strokeStyle = this.colors.wall;
        }

        this.renderDoor(perspective, centerX, door.type, door.offset || 0);
      }
    });
  }

  /**
   * Render passages at a specific distance
   */
  renderPassagesAtDistance(viewInfo: any, distance: number, centerX: number) {
    const perspective = this.calculatePerspective(distance);

    viewInfo.passages.forEach((passage: any) => {
      if (passage.distance === distance) {
        this.ctx.strokeStyle = this.colors.secretPassage;
        this.renderPassage(perspective, centerX, passage.type, passage.offset || 0);
      }
    });
  }

  /**
   * Calculate perspective scaling for distance
   */
  calculatePerspective(distance: number) {
    const cacheKey = distance;
    if (this.perspectiveCache.has(cacheKey)) {
      return this.perspectiveCache.get(cacheKey);
    }

    // Perspective calculation - further = smaller
    const scale = 1 / (distance * 0.5 + 0.5);
    const wallWidth = this.width * scale;
    const wallHeight = this.wallHeight * scale;

    const leftX = (this.width - wallWidth) / 2;
    const rightX = (this.width + wallWidth) / 2;
    const topY = this.ceilingLevel + this.height * 0.2 * (1 - scale);
    const bottomY = this.floorLevel - this.height * 0.2 * (1 - scale);

    const perspective = {
      scale,
      wallWidth,
      wallHeight,
      leftX,
      rightX,
      topY,
      bottomY,
      centerX: this.width / 2,
      centerY: (topY + bottomY) / 2,
    };

    this.perspectiveCache.set(cacheKey, perspective);
    return perspective;
  }

  /**
   * Render front wall (blocking view)
   */
  renderFrontWall(perspective: any, centerX: number, offset: number = 0) {
    const { wallWidth, topY, bottomY } = perspective;

    // Calculate horizontal position based on offset from center
    const leftX = centerX + (offset - 0.5) * wallWidth;
    const rightX = centerX + (offset + 0.5) * wallWidth;

    this.ctx.beginPath();
    // Draw opaque black fill first to hide distant objects (Painter's Algorithm)
    this.ctx.fillStyle = this.colors.background;
    this.ctx.rect(leftX, topY, rightX - leftX, bottomY - topY);
    this.ctx.fill();

    // Draw wireframe outline
    this.ctx.beginPath();
    this.ctx.rect(leftX, topY, rightX - leftX, bottomY - topY);
    this.ctx.stroke();
  }

  /**
   * Render left side wall segment with improved continuity
   */
  renderLeftWallSegment(perspective: any, centerX: number, distance: number, viewInfo: any, offset: number = -1) {
    const { wallWidth, topY, bottomY } = perspective;

    // Ensure offset is negative for left side
    const safeOffset = offset > 0 ? -offset : offset;

    // Current wall edge position (inner edge)
    // For offset -1 (corridor), this is at -0.5 * wallWidth (left edge of center tile)
    // For offset -2 (wider room), this is at -1.5 * wallWidth
    const currentInnerX = centerX + (safeOffset + 0.5) * wallWidth;

    // Outer edge is 1 unit further left
    const currentOuterX = centerX + (safeOffset - 0.5) * wallWidth;

    this.ctx.beginPath();

    if (distance === 1) {
      // For distance 1, connect current inner edge to screen edge or outer edge
      // Simply drawing the trapezoid face

      this.ctx.moveTo(currentOuterX - 1000, 0); // Far off-screen left
      this.ctx.lineTo(currentInnerX, topY);
      this.ctx.moveTo(currentOuterX - 1000, this.height);
      this.ctx.lineTo(currentInnerX, bottomY);

      // Vertical wall face at current distance
      this.ctx.moveTo(currentInnerX, topY);
      this.ctx.lineTo(currentInnerX, bottomY);
    } else {
      // For distance > 1. connect from previous distance's perspective
      const prevPerspective = this.calculatePerspective(distance - 1);

      // Previous wall inner edge (closer to camera)
      const prevInnerX = centerX + (safeOffset + 0.5) * prevPerspective.wallWidth;

      // Draw the side face
      this.ctx.fillStyle = this.colors.background;

      // Create path for fill
      this.ctx.beginPath();
      this.ctx.moveTo(prevInnerX, prevPerspective.topY);
      this.ctx.lineTo(currentInnerX, topY);
      this.ctx.lineTo(currentInnerX, bottomY);
      this.ctx.lineTo(prevInnerX, prevPerspective.bottomY);
      this.ctx.closePath();
      this.ctx.fill();

      // Stroke edges
      this.ctx.beginPath();
      // Top edge
      this.ctx.moveTo(prevInnerX, prevPerspective.topY);
      this.ctx.lineTo(currentInnerX, topY);

      // Bottom edge
      this.ctx.moveTo(prevInnerX, prevPerspective.bottomY);
      this.ctx.lineTo(currentInnerX, bottomY);

      // Vertical edge at current distance
      this.ctx.moveTo(currentInnerX, topY);
      this.ctx.lineTo(currentInnerX, bottomY);

      // Vertical edge at previous distance (closer)
      this.ctx.moveTo(prevInnerX, prevPerspective.topY);
      this.ctx.lineTo(prevInnerX, prevPerspective.bottomY);
    }

    this.ctx.stroke();
  }

  /**
   * Render left side wall (legacy method - kept for compatibility)
   */
  renderLeftWall(perspective: any, centerX: number) {
    this.renderLeftWallSegment(perspective, centerX, 1, null as any);
  }

  /**
   * Render right side wall segment with improved continuity
   */
  renderRightWallSegment(perspective: any, centerX: number, distance: number, viewInfo: any, offset: number = 1) {
    const { wallWidth, topY, bottomY } = perspective;

    // Ensure offset is positive for right side
    const safeOffset = offset < 0 ? -offset : offset;

    // Current wall edge position (inner edge)
    // For offset 1 (corridor), this is at +0.5 * wallWidth (right edge of center tile)
    const currentInnerX = centerX + (safeOffset - 0.5) * wallWidth;

    // Outer edge is 1 unit further right
    const currentOuterX = centerX + (safeOffset + 0.5) * wallWidth;

    this.ctx.beginPath();

    if (distance === 1) {
      // For distance 1, connect current inner edge to screen edge or outer edge

      this.ctx.moveTo(currentOuterX + 1000, 0); // Far off-screen right
      this.ctx.lineTo(currentInnerX, topY);
      this.ctx.moveTo(currentOuterX + 1000, this.height);
      this.ctx.lineTo(currentInnerX, bottomY);

      // Vertical wall face at current distance
      this.ctx.moveTo(currentInnerX, topY);
      this.ctx.lineTo(currentInnerX, bottomY);
    } else {
      // For distance > 1. connect from previous distance's perspective
      const prevPerspective = this.calculatePerspective(distance - 1);

      // Previous wall inner edge (closer to camera)
      const prevInnerX = centerX + (safeOffset - 0.5) * prevPerspective.wallWidth;

      // Draw the side face
      this.ctx.fillStyle = this.colors.background;

      // Create path for fill
      this.ctx.beginPath();
      this.ctx.moveTo(prevInnerX, prevPerspective.topY);
      this.ctx.lineTo(currentInnerX, topY);
      this.ctx.lineTo(currentInnerX, bottomY);
      this.ctx.lineTo(prevInnerX, prevPerspective.bottomY);
      this.ctx.closePath();
      this.ctx.fill();

      // Stroke edges
      this.ctx.beginPath();
      // Top edge
      this.ctx.moveTo(prevInnerX, prevPerspective.topY);
      this.ctx.lineTo(currentInnerX, topY);

      // Bottom edge
      this.ctx.moveTo(prevInnerX, prevPerspective.bottomY);
      this.ctx.lineTo(currentInnerX, bottomY);

      // Vertical edge at current distance
      this.ctx.moveTo(currentInnerX, topY);
      this.ctx.lineTo(currentInnerX, bottomY);

      // Vertical edge at previous distance (closer)
      this.ctx.moveTo(prevInnerX, prevPerspective.topY);
      this.ctx.lineTo(prevInnerX, prevPerspective.bottomY);
    }

    this.ctx.stroke();
  }

  /**
   * Render right side wall (legacy method - kept for compatibility)
   */
  renderRightWall(perspective: any, centerX: number) {
    this.renderRightWallSegment(perspective, centerX, 1, null as any);
  }

  /**
   * Render a door opening
   */
  /**
   * Render a door opening
   */
  renderDoor(perspective: any, centerX: number, doorType: string, offset: number = 0) {
    const { wallWidth, topY, bottomY } = perspective;

    // Adjust center for offset
    const segmentCenterX = centerX + offset * wallWidth;
    const leftX = segmentCenterX - wallWidth / 2;
    const rightX = segmentCenterX + wallWidth / 2;

    // Full tile dimensions (the "Wall" face)
    const tileWidth = rightX - leftX;
    const tileHeight = bottomY - topY;

    // 1. OCCLUSION: Fill the entire tile face with black to hide what's behind
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(leftX - 1, topY - 1, tileWidth + 2, tileHeight + 2); // Slight overlap to prevent seam cracks

    // 2. WALL-STYLE DOOR: Just a colored wall frame
    this.ctx.lineWidth = 2;

    let doorColor;
    if (doorType === 'hidden') {
      // "Discovered secret doors - are black walls"
      doorColor = this.colors.doorHidden;
    } else {
      // Normal door - "Make other doors Red"
      doorColor = this.colors.door;
    }

    this.ctx.fillStyle = doorColor;
    this.ctx.strokeStyle = doorColor;

    // Fill tile face (solid color)
    this.ctx.fillRect(leftX - 1, topY - 1, tileWidth + 2, tileHeight + 2);

    this.ctx.beginPath();
    this.ctx.rect(leftX, topY, tileWidth, tileHeight);
    this.ctx.stroke();
  }

  /**
   * Render a secret passage
   */
  renderPassage(perspective: any, centerX: number, passageType: string, offset: number = 0) {
    const { wallWidth, topY, bottomY } = perspective;

    // Adjust center for offset
    const segmentCenterX = centerX + offset * wallWidth;
    const leftX = segmentCenterX - wallWidth / 2;
    const rightX = segmentCenterX + wallWidth / 2;

    this.ctx.beginPath();
    this.ctx.setLineDash([3, 3]);

    // Draw passage outline
    const passageLeft = leftX + (rightX - leftX) * 0.1;
    const passageRight = rightX - (rightX - leftX) * 0.1;
    this.ctx.rect(passageLeft, topY, passageRight - passageLeft, bottomY - topY);
    this.ctx.stroke();

    this.ctx.setLineDash([]);

    // Add passage indicator
    this.ctx.fillStyle = this.colors.secretPassage;
    this.ctx.font = '12px "Courier New", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('S', (passageLeft + passageRight) / 2, (topY + bottomY) / 2);
    this.ctx.textAlign = 'left';
  }

  /**
   * Render status information
   */
  renderStatusInfo(dungeon: any, viewInfo: any) {
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '14px "Courier New", monospace';

    const position = viewInfo.position;
    const floorInfo = dungeon.getCurrentFloorInfo();

    // Position and direction
    this.ctx.fillText(`Floor ${position.floor}`, 10, 20);
    this.ctx.fillText(`Pos: ${position.x}, ${position.y}`, 10, 40);
    this.ctx.fillText(`Facing: ${viewInfo.facing}`, 10, 60);

    // Floor statistics
    this.ctx.font = '12px "Courier New", monospace';
    this.ctx.fillText(`Encounters: ${floorInfo.encounters}`, 10, this.height - 40);
    this.ctx.fillText(`Specials: ${floorInfo.specialSquares}`, 10, this.height - 20);
  }

  /**
   * Render special indicators for current position
   */
  renderSpecialIndicators(dungeon: any) {
    const tile = dungeon.getTile(dungeon.playerX, dungeon.playerY);

    if (tile.startsWith('trap_')) {
      this.renderTrapIndicator(tile);
    }

    // Check for jacks (edge egress points)
    const currentTile = dungeon.getTile(dungeon.playerX, dungeon.playerY);
    if (currentTile === 'jack_entry' || currentTile === 'stairs_up') {
      this.renderJackIndicator('entry');
    } else if (currentTile === 'jack_deep' || currentTile === 'stairs_down') {
      this.renderJackIndicator('deep');
    }

    // Check for special squares
    const special = dungeon.currentFloorData.specialSquares.find(
      (spec: any) => spec.x === dungeon.playerX && spec.y === dungeon.playerY
    );

    if (special) {
      this.renderSpecialSquareIndicator(special);
    }
  }

  /**
   * Render trap indicator
   */
  renderTrapIndicator(trapTile: string) {
    const trapType = trapTile.replace('trap_', '');

    this.ctx.fillStyle = this.colors.trap;
    this.ctx.font = 'bold 16px "Courier New", monospace';
    this.ctx.textAlign = 'center';

    this.ctx.fillText('⚠️ TRAP DETECTED ⚠️', this.width / 2, this.height - 100);
    this.ctx.fillText(
      `Type: ${trapType.replace('_', ' ').toUpperCase()}`,
      this.width / 2,
      this.height - 80
    );

    this.ctx.textAlign = 'left';
  }

  /**
   * Render jack (edge egress point) indicator
   */
  renderJackIndicator(jackType: string) {
    this.ctx.fillStyle = jackType === 'entry' ? '#22c55e' : '#06b6d4';
    this.ctx.font = 'bold 16px "Courier New", monospace';
    this.ctx.textAlign = 'center';

    if (jackType === 'entry') {
      this.ctx.fillText('🔌 JACK OUT 🔌', this.width / 2, this.height - 60);
      this.ctx.fillText('Press U to return to Hub', this.width / 2, this.height - 40);
    } else {
      this.ctx.fillText('🔌 JACK IN DEEPER 🔌', this.width / 2, this.height - 60);
      this.ctx.fillText('Press D to dive deeper', this.width / 2, this.height - 40);
    }

    this.ctx.textAlign = 'left';
  }

  /**
   * Render stairs indicator (legacy - use renderJackIndicator)
   */
  renderStairsIndicator(direction: string) {
    this.ctx.fillStyle = this.colors.stairs;
    this.ctx.font = 'bold 16px "Courier New", monospace';
    this.ctx.textAlign = 'center';

    const symbol = direction === 'up' ? '⬆️' : '⬇️';
    const text = direction === 'up' ? 'STAIRS UP' : 'STAIRS DOWN';

    this.ctx.fillText(symbol + ' ' + text + ' ' + symbol, this.width / 2, this.height - 60);
    this.ctx.fillText(
      `Press ${direction === 'up' ? 'U' : 'D'} to use`,
      this.width / 2,
      this.height - 40
    );

    this.ctx.textAlign = 'left';
  }

  /**
   * Render special square indicator
   */
  renderSpecialSquareIndicator(special: any) {
    this.ctx.fillStyle = this.colors.specialSquare;
    this.ctx.font = 'bold 14px "Courier New", monospace';
    this.ctx.textAlign = 'center';

    this.ctx.fillText('✨ SPECIAL LOCATION ✨', this.width / 2, this.height - 140);
    this.ctx.fillText(
      special.type.replace('_', ' ').toUpperCase(),
      this.width / 2,
      this.height - 120
    );
    this.ctx.fillText('Press SPACE to interact', this.width / 2, this.height - 100);

    this.ctx.textAlign = 'left';
  }

  /**
   * Render placeholder when dungeon is not available
   */
  renderPlaceholder() {
    this.clear();

    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '16px "Courier New", monospace';
    this.ctx.textAlign = 'center';

    this.ctx.fillText('DESCENT: CYBER WIZARDRY', this.width / 2, this.height / 2 - 40);
    this.ctx.fillText('3D Dungeon Renderer', this.width / 2, this.height / 2 - 20);
    this.ctx.fillText('Initializing dungeon...', this.width / 2, this.height / 2 + 20);

    this.ctx.textAlign = 'left';
  }

  /**
   * Update viewport size
   */
  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    // Recalculate floor and ceiling levels
    this.floorLevel = this.height * 0.7;
    this.ceilingLevel = this.height * 0.3;

    // Clear perspective cache
    this.perspectiveCache.clear();
  }

  /**
   * Get current viewport dimensions
   */
  getSize() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Clear the perspective cache (call when changing view parameters)
   */
  clearCache() {
    this.perspectiveCache.clear();
  }

  /**
   * Render monsters at a specific distance
   */
  renderMonstersAtDistance(viewInfo: any, distance: number, centerX: number) {
    if (!viewInfo.monsters) return;

    const perspective = this.calculatePerspective(distance);

    viewInfo.monsters.forEach((monsterData: any) => {
      if (monsterData.distance === distance && monsterData.monster.portraitModel) {
        this.renderMonsterWireframe(
          monsterData.monster.portraitModel,
          perspective,
          centerX,
          monsterData.offset || 0
        );
      }
    });
  }

  /**
   * Render a monster's 3D wireframe in the dungeon view
   */
  renderMonsterWireframe(model: any, perspective: any, centerX: number, offset: number) {
    if (!model || !model.vertices || !model.edges) return;

    const { wallWidth, wallHeight, topY, bottomY } = perspective;

    // Calculate center position for the monster
    // Use offset to handle positioning if we ever support side-monsters (though mainly center for now)
    const monsterCenterX = centerX + offset * wallWidth;

    // Position relative to the floor/ceiling perspective
    // Center it vertically between floor and ceiling, then adjust to stand on floor
    // The perspective.centerY is exactly the middle of the corridor at that distance
    const monsterCenterY = perspective.centerY + wallHeight * 0.1;

    // Scale factor relative to wall height
    // Adjust this multiplier to tune monster size in the corridor
    const sizeScale = wallHeight * 0.45;

    // Use model specific scale or default
    const modelScale = (model.scale || 1.0) * sizeScale;

    // Transform vertices
    const transformedVertices = model.vertices.map((vertex: any) => {
      // Basic 3D rotation from model data
      const [vx, vy, vz] = vertex;

      // Apply model rotation if present (e.g., [0, 15, 0])
      let x = vx,
        y = vy,
        z = vz;

      if (model.rotation) {
        const [rotX, rotY, rotZ] = model.rotation;

        // Apply Y rotation (most common)
        if (rotY !== 0) {
          const rad = (rotY * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const nx = x * cos - z * sin;
          const nz = x * sin + z * cos;
          x = nx;
          z = nz;
        }
      }

      return { x, y, z };
    });

    // Project and Draw
    this.ctx.beginPath();
    // Use a distinct color (e.g. Warning Red)
    this.ctx.strokeStyle = '#ef4444';

    // Thinner lines further away, but minimum width of 1
    this.ctx.lineWidth = Math.max(1, 2 * perspective.scale);

    model.edges.forEach((edge: any) => {
      const [startIdx, endIdx] = edge;

      if (startIdx < transformedVertices.length && endIdx < transformedVertices.length) {
        const v1 = transformedVertices[startIdx];
        const v2 = transformedVertices[endIdx];

        // Project to screen space
        // x is horizontal, y is vertical (up is positive in model, down is positive in canvas)
        // We invert Y because canvas Y increases downwards
        const x1 = monsterCenterX + v1.x * modelScale;
        const y1 = monsterCenterY - v1.y * modelScale;

        const x2 = monsterCenterX + v2.x * modelScale;
        const y2 = monsterCenterY - v2.y * modelScale;

        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
      }
    });

    this.ctx.stroke();
  }

  /**
   * Render objects at a specific distance
   */
  renderObjectsAtDistance(viewInfo: any, distance: number, centerX: number) {
    if (!viewInfo.objects) return;

    const perspective = this.calculatePerspective(distance);

    viewInfo.objects.forEach((obj: any) => {
      if (obj.distance === distance) {
        if (obj.type === 'treasure') {
          this.renderTreasure(perspective, centerX, obj.offset || 0);
        }
      }
    });
  }

  /**
   * Render a treasure chest / data cache
   */
  renderTreasure(perspective: any, centerX: number, offset: number) {
    const { wallWidth, wallHeight, topY, bottomY } = perspective;

    // Calculate center position
    const objCenterX = centerX + offset * wallWidth;

    // Chest dimensions relative to wall
    const chestWidth = wallWidth * 0.4;
    const chestHeight = wallHeight * 0.25;
    const chestDepth = wallWidth * 0.3; // Estimated depth distortion

    // Position on floor
    const chestBottom = bottomY - wallHeight * 0.05; // Slightly raised or on floor
    const chestTop = chestBottom - chestHeight;
    const chestLeft = objCenterX - chestWidth / 2;
    const chestRight = objCenterX + chestWidth / 2;

    // Color: Amber/Gold for Data Cache
    this.ctx.strokeStyle = '#f59e0b'; // Amber 500
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();

    // Front Face
    this.ctx.rect(chestLeft, chestTop, chestWidth, chestHeight);

    // Lid (Trapezoid top)
    const lidHeight = chestHeight * 0.3;
    const lidTop = chestTop - lidHeight;
    const lidInset = chestWidth * 0.1;

    this.ctx.moveTo(chestLeft, chestTop);
    this.ctx.lineTo(chestLeft + lidInset, lidTop);
    this.ctx.lineTo(chestRight - lidInset, lidTop);
    this.ctx.lineTo(chestRight, chestTop);

    // Lock/Detail
    const lockSize = chestWidth * 0.1;
    this.ctx.rect(objCenterX - lockSize / 2, chestTop + chestHeight * 0.2, lockSize, lockSize);

    this.ctx.stroke();

    // Fill with semi-transparent black to obscure implementation details behind it
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fill();
    this.ctx.stroke(); // Stroke again to ensure lines are on top
  }
}
