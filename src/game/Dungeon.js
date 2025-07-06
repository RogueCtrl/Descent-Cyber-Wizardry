/**
 * Dungeon Management
 * Handles dungeon layout, navigation, and events
 */
class Dungeon {
    constructor() {
        this.currentFloor = 1;
        this.maxFloors = 10;
        this.playerX = 0;
        this.playerY = 0;
        this.playerDirection = 0; // 0=North, 1=East, 2=South, 3=West
        
        this.floors = new Map();
        this.currentFloorData = null;
        
        this.initializeFloor(1);
    }
    
    /**
     * Initialize a floor
     */
    initializeFloor(floorNumber) {
        // For now, create a simple 20x20 grid
        const floor = {
            number: floorNumber,
            width: 20,
            height: 20,
            tiles: this.generateFloorTiles(20, 20),
            monsters: [],
            treasures: [],
            traps: [],
            stairs: { up: null, down: null }
        };
        
        this.floors.set(floorNumber, floor);
        
        if (floorNumber === this.currentFloor) {
            this.currentFloorData = floor;
        }
    }
    
    /**
     * Generate floor tiles
     */
    generateFloorTiles(width, height) {
        const tiles = [];
        
        for (let y = 0; y < height; y++) {
            tiles[y] = [];
            for (let x = 0; x < width; x++) {
                // Simple maze generation - walls on edges, corridors inside
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    tiles[y][x] = 'wall';
                } else {
                    tiles[y][x] = 'floor';
                }
            }
        }
        
        return tiles;
    }
    
    /**
     * Get tile at position
     */
    getTile(x, y, floor = null) {
        const floorData = floor ? this.floors.get(floor) : this.currentFloorData;
        
        if (!floorData || x < 0 || y < 0 || x >= floorData.width || y >= floorData.height) {
            return 'wall';
        }
        
        return floorData.tiles[y][x];
    }
    
    /**
     * Check if position is walkable
     */
    isWalkable(x, y, floor = null) {
        const tile = this.getTile(x, y, floor);
        return tile === 'floor' || tile === 'door' || tile === 'stairs';
    }
    
    /**
     * Move player
     */
    movePlayer(direction) {
        let newX = this.playerX;
        let newY = this.playerY;
        
        switch (direction) {
            case 'forward':
                switch (this.playerDirection) {
                    case 0: newY--; break; // North
                    case 1: newX++; break; // East
                    case 2: newY++; break; // South
                    case 3: newX--; break; // West
                }
                break;
                
            case 'backward':
                switch (this.playerDirection) {
                    case 0: newY++; break; // North
                    case 1: newX--; break; // East
                    case 2: newY--; break; // South
                    case 3: newX++; break; // West
                }
                break;
        }
        
        if (this.isWalkable(newX, newY)) {
            this.playerX = newX;
            this.playerY = newY;
            return true;
        }
        
        return false;
    }
    
    /**
     * Turn player
     */
    turnPlayer(direction) {
        switch (direction) {
            case 'left':
                this.playerDirection = (this.playerDirection + 3) % 4;
                break;
                
            case 'right':
                this.playerDirection = (this.playerDirection + 1) % 4;
                break;
        }
    }
    
    /**
     * Get current position
     */
    getPlayerPosition() {
        return {
            x: this.playerX,
            y: this.playerY,
            direction: this.playerDirection,
            floor: this.currentFloor
        };
    }
    
    /**
     * Get direction name
     */
    getDirectionName(direction = null) {
        const dir = direction !== null ? direction : this.playerDirection;
        const directions = ['North', 'East', 'South', 'West'];
        return directions[dir];
    }
    
    /**
     * Update dungeon (called each frame)
     */
    update(deltaTime) {
        // Update any animated elements, timers, etc.
        // For now, this is a placeholder
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            currentFloor: this.currentFloor,
            maxFloors: this.maxFloors,
            playerX: this.playerX,
            playerY: this.playerY,
            playerDirection: this.playerDirection,
            floors: Array.from(this.floors.entries())
        };
    }
    
    /**
     * Load from save data
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        this.currentFloor = saveData.currentFloor || 1;
        this.maxFloors = saveData.maxFloors || 10;
        this.playerX = saveData.playerX || 0;
        this.playerY = saveData.playerY || 0;
        this.playerDirection = saveData.playerDirection || 0;
        
        if (saveData.floors) {
            this.floors = new Map(saveData.floors);
            this.currentFloorData = this.floors.get(this.currentFloor);
        }
        
        if (!this.currentFloorData) {
            this.initializeFloor(this.currentFloor);
        }
    }
    
    /**
     * Get current floor info
     */
    getCurrentFloorInfo() {
        return {
            number: this.currentFloor,
            width: this.currentFloorData ? this.currentFloorData.width : 0,
            height: this.currentFloorData ? this.currentFloorData.height : 0,
            playerPosition: this.getPlayerPosition()
        };
    }
}