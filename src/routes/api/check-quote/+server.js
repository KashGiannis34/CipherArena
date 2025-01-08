import { mongoose } from 'mongoose';
import { Quote } from '$db/models/Quote';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
    try {
        const req = await request.json();
        console.log("req:",req);
        const quote = await Quote.findById(id);

        const isCorrect = decodedQuote.trim() === quote.text.trim();
        return {
            status: 200,
            body: { correct: isCorrect }
        };
    } catch (error) {
        console.error('Error validating quote:', error);
        return {
            status: 500,
            body: { error: 'Failed to validate quote' }
        };
    }
}