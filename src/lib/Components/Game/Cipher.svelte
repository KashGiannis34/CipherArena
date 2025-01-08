<script>
    import Letter from "./Letter.svelte";
    import FreqTable from "./FreqTable.svelte";
    import Container from "../General/Container.svelte";
    import {isLetter} from "$lib/util/CipherUtil";

    let {quote, error, cipherType, autoFocus} = $props();

    let info = $state({
        cipherText: "",
        cipherTextTrim: "",
        letterInputs: {},
        letterFocus: {},
        inputs: []
    });

    info["cipherText"]=quote;
    info["cipherTextTrim"]=quote.split(" ").join("");
    info["letterInputs"]=initLetterInputs();
    info["letterFocus"]=initLetterFocus();

    let lettersWithIndices = initLWI();
    let directMapCiphers = ['Aristocrat', 'Patristocrat', 'Caesar', 'Atbash'];
    let directMap = initDirectMap(cipherType);

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
            if (isLetter(info.cipherTextTrim[currIndex]) && (info.cipherTextTrim[currIndex] != prevChar || !directMap)) {
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

    function onChange(letter, value, index) {
        if (!directMap) {
            inputValue = value;
        }
        else {
            info.letterInputs[letter] = value;
        }

        if (autoFocus && value != '') {
            let currIndex = index;
            while (currIndex + 1 < info.inputs.length) {
                currIndex++;
                if (directMap) {
                    if (isLetter(info.cipherTextTrim[currIndex]) &&
                    info.cipherTextTrim[currIndex].toUpperCase() !== letter &&
                    info.letterInputs[info.cipherTextTrim[currIndex].toUpperCase()] == '') {
                        break;
                    }
                } else {
                    if (isLetter(info.cipherTextTrim[currIndex])) {
                        break;
                    }
                }
            }
            info.inputs[currIndex]?.focus();
        }
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
        return directMapCiphers.includes(type);
    }

    function initLWI() {
        let res = [];
        const words = info.cipherText.toUpperCase().split(" ");
        let index = 0;
        for (let word of words) {
            let wArr = [];
            for (let character of word) {
                let cObj = {letter:character, index: index};
                index++;
                wArr.push(cObj);
            }
            res.push(wArr);
        }
        return res;
    }

    function getInputText() {
        let text = '';
        for (let input of info.inputs) {
            if (input.value != '') {
                text += input.value;
            }
        }
    }

    async function checkDecodedQuote() {
        let feedbackMessage = '';
        try {
            const response = await fetch('/api/check-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: quoteId, decodedQuote: userDecodedQuote })
            });

            const data = await response.json();

            if (data.correct) {
                feedbackMessage = 'Correct! Your decoded quote matches the original.';
            } else {
                feedbackMessage = 'Incorrect. Try again!';
            }
        } catch (error) {
            feedbackMessage = 'An error occurred while checking the quote.';
        }
    }
</script>

<Container>
    <div class="info">
        <h3>Solve this <span class="highlight">{cipherType}</span> cipher.</h3>
        <!-- <h3>Key: <span class="highlight">HELLO</span> </h3> -->

    </div>
    <div class="cipher">
        {#each lettersWithIndices as word}
            <div class="word">
                {#each word as {letter, index}}
                    <Letter bind:inputs={info.inputs} cipherLetter={letter} index={index} inputValue={info.letterInputs[letter]}
                    selected={info.letterFocus[letter]} directMap={directMap} autoFocus={autoFocus} onArrow={onArrow}
                    onFocus={onFocus} onChange={onChange}/>
                {/each}
            </div>
        {/each}
    </div>
    {#if cipherType=="Aristocrat"}
        <FreqTable info={info}/>
    {/if}
    <button onclick={checkDecodedQuote}>Hello</button>
</Container>

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
        flex-direction: row;
        flex-wrap: wrap;
    }

    .word {
        margin-left: 10px;
        margin-right: 10px;
    }


    /* .cipherContainer:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    } */

</style>