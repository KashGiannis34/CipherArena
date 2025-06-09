<script>
    import { cipherTypes } from "$lib/util/CipherTypes";
    import {isLetter, isSolvableChunk} from "$lib/util/CipherUtil";

    let {inputs=$bindable(), letterInputs, cipherLetter, index, inputValue, selected, directMap, autoFocus, onArrow, onFocus, onChange, solved, cipherType, keyLetter} = $props();
    let error = $state(false);
    let focus = $state(false);

    function handleKeyDown(event) {
        if (solved)
            return;

        const deleteKeys = [
            "Backspace",
            "Delete",
        ];

        if (event.key == "ArrowLeft" || event.key == "ArrowRight") {
            onArrow(event.key, index);
            return;
        }

        if (deleteKeys.includes(event.key)) {
            onChange(cipherLetter, '', index);
            return;
        }

        if (!isLetter(event.key) || (event.key.toUpperCase() == cipherLetter && directMap)) {
            event.preventDefault();
            return;
        }

        if (event.key !== undefined && isLetter(event.key) && event.key.length == 1) {
            onChange(cipherLetter, event.key.toUpperCase(), index);
            event.preventDefault();
            return;
        }
    }

    function handleInput(event) {
        if (solved)
            return;

        let character = event.data;

        if (character != null && isLetter(character)) {
            character = character.toUpperCase();
        }
        onChange(cipherLetter, character, index);
    }


    function handleFocus() {
        if (solved)
            return;

        onFocus(cipherLetter, true);
        focus = true;
    }

    function handleBlur() {
        onFocus(cipherLetter, false);
        focus = false;
    }

    if (isLetter(cipherLetter) && directMap) {
        $effect(() => {
            if (inputValue !== undefined && isLetter(inputValue)) {
                let vals = Object.values(letterInputs);
                error = vals.indexOf(inputValue) != vals.lastIndexOf(inputValue);
            }
        });
    }
</script>

<div class="letter-container {cipherTypes[cipherType].letterGap ? 'letterGap' : ''}">
    {#if keyLetter}
        <div class="key-letter unselectable">{keyLetter}</div>
    {/if}
    <div class="cipher-letter unselectable">{cipherLetter.toUpperCase()}</div>
    {#if isSolvableChunk(cipherLetter, cipherType)}
        <input
            bind:this={inputs[index]}
            class:selected={selected && !solved}
            class:error={error}
            class:focus={focus && !solved}
            type="text"
            placeholder="="
            maxlength="1"
            bind:value={inputValue}
            oninput={handleInput}
            onkeydown={handleKeyDown}
            onfocus={handleFocus}
            onblur={handleBlur}
            readonly={solved}
        />
    {/if}
</div>

<style>
    .unselectable {
        -moz-user-select: -moz-none;
        -khtml-user-select: none;
        -webkit-user-select: none;

        -ms-user-select: none;
        user-select: none;
    }

    .key-letter {
        font-family: 'Source Code Pro', monospace;
        font-size: 1.0rem;
        color: #bcd8ff8d !important;
    }


    .letter-container {
        display: inline-block;
        text-align: center;
        margin: 0px;
        padding: 0px;
        min-width: 20px;
        max-width: max-content;
    }

    .letter-container.letterGap {
        padding-right: 10px;
    }

    .cipher-letter {
        font-family: 'Source Code Pro', monospace;
        font-size: 1.4rem;
        font-weight: 500;
        margin-bottom: 5px;
        position: relative;
        color: white !important;
    }

    input {
        font-family: 'Source Code Pro', monospace !important;
        text-align: center;
        font-size: 1.4rem;
        font-weight: 500;
        max-width: 20px;
        width: 100%;
        min-height: 20px;
        height: 70%;
        background-color: transparent;
        border: none;
        outline: none;
        caret-color: transparent;
        border-radius: 2px;
    }

    .selected {
        background-color: #ffffff28 !important;
    }

    :not(.error) {
        color: rgb(235, 254, 255);
        transition-duration: 0ms;
    }

    .error {
        color: rgb(219, 44, 44);
    }

    .focus {
        background-color: rgba(255, 255, 255, 0.06); /* softer base */
        animation: focusPulse 1.5s ease-in-out infinite;
        box-shadow: 0 0 4px rgba(255, 255, 255, 0.15);
        transition: background-color 0.25s ease, box-shadow 0.25s ease;
        border-radius: 4px;
    }

    @keyframes focusPulse {
        0%, 100% {
            box-shadow: 0 0 4px rgba(255, 255, 255, 0.15);
        }
        50% {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.35);
        }
    }


    input:hover {
        background-color: #ffffff0a;
        cursor: pointer;
    }

    input::placeholder {
        color: #ffffff31;
    }

    :not(.error) {
        color: rgb(235, 254, 255);
        transition-duration: 0ms;
    }
</style>