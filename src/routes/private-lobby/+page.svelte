<script>
    import Container from "$lib/Components/General/Container.svelte";
    import Options from "$lib/Components/Game/Options.svelte";
    import {cipherTypes} from '$db/shared-utils/CipherTypes';
    import { goto } from "$app/navigation";
    import { broadcastTabEvent } from "$lib/util/crossTabEvents";
    import LoadingOverlay from "$lib/Components/General/LoadingOverlay.svelte";

    let options = $state({'AutoFocus':true, 'playerLimit': 2});
    let cipherType = $state('Aristocrat');
    let cipherOption = $state('Random');
    let cipherOptionObj = {'K':'Random'};
    let feedbackCreate = $state('');
    let authenticating = $state(false);
    let showLeaveGameButton = $state(false);
    let showLeaveGameButton2 = $state(false);
    let joinCode = $state('');
    let feedbackJoin = $state('');


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
            authenticating = true;
            feedbackCreate = '';
            const response = await fetch('/api/create-game', {
                method: 'POST',
                body: JSON.stringify({cipherType, cipherOptionObj, options, mode:"private"}),
                headers: {
                    'content-type': 'application/json'
                }
		    });
            res = await response.json();
            authenticating = false;
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

    async function joinGame() {
        let res = null;
        try {
            authenticating = true;
            feedbackJoin = '';
            const response = await fetch('/api/join-game', {
                method: 'POST',
                body: JSON.stringify({ roomCode: joinCode.toUpperCase() }),
                headers: {
                    'content-type': 'application/json'
                }
            });

            res = await response.json();
            authenticating = false;

            if (res.success) {
                goto(`/game/${res.gameId}`);
            } else {
                feedbackJoin = res.message;
            }

            if (res['leaveGame']) {
                showLeaveGameButton2 = true;
            } else {
                showLeaveGameButton2 = false;
            }
        } catch (error) {
            authenticating = false;
            feedbackJoin = error.toString();
        }
    }

    async function leaveGame() {
        authenticating = true;
        const res = await fetch('/api/leave-current-game', { method: 'POST'});
        const data = await res.json();

        if (data.success) {
            if (showLeaveGameButton) {
                showLeaveGameButton = false;
                feedbackCreate = "You left your previous game. Now retry creating or joining.";
            } else {
                showLeaveGameButton2 = false;
                feedbackJoin = "You left your previous game. Now retry creating or joining.";
            }

        } else {
            if (showLeaveGameButton) {
                feedbackCreate = data.message;
            } else {
                feedbackJoin = data.message;
            }
        }

        if (data.disconnectSocket) {
            broadcastTabEvent('leave-game', { gameId: data.gameId });
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
        <button class="button" onclick={createGame}>Create Game</button>

        {#if showLeaveGameButton}
            <button class="button" onclick={leaveGame} style="color: #fa6969;">Leave Current Game</button>
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
            <button class="button" onclick={joinGame}>Join Game</button>

            {#if showLeaveGameButton2}
                <button class="button" onclick={leaveGame} style="color: #fa6969;">Leave Current Game</button>
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
</style>
