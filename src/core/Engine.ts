import { Storage } from '../utils/Storage.ts';
import { EventSystem } from './EventSystem.ts';
import { GameState } from './GameState.ts';
import { Renderer } from '../rendering/Renderer.ts';
import { UI } from '../rendering/UI.ts';
import { AudioManager } from '../audio/AudioManager.ts';
import { Dungeon } from '../game/Dungeon.ts';
import { CombatInterface } from '../game/CombatInterface.ts';
import { PartySetupModal } from '../utils/PartySetupModal.ts';
import { Party } from '../game/Party.ts';
import { Equipment } from '../game/Equipment.ts';
import { Spells } from '../game/Spells.ts';
import { Monster } from '../game/Monster.ts';
import { Random } from '../utils/Random.ts';
import { TeamAssignmentService } from '../game/TeamAssignmentService.ts';
import type { CharacterData, EncounterData } from '../types/index.ts';

interface PlayerState {
  position: {
    x: number;
    y: number;
    facing: string;
  };
  currentFloor: number;
}

interface SpecialSquare {
  type: string;
  x: number;
  y: number;
  floor?: number;
  used?: boolean;
  message?: string;
}

interface DungeonValidationResult {
  valid: boolean;
  reason?: string;
  party?: CharacterData[];
  casualties?: CharacterData[];
  survivors?: CharacterData[];
}

/**
 * Main Game Engine
 * Manages the game loop, state transitions, and module coordination
 */
export class Engine {
  gameState: GameState | null;
  eventSystem: EventSystem | null;
  renderer: Renderer | null;
  ui: UI | null;
  party: Party | null;
  dungeon: Dungeon | null;
  player: PlayerState | null;
  isRunning: boolean;
  lastFrameTime: number;
  targetFPS: number;
  frameInterval: number;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  movementListenersInitialized: boolean;
  audioManager: AudioManager | null = null;
  combatInterface: CombatInterface | null = null;
  currentEncounterLocation: { x: number; y: number; floor: number } | null = null;

  constructor() {
    this.gameState = null;
    this.eventSystem = null;
    this.renderer = null;
    this.ui = null;
    this.party = null;
    this.dungeon = null;
    this.player = null;

    this.isRunning = false;
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;

    this.canvas = null;
    this.context = null;

    // Track if movement listeners are already set up
    this.movementListenersInitialized = false;

    this.gameLoop = this.gameLoop.bind(this);
  }

  /**
   * Initialize the game engine and all subsystems
   */
  async initialize(): Promise<void> {
    console.log('Initializing Descent: Cyber Wizardry...');

    try {
      // Initialize canvas
      this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      this.context = this.canvas?.getContext('2d') || null;

      if (!this.canvas || !this.context) {
        throw new Error('Failed to get canvas context');
      }

      // Initialize core systems
      this.eventSystem = new EventSystem();
      this.gameState = new GameState(this.eventSystem);
      this.renderer = new Renderer(this.canvas, this.context);
      this.ui = new UI(this.eventSystem);
      this.ui.gameState = this.gameState; // Pass gameState reference for combat UI
      this.audioManager = new AudioManager();

      // Initialize storage and entity systems
      console.log('Initializing storage and entity systems...');
      await this.initializeEntitySystems();

      // Initialize game objects
      await this.initializeParty();
      this.dungeon = new Dungeon(this.eventSystem);
      this.combatInterface = new CombatInterface(this.eventSystem, this);

      // Pass engine reference to UI and its children
      this.ui.setEngine(this);

      // Initialize player position object
      this.player = {
        position: { x: 10, y: 10, facing: 'north' },
        currentFloor: 1,
      };

      // Track current encounter for victory/defeat handling
      this.currentEncounterLocation = null;

      // Set up event listeners
      this.setupEventListeners();

      // Load initial game state
      await this.loadInitialState();

      // Initialize party display
      this.ui!.updatePartyDisplay(this.party);

      // Check for first-time play and show party setup modal
      await this.checkFirstTimePlay();

      // Start game loop
      this.start();

      // Keep window.engine for browser console debugging only
      window.engine = this;

      console.log('Game initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize game:', error);
      this.showErrorMessage('Failed to initialize game: ' + error.message);
    }
  }

  /**
   * Check for first-time play and show party setup modal
   */
  async checkFirstTimePlay(): Promise<void> {
    try {
      // Check if this is the first time playing
      const hasPlayedBefore = localStorage.getItem('descent_has_played');

      if (!hasPlayedBefore) {
        console.log('First time play detected, showing party setup modal...');

        // Show party setup modal
        return new Promise((resolve) => {
          const partySetupModal = new PartySetupModal(this.eventSystem);
          partySetupModal.show((partyName) => {
            console.log(`Party setup completed with name: "${partyName}"`);
            this.handlePartySetupComplete(partyName);
            resolve(undefined as any);
          });
        });
      } else {
        console.log('Returning player detected, skipping party setup...');
      }
    } catch (error: any) {
      console.error('Error checking first-time play:', error);
    }
  }

  /**
   * Handle completion of party setup modal
   */
  async handlePartySetupComplete(partyName) {
    try {
      // Set the party name
      if (this.party) {
        this.party!.name = partyName;

        // If this was a temporary party, convert it to permanent
        if (this.party._isTemporary) {
          this.party._isTemporary = false;
          console.log(
            `Converting temporary party to permanent: ${this.party!.id} (name: "${partyName}")`
          );
        }

        // Save the party to IndexedDB and set as active
        await this.party!.save();
        Storage.setActiveParty(this.party!.id);
        console.log(`Party saved and set as active: "${partyName}"`);

        // Update party display
        this.ui!.updatePartyDisplay(this.party);
      }

      // Mark as played before
      localStorage.setItem('descent_has_played', 'true');

      // Now transition to town
      this.gameState!.setState('town');
      this.ui!.addMessage("You arrive at the town near the Mad Overlord's castle.");
      this.ui!.addMessage('Visit the Training Grounds to create your party of adventurers.');

      // Emit event for any listeners
      this.eventSystem!.emit('party-setup-complete', { partyName });
    } catch (error: any) {
      console.error('Error handling party setup completion:', error);
    }
  }

  /**
   * Show party setup modal for temporary party entering dungeon
   */
  async showPartySetupForTemporaryParty() {
    return new Promise((resolve) => {
      const partySetupModal = new PartySetupModal(this.eventSystem!);
      partySetupModal.show((partyName) => {
        console.log(`Temporary party setup completed with name: "${partyName}"`);
        this.handleTemporaryPartySetupComplete(partyName);
        resolve(undefined as any);
      });
    });
  }

  /**
   * Handle completion of temporary party setup before dungeon entry
   */
  async handleTemporaryPartySetupComplete(partyName: string) {
    try {
      if (this.party && this.party._isTemporary) {
        // Set the party name and clear temporary flag
        this.party!.name = partyName;
        this.party._isTemporary = false; // No longer temporary

        // Save as a permanent party
        await this.party!.save(true); // true = set as active party
        console.log(
          `Temporary party converted to permanent party: ${this.party!.id} (name: "${partyName}")`
        );

        // Update party display
        this.ui!.updatePartyDisplay(this.party);

        // Continue with dungeon entry
        await this.enterDungeon();
      }
    } catch (error: any) {
      console.error('Error handling temporary party setup completion:', error);
    }
  }

  /**
   * Initialize party system - load existing active party or create new one
   */
  async initializeParty() {
    try {
      console.log('Initializing party system...');

      // Try to load the existing active party
      const activePartyId = Storage.getActivePartyId();
      let party: any = null;

      if (activePartyId) {
        party = await Party.load(activePartyId);
      }

      if (party) {
        console.log(`Loaded existing active party: ${party.id}`);
        this.party = party;

        // Validate party state - if wiped, create new party
        if (this.isPartyWiped(party)) {
          console.log('Active party is wiped, creating new party...');
          await this.handlePartyWipe();
        }
      } else {
        console.log('No active party found, creating new party...');
        party = await this.createNewParty();
        this.party = party;
      }

      if (!this.party) {
        console.error('Failed to initialize party, creating fallback party');
        this.party = new Party();
      }

      console.log(`Party initialized: ${this.party!.id} (${this.party!.members.length} members)`);
    } catch (error: any) {
      console.error('Failed to initialize party system:', error);
      this.party = new Party(); // Fallback
    }
  }

