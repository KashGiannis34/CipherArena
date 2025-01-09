export function isLetter(character) {
    return character != '' && /^[a-zA-Z]*$/.test(character);
}

export function letterToNumber(char) {
    if (typeof char !== 'string' || char.length !== 1) {
        return -1;
    }
    const charCode = char.toUpperCase().charCodeAt(0);

    if (charCode >= 65 && charCode <= 90) { // A-Z
        return charCode - 65;
    }

    return -1; // Not a letter
}

export function encodeQuote(plaintext, cipherType, searchParams) {
    var ciphertext = '';
    if (cipherType == 'Aristocrat') {
        ciphertext = encodeAristocrat(plaintext, searchParams);
    } else {
        ciphertext = encodeAristocrat(plaintext, searchParams);
    }
    return ciphertext;
}

function encodeAristocrat(plaintext, searchParams) {
    //PREVENT SELF DECODE
    var freqTable = (searchParams.get('k') == null) ? freqTableInit('0'):freqTableInit(searchParams.get('k'));
    var ciphertext = '';
    for (let letter of plaintext) {
        if (letterToNumber(letter) == -1) {
            ciphertext += letter;
        } else {
            ciphertext += freqTable[letterToNumber(letter)];
        }
    }
    return ciphertext;
}

function freqTableInit(k) {
    if (k=='0') {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        for (let i = alphabet.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
            const temp = alphabet[i];
            alphabet[i] = alphabet[j];
            alphabet[j] = temp;
        }
        return alphabet;
    } else {
        return [];
    }
}

export function stripQuote(text) {
    var stripped = '';
    for (let letter of text) {
        if (isLetter(letter)) {
            stripped += letter.toUpperCase();
        }
    }
    return stripped;
}