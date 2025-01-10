import { Quote } from '$db/models/Quote';
import { Word } from '$db/models/Word';
import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { encodeQuote } from '$lib/util/CipherUtil';
import { ObjectId } from 'mongodb';

/** @type {import('./$types').PageLoad} */
export async function load({params, url}) {
    var cipherType = 'Aristocrat';
    var searchParams = url.searchParams;
    if (Object.keys(params).length == 0)
        cipherType = 'Aristocrat';
    else if (Object.keys(cipherTypes).includes(params['cipherType'])) {
        cipherType = params['cipherType'];
    } else {
        cipherType = 'Aristocrat';
        redirect('307', '/singleplayer/Aristocrat');
    }

    try {
        const count = await Quote.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuote = await Quote.findOne().skip(randomIndex);

        const keyCount = cipherTypes[params['cipherType']]['keys'];
        var keys = [];
        for (let keyName of keyCount) {
            var randomWord = '';
            do {
                const count = await Word.countDocuments({length: { $gte: 5, $lte: 9}});
                const randomIndex = Math.floor(Math.random() * count);
                randomWord = await Word.findOne({length: { $gte: 5, $lte: 9}}).skip(randomIndex);
            } while (keys.includes(randomWord));
            keys.push(randomWord["text"].toUpperCase());
        }

        const encodedQuote = encodeQuote(randomQuote["text"], cipherType, searchParams, keys);

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