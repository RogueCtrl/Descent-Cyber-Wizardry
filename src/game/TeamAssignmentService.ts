import { Storage } from '../utils/Storage.ts';

/** Extended character with team assignment properties */
interface TeamCharacter {
  id: string;
  name: string;
  isAlive: boolean;
  status: string;
  partyId?: string;
  originalTeamAssignment?: string | null;
  teamAssignmentDate?: string | null;
  teamLoyalty?: number;
  availability?: string;
  isPhasedOut?: boolean;
  phaseOutReason?: string | null;
  phaseOutDate?: string | null;
  canPhaseBackIn?: boolean;
  [key: string]: any;
}

/** Party/team data from storage */
interface TeamParty {
  id: string;
  name: string;
  memberIds?: string[];
  memberCount?: number;
  aliveCount?: number;
  [key: string]: any;
}

/** Orphaned character info */
interface OrphanedCharacterInfo {
  id: string;
  name: string;
  status: string;
}

/** Validation report */
interface ValidationReport {
  totalCharacters: number;
  orphanedCharacters: OrphanedCharacterInfo[];
  memorialCharacters: string[];
  assignedCharacters: string[];
  warnings: string[];
  errors: string[];
}

/** Fix report for orphaned characters */
interface FixReport {
  orphanedCount: number;
  fixedCharacters: string[];
  createdTeams: string[];
  errors: string[];
}

/** Migration report */
interface MigrationReport {
  totalCharacters: number;
  migratedCharacters: number;
  skippedCharacters: number;
  errors: string[];
  details: string[];
}

/** Team membership statistics */
interface TeamMembershipStats {
  totalCharacters: number;
  totalTeams: number;
  charactersWithTeams: number;
  charactersWithoutTeams: number;
  memorialCharacters: number;
  phasedOutCharacters: number;
  teamSizes: Record<string, number>;
  averageTeamSize: number;
}

/**
 * TeamAssignmentService
 *
 * Service for managing automatic team assignment for the "Agents Always Part of Teams"
 * game world mechanic. Ensures all active characters are always members of a Strike Team.
 */

export class TeamAssignmentService {
  /**
   * Automatically assign a new character to a Strike Team
   * Creates a new team if no active party exists
   * @param {Character} character - Character to assign to team
   * @returns {Promise<Object>} The assigned party/team
   */
  static async assignCharacterToTeam(character: TeamCharacter): Promise<TeamParty> {
    try {
      console.log(`Assigning character ${character.name} to Strike Team...`);

      // Get current active party or create one
      let activeParty = (await Storage.loadActiveParty()) as TeamParty | null;

      if (!activeParty) {
        // Create new default team for character
        console.log('No active party found, creating new Strike Team');
        activeParty = (await Storage.createNewActiveParty(`${character.name}'s Strike Team`)) as TeamParty;
      }

      // Assign character to team
      character.partyId = activeParty.id;
      character.originalTeamAssignment = activeParty.id;
      character.teamAssignmentDate = new Date().toISOString();
      character.availability = 'in_party';

      // Initialize team loyalty if not set
      if (character.teamLoyalty === undefined) {
        character.teamLoyalty = 100;
      }

      // Add to party members list if needed
      if (!activeParty.memberIds) {
        activeParty.memberIds = [];
      }

      // Only add if not already in the party
      if (!activeParty.memberIds.includes(character.id)) {
        activeParty.memberIds.push(character.id);

        // Update party member count
        activeParty.memberCount = activeParty.memberIds.length;
        activeParty.aliveCount = activeParty.memberIds.length; // Assume all new members are alive
      }

      // Save both character and party
      await Storage.saveCharacter(character);
      await Storage.saveParty(activeParty);

      console.log(
        `Character ${character.name} assigned to Strike Team: ${activeParty.name}`
      );
      return activeParty;
    } catch (error: any) {
      console.error(`Failed to assign character ${character.name} to team:`, error);
      throw error;
    }
  }

