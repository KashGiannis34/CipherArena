<script>
	import Letter from './Letter.svelte';
	import FreqTable from './FreqTable.svelte';
	import { ENGLISH_ALPHABET, isSolvableChunk, SPANISH_ALPHABET } from '$db/shared-utils/CipherUtil';
	import { cipherTypes } from '$db/shared-utils/CipherTypes';
	import { onMount } from 'svelte';
	import { debounce } from '$lib/util/helpers.js';
	import { initQuote, initLetterInputs, initLetterFocus, paramToString, getInputText } from '$lib/util/cipherUtils.js';

	let {
		quote = 'Zit jxoea wkgvf ygb pxdhl gctk zit sqmn rgu.'.toUpperCase().split(''),
		cipherType = 'Aristocrat',
		autoFocus = true,
		params = { Solve: 'Decode', K: 'K0' },
		keys = [],
		onProgressUpdate
	} = $props();
	let spanish = cipherType == 'Xenocrypt';
	let gaveUp = $state(false);
	let isChecking = $state(false);
	let submissionError = $state(false);
	let clearPolybius = $state(false);
	let initialQuote = initQuote(quote, cipherTypes[cipherType]['spacing'], cipherType);
	let debouncedProgressUpdate;

	onMount(() => {
		debouncedProgressUpdate = debounce(() => {
			const filled = getInputText(info.inputs)
				.replace(/[^A-Za-z]/g, '')
				.length;
			const total = info.cipherText.filter(chunk => isSolvableChunk(chunk, cipherType)).length;
			const percent = Math.floor((filled / total) * 100);
			onProgressUpdate(percent);
		}, 250);

		debouncedProgressUpdate();
	});

	let info = $state({
		cipherText: initialQuote,
		cipherTextTrim: initialQuote.filter(c => c !== ' '),
		letterInputs: initLetterInputs(spanish),
		letterFocus: initLetterFocus(spanish),
		inputs: []
	});

	let lettersWithIndices = initLWI();
	let directMap = cipherTypes[cipherType]['directMap'];
	let paramString = paramToString(params);

	function onArrow(key, index) {
		let inc;
		if (key == 'ArrowRight' || event.key == ' ' || event.key == 'Tab') {
			inc = 1;
		} else {
			inc = -1;
		}

		const len = info.inputs.length;
		let currIndex = index;
		let triedAll = false;

		while (!triedAll) {
			let nextIndex = (currIndex + inc + len) % len;
			let prevChar = info.cipherTextTrim[currIndex];
			let nextChar = info.cipherTextTrim[nextIndex];

			if (isSolvableChunk(nextChar, cipherType) && (nextChar !== prevChar || !directMap)) {
				currIndex = nextIndex;
				break;
			}

			currIndex = nextIndex;
			if (currIndex === index) {
				currIndex = (index + inc + len) % len;
				triedAll = true;
			}
		}

		info.inputs[currIndex]?.focus();
	}

	function onFocus(letter, focus) {
		if (!directMap) return;
		info.letterFocus[letter] = focus;
	}

	function onChange(letter, newValue, index) {
		debouncedProgressUpdate();

		if (!directMap) {
			info.inputs[index].value = newValue;
		} else {
			info.letterInputs[letter] = newValue;
		}

		if (autoFocus && newValue !== '') {
			const len = info.inputs.length;
			let currIndex = index;
			let triedAll = false;

			while (!triedAll) {
				currIndex = (currIndex + 1) % len;

				if (directMap) {
					const normalizedLetter = info.cipherTextTrim[currIndex].toUpperCase();
					if (
						isSolvableChunk(normalizedLetter, cipherType) &&
						normalizedLetter !== letter &&
						info.letterInputs[normalizedLetter] === ''
					) {
						break;
					}
				} else {
					if (
						isSolvableChunk(info.cipherTextTrim[currIndex], cipherType) &&
						info.inputs[currIndex].value === ''
					) {
						break;
					}
				}

				if (currIndex === index) {
					triedAll = true;
				}
			}

			info.inputs[currIndex]?.focus();
		}
	}

	function initLWI() {
		let res = [];
		let index = 0;
		let currentWord = [];
		const keyword = keys[0];
		const addKey = cipherTypes[cipherType]['stackKey'];
		let keywordIndex = 0;

		for (let char of info.cipherText) {
			if (char === ' ') {
				if (currentWord.length) res.push(currentWord);
				currentWord = [];
				continue;
			}

			let keywordChar = '';

			if (addKey && isSolvableChunk(char, cipherType)) {
				keywordChar = keyword[keywordIndex].toUpperCase();
				keywordIndex = (keywordIndex + 1) % keyword.length;
			}

			currentWord.push({ letter: char, index, keyLetter: keywordChar });
			index++;
		}

		if (currentWord.length) res.push(currentWord);
		return res;
	}
</script>

<div class="custom-container">
	<div class="info">
		<h3>
			{params['Solve']} this <span class="highlight" style="border-radius: 3px; padding: 3px;"
				>{paramString + cipherType}</span
			> cipher.
		</h3>
		{#each keys as key, index}
			{#if cipherTypes[cipherType]['keys'][index] != '!'}
				<h4>
					The {cipherTypes[cipherType]['keys'][index]} is
					<span class="highlight" style="border-radius: 3px; padding: 3px;">{key}</span>.
				</h4>
			{/if}
		{/each}
		{#if cipherType == 'Xenocrypt'}
			<h4>Type "," to get "Ñ".</h4>
		{/if}
	</div>

	<div class="cipher">
		{#each lettersWithIndices as word}
			<div class="word">
				{#each word as { letter, index, keyLetter }}
					<Letter
						bind:inputs={info.inputs}
						letterInputs={info.letterInputs}
						cipherLetter={letter}
						{index}
						inputValue={info.letterInputs[letter]}
						selected={info.letterFocus[letter]}
						{directMap}
						{autoFocus}
						{onArrow}
						{onFocus}
						{onChange}
						solved={false}
						{cipherType}
						{keyLetter}
						checkQuote={() => {}}
						{spanish}
					/>
				{/each}
			</div>
		{/each}
	</div>

	<FreqTable
		bind:info={info}
		solved={false}
		autoFocus={true}
		k={params['K']}
		{spanish}
	/>
</div>

<style>
	.custom-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 20px;
		border-radius: 20px;
		background: var(--glass-bg);
		box-shadow: var(--glass-shadow-lg);
		border: 1px solid var(--glass-border);
		color: var(--text-primary);
		margin-bottom: -50px;
	}

	.info {
		text-align: left;
		align-self: flex-start;
		font-size: 1.2rem;
		font-weight: bold;
		margin-bottom: 30px;
	}

	.info h3 {
		padding-bottom: 5px;
	}

	.highlight {
		background: var(--glass-bg-active);
	}

	.cipher {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 100%;
	}

	.word {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: flex-start;
		margin: 0 10px 30px 10px;
		row-gap: 30px;
	}

	.word:hover {
		transform: translateY(-3px);
	}

	.word > :global(div) {
		transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.word > :global(div):hover {
		transform: scale(1.1) translateY(-5px);
		z-index: 10;
	}
</style>