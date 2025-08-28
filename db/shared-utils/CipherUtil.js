import { cipherTypes } from './CipherTypes.js';
import GraphemeSplitter from 'grapheme-splitter';

let splitter;
function getSplitter() {
  if (!splitter) splitter = new GraphemeSplitter();
  return splitter;
}

export const ENGLISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const SPANISH_ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

export function isLetter(character, isSpanish = false) {
    const alphabet = isSpanish ? SPANISH_ALPHABET : ENGLISH_ALPHABET;
    return alphabet.includes(character ? character.toUpperCase() : character);
}

export function letterToNumber(char, isSpanish = false) {
    if (typeof char !== 'string' || char.length !== 1) return -1;
    const alphabet = isSpanish ? SPANISH_ALPHABET : ENGLISH_ALPHABET;

    const index = alphabet.indexOf(char.toUpperCase());
    return index !== -1 ? index : -1;
}

export function numberToLetter(num, isSpanish = false) {
    const alphabet = isSpanish ? SPANISH_ALPHABET : ENGLISH_ALPHABET;
    return (num >= 0 && num < alphabet.length) ? alphabet[num] : '';
}

function shiftArray(arr, shiftAmount) {
    const length = arr.length;
    shiftAmount = ((shiftAmount % length) + length) % length; // Handle negative shifts

    if (shiftAmount === 0) return arr.slice(); // No shift needed

    return arr.slice(-shiftAmount).concat(arr.slice(0, -shiftAmount));
}

function checkSelfDecode(arr, isSpanish = false) {
    for (let i = 0; i < arr.length; i++) {
        if (letterToNumber(arr[i], isSpanish) === i)
            return true;
    }
    return false;
}

export function encodeQuote(plaintext, cipherType, keys, params) {
    if (cipherType === 'Aristocrat') {
        const k = params['K'] == '-1' ? '0' : params['K'];
        return encodeAristocrat(plaintext, k, keys[0]);
    } else if (cipherType === 'Porta') {
        return encodePorta(plaintext, keys[0]);
    } else if (cipherType === 'Caesar') {
        return encodeCaesar(plaintext);
    } else if (cipherType === 'Atbash') {
        return encodeAtbash(plaintext);
    } else if (cipherType === 'Baconian') {
        return encodeBaconian(plaintext);
    } else if (cipherType === 'Nihilist') {
        return encodeNihilist(plaintext, keys[0], keys[1]);
    } else if (cipherType === 'Xenocrypt') {
        const k = params['K'] == '-1' ? '0' : params['K'];
        return encodeXenocrypt(plaintext, k, keys[0]);
    } else if (cipherType === 'Checkerboard') {
        return encodeCheckerboard(plaintext, keys[0], keys[1], keys[2]);
    } else if (cipherType === 'Hill') {
        return encodeHill(plaintext, keys[0]);
    } else if (cipherType === 'Affine') {
        return encodeAffine(plaintext, keys[0], keys[1]);
    } else {
        return encodeAristocrat(plaintext, '0');
    }
}

export function findDeterminant(word) {
    if (word.length !== 4) return -1;

    const a = letterToNumber(word[0]);
    const b = letterToNumber(word[1]);
    const c = letterToNumber(word[2]);
    const d = letterToNumber(word[3]);

    if (a === -1 || b === -1 || c === -1 || d === -1) return -1;

    return (a * d - b * c + 26) % 26;
}

function encodeHill(plaintext, key) {
    const matrix = [];
    const res = [];
    for (let letter of key) {
        matrix.push(letterToNumber(letter));
    }
    const stripped = stripQuote(plaintext, false);


    for (let i = 0; i < stripped.length; i += 2) {
        const a = letterToNumber(stripped[i]);
        const b = i+1 >= plaintext.length ? 25 : letterToNumber(stripped[i + 1]);

        const c = (matrix[0] * a + matrix[1] * b) % 26;
        const d = (matrix[2] * a + matrix[3] * b) % 26;

        res.push(numberToLetter(c));
        if (i + 1 < stripped.length) {
            res.push(numberToLetter(d));
        }
    }
    return res;
}

function encodeCaesar(plaintext) {
    const shift = Math.floor(Math.random() * 25) + 1;
    const res = [];

    for (let letter of plaintext) {
        const num = letterToNumber(letter);
        if (num === -1) {
            res.push(letter);
        } else {
            res.push(numberToLetter((num + shift) % 26));
        }
    }
    return res;
}

function encodeAtbash(plaintext) {
    const res = [];

    for (let letter of plaintext) {
        const num = letterToNumber(letter);
        if (num === -1) {
            res.push(letter);
        } else {
            res.push(numberToLetter(25 - num));
        }
    }
    return res;
}

