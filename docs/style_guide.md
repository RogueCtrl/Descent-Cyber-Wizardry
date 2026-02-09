# Descent: Cyber Wizardry - Game Style Guide

> **Scope**: Town Menu System  
> **Last Updated**: 2026-02-08

---

## 1. Design Philosophy

### Core Aesthetic: "Tactical OSINT Dashboard"
The visual language combines **military intelligence dashboards** with **retro-computing terminals** to create an immersive cyberpunk atmosphere. The UI should feel like a high-clearance monitoring station—dense with information, high-contrast, and operationally focused.

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Fixed Viewport** | No scrolling. The entire state of the network is visible at a glance. |
| **Zone-Based Layout** | Information is compartmentalized into specific "monitors" (AgentOps, Network, etc.). |
| **High Contrast** | Neon accents against deep black/void backgrounds for maximum readability. |
| **Living Data** | Pulsing status lights, live counters, and terminal text replace static content. |
| **Neon Glow** | All interactive borders and text use `box-shadow` and `text-shadow` for a glowing, emissive look. |

---

## 2. Color System

### 2.1 Background Surfaces

```css
:root {
    /* Base Backgrounds - Ultra-dark for tactical feel */
    --bg-primary: #000000;      /* Void black */
    --bg-secondary: #050505;    /* Panel backgrounds */
    --bg-tertiary: #0a0a0a;     /* Raised surfaces */
    --bg-panel: #080808;        /* Standard panels */
    --bg-glass: rgba(0, 0, 0, 0.85); /* Glassmorphism base */
}
```

### 2.2 Functional Accent Colors

| Color | Variable | Hex | Usage |
|-------|----------|-----|-------|
| ⚡ **Cyber Cyan** | `--accent-primary` | `#22d3ee` | Primary interactions, healthy systems, borders |
| 🔷 **Neon Cyan** | `--accent-secondary` | `#00d4ff` | Secondary highlights, hover states, neon glows |
| 🚨 **Alert Red** | `--accent-alert` | `#960c19` | Warnings, critical headers, urgent status |
| 🧬 **Bio Green** | `--accent-success` | `#00ff88` | Active agents, success states, healthy |
| ⚠️ **Warning Amber** | `--accent-warning` | `#ffcc00` | Caution, busy, processing |
| 🔮 **Data Purple** | `--accent-data` | `#cc66ff` | Market/data elements, analysis |

### 2.3 Text Colors

```css
:root {
    --text-primary: #f0f0f0;    /* Main content */
    --text-secondary: #a0a0a0;  /* Supporting text */
    --text-muted: #555555;      /* Disabled/inactive */
}
```

### 2.4 Borders & Glows

```css
:root {
    --border-primary: #1f1f1f;
    --border-accent: #333333;
    --border-glow: #22d3ee;

    --glow-primary: rgba(0, 242, 255, 0.6);
    --glow-alert: rgba(255, 51, 51, 0.6);
    --glow-success: rgba(0, 255, 136, 0.6);
}
```

### 2.5 Neon Glow Patterns

Recreate the neon-emissive look with `box-shadow` and `text-shadow`:

```css
/* Panel neon border glow */
.panel-border {
    border: 1px solid rgba(0, 242, 255, 0.25);
    box-shadow: 0 0 8px rgba(0, 242, 255, 0.08),
                inset 0 0 4px rgba(0, 242, 255, 0.04);
}

/* Neon text glow */
.neon-text {
    color: #00f2ff;
    text-shadow: 0 0 5px rgba(0, 242, 255, 0.5),
                 0 0 10px rgba(0, 242, 255, 0.25);
}
```

### 2.6 Status Indicators

| Status | Color | Visual |
|--------|-------|--------|
| **ONLINE** | Green | Solid glow + Pulse |
| **OFFLINE** | Gray | Dimmed + Striped pattern |
| **ERROR** | Red | Rapid flash + Glitch effect |
| **PROCESSING** | Amber | Rotating spinner or scanning bar |