  /**
   * Check if a party is considered wiped (no alive members)
   */
  isPartyWiped(party: any) {
    if (!party || !party.members || party.members.length === 0) {
      return true;
    }

    const aliveMembers = party.members.filter(
      (member) =>
        member.isAlive &&
        member.status !== 'dead' &&
        member.status !== 'ashes' &&
        member.status !== 'lost'
    );

    return aliveMembers.length === 0;
  }

  /**
   * Create a new party (in-memory only, not saved until named)
   */
  async createNewParty(name: string | null = null) {
    try {
      const party = new Party();

      if (name) {
        // If a name is provided, this is a permanent party - save it
        party.name = name;
        await party.save();
        Storage.setActiveParty(party.id);
        console.log(`Created new permanent party: ${party.id} (name: "${name}")`);
      } else {
        // No name provided - create temporary in-memory party
        party.name = null;
        party._isTemporary = true;
        console.log(`Created temporary in-memory party: ${party.id} (not saved to database)`);
      }

      return party;
    } catch (error: any) {
      console.error('Failed to create new party:', error);
      return null;
    }
  }

  /**
   * Handle party camping - make current party inactive and create temporary placeholder
   */
  async handlePartyCamp() {
    try {
      console.log('Handling party camp - making party inactive...');

      if (this.party) {
        console.log(`Party ${this.party!.id} is now camping and inactive`);

        // Clear this party as the active party (but keep it in database)
        Storage.setActiveParty(null);
      }

      // Create temporary party (not saved until they enter dungeon)
      const newParty = new Party();
      newParty.name = 'Temporary Party';
      newParty._isTemporary = true; // Mark as temporary
      this.party = newParty;

      // Update UI
      if (this.ui) {
        this.ui!.updatePartyDisplay(this.party);
        this.ui!.addMessage(
          'A new expedition team has been assembled while your previous party rests...',
          'system'
        );
      }

      return newParty;
    } catch (error: any) {
      console.error('Failed to handle party camp:', error);
      return null;
    }
  }

  /**
   * Handle party wipe - remove current party and create temporary placeholder
   */
  async handlePartyWipe() {
    try {
      console.log('Handling party wipe...');

      if (this.party) {
        // Clear active party reference but keep the party record for history
        Storage.setActiveParty(null);
        console.log(`Party ${this.party!.id} removed as active (wiped)`);
      }

      // Create temporary party (not saved until they enter dungeon)
      const newParty = new Party();
      newParty.name = 'Temporary Party';
      newParty._isTemporary = true; // Mark as temporary for UI detection
      this.party = newParty;

      // Update UI
      if (this.ui) {
        this.ui!.updatePartyDisplay(this.party);
        this.ui!.addMessage('A new expedition team has been assembled...', 'system');
      }

      return newParty;
    } catch (error: any) {
      console.error('Failed to handle party wipe:', error);
      return null;
    }
  }

  /**
   * Resume a camped party and make it active
   * @param {string} partyId - ID of the party to resume
   * @returns {Promise<boolean>} Success status
   */
  async resumeCampedParty(partyId: string) {
    try {
      console.log(`Resuming camped party: ${partyId}`);

      // Load the party
      const party = await Party.load(partyId);
      if (!party) {
        console.error('Failed to load party for resumption');
        this.ui!.addMessage('Failed to find the party to resume.', 'error');
        return false;
      }

      // Check if this party has a camp (dungeon camping) or is just in town
      let isInTownCamp = true;
      let resumeResult: any = null;

      if (party.campId) {
        // Party has an actual camp - load the camp data
        resumeResult = await Storage.resumeCampWithEntityReferences(party.campId);
        if (!resumeResult.success) {
          console.error('Failed to load camp data:', resumeResult.error);
          this.ui!.addMessage('Failed to load camp data. The save may be corrupted.', 'error');
          return false;
        }

        // Check if this party was camping in town or in the dungeon
        isInTownCamp = !resumeResult.location || resumeResult.location.currentFloor === undefined;
      } else {
        // Party has no camp - it's just a town-based party
        isInTownCamp = true;
      }

      // Clear the camp reference from the party (only if it had a camp)
      if (party.campId) {
        party.clearCamp();
      }

      if (isInTownCamp) {
        // Party was camping in town or is a town-based party - keep them in town
        party.returnToTown();
      } else {
        // Party was camping in dungeon - they're going back into the dungeon
        party.leaveTown();
      }

      await party.save();

      // Handle the current active party before switching
      if (this.party) {
        // Check if current party is temporary (marked with _isTemporary flag)
        const isTemporaryParty = this.party._isTemporary;

        if (isTemporaryParty) {
          // Actively delete the temporary party from database if it was saved
          if (this.party!.id) {
            try {
              await Storage.deleteParty(this.party!.id);
              console.log(
                `Deleted temporary party: ${this.party!.id} (name: "${this.party!.name}", members: ${this.party!.members.length})`
              );
            } catch (error: any) {
              console.warn(`Failed to delete temporary party: ${error.message}`);
            }
          }
        } else {
          // Check if this is a legacy orphaned party from old system
          const isLegacyOrphan =
            this.party!.members.length === 0 &&
            (this.party!.name === 'Unnamed Party' ||
              !this.party!.name ||
              this.party!.name.trim() === '');

          if (isLegacyOrphan) {
            // Delete legacy orphaned parties
            try {
              await Storage.deleteParty(this.party!.id);
              console.log(
                `Deleted legacy orphaned party: ${this.party!.id} (name: "${this.party!.name}")`
              );
            } catch (error: any) {
              console.warn(`Failed to delete legacy orphaned party: ${error.message}`);
            }
          } else {
            // Set non-temporary active party as camped (in town) so it can be resumed later
            this.party.returnToTown();
            await this.party!.save(false); // Save without setting as active
            console.log(
              `Set previous active party as camped in town: ${this.party!.id} (name: "${this.party!.name}", members: ${this.party!.members.length})`
            );
          }
        }
      }

      // Set the resumed party as the new active party
      Storage.setActiveParty(party.id);
      this.party = party;

      if (isInTownCamp) {
        // Party was camping in town - keep them in town
        // Only set state if not already in town to avoid transition error
        if (this.gameState!.currentState !== 'town') {
          this.gameState!.setState('town');
        }
        this.ui!.updatePartyDisplay(this.party);
        this.ui!.addMessage(
          `${party.name || 'Your party'} is now active and ready in town.`,
          'success'
        );
      } else {
        // Party was camping in dungeon - restore dungeon state and enter dungeon
        const positionData = await Storage.loadPartyPosition(party.id);

        // NEW: Restore full dungeon layout if available in the resume result
        if (resumeResult.dungeonData) {
          console.log('Restoring procedural dungeon layout from save...');
          this.dungeon!.loadFromSave(resumeResult.dungeonData);
        } else {
          console.warn(
            'No dungeon layout found in save - dungeon will be Regenerated (seed may not match).'
          );
        }

        if (positionData) {
          // Restore dungeon state (position, direction, etc)
          this.dungeon!.currentFloor = (positionData as any).currentFloor;
          this.dungeon!.playerX = (positionData as any).playerX;
          this.dungeon!.playerY = (positionData as any).playerY;
          this.dungeon!.playerDirection = (positionData as any).playerDirection;
          this.dungeon!.testMode = (positionData as any).testMode;
          this.dungeon!.discoveredSecrets = new Set((positionData as any).discoveredSecrets || []);
          this.dungeon!.disarmedTraps = new Set((positionData as any).disarmedTraps || []);
          this.dungeon!.usedSpecials = new Set((positionData as any).usedSpecials || []);

          console.log(
            `Restored party to floor ${(positionData as any).currentFloor} at (${(positionData as any).playerX}, ${(positionData as any).playerY})`
          );
        }

        // Switch to dungeon state
        this.gameState!.setState('playing');
        this.ui!.updatePartyDisplay(this.party);
        this.ui!.addMessage(
          `${party.name || 'Your party'} resumes exploration from their camp...`,
          'success'
        );
      }

      return true;
    } catch (error: any) {
      console.error('Failed to resume camped party:', error);
      this.ui!.addMessage('An error occurred while resuming the party.', 'error');
      return false;
    }
  }

