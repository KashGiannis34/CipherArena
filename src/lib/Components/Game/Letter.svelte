<script>
    let {inputs=$bindable(), cipherLetter, index, inputValue, selected, directMap, autoFocus, onArrow, onFocus, onChange} = $props();
    let error = $state(false);
    let focus = $state(false);

    function isLetter(character) {
        return character != '' && /^[a-zA-Z]*$/.test(character);
    }

    function handleKeyDown(event) {
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

        if (event.key !== undefined && isLetter(event.key) && inputValue !== '') {
            onChange(cipherLetter, event.key.toUpperCase(), index);
            event.preventDefault();
            return;
        }
    }

    function handleInput(event) {
        let character = event.data;
        if (isLetter(event.data)) {
            character = character.toUpperCase();
        }

        onChange(cipherLetter, character, index);
    }


    function handleFocus() {
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
                if (inputValue == inputValue.toUpperCase()) {
                    let vals = Object.values(inputs);
                    error = vals.indexOf(inputValue) != vals.lastIndexOf(inputValue);
                }
            }
        });
    }
</script>

<div class="letter-container">
    <div class="cipher-letter">{cipherLetter.toUpperCase()}</div>
    {#if isLetter(cipherLetter)}
        <input
            bind:this={inputs[index]}
            class:selected={selected}
            class:error={error}
            class:focus={focus}
            type="text"
            placeholder="="
            maxlength="1"
            bind:value={inputValue}
            oninput={handleInput}
            onkeydown={handleKeyDown}
            onfocus={handleFocus}
            onblur={handleBlur}
        />
    {/if}
</div>

<style>
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
    }

    input {
        text-align: center;
        font-size: 1rem;
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
        background-color: #001b42b8 !important;
    }

    :not(.error) {
        color: white;
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