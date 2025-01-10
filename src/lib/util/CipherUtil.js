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

export function numberToLetter(num) {
    if (num < 0 || num > 25) {
        return '';
    }

    return String.fromCharCode(65+num);
}

function shiftArray(arr, shiftAmount) {
    // Create a copy of the array to avoid modifying original
    const copy = arr.slice();

    // Calculate the effective shift amount by taking modulo of array length
    shiftAmount = shiftAmount % copy.length;

    // Use splice to 'cut' the part to be shifted and add it to the end
    const shiftedPart = copy.splice(0, shiftAmount);
    copy.push(...shiftedPart);

    return copy;
}

function checkSelfDecode(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (letterToNumber(arr[i]) == i)
            return true;
    }
    return false;
}

export function encodeQuote(plaintext, cipherType, searchParams, keys) {
    var ciphertext = '';
    if (cipherType == 'Aristocrat') {
        ciphertext = encodeAristocrat(plaintext, searchParams, keys[0]);
    } else if (cipherType == 'Porta') {
        ciphertext = encodePorta(plaintext, keys[0]);
    } else {
        ciphertext = encodeAristocrat(plaintext, searchParams);
    }
    return ciphertext;
}

function encodeAristocrat(plaintext, searchParams, key) {
    var freqTable = (searchParams.get('k') == null) ? freqTableInit('0'):freqTableInit(searchParams.get('k'), key);
    var ciphertext = '';
    for (let letter of plaintext) {
        if (isLetter(letter) == false) {
            ciphertext += letter;
        } else {
            if (searchParams.get('k') == '1' || searchParams.get('k') == '3')
                ciphertext += numberToLetter(freqTable.indexOf(letter.toUpperCase()));
            else
                ciphertext += freqTable[letterToNumber(letter)];
        }
    }
    return ciphertext;
}

function encodePorta(plaintext, key) {
    // var freqTable = (searchParams.get('k') == null) ? freqTableInit('0'):freqTableInit(searchParams.get('k'));
    // var ciphertext = '';
    // for (let letter of plaintext) {
    //     if (letterToNumber(letter) == -1) {
    //         ciphertext += letter;
    //     } else {
    //         ciphertext += freqTable[letterToNumber(letter)];
    //     }
    // }
    return plaintext;
}

function freqTableInit(k, key) {
    if (k=='1' || k=='2') {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        var freqTable = [];
        var count = 0;
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
        var selfDecode = false;
        do {
            const shift = (Math.random() * 26);
            freqTable = shiftArray(freqTable, shift);
            selfDecode = checkSelfDecode(freqTable);
        } while (selfDecode);

        return freqTable;
    } else if (k=='3') {

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
    var stripped = '';
    for (let letter of text) {
        if (isLetter(letter)) {
            stripped += letter.toUpperCase();
        }
    }
    return stripped;
}