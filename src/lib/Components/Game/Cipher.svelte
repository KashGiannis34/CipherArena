<script>
    import Letter from "./Letter.svelte";
    import FreqTable from "./FreqTable.svelte";
    import Container from "../General/Container.svelte";
    import {isLetter} from "$lib/util/CipherUtil";
    import Popup from "../General/Popup.svelte";
    import {Confetti} from 'svelte-confetti';
    import { cipherTypes } from "$lib/util/CipherTypes";

    let {quote, hash, cipherType, autoFocus, k, keys, spacing} = $props();
    let startTime = Date.now()/1000;
    let visibility=$state(false);
    let feedbackMessage=$state('');
    let solved=$state(false);

    let info = $state({
        cipherText: initQuote(quote, cipherTypes[cipherType]['spacing']),
        cipherTextTrim: quote.split(" ").join(""),
        letterInputs: initLetterInputs(),
        letterFocus: initLetterFocus(),
        inputs: []
    });

    let lettersWithIndices = initLWI();
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
            info.inputs[index].value = value;
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

    function initQuote(quote, spacing) {
        if (spacing == -1)
            return quote;
        else {
            let res = '';
            let count = 0;
            for (let letter of quote) {
                if (isLetter(letter)) {
                    res+=letter;
                    count++;
                } else {
                    continue;
                }
                if (res != '' && spacing != 0 && count % spacing == 0)
                    res += ' ';
            }
            return res;
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
        return cipherTypes[cipherType]['directMap'];
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
            if (input != undefined && input.value != '') {
                text += input.value;
            }
        }
        return text;
    }

    async function checkDecodedQuote() {
        let i = getInputText();
        try {
            const response = await fetch('/api/validate-quote', {
                method: 'POST',
                body: JSON.stringify({'input':i, 'id':hash}),
                headers: {
                    'content-type': 'application/json'
                }
		    });
            const answer = await response.json();
            const time = (Date.now()/1000)-startTime;
            const strTime = Math.floor(time/60).toString().padStart(2,'0')+':'+Math.round(time%60, 0).toString().padStart(2,'0');
            if (answer) {
                feedbackMessage = "<h2>Congratulations!</h2><p style=margin-top:8px>The cipher was solved in " + strTime + "!</p>";
                solved = true;
            } else {
                feedbackMessage = "<p>Sorry, your answer isn't correct. Giannis hopes you get it on the next try!</p>";
            }
            visibility = true;
        } catch (error) {
            feedbackMessage = '<p>An error occurred while checking the quote.</p>';
        }
        return feedbackMessage;
    }

    function newQuote() {
        visibility = false;
        if (solved)
            window.location.href = window.location.href;
    }
</script>

<Container>
    <div class="info">
        <h3>Solve this <span class="highlight">{cipherType}</span> cipher.</h3>
        {#each keys as key, index}
            {#if cipherTypes[cipherType]['keys'][index] != '!'}
                <h4>{cipherTypes[cipherType]['keys'][index]} is <span class="highlight">{key}</span>. </h4>
            {/if}
        {/each}

    </div>
    <div class="cipher">
        {#each lettersWithIndices as word}
            <div class="word">
                {#each word as {letter, index}}
                    <Letter bind:inputs={info.inputs} letterInputs={info.letterInputs} cipherLetter={letter} index={index} inputValue={info.letterInputs[letter]}
                    selected={info.letterFocus[letter]} directMap={directMap} autoFocus={autoFocus} onArrow={onArrow}
                    onFocus={onFocus} onChange={onChange} solved={solved}/>
                {/each}
            </div>
        {/each}
    </div>
    {#if cipherTypes[cipherType]['addOn']=="freqTable"}
        <FreqTable bind:info={info} solved={solved} autoFocus={autoFocus}
        k={k}/>
    {/if}
    <button class="button" onclick={checkDecodedQuote}>Submit</button>
</Container>
<Popup bind:visibility={visibility} exit={newQuote}>
    {@html feedbackMessage}
</Popup>
{#if solved}
    <div style="
    position: fixed;
    z-index: 101;
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
    @import "$lib/css/Button";

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