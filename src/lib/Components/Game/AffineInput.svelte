<script>
  let { keys, encode = true } = $props();

  // keys[0] is 'a', keys[1] is 'b'
  let a = keys[0];
  let b = keys[1];

  // For decode inputs
  let aInverse = $state("");
  let bValue = $state("");
  let aInverse2 = $state("");
  let finalA = $state("");
  let finalB = $state("");

  // allowed keys and sanitization
  const keyWhitelist = new Set([
    "0","1","2","3","4","5","6","7","8","9","-",
    "Backspace","Delete","ArrowLeft","ArrowRight","Tab"
  ]);

  function handleKeydown(e) {
    // only allow digits, minus, navigation, backspace, delete
    if (!keyWhitelist.has(e.key)) {
      e.preventDefault();
    }
    // only one "-" at pos 0
    if (e.key === "-" && e.target.selectionStart !== 0) {
      e.preventDefault();
    }
    // max length 3 including "-" (e.g. "-12") or 2 digits
    const val = e.target.value;
    const sel = val.slice(e.target.selectionStart, e.target.selectionEnd);
    const nextLen = val.length - sel.length + 1;
    if (/\d/.test(e.key) && nextLen > (val.startsWith("-") ? 3 : 2)) {
      e.preventDefault();
    }
  }

  function sanitizeScalar(e, stateVar) {
    let v = e.target.value;
    if (v === "-" || /^-?\d{1,2}$/.test(v)) {
      if (/^-?0\d/.test(v)) {
        v = v.startsWith("-")
          ? "-" + String(parseInt(v.slice(1),10))
          : String(parseInt(v,10));
      }
      // Update the appropriate state variable
      if (stateVar === 'aInverse') aInverse = v;
      else if (stateVar === 'bValue') bValue = v;
      else if (stateVar === 'aInverse2') aInverse2 = v;
      else if (stateVar === 'finalA') finalA = v;
      else if (stateVar === 'finalB') finalB = v;
    } else {
      // revert
      if (stateVar === 'aInverse') e.target.value = aInverse;
      else if (stateVar === 'bValue') e.target.value = bValue;
      else if (stateVar === 'aInverse2') e.target.value = aInverse2;
      else if (stateVar === 'finalA') e.target.value = finalA;
      else if (stateVar === 'finalB') e.target.value = finalB;
    }
  }
</script>

<div class="equation">
  {#if encode}
    <!-- ENCODE: ax + b = 3x + 7 (no inputs, just display) -->
    <div style="padding-bottom: 1rem;">
        <span>ax + b = </span>
        <span class="result">{a}x + {b}</span>
    </div>
  {:else}
    <!-- DECODE: a^-1 * (x - b) = 3^-1 * (x - 5) = 9 * (x - 5) = 9x + 7 -->
    <span>a</span><sup>-1</sup>
    <span>· (x - b) = </span>

    <!-- First step: user inputs a^-1 -->
    <input
      class="scalar"
      placeholder="a"
      type="text"
      bind:value={aInverse}
      onkeydown={handleKeydown}
      oninput={(e) => sanitizeScalar(e, 'aInverse')}
    /><sup>-1</sup>
    <span>· (x - </span>
    <input
      class="scalar"
      placeholder="b"
      type="text"
      bind:value={bValue}
      onkeydown={handleKeydown}
      oninput={(e) => sanitizeScalar(e, 'bValue')}
    />
    <span>) = </span>

    <!-- Second step: simplified a^-1 -->
    <input
      class="scalar"
      placeholder="a⁻¹"
      type="text"
      bind:value={aInverse2}
      onkeydown={handleKeydown}
      oninput={(e) => sanitizeScalar(e, 'aInverse2')}
    />
    <span>· (x - </span>
    <input
      class="scalar"
      placeholder="b"
      type="text"
      bind:value={bValue}
      onkeydown={handleKeydown}
      oninput={(e) => sanitizeScalar(e, 'bValue')}
    />
    <span>) = </span>

    <!-- Final step: expanded form -->
    <input
      class="scalar"
      placeholder="a⁻¹"
      type="text"
      bind:value={finalA}
      onkeydown={handleKeydown}
      oninput={(e) => sanitizeScalar(e, 'finalA')}
    />
    <span>x + </span>
    <input
      class="scalar"
      placeholder="c"
      type="text"
      bind:value={finalB}
      onkeydown={handleKeydown}
      oninput={(e) => sanitizeScalar(e, 'finalB')}
    />
  {/if}
</div>

<style>
.equation {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(0.14rem, 0.3rem, 0.5rem);
  font-family: 'Times New Roman', serif;
  line-height: clamp(1.8rem, 2.52rem, 3.15rem);
  white-space: nowrap;
}

.equation span {
  font-size: clamp(1.3rem, 2.6rem, 3.9rem);
  line-height: inherit;
  margin-left: clamp(0.135rem, 0.252rem, 0.36rem);
  margin-right: clamp(0.135rem, 0.252rem, 0.36rem);
}

.equation sup {
  font-size: clamp(0.7rem, 1.4rem, 2.1rem);
}

.result {
  color: #4adede;
  font-weight: bold;
}

.scalar {
  width: auto;
  max-width: 4.2rem;
  height: clamp(1.8rem, 2.52rem, 3.15rem);
  text-align: center;
  font-size: 2.8vw !important;
  line-height: clamp(1.8rem, 2.52rem, 3.15rem);
  border-radius: clamp(1.8px, 3.6px, 5.4px);
  color: white;
  background-color: transparent;
  border: none;
  outline: none;
  caret-color: white;
  font-family: 'Source Code Pro', monospace !important;
  padding: 0;
  margin-left: 0.15rem;
  margin-right: 0.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.scalar:placeholder-shown {
  caret-color: transparent;
}

.scalar:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.20) !important;
}

.scalar:hover {
  background-color: #ffffff0a;
  cursor: pointer;
}

@media (max-width: 768px) {
  .equation {
    gap: 0.27rem;
  }
  .equation span {
    font-size: 2.25rem;
    margin-left: 0.18rem;
    margin-right: 0.18rem;
  }
  .equation sup {
    font-size: 1.125rem;
  }
  .scalar {
    max-width: 2.52rem;
    height: 1.8rem;
    font-size: 0.81rem;
  }
}

@media (max-width: 480px) {
  .equation {
    gap: 0.18rem;
  }
  .equation span {
    font-size: 1.8rem;
    margin-left: 0.135rem;
    margin-right: 0.135rem;
  }
  .equation sup {
    font-size: 0.9rem;
  }
  .scalar {
    max-width: 2.25rem;
    height: 1.62rem;
    font-size: 0.72rem;
  }
}
</style>