---

## 3. Typography

### 3.1 Font Stack

| Purpose | Font | Fallback |
|---------|------|----------|
| **Primary UI** | `JetBrains Mono` | `'Courier New', monospace` |

### 3.2 Type Scale

```css
:root {
    --font-size-xs: 0.7rem;    /* Labels, timestamps */
    --font-size-sm: 0.8rem;    /* Secondary content */
    --font-size-base: 0.9rem;  /* Body text */
    --font-size-lg: 1.1rem;    /* Emphasized text */
    --font-size-xl: 1.25rem;   /* Section headers */
    --font-size-2xl: 1.5rem;   /* Card titles */
    --font-size-3xl: 2rem;     /* Page titles */
}
```

### 3.3 Typography Effects

| Effect | Application | CSS |
|--------|-------------|-----|
| **Text Glow** | Headers, active elements | `text-shadow: 0 0 5px currentColor` |
| **Letter Spacing** | Uppercase labels | `letter-spacing: 0.1em` to `2px` |
| **Uppercase Transform** | Headers, status labels | `text-transform: uppercase` |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

```css
:root {
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
}
```

### 4.2 Town Menu Layout

The Town Menu is a **full-screen dashboard** (100vw × 100vh) with a centered logo header and a **two-column layout** with an empty center pane, all overlaid on a circuit-board background.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│            ╔══════════════════════════════════════╗              │
│            ║  DESCENT: CYBER WIZARDRY  (Logo)    ║              │
│            ╚══════════════════════════════════════╝              │
│                                                                 │
├──────────────────┬──────────────────┬───────────────────────────┤
│   LEFT COLUMN    │   CENTER PANE   │    RIGHT COLUMN            │
│                  │   (empty -      │                             │
│  ┌────────────┐  │    reserved)    │  ┌────────────┐            │
│  │ AGENTOPS   │  │                 │  │ LINK       │            │
│  │ STATUS     │  │                 │  │ STATUS     │            │
│  └────────────┘  │                 │  └────────────┘            │
│                  │                 │                             │
│  ┌────────────┐  │                 │  ┌────────────┐            │
│  │ MED-BAY    │  │                 │  │ DATA VAULT │            │
│  └────────────┘  │                 │  └────────────┘            │
│                  │                 │                             │
│  ┌────────────┐  │                 │  ┌────────────┐            │
│  │ STRIKE     │  │                 │  │ SIGNAL     │            │
│  │ TEAM       │  │                 │  │ FEED       │            │
│  └────────────┘  │                 │  └────────────┘            │
│                  │                 │                             │
└──────────────────┴──────────────────┴───────────────────────────┘
    Circuit Board Background (circuit_board.jpg) + Dark Overlay
```

#### 4.2.1 Page Container (`.town-menu`)

Full-bleed viewport with circuit board background and dark overlay.

```css
.town-menu {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: var(--bg-primary);
    background-image: url('../assets/gui/circuit_board.jpg');
    background-size: cover;
    background-position: center;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* Dark overlay for contrast */
.town-menu::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.78);
    z-index: 1;
}
```

#### 4.2.2 Logo Header (`.dashboard-logo`)

Centered game logo image spanning the full width.

```css
.dashboard-logo {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    flex-shrink: 0;
}

.dashboard-logo img {
    max-height: 140px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 20px rgba(255, 60, 60, 0.4));
}
```

#### 4.2.3 Dashboard Body (`.dashboard-body`)

Three-column CSS grid: left panels, center (empty), right panels.

```css
.dashboard-body {
    position: relative;
    z-index: 2;
    flex: 1;
    display: grid;
    grid-template-columns: minmax(280px, 1fr) 1.2fr minmax(280px, 1fr);
    gap: var(--space-4);
    padding: 0 var(--space-4) var(--space-4);
    max-width: 1800px;
    margin: 0 auto;
    width: 100%;
    min-height: 0;
}
```

#### 4.2.4 Panel Columns (`.dashboard-column`)

Panels stack vertically within each column using flexbox.

```css
.dashboard-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-height: 0;
}
```

#### 4.2.5 Panel Assignment

| Column | Panels |
|--------|--------|
| **Left** | AgentOps Status, Med-Bay, Strike Team |
| **Center** | Empty — reserved for future content (mission map, etc.) |
| **Right** | Link Status, Data Vault, Signal Feed |

#### 4.2.6 Responsive Behavior

```css
@media (max-width: 1200px) {
    .dashboard-body {
        grid-template-columns: 1fr 1fr;
    }
    .dashboard-center { display: none; }
}

