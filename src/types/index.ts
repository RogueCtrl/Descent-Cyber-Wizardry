/**
 * Core Type Definitions — Descent: Cyber Wizardry
 *
 * Foundational interfaces and types shared across the codebase.
 * These represent the game's primary data structures.
 */

// ─── Attributes ──────────────────────────────────────────────

export interface Attributes {
  strength: number;
  intelligence: number;
  piety: number;
  vitality: number;
  agility: number;
  luck: number;
}

// ─── Character ───────────────────────────────────────────────

export type DeathState = 'alive' | 'dead' | 'ashes' | 'lost';

export type CharacterStatus =
  | 'OK'
  | 'DEAD'
  | 'ASHES'
  | 'LOST'
  | 'POISONED'
  | 'PARALYZED'
  | 'STONED'
  | 'SILENCED'
  | 'ASLEEP'
  | 'AFRAID';

export interface MemorizedSpells {
  arcane: string[];
  divine: string[];
  [key: string]: any;
}

export interface CharacterData {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  attributes: Attributes;
  currentHP: number;
  maxHP: number;
  currentSP: number;
  maxSP: number;
  isAlive: boolean;
  status: CharacterStatus;
  age: number;
  alignment: string;
  equipment: Record<string, string | null>;
  inventory: string[];
  memorizedSpells: MemorizedSpells;
  conditions: ConditionInstance[];
  temporaryEffects: TemporaryEffect[];
  classHistory: string[];
  deathState?: DeathState;
  deathCount?: number;
  /** Cyber name variant */
  cyberName?: string;
}

// ─── Party ───────────────────────────────────────────────────

export interface PartyData {
  id: string;
  name: string;
  members: CharacterData[];
  gold: number;
  food: number;
  torches: number;
  lightRemaining: number;
  formation: FormationData;
}

export interface FormationData {
  frontRow: string[];
  backRow: string[];
}

// ─── Combat ──────────────────────────────────────────────────

export interface CombatAction {
  type: 'attack' | 'spell' | 'item' | 'defend' | 'flee' | 'parry';
  actorId: string;
  targetId?: string;
  spellId?: string;
  itemId?: string;
}

export interface CombatResult {
  hit: boolean;
  damage: number;
  critical: boolean;
  message: string;
}

export interface MonsterGroup {
  monsterId: string;
  count: number;
  monsters: MonsterInstance[];
}

export interface MonsterInstance {
  id: string;
  templateId: string;
  currentHP: number;
  maxHP: number;
  isAlive: boolean;
  conditions: ConditionInstance[];
}

// ─── Dungeon ─────────────────────────────────────────────────

export type Direction = 0 | 1 | 2 | 3; // N=0, E=1, S=2, W=3

export interface Position {
  x: number;
  y: number;
  floor: number;
  direction: Direction;
}

export interface DungeonTile {
  type: 'wall' | 'floor' | 'door' | 'stairs_up' | 'stairs_down' | 'special';
  walls: { north: boolean; east: boolean; south: boolean; west: boolean };
  explored: boolean;
  encounter?: EncounterData;
  special?: string;
  treasure?: TreasureData;
  event?: string;
}

export interface DungeonFloor {
  width: number;
  height: number;
  tiles: DungeonTile[][];
  rooms: RoomData[];
  encounters: EncounterData[];
}

