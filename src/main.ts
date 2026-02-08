/**
 * Main Entry Point — Descent: Cyber Wizardry
 *
 * This file bootstraps the game by importing all modules and
 * wiring them into the global scope (window.*) for backward
 * compatibility. Once the full TypeScript migration is complete
 * (Phase 4), the window.* assignments can be removed.
 */

// ─── Core ────────────────────────────────────────────────────
import { EventSystem } from './core/EventSystem.ts';
import { GameState } from './core/GameState.ts';
import { Engine } from './core/Engine.ts';

// ─── Data ────────────────────────────────────────────────────
import { TERMINOLOGY, TerminologyUtils } from './data/terminology.ts';

// Migration data
import { weaponsMigration } from './data/migrations/weapons-v1.0.0.ts';
import { weaponsMigrationV110 } from './data/migrations/weapons-v1.1.0.ts';
import { armorMigration } from './data/migrations/armor-v1.0.0.ts';
import { armorMigrationV110 } from './data/migrations/armor-v1.1.0.ts';
import { shieldsMigration } from './data/migrations/shields-v1.0.0.ts';
import { accessoriesMigration } from './data/migrations/accessories-v1.0.0.ts';
import { spellsMigration } from './data/migrations/spells-v1.0.0.ts';
import { spellsMigrationV110 } from './data/migrations/spells-v1.1.0.ts';
import { conditionsMigration } from './data/migrations/conditions-v1.0.0.ts';
import { effectsMigration } from './data/migrations/effects-v1.0.0.ts';
import { monstersMigration } from './data/migrations/monsters-v1.0.0.ts';

// ─── Utils ───────────────────────────────────────────────────
import { Random } from './utils/Random.ts';
import { Helpers } from './utils/Helpers.ts';
import { Storage } from './utils/Storage.ts';
import { TextManager } from './utils/TextManager.ts';
import { Modal } from './utils/Modal.ts';
import { PartySetupModal } from './utils/PartySetupModal.ts';
import { AttributeRoller } from './utils/AttributeRoller.ts';

// ─── Audio ───────────────────────────────────────────────────
import { AudioManager } from './audio/AudioManager.ts';

// ─── Rendering ───────────────────────────────────────────────
import { Viewport3D } from './rendering/Viewport3D.ts';
import { MiniMapRenderer } from './rendering/MiniMapRenderer.ts';
import { MonsterPortraitRenderer } from './rendering/MonsterPortraitRenderer.ts';
import { Renderer } from './rendering/Renderer.ts';
import { CharacterUI } from './rendering/CharacterUI.ts';
import { UI } from './rendering/UI.ts';

// ─── Game ────────────────────────────────────────────────────
import { Character } from './game/Character.ts';
import { CharacterCreator } from './game/CharacterCreator.ts';
import { CharacterRoster } from './game/CharacterRoster.ts';
import { Race } from './game/Race.ts';
import { CharacterClass } from './game/CharacterClass.ts';
import { Party } from './game/Party.ts';
import { Combat } from './game/Combat.ts';
import { CombatInterface } from './game/CombatInterface.ts';
import { Dungeon } from './game/Dungeon.ts';
import { Equipment } from './game/Equipment.ts';
import { Spells } from './game/Spells.ts';
import { SpellMemorization } from './game/SpellMemorization.ts';
import { Monster } from './game/Monster.ts';
import { Formation } from './game/Formation.ts';
import { InventorySystem } from './game/InventorySystem.ts';
import { TeamAssignmentService } from './game/TeamAssignmentService.ts';
import { DeathSystem } from './game/DeathSystem.ts';
import { RestSystem } from './game/RestSystem.ts';
import { AdvancedCharacterSheet } from './game/AdvancedCharacterSheet.ts';

// ─── Test Files ──────────────────────────────────────────────
import { CombatTest } from './game/CombatTest.ts';
import { DungeonTest } from './game/DungeonTest.ts';
import { MagicTest } from './game/MagicTest.ts';

// ══════════════════════════════════════════════════════════════
// Backward Compatibility: expose all classes on window so that
// existing code that references globals (e.g. window.engine,
// Class.getClassData) continues to work during migration.
// These will be removed in Phase 4.
// ══════════════════════════════════════════════════════════════

// Core
window.EventSystem = EventSystem;
window.GameState = GameState;
window.Engine = Engine;

// Data
window.TERMINOLOGY = TERMINOLOGY;
window.TerminologyUtils = TerminologyUtils;
window.weaponsMigration = weaponsMigration;
window.weaponsMigrationV110 = weaponsMigrationV110;
window.armorMigration = armorMigration;
window.armorMigrationV110 = armorMigrationV110;
window.shieldsMigration = shieldsMigration;
window.accessoriesMigration = accessoriesMigration;
window.spellsMigration = spellsMigration;
window.spellsMigrationV110 = spellsMigrationV110;
window.conditionsMigration = conditionsMigration;
window.effectsMigration = effectsMigration;
window.monstersMigration = monstersMigration;

// Utils
window.Random = Random;
window.Helpers = Helpers;
(window as any).Storage = Storage;
window.TextManager = TextManager;
window.Modal = Modal;
window.PartySetupModal = PartySetupModal;
window.AttributeRoller = AttributeRoller;

// Audio
window.AudioManager = AudioManager;

// Rendering
window.Viewport3D = Viewport3D;
window.MiniMapRenderer = MiniMapRenderer;
window.MonsterPortraitRenderer = MonsterPortraitRenderer;
window.Renderer = Renderer;
window.CharacterUI = CharacterUI;
window.UI = UI;

// Game
window.Character = Character;
window.CharacterCreator = CharacterCreator;
window.CharacterRoster = CharacterRoster;
window.Race = Race;
// Map CharacterClass → window.Class for backward compat
// (renamed from Class to avoid TypeScript keyword conflict)
window.Class = CharacterClass;
window.CharacterClass = CharacterClass;
window.Party = Party;
window.Combat = Combat;
window.CombatInterface = CombatInterface;
window.Dungeon = Dungeon;
window.Equipment = Equipment;
window.Spells = Spells;
window.SpellMemorization = SpellMemorization;
window.Monster = Monster;
window.Formation = Formation;
window.InventorySystem = InventorySystem;
window.TeamAssignmentService = TeamAssignmentService;
window.DeathSystem = DeathSystem;
window.RestSystem = RestSystem;
window.AdvancedCharacterSheet = AdvancedCharacterSheet;

// Tests
(window as any).CombatTest = CombatTest;
(window as any).DungeonTest = DungeonTest;
(window as any).MagicTest = MagicTest;

// ══════════════════════════════════════════════════════════════
// Boot
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const game = new Engine();
    game.initialize();
});
