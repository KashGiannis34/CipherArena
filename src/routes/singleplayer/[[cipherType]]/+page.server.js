import { mongoose } from 'mongoose';
import { start_mongo } from '$db/mongo';
import { Quote } from '$db/models/Quote';
import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';

/** @type {import('./$types').PageLoad} */
export async function load({params}) {
    var cipherType = 'Aristocrat';
    if (Object.keys(params).length == 0)
        cipherType = 'Aristocrat';
    else if (!Object.keys(cipherTypes).includes(params['cipherType'])) {
        cipherType = 'Aristocrat'
        redirect('307', '/singleplayer');
    } else {
        cipherType = params['cipherType'];
    }
    try {
        const count = await Quote.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuote = await Quote.findOne().skip(randomIndex);
        const serializedQuote = structuredClone(randomQuote)["_doc"]["text"];
        return {
            props: {
                cipherType: cipherType,
                quote: serializedQuote
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
    // return {
    //     quote: {
    //         text: "This is a hardcoded quote.",
    //         author: "AUTHOR"
    //     }
    // }
}