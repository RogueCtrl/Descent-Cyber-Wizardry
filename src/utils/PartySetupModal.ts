import { Modal } from './Modal.ts';
import { TextManager } from './TextManager.ts';

/**
 * Party Setup Modal
 * Shows on first game start to collect party name and game mode preference
 */
export class PartySetupModal {
  eventSystem: any;
  modal: any;
  onComplete: any;

  constructor(eventSystem: any) {
    this.eventSystem = eventSystem;
    this.modal = null;
    this.onComplete = null;
  }

  /**
   * Show the party setup modal
   * @param {Function} onComplete - Callback when setup is complete
   */
  show(onComplete: any) {
    this.onComplete = onComplete;
    this.createModal();
  }

  /**
   * Create and display the modal
   */
  createModal() {
    // Remove any existing modal
    this.hide();

    this.modal = new Modal({
      className: 'modal party-setup-modal',
      closeOnEscape: false,
      closeOnBackdrop: false,
    });

    const content = this.generateModalContent();
    const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
    const title = isCyberMode ? 'Initialize Strike Team' : 'Create Party';

    this.modal.create(content, title);
    this.setupEventHandlers();
    this.modal.show();

    // Apply TextManager to modal content
    this.applyTextManager();
  }

  /**
   * Generate the modal content HTML
   */
  generateModalContent() {
    const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();

    return `
            <div class="party-setup-content">
                <div class="status-section mode-toggle-section">
                    <div class="status-content">
                        <span class="status-label" data-text-key="mode_toggle_label">Game Mode:</span>
                        <button id="modal-mode-toggle" class="mode-toggle-btn ${isCyberMode ? 'cyber' : 'classic'}-mode">
                            <span id="current-mode-display">${isCyberMode ? 'Cyber' : 'Fantasy'}</span>
                            <span class="toggle-icon">${isCyberMode ? '⚡' : '🏰'}</span>
                        </button>
                    </div>
                </div>
                
                <div class="party-name-section">
                    <div class="form-group">
                        <label for="party-name" data-text-key="party_name_label">Strike Team Name:</label>
                        <input type="text" 
                               id="party-name" 
                               maxlength="30" 
                               placeholder="I can probably change this later..."
                               class="party-name-input">
                        <small class="input-help" data-text-key="party_name_help">You can change this later in the party management screen</small>
                    </div>
                </div>
                
                <div class="party-setup-actions">
                    <button id="begin-adventure" class="btn-primary" data-text-key="begin_adventure">Begin Adventure</button>
                </div>
            </div>
        `;
  }

  /**
   * Set up event handlers for the modal
   */
  setupEventHandlers() {
    const modalElement = this.modal.element;

    // Mode toggle handler
    const modeToggle = modalElement.querySelector('#modal-mode-toggle');
    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        this.handleModeToggle();
      });
    }

    // Party name input handler
    const partyNameInput = modalElement.querySelector('#party-name');
    if (partyNameInput) {
      partyNameInput.addEventListener('input', (e: any) => {
        this.updatePartyNamePlaceholder();
      });

      // Focus the input
      partyNameInput.focus();
    }

    // Begin adventure button handler
    const beginButton = modalElement.querySelector('#begin-adventure');
    if (beginButton) {
      beginButton.addEventListener('click', () => {
        this.handleBeginAdventure();
      });
    }

    // Enter key handler for party name input
    modalElement.addEventListener('keydown', (e: any) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleBeginAdventure();
      }
    });
  }

  /**
   * Handle mode toggle change
   */
  handleModeToggle() {
    if (typeof TextManager !== 'undefined') {
      // Toggle the mode
      TextManager.toggleMode();

      // Update modal title
      const isCyberMode = TextManager.isCyberMode();
      const newTitle = isCyberMode ? 'Initialize Strike Team' : 'Create Party';
      const titleElement = this.modal.element.querySelector('.modal-header h2');
      if (titleElement) {
        titleElement.textContent = newTitle;
      }

      // Update the toggle button display using the same method as UI.js
      const toggleBtn = this.modal.element.querySelector('#modal-mode-toggle');
      if (toggleBtn) {
        this.updateModeToggleDisplay(toggleBtn);
      }

      // Update all text in the modal
      this.applyTextManager();

      // Update placeholder for party name input
      this.updatePartyNamePlaceholder();
    }
  }

  /**
   * Update mode toggle button display (matches UI.js implementation)
   */
  updateModeToggleDisplay(toggleBtn: any) {
    if (!toggleBtn || typeof TextManager === 'undefined') return;

    const currentMode = TextManager.getMode();
    const modeDisplay = toggleBtn.querySelector('#current-mode-display');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');

    if (modeDisplay) {
      modeDisplay.textContent = currentMode === 'cyber' ? 'Cyber' : 'Fantasy';
    }

    if (toggleIcon) {
      toggleIcon.textContent = currentMode === 'cyber' ? '⚡' : '🏰';
    }

    // Update button styling based on mode
    toggleBtn.className = `mode-toggle-btn ${currentMode}-mode`;
  }

  /**
   * Update party name input placeholder based on current mode
   */
  updatePartyNamePlaceholder() {
    const partyNameInput = this.modal.element.querySelector('#party-name');
    if (partyNameInput && typeof TextManager !== 'undefined') {
      const isCyberMode = TextManager.isCyberMode();
      partyNameInput.placeholder = isCyberMode ? 'Whatever...' : "What's a good name?";
    }
  }

  /**
   * Handle begin adventure button click
   */
  handleBeginAdventure() {
    const partyNameInput = this.modal.element.querySelector('#party-name');
    const partyName = partyNameInput ? partyNameInput.value.trim() : '';

    // Use default name if empty
    const finalPartyName = partyName || "I don't know...";

    // Close modal
    this.hide();

    // Call completion callback with the party name
    if (this.onComplete) {
      this.onComplete(finalPartyName);
    }
  }

  /**
   * Apply TextManager to modal elements
   */
  applyTextManager() {
    if (typeof TextManager === 'undefined' || !this.modal.element) return;

    const textElements = this.modal.element.querySelectorAll('[data-text-key]');
    textElements.forEach((element: any) => {
      const textKey = element.getAttribute('data-text-key');
      if (textKey) {
        TextManager.applyToElement(element, textKey);
      }
    });
  }

  /**
   * Hide and destroy the modal
   */
  hide() {
    if (this.modal) {
      this.modal.hide();
      this.modal = null;
    }
  }

  /**
   * Check if the modal is currently visible
   */
  isVisible() {
    return this.modal && this.modal.isOpen();
  }
}