  /**
   * Create a new Strike Team for specific characters
   * @param {Array<Character>} characters - Characters to assign to new team
   * @param {string} teamName - Name for the new Strike Team
   * @returns {Promise<Object>} The created party/team
   */
  static async createTeamForCharacters(characters: TeamCharacter[], teamName: string): Promise<TeamParty> {
    try {
      console.log(`Creating new Strike Team: ${teamName} for ${characters.length} characters`);

      const newParty = (await Storage.createNewActiveParty(teamName)) as TeamParty;

      // Assign all characters to the new team
      for (const character of characters) {
        character.partyId = newParty.id;
        character.originalTeamAssignment = newParty.id;
        character.teamAssignmentDate = new Date().toISOString();
        character.availability = 'in_party';

        // Initialize team loyalty if not set
        if (character.teamLoyalty === undefined) {
          character.teamLoyalty = 100;
        }

        await Storage.saveCharacter(character);
      }

      // Update party with member IDs
      newParty.memberIds = characters.map((c: TeamCharacter) => c.id);
      newParty.memberCount = characters.length;
      newParty.aliveCount = characters.filter((c: TeamCharacter) => c.isAlive).length;

      await Storage.saveParty(newParty);

      console.log(`Strike Team ${teamName} created with ${characters.length} members`);
      return newParty;
    } catch (error: any) {
      console.error(`Failed to create team for characters:`, error);
      throw error;
    }
  }

  /**
   * Validate that all active characters have team assignments
   * Used for migration and integrity checks
   * @returns {Promise<Object>} Validation report
   */
  static async validateAllCharacterTeamMembership(): Promise<ValidationReport> {
    try {
      console.log('Validating team membership for all characters...');

      const allCharacters = (await Storage.loadAllCharacters()) as TeamCharacter[];
      const report: ValidationReport = {
        totalCharacters: allCharacters.length,
        orphanedCharacters: [],
        memorialCharacters: [],
        assignedCharacters: [],
        warnings: [],
        errors: [],
      };

      for (const character of allCharacters) {
        try {
          // Check if character is permanently lost (memorial)
          if (Storage.isCharacterPermanentlyLost(character)) {
            report.memorialCharacters.push(character.id);
            continue;
          }

          // Active character should have team assignment
          if (!character.partyId) {
            report.orphanedCharacters.push({
              id: character.id,
              name: character.name,
              status: character.status,
            });
            report.warnings.push(`Orphaned character found: ${character.name}`);
          } else {
            report.assignedCharacters.push(character.id);
          }
        } catch (validationError: any) {
          report.errors.push(`Validation error for ${character.name}: ${validationError.message}`);
        }
      }

      console.log('Team membership validation complete:', report);
      return report;
    } catch (error: any) {
      console.error('Failed to validate character team membership:', error);
      throw error;
    }
  }

  /**
   * Auto-fix orphaned characters by assigning them to teams
   * @param {boolean} createNewTeams - Whether to create new teams for orphaned characters
   * @returns {Promise<Object>} Fix report
   */
  static async fixOrphanedCharacters(createNewTeams = true): Promise<FixReport> {
    try {
      console.log('Fixing orphaned characters...');

      const validation = await this.validateAllCharacterTeamMembership();
      const fixReport: FixReport = {
        orphanedCount: validation.orphanedCharacters.length,
        fixedCharacters: [],
        createdTeams: [],
        errors: [],
      };

      for (const orphanedInfo of validation.orphanedCharacters) {
        try {
          // Load the full character object
          const character = await Storage.loadCharacter(orphanedInfo.id);

          if (character) {
            const teamChar = character as TeamCharacter;
            if (createNewTeams) {
              // Create individual team for each orphaned character
              const teamName = `${teamChar.name}'s Strike Team`;
              const newTeam = await this.createTeamForCharacters([teamChar], teamName);

              fixReport.fixedCharacters.push(teamChar.id);
              fixReport.createdTeams.push(newTeam.id);
            } else {
              // Assign to existing active party or create one
              await this.assignCharacterToTeam(teamChar);
              fixReport.fixedCharacters.push(teamChar.id);
            }
          }
        } catch (fixError: any) {
          fixReport.errors.push(`Failed to fix ${orphanedInfo.name}: ${fixError.message}`);
        }
      }

      console.log('Orphaned character fix complete:', fixReport);
      return fixReport;
    } catch (error: any) {
      console.error('Failed to fix orphaned characters:', error);
      throw error;
    }
  }

