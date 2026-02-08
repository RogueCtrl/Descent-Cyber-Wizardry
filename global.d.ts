/**
 * Global type declarations for Descent: Cyber Wizardry
 *
 * Only window.engine remains as a global — used for browser console debugging.
 * All other classes are imported via ES modules.
 */

import type { Engine } from './src/core/Engine.ts';

declare global {
    interface Window {
        engine: Engine;
        [key: string]: any; // Allow legacy window.X assignments in main.ts
    }
}

export { };
