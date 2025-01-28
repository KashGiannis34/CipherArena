import { Quote } from '$db/models/Quote';
import { Word } from '$db/models/Word';
import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { encodeQuote } from '$lib/util/CipherUtil';
import { findRandomEntry } from '$db/dbUtil';
import { browser } from '$app/environment';
import { start_mongo } from '$db/mongo';

/** @type {import('./$types').PageLoad} */
export async function load({params, url}) {
    const cipherType = params['cipherType'] && cipherTypes[params['cipherType']] ? params['cipherType'] : 'Redirect';
    if (cipherType === 'Redirect') {
        return redirect(307, '/singleplayer/Aristocrat');
    }

    try {
        const searchParams = url.searchParams;
        let p = {};
        p['K'] = searchParams.get('K') || '-1';
        p['Solve'] = searchParams.get('Solve') || 'Decode';
        const randomQuote = await findRandomEntry(Quote, {length: {$gte: cipherTypes[cipherType]['length'][0], $lte: cipherTypes[cipherType]['length'][1]}});

        const keyCount = cipherTypes[params['cipherType']]['keys'];
        let keys = [];
        for (let keyName of keyCount) {
            let randomWord = '';
            do {
                randomWord = await findRandomEntry(Word, {length: { $gte: 5, $lte: 9}})
            } while (keys.includes(randomWord));
            keys.push(randomWord["text"].toUpperCase());
        }

        const encodedQuote = p['Solve'] == "Decode" ?
            encodeQuote(randomQuote["text"], (cipherType == 'Patristocrat' ? 'Aristocrat':cipherType), keys, searchParams)
            : randomQuote["text"];

        return {
            props: {
                cipherType: cipherType,
                quote: encodedQuote,
                hash: randomQuote["_id"].toString(),
                keys: JSON.stringify(keys),
                params: p
            }
        };
    } catch (error) {
        console.error('Error fetching quote:', error);
        return {
            props: {
                error: 'Failed to fetch quote from db'
            }
        };
    }
}