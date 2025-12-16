<script>
    import Container from "$lib/Components/General/Container.svelte";
    import Options from "$lib/Components/Game/Options.svelte";
    import { cipherTypes } from '$db/shared-utils/CipherTypes';
    import { goto } from "$app/navigation";
    import LoadingOverlay from "$lib/Components/General/LoadingOverlay.svelte";
    import { leaveCurrentGame, createGame as createGameApi, joinGame as joinGameApi } from "$lib/util/gameApi.js";
    import { GAME_MODES, DEFAULT_GAME_OPTIONS } from "$lib/util/constants.js";

    let options = $state({ ...DEFAULT_GAME_OPTIONS });
    let cipherType = $state('Aristocrat');
    let cipherOption = $state('Random');
    let cipherOptionObj = { 'K': 'Random' };
    let feedbackCreate = $state('');
    let authenticating = $state(false);
    let showLeaveGameButton = $state(false);
    let showLeaveGameButton2 = $state(false);
    let joinCode = $state('');
    let feedbackJoin = $state('');

    function changeCipherOption(option, optionObj) {
        const nOption = option[0] === "!" ? option.substring(1) : cipherTypes[cipherType]['options'][0] + option;
        cipherOption = nOption;
        cipherOptionObj = optionObj;
    }

    function changeType(type) {
        cipherType = type;
    }

    function onOptionChange(option, value) {
        options[option] = value ?? !options[option];
    }

    async function handleCreateGame() {
        try {
            authenticating = true;
            feedbackCreate = '';
            const res = await createGameApi({ cipherType, cipherOptionObj, options, mode: GAME_MODES.PRIVATE });
            authenticating = false;

            if (res.success) {
                goto(`/game/${res.gameId}`);
            } else {
                feedbackCreate = res.message;
            }
            showLeaveGameButton = !!res.leaveGame;
        } catch (error) {
            authenticating = false;
            feedbackCreate = error.toString();
        }
    }

    async function handleJoinGame() {
        try {
            authenticating = true;
            feedbackJoin = '';
            const res = await joinGameApi(joinCode);
            authenticating = false;

            if (res.success) {
                goto(`/game/${res.gameId}`);
            } else {
                feedbackJoin = res.message;
            }
            showLeaveGameButton2 = !!res.leaveGame;
        } catch (error) {
            authenticating = false;
            feedbackJoin = error.toString();
        }
    }

    async function handleLeaveGame() {
        authenticating = true;
        const data = await leaveCurrentGame();

        if (data.success) {
            const feedback = "You left your previous game. Now retry creating or joining.";
            if (showLeaveGameButton) {
                showLeaveGameButton = false;
                feedbackCreate = feedback;
            } else {
                showLeaveGameButton2 = false;
                feedbackJoin = feedback;
            }
        } else {
            if (showLeaveGameButton) {
                feedbackCreate = data.message;
            } else {
                feedbackJoin = data.message;
            }
        }
        authenticating = false;
    }
</script>

<svelte:head>
  <title>Private Lobby</title>
</svelte:head>

{#if authenticating}
    <LoadingOverlay />
{/if}

<Container style="gap: 15px; display: flex; justify-content: center; align-items: center;">
    <h2>New Private Game</h2>
    <Options options={options} onOptionChange={onOptionChange} cipherType={cipherType} multiplayer={true} cipherOption={cipherOption} changeCipherOption={changeCipherOption} changeType={changeType}/>
    <div class="button-row">
        <button class="button" onclick={handleCreateGame}>Create Game</button>

        {#if showLeaveGameButton}
            <button class="button leave-game-btn" onclick={handleLeaveGame}>Leave Current Game</button>
        {/if}
    </div>

    {#if feedbackCreate}
        <p>{feedbackCreate}</p>
    {/if}
</Container>

<Container style="gap: 15px; display: flex; flex-direction:column; justify-content: center; align-items: center;">
    <h2>Join Game</h2>
    <div class="join">
        <h4>Enter Code:</h4>
        <label class="input-container">
            <input type="text" placeholder="Room Code" bind:value={joinCode} />
        </label>

        <div class="button-row">
            <button class="button" onclick={handleJoinGame}>Join Game</button>

            {#if showLeaveGameButton2}
                <button class="button leave-game-btn" onclick={handleLeaveGame}>Leave Current Game</button>
            {/if}
        </div>
    </div>

    {#if feedbackJoin}
        <p>{feedbackJoin}</p>
    {/if}
</Container>

<style>
    .button-row {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
    }

    .join {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
    }

    .input-container {
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(218, 218, 255, 0.8);
        transition: border-color 0.2s ease;
        transition: border-width 0.5s ease;
    }

    input {
        width: 150px;
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

    @media (max-width: 600px) {
        .join {
            flex-direction: column;
            gap: 8px;
        }

        input {
            width: 100%;
        }
    }

    .leave-game-btn {
        color: var(--color-error);
    }
</style>
