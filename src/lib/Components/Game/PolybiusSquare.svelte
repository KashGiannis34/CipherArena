<script>
	const gridSize = 5;
	const rowLabels = [1, 2, 3, 4, 5];
	const colLabels = [1, 2, 3, 4, 5];

	let { autoFocus, clearPolybius, resetClear } = $props();

	let hoveredRow = $state(null);
	let hoveredCol = $state(null);

	function handleHover(row, col) {
		hoveredRow = row;
		hoveredCol = col;
	}

	function clearHover() {
		hoveredRow = null;
		hoveredCol = null;
	}

	function isLetter(char) {
		return /^[A-Za-z]$/.test(char);
	}

	function handleKeydown(e, row, col) {
		const key = e.key;
		let nextRow = row;
		let nextCol = col;

		if (key === 'ArrowUp') nextRow = Math.max(0, row - 1);
		else if (key === 'ArrowDown') nextRow = Math.min(gridSize - 1, row + 1);
		else if (key === 'ArrowLeft') nextCol = Math.max(0, col - 1);
		else if (key === 'ArrowRight') nextCol = Math.min(gridSize - 1, col + 1);
		else if (key === 'Backspace' || key === 'Delete') {
			e.target.value = '';
			e.preventDefault();
			return;
		} else if (key.length === 1 && isLetter(key)) {
			e.target.value = key.toUpperCase();
			if (autoFocus) {
				nextCol += 1;
				if (nextCol >= gridSize) {
					nextCol = nextRow >= gridSize - 1 ? nextCol : 0;
					nextRow += 1;
				}
				if (nextRow >= gridSize) {
					nextRow = gridSize - 1;
				}
			}
		} else {
			return;
		}

		e.preventDefault();
		const nextInput = document.querySelector(`input[data-row='${nextRow}'][data-col='${nextCol}']`);
		nextInput?.focus();
	}

	function handleInput(e) {
		const row = +e.target.dataset.row;
		const col = +e.target.dataset.col;
		const value = e.target.value;
		const lastChar = value[value.length - 1];

		if (!lastChar || !isLetter(lastChar)) {
			e.target.value = '';
			return;
		}

		e.target.value = lastChar.toUpperCase();
	}

	$effect(() => {
		if (clearPolybius) {
			const inputs = document.querySelectorAll('.referenceTable input');
			inputs.forEach(input => input.value = '');
			resetClear();
		}
	});
</script>

<div class="referenceTable">
	<table>
		<tbody>
			<tr>
				<th></th>
				{#each colLabels as col, colIndex}
					<th
						class:highlight={hoveredCol === colIndex}
						onmouseenter={() => handleHover(null, colIndex)}
						onmouseleave={clearHover}
					>
						{col}
					</th>
				{/each}
			</tr>
			{#each rowLabels as row, rowIndex}
				<tr>
					<th
						class:highlight={hoveredRow === rowIndex}
						onmouseenter={() => handleHover(rowIndex, null)}
						onmouseleave={clearHover}
					>
						{row}
					</th>
					{#each colLabels as col, colIndex}
						<td
							class:highlight={hoveredRow === rowIndex || hoveredCol === colIndex}
							onmouseenter={() => handleHover(rowIndex, colIndex)}
							onmouseleave={clearHover}
						>
							<input
								type="text"
								placeholder="="
								maxlength="1"
								data-row={rowIndex}
								data-col={colIndex}
								onkeydown={(e) => handleKeydown(e, rowIndex, colIndex)}
								oninput={handleInput}
							/>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.referenceTable table {
		width: min(90vw, 400px);
		font-size: clamp(0.75rem, 2vw, 1.2rem);
		margin: 1rem auto;
		border-collapse: separate;
		border-spacing: 0;
		background-color: var(--table-header-bg);
		text-align: center;
		border-radius: 0.5rem;
		overflow: hidden;
		table-layout: fixed;
	}

	@media screen and (min-width: 1200px) {
		.referenceTable table {
			font-size: 1rem;
		}
	}

	th,
	td {
		font-family: 'Source Code Pro', monospace;
		border-bottom: 1px solid var(--table-border-color);
		border-right: 1px solid var(--table-border-color);
		aspect-ratio: 1 / 1;
		overflow: hidden;
	}

	th {
		padding: .65vw 0;
	}

	input {
		color: var(--text-primary);
		text-align: center;
		width: 100%;
		height: 100%;
		background-color: transparent;
		border: none;
		outline: none;
		caret-color: transparent;
		font-size: inherit;
		font-family: 'Source Code Pro', monospace !important;
		padding: 0.65vw;
	}

	input:focus {
		outline: none;
		background-color: var(--glass-bg-active) !important;
	}

	table th:first-child,
	table td:first-child {
		border-left: 1px solid var(--table-border-color);
	}

	table tr:first-child th {
		border-top: 1px solid var(--table-border-color);
	}

	table tr:first-child th:first-child {
		border-top-left-radius: 0.5rem;
	}
	table tr:first-child th:last-child {
		border-top-right-radius: 0.5rem;
	}
	table tr:last-child th:first-child {
		border-bottom-left-radius: 0.5rem;
	}
	table tr:last-child td:last-child {
		border-bottom-right-radius: 0.5rem;
	}

	.highlight {
		background-color: var(--table-highlight-bg);
	}
</style>
