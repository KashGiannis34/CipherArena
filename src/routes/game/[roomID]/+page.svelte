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
  import ProfilePicture from '$lib/Components/General/ProfilePicture.svelte';
  import ProgressDisplay from '$lib/Components/Game/ProgressDisplay.svelte';
  import { PUBLIC_APP_URL } from '$env/static/public';
  import Confetti from 'svelte-confetti';

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

  let forfeitVoters = $state([]);
  let hasForfeited = $derived.by(() => forfeitVoters.includes(data.username));

  let historicalPlayers = $state([]); // Includes all players, even ones who left
  let progressMap = $state({}); // { [username]: percentageFilled }

  let statusMessage = $state(null);
  let statusType = $state('info'); // 'info', 'error', 'success'
  let messageTimer;

  function showStatus(msg, type = 'info', duration = 3000) {
    statusMessage = msg;
    statusType = type;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      statusMessage = null;
    }, duration);
  }

  function checkQuote(quote, hash, cipherType, keys, solve) {
    return new Promise((resolve) => {
      socket.emit('check-quote', quote, hash, cipherType, keys, solve, result => {
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
        const res = await fetch('/api/leave-current-game', { method: 'POST', body: JSON.stringify({ gameId: data.roomID }) });
      } catch (e) {
        showStatus('Leave game failed.', 'error');
      } finally {
        socket?.emit('leave-room');
        socket?.disconnect();
        if (data.mode == 'private') {
          goto('/private-lobby');
        } else {
          goto('/public-lobby');
        }
      }
  }

  function requestForfeit() {
    socket.emit('forfeit-request', !hasForfeited);
  }

  async function fetchPlayers() {
    const res = await fetch(`/api/game-players?gameId=${data.roomID}`);
    players = await res.json(); // array of { username, elo }

    if (gameState === 'started') {
      historicalPlayers = mergePlayerStatus(historicalPlayers, players);
    }
    if (gameState === 'finished' && matchResult.players) {
      const assignedPlayers = new Map(players.map(p => [p.username, p]));
      const basePlayers = new Map(historicalPlayers.map(p => [p.username, p]));

      matchResult.players = matchResult.players.map(p => {
        const latest = basePlayers.get(p.username);
        const current = assignedPlayers.get(p.username);
        return {
          ...p,
          profilePicture: p.profilePicture ?? current?.profilePicture,
          connected: current?.connected ?? false,
          left: !current // if not in `players`, they left
        };
      });
    }
  }

  function mergePlayerStatus(initial, current) {
    const currentMap = new Map(current.map(p => [p.username, p]));
    return initial.map(p => {
      const currentInfo = currentMap.get(p.username);
      return {
        ...p,
        connected: currentInfo?.connected ?? false,
        left: currentInfo ? currentInfo.left ?? false : true
      };
    });
  }

  function startGame() {
      socket?.emit('start-game');
  }

  function handleProgressUpdate(percent) {
    if (socket) {
      socket.emit('progress-update', {
        username: data.username,
        progress: percent
      });
    }
  }

  onMount(() => {

    socket = io(PUBLIC_APP_URL, {
      auth: {
        token: decodeURIComponent(data['authToken']),
        joinLobby: false
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      showStatus('Connected to server', 'success');
    });

    socket.on('connect_error', () => {
      showStatus('Connection failed. Try again.', 'error');
      gameState = "disconnected";
    });

    socket.on('error', (error) => {
      showStatus(error, 'error');
    })

    socket.on('ready', (val) => {
      socket.emit('join-room');
      if (val) {
        gameState = val;
      }
      if (gameState == 'started') {
        socket.emit('get-cipher-info', info => {
          cipherData.params = info.params;
          cipherData.autoFocus = info.autoFocus;
          cipherData.quote = info.quote;
          cipherRetrieved = true;
        })

        socket.emit('get-initial-players', (initialPlayers) => {
          historicalPlayers = initialPlayers;
          fetchPlayers(); // ✅ Then fetch current players and merge
        });
      }
      if (gameState === 'finished') {
        socket.emit('get-match-result', result => {
          if (result) {
            matchResult = {
              won: result.winner === data.username,
              winner: result.winner,
              players: result.players,
              ranked: !!result.eloChanges,
              eloChanges: result.eloChanges ?? {},
              solveTime: result.solveTime,
              plainText: result.plainText,
              forfeit: result.forfeit,
            };
            resultRetrieved = true;
          }
        });
      }
    });

    stopListening = listenForTabEvents(['leave-game'], ({ type, payload }) => {
        if (payload.gameId === data['roomID']) {
            socket.disconnect();
            goto('/');
        }
    });

    socket.on('disconnect', (message) => {
        socket?.emit('left-room');
        gameState = "disconnected";
    });

    socket.on('players-changed', () => {
        fetchPlayers();
    });

    socket.on('forfeit-votes', (votes) => {
      forfeitVoters = votes;
    });

    socket.on('kicked', () => {
      alert('You have been kicked from the game.');
      if (data.mode === 'public') {
        goto('/public-lobby');
      } else {
        goto('/private-lobby');
      }
    });

    socket.on('replaced', () => {
      alert('You account has joined a game from a different tab.');
      goto('/private-lobby');
    });

    socket.on('start-game', (params, autoFocus, quote) => {
      cipherData.params = params;
      cipherData.autoFocus = autoFocus;
      cipherData.quote = quote;
      gameState = "started";
      socket.emit('get-initial-players', (initialPlayers) => {
        historicalPlayers = initialPlayers;
      });
      progressMap = {};
      cipherRetrieved = true;
    });

    socket.on('progress-map-update', ({ username, progress }) => {
      progressMap = {
          ...progressMap,
          [username]: progress
      };
    });

    socket.on('cipher-solved', (result) => {
      matchResult = {
        ...result,
        won: result.winner === data.username,
        ranked: !!result.eloChanges,
      };
      fetchPlayers();
      gameState = "finished";
      resultRetrieved = true;
    });

    socket.on('rematch-votes', (votes) => {
      rematchVoters = votes;
    });

  });

  onDestroy(() => {
    socket?.disconnect();
    stopListening?.();
  });
</script>

<svelte:head>
  <title>Game</title>
</svelte:head>

{#if statusMessage}
  <div class="status-bar {statusType}" transition:fade>
    {statusMessage}
  </div>
{/if}

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

      <div class="game-settings-pill">
        <div class="game-title">
          {#if data.K !== '-1'}
            {data.cipherType}: {data.K === 'Random' ? 'Random' : `K${data.K}`}
          {:else}
            {data.cipherType}: {data.Solve}
          {/if}
        </div>
        <div class="game-subtext">
          {data.mode === 'ranked' ? 'Ranked' : 'Casual'}
          {#if data.autoFocus}
            <div
                class="autofocus-indicator"
                onmouseenter={() => {
                    tooltipVisible = 'autofocus';
                    tooltipText = 'Auto Focus';
                }}
                onmouseleave={() => tooltipVisible = null}
                onkeydown={() => {}}
                tabindex="0"
                role="button"
            >
              ⌨️
              {#if tooltipVisible === 'autofocus'}
                  <div class="tooltip" transition:fade>
                      {tooltipText}
                  </div>
              {/if}
            </div>
          {/if}
        </div>
        <div class="game-subtext">
          Players: {players.length}/{data.playerLimit}
        </div>
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
          <div class="player-info-wrapper">
            <div class="player-left-group">
              <ProfilePicture profilePicture={player.profilePicture} size={40} useColorRing={player.username == data.username} preserveSize={true}/>
              <div class="player-name" style={(player.connected ? "color: #ffffff;" : "color: #ff7d7d;") + (player.username === data.username ? " font-weight: 700;" : "font-weight: 200;")}>
                <a href={`/profile/${player.username}`} target="_blank" rel="noopener noreferrer" class="profile-link">
                  {player.username}
                </a>
                {(!player.connected ? " (DISCONNECTED)" : "") + (player.host ? " (HOST)" : "")}
              </div>
            </div>
            <div class="player-elo" style={(player.connected ? "color: #ffffff;" : "color: #ff7d7d;") + (player.username === data.username ? " font-weight: 700;" : "font-weight: 200;")}>
              ELO: {player.elo}
            </div>
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
    <ProgressDisplay username={data.username} players={historicalPlayers} progressMap={progressMap} forfeitVoters={forfeitVoters}/>

    <Cipher
      quote={cipherData.quote.encodedText}
      hash={cipherData.quote.id}
      cipherType={cipherData.params.cipherType}
      autoFocus={cipherData.autoFocus}
      params={cipherData.params}
      keys={cipherData.quote.keys}
      mode="multiplayer"
      fetchAnswerStatus={checkQuote}
      onProgressUpdate={handleProgressUpdate}
    />

    <div class="in-game-button-row">
      <button class="button leave-button leave-button-game-start" onclick={leaveGame}>
        Leave Game
      </button>
      <button
        class="button forfeit-button"
        onclick={requestForfeit}
      >
        {hasForfeited ? 'Undo Forfeit' : 'Give Up'}
      </button>
    </div>
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
      username={data.username}
      solveTime={matchResult.solveTime}
      plainText={matchResult.plainText}
      forfeit={matchResult.forfeit}
    />

    {#if matchResult.won}
        <div style="
        position: fixed;
        z-index: 25;
        top: -3vh;
        left: 0;
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
        overflow: hidden;
        pointer-events: none;">
            <Confetti duration=3000 x={[-5, 5]} delay={[0, 3000]} amount=200 fallDistance="100vh" colorRange={[75, 175]}/>
        </div>
    {/if}
  {/if}
{:else}
  <LoadingOverlay />
{/if}

<style>
  .in-game-button-row {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .forfeit-button {
    background-color: #ff5c5c;
    color: white;
  }

  .forfeit-button:hover {
    background-color: #e64444;
  }

  .status-bar {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    z-index: 2000;
    max-width: 90vw;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    text-align: center;
    color: white;
    opacity: 0.95;
  }

  .status-bar.info {
    background: #555;
  }

  .status-bar.success {
    background: #28c76f;
  }

  .status-bar.error {
    background: #ea5455;
  }

  .profile-link {
		color: #fff;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.profile-link:hover {
		color: #4e9aff;
		text-decoration: underline;
	}

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
    justify-content: flex-start;
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

  @media (max-width: 900px) {
    .top-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .copy-box {
      width: 100%;
      text-align: center;
    }

    .game-settings-pill {
      width: 100%;
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
    margin-right: -4rem;
    opacity: 0;
    transform: translateX(-2rem);
    position: relative;
    transition: opacity 0.25s ease, transform 0.25s ease;
    cursor: pointer;
    padding: 1.5rem;
    z-index: 1;
  }

  .player-card:hover .kick-left-wrapper {
    opacity: 1;
    transform: translateX(-1rem);
  }

  .kick-left-icon {
    font-size: 1.5rem;
    color: #ff3c3c;
    cursor: pointer;
    user-select: none;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
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
    font-weight: 500;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-info-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    transition: transform 0.2s ease;
    will-change: transform;
  }

  .player-left-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease;
  }

  .player-name {
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-card:hover .kick-left-wrapper ~ .player-info-wrapper .player-left-group {
    transform: translateX(2rem);
  }

  .player-elo {
    font-size: 0.9em;
    color: white;
    white-space: nowrap;
  }

  .game-settings-pill {
    background-color: #7555ff;
    border: 1px solid #703cff;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    text-align: center;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  }

  .game-title {
    font-size: clamp(0.9rem, 1vw + 0.3rem, 1.1rem);
    margin-bottom: 0.25rem;
  }

  .game-subtext {
    font-size: 0.9rem;
    color: #eee;
  }

  .top-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .autofocus-indicator {
    display: inline-flex;
    align-items: center;
    margin-left: 3px;
    font-size: 0.9em;
    cursor: help;
    opacity: 0.9;
    transition: opacity 0.2s ease;
    position: relative;
    transform: translateY(-3px);
    line-height: 1;
    vertical-align: middle;
  }

  .autofocus-indicator:hover {
    opacity: 1;
  }
</style>