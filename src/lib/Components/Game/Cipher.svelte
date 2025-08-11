<script>
    import Letter from "./Letter.svelte";
    import FreqTable from "./FreqTable.svelte";
    import Container from "../General/Container.svelte";
    import {ENGLISH_ALPHABET, isSolvableChunk, SPANISH_ALPHABET} from "$db/shared-utils/CipherUtil";
    import {Confetti} from 'svelte-confetti';
    import { cipherTypes } from "$db/shared-utils/CipherTypes";
    import LoadingOverlay from "../General/LoadingOverlay.svelte";
    import { fade } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";
    import AtbashTable from "./AtbashTable.svelte";
    import BaconianTable from "./BaconianTable.svelte";
    import PortaTable from "./PortaTable.svelte";
    import CaesarTable from "./CaesarTable.svelte";
    import PolybiusSquare from "./PolybiusSquare.svelte";
    import CheckerboardTable from "./CheckerboardTable.svelte";
    import DeterminantTable from "./DeterminantTable.svelte";
    import MatrixInput from "./MatrixInput.svelte";
    import AffineInput from "./AffineInput.svelte";
    import Calculator from "./Calculator.svelte";

    let {quote, hash, cipherType, autoFocus, params, keys, onSolved, mode, newProblem, fetchAnswerStatus, onProgressUpdate, autoSwitch} = $props();
    let spanish = cipherType == 'Xenocrypt';
    let startTime = Date.now()/1000;
    let solved=$state(false);
    let gaveUp=$state(false);
    let isChecking=$state(false);
    let submissionError=$state(false);
    let clearPolybius = $state(false);
    let debouncedProgressUpdate;
    let initialQuote = initQuote(quote, cipherTypes[cipherType]['spacing']);

    let info = $state({
        cipherText: initialQuote,
        cipherTextTrim: initialQuote.filter(c => c !== ' '),
        letterInputs: initLetterInputs(),
        letterFocus: initLetterFocus(),
        inputs: []
    });

    let lettersWithIndices = initLWI();
    let directMap = initDirectMap(cipherType);
    let paramString = paramToString(params);

    // Calculator state
    const mathIntensiveCiphers = ['Affine', 'Caesar', 'Nihilist', 'Hill'];
    const showCalculatorButton = mathIntensiveCiphers.includes(cipherType);
    let calculatorVisible = $state(false);
    let calculatorPosition = $state({ x: 50, y: 50 });
    let mainInputElement;
    let cipherFocused = $state(false);
    let calculatorFocused = $state(false);
    let lastFocusedInputIndex = $state(-1);

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    function clearQuote() {
        info.letterInputs = initLetterInputs();
        for (let input of info.inputs) {
            if (input != undefined) {
                input.value = '';
            }
        }

        if (mode === "multiplayer") {
            debouncedProgressUpdate();
        }

        if (cipherType == "Nihilist" || cipherType == "Checkerboard") {
            clearPolybius = true;
        }
    }

    function paramToString(obj) {
        let val = obj.K;
        let res = "K"+val;
        if (res == "K0") {
            return "Random ";
        } else if (res == "K1" || res == "K2" || res == "K3") {
            return res + " ";
        } else {
            return "";
        }
    }

    function onArrow(key, index) {
        let inc;
        if (key == "ArrowRight" || event.key == " " || event.key == "Tab") {
            inc = 1;
        } else {
            inc = -1;
        }

        const len = info.inputs.length;
        let currIndex = index;
        let triedAll = false;

        while (!triedAll) {
            let nextIndex = (currIndex + inc + len) % len;
            let prevChar = info.cipherTextTrim[currIndex];
            let nextChar = info.cipherTextTrim[nextIndex];

            if (isSolvableChunk(nextChar, cipherType) && (nextChar !== prevChar || !directMap)) {
                currIndex = nextIndex;
                break;
            }

            currIndex = nextIndex;
            if (currIndex === index) {
                currIndex = (index + inc + len) % len;
                triedAll = true;
            }
        }

        info.inputs[currIndex]?.focus();
    }

    function onFocus(letter, focus) {
        if (!directMap)
            return;
        info.letterFocus[letter] = focus;
    }

    function onChange(letter, val, index) {
        if (debouncedProgressUpdate && mode === "multiplayer" && info.inputs[index].value != val && (val === '' || info.inputs[index].value === '')) {
            debouncedProgressUpdate();
        }

        if (!directMap) {
            info.inputs[index].value = val;
        } else {
            info.letterInputs[letter] = val;
        }

        if (autoFocus && val !== '') {
            const len = info.inputs.length;
            let currIndex = index;
            let triedAll = false;

            while (!triedAll) {
                currIndex = (currIndex + 1) % len;

                if (directMap) {
                    const normalizedLetter = info.cipherTextTrim[currIndex].toUpperCase();
                    if (
                        isSolvableChunk(normalizedLetter, cipherType) &&
                        normalizedLetter !== letter &&
                        info.letterInputs[normalizedLetter] === ''
                    ) {
                        break;
                    }
                } else {
                    if (
                        isSolvableChunk(info.cipherTextTrim[currIndex], cipherType) &&
                        info.inputs[currIndex].value === ''
                    ) {
                        break;
                    }
                }

                if (currIndex === index) {
                    triedAll = true;
                }
            }

            info.inputs[currIndex]?.focus();
        }
    }

    function initQuote(quoteArr, spacing) {
        if (spacing === -1) return quoteArr;

        const spaced = [];
        let count = 0;

        for (const chunk of quoteArr) {
            if (!isSolvableChunk(chunk, cipherType)) continue;

            spaced.push(chunk);
            if (isSolvableChunk(chunk, cipherType)) {
                count++;
                if (spacing != 0 && count % spacing === 0) {
                    spaced.push(" ");
                }
            }
        }

        return spaced;
    }

    function initLetterInputs() {
        const alphabet = spanish ? SPANISH_ALPHABET : ENGLISH_ALPHABET;
        const letterInputs = {};
        alphabet.split('').forEach(letter => {
            letterInputs[letter] = '';
        });
        return letterInputs;
    }

    function initLetterFocus() {
        const alphabet = spanish ? SPANISH_ALPHABET : ENGLISH_ALPHABET;
        const letterFocus = {};
        alphabet.split('').forEach(letter => {
            letterFocus[letter] = false;
        });
        return letterFocus;
    }

    function initDirectMap(type) {
        return cipherTypes[cipherType]['directMap'];
    }

    function initLWI() {
        let res = [];
        let index = 0;
        let currentWord = [];
        const keyword = keys[0];
        const addKey = cipherTypes[cipherType]['stackKey'];
        let keywordIndex = 0;

        for (let char of info.cipherText) {
            if (char === ' ') {
                if (currentWord.length) res.push(currentWord);
                currentWord = [];
                continue;
            }

            let keywordChar = '';

            if (addKey && isSolvableChunk(char, cipherType)) {
                keywordChar = keyword[keywordIndex].toUpperCase();
                keywordIndex = (keywordIndex + 1) % keyword.length;
            }

            currentWord.push({ letter: char, index, keyLetter: keywordChar });
            index++;
        }

        if (currentWord.length) res.push(currentWord);
        return res;
    }

    function getInputText() {
        let text = '';
        for (let input of info.inputs) {
            if (input != undefined ) {
                if (input.value != '')
                    text += input.value;
                else
                    text += ' ';
            }
        }
        return text;
    }

    async function checkQuote() {
        let i = getInputText();
        isChecking = true;

        const answer = await fetchAnswerStatus(i, hash, cipherType, keys, params.Solve, startTime);
        if (mode == 'singleplayer') {
            solved = answer.solved;
        } else {
            solved = answer.solved;
        }
        isChecking = false;

        if (solved) {
            if (mode == 'singleplayer') {
                onSolved(answer);
            }
        } else {
            triggerFailUI();
        }
    }

    function triggerFailUI() {
        submissionError = true;
        setTimeout(() => {
            submissionError = false;
        }, 2000);
    }

    function resetClear() {
        clearPolybius = false;
    }

    // Calculator functions
    function toggleCalculator() {
        if (!showCalculatorButton) return;
        calculatorVisible = !calculatorVisible;
    }

    function closeCalculator() {
        calculatorVisible = false;
    }

    function handleGlobalKeydown(e) {
        if (e.altKey && e.key.toLowerCase() === 'k' && showCalculatorButton && !calculatorFocused) {
            e.preventDefault();
            e.stopPropagation();
            toggleCalculator();
            return;
        }

        // Prevent any Alt key combination from typing letters
        if (e.altKey && e.key.length === 1) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    }

    function focusFirstAvailableInput() {
        // Find the first input element that can be focused
        if (info.inputs && info.inputs.length > 0) {
            for (let i = 0; i < info.inputs.length; i++) {
                const input = info.inputs[i];
                if (input && typeof input.focus === 'function') {
                    input.focus();
                    cipherFocused = true;
                    lastFocusedInputIndex = i;
                    break;
                }
            }
        }
    }

    function focusLastOrFirstAvailableInput() {
        // Try to focus the last focused input, or the first available input
        if (info.inputs && info.inputs.length > 0) {
            // Try last focused input first
            if (lastFocusedInputIndex >= 0 && lastFocusedInputIndex < info.inputs.length) {
                const lastInput = info.inputs[lastFocusedInputIndex];
                if (lastInput && typeof lastInput.focus === 'function') {
                    lastInput.focus();
                    cipherFocused = true;
                    return;
                }
            }

            // Fall back to first available input
            focusFirstAvailableInput();
        }
    }

    function handleCipherFocus() {
        cipherFocused = true;
    }

    function handleCipherBlur() {
        cipherFocused = false;
    }

    onMount(() => {
        if (mode == "multiplayer") {
            debouncedProgressUpdate = debounce(() => {
                const filled = getInputText().replace(/[^A-Za-z]/g, '').length;
                const total = info.cipherText.filter(chunk => isSolvableChunk(chunk, cipherType)).length;
                const percent = Math.floor((filled / total) * 100);
                onProgressUpdate(percent);
            }, 250);

            debouncedProgressUpdate();
        }

        document.addEventListener('keydown', handleGlobalKeydown);

        document.addEventListener('focusin', handleGlobalFocusIn);
        document.addEventListener('focusout', handleGlobalFocusOut);
    });

    onDestroy(() => {
        document.removeEventListener('keydown', handleGlobalKeydown);
        document.removeEventListener('focusin', handleGlobalFocusIn);
        document.removeEventListener('focusout', handleGlobalFocusOut);
    });

    function handleGlobalFocusIn(e) {
        // Check if the focused element is a cipher input
        if (e.target && e.target.closest && e.target.closest('.cipher')) {
            cipherFocused = true;

            // Track which input is focused
            if (info.inputs && info.inputs.length > 0) {
                const inputIndex = info.inputs.indexOf(e.target);
                if (inputIndex !== -1) {
                    lastFocusedInputIndex = inputIndex;
                }
            }
        }
    }

    function handleGlobalFocusOut(e) {
        if (e.target && e.target.closest && e.target.closest('.cipher')) {
            // Use a small delay to check if focus moved to another cipher input
            setTimeout(() => {
                const activeElement = document.activeElement;
                if (!activeElement || !activeElement.closest || !activeElement.closest('.cipher')) {
                    cipherFocused = false;
                }
            }, 10);
        }
    }
