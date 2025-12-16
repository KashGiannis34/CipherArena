<script>
  import { onMount, onDestroy } from 'svelte';
  import { cubicOut } from "svelte/easing";

  let { visible = false, onClose, position = { x: 100, y: 100 }, onFocusSwitch, calculatorFocused = $bindable(), toggleCalculator } = $props();

  let calculatorElement = $state();
  let isDragging = $state(false);
  let dragOffset = $state({ x: 0, y: 0 });
  let display = $state('0');
  let previousValue = $state(null);
  let operation = $state(null);
  let waitingForNumber = $state(false);
  let justCalculated = $state(false);
  let calculatorDisplayElement = $state();
  let lastOperation = $state(null);
  let lastValue = $state(null);

  function inputNumber(num) {
    if (waitingForNumber || display === '0' || justCalculated) {
      display = num;
      waitingForNumber = false;
      justCalculated = false;
    } else {
      display = display + num;
    }
  }

  function inputDecimal() {
    if (justCalculated) {
      display = '0.';
      justCalculated = false;
    } else if (waitingForNumber) {
      display = '0.';
      waitingForNumber = false;
    } else if (!display.includes('.')) {
      display = display + '.';
    }
  }

  function inputOperation(op) {
    if (previousValue === null) {
      previousValue = parseFloat(display);
    } else if (!waitingForNumber) {
      calculate();
    }

    operation = op;
    waitingForNumber = true;
    justCalculated = false;
  }

  function calculate() {
    let current;
    let op;

    if (justCalculated && lastOperation) {
      current = lastValue;
      op = lastOperation;
    } else {
      if (previousValue === null || operation === null || waitingForNumber) {
        return;
      }
      current = parseFloat(display);
      op = operation;

      lastOperation = operation;
      lastValue = current;
    }

    let result;

    switch (op) {
      case '+':
        result = previousValue + current;
        break;
      case '-':
        result = previousValue - current;
        break;
      case '*':
        result = previousValue * current;
        break;
      case '/':
        if (current === 0) {
          display = 'Error';
          clear();
          return;
        }
        result = previousValue / current;
        break;
      default:
        return;
    }

    if (isNaN(result) || !isFinite(result)) {
      display = 'Error';
      clear();
      return;
    }

    result = Math.round(result * 1000000000) / 1000000000;
    display = result.toString();

    previousValue = result;
    operation = null;
    waitingForNumber = true;
    justCalculated = true;
  }

  function clear() {
    display = '0';
    previousValue = null;
    operation = null;
    waitingForNumber = false;
    justCalculated = false;
    lastOperation = null;
    lastValue = null;
  }

  function handleMouseDown(e) {
    if (e.target.closest('.calc-button') || e.target.closest('.close-btn')) {
      return;
    }

    isDragging = true;
    const rect = calculatorElement.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    const rect = calculatorElement.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    position.x = Math.max(0, Math.min(newX, maxX));
    position.y = Math.max(0, Math.min(newY, maxY));
  }

  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  function focusCalculator() {
    if (calculatorElement) {
      calculatorElement.focus();
      calculatorFocused = true;
    }
  }

  function handleCalculatorFocus() {
    calculatorFocused = true;
  }

  function handleCalculatorBlur() {
    setTimeout(() => {
      if (!calculatorElement.contains(document.activeElement)) {
        calculatorFocused = false;
      }
    }, 0);
  }

  function handleKeydown(e) {
    if (!visible) return;

    if (e.altKey && e.key.toLowerCase() === 'k' && calculatorFocused) {
      e.preventDefault();
      e.stopPropagation();
      toggleCalculator();
      return;
    }

    if (e.altKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      e.stopPropagation();

      if (calculatorFocused) {
        if (onFocusSwitch) {
          calculatorFocused = false;
          onFocusSwitch();
        }
      } else {
        focusCalculator();
      }
      return;
    }

    if (calculatorFocused) {
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        e.stopPropagation();
        const moveSpeed = e.shiftKey ? 50 : 10;

        switch (e.key) {
          case 'ArrowUp':
            position.y -= moveSpeed;
            break;
          case 'ArrowDown':
            position.y += moveSpeed;
            break;
          case 'ArrowLeft':
            position.x -= moveSpeed;
            break;
          case 'ArrowRight':
            position.x += moveSpeed;
            break;
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        inputOperation(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C' || e.key === 'Delete') {
        clear();
      }
    }
  }

  function zoom(node, { duration = 300 }) {
    return {
      duration,
      css: t => {
        const eased = cubicOut(t);
        return `
          transform: scale(${eased});
          opacity: ${eased};
        `;
      }
    };
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });
</script>

