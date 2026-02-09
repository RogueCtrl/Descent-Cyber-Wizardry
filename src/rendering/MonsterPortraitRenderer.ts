import { Viewport3D } from './Viewport3D.ts';

/**
 * Monster Portrait Renderer
 * Extends Viewport3D to render 3D wireframe monster portraits in combat interface
 */
export class MonsterPortraitRenderer extends Viewport3D {
  recentDamage: number = 0;
  portraitMode: boolean;
  portraitScale: number;
  portraitOffset: { x: number; y: number };
  portraitRotation: { x: number; y: number; z: number };
  animationTime: number;
  animationSpeed: number;
  breathingAmount: number;
  portraitColors: Record<string, string>;
  animationFrame: number | null = null;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    super(canvas, context);

    // Portrait-specific rendering parameters
    this.portraitMode = true;
    this.portraitScale = 0.8;
    this.portraitOffset = { x: 0, y: -10 }; // Slight upward offset
    this.portraitRotation = { x: 0, y: 15, z: 0 }; // Slight angle for depth

    // Portrait animation parameters
    this.animationTime = 0;
    this.animationSpeed = 0.005;
    this.breathingAmount = 2; // Subtle breathing effect

    // Portrait-specific colors (inherit from Viewport3D but allow overrides)
    this.portraitColors = {
      ...this.colors,
      healthy: '#00ff00',
      injured: '#ffaa00',
      critical: '#ff4400',
      dead: '#888888',
    };
  }

  /**
   * Render a monster portrait using wireframe model data
   */
  renderMonsterPortrait(monster: any, options: any = {}) {
    if (!monster || !monster.portraitModel) {
      this.renderFallbackPortrait();
      return;
    }

    this.clear();

    // Calculate health-based color
    const healthRatio = (monster.currentHP || 0) / (monster.maxHP || 1);
    const portraitColor = this.getHealthColor(healthRatio, monster);

    // Set up portrait rendering context
    this.ctx.strokeStyle = portraitColor;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Render the portrait model
    this.renderPortraitModel(monster.portraitModel, {
      healthRatio,
      status: monster.status,
      ...options,
    });

    // Add subtle effects
    this.renderPortraitEffects(monster, options);

    // Update animation time
    this.animationTime += this.animationSpeed;
  }

  /**
   * Render the 3D wireframe model for the portrait
   */
  renderPortraitModel(portraitModel: any, options: any = {}) {
    if (!portraitModel.vertices || !portraitModel.edges) return;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Apply portrait transformations
    const transformedVertices = this.transformPortraitVertices(
      portraitModel.vertices,
      portraitModel.scale || 1.0,
      portraitModel.rotation || [0, 0, 0],
      options
    );

    // Project 3D vertices to 2D screen coordinates
    const projectedVertices = transformedVertices.map((vertex) =>
      this.projectToPortraitSpace(vertex, centerX, centerY)
    );

    // Draw wireframe edges
    this.ctx.beginPath();
    portraitModel.edges.forEach((edge: any) => {
      const [startIdx, endIdx] = edge;
      if (startIdx < projectedVertices.length && endIdx < projectedVertices.length) {
        const start = projectedVertices[startIdx];
        const end = projectedVertices[endIdx];

        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
      }
    });
    this.ctx.stroke();
  }

  /**
   * Transform 3D vertices for portrait display
   */
  transformPortraitVertices(
    vertices: number[][],
    scale: number,
    rotation: number[],
    _options: any = {}
  ) {
    const [rotX, rotY] = rotation;
    const combinedScale = scale * this.portraitScale;

    // Add subtle breathing animation
    const breathingScale = 1 + Math.sin(this.animationTime * 200) * this.breathingAmount * 0.01;
    const finalScale = combinedScale * breathingScale;

    return vertices.map(([x, y, z]) => {
      // Apply scale
      let transformedX = x * finalScale;
      let transformedY = y * finalScale;
      let transformedZ = z * finalScale;

      // Apply Y rotation (most common for portrait angle)
      if (rotY !== 0) {
        const cosY = Math.cos((rotY * Math.PI) / 180);
        const sinY = Math.sin((rotY * Math.PI) / 180);
        const newX = transformedX * cosY - transformedZ * sinY;
        const newZ = transformedX * sinY + transformedZ * cosY;
        transformedX = newX;
        transformedZ = newZ;
      }

      // Apply X rotation (pitch)
      if (rotX !== 0) {
        const cosX = Math.cos((rotX * Math.PI) / 180);
        const sinX = Math.sin((rotX * Math.PI) / 180);
        const newY = transformedY * cosX - transformedZ * sinX;
        const newZ = transformedY * sinX + transformedZ * cosX;
        transformedY = newY;
        transformedZ = newZ;
      }

      return [transformedX, transformedY, transformedZ];
    });
  }

  /**
   * Project 3D coordinates to 2D portrait space
   */
  projectToPortraitSpace(vertex: number[], centerX: number, centerY: number) {
    const [x, y] = vertex;

    // Simple orthographic projection for portrait (no perspective distortion)
    const scale = 100; // Scale factor for portrait size

    return {
      x: centerX + x * scale + this.portraitOffset.x,
      y: centerY - y * scale + this.portraitOffset.y, // Invert Y for screen coordinates
    };
  }

  /**
   * Render additional portrait effects based on monster status
   */
  renderPortraitEffects(monster: any, options: any = {}) {
    // Enhanced cyberpunk visual effects
    this.renderGridLines(monster, options);
    this.renderDataCorruption(monster, options);
    this.renderSystemPulse(monster, options);
    this.renderDataStreamParticles(monster, options);
    this.renderCircuitTrace(monster, 'active');

    // Advanced status overlays
    this.renderThreatLevelIndicator(monster, options);
    this.renderSystemStatusOverlay(monster, options);

    // Status effects overlay
    if (monster.isUnconscious) {
      this.renderUnconscousEffect();
    } else if (monster.isDead) {
      this.renderDeadEffect();
    }

    // Add damage flash effect (if recently damaged)
    if ((options as any).recentDamage) {
      this.renderDamageFlash();
    }
  }

  /**
   * Render grid lines overlay for cyberpunk aesthetic
   */
  renderGridLines(monster: any, _options: any = {}) {
    const healthRatio = (monster.currentHP || 0) / (monster.maxHP || 1);
    const gridAlpha = Math.max(0.1, healthRatio * 0.3);

    this.ctx.globalAlpha = gridAlpha;
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 0.5;

    const gridSize = 40;

    // Vertical grid lines
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render data corruption effects for damaged entities
   */
  renderDataCorruption(monster: any, _options: any = {}) {
    const healthRatio = (monster.currentHP || 0) / (monster.maxHP || 1);
    const corruptionLevel = 1 - healthRatio;

    if (corruptionLevel < 0.2) return; // No corruption when healthy

    const corruptionAlpha = corruptionLevel * 0.4;
    this.ctx.globalAlpha = corruptionAlpha;

    // Glitch lines
    for (let i = 0; i < corruptionLevel * 8; i++) {
      const y = Math.random() * this.height;
      const offset = (Math.random() - 0.5) * 20 * corruptionLevel;

      this.ctx.strokeStyle = '#ff0040';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y + offset);
      this.ctx.stroke();
    }

    // Random corruption pixels
    for (let i = 0; i < corruptionLevel * 15; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size = Math.random() * 4 + 1;

      this.ctx.fillStyle = '#ff6600';
      this.ctx.fillRect(x, y, size, size);
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render system pulse animation
   */
  renderSystemPulse(monster: any, _options: any = {}) {
    if (monster.isDead) return; // No pulse when dead

    const pulseIntensity = Math.sin(this.animationTime * 150) * 0.5 + 0.5;
    const healthRatio = (monster.currentHP || 0) / (monster.maxHP || 1);

    // Pulse color based on health
    let pulseColor = '#00ff00'; // Healthy green
    if (healthRatio < 0.7) pulseColor = '#ffaa00'; // Warning orange
    if (healthRatio < 0.3) pulseColor = '#ff4400'; // Critical red

    this.ctx.globalAlpha = pulseIntensity * 0.2;
    this.ctx.strokeStyle = pulseColor;
    this.ctx.lineWidth = 1;

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const pulseRadius = 50 + pulseIntensity * 30;

    // Pulse rings
    for (let i = 0; i < 3; i++) {
      const radius = pulseRadius + i * 15;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render circuit trace patterns
   */
  renderCircuitTrace(monster: any, _pathway: string) {
    if (monster.isDead) return;

    const traceAlpha = 0.4;
    this.ctx.globalAlpha = traceAlpha;
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 1;

    // Circuit path animation
    const pathProgress = (this.animationTime * 50) % 100;

    // Horizontal circuit lines
    for (let i = 0; i < 5; i++) {
      const y = (this.height / 6) * (i + 1);
      const startX = (pathProgress * this.width) / 100 - 50;
      const endX = startX + 30;

      this.ctx.beginPath();
      this.ctx.moveTo(Math.max(0, startX), y);
      this.ctx.lineTo(Math.min(this.width, endX), y);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render data stream particles for active programs
   */
  renderDataStreamParticles(monster: any, _options: any = {}) {
    if (monster.isDead) return;

    const particleCount = monster.isActive ? 12 : 6;
    const particleAlpha = 0.6;

    this.ctx.globalAlpha = particleAlpha;
    this.ctx.fillStyle = '#00ffff';

    for (let i = 0; i < particleCount; i++) {
      const progress = (this.animationTime * 30 + i * 20) % 100;
      const x = (progress / 100) * this.width;
      const y = Math.sin((progress + i * 15) * 0.1) * 20 + this.height / 2;
      const size = Math.sin(progress * 0.05) * 2 + 2;

      this.ctx.fillRect(x, y, size, 1);
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render threat level indicator
   */
  renderThreatLevelIndicator(monster: any, _options: any = {}) {
    if (!monster.threatLevel) return;

    const threatColors = {
      low: '#00ff00',
      medium: '#ffaa00',
      high: '#ff4400',
      critical: '#ff0040',
    };

    const color = (threatColors as Record<string, string>)[monster.threatLevel] || '#ffffff';
    // const centerX = this.width / 2;
    // const centerY = this.height / 2;

    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    // Threat level corners
    const cornerSize = 15;
    const positions = [
      [10, 10],
      [this.width - 10, 10],
      [10, this.height - 10],
      [this.width - 10, this.height - 10],
    ];

    positions.forEach(([x, y]) => {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + cornerSize, y);
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x, y + cornerSize);
      this.ctx.stroke();
    });

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render system status overlay
   */
  renderSystemStatusOverlay(monster: any, _options: any = {}) {
    const healthRatio = (monster.currentHP || 0) / (monster.maxHP || 1);

    // Status bar at bottom
    const barHeight = 4;
    const barY = this.height - 15;
    const barWidth = this.width - 20;
    const barX = 10;

    // Background bar
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health bar
    this.ctx.globalAlpha = 0.8;
    const healthColor = this.getHealthColor(healthRatio, monster);
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    // Status indicators
    if (monster.digitalClassification) {
      this.ctx.globalAlpha = 0.6;
      this.ctx.fillStyle = '#00ffff';
      this.ctx.font = '8px monospace';
      this.ctx.fillText(monster.digitalClassification.toUpperCase(), barX, barY - 5);
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Enhanced circuit trace patterns with different modes
   */
  renderEnhancedCircuitTrace(monster: any, mode: string = 'active') {
    if (monster.isDead && mode !== 'dead') return;

    const traceAlpha = mode === 'dead' ? 0.1 : 0.4;
    const traceSpeed = mode === 'active' ? 50 : 20;
    const traceColor = mode === 'dead' ? '#666666' : '#00ffff';

    this.ctx.globalAlpha = traceAlpha;
    this.ctx.strokeStyle = traceColor;
    this.ctx.lineWidth = 1;

    // Multiple circuit paths
    const pathCount = mode === 'active' ? 8 : 4;
    const pathProgress = (this.animationTime * traceSpeed) % 100;

    for (let i = 0; i < pathCount; i++) {
      const y = (this.height / (pathCount + 1)) * (i + 1);
      const startX = (pathProgress * this.width) / 100 - 50 + i * 10;
      const endX = startX + 30;

      this.ctx.beginPath();
      this.ctx.moveTo(Math.max(0, startX), y);
      this.ctx.lineTo(Math.min(this.width, endX), y);
      this.ctx.stroke();

      // Vertical connections
      if (i % 2 === 0 && i < pathCount - 1) {
        const nextY = (this.height / (pathCount + 1)) * (i + 2);
        this.ctx.beginPath();
        this.ctx.moveTo(startX + 15, y);
        this.ctx.lineTo(startX + 15, nextY);
        this.ctx.stroke();
      }
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render unconscious status effect
   */
  renderUnconscousEffect() {
    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = this.portraitColors.dead;
    this.ctx.lineWidth = 1;

    // Draw X pattern over portrait
    this.ctx.beginPath();
    this.ctx.moveTo(10, 10);
    this.ctx.lineTo(this.width - 10, this.height - 10);
    this.ctx.moveTo(this.width - 10, 10);
    this.ctx.lineTo(10, this.height - 10);
    this.ctx.stroke();

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render dead status effect
   */
  renderDeadEffect() {
    // Darken the entire portrait
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = this.portraitColors.dead;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render damage flash effect
   */
  renderDamageFlash() {
    this.ctx.globalAlpha = 0.2;
    this.ctx.fillStyle = this.portraitColors.critical;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Get health-based color for portrait
   */
  getHealthColor(healthRatio: number, monster: any) {
    if (monster.isDead) return this.portraitColors.dead;
    if (monster.isUnconscious) return this.portraitColors.dead;

    if (healthRatio > 0.7) return this.portraitColors.healthy;
    if (healthRatio > 0.3) return this.portraitColors.injured;
    return this.portraitColors.critical;
  }

  /**
   * Render fallback portrait when no model data is available
   */
  renderFallbackPortrait() {
    this.clear();

    // Draw simple geometric placeholder
    this.ctx.strokeStyle = this.colors.wall;
    this.ctx.lineWidth = 2;

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const size = 60;

    // Simple monster silhouette
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY - 20, size * 0.4, 0, Math.PI * 2); // Head
    this.ctx.moveTo(centerX - size * 0.3, centerY);
    this.ctx.lineTo(centerX + size * 0.3, centerY); // Shoulders
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(centerX, centerY + size * 0.5); // Body
    this.ctx.stroke();
  }

  /**
   * Start portrait animation loop
   */
  startAnimation() {
    if (this.animationFrame) return; // Already running

    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      // Animation handled in renderMonsterPortrait call
    };
    animate();
  }

  /**
   * Stop portrait animation loop
   */
  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopAnimation();
    this.clearCache();
  }
}
