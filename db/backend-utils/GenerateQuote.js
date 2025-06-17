import { findRandomEntry } from "./dbUtil.js";
import { getQuoteModel } from "./getQuoteModel.js";
import { Word } from "./Word.js";
import { cipherTypes } from "../shared-utils/CipherTypes.js";
import { encodeQuote } from "../shared-utils/CipherUtil.js";

export async function generateQuote(p) {
    const randomQuote = await findRandomEntry(getQuoteModel(p['cipherType']), {length: {$gte: cipherTypes[p['cipherType']]['length'][0], $lte: cipherTypes[p['cipherType']]['length'][1]}});

    const keyCount = cipherTypes[p['cipherType']]['keys'];
    let keys = [];
    for (let keyName of keyCount) {
        let randomWord = '';
        do {
            randomWord = await findRandomEntry(Word, {length: { $gte: 5, $lte: 9}})
        } while (keys.includes(randomWord));
        keys.push(randomWord["text"].toUpperCase());
    }

    const encodedQuote = p['Solve'] == "Decode" ?
        encodeQuote(randomQuote["text"], (p['cipherType'] == 'Patristocrat' ? 'Aristocrat':p['cipherType']), keys, p)
        : randomQuote["text"].split('').map(c => c.toUpperCase());

    return {"id": randomQuote["_id"].toString(), "quote": encodedQuote, "keys": keys};
}