<script>
    import { onDestroy, onMount } from 'svelte';
    import { io } from 'socket.io-client';
    import LoadingOverlay from '$lib/Components/General/LoadingOverlay.svelte';

    import { broadcastTabEvent } from "$lib/util/crossTabEvents";
    import Container from "$lib/Components/General/Container.svelte";
    import Options from "$lib/Components/Game/Options.svelte";
    import {cipherTypes} from '$lib/util/CipherTypes';
    import { goto } from "$app/navigation";
    import { fade } from 'svelte/transition';
    import SearchBar from '$lib/Components/General/SearchBar.svelte';

    let { data } = $props();

    let options = $state({'AutoFocus':true, 'Ranked':false, 'playerLimit': 2});
    let cipherType = $state('Aristocrat');
    let cipherOption = $state('Random');
    let cipherOptionObj = {'K':'Random'};
    let feedbackCreate = $state('');
    let showLeaveGameButton = $state(false);

    let lobbies = $state([]);
    let loading = $state(true);
    let searchValue = $state('');
    let disconnected = $state(false);
    let mounted = $state(false);
    let limit = 50;
    let socket;

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    async function fetchLobbies({ searchValue = '' } = {}) {
        if (!socket?.connected) {
            return;
        }

        const fetchPromise = new Promise((resolve) => {
            // Parse search options
            const searchTerms = {};
            const words = searchValue.split(' ');
            let currentOption = null;

            for (let i = 0; i < words.length; i++) {
                const word = words[i].trim();
                if (!word) continue;

                if (word.endsWith(':')) {
                    currentOption = word;
                } else if (currentOption) {
                    if (!searchTerms[currentOption]) {
                        searchTerms[currentOption] = [];
                    }
                    searchTerms[currentOption].push(word);
                }
            }

            const request = { searchTerms, limit };
            socket.emit('get-public-lobbies', request, (data) => {
                if (Array.isArray(data)) {
                    lobbies = data;
                } else {
                    console.error("Invalid lobbies data:", data);
                    lobbies = [];
                }
                resolve();
            });
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fetch lobbies timeout')), 5000);
        });

        try {
            await Promise.race([fetchPromise, timeoutPromise]);
        } catch (error) {
            console.error('Error fetching lobbies:', error);
            lobbies = [];
        }
    }

    const debouncedFetchLobbies = debounce(fetchLobbies, 500);

    function changeCipherOption(option, optionObj) {
        let nOption;
        if (option[0] === "!") {
            nOption = option.substring(1);
        } else {
            nOption = cipherTypes[cipherType]['options'][0] + option;
        }

        cipherOption = nOption;
        cipherOptionObj = optionObj;
    }

    function changeType(type) {
        cipherType = type;
    }

    function onOptionChange(option, value) {
        if (value) {
            options[option] = value;
        } else {
            options[option] = !options[option];
        }
    }

    async function createGame() {
        let res = null;
        try {
            loading = true;
            feedbackCreate = '';
            const response = await fetch('/api/create-game', {
                method: 'POST',
                body: JSON.stringify({cipherType, cipherOptionObj, options, mode:(options.Ranked ? "ranked": "public")}),
                headers: {
                    'content-type': 'application/json'
                }
		    });
            res = await response.json();
            loading = false;
            if (res['success']) {
                goto(`/game/${res['gameId']}`);
            } else {
                feedbackCreate = res.message;
            }

            if (res['leaveGame']) {
                showLeaveGameButton = true;
            } else {
                showLeaveGameButton = false;
            }
        } catch (error) {
            feedbackCreate = error.toString();
        }
    }

    async function leaveGame() {
        loading = true;
        const res = await fetch('/api/leave-current-game', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            loading = false;
            feedbackCreate = "You left your previous game. Now retry creating or joining.";
        } else {
            feedbackCreate = data.message;
        }

        if (data.disconnectSocket) {
            broadcastTabEvent('leave-game', { gameId: data.gameId });
        }
        showLeaveGameButton = false;
    }

    onMount(() => {
        mounted = true;
        socket = io({
            auth: {
                token: decodeURIComponent(data.authToken),
                joinLobby: true
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            disconnected = false;
            socket.once('ready', async () => {
                await fetchLobbies();
                loading = false;
            });
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            disconnected = true;
            loading = false;
        });

        socket.on('lobbies-updated', () => {
            if (!disconnected) {
                fetchLobbies({ searchValue });
            }
        });

        socket.on('disconnect', (reason) => {
            disconnected = true;
        });
    });

    onDestroy(() => {
        socket?.disconnect();
    });
</script>

{#if !mounted || loading}
    <LoadingOverlay />
{:else if disconnected}
    <div transition:fade>Disconnected.</div>
{:else}
    <div transition:fade>
        <Container style="gap: 15px; display: flex; justify-content: center; align-items: center;">
            <h2>New Public Game</h2>
            <Options options={options} onOptionChange={onOptionChange} cipherType={cipherType} multiplayer={true} cipherOption={cipherOption} changeCipherOption={changeCipherOption} changeType={changeType}/>
            <div class="button-row">
                <button class="button" onclick={createGame}>Create Game</button>

                {#if showLeaveGameButton}
                    <button class="button" onclick={leaveGame} style="color: #fa6969;">Leave Current Game</button>
                {/if}
            </div>

            {#if feedbackCreate}
                <p>{feedbackCreate}</p>
            {/if}
        </Container>
        <div class="waiting-container">
            <div class="top-bar">
                <h2 class="waiting-title">Public Lobby</h2>
                <div class="input-container">
                    <SearchBar
                        bind:value={searchValue}
                        onSearch={fetchLobbies}
                    />
                </div>
            </div>

            {#if lobbies.length === 0}
                <p style="color: white;" in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>No matching games found.</p>
            {:else}
                <div class="player-list" in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
                    {#each [...lobbies].sort((a, b) => b.usernames.includes(data.username) - a.usernames.includes(data.username)) as lobby (lobby.id)}
                        <div class="player-card {lobby.playerCount >= lobby.playerLimit ? 'full' : ''} {lobby.usernames.includes(data.username) ? 'in-game' : ''}" transition:fade>
                            <div class="player-info-wrapper">
                                <div class="player-left-group">
                                    <div class="player-name">
                                        {#if lobby.K !== '-1'}
                                            {lobby.cipherType}: {lobby.K === 'Random' ? 'Random' : `K${lobby.K}`}
                                        {:else}
                                            {lobby.cipherType}: {lobby.Solve}
                                        {/if}
                                    </div>
                                    <div class="player-elo">
                                        {lobby.mode === 'ranked' ? 'Ranked' : 'Casual'}
                                        {#if lobby?.autoFocus}
                                            <div
                                                class="autofocus-indicator"
                                                onmouseenter={() => {lobby.showTooltip = true}}
                                                onmouseleave={() => {lobby.showTooltip = false}}
                                                onkeydown={() => {}}
                                                tabindex="0"
                                                role="button"
                                            >⌨️
                                                {#if lobby.showTooltip}
                                                    <div class="tooltip" transition:fade>Auto Focus</div>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="player-elo {lobby.playerCount >= lobby.playerLimit ? 'full-text' : ''}">
                                        {lobby.playerCount}/{lobby.playerLimit} Player{lobby.playerLimit > 1 ? 's' : ''} ({lobby.usernames.join(', ')})
                                    </div>
                                </div>
                                <div class="button-row">
                                    {#if lobby.usernames.includes(data.username)}
                                        <a href={`/game-lobby/${lobby.id}`}>
                                            <button class="copy-box rejoin">Rejoin</button>
                                        </a>
                                    {:else if lobby.playerCount < lobby.playerLimit}
                                        <a href={`/game-lobby/${lobby.id}`}>
                                            <button class="copy-box">Join</button>
                                        </a>
                                    {:else}
                                        <div class="full-indicator">Full</div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
  .button-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .waiting-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0vh 2vw;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .top-bar {
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

  .waiting-title {
    font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
    color: white;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .input-container {
    width: 100%;
    max-width: 800px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 500px) {
    .top-bar {
        padding: 0 0.5rem;
        gap: 1rem;
    }

    .input-container {
        padding: 0 0.5rem;
    }
  }

  .player-list {
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .player-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 1.5rem;
    background-color: #7555ff;
    border: 1px solid #703cff;
    border-radius: 12px;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
    color: white;
    transition: transform 0.2s ease, background-color 0.2s ease;
  }

  .player-card:not(.full):hover {
    background-color: #684cff;
    transform: translateY(-2px);
  }

  .player-card.full {
    background-color: #5a4499;
    border-color: #4a3780;
    opacity: 0.8;
    cursor: not-allowed;
  }

  .player-info-wrapper {
    flex: 1;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .player-left-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .player-name {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .player-elo {
    font-size: 0.9rem;
    color: #ddd;
  }

  .player-elo.full-text {
    color: #ff9494;
  }

  .button-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .copy-box {
    background-color: #fff;
    color: #5c3cff;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }

  .copy-box:hover {
    background-color: #e5dbff;
    transform: scale(1.03);
  }

  .full-indicator {
    background-color: #ff6b6b;
    color: white;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    opacity: 0.9;
  }

  @media (max-width: 600px) {
    .player-info-wrapper {
      flex-direction: column;
      align-items: flex-start;
    }

    .button-row {
      width: 100%;
      justify-content: flex-start;
    }

    .top-bar {
      align-items: stretch;
    }
  }

  .player-card.in-game {
    background: linear-gradient(135deg, #6a11cb88, #2575fc88);
    border: 2px solid #8855ff;
    box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
    animation: pulse 2s ease-in-out infinite;
    transform-origin: center;
  }

  .player-card.in-game:hover {
    background: linear-gradient(135deg, #6a11cbcc, #2575fccc);
    transform: translateY(-2px) scale(1.02);
    animation: none;
    box-shadow: 0 8px 30px rgba(106, 17, 203, 0.6);
    border-color: #aa77ff;
  }

  .player-card.in-game .player-name {
    color: white;
    font-weight: 700;
  }

  .copy-box.rejoin {
    background: #8855ff;
    color: white;
    font-weight: 600;
    border: none;
    padding: 0.6rem 1.2rem;
  }

  .copy-box.rejoin:hover {
    background: #9966ff;
    transform: scale(1.05);
  }

  @keyframes pulse {
    0% {
        box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
        border-color: #8855ff;
    }
    50% {
        box-shadow: 0 8px 30px rgba(106, 17, 203, 0.6);
        border-color: #aa77ff;
    }
    100% {
        box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
        border-color: #8855ff;
    }
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
</style>
