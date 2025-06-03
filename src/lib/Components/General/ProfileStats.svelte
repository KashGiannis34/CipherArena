<script>
    import { cipherTypes } from '$lib/util/CipherTypes.js';
    let { stats } = $props();

    function winPercent(stat) {
        const info = stat ?? { wins: 0, losses: 0 };
        const total = info.wins + info.losses;
        const winPct = total == 0 ? 0 : (info.wins / total) * 100;
        return winPct.toFixed(2) + '%';
    }

    const orderedStatKeys = ['All', ...Object.keys(cipherTypes)];
</script>

<div class="table-wrapper">
    <table class="leaderboard-table">
        <thead>
        <tr>
            <th>Cipher</th>
            <th>Elo</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Win %</th>
        </tr>
        </thead>
        <tbody>
        {#each orderedStatKeys as cipher}
            <tr class="table-row">
            <td><strong>{cipher}</strong></td>
            <td>{stats[cipher]?.elo ?? 1000}</td>
            <td>{stats[cipher]?.wins ?? 0}</td>
            <td>{stats[cipher]?.losses ?? 0}</td>
            <td>{winPercent(stats[cipher])}</td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>
    .table-wrapper {
        overflow-x: auto;
        margin-top: 1rem;
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
        text-align: center;
    }

    .leaderboard-table th:first-child,
    .leaderboard-table td:first-child {
        text-align: left;
    }

    .table-row {
        transition: background-color 0.2s ease;
    }

    .table-row:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
</style>
