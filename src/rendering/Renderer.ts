import { Viewport3D } from './Viewport3D.ts';

/**
 * Main Renderer
 * Handles canvas-based rendering for the game
 */
export class Renderer {
    canvas: any;
    ctx: any;
    width: any;
    height: any;
    backgroundColor: string;
    wireframeColor: string;
    textColor: string;
    font: string;
    lineWidth: number;
    viewport3D: Viewport3D;

    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.backgroundColor = '#000000';
        this.wireframeColor = '#00ff00';
        this.textColor = '#00ff00';
        
        this.font = '12px "Courier New", monospace';
        this.lineWidth = 1;
        
        // Initialize 3D viewport for dungeon rendering
        this.viewport3D = new Viewport3D(canvas, context);
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    
    /**
     * Render the dungeon view using advanced 3D viewport
     */
    renderDungeon(dungeon, party) {
        if (dungeon && dungeon.getViewingInfo) {
            // Use the enhanced 3D viewport for authentic Wizardry rendering
            this.viewport3D.render(dungeon, party);
        } else {
            // Fallback to basic rendering if dungeon system isn't ready
            this.renderBasicDungeon();
        }
    }
    
    /**
     * Render basic fallback dungeon view
     */
    renderBasicDungeon() {
        this.clear();
        
        // Basic 3D corridor effect as fallback
        this.ctx.strokeStyle = this.wireframeColor;
        this.ctx.lineWidth = this.lineWidth;
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const depth = 200;
        
        // Floor lines
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        this.ctx.lineTo(centerX - depth/4, centerY + depth/4);
        this.ctx.moveTo(this.width, this.height);
        this.ctx.lineTo(centerX + depth/4, centerY + depth/4);
        this.ctx.stroke();
        
        // Ceiling lines
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(centerX - depth/4, centerY - depth/4);
        this.ctx.moveTo(this.width, 0);
        this.ctx.lineTo(centerX + depth/4, centerY - depth/4);
        this.ctx.stroke();
        
        // Side walls
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.height);
        this.ctx.moveTo(this.width, 0);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.stroke();
        
        // Back wall
        this.ctx.strokeRect(
            centerX - depth/4,
            centerY - depth/4,
            depth/2,
            depth/2
        );
        
        // Status text
        this.renderText('Dungeon system initializing...', 10, 20);
        this.renderText('Basic rendering mode', 10, 40);
    }
    
    /**
     * Render combat interface
     */
    renderCombat() {
        this.clear();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.renderText('COMBAT!', centerX - 30, centerY - 50, '24px "Courier New", monospace');
        this.renderText('Choose your action:', centerX - 70, centerY);
        this.renderText('1. Attack', centerX - 40, centerY + 30);
        this.renderText('2. Cast Spell', centerX - 40, centerY + 50);
        this.renderText('3. Use Item', centerX - 40, centerY + 70);
        this.renderText('4. Run', centerX - 40, centerY + 90);
    }
    
    /**
     * Render character creation screen
     */
    renderCharacterCreation() {
        this.clear();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.renderText('CHARACTER CREATION', centerX - 80, centerY - 50, '16px "Courier New", monospace');
        this.renderText('Use the panel to create your party', centerX - 120, centerY);
    }
    
    /**
     * Render default screen
     */
    renderDefaultScreen() {
        this.clear();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.renderText('DESCENT: CYBER WIZARDRY', centerX - 100, centerY - 20, '16px "Courier New", monospace');
        this.renderText('Loading...', centerX - 30, centerY + 20);
    }
    
    /**
     * Render text on the canvas
     */
    renderText(text, x, y, font = null) {
        this.ctx.fillStyle = this.textColor;
        this.ctx.font = font || this.font;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * Draw a line
     */
    drawLine(x1, y1, x2, y2, color = null) {
        this.ctx.strokeStyle = color || this.wireframeColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    
    /**
     * Draw a rectangle
     */
    drawRect(x, y, width, height, filled = false, color = null) {
        this.ctx.strokeStyle = color || this.wireframeColor;
        this.ctx.fillStyle = color || this.wireframeColor;
        
        if (filled) {
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeRect(x, y, width, height);
        }
    }
    
    /**
     * Set canvas size (also updates 3D viewport)
     */
    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        
        // Update 3D viewport size
        if (this.viewport3D) {
            this.viewport3D.setSize(width, height);
        }
    }
    
    /**
     * Get canvas size
     */
    getSize() {
        return {
            width: this.width,
            height: this.height
        };
    }
}