@media (max-width: 768px) {
    .dashboard-body {
        grid-template-columns: 1fr;
    }
    .dashboard-logo img { max-height: 80px; }
}
```

---

## 5. Border & Radius Tokens

### 5.1 Border Radius

```css
:root {
    --radius-sm: 2px;    /* Buttons, tags */
    --radius-md: 4px;    /* Form inputs, small cards */
    --radius-lg: 8px;    /* Panels, cards */
    --radius-xl: 12px;   /* Large modals, featured cards */
}
```

### 5.2 Border Styles

| Use Case | Style |
|----------|-------|
| **Panels** | `1px solid rgba(0, 242, 255, 0.25)` + neon glow `box-shadow` |
| **Active Cards** | `2px solid var(--accent-primary)` |
| **Modals** | `2px solid var(--border-accent)` |

---

## 6. Shadows & Effects

### 6.1 Shadow Tokens

```css
:root {
    --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.5),
                   0 2px 4px -1px rgba(0, 0, 0, 0.3);
    --shadow-glow: 0 0 15px var(--glow-primary);
    --shadow-glow-lg: 0 0 25px var(--glow-primary);
}
```

### 6.2 Glassmorphism

```css
.glass-panel {
    background: rgba(0, 20, 25, 0.75);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(0, 242, 255, 0.25);
}
```

---

## 7. Panel Component Architecture

Panels are the primary containers in the Town Menu. Each panel has a header, content area, and optional footer.

### 7.1 Panel Structure

```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  ┌──────┐                               │
│  │ 👤   │  AGENTOPS STATUS    [ONLINE]  │
│  └──────┘                               │
├─────────────────────────────────────────┤
│  CONTENT                                │
│  ACTIVE AGENTS:           3             │
│  INJURED:                 0             │
│  M.I.A.:                  1             │
│                                         │
│  RECRUITMENT POOL: OPEN                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │     [ACCESS REGISTRY]          │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  FOOTER    ● OPERATIONAL                │
└─────────────────────────────────────────┘
```

### 7.2 Panel Base Style

```css
.dashboard-panel {
    background: rgba(0, 20, 25, 0.75);
    border: 1px solid rgba(0, 242, 255, 0.25);
    box-shadow: 0 0 8px rgba(0, 242, 255, 0.08),
                inset 0 0 4px rgba(0, 242, 255, 0.04);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
}

.dashboard-panel:hover {
    border-color: rgba(0, 242, 255, 0.5);
    box-shadow: 0 0 15px rgba(0, 242, 255, 0.15),
                inset 0 0 8px rgba(0, 242, 255, 0.06);
}
```

### 7.3 Panel Header

```css
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #00f2ff;
    text-shadow: 0 0 5px rgba(0, 242, 255, 0.5);
}
```

### 7.4 Panel Accent Colors

Each panel has a colored top border accent:

| Panel | CSS Class | Accent Color | Top Border |
|-------|-----------|-------------|------------|
| AgentOps | `.panel-agentops` | Green | `var(--accent-success)` |
| Link Status | `.panel-network` | Red | `var(--accent-alert)` |
| Data Vault | `.panel-data` | Cyan | `var(--accent-primary)` |
| Med-Bay | `.panel-restoration` | Amber | `var(--accent-warning)` |
| Strike Team | `.panel-manifest` | Cyan | `var(--accent-primary)` |
| Signal Feed | `.panel-news` | Green | `var(--accent-success)` |

### 7.5 Action Buttons

Terminal-style action buttons with neon glow on hover.

```css
.panel-action-btn {
    padding: var(--space-2) var(--space-3);
    background: rgba(0, 242, 255, 0.05);
    border: 1px solid rgba(0, 242, 255, 0.3);
    color: #00f2ff;
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 4px rgba(0, 242, 255, 0.3);
}

