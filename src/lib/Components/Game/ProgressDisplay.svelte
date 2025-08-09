<script>
  import { fade } from "svelte/transition";
  import ProfilePicture from "../General/ProfilePicture.svelte";
  let {username, players = [], progressMap = {}, forfeitVoters = []} = $props();

  function getProgressColor(progress) {
    if (progress >= 80) return '#4caf50'; // green
    if (progress >= 50) return '#ffc107'; // yellow
    if (progress > 0) return '#f44336';   // red
    return '#ccc'; // no progress
  }

</script>

<div class="progress-display-wrapper">
  {#each players.slice().sort((a, b) => (a.username === username ? -1 : b.username === username ? 1 : 0)) as player (player.username)}
    <div class="progress-player-card {player.connected === false ? 'disconnected' : ''} {forfeitVoters.includes(player.username) ? 'forfeited' : ''}">
      <ProfilePicture profilePicture={player.profilePicture} size={40} useColorRing={player.username==username} preserveSize={true}/>
      <div class="progress-info">
        <div class="progress-username">
          <a href={`/profile/${player.username}`} target="_blank" rel="noopener noreferrer" class="profile-link">
            {player.username}
          </a>
          {#if player.connected === false}
            <span class="status-tag" transition:fade={{ duration: 300 }}>{player.left ? '(left game)' : '(disconnected)'}</span>
          {/if}
          {#if player.connected && forfeitVoters.includes(player.username)}
            <span class="status-tag forfeit-tag" transition:fade={{ duration: 300 }}>(forfeited)</span>
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
  .progress-player-card.forfeited {
    border-left-color: #ff5c5c;
    background: rgba(255, 92, 92, 0.08);
  }

  .status-tag.forfeit-tag {
    color: #ffa1a1;
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

  .progress-display-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
  }

  .progress-player-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(14px);
    border-radius: 0.75rem;
    border-left: 5px solid #7555ff;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.1);
    transition: background 0.3s ease, opacity 0.3s ease;
  }

  .progress-player-card.disconnected {
    opacity: 0.6;
    background: rgba(180, 180, 180, 0.05);
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
    color: #f0f0ff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .status-tag {
    font-size: 0.85rem;
    color: #ff8b8b;
    margin-left: 0.5rem;
  }

  .progress-bar-container {
    width: 100%;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
    margin-top: 0.3rem;
  }

  .progress-bar-fill {
    height: 100%;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.5s ease, background-color 0.3s ease;
    border-radius: 6px;
    background-color: #999;
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

  @keyframes fade-in-text {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
