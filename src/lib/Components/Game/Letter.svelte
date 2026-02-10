<script>
  import { cipherTypes } from "$shared/CipherTypes";
  import { isLetter, isSolvableChunk } from "$shared/CipherUtil";
  import { createLetterHandlers } from "./letterUtils.svelte.js";

  let {
    inputs = $bindable(),
    letterInputs,
    cipherLetter,
    index,
    inputValue,
    selected,
    directMap,
    autoFocus,
    onArrow,
    onFocus,
    onChange,
    solved,
    cipherType,
    keyLetter,
    checkQuote,
    spanish,
  } = $props();

  const handler = createLetterHandlers(() => ({
    solved,
    spanish,
    cipherLetter,
    directMap,
    index,
    onChange,
    onArrow,
    onFocus,
    checkQuote,
  }));

  if (isLetter(cipherLetter, spanish) && directMap) {
    $effect(() => {
      if (inputValue !== undefined && isLetter(inputValue, spanish)) {
        let vals = Object.values(letterInputs);
        handler.error =
          vals.indexOf(inputValue) != vals.lastIndexOf(inputValue);
      }
    });
  }
</script>

<div
  class="letter-container {cipherTypes[cipherType].letterGap
    ? 'letterGap'
    : ''}"
>
  {#if keyLetter}
    <div class="key-letter unselectable">{keyLetter}</div>
  {/if}
  <div class="cipher-letter unselectable">
    {cipherLetter ? cipherLetter.toUpperCase() : cipherLetter}
  </div>
  {#if isSolvableChunk(cipherLetter, cipherType)}
    <input
      bind:this={inputs[index]}
      class:selected={selected && !solved}
      class:error={handler.error}
      class:focus={handler.focus && !solved}
      type="text"
      placeholder="="
      maxlength="1"
      bind:value={inputValue}
      oninput={handler.handleInput}
      onkeydown={handler.handleKeyDown}
      onfocus={handler.handleFocus}
      onblur={handler.handleBlur}
      readonly={solved}
    />
  {/if}
</div>

<style>
  .unselectable {
    -moz-user-select: -moz-none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .key-letter {
    font-family: "Source Code Pro", monospace;
    font-size: 1rem;
    color: var(--color-link-muted) !important;
  }

  .letter-container {
    display: inline-block;
    text-align: center;
    margin: 0px;
    padding: 0px;
    min-width: 20px;
    max-width: max-content;
  }

  .letter-container.letterGap {
    padding-right: 10px;
  }

  .cipher-letter {
    font-family: "Source Code Pro", monospace;
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 5px;
    position: relative;
    color: white !important;
  }

  input {
    font-family: "Source Code Pro", monospace !important;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 500;
    max-width: 20px;
    width: 100%;
    min-height: 20px;
    height: 70%;
    background-color: transparent;
    border: none;
    outline: none;
    caret-color: transparent;
    border-radius: 2px;
  }

  .selected {
    background-color: var(--table-highlight-bg) !important;
  }

  :not(.error) {
    color: var(--text-primary);
    transition-duration: 0ms;
  }

  .error {
    color: var(--color-error-darker);
  }

  .focus {
    background-color: var(--color-primary-muted) !important;
    animation: focusPulse 1.5s ease-in-out infinite;
    box-shadow: 0 0 4px var(--color-primary-muted);
    transition:
      background-color 0.25s ease,
      box-shadow 0.25s ease;
    border-radius: 4px;
  }

  @keyframes focusPulse {
    0%,
    100% {
      box-shadow: 0 0 4px var(--color-primary-muted);
    }
    50% {
      box-shadow: 0 0 14px var(--color-primary-border);
    }
  }

  input:hover {
    background-color: var(--glass-bg);
    cursor: pointer;
  }

  input::placeholder {
    color: var(--text-muted);
  }
</style>
