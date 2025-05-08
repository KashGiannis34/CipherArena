<script>
    import { io } from 'socket.io-client';
    import { onDestroy, onMount } from 'svelte';
    import { listenForTabEvents } from '$lib/util/crossTabEvents.js';
    import { goto } from "$app/navigation";
    import "$lib/css/Button.css";
    import LoadingOverlay from '$lib/Components/General/LoadingOverlay.svelte';
    import { fade } from 'svelte/transition';

    let { data } = $props();
    let stopListening;
    let isLeaving = $state(false);
    let socket;
    let gameState = $state("idle");
    let players = $state([]);

    async function leaveGame() {
        isLeaving = true;
        try {
            const res = await fetch('/api/leave-current-game', { method: 'POST' });
            console.log('Leave response:', await res.json());
        } catch (e) {
            console.error('Leave failed:', e);
        } finally {
            socket?.emit('leave-room', data.roomID);
            socket?.disconnect();
            goto('/private-lobby');
        }
    }

    async function fetchPlayers() {
      const res = await fetch(`/api/game-players?gameId=${data.roomID}`);
      players = await res.json(); // array of { username, elo }
      console.log($state.snapshot(players));
    }


    function startGame() {
        socket?.emit('start-game', data['roomID']);
    }

    onMount(() => {

      socket = io({
        auth: {
          token: decodeURIComponent(data['authToken'])
        }
      });

      socket.on('connect', () => {
        console.log('You are connected with id', socket.id);
        gameState = "waiting";
      });

      socket.on('ready', () => {
        socket.emit('join-room', data['roomID']);
        console.log('join-room emitted');
      });

      stopListening = listenForTabEvents(['leave-game'], ({ type, payload }) => {
          if (payload.gameId === data['roomID']) {
              socket.disconnect();
              console.log('Handled leave-game from another tab');
              goto('/');
          }
      });

      socket.on('disconnect', (message) => {
          console.log('You are now disconnected from the server', message);
          socket?.emit('left-room', data['roomID']);
          gameState = "disconnected";
      });

      socket.on('players-changed', () => {
          console.log('Players changed');
          fetchPlayers();
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
    <div transition:fade>Disconnected.</div>
{:else if gameState === "waiting"}
    <div class="waiting-container">
        <div class="waiting-title">Waiting to Start Game</div>

        <div class="player-list">
          {#each players as player (player.username)}
            <div class="player-card" transition:fade>
              <div class="player-name" style={player.connected ? "color: #ffffff;" : "color: #ff5d5d;"}>
                {player.username + (!player.connected ? " (DISCONNECTED)" : "")}
              </div>
              <div class="player-elo" style={player.connected ? "color: #ffffff;" : "color: #ff5d5d;"}>
                ELO: {player.elo}
              </div>
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
    }

    .player-elo {
      font-size: 0.9rem;
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