export interface RoomData {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export interface EncounterData {
  id: string;
  type: 'monster' | 'trap' | 'event' | 'treasure' | 'npc';
  monsterGroups?: MonsterGroup[];
  defeated?: boolean;
  x: number;
  y: number;
}

export interface TreasureData {
  gold?: number;
  items?: string[];
  opened?: boolean;
}

// ─── Equipment ───────────────────────────────────────────────

export type EquipmentSlot =
  | 'weapon'
  | 'shield'
  | 'head'
  | 'body'
  | 'hands'
  | 'feet'
  | 'accessory'
  | 'accessory2';

export interface EquipmentItem {
  id: string;
  name: string;
  cyberName: string;
  type: string;
  slot: EquipmentSlot;
  damage?: DiceRoll;
  armorClass?: number;
  price: number;
  weight: number;
  classRestrictions?: string[];
  raceRestrictions?: string[];
  alignment?: string;
  cursed?: boolean;
  identified?: boolean;
  effects?: ItemEffect[];
  /** Extended properties used by Equipment system */
  allowedClasses?: string[];
  subtype?: string;
  acBonus?: number;
  attackBonus?: number;
  magical?: boolean;
  special?: string[];
  value?: number;
  quality?: string;
  durability?: number;
  maxDurability?: number;
  broken?: boolean;
  brokenState?: {
    originalAttackBonus: number;
    originalACBonus: number;
    originalDamageBonus: number;
    originalSpecial: string[];
  };
  state?: string;
  unidentified?: boolean;
  charges?: number | null;
  maxCharges?: number | null;
  disguisedAs?: string;
  apparentName?: string;
  apparentDescription?: string;
  description?: string;
  curseName?: string;
  curseEffect?: string;
  identificationDC?: number;
  spellBonus?: number;
  hpBonus?: number;
  stealthBonus?: number;
  blessed?: boolean;
  [key: string]: any;
}

export interface DiceRoll {
  dice: number;
  sides: number;
  modifier?: number;
  bonus?: number;
  count?: number;
}

export interface ItemEffect {
  type: string;
  value: number;
  stat?: string;
}

// ─── Spells ──────────────────────────────────────────────────

export type SpellType = 'arcane' | 'divine';

export interface SpellData {
  id: string;
  name: string;
  cyberName: string;
  type: SpellType;
  level: number;
  mpCost: number;
  target: 'single' | 'group' | 'all' | 'self' | 'party';
  effect: string | SpellEffect;
  description: string;
  cyberDescription?: string;
  /** Extended properties used by Spells system */
  school?: string;
  dice?: DiceRoll;
  range?: string;
  duration?: string;
  components?: string[];
  areaEffect?: boolean;
  special?: string;
  bonus?: number;
  acBonus?: number;
  [key: string]: any;
}

export interface SpellEffect {
  type: string;
  value?: number;
  dice?: DiceRoll;
  duration?: number;
  element?: string;
}

// ─── Monsters ────────────────────────────────────────────────

export type AIType = 'aggressive' | 'defensive' | 'caster' | 'support' | 'random';

export interface MonsterData {
  id: string;
  name: string;
  cyberName: string;
  level: number;
  hitDie: number;
  armorClass: number;
  attacks: MonsterAttack[];
  aiType: AIType;
  experience: number;
  gold?: DiceRoll;
  resistances?: string[];
  weaknesses?: string[];
  immunities?: string[];
  spells?: string[];
  abilities?: string[];
  portraitModel?: PortraitModel;
  loot?: LootTable[];
}

export interface MonsterAttack {
  name: string;
  damage: DiceRoll;
  element?: string;
  special?: string;
}

export interface PortraitModel {
  vertices: number[][];
  edges: number[][];
  color?: string;
}

export interface LootTable {
  itemId: string;
  chance: number;
}

// ─── Conditions & Effects ────────────────────────────────────

export interface ConditionInstance {
  id: string;
  type: string;
  duration?: number;
  stacks?: number;
  source?: string;
}

export interface TemporaryEffect {
  id: string;
  type: string;
  value: number;
  duration: number;
  stat?: string;
  source?: string;
}

// ─── Events ──────────────────────────────────────────────────

/**
 * Event payload types for the EventSystem.
 *
 * NOTE: EventSystem.emit() uses variadic args, NOT object payloads.
 * Example: emit('game-state-change', newState, oldState, data)
 * NOT: emit('game-state-change', { from: newState, to: oldState })
 *
 * This interface documents the ACTUAL arguments passed to emit().
 * Each value is a tuple type representing the arguments after the event name.
 */
export interface GameEventMap {
  // ─── Core State & Flow ───────────────────────────────────
  'game-state-change': [newState: string, oldState: string, data?: any];
  'autosave-requested': [];
  'party-setup-complete': [data: { partyName: string }];

  // ─── Input Events ────────────────────────────────────────
  'keydown': [event: KeyboardEvent];
  'keyup': [event: KeyboardEvent];
  'canvas-click': [event: MouseEvent];
  'window-resize': [];

  // ─── Player Actions ──────────────────────────────────────
  'player-action': [action: string] | [data: { type: string; direction: string }];
  'game-menu-toggle': [];
  'save-game': [];

