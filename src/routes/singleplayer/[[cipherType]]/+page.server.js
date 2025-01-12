import { Quote } from '$db/models/Quote';
import { Word } from '$db/models/Word';
import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { encodeQuote } from '$lib/util/CipherUtil';
import { findRandomEntry } from '$db/dbUtil';
import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export async function load({params, url}) {
    let cipherType = 'Aristocrat';
    let searchParams = url.searchParams;
    if (Object.keys(params).length == 0)
        redirect('307', '/singleplayer/Aristocrat');
    else if (Object.keys(cipherTypes).includes(params['cipherType'])) {
        cipherType = params['cipherType'];
    } else {
        redirect('307', '/singleplayer/Aristocrat');
    }

    try {
        let p = {};
        p['K'] = (searchParams.get('K') == null ? '-1' : searchParams.get('K'));
        p['Solve'] = (searchParams.get('Solve') == null ? 'Decode' : searchParams.get('Solve'));
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

        const encodedQuote = p['Solve'] == "Decode" ? encodeQuote(randomQuote["text"], (cipherType == 'Patristocrat' ? 'Aristocrat':cipherType), keys, searchParams) : randomQuote["text"];

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