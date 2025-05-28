<script>
  import { onMount } from "svelte";
  import ColorThief from 'colorthief';

  let {profilePicture = '/uploads/default-avatar.png', size = 40, useColorRing = false, preserveSize = false, onColorExtract = null} = $props();
  let loading = $state(false);
  let src = $state(profilePicture);
  let ringColor = $state('#bcaeff');
  let imgRef;

  onMount(() => {
    if (useColorRing) {
      console.log('Using color ring for profile picture');
      if (imgRef?.complete) {
        extractColor();
        console.log('Image already loaded, extracting color...');
      } else {
        imgRef.addEventListener('load', extractColor);
        console.log('Waiting for image to load for color extraction...');
      }
    }
  });

  function extractColor() {
    try {
      const colorThief = new ColorThief();
      const [r, g, b] = colorThief.getColor(imgRef);
      ringColor = `rgb(${r}, ${g}, ${b})`;
      console.log('Extracted color:', ringColor);

      if (onColorExtract) {
        onColorExtract(ringColor);
      }
    } catch (e) {
      console.warn('Color extraction failed:', e);
    }
  }

  function handleLoad() {
    loading = false;
  }

  function handleError() {
    profilePicture = '/uploads/default-avatar.png';
  }
</script>

<div
  class="avatar-wrapper {useColorRing || preserveSize ? "ring-wrapper": ""} {preserveSize && !useColorRing ? "no-ring": ""}"
  style="
    width: {size}px;
    height: {size}px;
    --ring-color: {ringColor};
    --size: {size}px;
  "
>
  {#if loading}
    <div class="spinner"></div>
  {/if}
  <img
    bind:this={imgRef}
    src={src}
    alt="avatar"
    class="avatar"
    crossorigin="anonymous"
    onload={handleLoad}
    onerror={handleError}
    style="display: {loading ? 'none' : 'block'}"
  />
</div>

<style>
  .avatar-wrapper {
      display: inline-block;
      border-radius: 50%;
      padding: 4px; /* Reserve space for the ring */
      box-sizing: content-box; /* Ensures padding adds outside the avatar */
      --ring-thickness: 2px;
      --ring-color: #bcaeff;
      background-color: transparent;
      position: relative;
    }

    /* Ring drawn in the padding area */
    .ring-wrapper::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      border: var(--ring-thickness) solid var(--ring-color);
      box-sizing: border-box;
      opacity: 0.6;
      animation: soft-ring 3s ease-in-out infinite;
      pointer-events: none;
    }

    .ring-wrapper.no-ring::after {
      border-color: transparent;
      animation: none;
      opacity: 0;
    }

    /* Image fills the inner circle without overflow */
    .avatar {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 70%;
    height: 70%;
    transform: translate(-50%, -50%);
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-top-color: #555;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes soft-ring {
    0%, 100% { transform: scale(0.93); opacity: 0.35; }
    50%     { transform: scale(1); opacity: 0.2; }
  }
</style>