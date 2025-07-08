/**
 * Character UI
 * Handles character creation and management interfaces
 */
class CharacterUI {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
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
                    <h2>Character Creation</h2>
                    <div class="step-indicator">
                        <div class="step-progress">
                            <div class="progress-bar" style="width: 0%"></div>
                        </div>
                        <div class="step-text">Step 1 of 5: Race Selection</div>
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
        modal.querySelector('#prev-step').addEventListener('click', () => this.previousStep());
        modal.querySelector('#next-step').addEventListener('click', () => this.nextStep());
        modal.querySelector('#cancel-creation').addEventListener('click', () => this.cancelCreation());
        
        return modal;
    }
    
    /**
     * Render the current step
     */
    renderCurrentStep() {
        if (!this.currentModal) return;
        
        const modalBody = this.currentModal.querySelector('.modal-body');
        const stepText = this.currentModal.querySelector('.step-text');
        const progressBar = this.currentModal.querySelector('.progress-bar');
        const prevBtn = this.currentModal.querySelector('#prev-step');
        const nextBtn = this.currentModal.querySelector('#next-step');
        
        // Update progress
        const progress = ((this.stepIndex + 1) / this.steps.length) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Update step indicator
        const stepNames = ['Race Selection', 'Attribute Generation', 'Class Selection', 'Character Details', 'Confirmation'];
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
    renderRaceSelection(container) {
        const races = Race.getAllRaces();
        
        container.innerHTML = `
            <div class="step-content">
                <h3>Choose Your Race</h3>
                <p>Each race has unique characteristics that will affect your character's abilities.</p>
                
                <div class="race-grid">
                    ${races.map(raceName => {
                        const raceData = Race.getRaceData(raceName);
                        return `
                            <div class="race-option" data-race="${raceName}">
                                <h4>${raceData.name}</h4>
                                <p class="race-description">${raceData.description}</p>
                                <div class="race-modifiers">
                                    ${this.renderRaceModifiers(raceData.modifiers)}
                                </div>
                                <div class="race-abilities">
                                    ${raceData.abilities.length > 0 ? 
                                        '<strong>Special Abilities:</strong><br>' + raceData.abilities.join(', ') : 
                                        ''}
                                </div>
                                ${raceData.restrictions.length > 0 ? 
                                    `<div class="race-restrictions">
                                        <strong>Cannot become:</strong> ${raceData.restrictions.join(', ')}
                                    </div>` : 
                                    ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Add click handlers for race selection
        container.querySelectorAll('.race-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selection
                container.querySelectorAll('.race-option').forEach(opt => opt.classList.remove('selected'));
                
                // Select this race
                option.classList.add('selected');
                this.characterData.selectedRace = option.dataset.race;
                
                // Update next button
                this.updateNextButton();
            });
        });
    }
    
    /**
     * Render race stat modifiers
     */
    renderRaceModifiers(modifiers) {
        if (!modifiers || Object.keys(modifiers).length === 0) {
            return '<span class="no-modifiers">No stat modifiers</span>';
        }
        
        return Object.entries(modifiers).map(([stat, modifier]) => {
            const sign = modifier >= 0 ? '+' : '';
            const className = modifier >= 0 ? 'positive' : 'negative';
            return `<span class="modifier ${className}">${Helpers.capitalize(stat)}: ${sign}${modifier}</span>`;
        }).join(' ');
    }
    
    /**
     * Render attribute generation step
     */
    renderAttributeGeneration(container) {
        if (!this.characterData.attributes) {
            this.characterData.attributes = AttributeRoller.rollAllAttributes();
            this.applyRacialModifiers();
        }
        
        container.innerHTML = `
            <div class="step-content">
                <h3>Your Attributes</h3>
                <p>These are your character's base attributes, modified by your race.</p>
                
                <div class="attribute-display">
                    ${this.renderAttributeGrid()}
                </div>
                
                <div class="attribute-total">
                    <strong>Total: ${this.getAttributeTotal()}</strong>
                </div>
                
                <div class="reroll-section">
                    <button id="reroll-attributes" class="btn-secondary">Reroll Attributes</button>
                    <p class="reroll-info">You can reroll if you're not satisfied with these attributes.</p>
                </div>
            </div>
        `;
        
        // Add reroll handler
        container.querySelector('#reroll-attributes').addEventListener('click', () => {
            this.characterData.attributes = AttributeRoller.rollAllAttributes();
            this.applyRacialModifiers();
            this.renderCurrentStep(); // Re-render to show new attributes
        });
        
        // Update button state after initial attributes are set
        this.updateNextButton();
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
                this.characterData.attributes[stat] = Helpers.clamp(this.characterData.attributes[stat], 3, 18);
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
                ${attributes.map(attr => `
                    <div class="attribute-item">
                        <span class="attribute-name">${Helpers.capitalize(attr)}</span>
                        <span class="attribute-value">${this.characterData.attributes[attr]}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Get total of all attributes
     */
    getAttributeTotal() {
        if (!this.characterData.attributes) return 0;
        return Object.values(this.characterData.attributes).reduce((sum, value) => sum + value, 0);
    }
    
    /**
     * Render class selection step
     */
    renderClassSelection(container) {
        const availableClasses = this.getAvailableClasses();
        const allClasses = Class.getAllClasses();
        
        container.innerHTML = `
            <div class="step-content">
                <h3>Choose Your Class</h3>
                <p>Your attributes determine which classes are available to you.</p>
                
                <div class="class-grid">
                    ${allClasses.map(className => {
                        const classData = Class.getClassData(className);
                        const isAvailable = availableClasses.includes(className);
                        const meetsRequirements = Class.checkRequirements(className, this.characterData.attributes);
                        
                        return `
                            <div class="class-option ${isAvailable ? '' : 'disabled'}" data-class="${className}">
                                <h4>${classData.name}</h4>
                                <p class="class-description">${classData.description}</p>
                                <div class="class-requirements">
                                    <strong>Requirements:</strong><br>
                                    ${this.renderClassRequirements(classData.requirements, meetsRequirements)}
                                </div>
                                <div class="class-stats">
                                    <strong>Hit Die:</strong> d${classData.hitDie}<br>
                                    <strong>Spells:</strong> ${classData.spells || 'None'}
                                </div>
                                ${!isAvailable ? '<div class="unavailable-reason">Requirements not met</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Add click handlers for class selection
        container.querySelectorAll('.class-option:not(.disabled)').forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selection
                container.querySelectorAll('.class-option').forEach(opt => opt.classList.remove('selected'));
                
                // Select this class
                option.classList.add('selected');
                this.characterData.selectedClass = option.dataset.class;
                
                // Update next button
                this.updateNextButton();
            });
        });
    }
    
    /**
     * Get available classes for current character
     */
    getAvailableClasses() {
        const allClasses = Class.getAllClasses();
        const raceData = Race.getRaceData(this.characterData.selectedRace);
        
        return allClasses.filter(className => {
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
    renderClassRequirements(requirements, meetsRequirements) {
        return Object.entries(requirements).map(([stat, minValue]) => {
            const currentValue = this.characterData.attributes[stat];
            const meets = currentValue >= minValue;
            const className = meets ? 'requirement-met' : 'requirement-failed';
            
            return `<span class="${className}">${Helpers.capitalize(stat)}: ${minValue} (You have: ${currentValue})</span>`;
        }).join('<br>');
    }
    
    /**
     * Render character details step
     */
    renderCharacterDetails(container) {
        container.innerHTML = `
            <div class="step-content">
                <h3>Character Details</h3>
                <p>Enter your character's name and review their information.</p>
                
                <div class="character-form">
                    <div class="form-group">
                        <label for="character-name">Character Name:</label>
                        <input type="text" id="character-name" maxlength="15" 
                               value="${this.characterData.name || ''}" 
                               placeholder="Enter character name">
                        <small>Maximum 15 characters</small>
                    </div>
                    
                    <div class="character-summary">
                        <h4>Character Summary</h4>
                        <div class="summary-grid">
                            <div><strong>Race:</strong> ${this.characterData.selectedRace}</div>
                            <div><strong>Class:</strong> ${this.characterData.selectedClass}</div>
                            <div><strong>Attributes:</strong></div>
                            <div class="attributes-summary">
                                ${this.renderAttributeGrid()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add input handler
        const nameInput = container.querySelector('#character-name');
        nameInput.addEventListener('input', (e) => {
            this.characterData.name = e.target.value.trim();
            this.updateNextButton();
        });
        
        // Focus the input
        nameInput.focus();
    }
    
    /**
     * Render confirmation step
     */
    renderConfirmation(container) {
        const raceData = Race.getRaceData(this.characterData.selectedRace);
        const classData = Class.getClassData(this.characterData.selectedClass);
        
        container.innerHTML = `
            <div class="step-content">
                <h3>Confirm Character Creation</h3>
                <p>Review your character before adding them to your party.</p>
                
                <div class="character-confirmation">
                    <div class="character-portrait">
                        <div class="portrait-placeholder">
                            ${this.characterData.name}
                        </div>
                    </div>
                    
                    <div class="character-details">
                        <h4>${this.characterData.name}</h4>
                        <p><strong>Race:</strong> ${raceData.name} - ${raceData.description}</p>
                        <p><strong>Class:</strong> ${classData.name} - ${classData.description}</p>
                        
                        <div class="final-attributes">
                            <h5>Attributes</h5>
                            ${this.renderAttributeGrid()}
                        </div>
                        
                        <div class="calculated-stats">
                            <h5>Calculated Stats</h5>
                            <p><strong>Hit Points:</strong> ${this.calculateInitialHP()}</p>
                            <p><strong>Armor Class:</strong> ${this.calculateInitialAC()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Update button text for final step
        const nextBtn = this.currentModal.querySelector('#next-step');
        nextBtn.textContent = 'Create Character';
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
        
        const nextBtn = this.currentModal.querySelector('#next-step');
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
            
        } catch (error) {
            console.error('Error creating character:', error);
            // Use the game's messaging system instead of browser alert
            this.eventSystem.emit('show-message', {
                text: 'Error creating character: ' + error.message,
                type: 'error'
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
    updateCharacterDisplay(character) {
        // This would update character sheets, party displays, etc.
        console.log('Character display update:', character);
    }
}