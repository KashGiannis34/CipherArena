import { json } from '@sveltejs/kit';
import { generateProblem } from '$db/botService';
import { encrypt } from '$db/backend-utils/cryptoUtil';
import { SECRET_JWT_KEY } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { problemType, decimals } = await request.json();

		if (!problemType || problemType < 1 || problemType > 19) {
			return json({ error: 'Invalid problem type. Must be between 1 and 19.' }, { status: 400 });
		}

		// Use the persistent bot service
		const problem = await generateProblem(problemType, decimals);

		if (problem.error) {
			return json({ error: problem.error }, { status: 500 });
		}

		// Extract the answer and other sensitive data
		const sensitiveData = {
			answer: problem.answer,
			problemType: problemType
		};

		// Add additional answer fields based on problem type
		if (problem.answer_mod_26 !== undefined) {
			sensitiveData.answer_mod_26 = problem.answer_mod_26;
		}
		if (problem.correct_answer !== undefined) {
			sensitiveData.correct_answer = problem.correct_answer;
		}
		if (problem.answer_letter !== undefined) {
			sensitiveData.answer_letter = problem.answer_letter;
		}
		if (problem.correct_answer_letter !== undefined) {
			sensitiveData.correct_answer_letter = problem.correct_answer_letter;
		}

		// Encrypt the sensitive data
		const encryptedAnswer = encrypt(sensitiveData, SECRET_JWT_KEY);

		// Remove answer from problem object
		const safeProblem = { ...problem };
		delete safeProblem.answer;
		delete safeProblem.answer_mod_26;
		delete safeProblem.correct_answer;
		delete safeProblem.answer_letter;
		delete safeProblem.correct_answer_letter;

		// Return problem with encrypted answer
		return json({
			...safeProblem,
			encryptedAnswer: encryptedAnswer,
			problemType: problemType
		});
	} catch (error) {
		console.error('Error generating problem:', error);
		return json({
			error: 'Failed to generate problem',
			details: error.message
		}, { status: 500 });
	}
}
