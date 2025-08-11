<script>
    import {isLetter, numberToLetter} from "$db/shared-utils/CipherUtil";
    import CipherReplacement from "./CipherReplacement.svelte";
    import Replacement from "./Replacement.svelte";


    let {info=$bindable(), solved, autoFocus, k, spanish} = $props();

    let alphabet = spanish ? "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let frequencies = initFreq(info.cipherTextTrim);
    let inputs = $state([]);

    function onChange(letter, value, index) {
        info.letterInputs[letter] = value;

        if (autoFocus && value != '') {
            let currIndex = index;
            while (currIndex + 1 < inputs.length) {
                currIndex++;
                if (inputs[currIndex].value == '') {
                    break;
                }
            }
            inputs[currIndex]?.focus();
        }
    }

    function onDelete(cipherLetter, index) {
        for (let letter of Object.keys(info.letterInputs)) {
            if (info.letterInputs[letter] == cipherLetter)
                info.letterInputs[letter] = '';
        }
    }

    function onArrow(key, index) {
        let inc;
        if (key == "ArrowRight" || event.key == " " || event.key == "Tab") {
            inc = 1;
        } else {
            inc = -1;
        }

        const length = info.inputs.length;
        let currIndex = (index + inc + length) % length;

        inputs[currIndex]?.focus();
    }

    function onFocus(letter, focus) {
        if (k!='2')
            info.letterFocus[letter] = focus;
        else
            info.letterFocus[letter] = focus;
    }

    function initFreq(text) {
        let obj = {};
        alphabet.split('').forEach(letter => {
            obj[letter] = 0; // Initialize each letter with an empty string
        });

        for (let letter of text) {
            if (isLetter(letter, spanish)) {
                obj[letter]++;
            }
        }

        return obj;
    }

    function findInputValue(letter) {
        const index = Object.values(info.letterInputs).indexOf(letter);
        if (index == -1)
            return '';
        else
            return numberToLetter(index, spanish);
    }
</script>

<div class="freqTable">
    <table>
        <tbody>
            {#if k != '2'}
                <tr>
                    <th>Letter</th>
                    <th>Frequency</th>
                    <th>Replacement</th>
                </tr>

                {#each alphabet.split('') as letter, index}
                    <tr>
                        <td>{letter}</td>
                        <td>{frequencies[letter]}</td>
                        <Replacement bind:inputs={inputs} bind:letterInputs={info.letterInputs} cipherLetter={letter}
                        index={index} inputValue={info.letterInputs[letter]} selected={info.letterFocus[letter]}
                        autoFocus={autoFocus} onArrow={onArrow} onFocus={onFocus} onChange={onChange} solved={solved} spanish={spanish}/>
                    </tr>
                {/each}
            {:else}
                <tr>
                    <th>Letter</th>
                    <th>Replacement</th>
                    <th>Frequency</th>
                </tr>

                {#each alphabet.split('') as letter, index}
                    <tr>
                        <CipherReplacement bind:inputs={inputs} letterInputs={info.letterInputs} cipherLetter={letter}
                        index={index} inputValue={findInputValue(letter)}
                        autoFocus={autoFocus} onArrow={onArrow} onFocus={onFocus} onChange={onChange}
                        onDelete={onDelete} solved={solved} spanish={spanish}/>
                        <td class:selected={info.letterFocus[letter]}>{letter}</td>
                        <td class:selected={info.letterFocus[letter]}>{frequencies[letter]}</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<style>
    :root {
        --bColor: rgba(255, 255, 255, 0.497);
        --bRadius: 0.5rem;
    }

    table, tr, th, td {
        display: block;
    }

    table {
        max-width: 50vw;
        display: table;
        border-collapse: separate;
        border-spacing: 0;
        margin: 20px 0;
        text-align: center;
        border-radius: var(--bRadius);
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.175);
        font-size: 1.8vw;
        transition-duration: 0ms !important;
    }

    @media screen and (min-width: 1200px) {
        table {
            font-size: 1.2rem;
        }
    }

    table tr {
	    display: table-cell;
        border: 0;

    }

    .selected {
        background-color: #001b42b8 !important;
    }

    th, td {
        border-bottom: 1px solid var(--bColor);
        border-right: 1px solid var(--bColor);
        text-align: center;
        font-family: 'Source Code Pro', monospace;
    }

    th, td {
        padding: 0.65vw;
    }

    table tr th {
        border-left: 1px solid var(--bColor);
    }

    table tr th:first-child,
    table tr td:first-child {
        border-top: 1px solid var(--bColor);
    }

    table tr:first-child th:first-child {
        border-top-left-radius: var(--bRadius);
    }

    table tr:last-child td:first-child {
        border-top-right-radius: var(--bRadius);
    }

    table tr:first-child th:last-child {
        border-bottom-left-radius: var(--bRadius);
    }

    table tr:last-child td:last-child {
        border-bottom-right-radius: var(--bRadius);
    }
</style>