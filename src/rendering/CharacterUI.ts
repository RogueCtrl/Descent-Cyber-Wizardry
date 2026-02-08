import { CharacterCreator } from '../game/CharacterCreator.ts';
import { TextManager } from '../utils/TextManager.ts';
import { Race } from '../game/Race.ts';
import { Helpers } from '../utils/Helpers.ts';
import { AttributeRoller } from '../utils/AttributeRoller.ts';
import { Class } from '../game/CharacterClass.ts';
import { Character } from '../game/Character.ts';

/**
 * Character UI
 * Handles character creation and management interfaces
 */
export class CharacterUI {
  eventSystem: any;
  engine: any;
  currentModal: HTMLElement | null;
  currentStep: string;
  characterData: Record<string, any>;
  characterCreator: CharacterCreator;
  steps: string[];
  stepIndex: number;

  constructor(eventSystem: any, engine: any = null) {
    this.eventSystem = eventSystem;
    this.engine = engine;
    this.currentModal = null;
    this.currentStep = 'race';
    this.characterData = {};
    this.characterCreator = new CharacterCreator();

    this.steps = ['race', 'attributes', 'class', 'details', 'confirm'];
    this.stepIndex = 0;
  }

  /**
   * Show character creation modal
   */
  showCharacterCreation() {
    this.hideCharacterCreation(); // Remove any existing modal

    this.currentStep = 'race';
    this.stepIndex = 0;
    this.characterCreator.startCreation();

    this.currentModal = this.createModal();
    document.body.appendChild(this.currentModal);

    this.renderCurrentStep();
  }

