<script>
    import {isLetter} from "$lib/util/CipherUtil";

    let {inputs=$bindable(), letterInputs, cipherLetter, index, inputValue, selected, directMap, autoFocus, onArrow, onFocus, onChange, solved} = $props();
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

        // && inputValue !== ''

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

<div class="letter-container">
    <div class="cipher-letter unselectable">{cipherLetter.toUpperCase()}</div>
    {#if isLetter(cipherLetter)}
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

    .letter-container {
        display: inline-block;
        text-align: center;
        margin: 0px;
        padding: 0px;
        width: 20px;
    }

    .cipher-letter {
        font-size: 1.2rem;
        font-weight: 500;
        margin-bottom: 5px;
        position: relative;
        color: white !important;
    }

    input {
        text-align: center;
        font-size: 1.2rem;
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
        font-family: 'Rubik', sans-serif;
    }

    .selected {
        background-color: #001b42b8 !important;
    }

    :not(.error) {
        color: rgb(235, 254, 255);
        transition-duration: 0ms;
    }

    .error {
        color: rgb(219, 44, 44);
    }

    .focus {
        border-bottom: 2px solid rgba(255, 255, 255, 0.825);
        background-color: #001b42b8 !important;
    }

    :not(.focus) {
        border: none;
    }

    input:hover {
        background-color: #002d6d9d;
        cursor: pointer;
    }

    input::placeholder {
        color: #ffffff31;
    }
</style>