function encodeAristocrat(plaintext, k, key) {
    const freqTable = freqTableInit(k || '0', key, false);
    const useInverseMapping = k === '1' || k === '3';
    const ciphertext = [];

    for (let letter of plaintext) {
        if (!isLetter(letter)) {
            ciphertext.push(letter);
        } else {
            ciphertext.push(useInverseMapping
                ? numberToLetter(freqTable.indexOf(letter.toUpperCase()))
                : freqTable[letterToNumber(letter)]
            );
        }
    }

    return ciphertext;
}

function encodeXenocrypt(plaintext, k, key) {
    const freqTable = freqTableInit(k || '0', key, true); // true → include Ñ
    const useInverseMapping = k === '1' || k === '3';
    const ciphertext = [];

    for (let letter of getSplitter().splitGraphemes(plaintext)) {
        const upper = letter.toUpperCase();

        if (!isLetter(letter, true)) {
            ciphertext.push(letter); // Leave punctuation/space unchanged
        } else if (useInverseMapping) {
            const index = freqTable.indexOf(upper);
            ciphertext.push(numberToLetter(index, true));
        } else {
            const num = letterToNumber(upper, true);
            ciphertext.push(freqTable[num]);
        }
    }

    return ciphertext;
}

function encodePorta(plaintext, key) {
    const ciphertext = [];
    let count = 0;
    const length = key.length;

    for (let letter of plaintext) {
        const num = letterToNumber(letter);
        if (num !== -1) {
            const k = letterToNumber(key[count % length]);
            const res = numberToLetter(
                num < 13
                    ? (num + Math.floor(k / 2)) % 13 + 13
                    : (num - Math.floor(k / 2) + 13) % 13
            );
            ciphertext.push(res);
            count++;
        }
    }
    return ciphertext;
}

