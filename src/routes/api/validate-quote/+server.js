import { json } from '@sveltejs/kit';
import { getQuoteModel } from '$dbutils/getQuoteModel';
import { ObjectId } from 'mongodb';
import { stripQuote, encodeQuote } from '$db/shared-utils/CipherUtil';
import { authenticate } from '$db/backend-utils/authenticate';
import { cipherTypes } from '$db/shared-utils/CipherTypes';
import { incrementWin } from '$dbutils/statsUtil.js';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, cookies }) {
    try {
        const req = await request.json();

        if (req['input'].includes(' ')) return json(false);

        const QuoteModel = getQuoteModel(req['cipherType']);
        const quote = await QuoteModel.findOne({ _id: new ObjectId(req['id']) });
        if (!quote) return json(false);

        let ansText = stripQuote(quote["text"], req['cipherType'] === 'Xenocrypt');
        if (req['solve'] === 'Encode') {
            ansText = encodeQuote(ansText, req['cipherType'], req['keys']).join('');
        }

        const isCorrect = req['input'] === ansText;
        if (!isCorrect) return json(false);

        // --- AUTH + STATS UPDATE ---
        const auth = authenticate(cookies.get('auth-token'));
        if (auth?.id && cipherTypes[req['cipherType']]) {
            const solveTime = req['solveTime'];
            const length = ansText.length;

            if (typeof solveTime === 'number') {
                await incrementWin(auth.id, req['cipherType'], solveTime, length);
            }
        }

        return json(true);
    } catch (error) {
        console.error('Error validating quote:', error);
        return json('error');
    }
}