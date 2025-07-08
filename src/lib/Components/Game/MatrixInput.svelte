<script>
  let { keyword = "ABCD", encode = true } = $props();

  // 1) Letter matrix from keyword
  let letterMatrix = [
    [keyword[0], keyword[1]],
    [keyword[2], keyword[3]],
  ];

  // 2) Numeric matrix inputs (encode & decode)
  let numMatrix = $state([
    ["",""],
    ["",""],
  ]);

  // 3) det⁻¹ input
  let detInv = $state("");
  let detInv2 = $state(""); // for reuse in adjugate calculation

  // 4) Adjugate inputs (shared two places)
  let adj = $state([
    ["",""],
    ["",""],
  ]);

  // 5) Final inverse matrix inputs
  let inverse = $state([
    ["",""],
    ["",""],
  ]);

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

  function sanitize(e, i, j, arr) {
    let v = e.target.value;
    if (v === "-" || /^-?\d{1,2}$/.test(v)) {
      // strip leading zeros
      if (/^-?0\d/.test(v)) {
        v = v.startsWith("-")
          ? "-" + String(parseInt(v.slice(1),10))
          : String(parseInt(v,10));
      }
      arr[i][j] = v;
    } else {
      // revert
      e.target.value = arr[i][j];
    }
  }

  function sanitizeScalar(e) {
    let v = e.target.value;
    if (v === "-" || /^-?\d{1,2}$/.test(v)) {
      if (/^-?0\d/.test(v)) {
        v = v.startsWith("-")
          ? "-" + String(parseInt(v.slice(1),10))
          : String(parseInt(v,10));
      }
      detInv = v;
    } else {
      e.target.value = detInv;
    }
  }

  function moveCaretToEnd(e) {
    const input = e.target;
    // wait for the browser’s internal focus logic to finish
    requestAnimationFrame(() => {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }
</script>

<div class="equation">
  <!-- 1) Letter matrix -->
  <span>(</span>
  <div class="matrix">
    {#each letterMatrix as row}
      <div class="row">
        {#each row as L}
          <div class="cell">{L}</div>
        {/each}
      </div>
    {/each}
  </div>
  <span>)</span>{#if !encode}<sup>⁻¹</sup>{/if}

  {#if encode}
    <!-- ENCODE: = numeric inputs -->
    <span>=</span>
    <span>(</span>
    <div class="matrix">
      {#each numMatrix as row, i}
        <div class="row">
          {#each row as _, j}
            <input
              type="text"
              placeholder="="
              bind:value={numMatrix[i][j]}
              onkeydown={handleKeydown}
              oninput={(e) => sanitize(e,i,j,numMatrix)}

            />
          {/each}
        </div>
      {/each}
    </div>
    <span>)</span>
  {:else}
    <!-- DECODE chain: = numeric inputs = det⁻¹ × adj = detInv × adj = inverse -->
    <span>=</span>

    <!-- numeric inputs -->
    <span>(</span>
    <div class="matrix">
      {#each numMatrix as row, i}
        <div class="row">
          {#each row as _, j}
            <input
              type="text"
              placeholder="="
              bind:value={numMatrix[i][j]}
              onkeydown={handleKeydown}
              oninput={(e) => sanitize(e,i,j,numMatrix)}

            />
          {/each}
        </div>
      {/each}
    </div>
    <span>)</span><sup>⁻¹</sup>

    <!-- det⁻¹ -->
    <span>=</span>
    <input
      class="scalar"
      placeholder="="
      type="text"
      bind:value={detInv}
      onkeydown={handleKeydown}
      oninput={sanitizeScalar}

    /><sup>⁻¹</sup>

    <!-- × adjugate -->
    <span>×</span>
    <span>(</span>
    <div class="matrix">
      {#each adj as row, i}
        <div class="row">
          {#each row as _, j}
            <input
              type="text"
              placeholder="="
              bind:value={adj[i][j]}
              onkeydown={handleKeydown}
              oninput={(e) => sanitize(e,i,j,adj)}

            />
          {/each}
        </div>
      {/each}
    </div>
    <span>)</span>

    <!-- = detInv × adjugate (reuse same adj) -->
    <span>=</span>
    <input
      class="scalar"
      placeholder="="
      type="text"
      bind:value={detInv2}
      onkeydown={handleKeydown}
      oninput={sanitizeScalar}

    />
    <span>×</span>
    <span>(</span>
    <div class="matrix">
      {#each adj as row, i}
        <div class="row">
          {#each row as _, j}
            <input
              type="text"
              placeholder="="
              bind:value={adj[i][j]}
              onkeydown={handleKeydown}
              oninput={(e) => sanitize(e,i,j,adj)}

            />
          {/each}
        </div>
      {/each}
    </div>
    <span>)</span>

    <!-- = final inverse inputs -->
    <span>=</span>
    <span>(</span>
    <div class="matrix">
      {#each inverse as row, i}
        <div class="row">
          {#each row as _, j}
            <input
              type="text"
              placeholder="="
              bind:value={inverse[i][j]}
              onkeydown={handleKeydown}
              oninput={(e) => sanitize(e,i,j,inverse)}

            />
          {/each}
        </div>
      {/each}
    </div>
    <span>)</span>
  {/if}
</div>

<style>
.equation {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(0.14rem, 0.4rem, 0.64rem);
  font-family: 'Times New Roman', serif;
  line-height: clamp(1.8rem, 2.52rem, 3.15rem);
  white-space: nowrap;
}
/* ——— Make all spans & superscripts big ——— */
.equation span{
  font-size: clamp(1.5rem, 3rem, 4.5rem);
  line-height: inherit;
  margin-left: clamp(0.135rem, 0.252rem, 0.36rem);
  margin-right: clamp(0.135rem, 0.252rem, 0.36rem);
}
.equation sup {
  font-size: clamp(0.9rem, 1.8rem, 2.7rem);
}
/* ——— Keep your inputs at their original size ——— */
.equation input {
  font-size: clamp(0.72rem, 0.99rem, 1.26rem);
  line-height: clamp(1.62rem, 2.25rem, 2.88rem);
}
.matrix {
  display: inline-flex;
  flex-direction: column;
  gap: clamp(0.135rem, 0.225rem, 0.315rem);
  flex-shrink: 0;
}
.row {
  display: flex;
  gap: clamp(0.225rem, 0.36rem, 0.495rem);
}
input, .cell {
  width: auto;
  max-width: 3.08rem;
  height: clamp(1.62rem, 2.25rem, 2.88rem);
  text-align: center;
  font-size: clamp(0.72rem, 0.99rem, 1.26rem);
  border-radius: clamp(1.8px, 3.6px, 5.4px);
  color: white;
  background-color: transparent;
  border: none;
  outline: none;
  caret-color: white;
  font-size: inherit;
  font-family: 'Source Code Pro', monospace !important;
  padding: none;
  margin-left: 0.15rem;
  margin-right: 0.15rem;
}
input:placeholder-shown {
  caret-color: transparent;
}
input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.20) !important;
}
input:hover {
  background-color: #ffffff0a;
  cursor: pointer;
}
/* Media queries for additional responsiveness */
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
  .equation input {
    font-size: 0.81rem;
    line-height: 1.8rem;
  }
  input, .cell {
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
  .equation input {
    font-size: 0.72rem;
    line-height: 1.62rem;
  }
  input, .cell {
    max-width: 2.25rem;
    height: 1.62rem;
    font-size: 0.72rem;
  }
}
</style>