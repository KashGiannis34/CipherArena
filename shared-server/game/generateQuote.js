import { findRandomEntry } from "../utils/dbUtil.js";
import { getQuoteModel } from "./getQuoteModel.js";
import { Word } from "../models/Word.js";
import { cipherTypes } from "../shared/CipherTypes.js";
import { encodeQuote, findDeterminant } from "../shared/CipherUtil.js";
import { encryptQuoteId } from "../utils/quoteToken.js";

export async function generateQuote(p) {
    const randomQuote = await findRandomEntry(getQuoteModel(p['cipherType']), {length: {$gte: cipherTypes[p['cipherType']]['length'][0], $lte: cipherTypes[p['cipherType']]['length'][1]}});

    const keyCount = cipherTypes[p['cipherType']]['keys'];
    let keys = [];
    if (p['cipherType'] == 'Affine') {
        const aVals = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
        keys.push(aVals[Math.floor(Math.random() * aVals.length)] * (Math.random() < 0.5 ? -1 : 1));
        keys.push(Math.random() < 0.5 ? Math.floor(Math.random() * 26) - 26 : Math.floor(Math.random() * 25) + 1);
    } else {
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
    }

    const encodedQuote = p['Solve'] == "Decode" ?
        encodeQuote(randomQuote["text"], (p['cipherType'] == 'Patristocrat' ? 'Aristocrat':p['cipherType']), keys, p)
        : randomQuote["text"].split('').map(c => c.toUpperCase());

    const encryptedId = encryptQuoteId(randomQuote["_id"].toString());

    return {"id": encryptedId, "quote": encodedQuote, "keys": keys};
}
