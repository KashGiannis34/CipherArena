import { isLetter } from "$shared/CipherUtil";

/**
 * Creates shared input handlers for cipher letter components.
 * @param {() => object} getCtx - Getter returning current reactive props:
 *   { solved, spanish, cipherLetter, directMap, index, onChange, onArrow, onFocus, checkQuote }
 */
export function createLetterHandlers(getCtx) {
  let error = $state(false);
  let focus = $state(false);

  function handleKeyDown(event) {
    const ctx = getCtx();
    if (ctx.solved) return;

    if (event.altKey) {
      event.preventDefault();
      return;
    }

    const deleteKeys = ["Backspace", "Delete"];

    if (event.key == "," && ctx.spanish && ctx.cipherLetter != "Ñ") {
      ctx.onChange(ctx.cipherLetter, "Ñ", ctx.index);
      event.preventDefault();
      return;
    }

    if (
      event.key == "ArrowLeft" ||
      event.key == "ArrowRight" ||
      event.key == " " ||
      event.key == "Tab"
    ) {
      ctx.onArrow(event.key, ctx.index);
      event.preventDefault();
      return;
    }

    if (event.key == "Enter") {
      ctx.checkQuote();
    }

    if (deleteKeys.includes(event.key)) {
      ctx.onChange(ctx.cipherLetter, "", ctx.index);
      return;
    }

    if (
      !isLetter(event.key) ||
      (event.key.toUpperCase() == ctx.cipherLetter && ctx.directMap)
    ) {
      event.preventDefault();
      return;
    }

    if (
      event.key !== undefined &&
      isLetter(event.key) &&
      event.key.length == 1
    ) {
      ctx.onChange(ctx.cipherLetter, event.key.toUpperCase(), ctx.index);
      event.preventDefault();
      return;
    }
  }

  function handleInput(event) {
    const ctx = getCtx();
    if (ctx.solved) return;

    let character = event.data;
    if (character != null && isLetter(character)) {
      character = character.toUpperCase();
    }
    ctx.onChange(ctx.cipherLetter, character, ctx.index);
  }

  function handleFocus() {
    const ctx = getCtx();
    if (ctx.solved) return;
    ctx.onFocus(ctx.cipherLetter, true);
    focus = true;
  }

  function handleBlur() {
    const ctx = getCtx();
    ctx.onFocus(ctx.cipherLetter, false);
    focus = false;
  }

  return {
    get error() {
      return error;
    },
    set error(v) {
      error = v;
    },
    get focus() {
      return focus;
    },
    handleKeyDown,
    handleInput,
    handleFocus,
    handleBlur,
  };
}
