<script>
  import { cubicOut } from "svelte/easing";
  import { Tween } from "svelte/motion";
  import ProfilePicture from "../General/ProfilePicture.svelte";
  import { onMount, tick } from "svelte";
  let { username, won, players, ranked, eloChanges, onRematch, onLeaveGame, winnerUsername, rematchVoters = [], solveTime } = $props();

  let animatedElos = $state({});
  let animatedChanges = $state({});
  let isAnimating = $state({});
  let changed = $state(false);

  onMount(async () => {
    if (!ranked) return;

    await tick();
    await new Promise(r => setTimeout(r, 1000));

    for (const player of players) {
      const delta = eloChanges[player.username] ?? 0;
      const start = player.elo - delta;

      let eloTween = new Tween(start, {
          duration: 2000,
          easing: cubicOut
        });

      let deltaTween = new Tween(delta, {
        duration: 2000,
        easing: cubicOut
      });

      eloTween.target = player.elo;
      deltaTween.target = 0;

      animatedElos[player.username] = eloTween;
      animatedChanges[player.username] = deltaTween;
      isAnimating[player.username] = true;

      setTimeout(() => {
        isAnimating[player.username] = false;
      }, 2000);
    }
    changed = true;
  });

  function zoom(node, { duration = 300 }) {
    return {
      duration,
      css: t => {
        const eased = cubicOut(t);
        return `
          transform: translate(-50%, 0%) scale(${eased});
          opacity: ${eased};
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

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
</script>

<div class="background" in:fade out:fade></div>
<div class="modal-wrapper" in:zoom out:zoom>
  <div class="innerModal">
    <h2 class="result-text {won ? 'win' : 'lose'}">
      {won ? 'You Won!' : 'You Lost'}
    </h2>

    {#if won && solveTime > 0}
      <div class="solve-time-display">
        ⏱ Solve Time: <span>{formatTime(solveTime)}</span>
      </div>
    {/if}

    <div class="player-section">
        {#each players.slice().sort((a, b) => (a.username === username ? -1 : b.username === username ? 1 : 0)) as player (player.username)}
            <div class="player-card
            {player.username === winnerUsername ? 'won-player' : 'lost-player'}
            {player.connected === false ? 'disconnected' : ''}">
                <ProfilePicture
                  profilePicture={player.profilePicture}
                  size={48}
                  useColorRing={player.username === username}
                  preserveSize={true}
                />
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
                      ELO:
                      {#if ranked && animatedElos[player.username]}
                        <span class="elo-main">{animatedElos[player.username].current.toFixed(0)}</span>
                        {#if isAnimating[player.username] && Math.abs(animatedChanges[player.username].current) > 0.4}
                          <span
                            class="elo-change-slide push-in {eloChanges[player.username] > 0 ? 'up' : 'down'}"
                          >
                            ({animatedChanges[player.username].current > 0 ? '+' : ''}{animatedChanges[player.username].current.toFixed(0)})
                          </span>
                        {/if}
                      {:else}
                        {changed ? player.elo : player.elo - (eloChanges[player.username] ?? 0)}
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
    top: 20vh;
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
      font-variant-numeric: tabular-nums;
      font-weight: 500;
      position: relative;
      display: inline-flex;
      gap: 0.25rem;
      align-items: center;
    }

    .elo-main {
      transition: transform 0.4s ease;
    }

    .elo-change-slide {
      font-weight: bold;
      font-size: 0.9rem;
      transition: all 0.4s ease;
      will-change: transform, opacity;
      display: inline-block;
      min-width: 40px;
      text-align: right;
    }

    .elo-change-slide.up {
      color: #36d67d;
    }

    .elo-change-slide.down {
      color: #e14c4c;
    }

    @keyframes pushInFade {
      0% {
        transform: translateX(1rem);
        opacity: 1;
      }
      50% {
        transform: translateX(0.25rem);
        opacity: 1;
      }
      100% {
        transform: translateX(0);
        opacity: 0;
      }
    }

    .elo-change-slide.push-in {
      animation: pushInFade 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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

    .solve-time-display {
    margin-top: -0.5rem;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: #222;
    background: #ffffffcc;
    padding: 6px 12px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    animation: fadeSlideIn 0.4s ease-out;
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
