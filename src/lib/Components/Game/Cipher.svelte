<script>
    import Letter from "./Letter.svelte";
    import FreqTable from "./FreqTable.svelte";
    import Container from "../General/Container.svelte";
    import {isSolvableChunk} from "$lib/util/CipherUtil";
    import {Confetti} from 'svelte-confetti';
    import { cipherTypes } from "$lib/util/CipherTypes";
    import LoadingOverlay from "../General/LoadingOverlay.svelte";
    import { fade } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";
    import AtbashTable from "./AtbashTable.svelte";
    import BaconianTable from "./BaconianTable.svelte";
    import PortaTable from "./PortaTable.svelte";
    import CaesarTable from "./CaesarTable.svelte";
    import PolybiusSquare from "./PolybiusSquare.svelte";

    let {quote, hash, cipherType, autoFocus, params, keys, onSolved, mode, newProblem, fetchAnswerStatus, onProgressUpdate, autoSwitch} = $props();
    let startTime = Date.now()/1000;
    let solved=$state(false);
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

        if (cipherType == "Nihilist") {
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
        if (key == "ArrowLeft") {
            inc = -1;
        } else {
            inc = 1;
        }

        let currIndex = index;
        while (currIndex + inc < info.inputs.length && currIndex >= 0) {
            let prevChar = info.cipherTextTrim[currIndex];
            currIndex += inc;
            if (isSolvableChunk(info.cipherTextTrim[currIndex], cipherType) && (info.cipherTextTrim[currIndex] != prevChar || !directMap)) {
                break;
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
        if (debouncedProgressUpdate && mode === "multiplayer" && info.inputs[index].value != val && (val == '' || info.inputs[index].value == '')) {
            debouncedProgressUpdate();
        }

        if (!directMap) {
            info.inputs[index].value = val;
        }
        else {
            info.letterInputs[letter] = val;
        }

        if (autoFocus && val != '') {
            let currIndex = index;
            while (currIndex + 1 < info.inputs.length) {
                currIndex++;
                if (directMap) {
                    if (isSolvableChunk(info.cipherTextTrim[currIndex], cipherType) &&
                    info.cipherTextTrim[currIndex].toUpperCase() !== letter &&
                    info.letterInputs[info.cipherTextTrim[currIndex].toUpperCase()] == '') {
                        break;
                    }
                } else {
                    if (isSolvableChunk(info.cipherTextTrim[currIndex], cipherType) && info.inputs[currIndex].value == '') {
                        break;
                    }
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
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letterInputs = {};
        alphabet.split('').forEach(letter => {
            letterInputs[letter] = ''; // Initialize each letter with an empty string
        });
        return letterInputs;
    }

    function initLetterFocus() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
        let feedbackMessage = '';
        isChecking = true;

        const answer = await fetchAnswerStatus(i, hash, cipherType, keys, params.Solve, startTime);
        if (mode == 'singleplayer') {
            feedbackMessage = answer.feedbackMessage;
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
        }, 2000); // error disappears after 2 seconds
    }

    function resetClear() {
        clearPolybius = false;
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
    });
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

    </div>
    <div class="cipher">
        {#each lettersWithIndices as word}
            <div class="word">
                {#each word as {letter, index, keyLetter}}
                    <Letter bind:inputs={info.inputs} letterInputs={info.letterInputs} cipherLetter={letter} index={index} inputValue={info.letterInputs[letter]}
                    selected={info.letterFocus[letter]} directMap={directMap} autoFocus={autoFocus} onArrow={onArrow}
                    onFocus={onFocus} onChange={onChange} solved={solved} cipherType={cipherType} keyLetter={keyLetter}/>
                {/each}
            </div>
        {/each}
    </div>
    {#if cipherTypes[cipherType]['addOn']=="freqTable"}
        <FreqTable bind:info={info} solved={solved} autoFocus={autoFocus}
        k={params['K']}/>
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
</Container>

{#if solved && mode == "singleplayer"}
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
</style>