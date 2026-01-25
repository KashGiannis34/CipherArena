<script>
  import { TRIGRAMS, morseCodeMap, isLetter } from "$shared/CipherUtil";

  let { info = $bindable(), solved, autoFocus, crib = {} } = $props();

  let inputs = $state([]);

  $effect(() => {
    if (!info.trigramInputs) {
      info.trigramInputs = {};
    }
    if (crib && Object.keys(crib).length > 0) {
      for (const [letter, trigram] of Object.entries(crib)) {
        if (
          trigram &&
          TRIGRAMS.includes(trigram) &&
          !info.trigramInputs[trigram]
        ) {
          info.trigramInputs[trigram] = letter;
        }
      }
    }
  });

  function onChange(trigram, value, index) {
    const upperValue = value.toUpperCase();
    if (
      upperValue === "" ||
      (upperValue.length === 1 && isLetter(upperValue))
    ) {
      info.trigramInputs[trigram] = upperValue;
    }

    if (autoFocus && upperValue !== "") {
      let currIndex = index;
      while (currIndex + 1 < inputs.length) {
        currIndex++;
        if (!inputs[currIndex]?.value) {
          break;
        }
      }
      inputs[currIndex]?.focus();
    }
  }

  function onArrow(key, index) {
    let inc = key === "ArrowRight" || key === " " || key === "Tab" ? 1 : -1;
    const length = inputs.length;
    let currIndex = (index + inc + length) % length;
    inputs[currIndex]?.focus();
  }

  function handleKeyDown(event, trigram, index) {
    if (solved) return;

    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "Tab"
    ) {
      onArrow(event.key, index);
      event.preventDefault();
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      onChange(trigram, "", index);
      return;
    }

    if (event.key.length === 1 && !isLetter(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key.length === 1 && isLetter(event.key)) {
      onChange(trigram, event.key, index);
      event.preventDefault();
      return;
    }
  }

  function handleInput(event, trigram, index) {
    if (solved) return;
    onChange(trigram, event.target.value, index);
  }

  function hasError(trigram) {
    const val = info.trigramInputs?.[trigram];
    if (!val) return false;
    const vals = Object.values(info.trigramInputs || {}).filter(
      (v) => v === val,
    );
    return vals.length > 1;
  }

  const morseAlphabet = Object.entries(morseCodeMap).map(([letter, morse]) => ({
    letter,
    morse,
  }));

  function formatChar(char) {
    if (char === ".") return "●";
    if (char === "-") return "–";
    if (char === "x") return "×";
    return char;
  }
</script>

<div class="morse-container">
  <h4 class="table-title">Trigram Table</h4>
  <div class="trigram-table-wrapper">
    <table class="trigram-table">
      <tbody>
        {#each TRIGRAMS as trigram, index}
          <tr>
            <th>
              <span class="trigram-char">{formatChar(trigram[0])}</span>
              <span class="trigram-char">{formatChar(trigram[1])}</span>
              <span class="trigram-char">{formatChar(trigram[2])}</span>
            </th>
            <td class:error={hasError(trigram)}>
              <input
                bind:this={inputs[index]}
                type="text"
                class="letter-input"
                class:error={hasError(trigram)}
                placeholder="="
                maxlength="1"
                value={info.trigramInputs?.[trigram] || ""}
                oninput={(e) => handleInput(e, trigram, index)}
                onkeydown={(e) => handleKeyDown(e, trigram, index)}
                readonly={solved}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h4 class="table-title">Morse Code Reference</h4>
  <div class="morse-reference">
    <table>
      <tbody>
        {#each morseAlphabet as { letter, morse }}
          <tr>
            <th>{letter}</th>
            <td class="morse-code">{morse}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .morse-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .table-title {
    margin: 0.5rem 0;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .trigram-table-wrapper {
    overflow-x: auto;
    max-width: 100%;
  }

  /* Transposed table - rows become columns */
  .trigram-table {
    display: table;
    border-collapse: separate;
    border-spacing: 0;
    background-color: var(--table-header-bg);
    border-radius: 0.5rem;
    overflow: hidden;
    font-size: clamp(0.6rem, 1.5vw, 0.9rem);
  }

  .trigram-table tr {
    display: table-cell;
    border: 0;
  }

  .trigram-table th,
  .trigram-table td {
    display: block;
    padding: 0.4rem 0.3rem;
    border-bottom: 1px solid var(--table-border-color);
    border-right: 1px solid var(--table-border-color);
    text-align: center;
    font-family: "Source Code Pro", monospace;
  }

  .trigram-table td {
    position: relative;
    padding: 0; /* Remove padding for full-cell input */
    height: 2.2rem; /* Fixed height for consistency */
  }

  .trigram-table td:hover {
    background-color: var(--glass-bg);
    cursor: pointer;
  }

  .trigram-table tr:first-child th,
  .trigram-table tr:first-child td {
    border-left: 1px solid var(--table-border-color);
  }

  .trigram-table tr th:first-child,
  .trigram-table tr td:first-child {
    border-top: 1px solid var(--table-border-color);
  }

  /* Rounded corners */
  .trigram-table tr:first-child th:first-child {
    border-top-left-radius: 0.5rem;
  }
  .trigram-table tr:last-child th:first-child {
    border-top-right-radius: 0.5rem;
  }
  .trigram-table tr:first-child td:last-child {
    border-bottom-left-radius: 0.5rem;
  }
  .trigram-table tr:last-child td:last-child {
    border-bottom-right-radius: 0.5rem;
  }

  .trigram-char {
    display: block;
    line-height: 1.1;
    font-family: "Source Code Pro", monospace !important;
  }

  .letter-input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    text-align: center;
    font-family: "Source Code Pro", monospace;
    font-size: 1.1rem;
    color: var(--text-primary);
    outline: none;
    padding: 0;
    margin: 0;
    caret-color: transparent;
  }

  .letter-input::placeholder {
    color: var(--text-muted);
  }

  .letter-input:focus {
    background-color: var(--table-highlight-bg);
  }

  .error {
    color: var(--color-error-darker) !important;
  }

  /* Morse reference - also transposed */
  .morse-reference table {
    display: table;
    border-collapse: separate;
    border-spacing: 0;
    background-color: var(--table-header-bg);
    border-radius: 0.5rem;
    overflow: hidden;
    font-size: clamp(0.6rem, 1.5vw, 0.9rem);
  }

  .morse-reference tr {
    display: table-cell;
    border: 0;
  }

  .morse-reference th,
  .morse-reference td {
    display: block;
    padding: 0.4rem 0.3rem;
    border-bottom: 1px solid var(--table-border-color);
    border-right: 1px solid var(--table-border-color);
    text-align: center;
    font-family: "Source Code Pro", monospace;
  }

  .morse-reference tr:first-child th,
  .morse-reference tr:first-child td {
    border-left: 1px solid var(--table-border-color);
  }

  .morse-reference tr th:first-child,
  .morse-reference tr td:first-child {
    border-top: 1px solid var(--table-border-color);
  }

  .morse-reference tr:first-child th:first-child {
    border-top-left-radius: 0.5rem;
  }
  .morse-reference tr:last-child th:first-child {
    border-top-right-radius: 0.5rem;
  }
  .morse-reference tr:first-child td:last-child {
    border-bottom-left-radius: 0.5rem;
  }
  .morse-reference tr:last-child td:last-child {
    border-bottom-right-radius: 0.5rem;
  }

  .morse-code {
    letter-spacing: 1px;
    font-family: "Source Code Pro", monospace !important;
  }
</style>
