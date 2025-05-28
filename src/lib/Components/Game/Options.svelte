<script>
    import Cipherdown from "../General/Cipherdown.svelte";
    import { Button, ButtonGroup, DropdownItem } from "@sveltestrap/sveltestrap";
    import {cipherTypes} from '$lib/util/CipherTypes';

    let {options, onOptionChange, cipherType, multiplayer=false, cipherOption, changeCipherOption, changeType} = $props();

    let isOptions = $derived(cipherTypes[cipherType]['options'].length != 0);
    let playerLimit = $derived(options.playerLimit || 2);

    const playerLimits = [2, 3, 4, 5, 6];

    function mainTitle() {
        return (multiplayer) ? cipherType : "Ciphers";
    }

    function secondTitle() {
        return (multiplayer) ? cipherOption : cipherType;
    }

    function handleClick(event) {
        onOptionChange(event.srcElement.id);
    }

    function handlePlayerLimit(value) {
        onOptionChange('playerLimit', value);
    }

    function linkParam(name, option) {
        const nOption = (option[0] === "!") ? option.substring(1): option;
        if (!multiplayer) {
            window.location.href = "/singleplayer/" + cipherType + "?" + name + "=" + nOption;
        } else {
            changeCipherOption(option, {[name]: nOption});
        }
    }

    function link(cipher) {
        if (!multiplayer) {
            window.location.href = "/singleplayer/" + cipher;
        } else {
            changeType(cipher);
            if (isOptions) {
                const name = cipherTypes[cipher]['options'][0];
                const option = cipherTypes[cipher]['options'][1];
                const nOption = (option[0] === "!") ? option.substring(1): option;
                changeCipherOption(option, {[name]: nOption});
            }
        }
    }
</script>

<div class="options">
    <ButtonGroup>
        {#if isOptions || !multiplayer}
            <Cipherdown title={secondTitle()} isMenu={isOptions} onclick={() => {if (!isOptions) {link(cipherType)}}}>
                {#each cipherTypes[cipherType]['options'].slice(1) as option}
                    <DropdownItem onclick={() => {linkParam(cipherTypes[cipherType]['options'][0], option)}}>
                        {#if option[0] === "!"}
                            {option.substring(1)}
                        {:else}
                            {cipherTypes[cipherType]['options'][0]+option}
                        {/if}
                    </DropdownItem>
                {/each}
            </Cipherdown>
        {/if}
        <Cipherdown title={mainTitle()} isMenu={true}>
            {#each Object.entries(cipherTypes) as [cipher, props]}
                    <DropdownItem onclick={() => {link(cipher)}}>{cipher}</DropdownItem>
            {/each}
        </Cipherdown>
    </ButtonGroup>

    {#if multiplayer}
        <div class="player-limit-container">
            <label for="player-limit-group">Players:</label>
            <ButtonGroup id="player-limit-group" role="group" aria-label="Player limit selection">
                {#each playerLimits as limit}
                    <Button
                        color="none"
                        class="limit-btn {playerLimit === limit ? 'active' : ''}"
                        onclick={() => handlePlayerLimit(limit)}
                        role="radio"
                        aria-checked={playerLimit === limit}
                    >
                        {limit}
                    </Button>
                {/each}
            </ButtonGroup>
        </div>
    {/if}

    {#each Object.entries(options) as [option, value]}
        {#if option !== 'playerLimit'}
            <div class="option checkbox">
                <input type="checkbox" id={option} checked={options[option]} name={option} onchange={handleClick}/>
                <label for={option}>{option}</label>
            </div>
        {/if}
    {/each}
</div>

<style>
    .options {
        flex-wrap: wrap;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin: 10px;
        gap: 2.5vw;
    }

    .option {
        display: flex;
        align-items: center;
    }

    .player-limit-container {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .player-limit-container label {
        color: rgb(235, 254, 255);
        font-weight: 500;
    }

    label {
        margin-left: 4px;
    }
</style>
