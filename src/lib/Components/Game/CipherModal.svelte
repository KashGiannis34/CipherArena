<script>
  import { cubicOut } from "svelte/easing";
  import ProfilePicture from "../General/ProfilePicture.svelte";
  let { won, players, ranked, eloChanges, onRematch, onLeaveGame, winnerUsername, rematchVoters = [] } = $props();

  function zoom(node, { duration = 300 }) {
    return {
      duration,
      css: t => {
        const eased = cubicOut(t);
        return `
          transform: translate(-50%, 0%) scale(${eased});
          opacity: ${eased};
          top: 30%;
          left: 50%;
        `;
      }
    };
  }

  function fade(node, { duration = 400 }) {
    return {
      duration,
      css: t => {
        const eased = cubicOut(t);
        return `
          opacity: ${eased};
        `;
      }
    };
  }
</script>

<div class="background" in:fade out:fade></div>
<div class="modal-wrapper" in:zoom out:zoom>
  <div class="innerModal">
    <h2 class="result-text {won ? 'win' : 'lose'}">
      {won ? 'You Won!' : 'You Lost'}
    </h2>

    <div class="player-section">
        {#each players as player (player.username)}
            <div class="player-card
            {player.username === winnerUsername ? 'won-player' : 'lost-player'}
            {player.connected === false ? 'disconnected' : ''}">
                <ProfilePicture profilePicture={player.profilePicture}/>
                <div class="player-info">
                    <div class="player-name">
                        {player.username}
                        {#if player.username === winnerUsername} 🏆 {/if}
                        {#if player.connected === false}
                            <span class="player-status-tag">
                            {player.left ? '(left game)' : '(disconnected)'}
                            </span>
                        {/if}
                    </div>

                    <div class="rematch-line">
                        {#if rematchVoters.includes(player.username)}
                            <span class="player-rematch-tag">🟢 Voted Rematch</span>
                        {:else}
                            <span class="player-rematch-tag gray">🔘 No Vote</span>
                        {/if}
                    </div>
                    <div class="player-elo">
                        ELO: {player.elo}
                        {#if ranked}
                        <span class="elo-change {eloChanges[player.username] > 0 ? 'up' : 'down'}">
                            {eloChanges[player.username] > 0 ? `+${eloChanges[player.username]}` : eloChanges[player.username]}
                        </span>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>

    <div class="button-row">
      <button class="button" onclick={onLeaveGame}>Leave Game</button>
      <button class="button" onclick={onRematch}>Rematch</button>
    </div>
  </div>
</div>

<style>
    .background {
    position: fixed;
    z-index: 15;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    }

    .modal-wrapper {
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 20;
    filter: drop-shadow(0 0 20px #333);
    }

    .innerModal {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 25px 30px 20px 30px;
    background-color: #e4e0ff;
    color: black;
    border-radius: 10px;
    width: min(90vw, 400px);
    max-height: 80vh;
    overflow-y: auto;
    }

    .player-section {
    width: 100%;
    margin: 1rem 0;
    }

    .player-card {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-bottom: 0.75rem;
    }

    .won-player {
    border-left: 6px solid #4caf50;
    background: linear-gradient(to right, #c9ffd7, #e0ffe9);
    }

    .lost-player {
    border-left: 6px solid #ff5757;
    background: linear-gradient(to right, #ffe0e0, #ffd2d2);
    }

    .player-info {
    display: flex;
    flex-direction: column;
    }

    .player-name {
    font-weight: 600;
    }

    .player-elo {
    font-size: 0.95rem;
    color: #444;
    }

    .elo-change {
    margin-left: 0.5rem;
    font-weight: bold;
    transition: transform 0.3s ease;
    }

    .elo-change.up {
    color: #36d67d;
    animation: rise 0.6s ease-out;
    }

    .elo-change.down {
    color: #e14c4c;
    animation: fall 0.6s ease-out;
    }

    @keyframes rise {
    from { transform: translateY(6px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
    }

    @keyframes fall {
    from { transform: translateY(-6px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
    }

    .button-row {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    }

    .button {
    padding: 10px 20px;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    }

    .result-text {
    font-size: 2rem;
    font-weight: 700;
    display: inline-block;
    text-align: center;
    margin-bottom: 1rem;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    }

    .win {
    background-image: linear-gradient(270deg, #a379ff, #c58aff, #a379ff);
    background-size: 600% 600%;
    animation: shimmer 4s linear infinite, pulse 2s ease-in-out infinite;
    }

    .lose {
    background-image: linear-gradient(90deg, #ff7e7e, #ffa4b5);
    background-size: 100%;
    animation: dim-pulse 3s ease-in-out infinite;
    }

    @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
    }

    @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
    }

    @keyframes dim-pulse {
    0%, 100% { filter: drop-shadow(0 0 0px #ffaaaa); }
    50% { filter: drop-shadow(0 0 6px #ffb6c1); }
    }

    .disconnected {
    opacity: 0.6;
    background: linear-gradient(to right, #f0f0f0, #ddd);
    }

    .player-status-tag {
    font-size: 0.8rem;
    color: #c00;
    margin-left: 0.5rem;
    font-weight: 500;
    }

    .player-rematch-tag {
    font-size: 0.8rem;
    font-weight: 500;
    margin-left: 0.5rem;
    color: #27ae60;
    }

    .player-rematch-tag.gray {
    color: #888;
    }

    .rematch-line {
    font-size: 0.85rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    }
</style>
