<script>
  import ProfilePicture from "../General/ProfilePicture.svelte";
  let {username, players = [], progressMap = {}} = $props();

  function getProgressColor(progress) {
    if (progress >= 80) return '#4caf50'; // green
    if (progress >= 50) return '#ffc107'; // yellow
    if (progress > 0) return '#f44336';   // red
    return '#ccc'; // no progress
  }
</script>

<div class="progress-display-wrapper">
  {#each players.slice().sort((a, b) => (a.username === username ? -1 : b.username === username ? 1 : 0)) as player (player.username)}
    <div class="progress-player-card {player.connected === false ? 'disconnected' : ''}">
      <ProfilePicture profilePicture={player.profilePicture} size={40} useColorRing={player.username==username} preserveSize={true}/>
      <div class="progress-info">
        <div class="progress-username">
          {player.username}
          {#if player.connected === false}
            <span class="status-tag">{player.left ? '(left game)' : '(disconnected)'}</span>
          {/if}
        </div>

        <div class="progress-bar-container">
          <div
            class="progress-bar-fill {(progressMap[player.username] ?? 0) >= 90 ? 'danger-pulse' : ''}"
            style="
              transform: scaleX({(progressMap[player.username] ?? 0) / 100});
              background-color: {getProgressColor(progressMap[player.username] ?? 0)};
            "
          ></div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .progress-display-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
  }

  .progress-player-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background-color: #f5f5ff;
    border-radius: 0.75rem;
    border-left: 5px solid #7555ff;
    transition: background-color 0.2s ease;
  }

  .progress-player-card.disconnected {
    opacity: 0.6;
    background: linear-gradient(to right, #eeeeee, #cccccc);
  }

  .progress-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .progress-username {
    font-weight: 600;
    font-size: 1rem;
    color: #333;
  }

  .status-tag {
    font-size: 0.85rem;
    color: #c00;
    margin-left: 0.5rem;
  }

  .progress-bar-container {
    width: 100%;
    height: 10px;
    background-color: #ddd;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 0.3rem;
    transform-origin: left;
  }

  .progress-bar-fill {
    height: 100%;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.5s ease, background-color 0.3s ease;
  }

  .danger-pulse {
    animation: pulse-danger 1s infinite ease-in-out;
  }

  @keyframes pulse-danger {
    0%, 100% {
      box-shadow: 0 0 0px rgba(255, 0, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
    }
  }
</style>
