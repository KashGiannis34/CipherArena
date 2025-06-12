import { cipherTypes } from './CipherTypes.js';

let splitter;
function getSplitter() {
  if (!splitter) splitter = new GraphemeSplitter();
  return splitter;
}

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

    if (charCode >= 97 && charCode <= 122) { // a-z
        return charCode - 97;
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
    } else {
        return encodeAristocrat(plaintext, '0');
    }
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
    const freqTable = freqTableInit(k || '0', key);
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
    const stripped = stripQuote(plaintext); // remove spaces, punctuation, lowercase
    const keywordCoords = getCoordsFromKeyword(keyword, square);

    const coords = [];
    for (let char of stripped) {
        if (square[char]) {
            coords.push(square[char]);
        }
    }

    const ciphertext = [];
    for (let i = 0; i < coords.length; i++) {
        const value = coords[i] + keywordCoords[i % keywordCoords.length];
        ciphertext.push(value);
    }

    return ciphertext.map(n => n.toString().padStart(2, '0'));
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
        if (square[char]) {
            coords.push(square[char]);
        }
    }

    return coords;
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

export function isSolvableChunk(chunk, cipherType) {
    if (!cipherTypes[cipherType].bypassCheck) {
        return chunk && chunk.length == 1 && isLetter(chunk[0]);
    } else {
        return chunk !== '';
    }
}