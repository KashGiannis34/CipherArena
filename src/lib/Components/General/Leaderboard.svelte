<script>
	import { cipherTypes } from '$db/shared-utils/CipherTypes.js';
    import { onMount } from 'svelte';

    const defaultStats = () => ({ elo: 1000, wins: 0, losses: 0 });

	let {count = 50, simple = false} = $props();
    let leaderboardData = $state([]);

	const cipherTypeOptions = [...Object.keys(cipherTypes), 'All'];
	let selectedCipherType = $state(cipherTypeOptions[0]);

	let metric = $state('elo');
	const metricOptions = ['elo', 'wins', 'win%', 'avg solve time per char', 'best solve time'];

	async function fetchLeaderboard(cipherType, metric) {
		try {
			const res = await fetch(`/api/leaderboard?cipherType=${cipherType}&metric=${metric === 'win%' ? 'winPercent' : metric}&count=${count}`);
			const data = await res.json();
            if (!data.error) {
                leaderboardData = data.map((user, i) => ({
                    username: user.username,
                    rank: i + 1,
                    value: user.value
                }));
            }
		} catch (err) {
			leaderboardData = [];
		}
	}


	async function handleCipherTypeSelect(type) {
        await fetchLeaderboard(type, metric);
		selectedCipherType = type;
	}

    async function handleMetricSelect(newMetric) {
        await fetchLeaderboard(selectedCipherType, newMetric);
        metric = newMetric;
    }

	function formatMetric(user) {
		if (metric === 'win%' && typeof user.value === 'number') {
			return `${user.value.toFixed(1)}%`;
		} else if (metric === 'best solve time') {
			const minutes = Math.floor(user.value / 60);
			const seconds = Math.round(user.value % 60);
			return `MM:SS`.replace('MM', String(minutes).padStart(2, '0')).replace('SS', String(seconds).padStart(2, '0'));
		} else if (metric === 'avg solve time per char') {
			return `${user.value.toFixed(2)}`;
		} else {
			return user.value;
		}
	}

    onMount(async () => {
        await fetchLeaderboard(selectedCipherType, metric);
    });
</script>

<div class="leaderboard-container animate-fade-in">
	<div class="cipher-type-selector">
		{#each cipherTypeOptions as type}
			<button
				class:selected={selectedCipherType === type}
				onclick={() => handleCipherTypeSelect(type)}
			>
				{type}
			</button>
		{/each}
	</div>

	<!-- Metric toggle -->
	{#if !simple}
		<div class="metric-toggle">
			{#each metricOptions as m}
				<button
					class:selected={metric === m}
					onclick={() => handleMetricSelect(m)}
				>
					{m}
				</button>
			{/each}
		</div>
	{/if}

	<div class="metric-note-wrapper">
		{#if metric === 'win%' && !simple}
			<p class="metric-note-inline">* Only users with 10+ ranked games are shown.</p>
		{:else if metric === 'avg solve time per char' && !simple}
			<p class="metric-note-inline">* Only users with 5+ ranked wins are shown.</p>
		{:else}
			<!-- Invisible element to preserve height -->
			<p class="metric-note-inline empty">&nbsp;</p>
		{/if}
	</div>

	<div class="table-wrapper">
		<table class="leaderboard-table">
			<thead>
				<tr>
					<th>Rank</th>
					<th>Username</th>
					<th>
						{#if metric === 'elo'}
							Elo
						{:else if metric === 'wins'}
							Total Wins
						{:else if metric === 'win%'}
							Win %
						{:else if metric === 'avg solve time per char'}
							Avg Solve Time Per Char
						{:else if metric === 'best solve time'}
							Best Solve Time
						{:else}
							{metric}
						{/if}
					</th>
				</tr>
			</thead>
			<tbody>
                {#each leaderboardData as user, i}
                    <tr class="table-row">
                        <td>
                            {#if i === 0} 🥇
                            {:else if i === 1} 🥈
                            {:else if i === 2} 🥉
                            {:else} {i + 1}
                            {/if}
                        </td>
                        <td>
							<a href={`/profile/${user.username}`} target="_blank" rel="noopener noreferrer" class="profile-link">
								{user.username}
							</a>
						</td>
                        <td>{formatMetric(user)}</td>
                    </tr>
                {/each}
            </tbody>
		</table>
	</div>
</div>

<style>
	.metric-note-wrapper {
		height: 1.25rem; /* consistent vertical space */
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.metric-note-inline {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		margin: 0;
	}

	.metric-note-inline.empty {
		visibility: hidden;
	}

	.profile-link {
		color: #fff;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.profile-link:hover {
		color: #4e9aff;
		text-decoration: underline;
	}

	.leaderboard-container {
		padding: 1.5rem;
		margin: 0 auto;
		max-width: 1000px;
		width: 100%;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border-radius: 1rem;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
		color: white;
	}

	.cipher-type-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.cipher-type-selector button {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.cipher-type-selector button:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.05);
	}

	.cipher-type-selector button.selected {
        background: rgba(255, 255, 255, 0.12);
        position: relative;
        z-index: 1;
        color: white;
        box-shadow: 0 0 0 rgba(0, 0, 0, 0);

        /* Fade in glow first, then loop rainbow */
        animation:
            fadeGlowIn 0.5s ease-out forwards,
            rainbowGlow 3s linear infinite;
        animation-delay: 0s, 0.5s; /* fadeGlowIn starts immediately, rainbowGlow after 0.5s */
    }


    /* Step 1: Fade in glow smoothly */
    @keyframes fadeGlowIn {
        from {
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
        }
        to {
            box-shadow: 0 0 8px #ff4ec4, inset 0 0 2px #ff4ec4;
        }
    }

    /* Step 2: Start rainbow cycle after fade-in */
    @keyframes rainbowGlow {
        0% {
            box-shadow: 0 0 8px #ff4ec4, inset 0 0 2px #ff4ec4;
        }
        25% {
            box-shadow: 0 0 8px #4e9aff, inset 0 0 2px #4e9aff;
        }
        50% {
            box-shadow: 0 0 8px #4eff9a, inset 0 0 2px #4eff9a;
        }
        75% {
            box-shadow: 0 0 8px #fff94e, inset 0 0 2px #fff94e;
        }
        100% {
            box-shadow: 0 0 8px #ff4ec4, inset 0 0 2px #ff4ec4;
        }
    }

	.table-wrapper {
		overflow-x: auto;
	}

	.leaderboard-table {
		width: 100%;
		border-collapse: collapse;
	}

    .leaderboard-table th,
    .leaderboard-table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        vertical-align: middle;
    }

    .leaderboard-table th:nth-child(1),
    .leaderboard-table td:nth-child(1) {
        text-align: left;
        width: 6rem;
        padding-right: 0.5rem;
    }

    .leaderboard-table th:nth-child(2),
    .leaderboard-table td:nth-child(2),
    .leaderboard-table th:nth-child(3),
    .leaderboard-table td:nth-child(3) {
        text-align: center;
    }

    @media (min-width: 640px) {
        .leaderboard-table th:nth-child(3),
        .leaderboard-table td:nth-child(3) {
            width: 10rem;
            text-align: center;
        }
    }

	.table-row {
		transition: background-color 0.2s ease;
	}

	.table-row:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out;
	}

	@media (max-width: 600px) {
		.cipher-type-selector button {
			font-size: 0.9rem;
			padding: 0.4rem 0.75rem;
		}
	}

    .metric-toggle {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .metric-toggle button {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .metric-toggle button.selected {
        background: rgba(255, 255, 255, 0.15);
        font-weight: bold;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
    }
</style>
