/**
 * Broadcast a named event across tabs using localStorage.
 * @param {string} type - Event type (e.g. "leave-game", "update-settings")
 * @param {object} [payload={}] - Optional payload data
 */
export function broadcastTabEvent(type, payload = {}) {
    const key = `tabEvent:${type}`;
    const event = {
      type,
      payload,
      timestamp: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(event));
}

/**
 * Listen for one or more event types across tabs.
 * @param {string[]} eventTypes - Array of event names to listen for
 * @param {function({ type: string, payload: any }): void} callback - Handler
 * @returns {() => void} Cleanup function
 */
export function listenForTabEvents(eventTypes, callback) {
    function handler(e) {
        if (!e.key?.startsWith('tabEvent:') || !e.newValue) return;

        const eventType = e.key.substring('tabEvent:'.length);
        if (!eventTypes.includes(eventType)) return;

        try {
          const data = JSON.parse(e.newValue);
          callback(data);
          localStorage.removeItem(e.key); // Clean up
        } catch (err) {
          console.error('[CrossTabEvent] Failed to parse event:', err);
        }
    }


    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
}
