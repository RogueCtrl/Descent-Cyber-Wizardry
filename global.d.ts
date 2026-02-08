/**
 * Global type declarations for Descent: Cyber Wizardry
 *
 * These declarations extend the Window interface to include all the game
 * classes and data that are exposed as globals during the migration period.
 * They will be removed in Phase 4 when window.* references are cleaned up.
 */

// Import types for the declarations
import type { EventSystem } from './src/core/EventSystem.ts';
import type { GameState } from './src/core/GameState.ts';
import type { Engine } from './src/core/Engine.ts';
import type { AudioManager } from './src/audio/AudioManager.ts';
import type { Random } from './src/utils/Random.ts';
import type { Helpers } from './src/utils/Helpers.ts';
import type { Storage } from './src/utils/Storage.ts';
import type { TextManager } from './src/utils/TextManager.ts';
import type { Modal } from './src/utils/Modal.ts';
import type { PartySetupModal } from './src/utils/PartySetupModal.ts';
import type { AttributeRoller } from './src/utils/AttributeRoller.ts';
import type { Viewport3D } from './src/rendering/Viewport3D.ts';
import type { MiniMapRenderer } from './src/rendering/MiniMapRenderer.ts';
import type { MonsterPortraitRenderer } from './src/rendering/MonsterPortraitRenderer.ts';
import type { Renderer } from './src/rendering/Renderer.ts';
import type { CharacterUI } from './src/rendering/CharacterUI.ts';
import type { UI } from './src/rendering/UI.ts';
import type { Character } from './src/game/Character.ts';
import type { CharacterCreator } from './src/game/CharacterCreator.ts';
import type { CharacterRoster } from './src/game/CharacterRoster.ts';
import type { Race } from './src/game/Race.ts';
import type { CharacterClass } from './src/game/CharacterClass.ts';
import type { Party } from './src/game/Party.ts';
import type { Combat } from './src/game/Combat.ts';
import type { CombatInterface } from './src/game/CombatInterface.ts';
import type { Dungeon } from './src/game/Dungeon.ts';
import type { Equipment } from './src/game/Equipment.ts';
import type { Spells } from './src/game/Spells.ts';
import type { SpellMemorization } from './src/game/SpellMemorization.ts';
import type { Monster } from './src/game/Monster.ts';
import type { Formation } from './src/game/Formation.ts';
import type { InventorySystem } from './src/game/InventorySystem.ts';
import type { TeamAssignmentService } from './src/game/TeamAssignmentService.ts';
import type { DeathSystem } from './src/game/DeathSystem.ts';
import type { RestSystem } from './src/game/RestSystem.ts';
import type { AdvancedCharacterSheet } from './src/game/AdvancedCharacterSheet.ts';
import type { TERMINOLOGY as TerminologyType, TerminologyUtils as TerminologyUtilsType } from './src/data/terminology.ts';

declare global {
    interface Window {
        // Core
        engine: Engine;
        eventSystem: EventSystem;
        EventSystem: typeof EventSystem;
        GameState: typeof GameState;
        Engine: typeof Engine;

        // Data
        TERMINOLOGY: typeof TerminologyType;
        TerminologyUtils: typeof TerminologyUtilsType;
        weaponsMigration: any;
        weaponsMigrationV110: any;
        armorMigration: any;
        armorMigrationV110: any;
        shieldsMigration: any;
        accessoriesMigration: any;
        spellsMigration: any;
        spellsMigrationV110: any;
        conditionsMigration: any;
        effectsMigration: any;
        monstersMigration: any;

        // Utils
        Random: typeof Random;
        Helpers: typeof Helpers;
        Storage: typeof Storage;
        TextManager: typeof TextManager;
        Modal: typeof Modal;
        PartySetupModal: typeof PartySetupModal;
        AttributeRoller: typeof AttributeRoller;

        // Audio
        AudioManager: typeof AudioManager;

        // Rendering
        Viewport3D: typeof Viewport3D;
        MiniMapRenderer: typeof MiniMapRenderer;
        MonsterPortraitRenderer: typeof MonsterPortraitRenderer;
        Renderer: typeof Renderer;
        CharacterUI: typeof CharacterUI;
        UI: typeof UI;

        // Game
        Character: typeof Character;
        CharacterCreator: typeof CharacterCreator;
        CharacterRoster: typeof CharacterRoster;
        Race: typeof Race;
        Class: typeof CharacterClass;
        CharacterClass: typeof CharacterClass;
        Party: typeof Party;
        Combat: typeof Combat;
        CombatInterface: typeof CombatInterface;
        Dungeon: typeof Dungeon;
        Equipment: typeof Equipment;
        Spells: typeof Spells;
        SpellMemorization: typeof SpellMemorization;
        Monster: typeof Monster;
        Formation: typeof Formation;
        InventorySystem: typeof InventorySystem;
        TeamAssignmentService: typeof TeamAssignmentService;
        DeathSystem: typeof DeathSystem;
        RestSystem: typeof RestSystem;
        AdvancedCharacterSheet: typeof AdvancedCharacterSheet;
    }
}

export { };
