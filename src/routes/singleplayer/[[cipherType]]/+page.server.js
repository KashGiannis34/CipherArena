import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { generateQuote } from '$db/GenerateQuote';

/** @type {import('./$types').PageLoad} */
export async function load({params, url}) {
    const cipherType = params['cipherType'] && cipherTypes[params['cipherType']] ? params['cipherType'] : 'Redirect';
    if (cipherType === 'Redirect') {
        return redirect(303, '/singleplayer/Aristocrat');
    }

    try {
        const searchParams = url.searchParams;
        let p = {};
        p['K'] = searchParams.get('K') || '-1';
        p['Solve'] = searchParams.get('Solve') || 'Decode';
        p['cipherType'] = params['cipherType'];
        const generatedQuote = await generateQuote(p);

        return {
            props: {
                cipherType: p['cipherType'],
                quote: generatedQuote['quote'],
                hash: generatedQuote['id'],
                keys: JSON.stringify(generatedQuote['keys']),
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