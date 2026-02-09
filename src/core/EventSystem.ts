import type { GameEventMap } from '../types/index.ts';

interface EventListenerWrapper {
  callback: (...args: any[]) => void;
  context: any;
}

interface QueuedEvent {
  eventName: string;
  args: any[];
  timestamp: number;
}

/**
 * Event System
 * Manages event-driven communication between game components
 */
export class EventSystem {
  listeners: Map<string, EventListenerWrapper[]>;
  oneTimeListeners: Map<string, EventListenerWrapper[]>;
  eventQueue: QueuedEvent[];
  isProcessing: boolean;
  maxQueueSize: number;
  debugMode: boolean;

  static _instance: EventSystem | null = null;

  static getInstance(): EventSystem {
    if (!EventSystem._instance) {
      EventSystem._instance = new EventSystem();
    }
    return EventSystem._instance;
  }

  static setInstance(instance: EventSystem): void {
    EventSystem._instance = instance;
  }

  constructor() {
    this.listeners = new Map();
    this.oneTimeListeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
    this.maxQueueSize = 1000;

    // Debug mode
    this.debugMode = false;
  }

  /**
   * Add an event listener
   */
  on<K extends keyof GameEventMap>(
    eventName: K,
    callback: (...args: GameEventMap[K]) => void,
    context?: any
  ): this;
  on(eventName: string, callback: (...args: any[]) => void, context?: any): this;
  on(eventName: string, callback: (...args: any[]) => void, context: any = null) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const listener = {
      callback: callback,
      context: context,
    };

    this.listeners.get(eventName)!.push(listener);

    if (this.debugMode) {
      console.log(`Event listener added: ${eventName}`);
    }

