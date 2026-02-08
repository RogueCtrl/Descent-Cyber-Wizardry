/**
 * Main Entry Point — Descent: Cyber Wizardry
 *
 * This file bootstraps the game by importing all modules.
 * All classes are accessed via ES module imports throughout the codebase.
 * Only window.engine remains (assigned in Engine.ts for console debugging).
 */

// ─── Core ────────────────────────────────────────────────────
import { Engine } from './core/Engine.ts';

// ─── Ensure all modules are bundled (side-effect imports) ────
// These imports ensure Vite includes all game modules in the bundle.
// Each module is used transitively via Engine.ts and its subsystems.
import './core/EventSystem.ts';
import './core/GameState.ts';
import './data/terminology.ts';
import './data/migrations/weapons-v1.0.0.ts';
import './data/migrations/weapons-v1.1.0.ts';
import './data/migrations/armor-v1.0.0.ts';
import './data/migrations/armor-v1.1.0.ts';
import './data/migrations/shields-v1.0.0.ts';
import './data/migrations/accessories-v1.0.0.ts';
import './data/migrations/spells-v1.0.0.ts';
import './data/migrations/spells-v1.1.0.ts';
import './data/migrations/conditions-v1.0.0.ts';
import './data/migrations/effects-v1.0.0.ts';
import './data/migrations/monsters-v1.0.0.ts';
import './utils/Random.ts';
import './utils/Helpers.ts';
import './utils/Storage.ts';
import './utils/TextManager.ts';
import './utils/Modal.ts';
import './utils/PartySetupModal.ts';
import './utils/AttributeRoller.ts';
import './audio/AudioManager.ts';
import './rendering/Viewport3D.ts';
import './rendering/MiniMapRenderer.ts';
import './rendering/MonsterPortraitRenderer.ts';
import './rendering/Renderer.ts';
import './rendering/CharacterUI.ts';
import './rendering/UI.ts';
import './game/Character.ts';
import './game/CharacterCreator.ts';
import './game/CharacterRoster.ts';
import './game/Race.ts';
import './game/CharacterClass.ts';
import './game/Party.ts';
import './game/Combat.ts';
import './game/CombatInterface.ts';
import './game/Dungeon.ts';
import './game/Equipment.ts';
import './game/Spells.ts';
import './game/SpellMemorization.ts';
import './game/Monster.ts';
import './game/Formation.ts';
import './game/InventorySystem.ts';
import './game/TeamAssignmentService.ts';
import './game/DeathSystem.ts';
import './game/RestSystem.ts';
import './game/AdvancedCharacterSheet.ts';
import './game/CombatTest.ts';
import './game/DungeonTest.ts';
import './game/MagicTest.ts';

// ══════════════════════════════════════════════════════════════
// Boot
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const game = new Engine();
  game.initialize();
});
