<script>
    import {isLetter} from "$lib/util/CipherUtil";

    let {inputs=$bindable(), letterInputs, cipherLetter, index, inputValue, selected, autoFocus, onArrow, onFocus, onChange, solved} = $props();
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

        if (!isLetter(event.key) || (event.key.toUpperCase() == cipherLetter)) {
            event.preventDefault();
            return;
        }

        if (event.key !== undefined && isLetter(event.key) && inputValue !== '' && event.key.length == 1) {
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

    function handleClick() {
        if (solved)
            return;

        inputs[index]?.focus();
        onFocus(cipherLetter, true);
        focus = true;
    }

    if (isLetter(cipherLetter)) {
        $effect(() => {
            if (inputValue !== undefined && isLetter(inputValue)) {
                let vals = Object.values(letterInputs);
                error = vals.indexOf(inputValue) != vals.lastIndexOf(inputValue);
            }
        });
    }
</script>

<td class:last={index==25} class:selected={selected && !solved}
class:focus={focus && !solved} onclick={handleClick}>
    <input
        bind:this={inputs[index]}
        class:error={error}
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
</td>

<style>
    input {
        text-align: center;
        width: 100%;
        height: 100%;
        background-color: transparent;
        border: none;
        outline: none;
        caret-color: transparent;
        font-size: 1.8vw;
        font-family: 'Rubik', sans-serif;
    }
    @media screen and (min-width: 1200px) {
        input {
            font-size: 1.2rem;
        }
    }

    .selected {
        background-color: #001b42b8 !important;
    }

    .focus {
        background-color: #000000ae !important;
    }

    td:hover {
        background-color: #002d6d9d;
        cursor: pointer;
    }

    td {
        border-bottom: 1px solid var(--bColor);
        border-right: 1px solid var(--bColor);
        text-align: center;
        display: block;
        padding-top: 0.65vw;
        padding-bottom: 0.65vw;
    }

    .last {
        border-bottom-right-radius: var(--bRadius);
    }

    :not(.error) {
        color: rgb(235, 254, 255);
        transition-duration: 0ms;
    }

    .error {
        color: rgb(219, 44, 44);
    }

    input:hover {
        cursor: pointer;
    }

    input::placeholder {
        color: #ffffff31;
    }
</style>