  /**
   * Initialize storage and entity systems
   */
  async initializeEntitySystems() {
    try {
      // Initialize IndexedDB
      console.log('Initializing IndexedDB...');
      await Storage.initializeDB();

      // Initialize entities from migration files
      console.log('Loading entities from migration files...');
      await Storage.loadEntitiesFromJSON();

      // Initialize individual entity systems
      console.log('Initializing Equipment system...');
      const equipment = new Equipment();
      await equipment.initializeEntities();

      console.log('Initializing Spells system...');
      const spells = new Spells();
      await spells.initializeEntities();

      console.log('Initializing Monster system...');
      const monster = new Monster();
      await monster.initializeEntities();

      console.log('✓ All entity systems initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize entity systems:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners for user input
   */
  setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', (event) => {
      this.eventSystem!.emit('keydown', event);
    });

    document.addEventListener('keyup', (event) => {
      this.eventSystem!.emit('keyup', event);
    });

    // Mouse input
    this.canvas!.addEventListener('click', (event) => {
      this.eventSystem!.emit('canvas-click', event);
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.eventSystem!.emit('window-resize');
    });

    // Game state events
    this.eventSystem!.on('game-state-change', (newState) => {
      this.handleStateChange(newState);
    });

    this.eventSystem!.on('party-update', () => {
      this.ui!.updatePartyDisplay(this.party);
    });

    this.eventSystem!.on('message', (message) => {
      this.ui!.addMessage(message);
    });

    // Player action events
    this.eventSystem!.on('player-action', async (action) => {
      await this.handlePlayerAction(action);
    });

    // Character creation events
    this.eventSystem!.on('character-created', (character) => {
      this.handleCharacterCreated(character);
    });

    this.eventSystem!.on('character-creation-cancelled', () => {
      this.handleCharacterCreationCancelled();
    });

    // Party management events
    this.eventSystem!.on('party-leader-change', (characterId) => {
      this.handlePartyLeaderChange(characterId);
    });

    // Town and training grounds events
    this.eventSystem!.on('town-location-selected', (location) => {
      this.handleTownLocationSelection(location);
    });

    this.eventSystem!.on('training-action', (action) => {
      this.handleTrainingAction(action);
    });

    // Dungeon exploration events
    this.eventSystem!.on('encounter-triggered', async (data) => {
      await this.handleEncounterTriggered(data);
    });

    this.eventSystem!.on('trap-triggered', (data) => {
      this.handleTrapTriggered(data);
    });

    this.eventSystem!.on('special-square-found', (data) => {
      this.handleSpecialSquareFound(data);
    });

    // Combat events
    this.eventSystem!.on('combat-start', (data) => {
      this.handleCombatStart(data);
    });

    this.eventSystem!.on('combat-ended', (data) => {
      this.handleCombatEnd(data);
    });

    this.eventSystem!.on('combat-flee-success', () => {
      this.handleCombatFleeSuccess();
    });

    // Listen for dungeon entry event
    this.eventSystem!.on('dungeon-entered', async () => {
      await this.handleDungeonEntered();
    });

    // Listen for exit tile events
    this.eventSystem!.on('exit-tile-entered', (data) => {
      this.ui!.showExitButton(data);
    });

    this.eventSystem!.on('exit-tile-left', () => {
      this.ui!.hideExitButton();
    });

    // Listen for treasure tile events
    this.eventSystem!.on('treasure-tile-entered', (data) => {
      this.ui!.showTreasureButton(data);
    });

    this.eventSystem!.on('treasure-tile-left', () => {
      this.ui!.hideTreasureButton();
    });

    // Listen for jack deep tile events
    this.eventSystem!.on('jack-deep-tile-entered', (data) => {
      this.ui!.showJackDeepButton(data);
    });

    // Listen for jack entry tile events
    this.eventSystem!.on('jack-entry-tile-entered', (data) => {
      this.ui!.showJackEntryButton(data);
    });

    this.eventSystem!.on('jack-tile-left', () => {
      this.ui!.hideJackDeepButton();
      this.ui!.hideJackEntryButton();
    });
  }

  /**
   * Load initial game state
   */
  async loadInitialState() {
    // Check if there's a saved game
    const savedGame = Storage.loadGame();

    if (savedGame) {
      // Load saved game
      this.gameState!.loadFromSave(savedGame);
      this.party!.loadFromSave(savedGame.party);
      this.dungeon!.loadFromSave(savedGame.dungeon);

      this.gameState!.setState('playing');
      this.ui!.addMessage('Game loaded successfully.');
    } else {
      // Check if this is first time play before setting state
      const hasPlayedBefore = localStorage.getItem('descent_has_played');

      if (!hasPlayedBefore) {
        // Don't set state to town yet - let checkFirstTimePlay handle it
        this.ui!.addMessage('Welcome to Descent: Cyber Wizardry!');
      } else {
        // Start new game - begin in town
        this.gameState!.setState('town');
        this.ui!.addMessage('Welcome to Descent: Cyber Wizardry!');
        this.ui!.addMessage("You arrive at the town near the Mad Overlord's castle.");
        this.ui!.addMessage('Visit the Training Grounds to create your party of adventurers.');
      }
    }
  }

  /**
   * Handle game state changes
   */
  handleStateChange(newState) {
    console.log('Game state changed to:', newState);
    console.log('Party size:', this.party ? this.party.size : 'no party');

    // Update body class for state-specific styling
    document.body.className = `game-state-${newState}`;

    // Handle audio transitions
    this.handleAudioTransition(newState);

    switch (newState) {
      case 'town':
        this.ui!.showTown(this.party || null);
        this.ui!.updatePartyDisplay(this.party);
        break;

      case 'training-grounds':
        this.ui!.hideTown(); // Hide town modal if open
        this.ui!.showTrainingGrounds();
        this.ui!.updatePartyDisplay(this.party);
        break;

      case 'character-creation':
        this.ui!.showCharacterCreation();
        break;

      case 'dungeon':
      case 'playing':
        console.log('Entering playing/dungeon state - initializing dungeon interface');
        this.ui!.hideCharacterCreation();
        this.ui!.hideTown();
        this.ui!.hideTrainingGrounds();
        this.ui!.updatePartyDisplay(this.party);

        // Initialize dungeon exploration interface
        this.initializeDungeonInterface();
        break;

      case 'combat':
        this.ui!.showCombatInterface();
        break;

      case 'menu':
        this.ui!.showGameMenu();
        break;

      case 'paused':
        this.pause();
        break;

      default:
        console.warn('Unknown game state:', newState);
    }
  }

  /**
   * Handle audio transitions based on game state
   */
  handleAudioTransition(newState) {
    if (!this.audioManager) return;

    // Resume audio context on first user interaction
    this.audioManager.resumeContext();

    switch (newState) {
      case 'town':
      case 'training-grounds':
        this.audioManager!.fadeToTrack('town');
        break;

      case 'playing':
        this.audioManager!.fadeToTrack('dungeon');
        break;

      case 'combat':
        this.audioManager!.fadeToTrack('combat');
        break;

      case 'game-over':
        this.audioManager!.fadeToTrack('death');
        break;

      default:
        // Keep current track for other states
        break;
    }
  }

  /**
   * Initialize dungeon exploration interface
   */
  initializeDungeonInterface() {
    // Ensure UI panels are visible
    this.ui!.showDungeonInterface();

    // Initialize player position if not already set
    if (!this.player || !this.player.position) {
      this.player = {
        position: { x: 10, y: 10, facing: 'north' },
        currentFloor: 1,
      };
    }

    // Sync player direction with dungeon direction system
    this.syncPlayerDirectionWithDungeon();

    // Resize canvas to fit the viewport
    this.resizeCanvasToViewport();

    // Update viewport with current dungeon view - use renderer directly for now
    this.updateDungeonView();

    // Enable movement controls
    this.enableMovementControls();
  }

  /**
   * Resize canvas to fit the viewport
   */
  resizeCanvasToViewport() {
    const viewport = document.getElementById('viewport');
    if (viewport && this.canvas && this.renderer) {
      const rect = viewport.getBoundingClientRect();
      // Use renderer's setSize method for consistent sizing
      this.renderer.setSize(rect.width, rect.height);
    }
  }

