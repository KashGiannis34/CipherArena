/** Creates a debounced version of a function that delays execution until after `delay` ms of inactivity. */
export function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

/** Displays a temporary status message with auto-dismiss. Returns cleanup function. */
export function createStatusManager() {
    let messageTimer;

    return {
        show(setMessage, setType, msg, type = 'info', duration = 3000) {
            setMessage(msg);
            setType(type);
            clearTimeout(messageTimer);
            messageTimer = setTimeout(() => {
                setMessage(null);
            }, duration);
        },
        clear() {
            clearTimeout(messageTimer);
        }
    };
}

/** Formats seconds into MM:SS display string. */
export function formatTime(seconds) {
    const rounded = Math.round(seconds);
    const mins = Math.floor(rounded / 60);
    const secs = rounded % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
