import { mongoose } from 'mongoose';
import { start_mongo } from '$db/mongo';
import { Quote } from '$db/models/Quote';
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
        redirect('307', '/singleplayer');
    }

    try {
        const count = await Quote.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuote = await Quote.findOne().skip(randomIndex);
        const encodedQuote = encodeQuote(structuredClone(randomQuote)["_doc"]["text"], cipherType, searchParams);
        console.log(randomQuote["_doc"]["text"])
        return {
            props: {
                cipherType: cipherType,
                quote: encodedQuote,
                hash: randomQuote["_id"].toString()
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