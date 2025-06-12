<script>
    import { cipherTypes } from '$utils/CipherTypes.js';
    let { stats } = $props();

    function winPercent(stat) {
        const info = stat ?? { wins: 0, losses: 0 };
        const total = info.wins + info.losses;
        const winPct = total == 0 ? 0 : (info.wins / total) * 100;
        return winPct.toFixed(2) + '%';
    }

    function formatTime(seconds) {
        if (seconds == null || isNaN(seconds)) return '—';
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <th>Avg Seconds Per Char</th>
                <th>Best Time</th>
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
                <td>{stats[cipher].averageSolveTime ? stats[cipher].averageSolveTime.toFixed(2) : 'N/A'}</td>
                <td>{formatTime(stats[cipher]?.bestSolveTime)}</td>
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