</script>

{#if isChecking}
    <LoadingOverlay/>
{/if}

<Container>
    <div class="info">
        <h3>{params["Solve"]} this <span class="highlight" style="border-radius: 3px; padding: 3px;">{paramString + cipherType}</span> cipher.</h3>
        {#each keys as key, index}
            {#if cipherTypes[cipherType]['keys'][index] != '!'}
                <h4>The {cipherTypes[cipherType]['keys'][index]} is <span class="highlight" style="border-radius: 3px; padding: 3px;">{key}</span>. </h4>
            {/if}
        {/each}
        {#if cipherType == 'Xenocrypt'}
            <h4>Type "," to get "Ñ".</h4>
        {/if}
    </div>
    <div class="cipher">
        {#each lettersWithIndices as word}
            <div class="word">
                {#each word as {letter, index, keyLetter}}
                    <Letter bind:inputs={info.inputs} letterInputs={info.letterInputs} cipherLetter={letter} index={index} inputValue={info.letterInputs[letter]}
                    selected={info.letterFocus[letter]} directMap={directMap} autoFocus={autoFocus} onArrow={onArrow}
                    onFocus={onFocus} onChange={onChange} solved={solved} cipherType={cipherType} keyLetter={keyLetter} checkQuote={checkQuote} spanish={spanish}/>
                {/each}
            </div>
        {/each}
    </div>
    {#if cipherTypes[cipherType]['addOn']=="freqTable"}
        <FreqTable bind:info={info} solved={solved} autoFocus={autoFocus}
        k={params['K']} spanish={spanish}/>
    {:else if cipherTypes[cipherType]['addOn']=="atbashTable"}
        <AtbashTable />
    {:else if cipherTypes[cipherType]['addOn']=="baconTable"}
        <BaconianTable />
    {:else if cipherTypes[cipherType]['addOn']=="portaTable"}
        <PortaTable />
    {:else if cipherTypes[cipherType]['addOn']=="caesarTable"}
        <CaesarTable />
    {:else if cipherTypes[cipherType]['addOn']=="polybiusSquare"}
        <PolybiusSquare {autoFocus} {clearPolybius} {resetClear} />
    {:else if cipherTypes[cipherType]['addOn']=="checkerboardTable"}
        <CheckerboardTable {autoFocus} {clearPolybius} {resetClear} />
    {:else if cipherTypes[cipherType]['addOn']=="mathAddOn"}
        <CaesarTable />

        {#if cipherType == 'Hill'}
            <MatrixInput encode={params["Solve"] == 'Encode'} keyword={keys[0]}/>
        {:else}
            <AffineInput encode={params["Solve"] == 'Encode'} keys={keys} />
        {/if}

        {#if params['Solve'] == 'Decode'}
            <DeterminantTable />
        {/if}
    {/if}

    <div class="buttons">
        {#if !solved}
            <button class="button" onclick={clearQuote}>Clear</button>
        {/if}
        {#if (mode == 'singleplayer' && !autoSwitch) || !solved}
            <button class="button" onclick={(solved && mode=="singleplayer") ? newProblem:checkQuote}>{(solved && mode=="singleplayer") ? 'New Problem' : 'Submit'}</button>
        {/if}
    </div>
    {#if submissionError}
        <div class="cipher-error" transition:fade>
            ❌ Incorrect submission. Try again!
        </div>
    {/if}

    <!-- Calculator Button -->
    {#if showCalculatorButton}
        <div class="calculator-toggle-container">
            <button class="calculator-toggle-btn" class:cipher-focused={cipherFocused} onclick={toggleCalculator} title="Calculator (Alt+K to toggle, Alt+L to focus)">
                🧮
            </button>
            {#if !calculatorVisible}
                <div class="calculator-hint-container">
                    <span class="calculator-hint">Alt+K</span>
                    <span class="calculator-hint-label">Toggle</span>
                </div>
            {:else}
                <div class="calculator-hint-container">
                    <span class="calculator-hint">Alt+L</span>
                    <span class="calculator-hint-label">Focus</span>
                </div>
            {/if}
        </div>
    {/if}
</Container>

<!-- Calculator Component -->
{#if showCalculatorButton}
    <Calculator
        visible={calculatorVisible}
        onClose={closeCalculator}
        bind:position={calculatorPosition}
        onFocusSwitch={focusLastOrFirstAvailableInput}
        bind:calculatorFocused={calculatorFocused}
        toggleCalculator={toggleCalculator}
    />
{/if}

{#if solved && mode == "singleplayer" && !gaveUp}
    <div style="
    position: fixed;
    z-index: 25;
    top: -3vh;
    left: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    overflow: hidden;
    pointer-events: none;">
        <Confetti duration=3000 x={[-5, 5]} delay={[0, 3000]} amount=200 fallDistance="100vh" colorRange={[75, 175]}/>
    </div>
{/if}

<style>
    .word {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        margin-bottom: 30px;
    }

    .info {
        text-align: left;
        align-self: flex-start; /* Push this text to the top-left corner */
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 30px;
    }

    .info h3 {
        padding-bottom: 5px;
    }

    .highlight {
        background: rgba(255, 255, 255, 0.2);
    }

    .cipher {
        display: flex;
        flex-wrap: wrap;
        max-width: 100%;
    }

    .word {
        margin-left: 10px;
        margin-right: 10px;
        max-width: 100%;
        flex-wrap: wrap;
        row-gap: 30px;
    }

    .buttons {
        display: flex;
        flex-wrap: wrap;
        justify-content: center; /* center on small screens */
        gap: 1rem;
        width: 100%;
        margin-top: 1rem;
    }

    .buttons .button {
        flex: 1 1 auto;
        max-width: 200px;
        min-width: 120px;
        padding: 0.75rem 1.25rem;
        font-size: clamp(0.9rem, 1.5vw, 1.1rem);
    }

    .cipher-error {
        margin-top: 1rem;
        color: #ff4d4f;
        background-color: #2a0000;
        padding: 0.75rem 1.25rem;
        border: 1px solid #ff4d4f;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        text-align: center;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    @keyframes shake {
        0% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
        100% { transform: translateX(0); }
    }

    .cipher-error {
        animation: shake 0.4s ease;
    }

    /* Calculator Button Styles */
    .calculator-toggle-container {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 999;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        transition: all 0.25s ease-in-out;
    }

    .calculator-toggle-btn {
        background: linear-gradient(145deg, #8d2fff, #5619f0);
        border: 2px solid #4a5568;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
    }

    .calculator-toggle-btn:hover {
        background: linear-gradient(145deg, #5619f0, #8d2fff);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .calculator-toggle-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .calculator-toggle-btn.cipher-focused {
        background: linear-gradient(145deg, #38a169, #2f855a);
        border-color: #4adede;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(74, 222, 222, 0.3);
    }

    .calculator-toggle-btn.cipher-focused:hover {
        background: linear-gradient(145deg, #2f855a, #38a169);
    }

    .calculator-hint {
        color: #cbd5e0;
        font-size: 11px;
        font-weight: 500;
        background: rgba(0, 0, 0, 0.7);
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        text-align: center;
        backdrop-filter: blur(5px);
        transition: opacity 0.2s ease-in-out;
    }

    .calculator-hint-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .calculator-hint-label {
        font-size: 9px;
        color: #a0aec0;
        font-weight: 400;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Mobile responsive adjustments */
    @media (max-width: 768px) {
        .calculator-toggle-container {
            top: 80px;
            right: 16px;
        }

        .calculator-toggle-btn {
            width: 48px;
            height: 48px;
            font-size: 20px;
        }

        .calculator-hint {
            font-size: 10px;
            padding: 1px 4px;
        }
    }

    @media (max-width: 480px) {
        .calculator-toggle-container {
            top: 70px;
            right: 12px;
        }

        .calculator-toggle-btn {
            width: 44px;
            height: 44px;
            font-size: 18px;
        }
    }
</style>