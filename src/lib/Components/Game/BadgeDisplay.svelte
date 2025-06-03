<script>
    import { badgeCriteria } from '$lib/util/badgeConfig.js';
    import { portal } from '$lib/util/portal.js';
    import { cubicOut } from 'svelte/easing';

    let { unlockedBadgeIds = [] } = $props();

    let selectedBadge = $state(null);

    function selectBadge(badge) {
      selectedBadge = badge;
    }

    function selectBadgeFromId(badgeId) {
      selectedBadge = badgeCriteria.find(badge => badge.id === badgeId);
    }

    function returnToGrid() {
      selectedBadge = null;
    }

    function zoom(node, { duration = 300 }) {
        return {
            duration,
            css: t => {
                const eased = cubicOut(t); // Apply easing
                return `
                    transform: scale(${eased});
                `;
            }
        };
    }

    function fade(node, {duration = 400}) {
        return {
            duration,
            css: t => {
                const eased = cubicOut(t); // Apply easing
                return `
                    opacity: ${eased};
                `;
            }
        };
    }

    let showModal = $state(false);
    const unlockedSet = new Set(unlockedBadgeIds);

    function toggleModal() {
      showModal = !showModal;
    }
  </script>

<!-- Compact Badge Stack -->
<div class="badge-display-wrapper" onclick={() => {toggleModal(); returnToGrid();}} role="button" tabindex="0" onkeydown={() => {}}>
    <h3>Achievements</h3>
    <div class="badge-stack">
        {#each unlockedBadgeIds as badgeId}
          <img class="badge-preview" src={`/badges/${badgeId}.png`} alt={badgeId} onclick={(e) => {e.stopPropagation(); selectBadgeFromId(badgeId); toggleModal()}} role="button" tabindex="0" onkeydown={() => {}}/>
        {/each}
    </div>
</div>

  <!-- Modal with Portal -->
{#if showModal}
    <div use:portal class="modal" onclick={toggleModal} onkeydown={() => {}} role="button" tabindex="0" in:fade out:fade>
        <div class="modal-content" onclick={e => e.stopPropagation()} onkeydown={() => {}} role="button" tabindex="0" in:zoom out:zoom>
          <i class="close-btn fa-solid fa-xmark" onclick={toggleModal} onkeydown={() => {}} role="button" tabindex=0></i>
          {#if selectedBadge}
          <i class="fa-solid fa-arrow-left back-icon" onclick={returnToGrid} onkeydown={() => {}} role="button" tabindex="0"></i>
            <div class="badge-detail">
              <img class="badge-large {unlockedSet.has(selectedBadge.id) ? '' : 'locked'}" src={`/badges/${selectedBadge.id}.png`} alt={selectedBadge.label} />
              <div class="badge-info">
                <h3>{selectedBadge.label}</h3>
                <p>{selectedBadge.description}</p>
              </div>
            </div>
          {:else}
            <h2 class="badge-title">Your Badges</h2>
            <div class="badge-grid">
              {#each badgeCriteria as badge}
                <div class="badge-grid-item" onclick={() => selectBadge(badge)} onkeydown={() => {}} role="button" tabindex="0">
                  <div class="tooltip-wrapper">
                    <img
                      src={`/badges/${badge.id}.png`}
                      alt={badge.label}
                      class="{unlockedSet.has(badge.id) ? '' : 'locked'}"
                    />
                    <span class="tooltip">{badge.description}</span>
                  </div>
                  <div class="badge-label">{badge.label}</div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
    </div>
{/if}


<style>

.badge-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.badge-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.2);
}

.badge-info {
  max-width: 400px;
  color: white;
}

.badge-info h3 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.badge-info p {
  font-size: 1rem;
  color: #ddd;
}

.back-icon {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  display: inline-block;
  cursor: pointer;
  color: #ccc;
}

.back-icon:hover {
  color: #e4e0ff;
}

.badge-display-wrapper {
  text-align: center;
  margin: 1.5rem auto;
}

.badge-display-wrapper h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.badge-stack {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
}

.badge-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.2s;
}
.badge-preview:hover {
  transform: scale(1.1);
}

.modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 1rem;
  color: white;
  width: 90%;
  max-width: 800px;
  height: max-content;
  max-height: 90vh;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
}

.close-btn:hover {
  color: #e4e0ff;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.badge-grid-item {
  text-align: center;
  position: relative;
}

.badge-grid-item img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.badge-grid-item img:hover {
  transform: scale(1.1);
}

.badge-label {
  font-size: 0.85rem;
  margin-top: 0.4rem;
  font-weight: 500;
}

.locked {
  filter: grayscale(1) brightness(0.6);
  opacity: 0.6;
}

/* Tooltip styling */
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  visibility: hidden;
  width: 180px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 0.5rem;
  position: absolute;
  z-index: 10;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip-wrapper:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

</style>