<script>
  let {profilePicture = '/uploads/default-avatar.png', size = 40} = $props();
  let loading = $state(false);
  let src = $state(profilePicture);

  function handleLoad() {
    loading = false;
  }

  function handleError() {
    profilePicture = '/uploads/default-avatar.png';
  }
</script>

<div class="avatar-wrapper" style="width: {size}px; height: {size}px;">
  {#if loading}
    <div class="spinner"></div>
  {/if}
  <img
    src={src}
    alt="avatar"
    class="avatar"
    onload={handleLoad}
    onerror={handleError}
    style="display: {loading ? 'none' : 'block'}"
  />
</div>

<style>
  .avatar-wrapper {
    position: relative;
    border-radius: 50%;
    overflow: hidden;
  }

  .avatar {
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
</style>
