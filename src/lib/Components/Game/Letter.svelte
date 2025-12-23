<script>
    import { cipherTypes } from "$shared/CipherTypes";
    import {isLetter, isSolvableChunk} from "$shared/CipherUtil";

    let {inputs=$bindable(), letterInputs, cipherLetter, index, inputValue, selected, directMap, autoFocus, onArrow, onFocus, onChange, solved, cipherType, keyLetter, checkQuote, spanish} = $props();
    let error = $state(false);
    let focus = $state(false);

    function handleKeyDown(event) {
        if (solved)
            return;

        if (event.altKey) {
            event.preventDefault();
            return;
        }

        const deleteKeys = [
            "Backspace",
            "Delete",
        ];

        if (event.key == ',' && spanish && cipherLetter != "Ñ") {
            onChange(cipherLetter, 'Ñ', index);
            event.preventDefault();
            return;
        }

        if (event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == " " || event.key == "Tab") {
            onArrow(event.key, index);
            event.preventDefault();
            return;
        }

        if (event.key == "Enter") {
            checkQuote();
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

    if (isLetter(cipherLetter, spanish) && directMap) {
        $effect(() => {
            if (inputValue !== undefined && isLetter(inputValue, spanish)) {
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
    <div class="cipher-letter unselectable">{cipherLetter ? cipherLetter.toUpperCase() : cipherLetter}</div>
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
        color: var(--color-link-muted) !important;
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
        background-color: var(--table-highlight-bg) !important;
    }

    :not(.error) {
        color: var(--text-primary);
        transition-duration: 0ms;
    }

    .error {
        color: var(--color-error-darker);
    }

    .focus {
        background-color: var(--color-primary-muted) !important;
        animation: focusPulse 1.5s ease-in-out infinite;
        box-shadow: 0 0 4px var(--color-primary-muted);
        transition: background-color 0.25s ease, box-shadow 0.25s ease;
        border-radius: 4px;
    }

    @keyframes focusPulse {
        0%, 100% {
            box-shadow: 0 0 4px var(--color-primary-muted);
        }
        50% {
            box-shadow: 0 0 14px var(--color-primary-border);
        }
    }


    input:hover {
        background-color: var(--glass-bg);
        cursor: pointer;
    }

    input::placeholder {
        color: var(--text-muted);
    }
</style>