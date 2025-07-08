import { findRandomEntry } from "./dbUtil.js";
import { getQuoteModel } from "./getQuoteModel.js";
import { Word } from "./Word.js";
import { cipherTypes } from "../shared-utils/CipherTypes.js";
import { encodeQuote, findDeterminant } from "../shared-utils/CipherUtil.js";

export async function generateQuote(p) {
    const randomQuote = await findRandomEntry(getQuoteModel(p['cipherType']), {length: {$gte: cipherTypes[p['cipherType']]['length'][0], $lte: cipherTypes[p['cipherType']]['length'][1]}});

    const keyCount = cipherTypes[p['cipherType']]['keys'];
    let keys = [];
    for (let keyName of keyCount) {
        let randomWord = '';
        do {
            if (keyName != 'polybius key' && p['cipherType'] == 'Checkerboard') {
                randomWord = await findRandomEntry(Word, {length: 5});
                continue;
            }
            if (p['cipherType'] == 'Hill') {
                let determinant = -1;
                do {
                    randomWord = await findRandomEntry(Word, {length: 4});
                    determinant = findDeterminant(randomWord["text"].toUpperCase());
                } while (determinant == -1 || determinant % 2 == 0 || determinant % 13 == 0);
                continue;
            }
            randomWord = await findRandomEntry(Word, {length: { $gte: 5, $lte: 9}})
        } while (keys.includes(randomWord));
        keys.push(randomWord["text"].toUpperCase());
    }

    const encodedQuote = p['Solve'] == "Decode" ?
        encodeQuote(randomQuote["text"], (p['cipherType'] == 'Patristocrat' ? 'Aristocrat':p['cipherType']), keys, p)
        : randomQuote["text"].split('').map(c => c.toUpperCase());

    return {"id": randomQuote["_id"].toString(), "quote": encodedQuote, "keys": keys};
}