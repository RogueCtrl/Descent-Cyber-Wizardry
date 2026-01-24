# Descent: Cyber Wizardry - Game Style Guide

> **Scope**: Main Menu System (Phase 2 - Dashboard Redesign)  
> **Inspired by**: [pizzint.watch](https://www.pizzint.watch/) Pentagon Pizza Index  
> **Last Updated**: 2026-01-24

---

## 1. Design Philosophy

### Core Aesthetic: "Tactical OSINT Dashboard"
The visual language mimics a **military precision dashboard**. It replaces scrolling lists with a fixed-grid "situational awareness" display. Every element is anchored, data-dense, and purposeful.

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Fixed Viewport** | No scrolling. The entire state of the network is visible at a glance. |
| **Zone-Based Layout** | Information is compartmentalized into specific "monitors" (AgentOps, Network, etc.). |
| **High Contrast** | Neon accents against deep black/void backgrounds for maximum readability. |
| **Living Data** | Histograms, pulsing status lights, and live counters replace static text. |

---

## 2. Color System

### 2.1 Backgrounds

```css
:root {
    /* Base Layers */
    --bg-primary: #000000;      /* Void black */
    --bg-secondary: #050505;    /* Panel background */
    --bg-tertiary: #0a0a0a;     /* Raised elements */
    
    /* Overlays */
    --bg-glass: rgba(0, 0, 0, 0.85); /* Glassmorphism panels */
    --bg-overlay: rgba(0, 0, 0, 0.5); /* Dimming layers */
}
```

### 2.2 Functional Accents (Refined)

| Color | Variable | Hex | Usage |
|-------|----------|-----|-------|
| ⚡ **Cyber Blue** | `--accent-primary` | `#22d3ee` | Primary interactions, healthy systems, borders (Cyan-600) |
| 🚨 **Critical Red** | `--accent-alert` | `#ef4444` | Breaches, combat, critical failures (Red-500) |
| 🧬 **Bio Green** | `--accent-success` | `#10b981` | Stable biologicals, active agents, success (Emerald-500) |
| ⚠️ **Warning Amber** | `--accent-warning` | `#f59e0b` | Caution, busy, processing (Amber-500) |
| 🔮 **Data Purple** | `--accent-data` | `#a855f7` | Arcane data, magical subsystems (Purple-500) |

### 2.3 Status Indicators

| Status | Color | Visual |
|--------|-------|--------|
| **ONLINE** | Green | Solid glow + Pulse |
| **OFFLINE** | Gray | Dimmed + Striped pattern |
| **ERROR** | Red | Rapid flash + Glitch effect |
| **PROCESSING** | Amber | Rotating spinner or scanning bar |

---

## 3. Typography

**Font**: `JetBrains Mono` (Primary)

### Type Scale

```css
:root {
    --text-xs: 0.75rem;   /* Data labels */
    --text-sm: 0.875rem;  /* Body text */
    --text-base: 1rem;    /* Standard inputs */
    --text-lg: 1.125rem;  /* Subheaders */
    --text-xl: 1.25rem;   /* Panel headers */
    --text-2xl: 1.5rem;   /* Key metrics */
    --text-3xl: 2rem;     /* Main titles */
}
```

---

## 4. Main Menu Layout ("The Dashboard")

The Main Menu is a **full-screen dashboard** (100vw x 100vh) with a 2-row grid structure overlaid on a circuit-board background.

### 4.1 Grid Structure

```css
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 Columns */
    grid-template-rows: 1.2fr 1fr;         /* Top row slightly taller */
    gap: var(--space-6);
    padding: var(--space-6);
    max-width: 1600px;
    margin: 0 auto;
    height: 100vh;
}
```

### 4.2 Panel Assignment

#### Top Row (Mission Control)
1. **AgentOps** (Left): Roster management, health monitoring, recruitment.
2. **Corrupted Network** (Center): Main dungeon interface, threat levels, connection status.
3. **Data Exchange** (Right): Market, shop, item storage.

#### Bottom Row (Support Systems)
4. **Restoration Center** (Left): Healing, resurrection, battery recharge.
5. **Strike Team Manifest** (Right): Party configuration, active deployment tracking.

### 4.3 Panel Design

Each panel uses a glassmorphism effect to separate it from the background while letting the circuit board texture peek through.

```css
.dashboard-panel {
    background: var(--bg-glass);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
}

/* Header with specialized "Cyber Brackets" */
.panel-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: var(--space-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

---

## 5. Components

### 5.1 Histograms
Visual bar charts used to show distribution of data (e.g., agent health spread, danger levels).

### 5.2 Status Badges
Pill-shaped indicators for quick status checks.

### 5.3 Action Buttons
Square, icon-centric buttons for primary interactions. Hover effects trigger a "holographic projection" glow.


> **Scope**: Town Menu System (Phase 1)  
> **Inspired by**: [pizzint.watch](https://www.pizzint.watch/) Pentagon Pizza Index  
> **Last Updated**: 2026-01-24

---

## 1. Design Philosophy

### Core Aesthetic: "Tactical OSINT Dashboard"
The visual language combines **military intelligence dashboards** with **retro-computing terminals** to create an immersive cyberpunk atmosphere. The UI should feel like a high-clearance monitoring station—dense with information, high-contrast, and operationally focused.

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Functional Color** | Colors communicate meaning (alerts, status, actions) not decoration |
| **Information Density** | Maximize usable space with compact, scannable layouts |
| **Terminal Aesthetic** | Monospace fonts, recessed containers, glowing accents |
| **Tactical Feel** | Corner brackets, status indicators, pulsing elements |

---

## 2. Color System

### 2.1 Background Surfaces

```css
:root {
    /* Base Backgrounds - Ultra-dark for tactical feel */
    --bg-primary: #020202;      /* Deepest dark - interactive elements */
    --bg-secondary: #050505;    /* Panel backgrounds */
    --bg-tertiary: #0a0a0a;     /* Raised surfaces */
    --bg-panel: #080808;        /* Standard panels */
    
    /* Surface with subtle blue undertone for depth */
    --bg-tactical: #060918;     /* Alternative gradient endpoint */
}
```

### 2.2 Functional Accent Colors

| Color | Variable | Hex | Usage |
|-------|----------|-----|-------|
| 🔵 **Cyber Blue** | `--accent-primary` | `#3b82f6` | Primary actions, interactive elements, branding |
| 🔷 **Cyan Blue** | `--accent-secondary` | `#00d4ff` | Secondary highlights, hover states, neon glows |
| 🔴 **Neon Red** | `--accent-alert` | `#960c19` | Warnings, critical headers, urgent status |
| 🟢 **Cyber Green** | `--accent-success` | `#00ff88` | Success states, active connections, health |
| 🟡 **Amber Yellow** | `--accent-warning` | `#ffcc00` | Alerts, high-tension, cautions |
| 🟣 **Neon Purple** | `--accent-data` | `#cc66ff` | Market/data elements, analysis |

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
    --border-primary: #1f1f1f;  /* Subtle panel borders */
    --border-accent: #333333;   /* Emphasized borders */
    --border-glow: #3b82f6;     /* Active/focused elements */
    
    --glow-primary: rgba(59, 130, 246, 0.6);  /* Blue glow */
    --glow-alert: rgba(255, 51, 51, 0.6);     /* Red glow */
    --glow-success: rgba(0, 255, 136, 0.6);  /* Green glow */
}
```

---

## 3. Typography

### 3.1 Font Stack

| Purpose | Font | Fallback |
|---------|------|----------|
| **Primary UI** | `JetBrains Mono` | `'Courier New', monospace` |
| **Retro Headers** | `VT323` *(Consider adding)* | `monospace` |

> [!TIP]
> Pizza Watch uses **VT323** for large, impactful headers to evoke 1980s terminals. Consider importing this for main titles and section headers.

### 3.2 Type Scale

```css
:root {
    --font-size-xs: 0.7rem;    /* 11.2px - Labels, timestamps */
    --font-size-sm: 0.8rem;    /* 12.8px - Secondary content */
    --font-size-base: 0.9rem;  /* 14.4px - Body text */
    --font-size-lg: 1.1rem;    /* 17.6px - Emphasized text */
    --font-size-xl: 1.25rem;   /* 20px - Section headers */
    --font-size-2xl: 1.5rem;   /* 24px - Card titles */
    --font-size-3xl: 2rem;     /* 32px - Page titles */
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

The Town Menu uses a simplified three-section layout: **Header**, **Card Grid**, and **Footer**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER ROW                                                             │
│  🍕 PENTAGON PIZZA INDEX                                                │
│     Intel by the Slice                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CARD GRID                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   TAVERN     │  │   ARMORY     │  │    GUILD     │                   │
│  │              │  │              │  │              │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   TEMPLE     │  │  TRAINING    │  │   DUNGEON    │                   │
│  │              │  │              │  │              │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                 │
│  CLASSIFIED // FOR OFFICIAL USE ONLY // NETWORK OPERATIONS DIVISION     │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 4.2.1 Page Container (`.town-menu`)

The Town Hub is typically served within a **full-bleed modal overlay** that occupies the entire viewport, removing any "outer box" constraints to achieve the immersive tactical dashboard feel of [pizzint.watch](https://www.pizzint.watch/).

```css
/* Layout in main.css context */
.town-modal .modal-content {
    width: 100%;
    height: 100%;
    max-width: none;
    border: none;
    background: transparent;
}

.town-menu {
    display: flex;
    flex-direction: column;
    width: 98vw;
    height: 98vh;
    margin: 1vh auto;
    padding: var(--space-4);
    background: #101828;
    color: var(--text-primary);
    font-family: var(--font-primary);
    overflow: hidden;
}
```

#### 4.2.2 Header Row (`.town-header`)

The header spans the full width and contains the game logo/icon and title.

| Element | Style |
|---------|-------|
| **Logo/Icon** | 2-3rem emoji or SVG, with drop-shadow glow |
| **Title** | `--font-size-3xl` (2rem), bold, uppercase, letter-spacing 2-4px |
| **Subtitle** | `--font-size-lg`, italic, muted color |
| **Background** | Transparent or subtle gradient |
| **Spacing** | `padding-bottom: var(--space-6)`, `margin-bottom: var(--space-6)` |
| **Border** | Bottom border `2px solid var(--border-accent)` |

```css
.town-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding-bottom: var(--space-6);
    margin-bottom: var(--space-6);
    border-bottom: 2px solid var(--border-accent);
}

.town-logo {
    font-size: 3rem;
    filter: drop-shadow(0 0 10px var(--glow-primary));
}

.town-title-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.town-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: var(--text-primary);
    text-shadow: 0 0 20px var(--glow-primary);
    margin: 0;
}

.town-subtitle {
    font-size: var(--font-size-lg);
    font-style: italic;
    color: var(--text-secondary);
    margin: 0;
}
```

#### 4.2.3 Card Grid (`.town-grid`)

Structured grid containing location cards, limited to a maximum of 3 columns for optimal scanning.

| Property | Value |
|----------|-------|
| **Columns** | `repeat(3, 1fr)` (Desktop) |
| **Grid Max** | Max 3 columns per row |
| **Gap** | `var(--space-6)` (24px) |
| **Padding** | `var(--space-4)` |
| **Overflow** | `overflow-y: auto` for scrollable content |

```css
.town-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
    align-content: start;
    overflow-y: auto;
    padding: var(--space-4);
    padding-bottom: var(--space-6);
}

@media (max-width: 1200px) {
    .town-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

/* Custom scrollbar for card grid */
.town-grid::-webkit-scrollbar {
    width: 8px;
    background: var(--bg-primary);
}

.town-grid::-webkit-scrollbar-thumb {
    background: var(--border-accent);
    border-radius: var(--radius-sm);
}

.town-grid::-webkit-scrollbar-thumb:hover {
    background: var(--accent-primary);
}
```

#### 4.2.4 Footer (`.town-footer`)

Tactical footer with classification-style branding.

| Element | Style |
|---------|-------|
| **Text** | Uppercase, small, letter-spaced, muted |
| **Content** | Classification badge / Version / Copyright |
| **Background** | Solid dark or subtle red accent |
| **Height** | Fixed, compact |

```css
.town-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    margin-top: auto;
    border-top: 1px solid var(--border-primary);
    background: linear-gradient(90deg, 
        transparent, 
        rgba(239, 68, 68, 0.1), 
        transparent
    );
}

.footer-text {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--text-muted);
}

/* Optional: Accent dividers */
.footer-text::before,
.footer-text::after {
    content: '//';
    margin: 0 var(--space-3);
    color: var(--accent-alert);
    opacity: 0.6;
}
```

#### 4.2.5 Complete Layout Example

```html
<div class="town-menu">
    <!-- Header -->
    <header class="town-header">
        <span class="town-logo">🏰</span>
        <div class="town-title-group">
            <h1 class="town-title">Descent: Cyber Wizardry</h1>
            <p class="town-subtitle">Network Operations Hub</p>
        </div>
    </header>
    
    <!-- Card Grid -->
    <main class="town-grid">
        <article class="location-card">...</article>
        <article class="location-card">...</article>
        <article class="location-card">...</article>
        <!-- More cards -->
    </main>
    
    <!-- Footer -->
    <footer class="town-footer">
        <span class="footer-text">CLASSIFIED // FOR OFFICIAL USE ONLY // NETWORK OPERATIONS DIVISION</span>
    </footer>
</div>
```

#### 4.2.6 Responsive Behavior

```css
@media (max-width: 1200px) {
    .town-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .town-menu {
        width: 100vw;
        height: 100vh;
        padding: var(--space-3);
    }
    
    .town-header {
        flex-direction: column;
        text-align: center;
    }
    
    .town-title {
        font-size: var(--font-size-2xl);
    }
    
    .town-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
    }
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
| **Panels** | `1px solid var(--border-primary)` |
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

### 6.2 Glassmorphism (New from Pizza Watch)

```css
.glass-panel {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

> [!NOTE]
> Pizza Watch uses translucent panels with `backdrop-blur` for overlays. Consider this for modal backgrounds and floating elements.

---

## 7. Card Component Architecture

Cards are the primary navigation and information containers in the Town Menu system. Unlike traditional "clickable card" patterns, Descent cards use **embedded interactive components** within a structured layout.

### 7.1 Card Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER ROW                                                 │
│  ┌──────┐                                                   │
│  │ ⚔️   │  THE ARMORY                                       │
│  └──────┘                                                   │
├─────────────────────────────────────────────────────────────┤
│  ACTION ROW                                                 │
│  ┌─────────┐ ┌─────────┐              ┌────┐ ┌────┐         │
│  │  OPEN   │ │  BUSY   │              │ 🛒 │ │ ℹ️ │  Lv.3   │
│  └─────────┘ └─────────┘              └────┘ └────┘         │
│  ← Status Badges →                    ← Action Buttons →    │
├─────────────────────────────────────────────────────────────┤
│  DATA ROW                                                   │
│  INVENTORY ANALYSIS                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔴 LIVE  Stock levels critical                       │   │
│  │                                                      │   │
│  │  ▓▓▓▓▓▓░░░░░░░░░░  Weapons: 12/50                    │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░  Armor: 38/50                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Header Row (`.card-header`)

The Header Row provides immediate identification of the location.

| Element | Class | Description |
|---------|-------|-------------|
| **Location Icon** | `.card-icon` | Large emoji or icon (2-3rem) representing the location |
| **Location Title** | `.card-title` | Bold, uppercase, letter-spaced name |

**Descent Location Icons:**

| Location | Fantasy Icon | Cyber Icon | Title |
|----------|--------------|------------|-------|
| Tavern | 🍺 | 🔌 | `THE TAVERN` / `RECHARGE STATION` |
| Armory | ⚔️ | 🔧 | `THE ARMORY` / `HARDWARE DEPOT` |
| Guild | 🏛️ | 🖥️ | `ADVENTURER'S GUILD` / `CONTRACTOR HUB` |
| Temple | ⛪ | 💾 | `TEMPLE OF HEALING` / `BACKUP SANCTUARY` |
| Training Grounds | 🎯 | 📡 | `TRAINING GROUNDS` / `BOOT CAMP` |
| Dungeon Entrance | 🚪 | 🌐 | `DUNGEON GATE` / `NETWORK ACCESS` |

```css
.card-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-6);
    border-bottom: 1px solid var(--border-primary);
}

.card-icon {
    font-size: 2.5rem;
    filter: drop-shadow(0 0 8px currentColor);
}

.card-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--text-primary);
}
```

### 7.3 Action Row (`.card-actions`)

The Action Row contains **status indicators** (left) and **interactive buttons** (right).

#### Status Badges (`.status-badge`)

| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| `OPEN` | 🟢 Green | `●` | Location accessible |
| `CLOSED` | 🔴 Red | `○` | Location currently unavailable |
| `BUSY` | 🟡 Yellow | `◐` | High activity, possible wait |
| `LOCKED` | ⚪ Gray | `🔒` | Requires key or quest completion |
| `UNDER_SIEGE` | 🔴 Red (pulsing) | `⚠` | Combat event active |
| `NEW_STOCK` | 🔵 Blue | `✦` | Fresh inventory available |
| `GRID_ACTIVE` | 🔴 Red (pulsing) | `◉` | System online / dungeon connection active |

```css
.card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--border-primary);
}

.status-group {
    display: flex;
    gap: var(--space-2);
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid currentColor;
    background: rgba(0, 0, 0, 0.3);
}

.status-badge.open {
    color: var(--accent-success);
    border-color: var(--accent-success);
}

.status-badge.closed {
    color: var(--accent-alert);
    border-color: var(--accent-alert);
}

.status-badge.busy {
    color: var(--accent-warning);
    border-color: var(--accent-warning);
}

.status-badge.locked {
    color: var(--text-muted);
    border-color: var(--border-accent);
}

/* GRID ACTIVE - Pulsing red status for active connections */
.status-badge.grid-active {
    color: var(--accent-alert);
    border-color: var(--accent-alert);
    animation: status-pulse 2s ease-in-out infinite;
}

.status-badge.grid-active::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--accent-alert);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--accent-alert);
    animation: dot-pulse 1.5s ease-in-out infinite;
}

@keyframes status-pulse {
    0%, 100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
    50% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
}

@keyframes dot-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.8); }
}
```

#### Action Buttons (`.action-btn`)

| Action | Icon | Description |
|--------|------|-------------|
| `ENTER` | `🔘` | Navigate into location |
| `SHOP` | `🛒` | Open trade interface |
| `INFO` | `ℹ️` | View location details |
| `HIRE` | `👤+` | Recruit available agents |
| `REST` | `💤` | Begin rest sequence |
| `TRAIN` | `⬆️` | Access training menu |

**Metadata Badge** (optional, right-aligned):
- Level requirement: `Lv.3`
- Gold cost: `50g`
- Danger rating: `☠️☠️`

```css
.action-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.action-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.action-btn:hover {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: white;
    box-shadow: 0 0 10px var(--glow-primary);
}

/* Primary Action - stronger hover highlight (matches info color) */
.action-btn.primary:hover {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: white;
    box-shadow: 0 0 15px var(--glow-primary);
}

.action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.metadata-badge {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    margin-left: var(--space-2);
}
```

### 7.4 Data Row (`.card-data`)

The Data Row displays **real-time information** about the location.

#### Data Chips (`.data-chip`)

Compact data points with glowing indicator dots. Used to display counts and metrics within cards.

```
┌─────────────────────────────────┐
│  ● 1 AGENTS REGISTRY            │  ← Blue glow, count + label
└─────────────────────────────────┘
```

| Descent Example | Description |
|-----------------|-------------|
| `1 AGENTS REGISTRY` | Number of agents at location |
| `3 QUESTS AVAILABLE` | Available contracts |
| `12 ITEMS IN STOCK` | Inventory count |
| `2 RESTING` | Party members recovering |

```css
.data-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--accent-primary);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-primary);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

/* Glowing indicator dot */
.data-chip::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--accent-primary);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--accent-primary);
}

/* Value emphasis */
.data-chip .chip-value {
    color: var(--accent-secondary);
    font-weight: 700;
}

/* Chip variants */
.data-chip.success {
    border-color: var(--accent-success);
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.data-chip.success::before {
    background: var(--accent-success);
    box-shadow: 0 0 6px var(--accent-success);
}

.data-chip.warning {
    border-color: var(--accent-warning);
    box-shadow: 0 0 8px rgba(250, 204, 21, 0.3);
}

.data-chip.warning::before {
    background: var(--accent-warning);
    box-shadow: 0 0 6px var(--accent-warning);
}

.data-chip.alert {
    border-color: var(--accent-alert);
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.data-chip.alert::before {
    background: var(--accent-alert);
    box-shadow: 0 0 6px var(--accent-alert);
}
```

#### Section Label (`.data-label`)
```css
.data-label {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    margin-bottom: var(--space-3);
}
```

#### Live Status Indicator (`.live-indicator`)
```css
.live-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-3);
}

.live-tag {
    font-size: var(--font-size-xs);
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    background: var(--accent-alert);
    color: white;
    animation: pulse 2s infinite;
}

.live-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}
```

#### Data Visualization Types

| Location | Visualization | Description |
|----------|---------------|-------------|
| **Tavern** | Agent histogram | Shows resting party members over time |
| **Armory** | Inventory bars | Stock levels by category |
| **Guild** | Quest list | Available contracts with rewards |
| **Temple** | Healing queue | Characters awaiting restoration |
| **Training** | XP progress | Characters and their training status |
| **Dungeon** | Threat gauge | Current danger level indicator |

```css
/* Histogram */
.histogram {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 60px;
    padding: var(--space-2) 0;
}

.histogram-bar {
    flex: 1;
    background: var(--accent-primary);
    border-radius: 2px 2px 0 0;
    min-height: 4px;
    transition: height 0.3s ease;
}

.histogram-bar.current {
    background: var(--accent-alert);
    box-shadow: 0 0 8px var(--glow-alert);
}

.histogram-bar.closed {
    background: var(--text-muted);
    opacity: 0.3;
}

/* Progress Bars */
.stat-bar {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
}

.stat-bar-label {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    min-width: 80px;
}

.stat-bar-track {
    flex: 1;
    height: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.stat-bar-fill {
    height: 100%;
    background: var(--accent-primary);
    transition: width 0.3s ease;
}

.stat-bar-value {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    min-width: 50px;
    text-align: right;
}
```

### 7.5 Complete Card Container

```css
.location-card {
    position: relative;
    background: #1a2d63;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-xl);
    overflow: visible; /* Required for corner brackets */
    transition: all var(--transition-normal);
}

/* Cyber-Bracket: Top-Left Corner */
.location-card::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 20px;
    height: 20px;
    border-top: 2px solid var(--accent-primary);
    border-left: 2px solid var(--accent-primary);
    pointer-events: none;
    z-index: 10;
    transition: all var(--transition-fast);
}

/* Cyber-Bracket: Bottom-Right Corner */
.location-card::after {
    content: '';
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    border-bottom: 2px solid var(--accent-primary);
    border-right: 2px solid var(--accent-primary);
    pointer-events: none;
    z-index: 10;
    transition: all var(--transition-fast);
}

/* Bracket expansion on hover - forms full border */
.location-card:hover::before {
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    border-color: var(--accent-secondary);
    box-shadow: -2px -2px 10px var(--glow-primary);
}

.location-card:hover::after {
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    border-color: var(--accent-secondary);
    box-shadow: 2px 2px 10px var(--glow-primary);
}

.location-card:hover {
    background: rgba(26, 45, 99, 0.4); /* Translucent reveal effect */
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.15);
}

.location-card.highlighted {
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-glow);
    animation: pulse 2s ease-in-out infinite;
}

.location-card.disabled {
    opacity: 0.6;
    pointer-events: none;
}

.location-card.disabled::before,
.location-card.disabled::after {
    border-color: var(--text-muted);
}

.card-data {
    padding: var(--space-6);
}
```

### 7.6 Card Variants

| Variant | Use Case | Visual Treatment |
|---------|----------|------------------|
| **Default** | Standard location | Base styling |
| **Highlighted** | Recommended action | Pulsing border glow |
| **Disabled** | Locked/unavailable | Reduced opacity, no interactions |
| **Alert** | Event active | Red border, pulsing status |
| **New** | Fresh content | Blue "NEW" badge in header |

---

## 8. Component Patterns

### 7.1 Tactical Cards (Location Cards)

The primary navigation element in the Town Hub.

```
┌────────────────────────────────────────┐
│ ◢                               ◤      │  ← Corner brackets (::after)
│   🏛️                                   │  ← Icon (4rem, top-aligned)
│   TAVERN                               │  ← Title (uppercase, 2xl)
│   Rest and recover...                  │  ← Description (muted)
│                                        │
│   ──────────────────────               │  ← Divider
│   ● LIVE STATUS: 3 Agents              │  ← Status badge
│   ▓▓▓▓▓▓▓░░░░░ 60%                     │  ← Data visualization
│                               ◣     ◥  │  ← Corner brackets (span)
└────────────────────────────────────────┘
```

**Key Properties:**
- Fixed height: `350px`
- Background: `linear-gradient(145deg, var(--bg-primary), var(--bg-secondary))`
- Border: `2px solid var(--border-primary)`
- Radius: `var(--radius-xl)`
- Overflow: `visible` (for corner brackets)

### 7.2 Corner Bracket Accents

Decorative "L-brackets" that reinforce the tactical/industrial aesthetic. **On hover**, these brackets animate to extend across the full width and height of the card, creating a complete border frame. Simultaneously, the card background shifts to a semi-transparent state, creating a "data reveal" effect.

```css
/* Top-left bracket */
.card::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 20px;
    height: 20px;
    border-top: 2px solid var(--accent-primary);
    border-left: 2px solid var(--accent-primary);
    z-index: 10;
    pointer-events: none;
    transition: all var(--transition-normal);
}

/* Bottom-right bracket */
.card::after {
    content: '';
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    border-bottom: 2px solid var(--accent-primary);
    border-right: 2px solid var(--accent-primary);
    z-index: 10;
    pointer-events: none;
}
```

### 7.3 Status Indicators

#### Pulse Dot
```css
.pulse-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: var(--accent-success);
    border-radius: 50%;
    margin-right: 8px;
    animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
    }
    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}
```

#### Live Status Badge
```css
.live-status {
    display: inline-flex;
    align-items: center;
    font-size: var(--font-size-xs);
    font-weight: bold;
    color: var(--accent-secondary);
    background: rgba(59, 130, 246, 0.1);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
}
```

### 7.4 Panel Headers ("Domino's Pizza" Style)

Section headers with pulsing indicator dots.

```css
.panel-header {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent-alert);
    margin-bottom: var(--space-4);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-primary);
    padding-bottom: var(--space-2);
}

.panel-header::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: currentColor;
    margin-right: 8px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
}
```

### 7.5 Industrial Buttons

Terminal-style buttons with vertical accent lines.

```css
button {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-family: var(--font-primary);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.1s ease;
    position: relative;
    overflow: hidden;
}

/* Vertical accent line on hover */
button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: var(--accent-primary);
    opacity: 0;
    transition: opacity 0.2s;
}

button:hover::before {
    opacity: 1;
}

button:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
}
```

---

## 8. Data Visualization

### 8.1 Status Bars (HP/Resource)

Recessed containers with striped gradient fills.

```css
.status-bar-container {
    height: 8px;
    background: #222;
    border: 1px solid #333;
    overflow: hidden;
}

.status-bar-fill {
    height: 100%;
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%
    );
    background-size: 1rem 1rem;
    transition: width 0.3s ease;
}

.status-bar-fill.healthy { background-color: var(--accent-success); }
.status-bar-fill.wounded { background-color: #f59e0b; }
.status-bar-fill.critical { background-color: var(--accent-alert); }
```

### 8.2 Histogram Modules (New from Pizza Watch)

Vertical bar charts for data visualization within cards.

```css
.histogram {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 40px;
}

.histogram-bar {
    flex: 1;
    background: var(--accent-primary);
    border-radius: 1px 1px 0 0;
    transition: height 0.3s ease;
}

.histogram-bar.active {
    background: var(--accent-alert);
}
```

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

| Animation | Use Case | Keyframes |
|-----------|----------|-----------|
| `pulse` | Primary action cards | Box-shadow oscillation |
| `glow` | Active text elements | Text-shadow oscillation |
| `fadeIn` | Modal entry | Opacity 0→1 |
| `slideIn` | Modal entry | TranslateY + scale |

### 9.3 Hover Transforms

- **Cards**: `translateY(-5px) scale(1.02)`
- **Buttons**: `translateY(-2px)`
- **Interactive Elements**: `scale(1.05)`

---

## 10. Decorative Elements

### 10.1 Scanline Overlay (Optional - from Pizza Watch)

Subtle horizontal lines for CRT/terminal feel.

```css
.scanlines::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.1) 2px,
        rgba(0, 0, 0, 0.1) 4px
    );
    pointer-events: none;
}
```

### 10.2 Grid Pattern Background (Optional)

```css
.grid-bg {
    background-image: 
        linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
}
```

---

## 11. Responsive Considerations

### 11.1 Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */
```

### 11.2 Town Grid Collapse

```css
.town-grid {
    grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1200px) {
    .town-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .town-grid {
        grid-template-columns: 1fr;
    }
}
```

---

## 12. Future Considerations

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
| ⬛ | Primary BG | `#050505` | Main backgrounds |
| 🔵 | Cyber Blue | `#3b82f6` | Primary accent |
| 🔴 | Alert Red | `#ef4444` | Warnings |
| 🟢 | Matrix Green | `#10b981` | Success |
| 🟡 | Warning Yellow | `#facc15` | Cautions |
| 🟣 | Data Purple | `#a855f7` | Data elements |

### Component Checklist

- [ ] Location Cards with corner brackets
- [ ] Panel headers with ping indicators
- [ ] Status bars with striped fills
- [ ] Pulsing dot animations
- [ ] Industrial button styling
- [ ] Glassmorphism overlays

---

> *"The interface should feel like you're accessing a high-clearance terminal in a cyberpunk command center."*
