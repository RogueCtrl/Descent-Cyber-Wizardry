/**
 * Dungeon Management
 * Handles authentic Wizardry-style dungeon layout, navigation, and events
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
        
        // Discovery state for hidden elements
        this.discoveredSecrets = new Set(); // Format: "floor:x:y:type"
        this.disarmedTraps = new Set(); // Format: "floor:x:y"
        this.usedSpecials = new Set(); // Format: "floor:x:y" for one-time use items
        
        this.initializeFloor(1);
    }
    
    /**
     * Initialize a floor with authentic Wizardry-style maze generation
     */
    initializeFloor(floorNumber) {
        console.log(`Generating floor ${floorNumber}...`);
        
        const floor = {
            number: floorNumber,
            width: 20,
            height: 20,
            tiles: this.generateWizardryMaze(20, 20, floorNumber),
            monsters: [],
            treasures: [],
            encounters: this.generateEncounters(floorNumber),
            specialSquares: this.generateSpecialSquares(floorNumber),
            stairs: this.generateStairs(floorNumber)
        };
        
        this.floors.set(floorNumber, floor);
        
        if (floorNumber === this.currentFloor) {
            this.currentFloorData = floor;
            this.setStartPosition(floor);
        }
        
        console.log(`Floor ${floorNumber} generated with ${floor.encounters.length} encounters and ${floor.specialSquares.length} special features`);
    }
    
    /**
     * Generate authentic Wizardry-style maze with complex layouts
     */
    generateWizardryMaze(width, height, floorNumber) {
        const tiles = Array(height).fill().map(() => Array(width).fill('wall'));
        
        // Difficulty increases with depth
        const complexity = Math.min(0.3 + (floorNumber * 0.05), 0.8);
        const roomChance = Math.max(0.4 - (floorNumber * 0.02), 0.2);
        const secretChance = Math.min(0.05 + (floorNumber * 0.01), 0.15);
        const trapChance = Math.min(0.03 + (floorNumber * 0.02), 0.12);
        
        // Step 1: Create rooms
        const rooms = this.generateRooms(width, height, roomChance);
        this.carveRooms(tiles, rooms);
        
        // Step 2: Create main corridor network
        this.carveMainCorridors(tiles, width, height);
        
        // Step 3: Connect rooms to corridors
        this.connectRoomsToCorridors(tiles, rooms);
        
        // Step 4: Add maze-like passages for complexity
        this.addMazePassages(tiles, width, height, complexity);
        
        // Step 5: Add hidden doors and secret passages
        this.addSecretFeatures(tiles, width, height, secretChance);
        
        // Step 6: Add trap squares
        this.addTraps(tiles, width, height, trapChance, floorNumber);
        
        // Step 7: Ensure proper connections and validate maze
        this.validateAndFixMaze(tiles, width, height);
        
        return tiles;
    }
    
    /**
     * Generate rooms for the maze
     */
    generateRooms(width, height, roomChance) {
        const rooms = [];
        const maxRooms = Math.floor((width * height * roomChance) / 20);
        
        for (let attempts = 0; attempts < maxRooms * 3; attempts++) {
            const roomWidth = Random.integer(3, 6);
            const roomHeight = Random.integer(3, 6);
            const x = Random.integer(1, width - roomWidth - 1);
            const y = Random.integer(1, height - roomHeight - 1);
            
            const newRoom = { x, y, width: roomWidth, height: roomHeight };
            
            // Check for overlaps with existing rooms
            const overlaps = rooms.some(room => 
                this.roomsOverlap(newRoom, room, 2) // 2-tile buffer
            );
            
            if (!overlaps) {
                rooms.push(newRoom);
                if (rooms.length >= maxRooms) break;
            }
        }
        
        return rooms;
    }
    
    /**
     * Check if two rooms overlap (with buffer)
     */
    roomsOverlap(room1, room2, buffer = 1) {
        return !(room1.x + room1.width + buffer < room2.x ||
                room2.x + room2.width + buffer < room1.x ||
                room1.y + room1.height + buffer < room2.y ||
                room2.y + room2.height + buffer < room1.y);
    }
    
    /**
     * Carve rooms into the maze
     */
    carveRooms(tiles, rooms) {
        rooms.forEach(room => {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    tiles[y][x] = 'floor';
                }
            }
        });
    }
    
    /**
     * Create main corridor network
     */
    carveMainCorridors(tiles, width, height) {
        // Create primary horizontal corridors
        const corridorSpacing = 4;
        for (let y = 2; y < height - 2; y += corridorSpacing) {
            for (let x = 1; x < width - 1; x++) {
                if (Random.chance(0.8)) {
                    tiles[y][x] = 'floor';
                }
            }
        }
        
        // Create primary vertical corridors
        for (let x = 2; x < width - 2; x += corridorSpacing) {
            for (let y = 1; y < height - 1; y++) {
                if (Random.chance(0.8)) {
                    tiles[y][x] = 'floor';
                }
            }
        }
    }
    
    /**
     * Connect rooms to corridor network
     */
    connectRoomsToCorridors(tiles, rooms) {
        rooms.forEach(room => {
            // Find the nearest corridor for each room
            const centerX = Math.floor(room.x + room.width / 2);
            const centerY = Math.floor(room.y + room.height / 2);
            
            // Create a path from room to nearest corridor
            this.createPathToNearestFloor(tiles, centerX, centerY);
        });
    }
    
    /**
     * Create path from point to nearest floor tile
     */
    createPathToNearestFloor(tiles, startX, startY) {
        const width = tiles[0].length;
        const height = tiles.length;
        const visited = new Set();
        const queue = [{x: startX, y: startY, path: []}];
        
        while (queue.length > 0) {
            const {x, y, path} = queue.shift();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // If we found a floor tile that's not our starting room, create path
            if (tiles[y][x] === 'floor' && (x !== startX || y !== startY)) {
                path.forEach(({px, py}) => {
                    tiles[py][px] = 'floor';
                });
                return;
            }
            
            // Add adjacent cells to queue
            [[0,1], [1,0], [0,-1], [-1,0]].forEach(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(`${nx},${ny}`)) {
                    queue.push({
                        x: nx, y: ny, 
                        path: [...path, {px: x, py: y}]
                    });
                }
            });
        }
    }
    
    /**
     * Add maze-like passages for complexity
     */
    addMazePassages(tiles, width, height, complexity) {
        const passageCount = Math.floor(width * height * complexity * 0.1);
        
        for (let i = 0; i < passageCount; i++) {
            const startX = Random.integer(1, width - 2);
            const startY = Random.integer(1, height - 2);
            
            if (tiles[startY][startX] === 'wall') {
                this.carveMazePassage(tiles, startX, startY, width, height);
            }
        }
    }
    
    /**
     * Carve a single maze passage using random walk
     */
    carveMazePassage(tiles, startX, startY, width, height) {
        const directions = [[0,1], [1,0], [0,-1], [-1,0]];
        let x = startX;
        let y = startY;
        let length = Random.integer(3, 8);
        
        tiles[y][x] = 'floor';
        
        for (let i = 0; i < length; i++) {
            const availableDirections = directions.filter(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                return nx >= 1 && nx < width - 1 && ny >= 1 && ny < height - 1;
            });
            
            if (availableDirections.length === 0) break;
            
            const [dx, dy] = Random.choice(availableDirections);
            x += dx;
            y += dy;
            
            tiles[y][x] = 'floor';
            
            // Small chance to branch
            if (Random.chance(0.3)) {
                const branchDir = Random.choice(availableDirections);
                const bx = x + branchDir[0];
                const by = y + branchDir[1];
                if (bx >= 1 && bx < width - 1 && by >= 1 && by < height - 1) {
                    tiles[by][bx] = 'floor';
                }
            }
        }
    }
    
    /**
     * Add secret features (hidden doors and secret passages)
     */
    addSecretFeatures(tiles, width, height, secretChance) {
        const secretCount = Math.floor(width * height * secretChance);
        
        for (let i = 0; i < secretCount; i++) {
            const x = Random.integer(1, width - 2);
            const y = Random.integer(1, height - 2);
            
            if (tiles[y][x] === 'wall' && this.canPlaceSecret(tiles, x, y)) {
                if (Random.chance(0.7)) {
                    tiles[y][x] = 'hidden_door';
                } else {
                    tiles[y][x] = 'secret_passage';
                }
            }
        }
    }
    
    /**
     * Check if a secret feature can be placed at location
     */
    canPlaceSecret(tiles, x, y) {
        const adjacentFloors = [[0,1], [1,0], [0,-1], [-1,0]]
            .map(([dx, dy]) => tiles[y + dy] && tiles[y + dy][x + dx])
            .filter(tile => tile === 'floor')
            .length;
        
        // Secret features should connect two areas
        return adjacentFloors >= 2;
    }
    
    /**
     * Add trap squares
     */
    addTraps(tiles, width, height, trapChance, floorNumber) {
        const trapTypes = ['pit_trap', 'poison_dart', 'teleport_trap', 'alarm_trap'];
        const trapCount = Math.floor(width * height * trapChance);
        
        for (let i = 0; i < trapCount; i++) {
            const x = Random.integer(1, width - 2);
            const y = Random.integer(1, height - 2);
            
            if (tiles[y][x] === 'floor' && this.canPlaceTrap(tiles, x, y)) {
                const trapType = Random.choice(trapTypes);
                tiles[y][x] = `trap_${trapType}`;
            }
        }
    }
    
    /**
     * Check if a trap can be placed at location
     */
    canPlaceTrap(tiles, x, y) {
        // Don't place traps adjacent to stairs or special squares
        const adjacentSpecial = [[0,1], [1,0], [0,-1], [-1,0]]
            .some(([dx, dy]) => {
                const tile = tiles[y + dy] && tiles[y + dy][x + dx];
                return tile && (tile.startsWith('stairs') || tile.includes('special'));
            });
        
        return !adjacentSpecial;
    }
    
    /**
     * Generate encounters for the floor
     */
    generateEncounters(floorNumber) {
        const encounterCount = Random.integer(5, 12);
        const encounters = [];
        
        for (let i = 0; i < encounterCount; i++) {
            encounters.push({
                x: Random.integer(1, 19),
                y: Random.integer(1, 19),
                level: floorNumber + Random.integer(-1, 2),
                triggered: false,
                type: Random.chance(0.1) ? 'boss' : 'normal'
            });
        }
        
        return encounters;
    }
    
    /**
     * Generate special squares (fountains, teleporters, etc.)
     */
    generateSpecialSquares(floorNumber) {
        const specialTypes = [
            'healing_fountain', 'stamina_fountain', 'poison_fountain',
            'teleporter', 'message_square', 'treasure_chest'
        ];
        
        const specialCount = Random.integer(2, 5);
        const specials = [];
        
        for (let i = 0; i < specialCount; i++) {
            specials.push({
                x: Random.integer(1, 19),
                y: Random.integer(1, 19),
                type: Random.choice(specialTypes),
                used: false,
                message: this.generateSpecialMessage(Random.choice(specialTypes))
            });
        }
        
        return specials;
    }
    
    /**
     * Generate message for special squares
     */
    generateSpecialMessage(type) {
        const messages = {
            healing_fountain: "A crystal clear fountain bubbles with restorative waters.",
            stamina_fountain: "This fountain glows with energizing light.",
            poison_fountain: "The water here has a sickly green tint.",
            teleporter: "Strange runes circle this magical portal.",
            message_square: "Ancient text is carved into the floor here.",
            treasure_chest: "A sturdy chest sits here, lock gleaming."
        };
        
        return messages[type] || "Something unusual is here.";
    }
    
    /**
     * Generate stairs for multi-level navigation
     */
    generateStairs(floorNumber) {
        const stairs = {};
        
        // Stairs up (except on floor 1)
        if (floorNumber > 1) {
            stairs.up = {
                x: Random.integer(1, 19),
                y: Random.integer(1, 19)
            };
        }
        
        // Stairs down (except on max floor)
        if (floorNumber < this.maxFloors) {
            stairs.down = {
                x: Random.integer(1, 19),
                y: Random.integer(1, 19)
            };
        }
        
        return stairs;
    }
    
    /**
     * Validate maze and fix connectivity issues
     */
    validateAndFixMaze(tiles, width, height) {
        // Ensure there are enough floor tiles
        const floorCount = tiles.flat().filter(tile => 
            tile === 'floor' || tile.startsWith('trap_') || tile === 'hidden_door'
        ).length;
        
        const minFloors = Math.floor(width * height * 0.3);
        
        if (floorCount < minFloors) {
            // Add more floor tiles to meet minimum
            const needed = minFloors - floorCount;
            for (let i = 0; i < needed; i++) {
                const x = Random.integer(1, width - 2);
                const y = Random.integer(1, height - 2);
                if (tiles[y][x] === 'wall') {
                    tiles[y][x] = 'floor';
                }
            }
        }
        
        // Ensure outer walls are solid
        for (let x = 0; x < width; x++) {
            tiles[0][x] = 'wall';
            tiles[height - 1][x] = 'wall';
        }
        for (let y = 0; y < height; y++) {
            tiles[y][0] = 'wall';
            tiles[y][width - 1] = 'wall';
        }
    }
    
    /**
     * Set starting position on floor
     */
    setStartPosition(floor) {
        // Find a suitable starting position
        for (let attempts = 0; attempts < 100; attempts++) {
            const x = Random.integer(1, floor.width - 2);
            const y = Random.integer(1, floor.height - 2);
            
            if (this.isWalkable(x, y)) {
                this.playerX = x;
                this.playerY = y;
                this.playerDirection = 0; // Start facing north
                break;
            }
        }
    }
    
    /**
     * Get tile at position
     */
    getTile(x, y, floor = null) {
        const floorData = floor ? this.floors.get(floor) : this.currentFloorData;
        
        if (!floorData) {
            return 'wall';
        }
        
        // Handle wrap-around (Wizardry feature)
        const wrappedX = ((x % floorData.width) + floorData.width) % floorData.width;
        const wrappedY = ((y % floorData.height) + floorData.height) % floorData.height;
        
        return floorData.tiles[wrappedY][wrappedX];
    }
    
    /**
     * Check if position is walkable
     */
    isWalkable(x, y, floor = null) {
        const tile = this.getTile(x, y, floor);
        const walkableTiles = [
            'floor', 'hidden_door', 'secret_passage',
            'trap_pit_trap', 'trap_poison_dart', 'trap_teleport_trap', 'trap_alarm_trap'
        ];
        return walkableTiles.includes(tile);
    }
    
    /**
     * Move player with wrap-around support
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
        
        // Apply wrap-around
        newX = ((newX % this.currentFloorData.width) + this.currentFloorData.width) % this.currentFloorData.width;
        newY = ((newY % this.currentFloorData.height) + this.currentFloorData.height) % this.currentFloorData.height;
        
        if (this.isWalkable(newX, newY)) {
            this.playerX = newX;
            this.playerY = newY;
            
            // Check for events at new position
            this.checkPositionEvents();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Check for events at current position
     */
    checkPositionEvents() {
        const tile = this.getTile(this.playerX, this.playerY);
        
        // Handle traps
        if (tile.startsWith('trap_')) {
            this.triggerTrap(tile);
        }
        
        // Check for encounters
        this.checkRandomEncounter();
        
        // Check for special squares
        this.checkSpecialSquare();
    }
    
    /**
     * Trigger a trap
     */
    triggerTrap(trapTile) {
        const trapKey = `${this.currentFloor}:${this.playerX}:${this.playerY}`;
        
        if (this.disarmedTraps.has(trapKey)) {
            return; // Already disarmed
        }
        
        const trapType = trapTile.replace('trap_', '');
        console.log(`Triggered ${trapType} at ${this.playerX}, ${this.playerY}`);
        
        // Emit trap event for UI handling
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('trap-triggered', {
                type: trapType,
                x: this.playerX,
                y: this.playerY,
                floor: this.currentFloor
            });
        }
    }
    
    /**
     * Check for random encounters
     */
    checkRandomEncounter() {
        // Base encounter chance per step
        const baseChance = 0.02 + (this.currentFloor * 0.005);
        
        if (Random.chance(baseChance)) {
            const encounter = this.currentFloorData.encounters.find(enc => 
                Math.abs(enc.x - this.playerX) <= 1 && 
                Math.abs(enc.y - this.playerY) <= 1 && 
                !enc.triggered
            );
            
            if (encounter) {
                encounter.triggered = true;
                console.log(`Encounter triggered at ${this.playerX}, ${this.playerY}`);
                
                // Emit encounter event
                if (window.engine && window.engine.eventSystem) {
                    window.engine.eventSystem.emit('encounter-triggered', {
                        encounter: encounter,
                        x: this.playerX,
                        y: this.playerY,
                        floor: this.currentFloor
                    });
                }
            }
        }
    }
    
    /**
     * Check for special squares
     */
    checkSpecialSquare() {
        const special = this.currentFloorData.specialSquares.find(spec =>
            spec.x === this.playerX && spec.y === this.playerY
        );
        
        if (special) {
            console.log(`Special square found: ${special.type}`);
            
            // Emit special square event
            if (window.engine && window.engine.eventSystem) {
                window.engine.eventSystem.emit('special-square-found', {
                    special: special,
                    x: this.playerX,
                    y: this.playerY,
                    floor: this.currentFloor
                });
            }
        }
    }
    
    /**
     * Search for hidden features at current position
     */
    searchArea() {
        const searchRadius = 1;
        const discoveries = [];
        
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                const x = this.playerX + dx;
                const y = this.playerY + dy;
                const tile = this.getTile(x, y);
                
                if (tile === 'hidden_door' || tile === 'secret_passage') {
                    const secretKey = `${this.currentFloor}:${x}:${y}:${tile}`;
                    
                    if (!this.discoveredSecrets.has(secretKey)) {
                        // Chance to discover based on party abilities
                        if (Random.chance(0.25)) { // Base 25% chance
                            this.discoveredSecrets.add(secretKey);
                            discoveries.push({
                                type: tile,
                                x: x,
                                y: y,
                                message: tile === 'hidden_door' ? 
                                    "You discovered a hidden door!" : 
                                    "You found a secret passage!"
                            });
                        }
                    }
                }
            }
        }
        
        return discoveries;
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
     * Change floor level
     */
    changeFloor(direction) {
        const stairs = this.currentFloorData.stairs;
        
        if (direction === 'up' && stairs.up && 
            stairs.up.x === this.playerX && stairs.up.y === this.playerY) {
            
            this.currentFloor--;
            if (!this.floors.has(this.currentFloor)) {
                this.initializeFloor(this.currentFloor);
            }
            this.currentFloorData = this.floors.get(this.currentFloor);
            
            // Position at stairs down on new floor
            const newStairs = this.currentFloorData.stairs;
            if (newStairs.down) {
                this.playerX = newStairs.down.x;
                this.playerY = newStairs.down.y;
            }
            
            return true;
            
        } else if (direction === 'down' && stairs.down && 
                  stairs.down.x === this.playerX && stairs.down.y === this.playerY) {
            
            this.currentFloor++;
            if (!this.floors.has(this.currentFloor)) {
                this.initializeFloor(this.currentFloor);
            }
            this.currentFloorData = this.floors.get(this.currentFloor);
            
            // Position at stairs up on new floor
            const newStairs = this.currentFloorData.stairs;
            if (newStairs.up) {
                this.playerX = newStairs.up.x;
                this.playerY = newStairs.up.y;
            }
            
            return true;
        }
        
        return false;
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
            floors: Array.from(this.floors.entries()),
            discoveredSecrets: Array.from(this.discoveredSecrets),
            disarmedTraps: Array.from(this.disarmedTraps),
            usedSpecials: Array.from(this.usedSpecials)
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
        
        if (saveData.discoveredSecrets) {
            this.discoveredSecrets = new Set(saveData.discoveredSecrets);
        }
        
        if (saveData.disarmedTraps) {
            this.disarmedTraps = new Set(saveData.disarmedTraps);
        }
        
        if (saveData.usedSpecials) {
            this.usedSpecials = new Set(saveData.usedSpecials);
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
            playerPosition: this.getPlayerPosition(),
            encounters: this.currentFloorData ? this.currentFloorData.encounters.length : 0,
            specialSquares: this.currentFloorData ? this.currentFloorData.specialSquares.length : 0
        };
    }
    
    /**
     * Get viewing information for 3D rendering
     */
    getViewingInfo() {
        const viewDistance = 5; // How far ahead to check
        const walls = [];
        const doors = [];
        const passages = [];
        
        // Check tiles in front of player up to view distance
        for (let distance = 1; distance <= viewDistance; distance++) {
            let checkX = this.playerX;
            let checkY = this.playerY;
            
            // Calculate position based on facing direction
            switch (this.playerDirection) {
                case 0: checkY -= distance; break; // North
                case 1: checkX += distance; break; // East
                case 2: checkY += distance; break; // South
                case 3: checkX -= distance; break; // West
            }
            
            const tile = this.getTile(checkX, checkY);
            
            if (tile === 'wall') {
                walls.push({ distance, x: checkX, y: checkY });
                break; // Can't see past walls
            } else if (tile === 'hidden_door') {
                const secretKey = `${this.currentFloor}:${checkX}:${checkY}:hidden_door`;
                if (this.discoveredSecrets.has(secretKey)) {
                    doors.push({ distance, x: checkX, y: checkY, type: 'hidden' });
                } else {
                    walls.push({ distance, x: checkX, y: checkY }); // Appears as wall
                    break;
                }
            } else if (tile === 'secret_passage') {
                const secretKey = `${this.currentFloor}:${checkX}:${checkY}:secret_passage`;
                if (this.discoveredSecrets.has(secretKey)) {
                    passages.push({ distance, x: checkX, y: checkY, type: 'secret' });
                } else {
                    walls.push({ distance, x: checkX, y: checkY }); // Appears as wall
                    break;
                }
            }
            
            // Check side walls for each distance
            const leftX = checkX + (this.playerDirection === 0 || this.playerDirection === 2 ? -1 : 0);
            const leftY = checkY + (this.playerDirection === 1 || this.playerDirection === 3 ? -1 : 0);
            const rightX = checkX + (this.playerDirection === 0 || this.playerDirection === 2 ? 1 : 0);
            const rightY = checkY + (this.playerDirection === 1 || this.playerDirection === 3 ? 1 : 0);
            
            const leftTile = this.getTile(leftX, leftY);
            const rightTile = this.getTile(rightX, rightY);
            
            if (leftTile === 'wall') {
                walls.push({ distance, x: leftX, y: leftY, side: 'left' });
            }
            
            if (rightTile === 'wall') {
                walls.push({ distance, x: rightX, y: rightY, side: 'right' });
            }
        }
        
        return {
            walls,
            doors,
            passages,
            facing: this.getDirectionName(),
            position: this.getPlayerPosition()
        };
    }
}