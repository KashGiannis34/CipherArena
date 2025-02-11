<script>
    import Container from "../General/Container.svelte";
    import Cipherdown from "../General/Cipherdown.svelte";
    import { Button, ButtonGroup, DropdownItem } from "@sveltestrap/sveltestrap";
    import {cipherTypes} from '$lib/util/CipherTypes';

    let {options, onOptionChange, cipherType} = $props();

    function handleClick(event) {
        onOptionChange(event.srcElement.id);
        sessionStorage.setItem("options", JSON.stringify(options));
    }

    function linkParam(name, option) {
        const nOption = option[0] === "!" ? option.substring(1) : option;
        window.location.href = "/singleplayer/" + cipherType + "?" + name + "=" + nOption;
    }

    function link(cipher) {
        window.location.href = "/singleplayer/" + cipher;
    }
</script>

<Container --flexDir="row" style="gap: 3vw;">
    <ButtonGroup>
        {#if Object.values(cipherTypes[cipherType]['options']).length != 0}
            <Cipherdown title={cipherType}>
                {#each Object.values(cipherTypes[cipherType]['options'])[0] as option}
                    <DropdownItem onclick={() => {linkParam(Object.keys(cipherTypes[cipherType]['options'])[0], option)}}>
                        {#if option[0] === "!"}
                            {option.substring(1)}
                        {:else}
                            {Object.keys(cipherTypes[cipherType]['options'])[0]+option}
                        {/if}
                    </DropdownItem>
                {/each}
            </Cipherdown>
        {/if}
        <Cipherdown title="Ciphers">
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
</Container>

<style>
    @import "$lib/css/Checkbox.css";

    :global(.btn-group) {
        box-shadow: 0px 0px 14px -7px #f019e9;
        background: linear-gradient(45deg, #8d2fff 0%, #5619f0  51%, #2f2fff  100%);
    }

    .option {
        display: flex;
        flex-direction: row;
        justify-content: flex-start; /* Center items within the container */
        align-items: center; /* Align items horizontally */
        margin: 10px;
    }
</style>
