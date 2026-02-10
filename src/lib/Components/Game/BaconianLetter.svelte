<script>
  import { cipherTypes } from "$shared/CipherTypes";
  import { isSolvableChunk } from "$shared/CipherUtil";
  import { createLetterHandlers } from "./letterUtils.svelte.js";

  let {
    inputs = $bindable(),
    cipherLetter,
    index,
    inputValue,
    selected,
    onArrow,
    onFocus,
    onChange,
    solved,
    cipherType,
    checkQuote,
  } = $props();

  let baconianToggles = $state(["A", "A", "A", "A", "A"]);

  function toggleBaconian(i) {
    baconianToggles[i] = baconianToggles[i] === "A" ? "B" : "A";
  }

  const handler = createLetterHandlers(() => ({
    solved,
    spanish: false,
    cipherLetter,
    directMap: false,
    index,
    onChange,
    onArrow,
    onFocus,
    checkQuote,
  }));

  // Grapheme splitter (Intl.Segmenter with a regex fallback)
  function splitGraphemes(str) {
    if (!str) return [];
    // prefer modern Intl.Segmenter when available
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      return Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(str),
        (s) => s.segment,
      );
    }
    // fallback: base character plus any combining marks
    // includes common combining mark ranges
    return (
      str.match(
        /[\0-\uFFFF](?:[\u0300-\u036f\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]*)/gu,
      ) || []
    );
  }

  // Split into grapheme clusters and expose as an array for rendering.
  // We normalize to NFC so precomposed characters are used where possible.
  let graphemes = $derived(
    splitGraphemes((cipherLetter || "").normalize("NFC")),
  );

  // Count grapheme clusters to know how many toggles to show
  let charCount = $derived((graphemes || []).length);

  // Build a grid template that inserts a small spacer column after every 5 characters.
  let gridTemplate = $derived(() => {
    const n = charCount || 0;
    const parts = [];
    for (let i = 0; i < n; i++) {
      parts.push("1fr");
      // insert spacer after every 5 chars except at the end
      if ((i + 1) % 5 === 0 && i !== n - 1) parts.push("8px");
    }
    return parts.join(" ");
  });
</script>

<div
  class="letter-container baconian-group unselectable {cipherTypes[cipherType]
    .letterGap
    ? 'letterGap'
    : ''}"
>
  <div class="baconian-grid" style="grid-template-columns: {gridTemplate}">
    {#each baconianToggles.slice(0, charCount) as toggle, i}
      <button
        style="grid-column: {i + Math.floor(i / 5) + 1}; grid-row: 1"
        class={`baconian-toggle unselectable ${toggle === "A" ? "toggleA" : "toggleB"}`}
        onclick={() => toggleBaconian(i)}
      >
        {toggle}
      </button>
    {/each}

    {#each graphemes as g, i}
      <div
        class="grapheme-cell"
        style="grid-column: {i + Math.floor(i / 5) + 1}; grid-row: 2"
      >
        <span class="grapheme unselectable">{g}</span>
      </div>
    {/each}
  </div>
  {#if isSolvableChunk(cipherLetter, cipherType)}
    <input
      bind:this={inputs[index]}
      class:selected={selected && !solved}
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

  .baconian-group {
    min-width: auto;
    max-width: max-content;
  }

  .baconian-grid {
    display: grid;
    grid-auto-rows: auto;
    align-items: end;
    gap: 6px 0;
  }

  .baconian-toggle {
    flex: 1;
    font-family: "Source Code Pro", monospace !important;
    font-size: 0.7rem;
    font-weight: 600;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 1;
    text-align: center;
    transition:
      color 0.15s ease,
      transform 0.15s ease,
      text-shadow 0.15s ease;
  }

  .toggleB {
    color: var(--color-link) !important;
  }

  .toggleA {
    color: var(--color-link-muted) !important;
  }

  .baconian-toggle:hover {
    transform: scale(1.3);
    text-shadow: 0 0 4px currentColor;
  }

  .cipher-letter {
    font-family: "Source Code Pro", monospace !important;
    font-size: 1.1rem;
    font-weight: 500;
    color: white !important;
    padding-bottom: 2px;
  }

  .grapheme-cell {
    font-family: "Source Code Pro", monospace !important;
    overflow: visible;
    line-height: 1.3;
    font-synthesis: none;
  }

  .grapheme {
    display: inline-block;
    font-family: "Source Code Pro", monospace;
    font-size: 1.4rem;
    font-weight: 500;
    color: white !important;
    text-align: center;
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