function setArray(key, alphabet) {
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

function freqTableInit(k, key, isSpanish = false) {
    const baseAlphabet = isSpanish
        ? "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("")
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    if (k === '1' || k === '2') {
        let freqTable = setArray(key, baseAlphabet);
        let selfDecode = false;
        do {
            const shift = Math.floor(Math.random() * baseAlphabet.length);
            freqTable = shiftArray(freqTable, shift);
            selfDecode = checkSelfDecode(freqTable, isSpanish);
        } while (selfDecode);
        return freqTable;
    }

    if (k === '3') {
        let freqTable = setArray(key, baseAlphabet);
        let freqTable2 = [...freqTable];
        let finalTable = [];
        let selfDecode = false;

        do {
            finalTable = [];
            const shift1 = Math.floor(Math.random() * baseAlphabet.length);
            const shift2 = Math.floor(Math.random() * baseAlphabet.length);
            freqTable = shiftArray(freqTable, shift1);
            freqTable2 = shiftArray(freqTable2, shift2);

            for (let n = 0; n < baseAlphabet.length; n++) {
                finalTable[n] = freqTable2[freqTable.indexOf(numberToLetter(n, isSpanish))];
            }

            selfDecode = checkSelfDecode(finalTable, isSpanish);
        } while (selfDecode);

        return finalTable;
    }

    // Default randomized table
    let shuffled;
    do {
        shuffled = [...baseAlphabet];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
    } while (checkSelfDecode(shuffled, isSpanish));
    return shuffled;
}

export const baconianMap = {
    'A': 'AAAAA', 'B': 'AAAAB', 'C': 'AAABA', 'D': 'AAABB',
    'E': 'AABAA', 'F': 'AABAB', 'G': 'AABBA', 'H': 'AABBB',
    'I': 'ABAAA', 'J': 'ABAAA', 'K': 'ABAAB', 'L': 'ABABA',
    'M': 'ABABB', 'N': 'ABBAA', 'O': 'ABBAB', 'P': 'ABBBA',
    'Q': 'ABBBB', 'R': 'BAAAA', 'S': 'BAAAB', 'T': 'BAABA',
    'U': 'BAABB', 'V': 'BAABB', 'W': 'BABAA', 'X': 'BABAB',
    'Y': 'BABBA', 'Z': 'BABBB'
};

const baconianSymbolSets = [
  { aSet: new Set(['.', '·']), bSet: new Set(['-', '—']) },             // Morse-style
  { aSet: new Set(['0']), bSet: new Set(['1']) },                       // Binary

  // Number-based sets
  { aSet: new Set(['1','3','5','7','9']), bSet: new Set(['2','4','6','8','0']) },
  { aSet: new Set(['2','3','5','7']), bSet: new Set(['1','4','6','8','9','0']) },

  // Symbol sets
  { aSet: new Set(['@','$','^','*',')']), bSet: new Set(['!','#','%','&','(']) },

  // Alphabet position sets (0-based indexing: A=0, B=1, ...)
  { aSet: new Set(['A','C','E','G','I','K','M','O','Q','S','U','W','Y']), bSet: new Set(['B','D','F','H','J','L','N','P','R','T','V','X','Z']) },
  { aSet: new Set(['A','B','E','F','I','J','M','N','Q','R','U','V','Y','Z']), bSet: new Set(['C','D','G','H','K','L','O','P','S','T','W','X']) },
  { aSet: new Set(['A','B','C','G','H','I','M','N','O','S','T','U','Y','Z']), bSet: new Set(['D','E','F','J','K','L','P','Q','R','V','W','X']) },

  // emojis
  { aSet: new Set(['😄', '😊', '😂', '😎', '😁']), bSet: new Set(['😢', '😞', '😭', '😔', '😩']) },
  { aSet: new Set(['🔵', '🌀', '💎', '🐳', '🧊']), bSet: new Set(['🔴', '🍓', '🌹', '🔥', '🧨']) },
  { aSet: new Set(['🪐', '🌌', '🚀', '👽', '🌠']), bSet: new Set(['🧬', '🦠', '🧫', '🧪', '🧠']) },
  { aSet: new Set(['🏀', '⚽', '🏈', '🎾', '🏅']), bSet: new Set(['🎨', '🎭', '🎼', '🖌️', '🎬']) },

  // Vowels vs consonants
  { aSet: new Set(['A','E','I','O','U']), bSet: new Set(['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z']) },

  // Prime vs composite alphabet indices
  { aSet: new Set(['C','D','F','H','L','N','R','T','X']), bSet: new Set(['A','B','E','G','I','J','K','M','O','P','Q','S','U','V','W','Y','Z']) },
];

function encodeBaconian(plaintext) {
    const encodingType = Math.random();

    let aGroup, bGroup, baseWord;
    let useDecoratedWordMode = false;

    if (encodingType < 0.3) {
        const { aSet, bSet } = baconianSymbolSets[Math.floor(Math.random() * baconianSymbolSets.length)];
        if (Math.random() < 0.5) {
            aGroup = aSet;
            bGroup = bSet;
        } else {
            aGroup = bSet;
            bGroup = aSet;
        }
    } else if (encodingType < 0.6) {
        const symbols = 'qwertyuiopasdfghjklzxcvbnm!@#$%^&*()_+[]{}|;:,.<>?1234567890QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
        const aChar = symbols.splice(Math.floor(Math.random() * symbols.length), 1)[0];
        const bChar = symbols.splice(Math.floor(Math.random() * symbols.length), 1)[0];
        aGroup = new Set([aChar]);
        bGroup = new Set([bChar]);
    } else if (encodingType < 0.85) {
        const symbols = '!@#$%^&*()_+[]{}|;:,.<>?'.split('');
        const picked = [];
        while (picked.length < 4) {
            const idx = Math.floor(Math.random() * symbols.length);
            const symbol = symbols.splice(idx, 1)[0];
            if (!picked.includes(symbol)) picked.push(symbol);
        }
        const shuffled = picked.sort(() => Math.random() - 0.5);
        aGroup = new Set(shuffled.slice(0, 2));
        bGroup = new Set(shuffled.slice(2, 4));
    } else {
        useDecoratedWordMode = true;

        const fiveLetterWords = ['Globe', 'Funky', 'Crazy', 'Sharp', 'Waves', 'Trick', 'Jelly', 'Flame', 'Dream', 'Bliss', 'Magic', 'Quest', 'Vivid', 'Zesty', 'Frost', 'Grove', 'Haven', 'Jolly', 'Kooky', 'Lunar', 'Pizza'];
        baseWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
        const { aSet, bSet } = generateDecoratedWordSet(baseWord);

        aGroup = Array.from(aSet); // ['̇','̤','́','̕','̰']
        bGroup = Array.from(bSet); // ['̄','̊','̇','͂','̱']
    }

    const ciphertext = [];

    for (let letter of plaintext) {
        if (isLetter(letter)) {
            const code = baconianMap[letter.toUpperCase()] || 'AAAAA';

            if (useDecoratedWordMode) {
                let decoratedWord = '';
                for (let i = 0; i < 5; i++) {
                    const accent = code[i] === 'A' ? aGroup[i] : bGroup[i];
                    decoratedWord += accent;
                }
                ciphertext.push(decoratedWord); // Push full decorated word
            } else {
                ciphertext.push(baconianMapToSymbols(code, aGroup, bGroup));
            }
        }
    }

    return ciphertext;
}

function encodeCheckerboard(plaintext, rowKey, colKey, polybiusKey) {
    const square = generateCheckerboardSquare(rowKey, colKey, polybiusKey);
    const stripped = stripQuote(plaintext, false);

    const coords = [];
    for (let char of stripped) {
        if (isLetter(char)) {
            coords.push(square[char == 'J' ? 'I' : char]);
        }
    }

    return coords;
}

function generateCheckerboardSquare(rowKey, colKey, key) {
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // I/J combined
    key = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    const seen = new Set();
    const square = [];
    const coordsMap = {};

    const fullKey = key + alphabet;

    for (let char of fullKey) {
        if (!seen.has(char) && alphabet.includes(char)) {
            seen.add(char);
            square.push(char);
        }
    }

    for (let i = 0; i < square.length; i++) {
        const row = rowKey[Math.floor(i / 5)];
        const col = colKey[i % 5];
        coordsMap[square[i]] = row + col;
    }

    return coordsMap;
}

function generateDecoratedWordSet(baseWord) {
    const combiningMarks = [
    '\u0300', // grave `
    '\u0301', // acute ´
    '\u0302', // circumflex ^
    '\u0303', // tilde ~
    '\u0304', // macron ¯
    '\u0307', // dot above
    '\u0308', // diaeresis ¨
    '\u030C', // caron ˇ
    '\u0323', // dot below
    '\u0332'  // low line (underline)
    ];

    function getRandomMarks(count, excludeSet = new Set()) {
    const available = combiningMarks.filter(mark => !excludeSet.has(mark));
    return Array.from({ length: count }, () =>
        available[Math.floor(Math.random() * available.length)]
    );
    }

    const aSet = [];
    const bSet = [];

    let aWord = '';
    let bWord = '';
    const usedPairs = new Set(); // Track used a/b marks for each position

    for (let i = 0; i < 5; i++) {
        const exclude = new Set();
        const aMark = getRandomMarks(1)[0];
        exclude.add(aMark);
        const bMark = getRandomMarks(1, exclude)[0];

        const aChar = baseWord[i] + aMark;
        const bChar = baseWord[i] + bMark;

        aSet.push(aChar);
        bSet.push(bChar);
    }

    return { aSet: new Set(aSet), bSet: new Set(bSet) };
}

function baconianMapToSymbols(baconianText, aGroup, bGroup) {
    const aChars = Array.from(aGroup);
    const bChars = Array.from(bGroup);
    let ciphertext = '';

    for (let letter of baconianText) {
        if (letter === 'A') {
            ciphertext += aChars[Math.floor(Math.random() * aChars.length)];
        } else if (letter === 'B') {
            ciphertext += bChars[Math.floor(Math.random() * bChars.length)];
        }
    }
    return ciphertext;
}

function encodeNihilist(plaintext, keyword, polybiusKey) {
    const square = generatePolybiusSquare(polybiusKey);
    const stripped = stripQuote(plaintext, false); // remove spaces, punctuation, lowercase
    const keywordCoords = getCoordsFromKeyword(keyword, square);

    const coords = [];
    for (let char of stripped) {
        if (isLetter(char)) {
            coords.push(square[char == 'J' ? 'I' : char]);
        }
    }

    const ciphertext = [];
    for (let i = 0; i < coords.length; i++) {
        const value = coords[i] + keywordCoords[i % keywordCoords.length];
        ciphertext.push(value);
    }

    return ciphertext.map(n => n.toString().padStart(2, '0'));
}

function encodeAffine(plaintext, a, b) {
    const ciphertext = [];

    for (let letter of plaintext) {
        const num = letterToNumber(letter);
        if (num != -1) {
            const encodedNum = ((a * num + b) % 26 + 26) % 26;
            ciphertext.push(numberToLetter(encodedNum));
        }
    }

    return ciphertext;
}

function generatePolybiusSquare(key) {
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // I/J combined
    key = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    const seen = new Set();
    const square = [];
    const coordsMap = {};

    const fullKey = key + alphabet;

    for (let char of fullKey) {
        if (!seen.has(char) && alphabet.includes(char)) {
            seen.add(char);
            square.push(char);
        }
    }

    for (let i = 0; i < square.length; i++) {
        const row = Math.floor(i / 5) + 1;
        const col = (i % 5) + 1;
        coordsMap[square[i]] = row*10 + col;
    }

    return coordsMap;
}

function getCoordsFromKeyword(keyword, square) {
    const stripped = keyword.toUpperCase().replace(/J/g, 'I');
    const coords = [];

    for (let char of stripped) {
        if (isLetter(char)) {
            coords.push(square[char == 'J' ? 'I' : char]);
        }
    }

    return coords;
}

export function stripQuote(text, isSpanish) {
    const graphemes = getSplitter().splitGraphemes(text);
    let stripped = '';
    for (let letter of graphemes) {
        if (isLetter(letter, isSpanish)) {
            stripped += letter.toUpperCase();
        }
    }
    return stripped;
}

export function isSolvableChunk(chunk, cipherType) {
    if (!cipherTypes[cipherType].bypassCheck) {
        if (chunk && chunk.length == 1 && isLetter(chunk[0], cipherType == 'Xenocrypt')) {
            return true;
        } else {
            return false;
        }
    } else {
        return chunk !== '';
    }
}