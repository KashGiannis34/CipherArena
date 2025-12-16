<script>
	import Container from '$lib/Components/General/Container.svelte';
	import { onDestroy } from 'svelte';

	const problemTypes = [
		{ value: 1, label: '1. Two-digit Multiplication', ciphers: ['hill', 'affine'] },
		{ value: 2, label: '2. Letter to Value', ciphers: ['caesar', 'atbash', 'affine', 'hill'] },
		{ value: 3, label: '3. Three-digit Subtraction', ciphers: ['nihilist'] },
		{ value: 4, label: '4. Shift Letter', ciphers: ['caesar', 'porta', 'atbash'] },
		{ value: 5, label: '5. Shift Word', ciphers: ['caesar', 'porta', 'atbash'] },
		{ value: 6, label: '6. Inverse Matrix', ciphers: ['hill'] },
		{ value: 7, label: '7. Mod 26', ciphers: ['caesar', 'affine', 'hill'] },
		{ value: 8, label: '8. Modular Inverse', ciphers: ['affine'] },
		{ value: 9, label: '9. Affine Letter', ciphers: ['affine'] },
		{ value: 10, label: '10. Affine Word', ciphers: ['affine'] },
		{ value: 11, label: '11. Hill Word', ciphers: ['hill'] },
		{ value: 12, label: '12. Baconian', ciphers: ['baconian'] },
		{ value: 13, label: '13. Binary to Decimal', ciphers: ['baconian'] },
		{ value: 14, label: '14. Remainder Cheese', ciphers: ['affine', 'hill'] },
		{ value: 15, label: '15. Memorize Decimals', ciphers: ['affine', 'hill'] },
		{ value: 16, label: '16. Atbash Letter', ciphers: ['atbash'] },
		{ value: 17, label: '17. Atbash Word', ciphers: ['atbash'] },
		{ value: 18, label: '18. Nihilist Encode', ciphers: ['nihilist'] },
		{ value: 19, label: '19. Nihilist Decode', ciphers: ['nihilist'] },
		{ value: 20, label: '20. Nihilist Decode (with key letter)', ciphers: ['nihilist'] }
	];

	const displayTypes = problemTypes.map(({ value, label, ciphers }) => {
		const [, ...rest] = label.split('. ');
		return {
			value,
			label,
			number: value.toString().padStart(2, '0'),
			name: rest.join('. ') || label,
			ciphers: ciphers || []
		};
	});

	let currentProblem = $state(null);
	let userAnswer = $state('');
	let result = $state(null);
	let loading = $state(false);
	let selectedType = $state(displayTypes[0]?.value ?? 1);
	let searchTerm = $state('');
	let loopEnabled = $state(false);
	let shuffleEnabled = $state(false);
	let answerLocked = $state(false);
	let autoAdvanceTimeout;
	let errorMessage = $state(null);

	let normalizedSearch = $derived(searchTerm.trim().toLowerCase());
	let filteredTypes =
		$derived(normalizedSearch.length === 0
			? displayTypes
			: displayTypes.filter((type) =>
					`${type.number} ${type.name}`.toLowerCase().includes(normalizedSearch)
			  ));
	let selectedDescriptor = $derived(displayTypes.find((type) => type.value === selectedType));
	let selectedSummaryNumber = $derived(selectedDescriptor?.number ?? selectedType.toString().padStart(2, '0'));
	let selectedSummaryName = $derived(selectedDescriptor?.name ?? 'Unknown mode');

	onDestroy(() => {
		if (autoAdvanceTimeout) {
			clearTimeout(autoAdvanceTimeout);
		}
	});

	function clearAutoAdvance() {
		if (autoAdvanceTimeout) {
			clearTimeout(autoAdvanceTimeout);
			autoAdvanceTimeout = null;
		}
	}

	function scheduleAutoAdvance(delay) {
		clearAutoAdvance();
		autoAdvanceTimeout = setTimeout(() => {
			goToNextProblem({ triggeredByLoop: true });
		}, delay);
	}

	function toggleShuffle() {
		shuffleEnabled = !shuffleEnabled;
	}

	function toggleLoop() {
		loopEnabled = !loopEnabled;
		if (!loopEnabled) {
			clearAutoAdvance();
			answerLocked = false;
		}
	}

	async function generateProblem() {
		clearAutoAdvance();
		loading = true;
		result = null;
		userAnswer = '';
		answerLocked = false;
		errorMessage = null;

		try {
			const response = await fetch('/api/bot/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					problemType: selectedType,
					...(selectedType === 15 ? { decimals: 3 } : {})
				})
			});

			currentProblem = await response.json();

			if (currentProblem.error) {
				errorMessage = currentProblem.error;
				currentProblem = null;
			}
		} catch (error) {
			console.error('Error generating problem:', error);
			errorMessage = 'Failed to generate problem. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function checkAnswer() {
		if (!userAnswer.trim()) {
			errorMessage = 'Please enter an answer';
			return;
		}

		loading = true;
		errorMessage = null;

		try {
			const response = await fetch('/api/bot/check', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					encryptedAnswer: currentProblem.encryptedAnswer,
					problemData: currentProblem,
					userAnswer: userAnswer
				})
			});

			result = await response.json();

			if (result.error) {
				errorMessage = result.error;
				if (!result.correct) {
					result = { ...result, correct: false };
				}
			}
			if (loopEnabled && !result.error) {
				answerLocked = true;
				const delay = result.correct ? 1000 : 2000;
				scheduleAutoAdvance(delay);
			}
		} catch (error) {
			console.error('Error checking answer:', error);
			errorMessage = 'Failed to check answer. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter' && userAnswer.trim()) {
			checkAnswer();
		}
	}

	function handleTypeSelect(typeValue) {
		if (selectedType !== typeValue) {
			selectedType = typeValue;
			result = null;
			userAnswer = '';
			errorMessage = null;
		}
	}

	function chooseNextType() {
		if (!shuffleEnabled) {
			return selectedType;
		}

		if (displayTypes.length <= 1) {
			return selectedType;
		}

		let nextType = selectedType;
		let attempts = 0;
		while (nextType === selectedType && attempts < 10) {
			nextType = displayTypes[Math.floor(Math.random() * displayTypes.length)].value;
			attempts += 1;
		}

		return nextType;
	}

	function goToNextProblem({ triggeredByLoop: _triggeredByLoop = false } = {}) {
		if (loading) {
			return;
		}

		clearAutoAdvance();

		const nextType = chooseNextType();
		selectedType = nextType;
		result = null;
		userAnswer = '';
		answerLocked = false;
		errorMessage = null;

		generateProblem();
	}
