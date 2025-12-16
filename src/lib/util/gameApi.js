/**
 * Shared API utilities for game-related operations.
 */

import { goto } from '$app/navigation';
import { broadcastTabEvent } from '$lib/util/crossTabEvents.js';

/** Leaves the current game and handles cleanup. Returns { success, message, disconnectSocket, gameId }. */
export async function leaveCurrentGame(gameId = null) {
    const body = gameId ? JSON.stringify({ gameId }) : undefined;
    const res = await fetch('/api/leave-current-game', { method: 'POST', body });
    const data = await res.json();

    if (data.disconnectSocket) {
        broadcastTabEvent('leave-game', { gameId: data.gameId });
    }

    return data;
}

/** Creates a new game with the specified options. Returns { success, message, gameId, leaveGame }. */
export async function createGame({ cipherType, cipherOptionObj, options, mode }) {
    const response = await fetch('/api/create-game', {
        method: 'POST',
        body: JSON.stringify({ cipherType, cipherOptionObj, options, mode }),
        headers: { 'content-type': 'application/json' }
    });
    return response.json();
}

/** Joins an existing game by room code. Returns { success, message, gameId, leaveGame }. */
export async function joinGame(roomCode) {
    const response = await fetch('/api/join-game', {
        method: 'POST',
        body: JSON.stringify({ roomCode: roomCode.toUpperCase() }),
        headers: { 'content-type': 'application/json' }
    });
    return response.json();
}

/** Navigates to the appropriate lobby based on game mode. */
export function navigateToLobby(mode) {
    goto(mode === 'private' ? '/private-lobby' : '/public-lobby');
}
