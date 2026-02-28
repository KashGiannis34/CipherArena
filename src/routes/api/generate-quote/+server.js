import { json } from '@sveltejs/kit';
import { generateQuote } from '$game/generateQuote';
import { authenticate } from '$utils/authenticate';
import { incrementTotal } from '$utils/statsUtil.js';
import { start_mongo } from '$services/mongo.js';

export async function POST({ request, cookies }) {
  try {
    await start_mongo();

    const params = await request.json();
    const quoteData = await generateQuote(params);

    const auth = authenticate(cookies.get('auth-token'));

    if (auth?.id) {
      await incrementTotal(auth.id, params.cipherType);
    }

    return json(quoteData);
  } catch (err) {
    console.error('Error generating quote:', err);
    return json({ error: 'Failed to generate quote' }, { status: 500 });
  }
}