</script>

<svelte:head>
	<title>Codebusters Practice Bot</title>
</svelte:head>

<div class="page">
	<Container style="--minWidth: clamp(320px, 90vw, 960px); --maxWidth: min(960px, 90vw); --flexDir: column; padding-top: 30px; padding-left: 40px; padding-right: 40px;">
		<div class="bot-practice">
			<h1>Codebusters Practice Bot</h1>
			<p class="subtitle">Master the basics for math based and repetition based ciphers.</p>

			<div class="controls">
				<div class="mode-picker">
					<div class="picker-header">
						<div>
							<span class="picker-subtitle">Choose a challenge</span>
							<h2 class="picker-title">Problem Modes</h2>
						</div>
						<div class="search-wrapper">
							<input
								class="search-input"
								type="search"
								placeholder="Search modes..."
								bind:value={searchTerm}
							/>
						</div>
					</div>

					<div class="mode-grid" role="radiogroup" aria-label="Problem mode selection">
						{#each filteredTypes as type (type.value)}
							<button
								type="button"
								class="mode-card"
								class:selected={selectedType === type.value}
								onclick={() => handleTypeSelect(type.value)}
								role="radio"
								aria-checked={selectedType === type.value}
								title={type.label}
							>
								<span class="mode-number">#{type.number}</span>
								<span class="mode-name">{type.name}</span>
							</button>
						{/each}
					</div>

					{#if filteredTypes.length === 0}
						<p class="no-results">No modes match that search. Try another keyword.</p>
					{/if}
				</div>

				<div class="controls-footer">
					<div class="selected-summary">
						<span>Selected:</span>
						<strong>Type {selectedSummaryNumber} — {selectedSummaryName}</strong>
					</div>

					<div class="playback-controls" role="group" aria-label="Practice playback controls">
						<button
							type="button"
							class="playback-btn"
							class:active={shuffleEnabled}
							onclick={toggleShuffle}
							aria-pressed={shuffleEnabled}
							aria-label={shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
							title={shuffleEnabled ? 'Shuffle on' : 'Shuffle off'}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/>
                                <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/>
                            </svg>
						</button>

						<button
							type="button"
							class="playback-btn primary"
							onclick={() => goToNextProblem()}
							disabled={loading || !selectedDescriptor || (loopEnabled && answerLocked)}
							aria-label="Next problem"
							title="Next problem"
						>
							<span class="next-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24">
									<path d="M5 4.5v15l11-7.5-11-7.5Zm13 0h1.5v15H18Z" />
								</svg>
							</span>
							<span class="next-label">Next Problem</span>
						</button>

						<button
							type="button"
							class="playback-btn"
							class:active={loopEnabled}
							onclick={toggleLoop}
							aria-pressed={loopEnabled}
							aria-label={loopEnabled ? 'Disable loop' : 'Enable loop'}
							title={loopEnabled ? 'Loop on' : 'Loop off'}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-repeat" viewBox="0 0 16 16">
                                <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z"/>
                            </svg>
						</button>
					</div>
				</div>
			</div>

			{#if currentProblem && !currentProblem.error}
				<div class="problem">
					<div class="problem-header">
						<span class="problem-type">Type {currentProblem.problemType}</span>
						<div class="cipher-tags">
							{#each displayTypes.find(t => t.value === currentProblem.problemType)?.ciphers || [] as cipher}
								<span class="cipher-tag">{cipher}</span>
							{/each}
						</div>
					</div>

					<h3>{currentProblem.question}</h3>

					{#if currentProblem.a !== undefined && currentProblem.b !== undefined}
						<div class="affine-params">
							<div class="param">
								<span class="param-label">a =</span>
								<span class="param-value">{currentProblem.a}</span>
							</div>
							<div class="param">
								<span class="param-label">b =</span>
								<span class="param-value">{currentProblem.b}</span>
							</div>
							{#if currentProblem.letter}
								<div class="param">
									<span class="param-label">letter =</span>
									<span class="param-value">{currentProblem.letter}</span>
								</div>
							{/if}
							{#if currentProblem.word}
								<div class="param">
									<span class="param-label">word =</span>
									<span class="param-value">{currentProblem.word}</span>
								</div>
							{/if}
						</div>
					{/if}

					{#if currentProblem.matrix_display}
						<div class="matrix-container">
							<pre class="matrix">{currentProblem.matrix_display}</pre>
						</div>
					{/if}

					{#if currentProblem.table_display}
						<div class="matrix-container">
							<pre class="matrix">{currentProblem.table_display}</pre>
						</div>
					{/if}

					{#if currentProblem.hint}
						<p class="hint">💡 {currentProblem.hint}</p>
					{/if}

					{#if currentProblem.legend}
						<p class="legend">💡 {currentProblem.legend}</p>
					{/if}

					{#if currentProblem.reference_table}
						<details class="reference">
							<summary>Show Reference Table</summary>
							<div class="reference-table">
								{#each currentProblem.reference_table as ref}
									<div class="ref-item">
										{ref.number}: {ref.decimal}
									</div>
								{/each}
							</div>
						</details>
					{/if}

					<div class="answer-section">
						<input
							bind:value={userAnswer}
							type="text"
							placeholder="Your answer"
							disabled={loading || (loopEnabled && answerLocked)}
							onkeypress={handleKeyPress}
							oninput={() => errorMessage = null}
						/>
						<button
							onclick={checkAnswer}
							disabled={loading || !userAnswer.trim() || (loopEnabled && answerLocked)}
						>
							Check Answer
						</button>
					</div>

					{#if errorMessage}
						<div class="error-message">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
								<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
							</svg>
							<span>{errorMessage}</span>
						</div>
					{/if}

					{#if result}
						<div class="result" class:correct={result.correct} class:incorrect={!result.correct}>
							{#if result.correct}
								<p class="success">✓ Correct!</p>
							{:else}
								<p class="error">✗ Incorrect</p>
								<div class="result-details">
									<p><strong>Your answer:</strong> {result.userAnswer}</p>
									{#if result.correctAnswer !== undefined}
										<p><strong>Correct answer:</strong> {result.correctAnswer}</p>
									{/if}
									{#if result.correctAnswerMod26 !== undefined}
										<p><strong>Correct answer (mod 26):</strong> {result.correctAnswerMod26}</p>
									{/if}
									{#if result.correctAnswerLetter !== undefined}
										<p><strong>Correct answer (letter):</strong> {result.correctAnswerLetter}</p>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{:else if !loading}
				<div class="empty-state">
					<p>Select a problem mode and press "Next Problem" to start practicing!</p>
				</div>
			{/if}
		</div>
	</Container>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		color: #f4f7ff;
		min-height: 100vh;
	}

	.page {
		display: flex;
		justify-content: center;
		padding: clamp(2rem, 4vw, 3.5rem) 1rem;
	}

	.bot-practice {
		width: 100%;
		color: #f5f7ff;
	}

	h1 {
		margin: 0 0 0.75rem 0;
		color: #ffffff;
		font-size: clamp(2rem, 3vw, 2.5rem);
		text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
	}

	.subtitle {
		margin: 0 0 2rem 0;
		color: rgba(234, 238, 255, 0.78);
		font-size: clamp(1rem, 2vw, 1.1rem);
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.mode-picker {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(12, 24, 58, 0.65);
		border-radius: 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 18px 30px rgba(6, 10, 28, 0.35);
		backdrop-filter: blur(10px);
	}

	.picker-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.picker-subtitle {
		display: block;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(204, 215, 255, 0.68);
		margin-bottom: 0.25rem;
	}

	.picker-title {
		margin: 0;
		font-size: clamp(1.5rem, 2.2vw, 1.8rem);
		color: var(--text-primary);
	}

	.search-wrapper {
		position: relative;
		min-width: clamp(220px, 40%, 280px);
	}

	.search-input {
		width: 100%;
		padding: 0.65rem 0.85rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(3, 10, 28, 0.8);
		color: #f5f7ff;
		box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.04);
		transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
	}

	.search-input::placeholder {
		color: rgba(204, 211, 242, 0.55);
	}

	.search-input:focus {
		outline: none;
		border-color: rgba(162, 176, 255, 0.8);
		box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.18);
		background: rgba(10, 16, 36, 0.95);
	}

	.mode-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 0.75rem;
	}

	.mode-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
		padding: 1rem 1.1rem;
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(6, 14, 36, 0.65);
		color: inherit;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 18px rgba(4, 10, 28, 0.35);
	}

	.mode-card:hover:not(.selected),
	.mode-card:focus-visible {
		transform: translateY(-2px);
		border-color: rgba(132, 148, 255, 0.5);
		box-shadow: 0 16px 28px rgba(8, 16, 40, 0.45);
		background: rgba(12, 24, 58, 0.75);
	}

	.mode-card:focus-visible {
		outline: none;
	}

	.mode-card.selected {
		border-color: rgba(160, 200, 255, 0.8);
		background: linear-gradient(135deg, #1152cb3f, #1f5cc63f);
		box-shadow: 0 20px 32px rgba(12, 24, 60, 0.55);
	}

	.mode-card.selected .mode-number,
	.mode-card.selected .mode-name {
		color: #ffffff;
	}

	.mode-number {
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(205, 213, 255, 0.85);
	}

	.mode-name {
		font-size: 1.05rem;
		font-weight: 600;
		color: #f8f9ff;
		text-align: left;
	}

	.no-results {
		margin: 0.5rem 0 0;
		font-size: 0.95rem;
		color: rgba(233, 237, 255, 0.65);
		text-align: center;
	}

	.controls-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		background: rgba(6, 14, 36, 0.55);
		border-radius: 1rem;
		padding: 1rem 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	}

	.selected-summary {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		color: rgba(220, 226, 255, 0.85);
	}

	.selected-summary strong {
		font-size: 1.05rem;
		color: #ffffff;
	}

	.playback-controls {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.playback-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(9, 18, 44, 0.75);
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
			background 0.2s ease, filter 0.2s ease;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 10px 24px rgba(4, 10, 28, 0.4);
		color: rgba(230, 235, 255, 0.9);
	}

	.playback-btn svg {
		width: 22px;
		height: 22px;
		fill: currentColor;
	}

	.playback-btn:hover:not(:disabled),
	.playback-btn:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 16px 28px rgba(8, 16, 40, 0.45);
		border-color: rgba(146, 167, 255, 0.6);
		outline: none;
	}

	.playback-btn.active {
		background: linear-gradient(135deg, #1152cb3f, #1f5cc63f);
		border-color: rgba(146, 167, 255, 0.6);
		color: #ffffff;
		box-shadow: 0 16px 28px rgba(8, 16, 40, 0.45);
	}

	.playback-btn.primary {
		padding: 0 1.2rem 0 1.1rem;
		min-width: 170px;
		width: auto;
		height: 56px;
		border-radius: 999px;
		background: linear-gradient(135deg, #1152cb3f, #1f5cc63f);
		border-color: rgba(180, 200, 255, 0.75);
		box-shadow: 0 22px 38px rgba(28, 42, 86, 0.45);
		gap: 0.75rem;
		font-weight: 650;
		font-size: 1rem;
		color: var(--text-primary);
	}

	.playback-btn.primary:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	.playback-btn.primary .next-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.18);
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
	}

	.playback-btn.primary .next-icon svg {
		width: 20px;
		height: 20px;
	}

	.playback-btn.primary .next-label {
		font-size: 1rem;
		letter-spacing: 0.02em;
	}

	.playback-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
		transform: none;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 10px 18px rgba(4, 10, 28, 0.25);
	}

	.problem {
		background: rgba(17, 28, 65, 0.7);
		padding: 1.75rem;
		border-radius: 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.08), 0 18px 38px rgba(6, 10, 28, 0.45);
		backdrop-filter: blur(12px);
	}

	.problem-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.problem-type {
		background: rgba(102, 126, 234, 0.55);
		color: #f7f9ff;
		padding: 0.3rem 0.85rem;
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 650;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.cipher-tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.cipher-tag {
		background: linear-gradient(135deg, rgba(17, 82, 203, 0.35), rgba(31, 92, 198, 0.35));
		color: #d4e3ff;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: capitalize;
		border: 1px solid rgba(146, 167, 255, 0.3);
		box-shadow: 0 2px 8px rgba(17, 82, 203, 0.2);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.cipher-tag:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(17, 82, 203, 0.3);
	}

	.problem h3 {
		margin: 0 0 1rem 0;
		color: #ffffff;
		font-size: clamp(1.4rem, 2.2vw, 1.8rem);
		font-weight: 600;
	}

	.matrix-container {
		background: rgba(3, 10, 28, 0.7);
		padding: 1rem;
		border-radius: 12px;
		margin: 1.1rem 0;
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.05);
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		max-width: 100%;
		margin-left: auto;
		margin-right: auto;
		overflow-x: auto;
	}

	.matrix {
		margin: 0;
		font-family: 'Courier New', monospace;
		font-size: 1.2rem;
		line-height: 1.8;
		color: #f8fbff;
		display: inline-block;
		white-space: pre;
		max-width: 100%;
	}

	.affine-params {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		background: rgba(3, 10, 28, 0.7);
		padding: 1rem 1.25rem;
		border-radius: 12px;
		margin: 1.1rem 0;
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.05);
	}

	.param {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.param-label {
		font-size: 0.95rem;
		color: rgba(204, 215, 255, 0.7);
		font-weight: 600;
	}

	.param-value {
		font-family: 'Courier New', monospace;
		font-size: 1.1rem;
		color: #f8fbff;
		font-weight: 600;
		background: rgba(102, 126, 234, 0.25);
		padding: 0.3rem 0.7rem;
		border-radius: 6px;
	}

	.hint {
		background: rgba(139, 92, 246, 0.15);
		padding: 0.9rem 1rem;
		border-radius: 12px;
		border: 1px solid rgba(167, 139, 250, 0.4);
		margin: 1rem 0;
		font-size: 0.95rem;
		color: #e9d5ff;
		font-family: 'Courier New', monospace;
	}

	.legend {
		background: rgba(241, 196, 15, 0.12);
		padding: 0.9rem 1rem;
		border-radius: 12px;
		border: 1px solid rgba(241, 196, 15, 0.35);
		margin: 1rem 0;
		font-size: 0.95rem;
		color: var(--color-warning-muted);
	}

	.reference {
		margin: 1rem 0;
		background: rgba(6, 12, 30, 0.75);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(8px);
	}

	.reference summary {
		padding: 0.85rem 1rem;
		cursor: pointer;
		font-weight: 600;
		color: rgba(204, 215, 255, 0.92);
		user-select: none;
		transition: background 0.2s;
	}

	.reference summary:hover {
		background: rgba(20, 33, 68, 0.6);
	}

	.reference-table {
		padding: 1rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.65rem;
	}

	.ref-item {
		font-family: monospace;
		font-size: 0.9rem;
		padding: 0.35rem 0.5rem;
		background: rgba(16, 24, 52, 0.65);
		border-radius: 8px;
		color: rgba(235, 241, 255, 0.9);
	}

	.answer-section {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.25rem;
		flex-wrap: wrap;
	}

	.answer-section input {
		flex: 1 1 260px;
		padding: 0.85rem 1rem;
		font-size: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
		background: rgba(2, 6, 23, 0.75);
		color: #f7f9ff;
	}

	.answer-section input::placeholder {
		color: rgba(204, 211, 242, 0.6);
	}

	.answer-section input:focus {
		outline: none;
		border-color: rgba(162, 176, 255, 0.8);
		box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.18);
		background: rgba(10, 16, 36, 0.9);
	}

    .answer-section input:disabled {
		background: rgba(36, 36, 36, 0.836);
		color: #b7b8bd;
        border: 1px solid rgba(153, 153, 153, 0.2);
	}

	.answer-section button {
		padding: 0.85rem 1.6rem;
		background: var(--gradient-primary);
		color: var(--text-primary);
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-weight: 650;
		transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
		box-shadow: 0 18px 32px rgba(12, 43, 32, 0.45);
	}

	.answer-section button:hover:not(:disabled) {
		transform: translateY(-1px) scale(1.01);
		box-shadow: 0 20px 36px rgba(12, 43, 32, 0.55);
		filter: brightness(1.05);
	}

	.answer-section button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.result {
		margin-top: 1.2rem;
		padding: 1.2rem 1.4rem;
		border-radius: 1rem;
		animation: slideIn 0.25s ease-out;
		border: 1px solid transparent;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.result.correct {
		background: rgba(56, 142, 60, 0.25);
		border-color: rgba(129, 199, 132, 0.4);
		color: var(--color-success-light);
	}

	.result.incorrect {
		background: var(--color-error-bg);
		border-color: rgba(244, 143, 177, 0.4);
		color: var(--color-error);
	}

	.result p {
		margin: 0.5rem 0;
	}

	.success {
		font-weight: 700;
		font-size: 1.5rem;
		color: var(--color-success-light);
	}

	.error {
		font-weight: 700;
		font-size: 1.5rem;
		color: var(--color-error);
	}

	.result-details {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
	}

	.result-details p {
		color: rgba(255, 230, 234, 0.85);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		color: rgba(233, 237, 255, 0.7);
	}

	.empty-state p {
		margin: 0;
		font-size: 1.1rem;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1rem;
		padding: 1rem 1.2rem;
		background: rgba(244, 67, 54, 0.15);
		border: 1px solid rgba(244, 67, 54, 0.4);
		border-radius: 12px;
		color: #ffcdd2;
		font-size: 0.95rem;
		animation: slideIn 0.25s ease-out;
	}

	.error-message svg {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		fill: currentColor;
	}

	.error-message span {
		flex: 1;
		line-height: 1.5;
	}

	@media (max-width: 600px) {
		.page {
			padding: 2rem 1rem;
		}

		.bot-practice {
			width: 100%;
		}

		h1 {
			font-size: 1.8rem;
		}

		.controls {
			gap: 1.1rem;
		}

		.mode-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		}

		.controls-footer {
			flex-direction: column;
			align-items: stretch;
		}

		.playback-controls {
			justify-content: space-between;
			width: 100%;
		}

		.playback-btn.primary {
			width: 100%;
		}

		.answer-section {
			flex-direction: column;
		}

		.answer-section button,
		.playback-btn.primary {
			width: 100%;
		}
	}
</style>
