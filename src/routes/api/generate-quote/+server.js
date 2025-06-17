import { json } from '@sveltejs/kit';
import { generateQuote } from '$dbutils/GenerateQuote';
import { authenticate } from '$dbutils/authenticate';
import { incrementTotal } from '$dbutils/statsUtil.js';

export async function POST({ request, cookies }) {
    try {
        const params = await request.json();
        const quoteData = await generateQuote(params);

        // --- Authenticate user and increment total ---
        const auth = authenticate(cookies.get('auth-token'));
        console.log(auth);
        if (auth?.id) {
            await incrementTotal(auth.id, params.cipherType);
        }

        return json(quoteData);
    } catch (err) {
        console.error('Error generating quote:', err);
        return json({ error: 'Failed to generate quote' }, { status: 500 });
    }
}