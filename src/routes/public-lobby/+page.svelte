<script>
    import { onMount } from 'svelte';
    import { io } from 'socket.io-client';
    import LoadingOverlay from '$lib/Components/General/LoadingOverlay.svelte';

    import { broadcastTabEvent } from "$lib/util/crossTabEvents";
    import Container from "$lib/Components/General/Container.svelte";
    import Options from "$lib/Components/Game/Options.svelte";
    import {cipherTypes} from '$lib/util/CipherTypes';
    import { goto } from "$app/navigation";
    import { fade } from 'svelte/transition';

    let { data } = $props();

    let options = $state({'AutoFocus':true, 'Ranked':false});
    let cipherType = $state('Aristocrat');
    let cipherOption = $state('Random');
    let cipherOptionObj = {'K':'Random'};
    let feedbackCreate = $state('');
    let showLeaveGameButton = $state(false);

    let lobbies = $state([]);
    let loading = $state(true);
    let search = $state('');
    let disconnected = $state(false);
    let limit = 50;
    let socket;
    let fetchInterval;

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    async function fetchLobbies() {
        socket.emit('get-public-lobbies', { search, limit }, async (data) => {
            lobbies = data;
            console.log("Lobbies: ", data);
        });
    }

    const debouncedFetchLobbies = debounce(fetchLobbies, 500);

    function changeCipherOption(option, optionObj) {
        console.log("optionObj", $state.snapshot(optionObj));
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

    function onOptionChange(option) {
        options[option] = !options[option];
    }

    async function createGame() {
        let res = null;
        try {
            loading = true;
            feedbackCreate = '';
            const response = await fetch('/api/create-game', {
                method: 'POST',
                body: JSON.stringify({cipherType, cipherOptionObj, AutoFocus: options.AutoFocus, mode:(options.Ranked ? "ranked": "public")}),
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
        socket = io({
            auth: {
                token: decodeURIComponent(data.authToken),
                joinLobby: true
            },
        });

        fetchLobbies();
        socket.on('lobbies-updated', () => {
            debouncedFetchLobbies();
        });

        socket.on('disconnect', (message) => {
            disconnected = true;
            console.log("Disconnected: ", message);
        });
        loading = false;
    });
</script>

{#if loading}
    <LoadingOverlay/>
{/if}

{#if disconnected}
    <div transition:fade>Disconnected.</div>
{:else}
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
        <input
            type="text"
            placeholder="Search by cipher, username, or 'ranked'"
            bind:value={search}
            oninput={debouncedFetch}
        />
        </div>
    </div>

    {#if lobbies.length === 0}
        <p style="color: white;" in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>No matching lobbies found.</p>
    {:else}
        <div class="player-list" in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
            {#each lobbies as lobby (lobby.id)}
                <div class="player-card" transition:fade>
                    <div class="player-info-wrapper">
                        <div class="player-left-group">
                            <div class="player-name">{lobby.cipherType}</div>
                            <div class="player-elo">
                                {lobby.mode === 'ranked' ? 'Ranked' : 'Casual'}
                            </div>
                            <div class="player-elo">
                                {lobby.playerCount} Player{lobby.playerCount > 1 ? 's' : ''} ({lobby.usernames.join(', ')})
                            </div>
                        </div>
                        <div class="button-row">
                            <a href={`/game-lobby/${lobby.id}`}>
                                <button class="copy-box">Join</button>
                            </a>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
    </div>
{/if}

<style>
  .button-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap; /* optional: allows stacking on small screens */
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
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
  }

  .waiting-title {
    font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
    color: white;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .input-container {
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(218, 218, 255, 0.8);
    transition: border-color 0.2s ease;
    transition: border-width 0.5s ease;
  }

  input {
    width: 500px;
    border: none;
    background: transparent;
    color: white;
    padding: 8px 0;
    font-size: 16px;
    outline: none;
  }

  input::placeholder {
    color: rgba(235, 219, 255, 0.538);
  }

  .input-container:focus-within {
    border-width: 5px;
    border-color: rgb(179, 179, 255);
  }

  @media (max-width: 500px) {
    input {
        width: 100%;
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

  .player-card:hover {
    background-color: #684cff;
    transform: translateY(-2px);
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
</style>
