import { json } from '@sveltejs/kit';
import { generateProblem } from '$bots/botService';
import { encrypt } from '$utils/cryptoUtil';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { problemType, decimals } = await request.json();

		if (!problemType || problemType < 1 || problemType > 20) {
			return json({ error: 'Invalid problem type. Must be between 1 and 20.' }, { status: 400 });
		}

		const problem = await generateProblem(problemType, decimals);

		if (problem.error) {
			return json({ error: problem.error }, { status: 500 });
		}

		const sensitiveData = {
			answer: problem.answer,
			problemType: problemType
		};

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

		const encryptedAnswer = encrypt(sensitiveData);

		const safeProblem = { ...problem };
		delete safeProblem.answer;
		delete safeProblem.answer_mod_26;
		delete safeProblem.correct_answer;
		delete safeProblem.answer_letter;
		delete safeProblem.correct_answer_letter;

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
