<script>
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
</script>

<div class="referenceTable">
	<table>
		<thead>
			<tr>
				{#each alphabet as letter}
					<th>{letter}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<tr>
				{#each Array(26) as _, i}
					<td>{i}</td>
				{/each}
			</tr>
		</tbody>
	</table>
</div>

<style>
	:root {
		--bColor: rgba(255, 255, 255, 0.497);
		--bRadius: 0.5rem;
	}

	.referenceTable {
		width: 100%;
		max-width: 100%;
		overflow-x: auto;
		margin: 1rem auto;
	}

	.referenceTable table {
		width: 100%;
		table-layout: fixed;
		border-collapse: separate;
		border-spacing: 0;
		background-color: rgba(0, 0, 0, 0.175);
		text-align: center;
		border-radius: var(--bRadius);
		font-size: 1.6vw;
	}

	@media screen and (min-width: 1200px) {
		.referenceTable table {
			font-size: 1rem;
		}
	}

	th, td {
		font-family: 'Source Code Pro', monospace;
		padding: 0.65vw;
		aspect-ratio: 1 / 1;
		border-bottom: 1px solid var(--bColor);
		border-right: 1px solid var(--bColor);
		overflow: hidden;
		word-break: break-word;
	}

	table th:first-child,
	table td:first-child {
		border-left: 1px solid var(--bColor);
	}

	table tr:first-child th {
		border-top: 1px solid var(--bColor);
	}

	table tr:first-child th:first-child {
		border-top-left-radius: var(--bRadius);
	}
	table tr:first-child th:last-child {
		border-top-right-radius: var(--bRadius);
	}
	table tr:last-child td:first-child {
		border-bottom-left-radius: var(--bRadius);
	}
	table tr:last-child td:last-child {
		border-bottom-right-radius: var(--bRadius);
	}

	th:hover,
	td:hover {
		background-color: rgba(255, 255, 255, 0.1);
		cursor: default;
	}
</style>
