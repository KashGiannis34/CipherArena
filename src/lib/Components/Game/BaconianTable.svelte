<script>
	const baconianPairs = [
		{ letter: 'A', code: 'AAAAA' }, { letter: 'B', code: 'AAAAB' },
		{ letter: 'C', code: 'AAABA' }, { letter: 'D', code: 'AAABB' },
		{ letter: 'E', code: 'AABAA' }, { letter: 'F', code: 'AABAB' },
		{ letter: 'G', code: 'AABBA' }, { letter: 'H', code: 'AABBB' },
		{ letter: 'I/J', code: 'ABAAA' }, { letter: 'K', code: 'ABAAB' },
		{ letter: 'L', code: 'ABABA' }, { letter: 'M', code: 'ABABB' },
		{ letter: 'N', code: 'ABBAA' }, { letter: 'O', code: 'ABBAB' },
		{ letter: 'P', code: 'ABBBA' }, { letter: 'Q', code: 'ABBBB' },
		{ letter: 'R', code: 'BAAAA' }, { letter: 'S', code: 'BAAAB' },
		{ letter: 'T', code: 'BAABA' }, { letter: 'U/V', code: 'BAABB' },
		{ letter: 'W', code: 'BABAA' }, { letter: 'X', code: 'BABAB' },
		{ letter: 'Y', code: 'BABBA' }, { letter: 'Z', code: 'BABBB' }
	];

	// Group into rows of 6
	const rows = [];
	for (let i = 0; i < baconianPairs.length; i += 6) {
		rows.push(baconianPairs.slice(i, i + 6));
	}
</script>

<div class="referenceTable">
	<table>
		<tbody>
			{#each rows as row}
				<tr>
					{#each row as pair}
						<td class="combo">{pair.letter}: {pair.code}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	:root {
		--bColor: rgba(255, 255, 255, 0.497);
		--bRadius: 0.5rem;
	}

	.referenceTable table {
		width: 100%;
		margin: 1rem auto;
		border-collapse: separate;
		border-spacing: 0;
		background-color: rgba(0, 0, 0, 0.175);
		font-size: 1.4vw;
		text-align: left;
		border-radius: var(--bRadius);
		overflow: hidden;
	}

	@media screen and (min-width: 1200px) {
		.referenceTable table {
			font-size: 1rem;
		}
	}

	td {
		font-family: 'Source Code Pro', monospace;
		padding: 0.65vw;
		border-right: 1px solid var(--bColor);
		border-bottom: 1px solid var(--bColor);
		white-space: nowrap;
	}

	tr td:first-child {
		border-left: 1px solid var(--bColor);
	}

    tr:first-child td {
        border-top: 1px solid var(--bColor);
    }

	/* Rounded corners */
	table tr:first-child td:first-child {
		border-top-left-radius: var(--bRadius);
	}

	table tr:first-child td:last-child {
		border-top-right-radius: var(--bRadius);
	}

	table tr:last-child td:first-child {
		border-bottom-left-radius: var(--bRadius);
	}

	table tr:last-child td:last-child {
		border-bottom-right-radius: var(--bRadius);
	}

    td:hover {
        background-color: rgba(255, 255, 255, 0.1);
        cursor: default;
    }
</style>
