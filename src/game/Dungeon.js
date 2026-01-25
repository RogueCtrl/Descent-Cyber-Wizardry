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

        // Exploration state for Fog-of-War
        this.exploredTiles = new Set(); // Format: "floor:x:y"

        // Debug mode for static test map
        this.testMode = false; // Set to false for random generation

        this.initializeFloor(1);
    }

    /**
     * Initialize a floor with authentic Wizardry-style maze generation
     */
    initializeFloor(floorNumber) {
        console.log(`Generating floor ${floorNumber}...`);

        // Generate tiles first so jacks and encounters can modify them
        const width = this.testMode ? 9 : 20;
        const height = this.testMode ? 5 : 20;
        const tiles = this.testMode ? this.generateTestMap() : this.generateWizardryMaze(width, height, floorNumber);

        const floor = {
            number: floorNumber,
            width: width,
            height: height,
            tiles: tiles,
            monsters: [],
            treasures: [],
            encounters: this.testMode ? this.generateTrainingGroundsEncounters() : this.generateEncounters(floorNumber, tiles),
            specialSquares: this.testMode ? [] : this.generateSpecialSquares(floorNumber),
            // Jacks are edge egress points (renamed from stairs)
            jacks: this.testMode ? {} : this.generateJacks(floorNumber, tiles),
            stairs: this.testMode ? {} : {} // Legacy compatibility - use jacks instead
        };

        this.floors.set(floorNumber, floor);

        if (floorNumber === this.currentFloor) {
            this.currentFloorData = floor;
            this.setStartPosition(floor);
        }

        console.log(`Floor ${floorNumber} generated with ${floor.encounters.length} encounters and ${floor.specialSquares.length} special features`);

        // Hydrate encounters with monster data for rendering portraits
        this.hydrateEncounters(floor.encounters);
    }

    /**
     * Hydrate encounters with full monster data (including portraits)
     */
    async hydrateEncounters(encounters) {
        if (!encounters || encounters.length === 0) return;

        console.log('Hydrating encounters with monster data...');
        for (const encounter of encounters) {
            if (encounter.monsterId) {
                // Fetch full monster data
                const monsterData = await Monster.getMonsterData(encounter.monsterId);
                if (monsterData) {
                    encounter.monster = monsterData;
                    console.log(`Hydrated encounter at (${encounter.x}, ${encounter.y}) with ${monsterData.name}`);
                }
            } else if (encounter.type === 'boss') {
                // Fallback for bosses without specific ID
                // (This logic might need adjustment if bosses aren't consistent)
            }
        }
    }

    /**
     * Generate static test map for debugging 3D rendering
     * Layout: Room A (3x3) - Corridor (2x1) - Room B (3x3)
     */
    generateTestMap() {
        console.log('Generating static test map for rendering debug...');

        // Create 9x5 grid: 3 (Room A) + 2 (Corridor) + 3 (Room B) + 1 (padding) = 9 width, 5 height
        const width = 9;
        const height = 5;
        const tiles = Array(height).fill().map(() => Array(width).fill('wall'));

        // Room A (West Chamber) - 3x3 starting at (0,1)
        for (let y = 1; y <= 3; y++) {
            for (let x = 0; x <= 2; x++) {
                tiles[y][x] = 'floor';
            }
        }

        // Corridor (Connection) - 2x1 at (3,2) and (4,2)
        tiles[2][3] = 'door'; // Door exiting Room A
        tiles[2][4] = 'floor';

        // Room B (East Chamber) - 3x3 starting at (5,1)
        for (let y = 1; y <= 3; y++) {
            for (let x = 5; x <= 7; x++) {
                tiles[y][x] = 'floor';
            }
        }

        // Add exit tile at player spawn position (1, 2)
        tiles[2][1] = 'exit';

        // Add treasure chest in center of Room B (6, 2)
        tiles[2][6] = 'treasure';

        // Ensure outer walls remain as walls (already set by default)
        console.log('Test map layout:');
        console.log('Room A | Corridor | Room B');
        console.log('█████████');
        console.log('█...█..█T..█');
        console.log('█.E.....█');
        console.log('█...█..█...█');
        console.log('█████████');
        console.log('(E = exit tile, T = treasure chest)');

        return tiles;
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

        // Step 5: Generate doors at valid doorway positions
        this.generateDoors(tiles, width, height, 0.4);

        // Step 6: Add hidden doors and secret passages
        this.addSecretFeatures(tiles, width, height, secretChance);

        // Step 7: Add trap squares
        this.addTraps(tiles, width, height, trapChance, floorNumber);

        // Step 8: Ensure proper connections and validate maze
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
        const queue = [{ x: startX, y: startY, path: [] }];

        while (queue.length > 0) {
            const { x, y, path } = queue.shift();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            // If we found a floor tile that's not our starting room, create path
            if (tiles[y][x] === 'floor' && (x !== startX || y !== startY)) {
                path.forEach(({ px, py }) => {
                    tiles[py][px] = 'floor';
                });
                return;
            }

            // Add adjacent cells to queue
            [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(`${nx},${ny}`)) {
                    queue.push({
                        x: nx, y: ny,
                        path: [...path, { px: x, py: y }]
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
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
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
     * Generate doors at proper doorway positions
     * A valid door position is a wall tile with exactly 2 opposing floor tiles
     * (north/south or east/west - creating a passage through the wall)
     */
    generateDoors(tiles, width, height, doorChance = 0.3) {
        const potentialDoors = [];

        // Find all valid door positions
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (tiles[y][x] === 'wall') {
                    const doorType = this.isValidDoorPosition(tiles, x, y);
                    if (doorType) {
                        potentialDoors.push({ x, y, type: doorType });
                    }
                }
            }
        }

        // Place doors at some of the valid positions
        const doorCount = Math.floor(potentialDoors.length * doorChance);
        const shuffledDoors = Random.shuffle(potentialDoors);
        let placedCount = 0;

        for (const door of shuffledDoors) {
            if (placedCount >= doorCount) break;

            // Check if any adjacent tile is already a door (prevent double doors)
            const hasAdjacentDoor =
                tiles[door.y - 1][door.x] === 'door' ||
                tiles[door.y + 1][door.x] === 'door' ||
                tiles[door.y][door.x - 1] === 'door' ||
                tiles[door.y][door.x + 1] === 'door';

            if (!hasAdjacentDoor) {
                tiles[door.y][door.x] = 'door';
                placedCount++;
            }
        }

        console.log(`Generated ${placedCount} doors from ${potentialDoors.length} valid positions`);
    }

    /**
     * Check if a wall tile is a valid door position
     * Returns 'horizontal' or 'vertical' if valid, null if not
     * A valid door must create a proper corridor passage, not a corner
     * Stricter check: ALL 4 diagonal tiles must be walls to ensure it's a true doorway
     */
    isValidDoorPosition(tiles, x, y) {
        const north = tiles[y - 1] && tiles[y - 1][x];
        const south = tiles[y + 1] && tiles[y + 1][x];
        const east = tiles[y][x + 1];
        const west = tiles[y][x - 1];

        // Check all diagonals - ALL must be walls for a valid door
        const ne = tiles[y - 1] && tiles[y - 1][x + 1];
        const nw = tiles[y - 1] && tiles[y - 1][x - 1];
        const se = tiles[y + 1] && tiles[y + 1][x + 1];
        const sw = tiles[y + 1] && tiles[y + 1][x - 1];

        // All diagonals must be walls - this ensures the door is in a proper corridor
        // not at a room corner where you could walk around it
        const allDiagonalsWalls =
            this.isWallTile(ne) &&
            this.isWallTile(nw) &&
            this.isWallTile(se) &&
            this.isWallTile(sw);

        if (!allDiagonalsWalls) return null;

        // Check for vertical passage (north and south are floors, east and west are walls)
        const isVerticalDoor =
            this.isFloorTile(north) &&
            this.isFloorTile(south) &&
            this.isWallTile(east) &&
            this.isWallTile(west);

        // Check for horizontal passage (east and west are floors, north and south are walls)
        const isHorizontalDoor =
            this.isFloorTile(east) &&
            this.isFloorTile(west) &&
            this.isWallTile(north) &&
            this.isWallTile(south);

        if (isVerticalDoor) return 'vertical';
        if (isHorizontalDoor) return 'horizontal';
        return null;
    }

    /**
     * Check if a tile is a floor-like tile (walkable)
     */
    isFloorTile(tile) {
        return tile === 'floor' || tile === 'open_door' ||
            (tile && tile.startsWith && tile.startsWith('trap_'));
    }

    /**
     * Check if a tile is a wall-like tile (blocking)
     */
    isWallTile(tile) {
        return tile === 'wall' || tile === 'door' || tile === 'hidden_door';
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
        const adjacentFloors = [[0, 1], [1, 0], [0, -1], [-1, 0]]
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
        const adjacentSpecial = [[0, 1], [1, 0], [0, -1], [-1, 0]]
            .some(([dx, dy]) => {
                const tile = tiles[y + dy] && tiles[y + dy][x + dx];
                return tile && (tile.startsWith('stairs') || tile.includes('special'));
            });

        return !adjacentSpecial;
    }

    /**
     * Generate encounters for the floor with monster assignments
     */
    generateEncounters(floorNumber, tiles) {
        const encounterCount = Random.integer(5, 12);
        const encounters = [];
        const width = tiles[0].length;
        const height = tiles.length;

        // Monster pools by level tier
        const monstersByLevel = {
            1: ['Kobold', 'Giant Rat', 'Skeleton'],
            2: ['Kobold', 'Skeleton', 'Orc', 'Wolf'],
            3: ['Orc', 'Wolf', 'Hobgoblin'],
            4: ['Hobgoblin', 'Ogre'],
            5: ['Ogre', 'Owlbear'],
            6: ['Owlbear', 'Orc Chief'],
            7: ['Orc Chief', 'Young Dragon'],
            8: ['Young Dragon']
        };

        // Get appropriate monster pool for this floor
        const tierLevel = Math.min(8, Math.max(1, floorNumber));
        const pool = monstersByLevel[tierLevel] || monstersByLevel[1];

        // Find valid floor positions for encounters
        const findValidPosition = (excludePositions) => {
            for (let attempts = 0; attempts < 100; attempts++) {
                const x = Random.integer(1, width - 2);
                const y = Random.integer(1, height - 2);

                if (tiles[y][x] === 'floor') {
                    const key = `${x},${y}`;
                    if (!excludePositions.has(key)) {
                        return { x, y };
                    }
                }
            }
            return null;
        };

        const usedPositions = new Set();

        for (let i = 0; i < encounterCount; i++) {
            const pos = findValidPosition(usedPositions);
            if (!pos) continue;

            usedPositions.add(`${pos.x},${pos.y}`);

            const isBoss = Random.chance(0.1);
            const monsterName = isBoss
                ? pool[pool.length - 1]  // Boss = strongest in pool
                : Random.choice(pool);

            encounters.push({
                x: pos.x,
                y: pos.y,
                level: floorNumber + Random.integer(-1, 2),
                triggered: false,
                type: isBoss ? 'boss' : 'normal',
                monsterId: monsterName  // Now assigned for hydration!
            });
        }

        return encounters;
    }

    /**
     * Generate encounters for training grounds (test mode)
     */
    generateTrainingGroundsEncounters() {
        // Place the deadly boss encounter in the corridor between rooms A and B
        // Based on the test map: corridor is at (3,2) and (4,2)
        // We'll place the boss at (4,2) - the entrance to the corridor from Room A
        const encounters = [{
            x: 4,
            y: 2,
            level: 4, // Ogre level
            triggered: false,
            type: 'boss',
            monsterId: 'monster_ogre_001', // Specific boss monster
            message: TextManager.getText('training_grounds_boss_message', 'A massive ogre blocks your path, wielding a fearsome greatclub!')
        }];

        console.log('Training grounds encounters generated:', encounters);
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
            healing_fountain: TextManager.getText('special_healing_fountain', "A crystal clear fountain bubbles with restorative waters."),
            stamina_fountain: TextManager.getText('special_stamina_fountain', "This fountain glows with energizing light."),
            poison_fountain: TextManager.getText('special_poison_fountain', "The water here has a sickly green tint."),
            teleporter: TextManager.getText('special_teleporter', "Strange runes circle this magical portal."),
            message_square: TextManager.getText('special_message_square', "Ancient text is carved into the floor here."),
            treasure_chest: TextManager.getText('special_treasure_chest', "A sturdy chest sits here, lock gleaming.")
        };

        return messages[type] || TextManager.getText('special_unknown', "Something unusual is here.");
    }

    /**
     * Generate jacks (edge egress points) for node navigation
     * Jacks are connection points between dungeon nodes
     * - jack_entry: Return to previous node (town on floor 1)
     * - jack_deep: Go to next node (deeper into dungeon)
     */
    generateJacks(floorNumber, tiles) {
        const jacks = {};
        const width = tiles[0].length;
        const height = tiles.length;
        const usedPositions = new Set();

        /**
         * Find a valid floor tile for jack placement
         */
        const findValidJackPosition = () => {
            for (let attempts = 0; attempts < 100; attempts++) {
                const x = Random.integer(1, width - 2);
                const y = Random.integer(1, height - 2);
                const key = `${x},${y}`;

                // Only place on floor tiles (not traps, doors, etc.)
                if (tiles[y][x] === 'floor' && !usedPositions.has(key)) {
                    usedPositions.add(key);
                    return { x, y };
                }
            }
            // Fallback: find any floor tile
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const key = `${x},${y}`;
                    if (tiles[y][x] === 'floor' && !usedPositions.has(key)) {
                        usedPositions.add(key);
                        return { x, y };
                    }
                }
            }
            return null;
        };

        // Entry jack (return to previous node / town) - every floor has one
        const entryPos = findValidJackPosition();
        if (entryPos) {
            jacks.entry = entryPos;
            tiles[entryPos.y][entryPos.x] = 'jack_entry';
        }

        // Deep jack (go to next node) - except on max floor
        if (floorNumber < this.maxFloors) {
            const deepPos = findValidJackPosition();
            if (deepPos) {
                jacks.deep = deepPos;
                tiles[deepPos.y][deepPos.x] = 'jack_deep';
            }
        }

        // Legacy compatibility - populate stairs object for existing code
        jacks.up = jacks.entry;  // Entry goes "up" / out
        jacks.down = jacks.deep; // Deep goes "down" / in

        return jacks;
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
        if (this.testMode) {
            // Fixed starting position in Room A center for consistent testing
            this.playerX = 1; // Center of Room A (x: 0-2, center = 1)
            this.playerY = 2; // Center of Room A (y: 1-3, center = 2)
            this.playerDirection = 0; // Start facing north
            this.playerDirection = 0; // Start facing north
            console.log(`Test mode: Player positioned at (${this.playerX}, ${this.playerY}) facing North`);

            // Mark initial area as explored
            this.markExplored(this.playerX, this.playerY, 4);

            // Check for position events at start position (like exit tile)
            setTimeout(() => {
                this.checkPositionEvents();
            }, 100);

            return;
        }

        // For procedural maps, player should start at the entry jack
        const jacks = floor.jacks || floor.stairs || {};

        // Try to position at entry jack first
        if (jacks.entry) {
            this.playerX = jacks.entry.x;
            this.playerY = jacks.entry.y;
            this.playerDirection = 0; // Start facing north
            this.markExplored(this.playerX, this.playerY, 4);
            console.log(`Player started at entry jack: (${this.playerX}, ${this.playerY})`);

            // Check for position events at start position
            setTimeout(() => {
                this.checkPositionEvents();
            }, 100);
            return;
        }

        // Fallback: scan tiles for jack_entry tile
        const tiles = floor.tiles;
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                if (tiles[y][x] === 'jack_entry') {
                    this.playerX = x;
                    this.playerY = y;
                    this.playerDirection = 0;
                    this.markExplored(this.playerX, this.playerY, 4);
                    console.log(`Player started at entry jack (tile scan): (${x}, ${y})`);

                    setTimeout(() => {
                        this.checkPositionEvents();
                    }, 100);
                    return;
                }
            }
        }

        // Final fallback: find any walkable position
        console.warn('No entry jack found, using random start position');
        for (let attempts = 0; attempts < 100; attempts++) {
            const x = Random.integer(1, floor.width - 2);
            const y = Random.integer(1, floor.height - 2);

            if (this.isWalkable(x, y)) {
                this.playerX = x;
                this.playerY = y;
                this.playerDirection = 0; // Start facing north
                this.markExplored(this.playerX, this.playerY, 4); // Initial radius
                break;
            }
        }
    }

    /**
     * Mark tiles as explored around a center point
     */
    markExplored(centerX, centerY, radius) {
        if (!this.currentFloorData) return;

        const width = this.currentFloorData.width;
        const height = this.currentFloorData.height;
        const floorNum = this.currentFloor;

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    // Simple distance check (squared distance for efficiency)
                    const dx = x - centerX;
                    const dy = y - centerY;
                    if (dx * dx + dy * dy <= radius * radius) {
                        const key = `${floorNum}:${x}:${y}`;
                        this.exploredTiles.add(key);
                    }
                }
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
            'floor', 'exit', 'treasure',
            'open_door', 'open_hidden_door', 'open_secret_passage',  // Only OPEN doors are walkable
            'jack_entry', 'jack_deep',  // Jack egress points (nodes/edges)
            'stairs_up', 'stairs_down',  // Legacy compatibility
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
            // Check if player is leaving a special tile
            const previousTile = this.getTile(this.playerX, this.playerY);
            const newTile = this.getTile(newX, newY);

            this.playerX = newX;
            this.playerY = newY;

            // Check if player left exit tile
            if (previousTile === 'exit' && newTile !== 'exit') {
                this.triggerExitTileLeft();
            }

            // Check if player left jack tile
            const jackTiles = ['jack_entry', 'jack_deep'];
            if (jackTiles.includes(previousTile) && !jackTiles.includes(newTile)) {
                this.triggerJackTileLeft();
            }

            // Check for events at new position
            this.checkPositionEvents();

            // Reveal fog of war
            this.markExplored(this.playerX, this.playerY, 4);

            return true;
        }

        return false;
    }

    /**
     * Mark tiles as explored around a center point
     */
    markExplored(centerX, centerY, radius) {
        if (!this.currentFloorData) return;

        const width = this.currentFloorData.width;
        const height = this.currentFloorData.height;
        const floorNum = this.currentFloor;

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                // Strict bounds check - no wrapping
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const dx = x - centerX;
                    const dy = y - centerY;

                    if (dx * dx + dy * dy <= radius * radius) {
                        // Check line of sight to prevent seeing through walls/doors
                        if (this.hasLineOfSight(centerX, centerY, x, y)) {
                            const key = `${floorNum}:${x}:${y}`;
                            this.exploredTiles.add(key);
                        }
                    }
                }
            }
        }
    }

    /**
     * Check if there is a clear line of sight between two points
     * Uses Bresenham's line algorithm
     */
    hasLineOfSight(x0, y0, x1, y1) {
        if (x0 === x1 && y0 === y1) return true;

        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let cx = x0;
        let cy = y0;

        while (true) {
            if (cx === x1 && cy === y1) return true;

            if (cx !== x0 || cy !== y0) {
                const tile = this.getTile(cx, cy);
                if (tile === 'wall' || tile === 'door' || tile === 'hidden_door') {
                    return false;
                }
            }

            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                cx += sx;
            }
            if (e2 < dx) {
                err += dx;
                cy += sy;
            }
        }
    }

    /**
     * Check for events at current position
     */
    checkPositionEvents() {
        const tile = this.getTile(this.playerX, this.playerY);

        // Handle exit tile (test mode exit)
        if (tile === 'exit') {
            this.triggerExitTile();
        }

        // Handle jack entry tile (procedural map exit to previous node/town)
        if (tile === 'jack_entry') {
            this.triggerJackEntryTile();
        }

        // Handle jack deep tile (procedural map descent to next node)
        if (tile === 'jack_deep') {
            this.triggerJackDeepTile();
        }

        // Handle treasure tile
        if (tile === 'treasure') {
            this.triggerTreasureTile();
        }

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
     * Trigger exit tile - notify UI to show exit button
     */
    triggerExitTile() {
        // Emit event to notify UI that player is on exit tile
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('exit-tile-entered', {
                x: this.playerX,
                y: this.playerY,
                floor: this.currentFloor
            });
        }
    }

    /**
     * Trigger exit tile left - notify UI to hide exit button
     */
    triggerExitTileLeft() {
        // Emit event to notify UI that player left exit tile
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('exit-tile-left');
        }
    }

    /**
     * Trigger jack entry tile - notify UI to show jack out button
     */
    triggerJackEntryTile() {
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('jack-entry-tile-entered', {
                x: this.playerX,
                y: this.playerY,
                floor: this.currentFloor,
                goesToTown: this.currentFloor === 1
            });
        }
    }

    /**
     * Trigger jack deep tile - notify UI to show jack in deeper button
     */
    triggerJackDeepTile() {
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('jack-deep-tile-entered', {
                x: this.playerX,
                y: this.playerY,
                floor: this.currentFloor
            });
        }
    }

    /**
     * Trigger jack tile left - notify UI to hide jack button
     */
    triggerJackTileLeft() {
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('jack-tile-left');
            // Also emit exit-tile-left for UI compatibility
            window.engine.eventSystem.emit('exit-tile-left');
        }
    }

    /**
     * Trigger treasure tile - notify UI to show treasure button
     */
    triggerTreasureTile() {
        // Check if treasure has already been looted
        const treasureKey = `${this.currentFloor}:${this.playerX}:${this.playerY}`;
        if (this.usedSpecials.has(treasureKey)) {
            // Treasure already looted
            return;
        }

        // Emit event to notify UI that player is on treasure tile
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('treasure-tile-entered', {
                x: this.playerX,
                y: this.playerY,
                floor: this.currentFloor,
                treasureKey: treasureKey
            });
        }
    }

    /**
     * Trigger treasure tile left - notify UI to hide treasure button
     */
    triggerTreasureTileLeft() {
        // Emit event to notify UI that player left treasure tile
        if (window.engine && window.engine.eventSystem) {
            window.engine.eventSystem.emit('treasure-tile-left');
        }
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
        // Debug: Log current position and available encounters
        console.log(`Checking encounters at position ${this.playerX}, ${this.playerY}`);
        console.log('Available encounters:', this.currentFloorData.encounters);

        // First check for fixed encounters at exact position (training grounds boss)
        const fixedEncounter = this.currentFloorData.encounters.find(enc =>
            enc.x === this.playerX &&
            enc.y === this.playerY &&
            !enc.triggered
        );

        if (fixedEncounter) {
            // Don't mark as triggered yet - only when encounter is defeated
            console.log(`Fixed encounter triggered at ${this.playerX}, ${this.playerY}:`, fixedEncounter);

            // Emit encounter event
            if (window.engine && window.engine.eventSystem) {
                window.engine.eventSystem.emit('encounter-triggered', {
                    encounter: fixedEncounter,
                    x: this.playerX,
                    y: this.playerY,
                    floor: this.currentFloor
                });
            }
            return; // Don't check for random encounters if fixed encounter triggered
        }

        // Base encounter chance per step for random encounters
        const baseChance = 0.02 + (this.currentFloor * 0.005);

        if (Random.chance(baseChance)) {
            const encounter = this.currentFloorData.encounters.find(enc =>
                Math.abs(enc.x - this.playerX) <= 1 &&
                Math.abs(enc.y - this.playerY) <= 1 &&
                !enc.triggered
            );

            if (encounter) {
                // Don't mark as triggered yet - only when encounter is defeated
                console.log(`Random encounter triggered at ${this.playerX}, ${this.playerY}`);

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
     * Mark encounter as defeated (called when player wins combat)
     * @param {number} x - X coordinate of encounter
     * @param {number} y - Y coordinate of encounter
     * @param {number} floor - Floor number (optional, defaults to current)
     */
    markEncounterDefeated(x, y, floor = null) {
        const targetFloor = floor || this.currentFloor;
        const floorData = this.floors.get(targetFloor);

        if (!floorData) {
            console.warn(`Cannot mark encounter defeated - floor ${targetFloor} not found`);
            return false;
        }

        // Find and mark the encounter as triggered/defeated
        const encounter = floorData.encounters.find(enc =>
            enc.x === x && enc.y === y && !enc.triggered
        );

        if (encounter) {
            encounter.triggered = true;
            console.log(`Encounter at (${x}, ${y}) marked as defeated`);
            return true;
        } else {
            console.warn(`No active encounter found at (${x}, ${y}) on floor ${targetFloor}`);
            return false;
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
        const oldDirection = this.playerDirection;

        switch (direction) {
            case 'left':
                // Turn counter-clockwise: North(0) → West(3) → South(2) → East(1) → North(0)
                this.playerDirection = this.playerDirection - 1;
                if (this.playerDirection < 0) {
                    this.playerDirection = 3;
                }
                break;

            case 'right':
                // Turn clockwise: North(0) → East(1) → South(2) → West(3) → North(0)
                this.playerDirection = this.playerDirection + 1;
                if (this.playerDirection > 3) {
                    this.playerDirection = 0;
                }
                break;
        }

        console.log(`Dungeon.turnPlayer(${direction}): ${oldDirection} → ${this.playerDirection}`);
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
     * Change floor level via jack egress points
     * direction: 'up' = jack out (return to previous node), 'down' = jack in deeper
     */
    changeFloor(direction) {
        const currentTile = this.getTile(this.playerX, this.playerY);
        const jacks = this.currentFloorData.jacks || this.currentFloorData.stairs || {};

        // Jack Out (return to previous node)
        if (direction === 'up' && (currentTile === 'jack_entry' || currentTile === 'stairs_up')) {
            // On floor 1, jacking out returns to town (handled by caller)
            if (this.currentFloor === 1) {
                return 'town';  // Signal to return to town
            }

            this.currentFloor--;
            if (!this.floors.has(this.currentFloor)) {
                this.initializeFloor(this.currentFloor);
            }
            this.currentFloorData = this.floors.get(this.currentFloor);

            // Position at deep jack on previous floor (since we came from there)
            const prevJacks = this.currentFloorData.jacks || this.currentFloorData.stairs || {};
            if (prevJacks.deep || prevJacks.down) {
                const pos = prevJacks.deep || prevJacks.down;
                this.playerX = pos.x;
                this.playerY = pos.y;
                console.log(`Positioned at deep jack: (${pos.x}, ${pos.y})`);
            } else {
                // Fallback: scan tiles for jack_deep position
                const tiles = this.currentFloorData.tiles;
                let found = false;
                for (let y = 0; y < tiles.length && !found; y++) {
                    for (let x = 0; x < tiles[y].length && !found; x++) {
                        if (tiles[y][x] === 'jack_deep' || tiles[y][x] === 'stairs_down') {
                            this.playerX = x;
                            this.playerY = y;
                            found = true;
                            console.log(`Positioned at deep jack (fallback scan): (${x}, ${y})`);
                        }
                    }
                }
                if (!found) {
                    console.warn('Could not find deep jack on floor', this.currentFloor);
                }
            }

            return true;
        }

        // Jack In Deeper (go to next node)
        if (direction === 'down' && (currentTile === 'jack_deep' || currentTile === 'stairs_down')) {
            this.currentFloor++;
            if (!this.floors.has(this.currentFloor)) {
                this.initializeFloor(this.currentFloor);
            }
            this.currentFloorData = this.floors.get(this.currentFloor);

            // Position at entry jack on new floor (since we're entering)
            const newJacks = this.currentFloorData.jacks || this.currentFloorData.stairs || {};
            if (newJacks.entry || newJacks.up) {
                const pos = newJacks.entry || newJacks.up;
                this.playerX = pos.x;
                this.playerY = pos.y;
                console.log(`Positioned at entry jack: (${pos.x}, ${pos.y})`);
            } else {
                // Fallback: scan tiles for jack_entry position
                const tiles = this.currentFloorData.tiles;
                let found = false;
                for (let y = 0; y < tiles.length && !found; y++) {
                    for (let x = 0; x < tiles[y].length && !found; x++) {
                        if (tiles[y][x] === 'jack_entry' || tiles[y][x] === 'stairs_up') {
                            this.playerX = x;
                            this.playerY = y;
                            found = true;
                            console.log(`Positioned at entry jack (fallback scan): (${x}, ${y})`);
                        }
                    }
                }
                if (!found) {
                    console.warn('Could not find entry jack on floor', this.currentFloor);
                }
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
        const monsters = [];
        const objects = [];

        // Check front tiles until we hit a wall or reach max distance
        let frontWallDistance = viewDistance + 1; // Default to beyond max distance

        for (let distance = 1; distance <= viewDistance; distance++) {
            let checkX = this.playerX;
            let checkY = this.playerY;

            // Calculate base front position for this distance
            switch (this.playerDirection) {
                case 0: checkY -= distance; break; // North
                case 1: checkX += distance; break; // East
                case 2: checkY += distance; break; // South
                case 3: checkX -= distance; break; // West
            }

            let centerBlocked = false;

            // Scan horizontally to detect walls in wider rooms
            for (let offset = -2; offset <= 2; offset++) {
                let offX = checkX;
                let offY = checkY;

                // Apply horizontal offset based on direction
                switch (this.playerDirection) {
                    case 0: offX += offset; break; // North: offset -1 is left (X-1)
                    case 1: offY += offset; break; // East: offset -1 is left (Y-1)
                    case 2: offX -= offset; break; // South: offset -1 is left (X+1)
                    case 3: offY -= offset; break; // West: offset -1 is left (Y+1)
                }

                const tile = this.getTile(offX, offY);

                if (tile === 'wall') {
                    walls.push({ distance, x: offX, y: offY, offset });
                    if (offset === 0) centerBlocked = true;
                } else if (tile === 'hidden_door') {
                    const secretKey = `${this.currentFloor}:${offX}:${offY}:hidden_door`;
                    if (this.discoveredSecrets.has(secretKey)) {
                        doors.push({ distance, x: offX, y: offY, offset, type: 'hidden' });
                    } else {
                        walls.push({ distance, x: offX, y: offY, offset }); // Appears as wall
                        if (offset === 0) centerBlocked = true;
                    }
                } else if (tile === 'secret_passage') {
                    const secretKey = `${this.currentFloor}:${offX}:${offY}:secret_passage`;
                    if (this.discoveredSecrets.has(secretKey)) {
                        passages.push({ distance, x: offX, y: offY, offset, type: 'secret' });
                    } else {
                        walls.push({ distance, x: offX, y: offY, offset }); // Appears as wall
                        if (offset === 0) centerBlocked = true;
                    }
                } else if (tile === 'door') {
                    // Normal door
                    doors.push({ distance, x: offX, y: offY, offset, type: 'normal' });
                    // Closed doors block the view
                    if (offset === 0) centerBlocked = true;
                } else if (tile === 'treasure') {
                    // Treasure chest / Data cache
                    objects.push({ distance, x: offX, y: offY, offset, type: 'treasure' });
                }

                // Check for visible monsters
                // Only show monsters if there isn't a wall blocking the view or if the monster is in front of the wall
                if (offset === 0 && !centerBlocked) {
                    const encounter = this.currentFloorData.encounters.find(enc =>
                        enc.x === offX && enc.y === offY && !enc.triggered
                    );

                    if (encounter && encounter.monster) {
                        monsters.push({
                            distance,
                            x: offX,
                            y: offY,
                            offset: 0,
                            monster: encounter.monster
                        });
                    }
                }
            }

            if (centerBlocked) {
                frontWallDistance = distance;
                break; // Can't see past a centered wall
            }
        }

        // Check side walls independently - they can be visible even past front walls
        for (let distance = 1; distance <= viewDistance; distance++) {
            let checkX = this.playerX;
            let checkY = this.playerY;

            // Calculate front position for this distance-1 (the cell the side walls belong to)
            const sideDistance = distance - 1;
            switch (this.playerDirection) {
                case 0: checkY -= sideDistance; break; // North
                case 1: checkX += sideDistance; break; // East
                case 2: checkY += sideDistance; break; // South
                case 3: checkX -= sideDistance; break; // West
            }

            // Variables to track corridor framing positions (usually at offset 1)
            let framingLeftX, framingLeftY, framingRightX, framingRightY;

            // Initialize framing coordinates to offset 1 (default corridor width)
            switch (this.playerDirection) {
                case 0: // North
                    framingLeftX = checkX - 1; framingLeftY = checkY;
                    framingRightX = checkX + 1; framingRightY = checkY;
                    break;
                case 1: // East
                    framingLeftX = checkX; framingLeftY = checkY - 1;
                    framingRightX = checkX; framingRightY = checkY + 1;
                    break;
                case 2: // South
                    framingLeftX = checkX + 1; framingLeftY = checkY;
                    framingRightX = checkX - 1; framingRightY = checkY;
                    break;
                case 3: // West
                    framingLeftX = checkX; framingLeftY = checkY + 1;
                    framingRightX = checkX; framingRightY = checkY - 1;
                    break;
            }

            // Scan for Left Wall (Room Boundary)
            for (let offset = 1; offset <= 3; offset++) {
                let leftX, leftY;
                // Calculate left position at this offset
                switch (this.playerDirection) {
                    case 0: // North -> Left is X-
                        leftX = checkX - offset; leftY = checkY; break;
                    case 1: // East -> Left is Y-
                        leftX = checkX; leftY = checkY - offset; break;
                    case 2: // South -> Left is X+
                        leftX = checkX + offset; leftY = checkY; break;
                    case 3: // West -> Left is Y+
                        leftX = checkX; leftY = checkY + offset; break;
                }

                if (this.isValidCoordinate(leftX, leftY)) {
                    const tile = this.getTile(leftX, leftY);
                    if (tile === 'wall' || tile === 'hidden_door' || tile === 'secret_passage') {
                        walls.push({ distance, x: leftX, y: leftY, side: 'left', offset: -offset });
                        break; // Found the boundary, stop scanning this side
                    }
                }
            }

            // Scan for Right Wall (Room Boundary)
            for (let offset = 1; offset <= 3; offset++) {
                let rightX, rightY;
                // Calculate right position at this offset
                switch (this.playerDirection) {
                    case 0: // North -> Right is X+
                        rightX = checkX + offset; rightY = checkY; break;
                    case 1: // East -> Right is Y+
                        rightX = checkX; rightY = checkY + offset; break;
                    case 2: // South -> Right is X-
                        rightX = checkX - offset; rightY = checkY; break;
                    case 3: // West -> Right is Y-
                        rightX = checkX; rightY = checkY - offset; break;
                }

                if (this.isValidCoordinate(rightX, rightY)) {
                    const tile = this.getTile(rightX, rightY);
                    if (tile === 'wall' || tile === 'hidden_door' || tile === 'secret_passage') {
                        walls.push({ distance, x: rightX, y: rightY, side: 'right', offset: offset });
                        break; // Found the boundary, stop scanning this side
                    }
                }
            }

            // Enhanced framing wall detection for corridor entrances
            // Uses the offset 1 coordinates since framing walls always occur at corridor mouths
            this.addFramingWalls(walls, distance, framingLeftX, framingLeftY, framingRightX, framingRightY);
        }

        return {
            walls,
            doors,
            passages,
            monsters,
            objects,
            facing: this.getDirectionName(),
            position: this.getPlayerPosition()
        };
    }

    /**
     * Add framing walls for corridor entrances and transitions
     */
    addFramingWalls(walls, distance, leftX, leftY, rightX, rightY) {
        // Check for walls that would frame corridor entrances
        if (this.isValidCoordinate(leftX, leftY)) {
            const leftTile = this.getTile(leftX, leftY);
            if (leftTile === 'wall') {
                // Check if this wall should frame a corridor entrance
                const framingCheck = this.shouldFrameCorridor(leftX, leftY, distance);
                if (framingCheck) {
                    walls.push({
                        distance,
                        x: leftX,
                        y: leftY,
                        side: 'left',
                        framing: true
                    });
                }
            }
        }

        if (this.isValidCoordinate(rightX, rightY)) {
            const rightTile = this.getTile(rightX, rightY);
            if (rightTile === 'wall') {
                const framingCheck = this.shouldFrameCorridor(rightX, rightY, distance);
                if (framingCheck) {
                    walls.push({
                        distance,
                        x: rightX,
                        y: rightY,
                        side: 'right',
                        framing: true
                    });
                }
            }
        }
    }

    /**
     * Determine if a wall should frame a corridor entrance
     */
    shouldFrameCorridor(wallX, wallY, distance) {
        // Look ahead to see if there's an opening this wall should frame
        // For now, return true to enable framing detection
        // This can be enhanced with more sophisticated corridor detection logic
        return true;
    }

    /**
     * Validate coordinates are within bounds or handle wrap-around
     */
    isValidCoordinate(x, y) {
        // All coordinates are valid since getTile handles wrap-around arithmetic
        return true;
    }

    /**
     * Save dungeon state to IndexedDB
     * @param {string} partyId - ID of the party that owns this dungeon
     * @returns {Promise<string>} Dungeon ID if successful
     */
    async saveToDatabase(partyId) {
        try {
            // Save shared dungeon structure
            await Storage.saveDungeon(this, partyId);

            // Save party position and state separately
            const positionData = {
                currentFloor: this.currentFloor,
                playerX: this.playerX,
                playerY: this.playerY,
                playerDirection: this.playerDirection,
                testMode: this.testMode,
                discoveredSecrets: this.discoveredSecrets,
                disarmedTraps: this.disarmedTraps,
                usedSpecials: this.usedSpecials
            };

            await Storage.savePartyPosition(partyId, 'corrupted_network', positionData);

            console.log(`Dungeon and party position saved for party: ${partyId}`);
            return 'corrupted_network';
        } catch (error) {
            console.error('Failed to save dungeon to database:', error);
            throw error;
        }
    }

    /**
     * Load dungeon state from IndexedDB
     * @param {string} dungeonId - ID of the dungeon to load (always 'corrupted_network')
     * @param {string} partyId - ID of the party to load position for
     * @returns {Promise<boolean>} Success status
     */
    async loadFromDatabase(dungeonId, partyId) {
        try {
            // Load shared dungeon structure
            const dungeonData = await Storage.loadDungeon(dungeonId);

            if (!dungeonData) {
                console.warn(`No dungeon found with ID: ${dungeonId}`);
                return false;
            }

            // Apply shared dungeon data to this instance
            this.maxFloors = dungeonData.maxFloors;
            this.testMode = dungeonData.testMode;
            this.floors = dungeonData.floors;

            // Load party position if provided
            if (partyId) {
                const positionData = await Storage.loadPartyPosition(partyId);

                if (positionData) {
                    // Apply party position data
                    this.currentFloor = positionData.currentFloor;
                    this.playerX = positionData.playerX;
                    this.playerY = positionData.playerY;
                    this.playerDirection = positionData.playerDirection;
                    this.discoveredSecrets = positionData.discoveredSecrets;
                    this.disarmedTraps = positionData.disarmedTraps;
                    this.usedSpecials = positionData.usedSpecials;

                    console.log(`Party position loaded: Floor ${this.currentFloor}, Position (${this.playerX}, ${this.playerY})`);
                } else {
                    // Use default starting position
                    this.setStartPosition(this.floors.get(1));
                    console.log('No saved position found, using default starting position');
                }
            } else {
                // Use default starting position
                this.setStartPosition(this.floors.get(1));
            }

            // Set current floor data
            this.currentFloorData = this.floors.get(this.currentFloor);

            console.log(`Dungeon loaded from database: Floor ${this.currentFloor}, Position (${this.playerX}, ${this.playerY})`);
            return true;

        } catch (error) {
            console.error('Failed to load dungeon from database:', error);
            return false;
        }
    }

    /**
     * Get the tile directly in front of the player
     */
    getTileInFront() {
        let checkX = this.playerX;
        let checkY = this.playerY;

        switch (this.playerDirection) {
            case 0: checkY -= 1; break; // North
            case 1: checkX += 1; break; // East
            case 2: checkY += 1; break; // South
            case 3: checkX -= 1; break; // West
        }

        return this.getTile(checkX, checkY);
    }

    /**
     * Open a door at the specified coordinates (or in front if not specified)
     */
    openDoor(startX = null, startY = null) {
        let targetX = startX;
        let targetY = startY;

        // If no coordinates provided, open door in front
        if (targetX === null || targetY === null) {
            targetX = this.playerX;
            targetY = this.playerY;

            switch (this.playerDirection) {
                case 0: targetY -= 1; break; // North
                case 1: targetX += 1; break; // East
                case 2: targetY += 1; break; // South
                case 3: targetX -= 1; break; // West
            }
        }

        const tile = this.getTile(targetX, targetY);

        // Determine the open state for different door types
        let openState = null;
        if (tile === 'door') {
            openState = 'open_door';
        } else if (tile === 'hidden_door') {
            openState = 'open_hidden_door';
        } else if (tile === 'secret_passage') {
            openState = 'open_secret_passage';
        }

        if (openState) {
            // "Open" the door by converting it to open state
            if (this.currentFloorData && this.currentFloorData.tiles) {
                if (this.currentFloorData.tiles[targetY] && typeof (this.currentFloorData.tiles[targetY][targetX]) !== 'undefined') {
                    this.currentFloorData.tiles[targetY][targetX] = openState;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Close a door at the specified coordinates (or in front if not specified)
     */
    closeDoor(startX = null, startY = null) {
        let targetX = startX;
        let targetY = startY;

        // If no coordinates provided, close door in front
        if (targetX === null || targetY === null) {
            targetX = this.playerX;
            targetY = this.playerY;

            switch (this.playerDirection) {
                case 0: targetY -= 1; break; // North
                case 1: targetX += 1; break; // East
                case 2: targetY += 1; break; // South
                case 3: targetX -= 1; break; // West
            }
        }

        const tile = this.getTile(targetX, targetY);

        // Determine the closed state for different door types
        let closedState = null;
        if (tile === 'open_door') {
            closedState = 'door';
        } else if (tile === 'open_hidden_door') {
            closedState = 'hidden_door';
        } else if (tile === 'open_secret_passage') {
            closedState = 'secret_passage';
        }

        if (closedState) {
            // "Close" the door by converting it back to closed state
            if (this.currentFloorData && this.currentFloorData.tiles) {
                if (this.currentFloorData.tiles[targetY] && typeof (this.currentFloorData.tiles[targetY][targetX]) !== 'undefined') {
                    this.currentFloorData.tiles[targetY][targetX] = closedState;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Create a new Dungeon instance from saved data
     * @param {string} dungeonId - ID of the dungeon to load
     * @param {string} partyId - ID of the party to load position for
     * @returns {Promise<Dungeon|null>} New dungeon instance or null if not found
     */
    static async createFromDatabase(dungeonId, partyId) {
        try {
            // Create new dungeon instance
            const dungeon = new Dungeon();

            // Load the dungeon and party position
            const success = await dungeon.loadFromDatabase(dungeonId, partyId);

            if (!success) {
                return null;
            }

            return dungeon;

        } catch (error) {
            console.error('Failed to create dungeon from database:', error);
            return null;
        }
    }

    /**
     * Get all saved dungeons for a party (now returns party position data)
     * @param {string} partyId - Party ID to find dungeons for
     * @returns {Promise<Array>} Array of party position records
     */
    static async getSavedDungeonsForParty(partyId) {
        try {
            return await Storage.getSavedDungeonsForParty(partyId);
        } catch (error) {
            console.error('Failed to get saved dungeons for party:', error);
            return [];
        }
    }

    /**
     * Delete a saved dungeon
     * @param {string} dungeonId - ID of the dungeon to delete
     * @returns {Promise<boolean>} Success status
     */
    static async deleteSavedDungeon(dungeonId) {
        try {
            return await Storage.deleteDungeon(dungeonId);
        } catch (error) {
            console.error('Failed to delete saved dungeon:', error);
            return false;
        }
    }
}