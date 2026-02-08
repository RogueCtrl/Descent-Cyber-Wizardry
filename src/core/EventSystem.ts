/**
 * Event System
 * Manages event-driven communication between game components
 */
export class EventSystem {
    listeners: Map<any, any>;
    oneTimeListeners: Map<any, any>;
    eventQueue: any[];
    isProcessing: boolean;
    maxQueueSize: number;
    debugMode: boolean;

    static _instance: EventSystem | null = null;

    static getInstance() {
        if (!EventSystem._instance) {
            EventSystem._instance = new EventSystem();
        }
        return EventSystem._instance;
    }

    static setInstance(instance) {
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
    on(eventName, callback, context = null) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        const listener = {
            callback: callback,
            context: context
        };

        this.listeners.get(eventName).push(listener);

        if (this.debugMode) {
            console.log(`Event listener added: ${eventName}`);
        }

        return this;
    }

    /**
     * Add a one-time event listener
     */
    once(eventName, callback, context = null) {
        if (!this.oneTimeListeners.has(eventName)) {
            this.oneTimeListeners.set(eventName, []);
        }

        const listener = {
            callback: callback,
            context: context
        };

        this.oneTimeListeners.get(eventName).push(listener);

        if (this.debugMode) {
            console.log(`One-time event listener added: ${eventName}`);
        }

        return this;
    }

    /**
     * Remove an event listener
     */
    off(eventName, callback: ((...args: any[]) => void) | null = null) {
        if (callback) {
            // Remove specific callback
            const listeners = this.listeners.get(eventName);
            if (listeners) {
                const index = listeners.findIndex(listener => listener.callback === callback);
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
                const index = oneTimeListeners.findIndex(listener => listener.callback === callback);
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
    emit(eventName, ...args) {
        if (this.debugMode) {
            console.log(`Event emitted: ${eventName}`, args);
        }

        let handled = false;

        // Handle regular listeners
        const listeners = this.listeners.get(eventName);
        if (listeners) {
            listeners.forEach(listener => {
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

            listeners.forEach(listener => {
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
    queue(eventName, ...args) {
        if (this.eventQueue.length >= this.maxQueueSize) {
            console.warn('Event queue is full, dropping oldest event');
            this.eventQueue.shift();
        }

        this.eventQueue.push({
            eventName: eventName,
            args: args,
            timestamp: Date.now()
        });

        if (this.debugMode) {
            console.log(`Event queued: ${eventName}`, args);
        }

        return this;
    }

    /**
     * Process all queued events
     */
    processQueue() {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            this.emit(event.eventName, ...event.args);
        }

        this.isProcessing = false;
    }

    /**
     * Clear all queued events
     */
    clearQueue() {
        this.eventQueue = [];
        if (this.debugMode) {
            console.log('Event queue cleared');
        }
    }

    /**
     * Get the number of listeners for an event
     */
    getListenerCount(eventName) {
        const regularCount = this.listeners.get(eventName)?.length || 0;
        const oneTimeCount = this.oneTimeListeners.get(eventName)?.length || 0;
        return regularCount + oneTimeCount;
    }

    /**
     * Get all registered event names
     */
    getEventNames() {
        const regularEvents = Array.from(this.listeners.keys());
        const oneTimeEvents = Array.from(this.oneTimeListeners.keys());
        return [...new Set([...regularEvents, ...oneTimeEvents])];
    }

    /**
     * Remove all listeners
     */
    removeAllListeners() {
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
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`Event system debug mode: ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            totalListeners: this.listeners.size,
            totalOneTimeListeners: this.oneTimeListeners.size,
            queuedEvents: this.eventQueue.length,
            isProcessing: this.isProcessing,
            eventNames: this.getEventNames(),
            debugMode: this.debugMode
        };
    }

    /**
     * Create a namespaced event emitter
     */
    createNamespace(namespace) {
        return {
            on: (eventName, callback, context) => {
                return this.on(`${namespace}:${eventName}`, callback, context);
            },
            once: (eventName, callback, context) => {
                return this.once(`${namespace}:${eventName}`, callback, context);
            },
            off: (eventName, callback) => {
                return this.off(`${namespace}:${eventName}`, callback);
            },
            emit: (eventName, ...args) => {
                return this.emit(`${namespace}:${eventName}`, ...args);
            },
            queue: (eventName, ...args) => {
                return this.queue(`${namespace}:${eventName}`, ...args);
            }
        };
    }

    /**
     * Wait for an event to occur
     */
    waitFor(eventName, timeout = 0) {
        return new Promise((resolve, reject) => {
            let timeoutId: any = null;

            const handler = (...args) => {
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
    chain(events) {
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