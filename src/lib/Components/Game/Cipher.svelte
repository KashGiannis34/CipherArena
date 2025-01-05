<script>
    import Letter from "./Letter.svelte";
    import { info } from "./CipherInfo.svelte.js";
    import FreqTable from "./FreqTable.svelte";
    import Container from "../Container.svelte";

    let {cipherType, autoFocus} = $props();

    let lettersWithIndices = initLWI();
    let directMapCiphers = ['Aristocrat', 'Patristocrat', 'Caesar', 'Atbash'];
    let directMap = initDirectMap(cipherType);

    function isLetter(character) {
        return character != '' && /^[a-zA-Z]*$/.test(character);
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
                    <Letter cipherLetter={letter} index={index} inputValue={info.letterInputs[letter]}
                    selected={info.letterFocus[letter]} directMap={directMap} autoFocus={autoFocus}/>
                {/each}
            </div>
        {/each}
    </div>
    {#if cipherType=="Aristocrat"}
        <FreqTable />
    {/if}
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