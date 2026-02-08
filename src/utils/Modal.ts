/**
 * Reusable Modal Component
 * Provides a consistent modal overlay system for full-screen interfaces
 */
export class Modal {
    options: any;
    element: HTMLElement | null;
    isVisible: boolean;
    onClose: (() => void) | null;
    contentArea: HTMLElement | null = null;
    overlay: HTMLElement | null = null;
    container: HTMLElement | null = null;

    constructor(options: any = {}) {
        this.options = {
            className: 'modal',
            closeOnEscape: true,
            closeOnBackdrop: false,
            ...options
        };

        this.element = null;
        this.isVisible = false;
        this.onClose = null;

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
    }

    /**
     * Create the modal DOM structure
     */
    create(content, title = null) {
        // Remove existing modal if present
        this.destroy();

        // Create modal container
        this.element = document.createElement('div');
        this.element.className = this.options.className;

        // Build modal structure
        let modalHTML = '<div class="modal-content">';

        // Add header if title provided
        if (title) {
            modalHTML += `
                <div class="modal-header">
                    <h2>${title}</h2>
                </div>
            `;
        }

        // Add body content
        modalHTML += `
            <div class="modal-body">
                ${content}
            </div>
        `;

        modalHTML += '</div>';

        this.element.innerHTML = modalHTML;

        // Set up event listeners
        if (this.options.closeOnBackdrop) {
            this.element.addEventListener('click', this.handleBackdropClick);
        }

        return this.element;
    }

    /**
     * Show the modal
     */
    show() {
        if (!this.element) {
            console.warn('Modal element not created. Call create() first.');
            return;
        }

        if (this.isVisible) {
            return;
        }

        // Add to DOM
        document.body.appendChild(this.element);

        // Set up keyboard listeners
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.handleKeyDown);
        }

        // Trigger animation
        requestAnimationFrame(() => {
            if (this.element) {
                this.element.style.opacity = '1';
            }
        });

        this.isVisible = true;

        // Emit show event
        this.emit('show');
    }

    /**
     * Hide the modal
     */
    hide() {
        if (!this.isVisible || !this.element) {
            return;
        }

        // Remove keyboard listeners
        document.removeEventListener('keydown', this.handleKeyDown);

        // Trigger animation then remove
        if (this.element) {
            this.element.style.opacity = '0';
        }

        setTimeout(() => {
            this.destroy();
        }, 300); // Match CSS transition time

        this.isVisible = false;

        // Emit hide event
        this.emit('hide');
    }

    /**
     * Destroy the modal and clean up
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);

        this.element = null;
        this.isVisible = false;
    }

    /**
     * Update modal content
     */
    updateContent(content) {
        if (!this.element) {
            return;
        }

        const modalBody = this.element.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = content;
        }
    }

    /**
     * Set close callback
     */
    setOnClose(callback) {
        this.onClose = callback;
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.close();
        }
    }

    /**
     * Handle backdrop clicks
     */
    handleBackdropClick(event) {
        if (event.target === this.element) {
            this.close();
        }
    }

    /**
     * Close the modal (calls onClose callback if set)
     */
    close() {
        if (this.onClose) {
            this.onClose();
        } else {
            this.hide();
        }
    }

    /**
     * Simple event emitter
     */
    emit(eventName) {
        // Basic event system - can be enhanced later
        console.log(`Modal event: ${eventName}`);
    }

    /**
     * Get modal body element for custom manipulation
     */
    getBody() {
        return this.element ? this.element.querySelector('.modal-body') : null;
    }

    /**
     * Get modal header element for custom manipulation
     */
    getHeader() {
        return this.element ? this.element.querySelector('.modal-header') : null;
    }

    /**
     * Check if modal is currently visible
     */
    isOpen() {
        return this.isVisible;
    }
}