  /**
   * Create the main modal structure
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal character-creation-modal';
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 data-text-key="create_character">Initialize Agent</h2>
                    <div class="step-indicator">
                        <div class="step-progress">
                            <div class="progress-bar" style="width: 0%"></div>
                        </div>
                        <div class="step-text">Step 1 of 5: Platform Type Selection</div>
                    </div>
                </div>
                <div class="modal-body">
                    <!-- Step content will be populated here -->
                </div>
                <div class="modal-footer">
                    <button id="prev-step" class="btn-secondary" disabled>Previous</button>
                    <button id="cancel-creation" class="btn-cancel">Cancel</button>
                    <button id="next-step" class="btn-primary" disabled>Next</button>
                </div>
            </div>
        `;

    // Add event listeners
    modal.querySelector('#prev-step')!.addEventListener('click', () => {
      if (this.engine?.audioManager) {
        this.engine.audioManager.playSoundEffect('buttonClick');
      }
      this.previousStep();
    });
    modal.querySelector('#next-step')!.addEventListener('click', () => {
      if (this.engine?.audioManager) {
        this.engine.audioManager.playSoundEffect('buttonClick');
      }
      this.nextStep();
    });
    modal.querySelector('#cancel-creation')!.addEventListener('click', () => {
      if (this.engine?.audioManager) {
        this.engine.audioManager.playSoundEffect('buttonClick');
      }
      this.cancelCreation();
    });

    // Apply TextManager to modal elements
    this.applyTextManagerToModal(modal);

    return modal;
  }

  /**
   * Render the current step
   */
  renderCurrentStep() {
    if (!this.currentModal) return;

    const modalBody = this.currentModal.querySelector('.modal-body') as HTMLElement;
    const stepText = this.currentModal.querySelector('.step-text') as HTMLElement;
    const progressBar = this.currentModal.querySelector('.progress-bar') as HTMLElement;
    const prevBtn = this.currentModal.querySelector('#prev-step') as HTMLButtonElement;
    const nextBtn = this.currentModal.querySelector('#next-step') as HTMLButtonElement;

    if (!modalBody || !stepText || !progressBar || !prevBtn || !nextBtn) return;

    // Update progress
    const progress = ((this.stepIndex + 1) / this.steps.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Update step indicator based on current mode
    const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
    const stepNames = isCyberMode
      ? [
          'Platform Type Selection',
          'Core Parameter Generation',
          'Specialization Selection',
          'Agent Details',
          'Confirmation',
        ]
      : [
          'Race Selection',
          'Attribute Generation',
          'Class Selection',
          'Character Details',
          'Confirmation',
        ];
    stepText.textContent = `Step ${this.stepIndex + 1} of ${this.steps.length}: ${stepNames[this.stepIndex]}`;

    // Update button states
    prevBtn.disabled = this.stepIndex === 0;
    nextBtn.disabled = !this.canProceedToNextStep();

    // Clear and render step content
    modalBody.innerHTML = '';

    switch (this.currentStep) {
      case 'race':
        this.renderRaceSelection(modalBody);
        break;
      case 'attributes':
        this.renderAttributeGeneration(modalBody);
        break;
      case 'class':
        this.renderClassSelection(modalBody);
        break;
      case 'details':
        this.renderCharacterDetails(modalBody);
        break;
      case 'confirm':
        this.renderConfirmation(modalBody);
        break;
    }
  }

  /**
   * Render race selection step
   */
  renderRaceSelection(container: HTMLElement) {
    const races = Race.getAllRaces();

    container.innerHTML = `
            <div class="step-content">
                <h3 data-text-key="choose_race">Choose Your Race</h3>
                <p data-text-key="race_selection_description">Each race has unique characteristics that will affect your character's abilities.</p>
                
                <div class="race-grid">
                    ${races
                      .map((raceName) => {
                        const raceData = Race.getRaceData(raceName);
                        const raceKey = `race_${raceName.toLowerCase()}`;
                        const raceDescKey = `race_${raceName.toLowerCase()}_desc`;
                        return `
                            <div class="race-option" data-race="${raceName}">
                                <h4 data-text-key="${raceKey}">${raceData.name}</h4>
                                <p class="race-description" data-text-key="${raceDescKey}">${raceData.description}</p>
                                <div class="race-modifiers">
                                    ${this.renderRaceModifiers(raceData.modifiers)}
                                </div>
                                <div class="race-abilities">
                                    ${
                                      raceData.abilities.length > 0
                                        ? '<strong>Special Abilities:</strong><br>' +
                                          raceData.abilities.join(', ')
                                        : ''
                                    }
                                </div>
                                ${
                                  raceData.restrictions.length > 0
                                    ? `<div class="race-restrictions">
                                        <strong>Cannot become:</strong> ${raceData.restrictions.join(', ')}
                                    </div>`
                                    : ''
                                }
                            </div>
                        `;
                      })
                      .join('')}
                </div>
            </div>
        `;

    // Add click handlers for race selection
    container.querySelectorAll('.race-option').forEach((option) => {
      option.addEventListener('click', () => {
        // Remove previous selection
        container
          .querySelectorAll('.race-option')
          .forEach((opt) => opt.classList.remove('selected'));

        // Select this race
        option.classList.add('selected');
        this.characterData.selectedRace = (option as HTMLElement).dataset.race;

        // Update next button
        this.updateNextButton();
      });
    });

    // Apply TextManager to the new content
    this.applyTextManagerToModal(container);
  }

  /**
   * Render race stat modifiers
   */
  renderRaceModifiers(modifiers: any) {
    if (!modifiers || Object.keys(modifiers).length === 0) {
      return '<span class="no-modifiers">No stat modifiers</span>';
    }

    return Object.entries(modifiers)
      .map(([stat, modifier]) => {
        const sign = (modifier as number) >= 0 ? '+' : '';
        const className = (modifier as number) >= 0 ? 'positive' : 'negative';
        return `<span class="modifier ${className}">${Helpers.capitalize(stat)}: ${sign}${modifier}</span>`;
      })
      .join(' ');
  }

  /**
   * Render attribute generation step
   */
  renderAttributeGeneration(container: HTMLElement) {
    if (!this.characterData.attributes) {
      this.characterData.attributes = AttributeRoller.rollAllAttributes();
      this.applyRacialModifiers();
    }

    container.innerHTML = `
            <div class="step-content">
                <h3 data-text-key="your_attributes">Your Attributes</h3>
                <p data-text-key="attributes_description">These are your character's base attributes, modified by your race.</p>
                
                <div class="attribute-display">
                    ${this.renderAttributeGrid()}
                </div>
                
                <div class="attribute-total">
                    <strong><span data-text-key="total_label">Total</span>: ${this.getAttributeTotal()}</strong>
                </div>
                
                <div class="reroll-section">
                    <button id="reroll-attributes" class="btn-secondary" data-text-key="reroll_attributes">Reroll Attributes</button>
                    <p class="reroll-info" data-text-key="reroll_description">You can reroll if you're not satisfied with these attributes.</p>
                </div>
            </div>
        `;

    // Add reroll handler
    container.querySelector('#reroll-attributes')!.addEventListener('click', () => {
      if (this.engine?.audioManager) {
        this.engine.audioManager.playSoundEffect('buttonClick');
      }
      this.characterData.attributes = AttributeRoller.rollAllAttributes();
      this.applyRacialModifiers();
      this.renderCurrentStep(); // Re-render to show new attributes
    });

    // Update button state after initial attributes are set
    this.updateNextButton();

    // Apply TextManager to the new content
    this.applyTextManagerToModal(container);
  }

  /**
   * Apply racial modifiers to attributes
   */
  applyRacialModifiers() {
    if (!this.characterData.selectedRace || !this.characterData.attributes) return;

    const raceData = Race.getRaceData(this.characterData.selectedRace);
    if (raceData && raceData.modifiers) {
      Object.entries(raceData.modifiers).forEach(([stat, modifier]) => {
        this.characterData.attributes[stat] += modifier;
        // Ensure attributes don't go below 3 or above 18
        this.characterData.attributes[stat] = Helpers.clamp(
          this.characterData.attributes[stat],
          3,
          18
        );
      });
    }
  }

  /**
   * Render attribute grid
   */
  renderAttributeGrid() {
    const attributes = ['strength', 'intelligence', 'piety', 'vitality', 'agility', 'luck'];

    return `
            <div class="attributes-grid">
                ${attributes
                  .map(
                    (attr) => `
                    <div class="attribute-item">
                        <span class="attribute-name" data-text-key="attr_${attr}">${Helpers.capitalize(attr)}</span>
                        <span class="attribute-value">${this.characterData.attributes[attr]}</span>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `;
  }

  /**
   * Get total of all attributes
   */
  getAttributeTotal() {
    if (!this.characterData.attributes) return 0;
    return (Object.values(this.characterData.attributes) as number[]).reduce(
      (sum: number, value: number) => sum + value,
      0
    );
  }

  /**
   * Render class selection step
   */
  renderClassSelection(container: HTMLElement) {
    const availableClasses = this.getAvailableClasses();
    const allClasses = Class.getAllClasses();

    container.innerHTML = `
            <div class="step-content">
                <h3 data-text-key="choose_class">Choose Your Class</h3>
                <p data-text-key="class_selection_description">Your attributes determine which classes are available to you.</p>
                
                <div class="class-grid">
                    ${allClasses
                      .map((className) => {
                        const classData = Class.getClassData(className);
                        const isAvailable = availableClasses.includes(className);
                        const meetsRequirements = Class.checkRequirements(
                          className,
                          this.characterData.attributes
                        );

                        const classKey = `class_${className.toLowerCase()}`;
                        const classDescKey = `class_${className.toLowerCase()}_desc`;
                        return `
                            <div class="class-option ${isAvailable ? '' : 'disabled'}" data-class="${className}">
                                <h4 data-text-key="${classKey}">${classData.name}</h4>
                                <p class="class-description" data-text-key="${classDescKey}">${classData.description}</p>
                                <div class="class-requirements">
                                    <strong data-text-key="class_requirements">Requirements:</strong><br>
                                    ${this.renderClassRequirements(classData.requirements, meetsRequirements)}
                                </div>
                                <div class="class-stats">
                                    <strong data-text-key="class_hit_die">Hit Die:</strong> d${classData.hitDie}<br>
                                    <strong data-text-key="class_spells">Spells:</strong> ${classData.spells || 'None'}
                                </div>
                                ${!isAvailable ? `<div class="unavailable-reason" data-text-key="requirements_not_met">Requirements not met</div>` : ''}
                            </div>
                        `;
                      })
                      .join('')}
                </div>
            </div>
        `;

    // Add click handlers for class selection
    container.querySelectorAll('.class-option:not(.disabled)').forEach((option) => {
      option.addEventListener('click', () => {
        // Remove previous selection
        container
          .querySelectorAll('.class-option')
          .forEach((opt) => opt.classList.remove('selected'));

        // Select this class
        option.classList.add('selected');
        this.characterData.selectedClass = (option as HTMLElement).dataset.class;

        // Update next button
        this.updateNextButton();
      });
    });

    // Apply TextManager to the new content
    this.applyTextManagerToModal(container);
  }

  /**
   * Get available classes for current character
   */
  getAvailableClasses() {
    const allClasses = Class.getAllClasses();
    const raceData = Race.getRaceData(this.characterData.selectedRace);

    return allClasses.filter((className) => {
      // Check race restrictions
      if (raceData && raceData.restrictions.includes(className)) {
        return false;
      }

      // Check attribute requirements
      return Class.checkRequirements(className, this.characterData.attributes);
    });
  }

  /**
   * Render class requirements
   */
  renderClassRequirements(requirements: any, meetsRequirements: any) {
    return (Object.entries(requirements) as [string, any][])
      .map(([stat, minValue]) => {
        const currentValue = this.characterData.attributes[stat];
        const meets = currentValue >= minValue;
        const className = meets ? 'requirement-met' : 'requirement-failed';
        const statKey = `attr_${stat}`;

        return `<span class="${className}"><span data-text-key="${statKey}">${Helpers.capitalize(stat)}</span>: ${minValue} (You have: ${currentValue})</span>`;
      })
      .join('<br>');
  }

  /**
   * Render character details step
   */
  renderCharacterDetails(container: HTMLElement) {
    container.innerHTML = `
            <div class="step-content">
                <h3 data-text-key="character_details">Character Details</h3>
                <p data-text-key="character_details_description">Enter your character's name and review their information.</p>
                
                <div class="character-form">
                    <div class="form-group">
                        <label for="character-name" data-text-key="character_name">Character Name:</label>
                        <input type="text" id="character-name" maxlength="15" 
                               value="${this.characterData.name || ''}" 
                               placeholder="Enter character name">
                        <small data-text-key="character_limit">Maximum 15 characters</small>
                    </div>
                    
                    <div class="character-summary">
                        <h4 data-text-key="character_summary">Character Summary</h4>
                        <div class="summary-grid">
                            <div><strong data-text-key="summary_race">Race:</strong> <span data-text-key="race_${this.characterData.selectedRace.toLowerCase()}">${this.characterData.selectedRace}</span></div>
                            <div><strong data-text-key="summary_class">Class:</strong> <span data-text-key="class_${this.characterData.selectedClass.toLowerCase()}">${this.characterData.selectedClass}</span></div>
                            <div><strong data-text-key="summary_attributes">Attributes:</strong></div>
                            <div class="attributes-summary">
                                ${this.renderAttributeGrid()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Add input handler
    const nameInput = container.querySelector('#character-name') as HTMLInputElement;
    nameInput.addEventListener('input', (e: Event) => {
      this.characterData.name = (e.target as HTMLInputElement).value.trim();
      this.updateNextButton();
    });

    // Set placeholder based on current mode
    const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
    nameInput.placeholder = isCyberMode ? 'Enter agent name' : 'Enter character name';

    // Focus the input
    nameInput.focus();

    // Apply TextManager to the new content
    this.applyTextManagerToModal(container);
  }

  /**
   * Render confirmation step
   */
  renderConfirmation(container: HTMLElement) {
    const raceData = Race.getRaceData(this.characterData.selectedRace);
    const classData = Class.getClassData(this.characterData.selectedClass);

    container.innerHTML = `
            <div class="step-content">
                <h3 data-text-key="confirm_agent_initialization">Confirm Agent Initialization</h3>
                <p data-text-key="confirm_description">Review your agent before adding them to your strike team.</p>
                
                <div class="character-confirmation">
                    <div class="character-portrait">
                        <div class="portrait-placeholder">
                            ${this.getSpecializationIcon(this.characterData.selectedClass)}
                        </div>
                    </div>
                    
                    <div class="character-details">
                        <h4>${this.characterData.name}</h4>
                        <p><strong data-text-key="summary_race">Platform:</strong> <span data-text-key="race_${this.characterData.selectedRace.toLowerCase()}">${raceData.name}</span> - <span data-text-key="race_${this.characterData.selectedRace.toLowerCase()}_desc">${raceData.description}</span></p>
                        <p><strong data-text-key="summary_class">Specialization:</strong> <span data-text-key="class_${this.characterData.selectedClass.toLowerCase()}">${classData.name}</span> - <span data-text-key="class_${this.characterData.selectedClass.toLowerCase()}_desc">${classData.description}</span></p>
                        
                        <div class="final-attributes">
                            <h5 data-text-key="attributes">Core Parameters</h5>
                            ${this.renderAttributeGrid()}
                        </div>
                        
                        <div class="calculated-stats">
                            <h5 data-text-key="system_stats">System Stats</h5>
                            <p><strong data-text-key="system_integrity">System Integrity:</strong> ${this.calculateInitialHP()}</p>
                            <p><strong data-text-key="defense_rating">Defense Rating:</strong> ${this.calculateInitialAC()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Update button text for final step based on current mode
    const nextBtn = this.currentModal!.querySelector('#next-step') as HTMLButtonElement;
    const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
    nextBtn.textContent = isCyberMode ? 'Initialize Agent' : 'Create Character';
    nextBtn.setAttribute('data-text-key', 'initialize_agent');

    // Apply TextManager to new elements
    this.applyTextManagerToModal(container);
  }

  /**
   * Calculate initial hit points
   */
  calculateInitialHP() {
    const classData = Class.getClassData(this.characterData.selectedClass);
    const vitModifier = Math.floor((this.characterData.attributes.vitality - 10) / 2);
    return Math.max(1, classData.hitDie + vitModifier);
  }

  /**
   * Calculate initial armor class
   */
  calculateInitialAC() {
    const agiModifier = Math.floor((this.characterData.attributes.agility - 10) / 2);
    return Math.max(-10, 10 - agiModifier);
  }

  /**
   * Get specialization icon for the selected class
   */
  getSpecializationIcon(className: string) {
    const icons = {
      Fighter: '⚔️',
      Mage: '🔮',
      Priest: '✨',
      Thief: '🗡️',
      Bishop: '📜',
      Samurai: '🏯',
      Lord: '👑',
      Ninja: '🥷',
    };

    return (icons as Record<string, string>)[className] || '⚡';
  }

  /**
   * Check if we can proceed to next step
   */
  canProceedToNextStep() {
    switch (this.currentStep) {
      case 'race':
        return !!this.characterData.selectedRace;
      case 'attributes':
        return !!this.characterData.attributes;
      case 'class':
        return !!this.characterData.selectedClass;
      case 'details':
        return !!this.characterData.name && this.characterData.name.length > 0;
      case 'confirm':
        return true;
      default:
        return false;
    }
  }

  /**
   * Update next button state
   */
  updateNextButton() {
    if (!this.currentModal) return;

    const nextBtn = this.currentModal.querySelector('#next-step') as HTMLButtonElement;
    nextBtn.disabled = !this.canProceedToNextStep();
  }

  /**
   * Go to next step
   */
  nextStep() {
    if (!this.canProceedToNextStep()) return;

    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex++;
      this.currentStep = this.steps[this.stepIndex];
      this.renderCurrentStep();
    } else {
      // Final step - create character
      this.createCharacter();
    }
  }

  /**
   * Go to previous step
   */
  previousStep() {
    if (this.stepIndex > 0) {
      this.stepIndex--;
      this.currentStep = this.steps[this.stepIndex];
      this.renderCurrentStep();
    }
  }

  /**
   * Create the character
   */
  createCharacter() {
    try {
      const character = new Character(
        this.characterData.name,
        this.characterData.selectedRace,
        this.characterData.selectedClass
      );

      // Set attributes
      character.attributes = { ...this.characterData.attributes };

      // Calculate initial stats
      character.maxHP = this.calculateInitialHP();
      character.currentHP = character.maxHP;

      // Emit character created event
      this.eventSystem.emit('character-created', character);

      // Close modal
      this.hideCharacterCreation();

      // Reset for next character
      this.characterData = {};
    } catch (error: any) {
      console.error('Error creating character:', error);
      // Use the game's messaging system instead of browser alert
      this.eventSystem.emit('show-message', {
        text: 'Error creating character: ' + error.message,
        type: 'error',
      });
    }
  }

  /**
   * Cancel character creation
   */
  cancelCreation() {
    this.hideCharacterCreation();
    this.characterData = {};
    this.eventSystem.emit('character-creation-cancelled');
  }

  /**
   * Hide character creation modal
   */
  hideCharacterCreation() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
    }
  }

  /**
   * Update character display
   */
  updateCharacterDisplay(character: any) {
    // This would update character sheets, party displays, etc.
    console.log('Character display update:', character);
  }

  /**
   * Apply TextManager to modal elements with data-text-key attributes
   */
  applyTextManagerToModal(container: HTMLElement | Document) {
    if (typeof TextManager === 'undefined') return;

    const textElements = container.querySelectorAll('[data-text-key]');
    textElements.forEach((element) => {
      const textKey = element.getAttribute('data-text-key');
      if (textKey) {
        TextManager.applyToElement(element as HTMLElement, textKey);
      }
    });
  }
}
