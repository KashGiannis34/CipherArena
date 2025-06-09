import { findRandomEntry } from "../db/dbUtil.js";
import { Quote } from "../db/models/Quote.js";
import { Word } from "../db/models/Word.js";
import { cipherTypes } from "../lib/util/CipherTypes.js";
import { encodeQuote } from "../lib/util/CipherUtil.js";

export async function generateQuote(p) {
    const randomQuote = await findRandomEntry(Quote, {length: {$gte: cipherTypes[p['cipherType']]['length'][0], $lte: cipherTypes[p['cipherType']]['length'][1]}});

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
    console.log("randomQuote", randomQuote['text']);

    return {"id": randomQuote["_id"].toString(), "quote": encodedQuote, "keys": keys};
}