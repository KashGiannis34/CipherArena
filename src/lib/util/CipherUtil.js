export function isLetter(character) {
    return character !== '' && character !== ' ' && /^[a-zA-Z]*$/.test(character);
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

export function numberToLetter(num) {
    if (num < 0 || num > 25) {
        return '';
    }

    return String.fromCharCode(65+num);
}

function shiftArray(arr, shiftAmount) {
    const length = arr.length;
    shiftAmount = ((shiftAmount % length) + length) % length; // Handle negative shifts

    if (shiftAmount === 0) return arr.slice(); // No shift needed

    return arr.slice(-shiftAmount).concat(arr.slice(0, -shiftAmount));
}

function checkSelfDecode(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (letterToNumber(arr[i]) == i)
            return true;
    }
    return false;
}

export function encodeQuote(plaintext, cipherType, searchParams, keys) {
    let ciphertext = '';
    if (cipherType == 'Aristocrat') {
        ciphertext = encodeAristocrat(plaintext, searchParams, keys[0]);
    } else if (cipherType == 'Porta') {
        ciphertext = encodePorta(plaintext, keys[0]);
    } else if (cipherType == 'Caesar') {
        ciphertext = encodeCaesar(plaintext);
    } else if (cipherType == 'Atbash') {
        ciphertext = encodeAtbash(plaintext);
    } else {
        ciphertext = encodeAristocrat(plaintext, searchParams);
    }
    return ciphertext;
}

function encodeCaesar(plaintext) {
    let res = '';
    let shift = (Math.random() * 25)+1;
    for (let letter of plaintext) {
        const num = letterToNumber(letter);
        if (num == -1)
            res += letter;
        else
            res += numberToLetter((num+shift) % 26);
    }
    return res;
}

function encodeAtbash(plaintext) {
    let res = '';
    for (let letter of plaintext) {
        const num = letterToNumber(letter);
        if (num == -1)
            res += letter
        else
            res += numberToLetter(25-letterToNumber(letter));
    }
    return res;
}

function encodeAristocrat(plaintext, searchParams, key) {
    const freqTable = freqTableInit(searchParams.get('k') || '0', key);
    let ciphertext = '';
    const useInverseMapping = searchParams.get('k') === '1' || searchParams.get('k') === '3';
    let upperPlaintext = plaintext.toUpperCase();

    for (let letter of upperPlaintext) {
        if (!isLetter(letter)) {
            ciphertext += letter; // Directly append non-letters
        } else {
            const index = letterToNumber(letter);
            ciphertext += useInverseMapping
                ? numberToLetter(freqTable.indexOf(letter.toUpperCase()))
                : freqTable[index];
        }
    }
    return ciphertext;
}

function encodePorta(plaintext, key) {
    let ciphertext = '';
    let count = 0;
    let length = key.length;
    for (let letter of plaintext) {
        const num = letterToNumber(letter);
        if (num == -1) {
            ciphertext += letter;
        } else {
            const k = letterToNumber(key[count % length]);
            const res = numberToLetter(num < 13 ? (num + Math.floor(k/2))%13 + 13 : (num - Math.floor(k/2))%13);
            ciphertext += res;
            count++;
        }
    }
    return ciphertext;
}

function setArray(key) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let freqTable = [];
    let count = 0;
    for (let i = 0; i < key.length; i++) {
        if (freqTable.includes(key[i]))
            continue;
        else {
            freqTable[count] = key[i];
            count++;
        }
    }
    for (let letter of alphabet) {
        if (freqTable.includes(letter))
            continue;
        else {
            freqTable[count] = letter;
            count++;
        }
    }
    return freqTable;
}

function freqTableInit(k, key) {
    if (k=='1' || k=='2') {
        let freqTable = setArray(key);
        let selfDecode = false;
        do {
            const shift = (Math.random() * 26);
            freqTable = shiftArray(freqTable, shift);
            selfDecode = checkSelfDecode(freqTable);
        } while (selfDecode);

        return freqTable;
    } else if (k=='3') {
        let freqTable = setArray(key);
        let freqTable2 = freqTable;
        let finalTable = [];
        let selfDecode = false;

        do {
            finalTable = [];
            const shift1 = (Math.random() * 26);
            const shift2 = (Math.random() * 26);
            freqTable = shiftArray(freqTable, shift1);
            freqTable2 = shiftArray(freqTable2, shift2);
            for (let n = 0; n < 26; n++) {
                finalTable[n] = freqTable2[freqTable.indexOf(numberToLetter(n))];
            }
            selfDecode = checkSelfDecode(finalTable);
        } while (selfDecode);

        return finalTable;
    } else {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        for (let i = alphabet.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
            const temp = alphabet[i];
            alphabet[i] = alphabet[j];
            alphabet[j] = temp;
        }
        return alphabet;
    }
}

export function stripQuote(text) {
    let stripped = '';
    for (let letter of text) {
        if (isLetter(letter)) {
            stripped += letter.toUpperCase();
        }
    }
    return stripped;
}