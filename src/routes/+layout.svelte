<script>
  import Navbar from "$lib/Components/General/Navbar.svelte";
  import { PUBLIC_APP_URL } from "$env/static/public";
  import { page } from "$app/state";
  import "$lib/css/app.css";
  import AnnouncementBar from "$lib/Components/General/AnnouncementBar.svelte";
  import { announcements } from "$lib/config/announcements";

  let { data, children } = $props();

  let announcementHeight = $state(0);
</script>

<svelte:head>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "url": "https://cipher-arena.fly.dev",
      "logo": "https://cipher-arena.fly.dev/logo.png"
    })}
  </script>
</svelte:head>

<div id="modals"></div>
<div class="app-container">
  <div class="navbar-space">
    <Navbar
      authenticated={!!data.username && !!data.email}
      verified={data.verified}
    />
  </div>

  {#if page.url.pathname === "/"}
    <div class="global-announcements" bind:clientHeight={announcementHeight}>
      <AnnouncementBar {announcements} />
    </div>
  {/if}

  <div class="main-container" style="padding-top: {76 + announcementHeight}px">
    {@render children?.()}
  </div>
</div>

<style>
  .app-container {
    min-height: 100vh;
    overflow-x: hidden;
    background-color: var(--color-bg);
  }

  .navbar-space {
    height: 60px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  .main-container {
    padding-top: 76px;
    min-height: 100vh;
    color: white;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: 24px;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
  }

  .global-announcements {
    position: fixed;
    top: 60px; /* Below navbar */
    left: 0;
    right: 0;
    z-index: 95;
    display: flex;
    flex-direction: column;
  }
</style>
