<script>
	const rowHeaders = [
		"A,B", "C,D", "E,F", "G,H", "I,J", "K,L",
		"M,N", "O,P", "Q,R", "S,T", "U,V", "W,X", "Y,Z"
	];

	const columnHeaders = "ABCDEFGHIJKLM".split('');

	function getRow(rowIndex) {
		const right = "NOPQRSTUVWXYZ".split('');
		const left = "ABCDEFGHIJKLM".split('');
		const shift = rowIndex;

		const shiftedRight = [...right.slice(shift), ...right.slice(0, shift)];

		return left.map((_, i) => shiftedRight[i]);
	}

    let hoveredColumn = $state(null);

    function handleMouseOver(colIndex) {
        hoveredColumn = colIndex;
    }

    function handleMouseOut(colIndex) {
        if (hoveredColumn === colIndex) {
            hoveredColumn = null;
        }
    }
</script>

<div class="referenceTable">
	<table>
		<tbody>
            <tr>
				<td class={hoveredColumn == 0 ? "highlight": ""}
                onmouseenter={() => {handleMouseOver(0)}} onmouseout={() => {handleMouseOut(0)}}
                onblur={()=>{}}></td>

				{#each columnHeaders as col, i}
					<td class={hoveredColumn == (i+1) ? "highlight": ""} onmouseenter={() => {handleMouseOver(i+1)}}
                        onmouseout={() => {handleMouseOut(i+1)}} onblur={()=>{}}>{col}</td>
				{/each}
			</tr>

			{#each rowHeaders as label, i}
				<tr>
					<td class="label {hoveredColumn == 0 ? "highlight": ""}"
                    onmouseenter={() => {handleMouseOver(0)}} onmouseout={() => {handleMouseOut(0)}}
                    onblur={()=>{}}>{label}</td>

					{#each getRow(i) as letter, j}
						<td class={hoveredColumn == (j+1) ? "highlight": ""} onmouseenter={() => {handleMouseOver(j+1)}}
                        onmouseout={() => {handleMouseOut(j+1)}} onblur={()=>{}}>{letter}</td>
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
		text-align: center;
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
		padding: 0.2vw 0.65vw;
		border-bottom: 1px solid var(--bColor);
		border-right: 1px solid var(--bColor);
		white-space: nowrap;
	}

	tr td:first-child,
	tr td:first-child {
		border-left: 1px solid var(--bColor);
	}

	tr:first-child td {
		border-top: 1px solid var(--bColor);
	}

	.label {
		text-align: left;
		font-weight: bold;
		color: white;
	}

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
        background-color: rgba(255, 255, 255, 0.2);
        cursor: default;
    }

    tr:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .highlight {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>
