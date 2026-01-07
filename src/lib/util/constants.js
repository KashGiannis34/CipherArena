export const GAME_MODES = {
    PRIVATE: 'private',
    PUBLIC: 'public',
    RANKED: 'ranked',
    SINGLEPLAYER: 'singleplayer',
    MULTIPLAYER: 'multiplayer'
};

export const GAME_STATES = {
    WAITING: 'waiting',
    STARTED: 'started',
    FINISHED: 'finished',
    DISCONNECTED: 'disconnected',
    LEAVING: 'leavingGame'
};

export const STATUS_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    ERROR: 'error'
};

/** Ciphers that benefit from the calculator tool. */
export const MATH_INTENSIVE_CIPHERS = ['Affine', 'Caesar', 'Nihilist', 'Hill'];

/** Default options for game creation. */
export const DEFAULT_GAME_OPTIONS = {
    AutoFocus: true,
    playerLimit: 2
};

/** Default options for singleplayer. */
export const DEFAULT_SINGLEPLAYER_OPTIONS = {
    AutoFocus: true,
    AutoSwitch: false
};
