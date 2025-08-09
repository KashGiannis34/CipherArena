<script>
    import Letter from "./Letter.svelte";
    import FreqTable from "./FreqTable.svelte";
    import Container from "../General/Container.svelte";
    import {ENGLISH_ALPHABET, isSolvableChunk, SPANISH_ALPHABET} from "$db/shared-utils/CipherUtil";
    import { cipherTypes } from "$db/shared-utils/CipherTypes";
    import { onMount } from "svelte";

    let {quote="Zit jxoea wkgvf ygb pxdhl gctk zit sqmn rgu.".toUpperCase().split(''), cipherType = "Aristocrat", autoFocus = true, params = {'Solve':'Decode', 'K':'K0'}, keys = [], onProgressUpdate} = $props();
    let spanish = cipherType == 'Xenocrypt';
    let gaveUp=$state(false);
    let isChecking=$state(false);
    let submissionError=$state(false);
    let clearPolybius = $state(false);
    let initialQuote = initQuote(quote, cipherTypes[cipherType]['spacing']);
    let debouncedProgressUpdate;

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    onMount(() => {
        debouncedProgressUpdate = debounce(() => {
            const filled = getInputText().replace(/[^A-Za-z]/g, '').length;
            const total = info.cipherText.filter(chunk => isSolvableChunk(chunk, cipherType)).length;
            const percent = Math.floor((filled / total) * 100);
            onProgressUpdate(percent);
        }, 250);

        debouncedProgressUpdate();
    });

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
        debouncedProgressUpdate();

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
</script>

<Container style="transform: scale(.8); margin-bottom: -50px;">
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
                    onFocus={onFocus} onChange={onChange} solved={false} cipherType={cipherType} keyLetter={keyLetter} checkQuote={() => {}} spanish={spanish}/>
                {/each}
            </div>
        {/each}
    </div>
    <FreqTable bind:info={info} solved={false} autoFocus={true}
    k={params['K']} spanish={spanish}/>
</Container>

<style>
    .word:hover {
        transform: translateY(-3px);
    }

    .word > :global(div) {
        transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .word > :global(div):hover {
        transform: scale(1.1) translateY(-5px);
        z-index: 10; /* Ensures the hovered letter appears over its neighbors */
    }

    .word {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        margin-bottom: 30px;
    }

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
</style>