{#if visible}
  <div
    class="calculator-container"
    class:calculator-focused={calculatorFocused}
    bind:this={calculatorElement}
    style="left: {position.x}px; top: {position.y}px;"
    onmousedown={handleMouseDown}
    onclick={focusCalculator}
    onkeydown={handleKeydown}
    onfocus={handleCalculatorFocus}
    onblur={handleCalculatorBlur}
    in:zoom
    out:zoom
    role="dialog"
    aria-label="Calculator"
    tabindex="0"
  >
    <div class="calculator-header">
      <div class="calculator-title">🧮 Calculator</div>
      <button class="close-btn" onclick={onClose} aria-label="Close calculator">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="calculator-body">
      <div
        class="display"
        bind:this={calculatorDisplayElement}
        tabindex="-1"
        role="textbox"
        aria-label="Calculator display"
        aria-readonly="true"
      >
        {display}
      </div>

      <div class="button-grid">
        <!-- Row 1 -->
        <button class="calc-button clear" onclick={clear}>C</button>
        <button class="calc-button operator" onclick={() => inputOperation('/')}>/</button>
        <button class="calc-button operator" onclick={() => inputOperation('*')}>×</button>
        <button class="calc-button operator" onclick={() => inputOperation('-')}>-</button>

        <!-- Row 2 -->
        <button class="calc-button number" onclick={() => inputNumber('7')}>7</button>
        <button class="calc-button number" onclick={() => inputNumber('8')}>8</button>
        <button class="calc-button number" onclick={() => inputNumber('9')}>9</button>
        <button class="calc-button operator plus" onclick={() => inputOperation('+')}>+</button>

        <!-- Row 3 -->
        <button class="calc-button number" onclick={() => inputNumber('4')}>4</button>
        <button class="calc-button number" onclick={() => inputNumber('5')}>5</button>
        <button class="calc-button number" onclick={() => inputNumber('6')}>6</button>
        <!-- Plus button spans 2 rows -->

        <!-- Row 4 -->
        <button class="calc-button number" onclick={() => inputNumber('1')}>1</button>
        <button class="calc-button number" onclick={() => inputNumber('2')}>2</button>
        <button class="calc-button number" onclick={() => inputNumber('3')}>3</button>
        <button class="calc-button equals" onclick={calculate}>=</button>

        <!-- Row 5 -->
        <button class="calc-button number zero" onclick={() => inputNumber('0')}>0</button>
        <button class="calc-button decimal" onclick={inputDecimal}>.</button>
        <!-- Equals button spans 2 rows -->
      </div>
    </div>
  </div>
{/if}

<style>
  .calculator-container {
    position: fixed;
    z-index: 1000;
    background: linear-gradient(135deg, var(--color-bg-card-alt), var(--color-bg-elevated));
    border: 2px solid var(--color-gray-border);
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
    user-select: none;
    cursor: move;
    min-width: 280px;
    backdrop-filter: blur(10px);
    transition: opacity 0.3s ease, border-color 0.3s ease;
  }

  .calculator-container:not(.calculator-focused) {
    opacity: 0.6;
    border-color: var(--color-gray-border-dark);
  }

  .calculator-container.calculator-focused {
    opacity: 1;
    border-color: var(--color-accent);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 3px var(--color-accent-muted);
  }

  .calculator-container.calculator-focused .calculator-title {
    color: var(--color-accent);
  }

  .calculator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, var(--color-gray-border-dark), var(--color-gray-border));
    border-radius: 13px 13px 0 0;
    border-bottom: 1px solid var(--color-gray-border);
  }

  .calculator-title {
    color: var(--text-primary);
    font-weight: bold;
    font-size: 14px;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--glass-bg-hover);
    color: var(--text-primary);
  }

  .close-btn:active {
    transform: scale(0.9);
  }

  .calculator-body {
    padding: 16px;
  }

  .display {
    background: var(--color-bg-dark);
    color: var(--color-accent);
    padding: 16px;
    text-align: right;
    font-family: 'Source Code Pro', monospace;
    font-size: 24px;
    font-weight: bold;
    border-radius: 8px;
    margin-bottom: 16px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border: 1px solid var(--color-gray-border);
    word-break: break-all;
    overflow-wrap: break-word;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .display:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(74, 222, 222, 0.2);
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 8px;
    height: 320px;
  }

  .calc-button {
    background: linear-gradient(145deg, var(--color-gray-border-dark), var(--color-gray-border));
    border: 1px solid var(--color-gray-border);
    color: var(--text-primary);
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .calc-button:hover {
    background: linear-gradient(145deg, var(--color-gray-border), var(--color-gray-border-dark));
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .calc-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .calc-button.number {
    background: var(--gradient-btn-blue);
  }

  .calc-button.number:hover {
    background: linear-gradient(145deg, var(--color-blue-dark), var(--color-blue-mid));
  }

  .calc-button.operator {
    background: linear-gradient(145deg, var(--color-primary), var(--color-primary-dark));
  }

  .calc-button.operator:hover {
    background: linear-gradient(145deg, var(--color-primary-dark), var(--color-primary));
  }

  .calc-button.clear {
    background: var(--gradient-btn-error);
  }

  .calc-button.clear:hover {
    background: linear-gradient(145deg, var(--color-error-darkest), var(--color-error-darker));
  }

  .calc-button.equals {
    background: var(--gradient-btn-success);
    grid-row: span 2;
  }

  .calc-button.equals:hover {
    background: linear-gradient(145deg, var(--color-success-darker), var(--color-success-dark));
  }

  .calc-button.plus {
    grid-row: span 2;
  }

  .calc-button.zero {
    grid-column: span 2;
  }

  .calc-button.decimal {
    background: var(--gradient-btn-blue);
  }

  .calc-button.decimal:hover {
    background: linear-gradient(145deg, var(--color-blue-dark), var(--color-blue-mid));
  }

  @media (max-width: 768px) {
    .calculator-container {
      min-width: 240px;
    }

    .display {
      font-size: 20px;
      padding: 12px;
    }

    .calc-button {
      font-size: 16px;
    }

    .button-grid {
      gap: 6px;
      height: 280px;
    }
  }

  @media (max-width: 480px) {
    .calculator-container {
      min-width: 220px;
    }

    .display {
      font-size: 18px;
      padding: 10px;
    }

    .calc-button {
      font-size: 14px;
    }

    .button-grid {
      gap: 4px;
      height: 240px;
    }
  }
</style>