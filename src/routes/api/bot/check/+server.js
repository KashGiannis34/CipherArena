import { json } from '@sveltejs/kit';
import { PythonShell } from 'python-shell';
import path from 'path';
import { decrypt } from '$db/backend-utils/cryptoUtil';
import { SECRET_JWT_KEY } from '$env/static/private';

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

		// Decrypt the answer
		let decryptedData;
		try {
			decryptedData = decrypt(encryptedAnswer, SECRET_JWT_KEY);
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

		// For problem type 6 (inverse matrix), userAnswer should be a JSON string of the array
		let answerArg = userAnswer;
		if (problemType === 6 && Array.isArray(userAnswer)) {
			answerArg = JSON.stringify(userAnswer);
		}

		// Prepare arguments for Python script
		const args = [
			'check',
			problemType.toString(),
			JSON.stringify(problemData),
			answerArg.toString()
		];

		const options = {
			mode: 'text',
			pythonPath: 'python',
			pythonOptions: ['-u'],
			scriptPath: path.join(process.cwd(), 'db'),
			args: args
		};

		// Run the Python script
		const results = await PythonShell.run('codebusters_bot.py', options);
		const output = results.join('');
		const result = JSON.parse(output);

		// Handle validation errors from Python (incorrect input types)
		if (result.error) {
			return json({
				correct: false,
				error: result.error,
				userAnswer: result.user_answer
			}, { status: 400 });
		}

		// Return the check result
		return json({
			correct: result.correct,
			userAnswer: result.user_answer,
			// Only return correct answer if the user got it wrong
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
