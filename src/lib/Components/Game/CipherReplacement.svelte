<script>
    import {isLetter, numberToLetter} from "$db/shared-utils/CipherUtil";

    let {inputs=$bindable(), letterInputs=$bindable(), cipherLetter, index, inputValue, autoFocus, onArrow, onFocus, onChange, onDelete, solved, spanish} = $props();
    let focus = $state(false);

    function handleKeyDown(event) {
        if (solved)
            return;

        const deleteKeys = [
            "Backspace",
            "Delete",
        ];

        if (event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == " " || event.key == "Tab") {
            onArrow(event.key, index);
            event.preventDefault();
            return;
        }

        if (deleteKeys.includes(event.key)) {
            onFocus(inputValue, false);
            onDelete(cipherLetter, index);
            return;
        }

        if ((!isLetter(event.key) && (event.key != "," || !spanish)) || (event.key.toUpperCase() == cipherLetter)) {
            event.preventDefault();
            return;
        }

        if (event.key === ',' && spanish) {
            onChange(inputValue, '', index);
            onChange('Ñ', cipherLetter, index);
            event.preventDefault();
            return;
        }

        if (event.key !== undefined && isLetter(event.key) && inputValue !== '' && event.key.length == 1) {
            onChange(inputValue, '', index);
            onChange(event.key.toUpperCase(), cipherLetter, index);
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

        onChange(character, cipherLetter, index);
    }


    function handleFocus() {
        if (solved)
            return;

        if (inputValue != '') {
            onFocus(inputValue, true);
        } else {
            const max = spanish ? 27 : 26;
            for (let n = 0; n < max; n++) {
                onFocus(numberToLetter(n, spanish), false);
            }
        }
        focus = true;
    }

    function handleBlur() {
        onFocus(inputValue, false);
        focus = false;
    }

    function handleClick() {
        if (solved)
            return;

        inputs[index]?.focus();
        if (inputValue != '') {
            onFocus(inputValue, true);
        } else {
            const max = spanish ? 27 : 26;
            for (let n = 0; n < max; n++) {
                onFocus(numberToLetter(n, spanish), false);
            }
        }
        focus = true;
    }
</script>

<td class:last={spanish ? index==26 : index==25}
class:focus={focus && !solved} onclick={handleClick}>
    <input
        bind:this={inputs[index]}
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
        color: rgb(235, 254, 255);
        text-align: center;
        width: 100%;
        height: 100%;
        background-color: transparent;
        border: none;
        outline: none;
        caret-color: transparent;
        font-size: 1.8vw;
        font-family: 'Source Code Pro', monospace !important;
    }
    @media screen and (min-width: 1200px) {
        input {
            font-size: 1.2rem;
        }
    }

    .focus {
        position: relative;
        z-index: 1;
        background-color: #ffffff28 !important;
    }

    .focus::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%);
        background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.02) 70%,
            transparent 100%
        );
        border-radius: 50%;
        animation: softGlow 1.8s ease-in-out infinite;
        pointer-events: none;
        z-index: -1;
    }

    @keyframes softGlow {
        0%, 100% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
        }
    }

    td:hover {
        background-color: #ffffff10;
        cursor: pointer;
    }

    td {
        border-top: 1px solid var(--bColor);
        border-bottom: 1px solid var(--bColor);
        border-right: 1px solid var(--bColor);
        text-align: center;
        display: block;
        padding-top: 0.65vw;
        padding-bottom: 0.65vw;
    }

    .last {
        border-top-right-radius: var(--bRadius);
    }

    input:hover {
        cursor: pointer;
    }

    input::placeholder {
        color: #ffffff31;
    }
</style>