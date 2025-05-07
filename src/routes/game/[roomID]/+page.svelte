<script>
    import { io } from 'socket.io-client';
    import { onDestroy, onMount } from 'svelte';
    import { listenForTabEvents } from '$lib/util/crossTabEvents.js';
    import { goto } from "$app/navigation";
    import "$lib/css/Button.css";
    import LoadingOverlay from '$lib/Components/General/LoadingOverlay.svelte';

    let { data } = $props();
    let stopListening;
    let isLeaving = $state(false);
    const socket = io();
    let gameState = $state("idle");
    let players = $state([]);

    async function leaveGame() {
        isLeaving = true;
        try {
            await fetch('/api/leave-current-game', { method: 'POST' });
        } catch (e) {
            console.error('Leave failed:', e);
        } finally {
            socket.disconnect();
            goto('/private-lobby');
        }
    }

    async function fetchPlayers() {
      const res = await fetch(`/api/game-players?gameId=${data.roomID}`);
      players = await res.json(); // array of { username, elo }
      console.log($state.snapshot(players));
    }


    function startGame() {
        socket.emit('start-game', data['roomID']);
    }

    socket.on('connect', (message) => {
        console.log('You are connected with id', socket.id);
        socket.emit('join-room', data['roomID']);
        console.log('Joining room', data['roomID']);
        gameState = "waiting";
    });

    socket.on('disconnect', (message) => {
        console.log('You are now disconnected from the server', message);
        gameState = "disconnected";
    });

    socket.on('players-changed', () => {
        console.log('Players changed');
        fetchPlayers();
    });

    onMount(() => {
        fetchPlayers();
        stopListening = listenForTabEvents(['leave-game'], ({ type, payload }) => {
            if (payload.gameId === data['roomID']) {
                socket.disconnect();
                console.log('Handled leave-game from another tab');
                goto('/');
            }
        });
    });

    onDestroy(() => {
        stopListening?.();
    });
</script>

{#if isLeaving}
  <LoadingOverlay />
{/if}
{#if gameState === "disconnected"}
    <div>Disconnected. You are currently accessing this game from a different window.</div>
{:else if gameState === "waiting"}
    <div class="waiting-container">
        <div class="waiting-title">Waiting to Start Game</div>

        <div class="player-list">
            {#each players as player}
            <div class="player-card">
                <div class="player-name">{player.username}</div>
                <div class="player-elo">ELO: {player.elo}</div>
            </div>
            {/each}
        </div>

        <div class="button-row">
            <button class="button start-button" onclick={startGame}>Start Game</button>
            <button class="button leave-button" onclick={leaveGame}>Leave Game</button>
        </div>
    </div>
{/if}

<style>
    .waiting-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5vw;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    .waiting-title {
      font-size: 2rem;
      text-align: center;
      margin-bottom: 2vh;
    }

    .player-list {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2vh;
    }

    .player-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap; /* allow wrapping only if needed */
        gap: 0.5rem;
        padding: 1rem;
        background-color: #7555ff;
        border: 1px solid #703cff;
        border-radius: 10px;
        box-sizing: border-box;
        box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.04);
        overflow-wrap: anywhere;
    }


    .player-name {
      font-weight: 500;
      font-size: 1rem;
      color: #ffffff;
    }

    .player-elo {
      font-size: 0.9rem;
      color: #f2e6ff;
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }

    .button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      white-space: nowrap;
    }

    .start-button {
      color: white;
    }

    .leave-button {
      color: white;
    }

    /* Responsive text & spacing */
    @media (max-width: 600px) {
      .waiting-title {
        font-size: 1.5rem;
      }

      .button {
        width: 100%;
        text-align: center;
      }

      .button-row {
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        max-width: 400px;
      }
    }
</style>