    return this;
  }

  /**
   * Add a one-time event listener
   */
  once<K extends keyof GameEventMap>(
    eventName: K,
    callback: (...args: GameEventMap[K]) => void,
    context?: any
  ): this;
  once(eventName: string, callback: (...args: any[]) => void, context?: any): this;
  once(eventName: string, callback: (...args: any[]) => void, context: any = null) {
    if (!this.oneTimeListeners.has(eventName)) {
      this.oneTimeListeners.set(eventName, []);
    }

    const listener = {
      callback: callback,
      context: context,
    };

    this.oneTimeListeners.get(eventName)!.push(listener);

    if (this.debugMode) {
      console.log(`One-time event listener added: ${eventName}`);
    }

    return this;
  }

  /**
   * Remove an event listener
   */
  off(eventName: string, callback: ((...args: any[]) => void) | null = null): this {
    if (callback) {
      // Remove specific callback
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        const index = listeners.findIndex((listener) => listener.callback === callback);
        if (index !== -1) {
          listeners.splice(index, 1);

          if (listeners.length === 0) {
            this.listeners.delete(eventName);
          }
        }
      }

      // Also check one-time listeners
      const oneTimeListeners = this.oneTimeListeners.get(eventName);
      if (oneTimeListeners) {
        const index = oneTimeListeners.findIndex((listener) => listener.callback === callback);
        if (index !== -1) {
          oneTimeListeners.splice(index, 1);

          if (oneTimeListeners.length === 0) {
            this.oneTimeListeners.delete(eventName);
          }
        }
      }
    } else {
      // Remove all listeners for this event
      this.listeners.delete(eventName);
      this.oneTimeListeners.delete(eventName);
    }

    if (this.debugMode) {
      console.log(`Event listener removed: ${eventName}`);
    }

    return this;
  }

  /**
   * Emit an event immediately
   */
  emit<K extends keyof GameEventMap>(eventName: K, ...args: GameEventMap[K]): boolean;
  emit(eventName: string, ...args: any[]): boolean;
  emit(eventName: string, ...args: any[]): boolean {
    if (this.debugMode) {
      console.log(`Event emitted: ${eventName}`, args);
    }

    let handled = false;

    // Handle regular listeners
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          if (listener.context) {
            listener.callback.apply(listener.context, args);
          } else {
            listener.callback(...args);
          }
          handled = true;
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }

    // Handle one-time listeners
    const oneTimeListeners = this.oneTimeListeners.get(eventName);
    if (oneTimeListeners) {
      // Copy array since we'll be modifying it
      const listeners = [...oneTimeListeners];
      this.oneTimeListeners.delete(eventName);

      listeners.forEach((listener) => {
        try {
          if (listener.context) {
            listener.callback.apply(listener.context, args);
          } else {
            listener.callback(...args);
          }
          handled = true;
        } catch (error) {
          console.error(`Error in one-time event listener for ${eventName}:`, error);
        }
      });
    }

    return handled;
  }

  /**
   * Queue an event for later processing
   */
  queue<K extends keyof GameEventMap>(eventName: K, ...args: GameEventMap[K]): this;
  queue(eventName: string, ...args: any[]): this;
  queue(eventName: string, ...args: any[]): this {
    if (this.eventQueue.length >= this.maxQueueSize) {
      console.warn('Event queue is full, dropping oldest event');
      this.eventQueue.shift();
    }

    this.eventQueue.push({
      eventName: eventName,
      args: args,
      timestamp: Date.now(),
    });

    if (this.debugMode) {
      console.log(`Event queued: ${eventName}`, args);
    }

    return this;
  }

  /**
   * Process all queued events
   */
  processQueue(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.emit(event.eventName, ...event.args);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.eventQueue = [];
    if (this.debugMode) {
      console.log('Event queue cleared');
    }
  }

  /**
   * Get the number of listeners for an event
   */
  getListenerCount(eventName: string): number {
    const regularCount = this.listeners.get(eventName)?.length || 0;
    const oneTimeCount = this.oneTimeListeners.get(eventName)?.length || 0;
    return regularCount + oneTimeCount;
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    const regularEvents = Array.from(this.listeners.keys());
    const oneTimeEvents = Array.from(this.oneTimeListeners.keys());
    return [...new Set([...regularEvents, ...oneTimeEvents])];
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
    this.oneTimeListeners.clear();
    this.clearQueue();

    if (this.debugMode) {
      console.log('All event listeners removed');
    }
  }

  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`Event system debug mode: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get debug information
   */
  getDebugInfo(): object {
    return {
      totalListeners: this.listeners.size,
      totalOneTimeListeners: this.oneTimeListeners.size,
      queuedEvents: this.eventQueue.length,
      isProcessing: this.isProcessing,
      eventNames: this.getEventNames(),
      debugMode: this.debugMode,
    };
  }

  /**
   * Create a namespaced event emitter
   */
  createNamespace(namespace: string): object {
    return {
      on: (eventName: string, callback: (...args: any[]) => void, context?: any) => {
        return this.on(`${namespace}:${eventName}`, callback, context);
      },
      once: (eventName: string, callback: (...args: any[]) => void, context?: any) => {
        return this.once(`${namespace}:${eventName}`, callback, context);
      },
      off: (eventName: string, callback?: (...args: any[]) => void) => {
        return this.off(`${namespace}:${eventName}`, callback || null);
      },
      emit: (eventName: string, ...args: any[]) => {
        return this.emit(`${namespace}:${eventName}`, ...args);
      },
      queue: (eventName: string, ...args: any[]) => {
        return this.queue(`${namespace}:${eventName}`, ...args);
      },
    };
  }

  /**
   * Wait for an event to occur
   */
  waitFor(eventName: string, timeout = 0): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const handler = (...args: any[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(args);
      };

      this.once(eventName, handler);

      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          this.off(eventName, handler);
          reject(new Error(`Event ${eventName} timed out after ${timeout}ms`));
        }, timeout);
      }
    });
  }

  /**
   * Chain events together
   */
  chain(events: Array<string | (() => any) | { name: string; timeout: number }>): Promise<void> {
    return events.reduce((promise, event) => {
      return promise.then(() => {
        if (typeof event === 'string') {
          return this.waitFor(event);
        } else if (typeof event === 'function') {
          return event();
        } else {
          return this.waitFor(event.name, event.timeout);
        }
      });
    }, Promise.resolve());
  }
}
