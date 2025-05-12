import { json } from '@sveltejs/kit';
import { generateQuote } from '$db/GenerateQuote';

export async function POST({ request }) {
    try {
        const params = await request.json();
        const quoteData = await generateQuote(params);
        return json(quoteData);
    } catch (err) {
        console.error('Error generating quote:', err);
        return json({ error: 'Failed to generate quote' }, { status: 500 });
    }
}
