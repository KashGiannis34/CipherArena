import { json } from '@sveltejs/kit';
import { Quote } from '$db/models/Quote';
import { ObjectId } from 'mongodb';
import { stripQuote, encodeQuote } from '$lib/util/CipherUtil';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
    try {
        const req = await request.json();

        if (req['input'].includes(' ')) {
            return json(false);
        }

        const quote = await Quote.findOne({_id: new ObjectId(req['id'])});
        let ansText = stripQuote(quote["text"]);
        if (req['solve'] == 'Encode') {
            ansText = encodeQuote(ansText, req['cipherType'], req['keys']).join('');
        }

        if (req['input'] === ansText) {
            return json(true);
        } else {
            return json(false);
        }
    } catch (error) {
        console.error('Error validating quote:', error);
        return json('error');
    }
}