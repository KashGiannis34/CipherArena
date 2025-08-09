<script>
  import { cipherTypes } from '$db/shared-utils/CipherTypes.js';
  let { stats, singleStats, simple = false } = $props();

  const orderedStatKeys = ['All', ...Object.keys(cipherTypes)];

  let statMode = $state('multiplayer'); // 'multiplayer' or 'singleplayer'

  function winPercent(stat) {
    const info = stat ?? { wins: 0, losses: 0, total: 0 };
    let total = 0;
    if (statMode == 'multiplayer') {
        total = (info.wins ?? 0) + (info.losses ?? 0);
    } else {
        total = info.total;
    }

    const winPct = total === 0 ? 0 : (info.wins / total) * 100;
    return winPct.toFixed(2) + '%';
  }

  function formatTime(seconds) {
    if (seconds == null || isNaN(seconds)) return '—';
    const rounded = Math.round(seconds);
    const mins = Math.floor(rounded / 60);
    const secs = rounded % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getStat(cipher) {
    return statMode === 'multiplayer' ? stats?.[cipher] : singleStats?.[cipher];
  }
</script>

{#if !simple}
<div class="note-wrapper">
    {#if statMode === 'singleplayer'}
        <p class="note-inline empty">* Singleplayer stats do not count towards leaderboard.</p>
    {/if}
</div>

<div class="stat-mode-selector">
  <button
    class:selected={statMode === 'multiplayer'}
    onclick={() => statMode = 'multiplayer'}
  >Multiplayer</button>
  <button
    class:selected={statMode === 'singleplayer'}
    onclick={() => statMode = 'singleplayer'}
  >Singleplayer</button>
</div>
{/if}

<div class="table-wrapper">
  <table class="leaderboard-table">
    <thead>
      <tr>
        <th>Cipher</th>
        {#if statMode === 'multiplayer'}
          <th>Elo</th>
        {/if}
        <th>{statMode === 'singleplayer' ? 'Solves' : 'Wins'}</th>
        {#if statMode === 'multiplayer'}
          <th>Losses</th>
        {/if}
        <th>{statMode === 'singleplayer' ? 'Solve Rate' : 'Win %'}</th>
        <th>Avg Seconds Per Char</th>
        <th>Best Time</th>
      </tr>
    </thead>
    <tbody>
      {#each orderedStatKeys as cipher}
        <tr class="table-row">
          <td><strong>{cipher}</strong></td>
          {#if statMode === 'multiplayer'}
            <td>{getStat(cipher)?.elo ?? 1000}</td>
          {/if}
          <td>{getStat(cipher)?.wins ?? 0}{statMode == 'singleplayer' && (getStat(cipher)?.total) > 0 ? " / "+getStat(cipher).total : ""}</td>
          {#if statMode === 'multiplayer'}
            <td>{getStat(cipher)?.losses ?? 0}</td>
          {/if}
          <td>{winPercent(getStat(cipher))}</td>
          <td>{getStat(cipher)?.averageSolveTime ? getStat(cipher).averageSolveTime.toFixed(2) : 'N/A'}</td>
          <td>{formatTime(getStat(cipher)?.bestSolveTime)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
    .note-wrapper {
        height: 1.25rem; /* consistent vertical space */
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .note-inline {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
    }

  .stat-mode-selector {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stat-mode-selector button {
    padding: 0.4rem 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: white;
    cursor: pointer;
  }

  .stat-mode-selector button.selected {
    background: rgba(148, 131, 255, 0.25);
    border-color: rgba(148, 131, 255, 0.6);
  }

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