/**
 * 3D Viewport Renderer
 * Handles authentic Wizardry-style 3D wireframe rendering for dungeon exploration
 */
class Viewport3D {
    constructor(canvas, context) {
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

        // Color scheme (authentic Wizardry green on black)
        this.colors = {
            background: '#000000',
            wall: '#00ff00',
            hiddenDoor: '#00aa00',
            secretPassage: '#00cc00',
            specialSquare: '#ffff00',
            trap: '#ff4400',
            stairs: '#ffffff',
            text: '#00ff00'
        };

        // Perspective calculation cache
        this.perspectiveCache = new Map();
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
    render(dungeon, party) {
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
        }

        // Render status information
        this.renderStatusInfo(dungeon, viewInfo);

        // Render special indicators
        this.renderSpecialIndicators(dungeon);
    }


    /**
     * Check if a wall exists in viewInfo at specific distance and side
     */
    hasWallInViewInfo(viewInfo, distance, side) {
        return viewInfo.walls.some(wall =>
            wall.distance === distance && wall.side === side
        );
    }

    /**
     * Render walls at a specific distance
     */
    renderWallsAtDistance(viewInfo, distance, centerX) {
        const perspective = this.calculatePerspective(distance);
        this.ctx.strokeStyle = this.colors.wall;

        // Separate walls by type for proper depth sorting
        const frontWalls = [];
        const leftWalls = [];
        const rightWalls = [];

        viewInfo.walls.forEach(wall => {
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
        frontWalls.forEach(wall => {
            this.renderFrontWall(perspective, centerX, wall.offset || 0);
        });

        leftWalls.forEach(wall => {
            this.renderLeftWallSegment(perspective, centerX, distance, viewInfo, wall.offset || -1);
        });

        rightWalls.forEach(wall => {
            this.renderRightWallSegment(perspective, centerX, distance, viewInfo, wall.offset || 1);
        });
    }

    /**
     * Render doors at a specific distance
     */
    renderDoorsAtDistance(viewInfo, distance, centerX) {
        const perspective = this.calculatePerspective(distance);

        viewInfo.doors.forEach(door => {
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
    renderPassagesAtDistance(viewInfo, distance, centerX) {
        const perspective = this.calculatePerspective(distance);

        viewInfo.passages.forEach(passage => {
            if (passage.distance === distance) {
                this.ctx.strokeStyle = this.colors.secretPassage;
                this.renderPassage(perspective, centerX, passage.type, passage.offset || 0);
            }
        });
    }

    /**
     * Calculate perspective scaling for distance
     */
    calculatePerspective(distance) {
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
        const topY = this.ceilingLevel + (this.height * 0.2) * (1 - scale);
        const bottomY = this.floorLevel - (this.height * 0.2) * (1 - scale);

        const perspective = {
            scale,
            wallWidth,
            wallHeight,
            leftX,
            rightX,
            topY,
            bottomY,
            centerX: this.width / 2,
            centerY: (topY + bottomY) / 2
        };

        this.perspectiveCache.set(cacheKey, perspective);
        return perspective;
    }

    /**
     * Render front wall (blocking view)
     */
    renderFrontWall(perspective, centerX, offset = 0) {
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
    renderLeftWallSegment(perspective, centerX, distance, viewInfo, offset = -1) {
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
    renderLeftWall(perspective, centerX) {
        this.renderLeftWallSegment(perspective, centerX, 1);
    }

    /**
     * Render right side wall segment with improved continuity
     */
    renderRightWallSegment(perspective, centerX, distance, viewInfo, offset = 1) {
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
    renderRightWall(perspective, centerX) {
        this.renderRightWallSegment(perspective, centerX, 1);
    }

    /**
     * Render a door opening
     */
    renderDoor(perspective, centerX, doorType, offset = 0) {
        const { wallWidth, topY, bottomY } = perspective;

        // Adjust center for offset
        const segmentCenterX = centerX + offset * wallWidth;
        const leftX = segmentCenterX - wallWidth / 2;
        const rightX = segmentCenterX + wallWidth / 2;

        const doorWidth = (rightX - leftX) * 0.8;
        const doorLeft = leftX + (rightX - leftX - doorWidth) / 2;
        const doorRight = doorLeft + doorWidth;
        const doorHeight = (bottomY - topY) * 0.9;
        const doorTop = topY + (bottomY - topY - doorHeight) / 2;
        const doorBottom = doorTop + doorHeight;

        this.ctx.beginPath();

        if (doorType === 'hidden') {
            // Hidden door - slightly different pattern
            this.ctx.setLineDash([5, 5]);
            this.ctx.rect(doorLeft, doorTop, doorWidth, doorHeight);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Add hidden door indicator
            this.ctx.fillStyle = this.colors.hiddenDoor;
            this.ctx.font = '12px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('H', (doorLeft + doorRight) / 2, (doorTop + doorBottom) / 2);
            this.ctx.textAlign = 'left';
        } else {
            // Normal door
            this.ctx.rect(doorLeft, doorTop, doorWidth, doorHeight);
            this.ctx.stroke();
        }
    }

    /**
     * Render a secret passage
     */
    renderPassage(perspective, centerX, passageType, offset = 0) {
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
    renderStatusInfo(dungeon, viewInfo) {
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
    renderSpecialIndicators(dungeon) {
        const tile = dungeon.getTile(dungeon.playerX, dungeon.playerY);

        if (tile.startsWith('trap_')) {
            this.renderTrapIndicator(tile);
        }

        // Check for stairs
        const stairs = dungeon.currentFloorData.stairs;
        if (stairs.up && stairs.up.x === dungeon.playerX && stairs.up.y === dungeon.playerY) {
            this.renderStairsIndicator('up');
        } else if (stairs.down && stairs.down.x === dungeon.playerX && stairs.down.y === dungeon.playerY) {
            this.renderStairsIndicator('down');
        }

        // Check for special squares
        const special = dungeon.currentFloorData.specialSquares.find(spec =>
            spec.x === dungeon.playerX && spec.y === dungeon.playerY
        );

        if (special) {
            this.renderSpecialSquareIndicator(special);
        }
    }

    /**
     * Render trap indicator
     */
    renderTrapIndicator(trapTile) {
        const trapType = trapTile.replace('trap_', '');

        this.ctx.fillStyle = this.colors.trap;
        this.ctx.font = 'bold 16px "Courier New", monospace';
        this.ctx.textAlign = 'center';

        this.ctx.fillText('⚠️ TRAP DETECTED ⚠️', this.width / 2, this.height - 100);
        this.ctx.fillText(`Type: ${trapType.replace('_', ' ').toUpperCase()}`, this.width / 2, this.height - 80);

        this.ctx.textAlign = 'left';
    }

    /**
     * Render stairs indicator
     */
    renderStairsIndicator(direction) {
        this.ctx.fillStyle = this.colors.stairs;
        this.ctx.font = 'bold 16px "Courier New", monospace';
        this.ctx.textAlign = 'center';

        const symbol = direction === 'up' ? '⬆️' : '⬇️';
        const text = direction === 'up' ? 'STAIRS UP' : 'STAIRS DOWN';

        this.ctx.fillText(symbol + ' ' + text + ' ' + symbol, this.width / 2, this.height - 60);
        this.ctx.fillText(`Press ${direction === 'up' ? 'U' : 'D'} to use`, this.width / 2, this.height - 40);

        this.ctx.textAlign = 'left';
    }

    /**
     * Render special square indicator
     */
    renderSpecialSquareIndicator(special) {
        this.ctx.fillStyle = this.colors.specialSquare;
        this.ctx.font = 'bold 14px "Courier New", monospace';
        this.ctx.textAlign = 'center';

        this.ctx.fillText('✨ SPECIAL LOCATION ✨', this.width / 2, this.height - 140);
        this.ctx.fillText(special.type.replace('_', ' ').toUpperCase(), this.width / 2, this.height - 120);
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
    setSize(width, height) {
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
            height: this.height
        };
    }

    /**
     * Clear the perspective cache (call when changing view parameters)
     */
    clearCache() {
        this.perspectiveCache.clear();
    }
}