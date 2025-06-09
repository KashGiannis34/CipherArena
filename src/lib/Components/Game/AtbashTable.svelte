<script>
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const reversed = alphabet.split('').reverse();
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
				{#each reversed as letter}
					<td>{letter}</td>
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

	.referenceTable table {
		width: 100%;
		margin: 1rem auto;
		border-collapse: separate;
        border-spacing: 0;
		background-color: rgba(0, 0, 0, 0.175);
		font-size: 1.6vw;
		text-align: center;
		border-radius: var(--bRadius);
		overflow: hidden;
	}

	@media screen and (min-width: 1200px) {
		.referenceTable table {
			font-size: 1rem;
		}
	}

	th, td {
        font-family: 'Source Code Pro', monospace;
        padding: 0.65vw;
        border-bottom: 1px solid var(--bColor);
        border-right: 1px solid var(--bColor);
    }


    table tr td:first-child,
    table tr th:first-child {
    border-left: 1px solid var(--bColor);
    }


    table tr th {
    border-top: 1px solid var(--bColor);
    }


    table tr:first-child th:first-child {
    border-top-left-radius: 0.5rem;
    }


    table tr:last-child td:first-child {
    border-bottom-left-radius: 0.5rem;
    }


    table tr:last-child td:last-child {
    border-bottom-right-radius: 0.5rem;
    }

    table tr:first-child th:last-child {
    border-top-right-radius: 0.5rem;
    }

    th:hover,
    td:hover {
        background-color: rgba(255, 255, 255, 0.1);
        cursor: default;
    }
</style>
