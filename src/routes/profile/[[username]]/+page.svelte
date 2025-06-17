<script>
  import EditableProfilePicture from '$lib/Components/General/EditableProfilePicture.svelte';
  import ProfileStats from '$lib/Components/General/ProfileStats.svelte';
  import BadgeDisplay from '$lib/Components/Game/BadgeDisplay.svelte';
  import { getUnlockedBadges } from '$lib/util/badgeConfig.js';
  import { cipherTypes } from '$db/shared-utils/CipherTypes.js';
  import SolveTimeHistogram from '$lib/Components/Game/SolveTimeHistogram.svelte';


  let { data } = $props();
  let { username, profilePicture, stats, isOwnProfile } = data;

  let profileStats = stats ? JSON.parse(stats) : {};
  let uploadError = $state("");
  let unlockedBadgeIds = $derived(getUnlockedBadges(profileStats).map(b => b.id));

  let selectedCipher = $state('All');
  let cipherOptions = ['All', ...Object.keys(cipherTypes)];

  function onUploadError(error) {
    uploadError = error;
  }

  function getSolveTimes(cipher) {
    return profileStats?.[cipher]?.solveTimes?.map(entry =>
      entry.length > 0 ? entry.time / entry.length : 0
    ) ?? [];
  }
</script>

<section class="profile-page animate-glass-emerge">
  <div class="gradient-mesh"></div>
  <div class="noise-overlay"></div>

  <div class="shimmer-overlay"></div>

  <div class="profile-header animate-content-rise">
    <EditableProfilePicture {profilePicture} size={120} {isOwnProfile} sendError={onUploadError} />
    <h1 class="username animate-text-glow">@{username}</h1>
    {#if uploadError}
      <p class="upload-error animate-error-slide">{uploadError}</p>
    {/if}
  </div>

  <div class="divider-section animate-divider-expand">
    <hr class="glass-divider" />
  </div>

  <div class="badges-wrapper animate-stats-float">
    <BadgeDisplay {unlockedBadgeIds} stats={profileStats} {isOwnProfile} />
  </div>

  <div class="divider-section animate-divider-expand">
    <hr class="glass-divider" />
  </div>

  <div class="stats-wrapper animate-stats-float">
    <ProfileStats stats={profileStats} />
  </div>

  <div class="divider-section animate-divider-expand">
    <hr class="glass-divider" />
  </div>

  <div class="solve-time-section">
    <div class="cipher-selector">
      {#each cipherOptions as option}
        <button
          class:selected={selectedCipher === option}
          onclick={() => selectedCipher = option}
        >
          {option}
        </button>
      {/each}
    </div>

    {#if getSolveTimes(selectedCipher).length}
      <SolveTimeHistogram
        solveTimes={getSolveTimes(selectedCipher)}
        cipherType={selectedCipher}
      />
    {:else}
      <p class="no-data">No solve time data available for {selectedCipher}.</p>
    {/if}
  </div>
</section>

<style>
.profile-page {
  position: relative;
  padding: 2.5rem;
  max-width: 80vw;
  width: 100%;
  margin: 0 auto;
  color: white;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.04) 50%,
    rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.5rem;
  box-shadow:
    0 25px 45px rgba(0, 0, 0, 0.3),
    0 10px 25px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    inset 0 -1px 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.gradient-mesh {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 90%, rgba(255, 255, 255, 0.015) 0%, transparent 45%),
    radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.025) 0%, transparent 35%);
  animation: meshShift 20s ease-in-out infinite;
  pointer-events: none;
}

.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-conic-gradient(from 0deg at 50% 50%,
      transparent 0deg,
      rgba(255, 255, 255, 0.005) 1deg,
      transparent 2deg);
  animation: noiseMove 8s linear infinite;
  pointer-events: none;
  opacity: 0.3;
}

.shimmer-overlay {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.03) 50%,
    transparent 70%);
  animation: shimmerMove 6s ease-in-out infinite;
  pointer-events: none;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.username {
  font-size: 2rem;
  font-weight: bold;
  text-shadow:
    0 0 20px rgba(255, 255, 255, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.upload-error {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-top: -0.5rem;
  backdrop-filter: blur(10px);
  box-shadow:
    0 4px 15px rgba(239, 68, 68, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.divider-section {
  position: relative;
  margin: 2rem 0;
  height: 1px;
}

.glass-divider {
  width: 100%;
  height: 1px;
  border: none;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%);
  position: relative;
}

.stats-wrapper {
  position: relative;
  z-index: 2;
}

/* Mount Animations */
.animate-glass-emerge {
  animation: glassEmerge 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.animate-content-rise {
  animation: contentRise 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both;
}

.animate-text-glow {
  animation: textGlowIn 1s ease-out 0.6s both;
}

.animate-divider-expand {
  animation: dividerExpand 0.8s ease-out 0.8s both;
}

.animate-stats-float {
  animation: statsFloat 0.8s cubic-bezier(0.23, 1, 0.32, 1) 1s both;
}

.animate-error-slide {
  animation: errorSlide 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Keyframe Animations */
@keyframes glassEmerge {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(40px);
    backdrop-filter: blur(0px);
  }
  50% {
    backdrop-filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    backdrop-filter: blur(20px);
  }
}

@keyframes contentRise {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes textGlowIn {
  0% {
    opacity: 0;
    text-shadow: 0 0 0 rgba(255, 255, 255, 0);
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    text-shadow:
      0 0 20px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.3);
    transform: translateY(0);
  }
}

@keyframes dividerExpand {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes statsFloat {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes errorSlide {
  0% {
    opacity: 0;
    transform: translateX(-20px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes meshShift {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(0.5deg) scale(1.02);
  }
  50% {
    transform: rotate(-0.3deg) scale(0.98);
  }
  75% {
    transform: rotate(0.8deg) scale(1.01);
  }
}

@keyframes noiseMove {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-2px, 1px);
  }
  50% {
    transform: translate(1px, -1px);
  }
  75% {
    transform: translate(-1px, 2px);
  }
  100% {
    transform: translate(0, 0);
  }
}

@keyframes profileBorderGlow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.02);
  }
}

@keyframes highlightShift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.15;
  }
  25% {
    transform: translate(5px, -3px) scale(1.1);
    opacity: 0.25;
  }
  50% {
    transform: translate(-2px, 8px) scale(0.9);
    opacity: 0.1;
  }
  75% {
    transform: translate(-8px, -5px) scale(1.05);
    opacity: 0.2;
  }
}

@keyframes shimmerMove {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 2rem 1.5rem;
  }

  .username {
    font-size: 1.75rem;
  }

  .gradient-mesh {
    opacity: 0.8;
  }

  .noise-overlay {
    opacity: 0.2;
  }
}

.solve-time-section {
  margin-top: 2rem;
}

.cipher-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.cipher-selector button {
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.cipher-selector button.selected {
  background: rgba(148, 131, 255, 0.25);
  border-color: rgba(148, 131, 255, 0.6);
}

.no-data {
  color: #aaa;
  font-style: italic;
  text-align: center;
}
</style>