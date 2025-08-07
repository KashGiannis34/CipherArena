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

  // Calculator functions
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

    // Update state for the next calculation
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

  // Dragging functions
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

    // Keep calculator within viewport bounds
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

  // Focus management
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
    calculatorFocused = false;
  }

  // Keyboard shortcuts - Fixed to work properly and prevent ghost characters
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
        // If not focused, focus the calculator.
        focusCalculator();
      }
      return;
    }

    // Handle calculator shortcuts if calculator is focused
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

      // Full keyboard support for calculator operations
      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        inputOperation(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clear();
      }
      // Don't handle other keys - let them pass through to other components
    }
  }

  // Zoom animation
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
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #4a5568;
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
    border-color: #2d3748;
  }

  .calculator-container.calculator-focused {
    opacity: 1;
    border-color: #4adede;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 3px rgba(74, 222, 222, 0.4);
  }

  .calculator-container.calculator-focused .calculator-title {
    color: #4adede;
  }

  .calculator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #2d3748, #4a5568);
    border-radius: 13px 13px 0 0;
    border-bottom: 1px solid #4a5568;
  }

  .calculator-title {
    color: white;
    font-weight: bold;
    font-size: 14px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #cbd5e0;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .close-btn:active {
    transform: scale(0.9);
  }

  .calculator-body {
    padding: 16px;
  }

  .display {
    background: #000;
    color: #4adede;
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
    border: 1px solid #4a5568;
    word-break: break-all;
    overflow-wrap: break-word;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .display:focus {
    border-color: #4adede;
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
    background: linear-gradient(145deg, #2d3748, #4a5568);
    border: 1px solid #4a5568;
    color: white;
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
    background: linear-gradient(145deg, #4a5568, #2d3748);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .calc-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .calc-button.number {
    background: linear-gradient(145deg, #3182ce, #2c5282);
  }

  .calc-button.number:hover {
    background: linear-gradient(145deg, #2c5282, #3182ce);
  }

  .calc-button.operator {
    background: linear-gradient(145deg, #8d2fff, #5619f0);
  }

  .calc-button.operator:hover {
    background: linear-gradient(145deg, #5619f0, #8d2fff);
  }

  .calc-button.clear {
    background: linear-gradient(145deg, #e53e3e, #c53030);
  }

  .calc-button.clear:hover {
    background: linear-gradient(145deg, #c53030, #e53e3e);
  }

  .calc-button.equals {
    background: linear-gradient(145deg, #38a169, #2f855a);
    grid-row: span 2;
  }

  .calc-button.equals:hover {
    background: linear-gradient(145deg, #2f855a, #38a169);
  }

  .calc-button.plus {
    grid-row: span 2;
  }

  .calc-button.zero {
    grid-column: span 2;
  }

  .calc-button.decimal {
    background: linear-gradient(145deg, #3182ce, #2c5282);
  }

  .calc-button.decimal:hover {
    background: linear-gradient(145deg, #2c5282, #3182ce);
  }

  /* Mobile responsive */
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