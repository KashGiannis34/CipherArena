<script>
    import { io } from 'socket.io-client';
    import { onDestroy, onMount } from 'svelte';
    import { listenForTabEvents } from '$lib/util/crossTabEvents.js';
    import { goto } from "$app/navigation";
    import "$lib/css/Button.css";
    import LoadingOverlay from '$lib/Components/General/LoadingOverlay.svelte';
    import { fade } from 'svelte/transition';
    import Cipher from '$lib/Components/Game/Cipher.svelte';
    import CipherModal from '$lib/Components/Game/CipherModal.svelte';

    let { data } = $props();
    let stopListening;
    let socket;
    let gameState = $state(data.state);
    let cipherRetrieved = $state(false);
    let resultRetrieved = $state(false);
    let players = $state([]);
    let tooltipVisible = $state(null); // 'link' or 'code'
    let tooltipText = $state('');
    let tooltipTimer;
    let isHost = $derived.by(() => {
      return players.some(player => player.username === data.username && player.host);
    });
    let cipherData = $state({});
    let matchResult = $state({});
    let rematchVoters = $state([]);

    function checkQuote(quote, hash, cipherType, keys, solve, startTime) {
      return new Promise((resolve) => {
        socket.emit('check-quote', data.roomID, quote, hash, cipherType, keys, solve, startTime, result => {
          resolve({ solved: result });
        });
      });
    }

    function kickPlayer(username) {
      if (confirm(`Are you sure you want to kick ${username}?`)) {
        socket.emit('kick-player', { username });
      }
    }

    function showTooltip(type, text) {
      tooltipVisible = type;
      tooltipText = text;
      clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(() => {
        tooltipVisible = null;
      }, 2000);
    }

    function requestRematch() {
      socket.emit('rematch-request');
    }

    function copyGameLink() {
      const link = `${window.location.origin}/game-lobby/${data.roomID}`;
      navigator.clipboard.writeText(link).then(() => {
        showTooltip('link', 'Link copied!');
      });
    }

    function copyRoomCode() {
      navigator.clipboard.writeText(data.roomID).then(() => {
        showTooltip('code', 'Room code copied!');
      });
    }

    async function leaveGame() {
        gameState = "leavingGame";
        try {
            const res = await fetch('/api/leave-current-game', { method: 'POST' });
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

      if (gameState === 'finished' && matchResult.players) {
        const activeMap = new Map(players.map(p => [p.username, p]));

        // Enrich matchResult.players with updated status or mark as left
        matchResult = {
          ...matchResult,
          players: matchResult.players.map(p => {
            const active = activeMap.get(p.username);
            return {
              ...p,
              connected: active?.connected ?? false,
              left: active ? false : true
            };
          })
        };
      }
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
      });

      socket.on('ready', () => {
        socket.emit('join-room', data['roomID']);
        console.log('Current game state: ', $state.snapshot(gameState));
        if (gameState == 'started') {
          socket.emit('get-cipher-info', info => {
            cipherData.params = info.params;
            cipherData.autoFocus = info.autoFocus;
            cipherData.quote = info.quote;
            cipherRetrieved = true;
          })
        }
        if (gameState === 'finished') {
          socket.emit('get-match-result', result => {
            if (result) {
              matchResult = {
                won: result.winner === data.username,
                winner: result.winner,
                players: result.players,
                ranked: !!result.eloChanges,
                eloChanges: result.eloChanges ?? {}
              };
              resultRetrieved = true;
            }
          });
        }
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

      socket.on('kicked', () => {
        alert('You have been kicked from the game.');
        goto('/private-lobby');
      });

      socket.on('replaced', () => {
        alert('You account has joined a game from a different tab.');
        goto('/private-lobby');
      });

      socket.on('start-game', (params, autoFocus, quote) => {
        console.log('Game started');
        cipherData.params = params;
        cipherData.autoFocus = autoFocus;
        cipherData.quote = quote;
        gameState = "started";
        cipherRetrieved = true;
      });

      socket.on('cipher-solved', ({ winner, eloChanges }) => {
        matchResult = {
          won: winner === data.username,
          winner: winner,
          players: [...players],
          ranked: !!eloChanges, // only show ranked UI if Elo changes exist
          eloChanges: eloChanges ?? {}
        };
        gameState = "finished";
        resultRetrieved = true;
      });

      socket.on('rematch-votes', (votes) => {
        rematchVoters = votes;
      });

    });

    onDestroy(() => {
        stopListening?.();
    });
</script>

