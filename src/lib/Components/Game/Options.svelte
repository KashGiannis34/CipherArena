<script>
    import Cipherdown from "../General/Cipherdown.svelte";
    import { Button, ButtonGroup, DropdownItem } from "@sveltestrap/sveltestrap";
    import {cipherTypes} from '$lib/util/CipherTypes';

    let {options, onOptionChange, cipherType, multiplayer=false, cipherOption, changeCipherOption, changeType} = $props();

    let isOptions = $derived(cipherTypes[cipherType]['options'].length != 0);

    function mainTitle() {
        return (multiplayer) ? cipherType : "Ciphers";
    }

    function secondTitle() {
        return (multiplayer) ? cipherOption : cipherType;
    }

    function handleClick(event) {
        onOptionChange(event.srcElement.id);
    }

    function linkParam(name, option) {
        if (!multiplayer) {
            const nOption = (option[0] === "!") ? option.substring(1): option;
            window.location.href = "/singleplayer/" + cipherType + "?" + name + "=" + nOption;
        } else {
            changeCipherOption(option);
        }
    }

    function link(cipher) {
        if (!multiplayer) {
            window.location.href = "/singleplayer/" + cipher;
        } else {
            changeType(cipher);
            if (isOptions) {
                changeCipherOption(cipherTypes[cipherType]['options'][1]);
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
    {#each Object.entries(options) as [option, value]}
        <div class="option checkbox">
            <input type="checkbox" id={option} checked={options[option]} name={option} onchange={handleClick}/>
            <label for={option}>{option}</label>
        </div>
    {/each}
</div>

<style>
    .options {
        flex-wrap: wrap;
        display: flex;
        flex-direction: row;
        justify-content: center; /* Center items within the container */
        align-items: center; /* Align items horizontally */
        margin: 10px;
        gap: 2.5vw;
    }

    .option {
        display: flex;
        align-items: center; /* Align items horizontally */

    }

    label {
        margin-left: 4px;
    }
</style>
