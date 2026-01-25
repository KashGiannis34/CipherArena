<script>
  import { TRIGRAMS, isLetter } from "$shared/CipherUtil";

  let {
    inputs = $bindable(),
    cipherLetter,
    index,
    trigramInputs = {},
    autoFocus,
    onArrow,
    onFocus,
    onChange,
    solved,
    slots = [],
  } = $props();

  let focusState = $state({});

  function getTrigramForLetter(letter) {
    for (const [trigram, mappedLetter] of Object.entries(trigramInputs)) {
      if (mappedLetter === letter) {
        return trigram;
      }
    }
    return "";
  }

  let currentTrigram = $derived(getTrigramForLetter(cipherLetter));

  function handleKeyDown(event, slotId) {
    if (solved) return;

    if (event.altKey) {
      event.preventDefault();
      return;
    }

    if (
      event.key == "ArrowLeft" ||
      event.key == "ArrowRight" ||
      event.key == " " ||
      event.key == "Tab"
    ) {
      onArrow(event.key, slotId);
      event.preventDefault();
      return;
    }

    const deleteKeys = ["Backspace", "Delete"];
    if (deleteKeys.includes(event.key)) {
      onChange(cipherLetter, "", slotId);
      return;
    }

    if (event.key.length === 1 && !isLetter(event.key)) {
      event.preventDefault();
      return;
    }
  }

  function handleInput(event, slot) {
    if (solved) return;

    let value = event.target.value;
    if (value && value.length > 0) {
      const char = value.slice(-1).toUpperCase();
      if (isLetter(char)) {
        onChange(cipherLetter, char, slot.id);
      }
    } else {
      onChange(cipherLetter, "", slot.id);
    }
  }

  function handleFocus(slotId) {
    if (solved) return;
    onFocus(cipherLetter, true);
    focusState[slotId] = true;
  }

  function handleBlur(slotId) {
    onFocus(cipherLetter, false);
    focusState[slotId] = false;
  }

  function formatChar(char) {
    if (char === ".") return "●";
    if (char === "-") return "–";
    if (char === "x") return "×";
    return char;
  }
</script>

<div class="morse-letter-container">
  <div class="cipher-letter unselectable">{cipherLetter}</div>

  <div class="trigram-display" class:empty={!currentTrigram}>
    {#if currentTrigram}
      <span class="trigram-char">{formatChar(currentTrigram[0])}</span>
      <span class="trigram-char">{formatChar(currentTrigram[1])}</span>
      <span class="trigram-char">{formatChar(currentTrigram[2])}</span>
    {:else}
      <span class="trigram-placeholder">× × ×</span>
    {/if}
  </div>

  <div class="input-layer">
    {#each slots as slot (slot.id)}
      <div
        class="input-wrapper"
        style="
          left: calc({slot.localOffset} * 33.33%);
          width: calc({slot.content.length} * 33.33%);
        "
      >
        <input
          bind:this={inputs[slot.id]}
          class:focus={focusState[slot.id] && !solved}
          type="text"
          placeholder="="
          maxlength="1"
          oninput={(e) => handleInput(e, slot)}
          onkeydown={(e) => handleKeyDown(e, slot.id)}
          onfocus={() => handleFocus(slot.id)}
          onblur={() => handleBlur(slot.id)}
          readonly={solved}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .unselectable {
    -moz-user-select: -moz-none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .morse-letter-container {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: 0px;
    padding: 0 2px;
    width: 3.5rem;
    position: relative;
  }

  .cipher-letter {
    font-family: "Source Code Pro", monospace !important;
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 3px;
    color: white !important;
  }

  .trigram-display {
    font-family: "Source Code Pro", monospace !important;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 0.85rem;
    color: var(--color-accent);
    min-height: 1.5em;
    margin-bottom: 3px;
    width: 100%;
  }

  .trigram-display.empty {
    color: var(--text-muted);
  }

  .trigram-char,
  .trigram-placeholder {
    font-family: "Source Code Pro", monospace !important;
    line-height: 1.1;
    width: 33.33%;
    text-align: center;
  }

  .trigram-placeholder {
    color: var(--text-muted);
    width: 100%;
  }

  .input-layer {
    position: relative;
    width: 100%;
    height: 22px;
    display: block;
  }

  .input-wrapper {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  input {
    font-family: "Source Code Pro", monospace !important;
    text-align: center;
    font-size: 1.2rem;
    font-weight: 500;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    caret-color: transparent;
    border-radius: 2px;
    color: var(--text-primary);
    padding: 0;
    margin: 0;
  }

  .focus {
    background-color: var(--table-highlight-bg) !important;
  }

  input:hover {
    background-color: var(--glass-bg);
    cursor: pointer;
  }

  input::placeholder {
    color: var(--text-muted);
  }
</style>
