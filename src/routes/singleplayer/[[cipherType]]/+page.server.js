import { Quote } from '$db/models/Quote';
import { Word } from '$db/models/Word';
import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { encodeQuote } from '$lib/util/CipherUtil';
import { findRandomEntry } from '$db/dbUtil';

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

        const encodedQuote = encodeQuote(randomQuote["text"], (cipherType == 'Patristocrat' ? 'Aristocrat':cipherType), searchParams, keys);

        return {
            props: {
                cipherType: cipherType,
                quote: encodedQuote,
                hash: randomQuote["_id"].toString(),
                keys: JSON.stringify(keys),
                k: (searchParams.get('k') == null ? '0' : searchParams.get('k'))
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