  /**
   * Migrate existing characters to "Agents Always Part of Teams" system
   * Assigns team membership to orphaned characters and initializes new properties
   * @returns {Promise<Object>} Migration report
   */
  static async migrateCharactersToTeamSystem(): Promise<MigrationReport> {
    try {
      console.log('Starting character migration to Team System...');

      const migrationReport: MigrationReport = {
        totalCharacters: 0,
        migratedCharacters: 0,
        skippedCharacters: 0,
        errors: [],
        details: [],
      };

      const allCharacters = (await Storage.loadAllCharacters()) as TeamCharacter[];
      migrationReport.totalCharacters = allCharacters.length;

      for (const character of allCharacters) {
        try {
          let needsMigration = false;
          const changes: string[] = [];

          // Skip memorial characters
          if (Storage.isCharacterPermanentlyLost(character)) {
            migrationReport.skippedCharacters++;
            migrationReport.details.push(`Skipped memorial character: ${character.name}`);
            continue;
          }

          // Initialize new properties if missing
          if (character.isPhasedOut === undefined) {
            character.isPhasedOut = false;
            needsMigration = true;
            changes.push('added isPhasedOut');
          }

          if (character.phaseOutReason === undefined) {
            character.phaseOutReason = null;
            needsMigration = true;
            changes.push('added phaseOutReason');
          }

          if (character.phaseOutDate === undefined) {
            character.phaseOutDate = null;
            needsMigration = true;
            changes.push('added phaseOutDate');
          }

          if (character.canPhaseBackIn === undefined) {
            character.canPhaseBackIn = true;
            needsMigration = true;
            changes.push('added canPhaseBackIn');
          }

          if (character.originalTeamAssignment === undefined) {
            character.originalTeamAssignment = null;
            needsMigration = true;
            changes.push('added originalTeamAssignment');
          }

          if (character.teamAssignmentDate === undefined) {
            character.teamAssignmentDate = null;
            needsMigration = true;
            changes.push('added teamAssignmentDate');
          }

          if (character.teamLoyalty === undefined) {
            character.teamLoyalty = 100;
            needsMigration = true;
            changes.push('added teamLoyalty');
          }

          // Assign to team if no party assignment
          if (!character.partyId) {
            const assignedTeam = await this.assignCharacterToTeam(character);
            needsMigration = true;
            changes.push(`assigned to team: ${assignedTeam.name}`);
          } else {
            // Update team assignment tracking for existing team members
            if (!character.originalTeamAssignment) {
              character.originalTeamAssignment = character.partyId;
              needsMigration = true;
              changes.push('set originalTeamAssignment');
            }

            if (!character.teamAssignmentDate) {
              character.teamAssignmentDate = new Date().toISOString();
              needsMigration = true;
              changes.push('set teamAssignmentDate');
            }
          }

          // Save character if changes were made
          if (needsMigration) {
            await Storage.saveCharacter(character);
            migrationReport.migratedCharacters++;
            migrationReport.details.push(`Migrated ${character.name}: ${changes.join(', ')}`);
          } else {
            migrationReport.skippedCharacters++;
            migrationReport.details.push(`No migration needed: ${character.name}`);
          }
        } catch (characterError: any) {
          migrationReport.errors.push(
            `Failed to migrate ${character.name}: ${characterError.message}`
          );
        }
      }

      console.log('Character migration complete:', migrationReport);
      return migrationReport;
    } catch (error: any) {
      console.error('Failed to migrate characters to team system:', error);
      throw error;
    }
  }

  /**
   * Get team membership statistics
   * @returns {Promise<Object>} Team membership statistics
   */
  static async getTeamMembershipStats(): Promise<TeamMembershipStats> {
    try {
      const allCharacters = (await Storage.loadAllCharacters()) as TeamCharacter[];
      const allParties = (await Storage.loadAllParties()) as TeamParty[];

      const stats: TeamMembershipStats = {
        totalCharacters: allCharacters.length,
        totalTeams: allParties.length,
        charactersWithTeams: 0,
        charactersWithoutTeams: 0,
        memorialCharacters: 0,
        phasedOutCharacters: 0,
        teamSizes: {},
        averageTeamSize: 0,
      };

      // Analyze characters
      for (const character of allCharacters) {
        if (Storage.isCharacterPermanentlyLost(character)) {
          stats.memorialCharacters++;
        } else if (character.partyId) {
          stats.charactersWithTeams++;
          if (character.isPhasedOut) {
            stats.phasedOutCharacters++;
          }
        } else {
          stats.charactersWithoutTeams++;
        }
      }

      // Analyze team sizes
      for (const party of allParties) {
        const memberCount = party.memberIds ? party.memberIds.length : 0;
        stats.teamSizes[party.id] = memberCount;
      }

      // Calculate average team size
      const teamSizes = Object.values(stats.teamSizes);
      if (teamSizes.length > 0) {
        stats.averageTeamSize =
          teamSizes.reduce((a, b) => a + b, 0) / teamSizes.length;
      }

      return stats;
    } catch (error: any) {
      console.error('Failed to get team membership stats:', error);
      throw error;
    }
  }
}