{#if gameState === "disconnected"}
  <div transition:fade>Disconnected.</div>
{:else if gameState === "leavingGame"}
  <LoadingOverlay />
{:else if gameState === "waiting"}
  <div class="waiting-container">
    <div class="top-bar">
      <div
        class="copy-box"
        onclick={copyGameLink}
        onmouseenter={() => {
          tooltipVisible = 'link';
          tooltipText = 'Copy link to share';
        }}
        onmouseleave={() => tooltipVisible = null}
        onkeydown={() => {}}
        tabindex=0
        role="button"
      >
        🔗 Copy Game Link
        {#if tooltipVisible === 'link'}
          <div class="tooltip" transition:fade>
            {tooltipText || 'Copy link to share'}
          </div>
        {/if}
      </div>

      <div
        class="copy-box"
        onclick={copyRoomCode}
        onmouseenter={() => {
          tooltipVisible = 'code';
          tooltipText = 'Click to copy';
        }}
        onmouseleave={() => tooltipVisible = null}
        onkeydown={() => {}}
        tabindex=0
        role="button"
      >
        📋 Room Code: {data.roomID}
        {#if tooltipVisible === 'code'}
          <div class="tooltip" transition:fade>
            {tooltipText || 'Click to copy'}
          </div>
        {/if}
      </div>
    </div>

    <div class="waiting-title">Waiting to Start Game</div>

    <div class="player-list">
      {#each players as player (player.username)}
        <div class="player-card" transition:fade>
          {#if isHost && player.username !== data.username}
            <div class="kick-left-wrapper" onclick={() => kickPlayer(player.username)} tabindex=0 role="button" onkeydown={() => {}}>
              <div class="kick-left-icon">✖</div>
              <div class="kick-left-tooltip">Kick Player</div>
            </div>
          {/if}
          <div class="player-name" style={(player.connected ? "color: #ffffff;" : "color: #ff7d7d;") + (player.username === data.username ? " font-weight: 700;" : "font-weight: 200;")}>
            {player.username + (!player.connected ? " (DISCONNECTED)" : "") + (player.host ? " (HOST)" : "")}
          </div>
          <div class="player-elo" style={(player.connected ? "color: #ffffff;" : "color: #ff7d7d;") + (player.username === data.username ? " font-weight: 700;" : "font-weight: 200;")}>
            ELO: {player.elo}
          </div>
        </div>
      {/each}
    </div>

    <div class="button-row">
      {#if isHost}
        <button class="button start-button" onclick={startGame}>Start Game</button>
      {/if}
        <button class="button leave-button" onclick={leaveGame}>Leave Game</button>
    </div>
  </div>
{:else if gameState === "started" && cipherRetrieved}
  <div transition:fade>
    <Cipher
      quote={cipherData.quote.encodedText}
      hash={cipherData.quote.id}
      cipherType={cipherData.params.cipherType}
      autoFocus={cipherData.autoFocus}
      params={cipherData.params}
      keys={cipherData.quote.keys}
      mode="multiplayer"
      fetchAnswerStatus={checkQuote}
    />

    <button class="button leave-button leave-button-game-start" onclick={leaveGame}>Leave Game</button>
  </div>
{:else if gameState === "finished"}
  {#if matchResult.players}
    <CipherModal
      won={matchResult.won}
      winnerUsername={matchResult.winner}
      players={matchResult.players}
      ranked={matchResult.ranked}
      eloChanges={matchResult.eloChanges}
      onRematch={requestRematch}
      onLeaveGame={leaveGame}
      rematchVoters={rematchVoters}
    />
  {/if}
{:else}
  <LoadingOverlay />
{/if}

<style>
  .waiting-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4vh 4vw;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .top-bar,
  .player-list,
  .button-row {
    width: 100%;
    max-width: 1100px;
    padding: 0 2vw;
    box-sizing: border-box;
  }

  .waiting-title {
    font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
    text-align: center;
    margin: 2vh 0;
    width: 100%;
    max-width: 1100px;
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2vh;
  }

  .player-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background-color: #7555ff;
    border: 1px solid #703cff;
    border-radius: 12px;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.04);
    position: relative;
    transition: all 0.2s ease;
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin-top: 2vh;
  }

  .button {
    padding: 0.75rem 1.5rem;
    font-size: clamp(1rem, 1vw + 0.5rem, 1.3rem);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
  }

  .start-button,
  .leave-button {
    color: white;
  }

  .leave-button-game-start {
    display: block; /* Ensure it's a block element */
    margin: 0 auto; /* Center it */
  }

  .copy-box {
    position: relative;
    cursor: pointer;
    padding: 0.5rem 1rem;
    background-color: #7555ff;
    border: 1px solid #703cff;
    color: #ffffff;
    border-radius: 8px;
    font-weight: 500;
    transition: background-color 0.2s ease;
    user-select: none;
    font-size: clamp(0.9rem, 1vw + 0.3rem, 1.1rem);
  }

  .copy-box:hover {
    background-color: #7455ff8f;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    background-color: #333;
    color: #fff;
    font-size: 0.8rem;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 10;
    opacity: 0.95;
    pointer-events: none;
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #333 transparent;
  }

  @media (max-width: 900px) {
    .top-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .copy-box {
      width: 100%;
      text-align: center;
    }

    .tooltip {
      font-size: 0.75rem;
    }

    .button-row {
      flex-direction: column;
      max-width: 500px;
    }
  }

  .kick-left-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: -2rem;
    opacity: 0;
    transform: translateX(-2rem);
    position: relative;
    transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  }

  .player-card:hover .kick-left-wrapper {
    opacity: 1;
    transform: translateX(0);
  }

  .kick-left-icon {
    font-size: 1.5rem;
    color: #ff3c3c;
    cursor: pointer;
    user-select: none;
  }

  .kick-left-icon:hover {
    color: #e60000;
  }

  .kick-left-tooltip {
    visibility: hidden;
    opacity: 0;
    background-color: #333;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    position: absolute;
    top: -30%;
    transform: translateY(-50%);
    white-space: nowrap;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 10;
  }

  .kick-left-wrapper:hover .kick-left-tooltip {
    visibility: visible;
    opacity: 0.95;
  }

  .player-name {
    flex: 1;
    font-weight: 500;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: margin-left 0.2s ease;
  }

  .player-card:hover .kick-left-wrapper ~ .player-name {
    margin-left: 2rem; /* nudge it over when X appears */
  }

  .player-elo {
    font-size: 0.9em;
    color: white;
    white-space: nowrap;
  }
</style>