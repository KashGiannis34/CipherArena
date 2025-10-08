// Test script for Codebusters Bot API (with encryption)
// Run with: node test-bot-api.js

const API_BASE = 'http://localhost:5173'; // Update with your dev server URL

async function testGenerate(problemType, decimals = undefined) {
	console.log(`\n=== Testing Generate - Type ${problemType} ===`);

	const body = { problemType };
	if (decimals !== undefined) {
		body.decimals = decimals;
	}

	try {
		const response = await fetch(`${API_BASE}/api/bot/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		const data = await response.json();
		console.log('Generated problem:', JSON.stringify(data, null, 2));

		// Check that answer is encrypted
		if (data.encryptedAnswer) {
			console.log('✓ Answer is encrypted');
		} else {
			console.log('✗ Answer is not encrypted!');
		}

		return data;
	} catch (error) {
		console.error('Error:', error.message);
		return null;
	}
}

async function testCheck(encryptedAnswer, problemData, userAnswer, problemType) {
	console.log(`\n=== Testing Check - Type ${problemType} ===`);
	console.log('User answer:', userAnswer);

	try {
		const response = await fetch(`${API_BASE}/api/bot/check`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				encryptedAnswer,
				problemData,
				userAnswer
			})
		});

		const data = await response.json();
		console.log('Check result:', JSON.stringify(data, null, 2));

		if (data.correct) {
			console.log('✓ Answer is correct!');
		} else {
			console.log('✗ Answer is incorrect');
			console.log('Correct answer:', data.correctAnswer);
		}

		return data;
	} catch (error) {
		console.error('Error:', error.message);
		return null;
	}
}

async function runTests() {
	console.log('Starting Codebusters Bot API Tests (with encryption)');
	console.log('Make sure your dev server is running!');

	// Test Type 1: Two-digit multiplication
	console.log('\n' + '='.repeat(60));
	const prob1 = await testGenerate(1);
	if (prob1 && prob1.encryptedAnswer) {
		// Test with a likely wrong answer first
		await testCheck(prob1.encryptedAnswer, prob1, 5, 1);

		// Note: We can't test correct answer without knowing it
		// In a real scenario, the user would submit their answer
		console.log('Note: Cannot verify correct answer without decrypting');
	}

	// Test Type 2: Letter to value
	console.log('\n' + '='.repeat(60));
	const prob2 = await testGenerate(2);
	if (prob2 && prob2.encryptedAnswer) {
		// Try with a guess
		await testCheck(prob2.encryptedAnswer, prob2, 5, 2);
	}

	// Test Type 4: Shift letter
	console.log('\n' + '='.repeat(60));
	const prob4 = await testGenerate(4);
	if (prob4 && prob4.encryptedAnswer) {
		await testCheck(prob4.encryptedAnswer, prob4, 'Z', 4);
	}

	// Test Type 5: Shift word
	console.log('\n' + '='.repeat(60));
	const prob5 = await testGenerate(5);
	if (prob5 && prob5.encryptedAnswer) {
		await testCheck(prob5.encryptedAnswer, prob5, 'TESTING', 5);
	}

	// Test Type 7: Mod 26
	console.log('\n' + '='.repeat(60));
	const prob7 = await testGenerate(7);
	if (prob7 && prob7.encryptedAnswer) {
		await testCheck(prob7.encryptedAnswer, prob7, 13, 7);
	}

	// Test Type 15: Memorize decimals with precision
	console.log('\n' + '='.repeat(60));
	const prob15 = await testGenerate(15, 3);
	if (prob15 && prob15.encryptedAnswer) {
		await testCheck(prob15.encryptedAnswer, prob15, 10, 15);
	}

	// Test tampering detection
	console.log('\n' + '='.repeat(60));
	console.log('\n=== Testing Tamper Detection ===');
	const tamperTest = await testGenerate(1);
	if (tamperTest && tamperTest.encryptedAnswer) {
		// Try to modify the encrypted answer
		const tamperedAnswer = tamperTest.encryptedAnswer.slice(0, -5) + 'AAAAA';
		console.log('Attempting to use tampered encrypted answer...');
		await testCheck(tamperedAnswer, tamperTest, 5, 1);
	}

	console.log('\n' + '='.repeat(60));
	console.log('\n=== Tests Complete ===');
}

// Run all tests
runTests().catch(console.error);
