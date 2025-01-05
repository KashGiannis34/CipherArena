<script>
    import { info } from "./CipherInfo.svelte.js";

    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let frequencies = initFreq(info.cipherTextTrim);

    function isLetter(character) {
        return character != '' && /^[a-zA-Z]*$/.test(character);
    }

    function initFreq(text) {
        let obj = {};
        alphabet.split('').forEach(letter => {
            obj[letter] = 0; // Initialize each letter with an empty string
        });

        for (let letter of text.toUpperCase()) {
            if (isLetter(letter)) {
                obj[letter]++;
            }
        }

        return obj;
    }
</script>

<div class="freqTable">
    <table>
        <tbody>
            <tr>
                <th>Letter</th>
                <th>Frequency</th>
                <th>Replacement</th>
            </tr>

            {#each alphabet.split('') as letter}
                <tr>
                    <td>{letter}</td>
                    <td>{frequencies[letter]}</td>
                    {#if info.letterInputs[letter] == ''}
                        <td class="transparent">-</td>
                    {:else}
                        <td>{info.letterInputs[letter]}</td>
                    {/if}
                </tr>
            {/each}
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
        width: 50%;
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

    th, td {
        padding: 0.65vw;
        border-bottom: 1px solid var(--bColor);
        border-right: 1px solid var(--bColor);
        text-align: center;
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

    table tr:last-child td:last-child {
        border-bottom-right-radius: var(--bRadius);
    }

    table tr:first-child th:last-child {
        border-bottom-left-radius: var(--bRadius);
    }

    .transparent {
        color: transparent;
    }
</style>