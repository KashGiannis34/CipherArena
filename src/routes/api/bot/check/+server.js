import { json } from '@sveltejs/kit';
import { checkAnswer } from '$db/botService';
import { decrypt } from '$db/backend-utils/cryptoUtil';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { encryptedAnswer, userAnswer, problemData } = await request.json();

		if (!encryptedAnswer) {
			return json({ error: 'Encrypted answer is required' }, { status: 400 });
		}

		if (userAnswer === undefined || userAnswer === null) {
			return json({ error: 'User answer is required' }, { status: 400 });
		}

		let decryptedData;
		try {
			decryptedData = decrypt(encryptedAnswer);
		} catch (error) {
			console.error('Decryption failed:', error);
			return json({
				error: 'Invalid or tampered answer data',
				details: 'The problem data appears to be corrupted'
			}, { status: 400 });
		}

		const { problemType, answer } = decryptedData;

		if (!problemType || !problemData) {
			return json({ error: 'Invalid problem data' }, { status: 400 });
		}

		let processedAnswer = userAnswer;
		if (problemType === 6) {
			if (typeof userAnswer === 'string') {
				try {
					processedAnswer = JSON.parse(userAnswer);
				} catch {
					processedAnswer = userAnswer;
				}
			}
		}

		const result = await checkAnswer(problemType, problemData, processedAnswer);

		if (result.error) {
			return json({
				correct: false,
				error: result.error,
				userAnswer: result.user_answer
			}, { status: 400 });
		}

		return json({
			correct: result.correct,
			userAnswer: result.user_answer,
			...(result.correct ? {} : {
				correctAnswer: result.correct_answer,
				...(result.correct_answer_mod_26 !== undefined && { correctAnswerMod26: result.correct_answer_mod_26 }),
				...(result.correct_answer_letter !== undefined && { correctAnswerLetter: result.correct_answer_letter })
			})
		});
	} catch (error) {
		console.error('Error checking answer:', error);
		return json({
			error: 'Failed to check answer',
			details: error.message
		}, { status: 500 });
	}
}