.panel-action-btn:hover:not(:disabled) {
    background: rgba(0, 242, 255, 0.15);
    border-color: #00f2ff;
    box-shadow: 0 0 12px rgba(0, 242, 255, 0.3);
}
```

### 7.6 Status Footer

```css
.panel-footer .status::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 4px currentColor; /* Glowing dot */
}
```

---

## 8. Decorative Effects

### 8.1 CRT Scanlines

```css
.crt-overlay {
    background: linear-gradient(rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.25) 50%),
        linear-gradient(90deg,
            rgba(255, 0, 0, 0.06),
            rgba(0, 255, 0, 0.02),
            rgba(0, 0, 255, 0.06));
    background-size: 100% 2px, 3px 100%;
    animation: flicker 0.15s infinite;
}
```

### 8.2 Digital Noise Overlay

SVG-based fractal noise at very low opacity for texture.

### 8.3 Circuit Board Background

The base background uses `circuit_board.jpg` with a dark overlay (`rgba(0,0,0,0.78)`) to maintain readability while keeping the cyberpunk texture visible.

---

## 9. Motion & Transitions

### 9.1 Transition Tokens

```css
:root {
    --transition-fast: 0.1s ease;
    --transition-normal: 0.2s ease;
    --transition-slow: 0.3s ease;
}
```

### 9.2 Animation Patterns

| Animation | Use Case | Effect |
|-----------|----------|--------|
| `flicker` | CRT overlay | Subtle opacity oscillation |
| `scanline` | CRT overlay | Rolling horizontal line |
| `pulse` | Status indicators | Box-shadow oscillation |

### 9.3 Hover Effects

- **Panels**: Increased glow intensity + glitch text-shadow on title
- **Buttons**: Neon glow box-shadow activation
- **Status dots**: Pulsing animation

---

## 10. Responsive Considerations

### 10.1 Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1200px */
/* Desktop: > 1200px */
```

### 10.2 Layout Collapse

| Breakpoint | Layout |
|-----------|--------|
| **Desktop** (>1200px) | 3-column: Left \| Center \| Right |
| **Tablet** (768–1200px) | 2-column: Left \| Right (center hidden) |
| **Mobile** (<768px) | 1-column: all panels stacked |

---

## 11. Future Considerations

### Center Pane Content
- Mission map / tactical overview
- Active dungeon visualization
- Party deployment tracker

### Phase 2: Dungeon Interface
- Viewport HUD elements
- Mini-map styling
- Combat action bar

### Phase 3: Combat Interface
- Monster portrait frames
- Turn order indicators
- Damage/heal popups

---

## Appendix: Quick Reference

### Color Swatches

| Swatch | Name | Hex | Usage |
|:------:|------|-----|-------|
| ⬛ | Primary BG | `#000000` | Main backgrounds |
| 🔷 | Cyber Cyan | `#22d3ee` | Primary accent |
| 🔴 | Alert Red | `#960c19` | Warnings |
| 🟢 | Bio Green | `#00ff88` | Success |
| 🟡 | Warning Amber | `#ffcc00` | Cautions |
| 🟣 | Data Purple | `#cc66ff` | Data elements |

### Asset Files

| Asset | Path | Usage |
|-------|------|-------|
| Circuit Board | `assets/gui/circuit_board.jpg` | Town menu background texture |
| Game Logo | `assets/gui/game_logo.png` | Town menu header logo |

---

> *"The interface should feel like you're accessing a high-clearance terminal in a cyberpunk command center."*