  /**
   * Update the dungeon 3D view
   */
  updateDungeonView() {
    // Update contextual UI buttons (e.g. Open Door)
    if (this.ui && this.dungeon) {
      this.ui!.updateContextualActions(this.dungeon);
    }

    console.log('updateDungeonView() called');
    console.log('Dungeon exists:', !!this.dungeon);
    console.log('Player exists:', !!this.player);
    console.log('Player position exists:', !!this.player?.position);
    console.log('Renderer exists:', !!this.renderer);

    if (this.dungeon && this.player && this.player.position) {
      // Use the renderer's dungeon rendering method
      console.log('Calling renderer.renderDungeon()...');
      this.renderer!.renderDungeon(this.dungeon, this.party);
    } else {
      // Fallback to basic dungeon rendering
      console.log('Using fallback renderBasicDungeon()...');
      this.renderer!.renderBasicDungeon();
    }
  }

  /**
   * Enable movement controls for dungeon exploration
   */
  enableMovementControls() {
    // Set up keyboard listeners for movement
    this.setupMovementEventListeners();

    // Enable movement buttons
    this.ui.enableMovementControls();
  }

  /**
   * Setup movement event listeners for dungeon exploration
   */
  setupMovementEventListeners() {
    // Prevent duplicate listeners
    if (this.movementListenersInitialized) {
      return;
    }

    // Button event listeners
    const forwardBtn = document.getElementById('move-forward');
    const backwardBtn = document.getElementById('move-backward');
    const leftBtn = document.getElementById('turn-left');
    const rightBtn = document.getElementById('turn-right');

    if (forwardBtn) {
      forwardBtn.addEventListener('click', () => {
        this.eventSystem!.emit('player-action', { type: 'move', direction: 'forward' });
      });
    }

    if (backwardBtn) {
      backwardBtn.addEventListener('click', () => {
        this.eventSystem!.emit('player-action', { type: 'move', direction: 'backward' });
      });
    }

    if (leftBtn) {
      leftBtn.addEventListener('click', () => {
        this.eventSystem!.emit('player-action', { type: 'turn', direction: 'left' });
      });
    }

    if (rightBtn) {
      rightBtn.addEventListener('click', () => {
        this.eventSystem!.emit('player-action', { type: 'turn', direction: 'right' });
      });
    }

    // Keyboard event listeners
    document.addEventListener('keydown', (event) => {
      if (this.gameState.isState('playing')) {
        switch (event.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            this.eventSystem!.emit('player-action', { type: 'move', direction: 'forward' });
            event.preventDefault();
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            this.eventSystem!.emit('player-action', { type: 'move', direction: 'backward' });
            event.preventDefault();
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            this.eventSystem!.emit('player-action', { type: 'turn', direction: 'left' });
            event.preventDefault();
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            this.eventSystem!.emit('player-action', { type: 'turn', direction: 'right' });
            event.preventDefault();
            break;
        }
      }
    });

    // Mark listeners as initialized to prevent duplicates
    this.movementListenersInitialized = true;
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop);

