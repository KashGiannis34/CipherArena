import { isLetter } from '$shared/CipherUtil';

/** Handles keyboard navigation and input for cipher letter inputs. */
export function createInputHandler({
    getIsSolved,
    getCipherLetter,
    getIndex,
    getDirectMap = () => true,
    isSpanish = false,
    onChange,
    onArrow,
    checkQuote
}) {
    return function handleKeyDown(event) {
        if (getIsSolved()) return;

        if (event.altKey) {
            event.preventDefault();
            return;
        }

        const deleteKeys = ['Backspace', 'Delete'];
        const cipherLetter = getCipherLetter();
        const index = getIndex();
        const directMap = getDirectMap();

        if (event.key === ',' && isSpanish) {
            onChange(cipherLetter, 'Ñ', index);
            event.preventDefault();
            return;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Tab') {
            onArrow(event.key, index);
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter' && checkQuote) {
            checkQuote();
            return;
        }

        if (deleteKeys.includes(event.key)) {
            onChange(cipherLetter, '', index);
            return;
        }

        if (!isLetter(event.key) || (event.key.toUpperCase() === cipherLetter && directMap)) {
            event.preventDefault();
            return;
        }

        if (event.key !== undefined && isLetter(event.key) && event.key.length === 1) {
            onChange(cipherLetter, event.key.toUpperCase(), index);
            event.preventDefault();
            return;
        }
    };
}

/** Handles direct input events (mobile, paste, etc). */
export function createInputEventHandler({ getIsSolved, getCipherLetter, getIndex, onChange }) {
    return function handleInput(event) {
        if (getIsSolved()) return;

        let character = event.data;
        if (character != null && isLetter(character)) {
            character = character.toUpperCase();
        }
        onChange(getCipherLetter(), character, getIndex());
    };
}

/** Creates focus/blur handlers for letter highlighting. */
export function createFocusHandlers({ getIsSolved, getCipherLetter, onFocus, setLocalFocus }) {
    return {
        handleFocus() {
            if (getIsSolved()) return;
            onFocus(getCipherLetter(), true);
            setLocalFocus(true);
        },
        handleBlur() {
            onFocus(getCipherLetter(), false);
            setLocalFocus(false);
        }
    };
}

/** Checks for duplicate letter assignments (error state). */
export function checkDuplicateAssignment(inputValue, letterInputs, isSpanish = false) {
    if (inputValue === undefined || !isLetter(inputValue, isSpanish)) {
        return false;
    }
    const vals = Object.values(letterInputs);
    return vals.indexOf(inputValue) !== vals.lastIndexOf(inputValue);
}