  // ─── Party & Character ───────────────────────────────────
  'party-update': [] | [party?: PartyData];
  'party-returned-to-town': [data: { partyId: string; partyName: string }];
  'party-deleted': [data: { partyId: string; partyName: string }];
  'party-roster-changed': [];
  'party-rested': [data: { partyId: string; location: string; healing: any }];
  'party-defeated': [data: { reason?: string }];
  'party-leader-change': [characterId: string];
  'character-updated': [data: { character: CharacterData }];
  'character-created': [character: CharacterData];
  'character-death': [data: { characterId: string; deathState: DeathState }];
  'character-resurrection': [data: { characterId: string; newState: DeathState }];
  'character-state-changed': [];
  'character-disconnected': [data: { characterId: string; reason: string }];
  'character-creation-cancelled': [];

  // ─── Combat ──────────────────────────────────────────────
  'combat-started': [data: { enemies: MonsterGroup[]; encounter?: EncounterData }];
  'combat-ended': [data: { victory: boolean; rewards?: any; defeatedMonsters?: any[] }];
  'combat-action-ready': [];
  'combat-action-selected': [data: { action: CombatAction }];
  'combat-action-processed': [data: { action: CombatAction; result: any }];
  'formation-changed': [data: { partyId: string; formation: FormationData }];
  'formation-optimized': [data: { formation: FormationData; reason: string }];
  'ai-action-taken': [data: { monsterId: string; action: string; targetId?: string }];

  // ─── Dungeon & Exploration ───────────────────────────────
  'dungeon-entered': [];
  'encounter-triggered': [data: { encounter: EncounterData; x: number; y: number; floor: number } | { encounter: EncounterData; position: Position }];
  'exit-tile-entered': [data: { x: number; y: number; floor: number }];
  'exit-tile-left': [];
  'jack-entry-tile-entered': [data: { x: number; y: number; floor: number }];
  'jack-deep-tile-entered': [data: { x: number; y: number; floor: number }];
  'jack-tile-left': [];
  'treasure-tile-entered': [data: { treasure: TreasureData; x: number; y: number; floor: number }];
  'treasure-tile-left': [];
  'trap-triggered': [data: { trap: any; x: number; y: number; floor: number }];
  'special-square-found': [data: { special: any; x: number; y: number; floor: number }];
  'dungeon-floor-change': [data: { floor: number; direction: 'up' | 'down' }];

  // ─── Town & UI ───────────────────────────────────────────
  'town-location-selected': [location: string];
  'training-action': [action: string];
  'show-message': [data: { message: string; type?: string }];

  // ─── Text & Audio ────────────────────────────────────────
  textModeChanged: [data: { newMode: string; oldMode: string }];
}

// ─── Game State ──────────────────────────────────────────────

export type GameStateName =
  | 'loading'
  | 'title'
  | 'town'
  | 'playing'
  | 'combat'
  | 'game-over'
  | 'character-creation'
  | 'party-management'
  | 'shopping'
  | 'temple'
  | 'rest'
  | 'inventory';

// ─── Audio ───────────────────────────────────────────────────

export interface SoundEffect {
  freq: number;
  duration: number;
  wave?: OscillatorType;
  volume?: number;
  sweep?: { start: number; end: number };
}

export interface MusicNote {
  freq: number;
  duration: number;
  wave?: OscillatorType;
  volume?: number;
}

// ─── Storage ─────────────────────────────────────────────────

export interface SaveData {
  timestamp: number;
  version: string;
  party?: PartyData;
  dungeon?: any;
  gameState?: string;
  settings?: GameSettings;
}

export interface GameSettings {
  mode: 'classic' | 'cyber';
  musicVolume: number;
  sfxVolume: number;
  autoSave: boolean;
}

export interface CampData {
  campId: string;
  partyId: string;
  partyName: string;
  members: CharacterData[];
  location: Position;
  campTime: number;
  resources: {
    gold: number;
    food: number;
    torches: number;
    lightRemaining: number;
  };
  dungeonProgress: {
    floorsExplored: number[];
    encountersDefeated: number;
    treasuresFound: number;
    secretsDiscovered: number;
  };
  gameVersion: string;
  saveType: string;
}

// ─── Rendering ───────────────────────────────────────────────

export interface ViewportConfig {
  width: number;
  height: number;
  fov: number;
  nearPlane: number;
  farPlane: number;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}