    console.log('Game loop started');
  }

  /**
   * Pause the game
   */
  pause() {
    this.isRunning = false;
    console.log('Game paused');
  }

  /**
   * Resume the game
   */
  resume() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop);

    console.log('Game resumed');
  }

  /**
   * Main game loop
   */
  gameLoop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;

    // Only update if enough time has passed (frame limiting)
    if (deltaTime >= this.frameInterval) {
      this.update(deltaTime);
      this.render();

      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Update game logic
   */
  update(deltaTime) {
    // Update game state
    this.gameState.update(deltaTime);

    // Update party
    if (this.party) {
      this.party.update(deltaTime);
    }

    // Update dungeon
    if (this.dungeon) {
      this.dungeon.update(deltaTime);
    }

    // Update UI
    if (this.ui) {
      this.ui!.update(deltaTime);
    }
  }

  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.context!.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

    // Render based on current state
    switch (this.gameState!.currentState) {
      case 'playing':
        this.renderer!.renderDungeon(this.dungeon, this.party);
        break;

      case 'combat':
        this.renderer!.renderCombat();
        break;

      case 'character-creation':
        this.renderer!.renderCharacterCreation();
        break;

      default:
        this.renderer!.renderDefaultScreen();
    }
  }

  /**
   * Save the current game state
   */
  saveGame() {
    try {
      const saveData = {
        gameState: this.gameState.getSaveData(),
        party: this.party.getSaveData(),
        dungeon: this.dungeon!.getSaveData(),
        timestamp: Date.now(),
      };

      Storage.saveGame(saveData);
      this.ui!.addMessage('Game saved successfully.');
    } catch (error: any) {
      console.error('Failed to save game:', error);
      this.ui!.addMessage('Failed to save game: ' + error.message);
    }
  }

  /**
   * Display error message to user
   */
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: red;
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: monospace;
        `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 5000);
  }

  /**
   * Handle player actions
   */
  async handlePlayerAction(action) {
    if (!this.gameState.isState('playing')) {
      return;
    }

    // Handle action object format from new movement system
    if (typeof action === 'object' && action.type) {
      const actionType = action.type;
      const direction = action.direction;

      if (actionType === 'move') {
        this.handleMovementAction(direction);
      } else if (actionType === 'turn') {
        this.handleTurnAction(direction);
      }
      return;
    }

    // Handle legacy string format actions
    switch (action) {
      case 'move-forward':
        if (this.dungeon.movePlayer('forward')) {
          this.ui!.addMessage('You move forward.');
        } else {
          this.ui!.addMessage('You cannot move forward - there is a wall in the way.');
        }
        break;

      case 'move-backward':
        if (this.dungeon.movePlayer('backward')) {
          this.ui!.addMessage('You move backward.');
        } else {
          this.ui!.addMessage('You cannot move backward - there is a wall in the way.');
        }
        break;

      case 'turn-left':
        this.dungeon.turnPlayer('left');
        this.ui!.addMessage(`You turn left. Now facing ${this.dungeon!.getDirectionName()}.`);
        break;

      case 'turn-right':
        this.dungeon.turnPlayer('right');
        this.ui!.addMessage(`You turn right. Now facing ${this.dungeon!.getDirectionName()}.`);
        break;

      case 'search':
        this.handleSearchAction();
        break;

      case 'action':
      case 'interact':
        this.handleInteractAction();
        break;

      case 'stairs-up':
        this.handleStairsAction('up');
        break;

      case 'stairs-down':
        this.handleStairsAction('down');
        break;

      case 'cast-spell':
        this.ui!.addMessage('Spell casting will be implemented in Phase 5.');
        break;

      case 'use-item':
        this.ui!.addMessage('Item usage will be implemented in Phase 4.');
        break;

      case 'rest':
        this.ui!.addMessage('Resting will be implemented in Phase 6.');
        break;

      case 'camp':
        await this.handleCampAction();
        break;

      case 'open-door':
        if (this.dungeon.openDoor()) {
          this.ui!.addMessage('You open the door.');

          // Immediately check context to update button state
          if (this.ui) {
            this.ui!.updateContextualActions(this.dungeon);
          }
        } else {
          this.ui!.addMessage('The door is stuck or locked.');
        }
        break;

      case 'close-door':
        if (this.dungeon.closeDoor()) {
          this.ui!.addMessage('You close the door.');

          // Immediately check context to update button state
          if (this.ui) {
            this.ui!.updateContextualActions(this.dungeon);
          }
        } else {
          this.ui!.addMessage('You cannot close this.');
        }
        break;

      default:
        console.warn('Unknown player action:', action);
    }
  }

  /**
   * Handle camp action
   */
  async handleCampAction() {
    try {
      // Check if party is in dungeon
      if (!this.party || this.party.inTown) {
        this.ui!.addMessage('You can only camp in a dungeon.');
        return;
      }

      // Check if party has any alive members
      if (!this.party.aliveMembers || this.party.aliveMembers.length === 0) {
        this.ui!.addMessage('No alive party members to make camp.');
        return;
      }

      // Check if already camping
      if (this.party.campId) {
        this.ui!.addMessage('Your party is already camping.');
        return;
      }

      // Check if in combat (if combat system is active)
      if (this.gameState && this.gameState!.currentState === 'combat') {
        this.ui!.addMessage('You cannot camp while in combat.');
        return;
      }

      // Save current party state
      await this.party!.save();

      // Save party position
      await Storage.savePartyPosition(this.party!.id, 'corrupted_network', {
        currentFloor: this.dungeon!.currentFloor,
        playerX: this.dungeon!.playerX,
        playerY: this.dungeon!.playerY,
        playerDirection: this.dungeon!.playerDirection,
        testMode: this.dungeon!.testMode,
        discoveredSecrets: this.dungeon!.discoveredSecrets,
        disarmedTraps: this.dungeon!.disarmedTraps,
        usedSpecials: this.dungeon!.usedSpecials,
      });

      // Create camp
      const campResult = await Storage.saveCampWithEntityReferences(
        this.party,
        this.dungeon,
        this.gameState
      );

      if ((campResult as any).success) {
        // Update party with camp reference
        this.party.setCamp((campResult as any).campId);
        await this.party!.save(false); // Don't set as active since they're camping

        this.ui!.addMessage(`Camp established! ${(campResult as any).message}`);
        this.ui!.addMessage('Your party is now resting safely. They can resume exploration later.');

        // Make the camped party inactive and create a new active party
        await this.handlePartyCamp();

        // Return to town with the new party
        await this.returnToTown();
      } else {
        this.ui!.addMessage('Failed to establish camp. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to handle camp action:', error);
      this.ui!.addMessage('An error occurred while trying to camp.');
    }
  }

  /**
   * Return party to town
   */
  async returnToTown() {
    try {
      if (this.party) {
        // NEW: Phase in all disconnected team members automatically
        const phasedOutMembers = this.party!.members.filter((member) => member.isPhasedOut);

        for (const member of phasedOutMembers) {
          if (member.canPhaseBackIn) {
            console.log(`Phasing in agent ${member.name} upon return to town`);
            if (member.phaseIn) {
              member.phaseIn();
            } else {
              // Fallback for characters without phaseIn method
              member.isPhasedOut = false;
              member.phaseOutReason = null;
              member.phaseOutDate = null;
            }

            // Keep confused/scrambled status - they remain disoriented
            // member.status and member.conditions stay as they are

            // Save updated character
            if (member.saveToStorage) {
              await member.saveToStorage();
            }
          }
        }

        // Emit event for UI updates
        if (this.eventSystem && phasedOutMembers.length > 0) {
          this.eventSystem!.emit('party-returned-to-town', {
            partyId: this.party!.id,
            phasedInMembers: phasedOutMembers.map((m) => m.id),
          });
        }

        this.party.returnToTown();
        await this.party!.save();
      }

      // Switch to town state
      this.gameState!.setState('town');
      this.ui!.addMessage('Party returned to town.');
    } catch (error: any) {
      console.error('Failed to return to town:', error);
      this.ui!.addMessage('An error occurred while returning to town.');
    }
  }

  /**
   * Handle movement actions (forward, backward)
   */
  handleMovementAction(direction) {
    console.log('Handling movement action:', direction);

    if (direction === 'forward') {
      if (this.dungeon.movePlayer && this.dungeon.movePlayer('forward')) {
        this.ui!.addMessage('You move forward.');
      } else {
        this.ui!.addMessage('You cannot move forward - there is a wall in the way.');
      }
    } else if (direction === 'backward') {
      if (this.dungeon.movePlayer && this.dungeon.movePlayer('backward')) {
        this.ui!.addMessage('You move backward.');
      } else {
        this.ui!.addMessage('You cannot move backward - there is a wall in the way.');
      }
    }

    // Update the dungeon view after movement
    this.updateDungeonView();
  }

  /**
   * Handle turn actions (left, right)
   */
  handleTurnAction(direction) {
    console.log('Handling turn action:', direction);

    if (direction === 'left') {
      if (this.dungeon.turnPlayer) {
        console.log('Calling dungeon.turnPlayer(left), before:', this.dungeon!.playerDirection);
        this.dungeon.turnPlayer('left');
        console.log('After dungeon.turnPlayer(left):', this.dungeon!.playerDirection);
        // Sync the player object with dungeon direction
        this.syncPlayerDirectionWithDungeon();
        this.ui!.addMessage(`You turn left. Now facing ${this.dungeon!.getDirectionName()}.`);
      } else {
        console.log('Dungeon.turnPlayer not available, using fallback');
        // Fallback: update player facing directly
        this.updatePlayerFacing('left');
        this.ui!.addMessage('You turn left.');
      }
    } else if (direction === 'right') {
      if (this.dungeon.turnPlayer) {
        console.log('Calling dungeon.turnPlayer(right), before:', this.dungeon!.playerDirection);
        this.dungeon.turnPlayer('right');
        console.log('After dungeon.turnPlayer(right):', this.dungeon!.playerDirection);
        // Sync the player object with dungeon direction
        this.syncPlayerDirectionWithDungeon();
        this.ui!.addMessage(`You turn right. Now facing ${this.dungeon!.getDirectionName()}.`);
      } else {
        console.log('Dungeon.turnPlayer not available, using fallback');
        // Fallback: update player facing directly
        this.updatePlayerFacing('right');
        this.ui!.addMessage('You turn right.');
      }
    }

    // Update the dungeon view after turning
    this.updateDungeonView();
  }

  /**
   * Sync player object direction with dungeon direction
   */
  syncPlayerDirectionWithDungeon() {
    if (!this.player || !this.player.position || !this.dungeon) return;

    const directions = ['north', 'east', 'south', 'west'];
    this.player.position.facing = directions[this.dungeon!.playerDirection];

    console.log(
      'Synced player direction:',
      this.player.position.facing,
      'from dungeon direction:',
      this.dungeon!.playerDirection
    );
  }

  /**
   * Update player facing direction
   */
  updatePlayerFacing(turn) {
    if (!this.player || !this.player.position) return;

    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(this.player.position.facing);

    if (turn === 'left') {
      this.player.position.facing = directions[(currentIndex - 1 + 4) % 4];
    } else if (turn === 'right') {
      this.player.position.facing = directions[(currentIndex + 1) % 4];
    }
  }

  /**
   * Handle search action in dungeon
   */
  handleSearchAction() {
    if (!this.gameState.isState('playing')) {
      return;
    }

    this.ui!.addMessage('You search the area carefully...');

    const discoveries = this.dungeon.searchArea();

    if (discoveries.length > 0) {
      discoveries.forEach((discovery) => {
        this.ui!.addMessage(discovery.message);
      });
    } else {
      this.ui!.addMessage('You find nothing of interest.');
    }
  }

  /**
   * Handle interaction with special squares
   */
  handleInteractAction() {
    if (!this.gameState.isState('playing')) {
      return;
    }

    // Check for special square at current position
    const special = (this.dungeon!.currentFloorData as any).specialSquares?.find(
      (spec) => spec.x === this.dungeon!.playerX && spec.y === this.dungeon!.playerY
    );

    if (!special) {
      this.ui!.addMessage('There is nothing to interact with here.');
      return;
    }

    if (special.used) {
      this.ui!.addMessage('This has already been used.');
      return;
    }

    // Handle special square interaction
    switch (special.type) {
      case 'healing_fountain':
        this.handleHealingFountain(special);
        break;

      case 'stamina_fountain':
        this.handleStaminaFountain(special);
        break;

      case 'poison_fountain':
        this.handlePoisonFountain(special);
        break;

      case 'teleporter':
        this.handleTeleporter(special);
        break;

      case 'treasure_chest':
        this.handleTreasureChest(special);
        break;

      default:
        this.ui!.addMessage('You cannot interact with this.');
    }
  }

  /**
   * Handle stairs movement
   */
  handleStairsAction(direction) {
    if (!this.gameState.isState('playing')) {
      return;
    }

    if (this.dungeon.changeFloor(direction)) {
      const floorNumber = this.dungeon!.currentFloor;
      this.ui!.addMessage(
        `You ${direction === 'up' ? 'ascend' : 'descend'} to floor ${floorNumber}.`
      );

      // Save game when changing floors
      this.saveGame();
    } else {
      this.ui!.addMessage(`There are no stairs ${direction} here.`);
    }
  }

  /**
   * Handle healing fountain interaction
   */
  handleHealingFountain(special) {
    this.ui!.addMessage('You drink from the crystal clear waters...');

    let totalHealed = 0;
    this.party!.members.forEach((member) => {
      if (member.currentHP < member.maxHP) {
        const healAmount = Random.integer(1, 8);
        const actualHeal = Math.min(healAmount, member.maxHP - member.currentHP);
        member.currentHP += actualHeal;
        totalHealed += actualHeal;

        if (member.status === 'unconscious' && member.currentHP > 0) {
          member.status = 'ok';
          this.ui!.addMessage(`${member.name} regains consciousness!`);
        }
      }
    });

    if (totalHealed > 0) {
      this.ui!.addMessage(`The party is healed for ${totalHealed} hit points!`);
      this.eventSystem!.emit('party-update');
    } else {
      this.ui!.addMessage('The water has no effect on your party.');
    }

    special.used = true;
  }

  /**
   * Handle stamina fountain interaction
   */
  handleStaminaFountain(special) {
    this.ui!.addMessage('You drink from the energizing waters...');

    // TODO: Restore spell points when spell system is fully integrated
    this.ui!.addMessage('You feel refreshed! (Spell points would be restored)');

    special.used = true;
  }

  /**
   * Handle poison fountain interaction
   */
  handlePoisonFountain(special) {
    this.ui!.addMessage('You cautiously drink from the tainted waters...');

    if (Random.chance(0.3)) {
      // Lucky - actually beneficial
      const member = Random.choice(this.party!.members);
      member.currentHP = Math.min(member.maxHP, member.currentHP + Random.integer(2, 12));
      this.ui!.addMessage(`Surprisingly, ${member.name} feels invigorated!`);
    } else {
      // Poisoned
      const member = Random.choice(this.party!.members);
      const damage = Random.integer(1, 6);
      member.currentHP = Math.max(0, member.currentHP - damage);
      this.ui!.addMessage(`${member.name} is poisoned and takes ${damage} damage!`);

      if (member.currentHP === 0) {
        member.status = 'unconscious';
        this.ui!.addMessage(`${member.name} collapses from the poison!`);
      }
    }

    this.eventSystem!.emit('party-update');
    special.used = true;
  }

  /**
   * Handle teleporter interaction
   */
  handleTeleporter(special) {
    this.ui!.addMessage('You step onto the magical portal...');

    // Teleport to random location on current floor
    const newX = Random.integer(1, 19);
    const newY = Random.integer(1, 19);
    this.dungeon!.playerX = newX;
    this.dungeon!.playerY = newY;

    this.ui!.addMessage('Reality blurs around you as you are teleported elsewhere!');

    // Teleporters don't get used up - they're permanent
  }

  /**
   * Handle treasure chest interaction
   */
  handleTreasureChest(special) {
    this.ui!.addMessage('You attempt to open the treasure chest...');

    // Check for chest trap
    if (Random.chance(0.4)) {
      // Trapped!
      const damage = Random.integer(1, 6);
      const target = Random.choice(this.party!.members);
      target.currentHP = Math.max(0, target.currentHP - damage);

      this.ui!.addMessage(
        `The chest is trapped! ${target.name} takes ${damage} damage from a poison needle.`
      );

      if (target.currentHP === 0) {
        target.status = 'unconscious';
        this.ui!.addMessage(`${target.name} collapses from the trap!`);
      }

      this.eventSystem!.emit('party-update');
    }

    // Generate treasure regardless of trap
    if (Random.chance(0.8)) {
      const goldFound = Random.integer(10, 100) * this.dungeon!.currentFloor;
      this.ui!.addMessage(`You find ${goldFound} gold pieces!`);
      // TODO: Add gold to party inventory

      // Small chance of special item
      if (Random.chance(0.1)) {
        this.ui!.addMessage('You also find a magical item!');
        // TODO: Generate and add magical item
      }
    } else {
      this.ui!.addMessage('The chest is empty...');
    }

    special.used = true;
  }

  /**
   * Handle character creation completion
   */
  async handleCharacterCreated(character) {
    console.log('Character created:', character);

    try {
      // NEW: Use TeamAssignmentService for automatic team assignment (Agents Always Part of Teams)
      console.log('Assigning new character to Strike Team...');
      const assignedTeam = await TeamAssignmentService.assignCharacterToTeam(character);

      // Add character to current active party for immediate gameplay
      if (this.party.addMember(character)) {
        // Ensure character is linked to the assigned team
        character.partyId = (assignedTeam as any).id;

        // Update party member list to match the assigned team
        if (this.party!.id !== (assignedTeam as any).id) {
          console.log(
            `Switching active party from ${this.party!.id} to ${(assignedTeam as any).id}`
          );
          // Load the assigned team as the new active party
          const partyData = await Storage.loadParty((assignedTeam as any).id);
          if (partyData) {
            // Create a proper Party instance from the loaded data
            this.party = new Party();
            this.party!.loadFromSave(partyData);
            if (!this.party.addMember(character)) {
              console.warn('Character was already in the assigned team');
            }
          }
        }

        // Save the updated party
        try {
          await this.party!.save();
          console.log(`Party ${this.party!.id} saved with updated member list`);
        } catch (error: any) {
          console.error('Failed to save party:', error);
        }

        this.ui!.addMessage(
          `${character.name} the ${character.race} ${character.class} has been assigned to Strike Team: ${(assignedTeam as any).name}!`
        );
        this.eventSystem!.emit('party-update');

        // Return to training grounds
        this.gameState!.setState('training-grounds');
      } else {
        this.ui!.addMessage('Party is full! Cannot add more characters.');
        this.gameState!.setState('training-grounds');
      }
    } catch (error: any) {
      console.error('Failed to assign character to Strike Team:', error);
      this.ui!.addMessage('Failed to assign character to Strike Team. Please try again.');
      this.gameState!.setState('training-grounds');
    }
  }

  /**
   * Handle character creation cancellation
   */
  handleCharacterCreationCancelled() {
    console.log('Character creation cancelled');

    // Return to training grounds only if not already there
    if (!this.gameState.isState('training-grounds')) {
      this.gameState!.setState('training-grounds');
    }
    this.ui!.addMessage('Character creation cancelled.');
  }

  /**
   * Handle party leader change
   */
  handlePartyLeaderChange(characterId) {
    const character = this.party!.members.find((c) => c.id === characterId);
    if (character) {
      this.party.currentLeader = character;
      console.log('Party leader changed to:', character.name);
    }
  }

  /**
   * Handle town location selection
   */
  handleTownLocationSelection(location) {
    console.log('Town location selected:', location);
    console.log('Current state before location selection:', this.gameState!.currentState);

    switch (location) {
      case 'training-grounds':
        this.gameState!.setState('training-grounds');
        break;

      case 'dungeon':
        console.log('Attempting dungeon entry...');
        // Show dungeon entrance confirmation modal
        this.ui!.showDungeonEntranceConfirmation();
        break;

      default:
        this.ui!.addMessage(`${location} is not yet implemented.`);
    }
  }

  /**
   * Handle training grounds actions
   */
  handleTrainingAction(action) {
    console.log('Training action:', action);

    switch (action) {
      case 'create-character':
        this.gameState!.setState('character-creation');
        break;

      case 'back-to-town':
        this.gameState!.setState('town');
        break;

      case 'view-party':
        this.ui!.addMessage('Party stats viewing not yet implemented.');
        break;

      default:
        this.ui!.addMessage(`Training action ${action} not yet implemented.`);
    }
  }

  /**
   * Validate if party can enter the dungeon
   * @param {boolean} fromAgentOps - Whether the request is coming from AgentOps modal
   * @param {boolean} postCombatReturn - Whether this is a post-combat return with casualties allowed
   */
  validateDungeonEntry(fromAgentOps = false, postCombatReturn = false) {
    console.log('=== Dungeon Entry Validation ===');
    console.log('Current game state:', this.gameState!.currentState);
    console.log('From AgentOps:', fromAgentOps);
    console.log('Post-combat return:', postCombatReturn);
    console.log('Party exists:', !!this.party);
    console.log('Party size:', this.party ? this.party.size : 'N/A');

    // Check if party exists and has members
    if (!this.party || this.party.size === 0) {
      console.log('Validation failed: No party or empty party');
      return { valid: false, reason: 'No party exists. Create characters first.' };
    }

    // Check party member status
    const aliveMembers = this.party!.members.filter((member) => member.isAlive);
    const unconsciousMembers = this.party!.members.filter((member) => member.isUnconscious);
    const deadMembers = this.party!.members.filter((member) => member.isDead);

    console.log('Party status:', {
      alive: aliveMembers.length,
      unconscious: unconsciousMembers.length,
      dead: deadMembers.length,
    });

    // Check if party has casualties (skip this check for post-combat returns)
    if (!postCombatReturn && (unconsciousMembers.length > 0 || deadMembers.length > 0)) {
      console.log('Validation failed: Party has casualties');
      return {
        valid: false,
        reason: 'Party has casualties and cannot enter the dungeon.',
        casualties: [...unconsciousMembers, ...deadMembers],
        survivors: aliveMembers,
      };
    }

    // Check if party has any living members
    if (aliveMembers.length === 0) {
      console.log('Validation failed: No living members');
      return {
        valid: false,
        reason: 'Your party has no living members! Visit the Temple for resurrections.',
      };
    }

    // Check if we're in a valid state to enter dungeon
    // Allow entry from town state, training-grounds state (AgentOps), or combat state (post-combat return)
    const validStates = ['town', 'training-grounds'];
    if (postCombatReturn) {
      validStates.push('combat'); // Allow return from combat with casualties
    }
    if (!validStates.includes(this.gameState!.currentState)) {
      console.log(
        'Validation failed: Invalid state for dungeon entry:',
        this.gameState!.currentState
      );
      return { valid: false, reason: 'You must be in town to enter the dungeon.' };
    }

    // All validation passed
    console.log('Validation passed: Ready to enter dungeon');
    return { valid: true, party: aliveMembers };
  }

  /**
   * Actually enter the dungeon (called after confirmation)
   * @param {boolean} fromAgentOps - Whether the request is coming from AgentOps modal
   * @param {boolean} postCombatReturn - Whether this is a post-combat return
   */
  async enterDungeon(fromAgentOps = false, postCombatReturn = false) {
    console.log('Entering dungeon...', { fromAgentOps, postCombatReturn });
    const validation = this.validateDungeonEntry(fromAgentOps, postCombatReturn);

    if (validation.valid) {
      console.log('Dungeon entry validation passed, entering dungeon...');

      // Mark party as leaving town and save to database
      if (this.party) {
        this.party.leaveTown();

        try {
          // Check if this is a temporary party that needs to be named first
          if (this.party._isTemporary) {
            // Show party setup modal to let player name the party before entering dungeon
            console.log('Temporary party detected, showing party setup modal...');
            await this.showPartySetupForTemporaryParty();
            return; // Exit early - the modal will call enterDungeon again after completion
          } else {
            // Regular save for existing party
            await this.party!.save();
            console.log('Party status saved: left town');
          }
        } catch (error: any) {
          console.error('Failed to save party dungeon status:', error);
        }
      }

      this.ui!.hideTown(); // Ensure town modal is closed
      if (fromAgentOps) {
        this.ui!.hideTrainingGrounds(); // Ensure AgentOps modal is closed
      }
      this.gameState!.setState('playing');

      // Different behavior for post-combat return vs new entry
      if (postCombatReturn) {
        this.ui!.addMessage('You continue exploring the corrupted network...');
        // Note: initializeDungeonInterface() already called by state change to 'playing'
        this.updateDungeonView();
      } else {
        this.ui!.addMessage('You enter the dungeon...');
        // Emit event to notify UI of dungeon entry (generates new dungeon)
        this.eventSystem!.emit('dungeon-entered');
      }
    } else {
      console.log('Dungeon entry validation failed:', validation.reason);
      this.ui!.addMessage(validation.reason);
    }
  }

  /**
   * Handle encounter triggered in dungeon
   */
  async handleEncounterTriggered(data) {
    console.log('Encounter triggered:', data);

    const { encounter, x, y, floor } = data;

    // Store encounter location for marking as defeated if player wins
    this.currentEncounterLocation = { x, y, floor };

    // Save dungeon state before entering combat
    if (this.dungeon && this.party && this.party!.id) {
      try {
        await this.dungeon.saveToDatabase(this.party!.id);
        console.log('Dungeon state saved before combat');
      } catch (error: any) {
        console.error('Failed to save dungeon state before combat:', error);
        // Continue with combat even if save fails
      }
    }

    // Generate combat encounter based on dungeon encounter
    const encounterType = encounter.type === 'boss' ? 'boss' : 'normal';
    const dungeonLevel = floor;

    // Display custom message if available
    const message = encounter.message || 'You are attacked by monsters!';
    this.ui!.addMessage(message);

    // Start combat through combat interface with specific monster ID if provided
    if (encounter.monsterId) {
      this.combatInterface.initiateSpecificCombat(
        this.party,
        encounter.monsterId,
        encounter.message
      );
    } else {
      this.combatInterface.initiateCombat(this.party, encounterType, dungeonLevel);
    }

    // Change game state to combat
    this.gameState!.setState('combat');

    // Show the combat interface with encounter message
    this.ui!.showCombatInterface();

    // Set encounter message if available
    if (encounter.message) {
      setTimeout(() => {
        const messageElement = document.getElementById('encounter-message');
        if (messageElement) {
          messageElement.textContent = encounter.message;
        }
      }, 100);
    }
  }

  /**
   * Handle trap triggered in dungeon
   */
  handleTrapTriggered(data) {
    console.log('Trap triggered:', data);

    const { type, x, y, floor } = data;
    let damage = 0;
    let message = '';

    switch (type) {
      case 'pit_trap':
        damage = Random.integer(1, 6);
        message = `The floor gives way! You fall into a pit trap for ${damage} damage.`;
        break;

      case 'poison_dart':
        damage = Random.integer(1, 4);
        message = `A dart shoots from the wall, striking for ${damage} poison damage!`;
        // TODO: Apply poison effect
        break;

      case 'teleport_trap':
        // Teleport party to random WALKABLE location on same floor
        let newX, newY;
        let attempts = 0;
        const maxAttempts = 100;

        do {
          newX = Random.integer(1, this.dungeon!.currentFloorData.width - 2);
          newY = Random.integer(1, this.dungeon!.currentFloorData.height - 2);
          attempts++;
        } while (!this.dungeon!.isWalkable(newX, newY) && attempts < maxAttempts);

        if (this.dungeon!.isWalkable(newX, newY)) {
          this.dungeon!.playerX = newX;
          this.dungeon!.playerY = newY;
          this.dungeon!.markExplored(newX, newY, 4);
          message = `You are suddenly teleported to another part of the dungeon!`;
        } else {
          message = `The teleport trap fizzles - you remain in place.`;
        }
        break;

      case 'alarm_trap':
        message = `An alarm sounds! Monsters are alerted to your presence.`;
        // Increase encounter chance for next few moves
        // TODO: Implement alarm effect
        break;

      default:
        message = `You triggered an unknown trap!`;
    }

    this.ui!.addMessage(message);

    // Apply damage to random party member if any
    if (damage > 0) {
      const livingMembers = this.party!.members.filter((m) => m.currentHP > 0);
      if (livingMembers.length > 0) {
        const target = Random.choice(livingMembers);
        target.currentHP = Math.max(0, target.currentHP - damage);

        this.ui!.addMessage(`${target.name} takes ${damage} damage from the trap.`);

        if (target.currentHP === 0) {
          target.status = 'unconscious';
          this.ui!.addMessage(`${target.name} is knocked unconscious!`);
        }

        this.eventSystem!.emit('party-update');
      }
    }
  }

  /**
   * Handle special square found in dungeon
   */
  handleSpecialSquareFound(data) {
    console.log('Special square found:', data);

    const { special, x, y, floor } = data;

    // Display special square message
    this.ui!.addMessage(special.message);

    switch (special.type) {
      case 'healing_fountain':
        this.ui!.addMessage('Press SPACE to drink from the healing fountain.');
        // TODO: Implement fountain interaction
        break;

      case 'stamina_fountain':
        this.ui!.addMessage('Press SPACE to drink from the energizing fountain.');
        // TODO: Implement stamina restoration
        break;

      case 'poison_fountain':
        this.ui!.addMessage('This water looks dangerous. Proceed with caution.');
        // TODO: Implement poison fountain risk/reward
        break;

      case 'teleporter':
        this.ui!.addMessage('Press SPACE to activate the teleporter.');
        // TODO: Implement teleporter mechanics
        break;

      case 'message_square':
        // Generate a random message from ancient carved text
        const messages = [
          'Here lies the bones of forty thieves...',
          'Beware the wrath of the Mad Overlord!',
          'Only the worthy may claim the sacred amulet.',
          'Many have entered, few have returned.',
          'The deeper you go, the greater the danger.',
          'Trust not the fountains of the lower levels.',
        ];
        this.ui!.addMessage(`The text reads: "${Random.choice(messages)}"`);
        break;

      case 'treasure_chest':
        this.ui!.addMessage('A treasure chest! Press SPACE to attempt to open it.');
        // TODO: Implement chest mechanics with trap/treasure chances
        break;

      default:
        this.ui!.addMessage('You find something unusual here.');
    }
  }

  /**
   * Handle combat start
   */
  handleCombatStart(data) {
    console.log('Combat started:', data);
    this.ui!.addMessage('Combat begins!');

    // Update UI to show combat interface
    this.ui!.showCombatInterface();
  }

  /**
   * Handle combat end
   */
  handleCombatEnd(data) {
    console.log('Combat ended:', data);

    const { victory, fled, casualties } = data;

    if (victory) {
      this.ui!.addMessage('Victory! The monsters are defeated.');

      // Mark encounter as defeated so it doesn't respawn for future parties
      if (this.currentEncounterLocation && this.dungeon) {
        const { x, y, floor } = this.currentEncounterLocation;
        const success = this.dungeon!.markEncounterDefeated(x, y, floor || 0);
        if (success) {
          console.log(`Encounter at (${x}, ${y}) permanently defeated`);

          // Save dungeon state to persist the defeated encounter
          if (this.party && this.party!.id) {
            this.dungeon.saveToDatabase(this.party!.id).catch((error) => {
              console.error('Failed to save dungeon state after encounter defeat:', error);
            });
          }
        }
      }

      // Handle rewards from combat
      if (data.rewards) {
        if (data.rewards.experience) {
          this.ui!.addMessage(`Your party gains ${data.rewards.experience} experience!`);
          // TODO: Distribute experience to party members
        }

        if (data.rewards.gold && data.rewards.gold > 0) {
          this.ui!.addMessage(`You found ${data.rewards.gold} gold coins!`);
          // TODO: Add gold to party treasury
        }

        if (data.rewards.loot && data.rewards.loot.length > 0) {
          const lootNames = data.rewards.loot.map((item) => item.name || 'Unknown Item');
          this.ui!.addMessage(`You found treasure: ${lootNames.join(', ')}`);
          // TODO: Add loot to party inventory
        }
      }
    } else if (fled) {
      this.ui!.addMessage('You successfully fled from combat.');
      // Don't mark encounter as defeated if player fled
    } else {
      this.ui!.addMessage('Your party has been defeated...');
      // Don't mark encounter as defeated if player lost - monster should remain
    }

    // Clear the stored encounter location
    this.currentEncounterLocation = null;

    if (casualties && casualties.length > 0) {
      casualties.forEach((casualty) => {
        this.ui!.addMessage(`${casualty.name} has fallen in battle.`);
        casualty.status = 'dead';
      });
    }

    // NOTE: Don't automatically return to dungeon exploration here
    // The victory/defeat modal buttons will handle the state transition
    // when the user clicks "Continue" or "Return to Town"
    // this.gameState!.setState('playing');
    // this.ui!.hideCombatInterface();
    this.eventSystem!.emit('party-update');
  }

  /**
   * Return to dungeon exploration after combat
   */
  returnToDungeon() {
    console.log('Returning to dungeon exploration...');

    // Change game state back to playing
    this.gameState!.setState('playing');

    // Initialize full dungeon interface (canvas, renderer, etc.)
    this.initializeDungeonInterface();

    // Update party display
    this.eventSystem!.emit('party-update');

    // Add message about returning to exploration
    this.ui!.addMessage('You continue exploring the dungeon...', 'system');
  }

  /**
   * Handle successful flee from combat
   */
  handleCombatFleeSuccess() {
    console.log('Successfully fled from combat');
    this.ui!.addMessage('You successfully escape from the monsters!');

    // Return to dungeon exploration
    this.gameState!.setState('playing');
    this.ui!.hideCombatInterface();
  }

  /**
   * Handle dungeon entry - generates new dungeon only if needed
   */
  async handleDungeonEntered() {
    console.log('Handling dungeon entry...');
    console.log('Current dungeon exists:', !!this.dungeon);
    console.log('Current dungeon testMode:', this.dungeon?.testMode);
    console.log('Party exists:', !!this.party);
    console.log('Party ID:', this.party?.id);
    console.log('Party members:', this.party?.members?.length);

    // Always check for saved dungeons for the current party, even if we have a dungeon
    if (this.party && this.party!.id) {
      console.log('Checking for saved dungeons for party:', this.party!.id);
      const savedDungeons = await Dungeon.getSavedDungeonsForParty(this.party!.id);

      if (savedDungeons.length > 0) {
        // Load the most recent dungeon
        const mostRecent = savedDungeons.sort(
          (a, b) =>
            new Date((b as any).lastModified).getTime() -
            new Date((a as any).lastModified).getTime()
        )[0];

        console.log(`Found saved dungeon: ${(mostRecent as any).dungeonId}, attempting to load...`);
        const loadedDungeon = await Dungeon.createFromDatabase('corrupted_network', this.party!.id);

        if (loadedDungeon) {
          this.dungeon = loadedDungeon;
          this.ui!.addMessage('Returning to your saved dungeon exploration...');
          console.log('Successfully loaded saved dungeon');
        } else {
          console.log('Failed to load saved dungeon');
          // Keep existing dungeon or create new one if none exists
          if (!this.dungeon) {
            console.log('Creating new dungeon...');
            this.dungeon = new Dungeon(this.eventSystem);
            this.ui!.addMessage('Creating new dungeon exploration...');
          } else {
            console.log('Using existing dungeon as fallback...');
            this.ui!.addMessage('Using current dungeon exploration...');
          }
        }
      } else {
        console.log('No saved dungeons found for this party');
        // Use existing shared dungeon, reset this party's position to a valid starting location
        console.log('Setting party starting position on procedural map...');
        this.dungeon!.currentFloor = 1;

        // Use the dungeon's setStartPosition method to find a valid spawn point
        const currentFloor = this.dungeon.floors.get(this.dungeon!.currentFloor);
        if (currentFloor) {
          this.dungeon!.setStartPosition(currentFloor);
        }

        // Clear party-specific progress (but keep shared world state)
        this.dungeon!.discoveredSecrets = new Set();
        this.dungeon!.disarmedTraps = new Set();
        // Note: usedSpecials (treasures) are shared across all parties

        this.ui!.addMessage('Beginning exploration of the corrupted network...');
      }
    } else {
      console.log('No party found');
      // Create new dungeon if none exists
      if (!this.dungeon) {
        console.log('Creating new dungeon...');
        this.dungeon = new Dungeon(this.eventSystem);
      } else {
        console.log('Using existing dungeon...');
      }
    }

    // Note: initializeDungeonInterface() is called by the state change to 'playing'
    // so we don't need to call it again here to avoid duplicate event listeners

    console.log('Dungeon entry handled - interface will be initialized by state change');
  }

  /**
   * Get current game statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      currentState: this.gameState ? this.gameState!.currentState : 'uninitialized',
      partySize: this.party ? (this.party as any).size : 0,
      frameRate: Math.round(1000 / this.frameInterval),
      dungeonFloor: this.dungeon ? this.dungeon!.currentFloor : 0,
      combatActive: this.combatInterface ? (this.combatInterface as any).isInCombat() : false,
    };
  }
}
