<script>
  import { onMount, tick } from "svelte";
  import { slide, fade } from "svelte/transition";

  let { announcements = [] } = $props();

  let activeAnnouncements = $state([]);
  let currentIndex = $state(0);
  let visible = $state(false);
  let parsedText = $state("");

  onMount(() => {
    // Filter out announcements that have been dismissed
    activeAnnouncements = announcements.filter((a) => {
      if (!a.active) return false;
      if (a.dismissible) {
        const dismissed = localStorage.getItem(
          `announcement_dismissed_${a.id}`,
        );
        return !dismissed;
      }
      return true;
    });

    if (activeAnnouncements.length > 0) {
      visible = true;
      updateParsedText();
    }
  });

  function updateParsedText() {
    if (activeAnnouncements[currentIndex]) {
      parsedText = parseMarkdownLinks(activeAnnouncements[currentIndex].text);
    }
  }

  function next() {
    if (currentIndex < activeAnnouncements.length - 1) {
      currentIndex++;
      updateParsedText();
    }
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateParsedText();
    }
  }

  function dismissCurrent() {
    const current = activeAnnouncements[currentIndex];
    if (current && current.dismissible) {
      localStorage.setItem(`announcement_dismissed_${current.id}`, "true");

      // Remove from active list
      activeAnnouncements = activeAnnouncements.filter(
        (a) => a.id !== current.id,
      );

      if (activeAnnouncements.length === 0) {
        visible = false;
      } else {
        // Adjust index if needed
        if (currentIndex >= activeAnnouncements.length) {
          currentIndex = 0;
        }
        updateParsedText();
      }
    }
  }

  function dismissAll() {
    activeAnnouncements.forEach((a) => {
      if (a.dismissible) {
        localStorage.setItem(`announcement_dismissed_${a.id}`, "true");
      }
    });
    activeAnnouncements = [];
    visible = false;
  }

  function parseMarkdownLinks(text) {
    if (!text) return "";
    // Regex to match [text](url)
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(regex, (match, linkText, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="announcement-link">${linkText}</a>`;
    });
  }
</script>

{#if visible && activeAnnouncements.length > 0}
  <div class="announcement-bar" transition:slide>
    <div class="controls left">
      {#if activeAnnouncements.length > 1}
        <button
          class="nav-btn"
          onclick={prev}
          disabled={currentIndex === 0}
          aria-label="Previous announcement"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
          >
        </button>
      {/if}
    </div>

    <div class="content key-{activeAnnouncements[currentIndex]?.id}">
      {#key activeAnnouncements[currentIndex]?.id}
        <span class="text" in:fade={{ duration: 200 }}>{@html parsedText}</span>
      {/key}
    </div>

    <div class="controls right">
      {#if activeAnnouncements.length > 1}
        <button
          class="nav-btn"
          onclick={next}
          disabled={currentIndex === activeAnnouncements.length - 1}
          aria-label="Next announcement"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
          >
        </button>
      {/if}

      <div class="divider"></div>

      {#if activeAnnouncements.length > 1}
        <button class="action-btn dismiss-all" onclick={dismissAll}
          >Dismiss all</button
        >
      {/if}

      <button class="close-btn" onclick={dismissCurrent} aria-label="Dismiss">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="18" y1="6" x2="6" y2="18"></line><line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
          ></line></svg
        >
      </button>
    </div>
  </div>
{/if}

<style>
  .announcement-bar {
    width: 100%;
    background: var(--gradient-blue-muted);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #fff);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    position: relative;
    z-index: 90;
    font-size: 0.9rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    min-height: 40px;
  }

  .content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
    position: relative;
    padding: 0 1rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .controls.left {
    width: 80px; /* Balance the right side space roughly */
    justify-content: flex-start;
  }

  .controls.right {
    justify-content: flex-end;
  }

  /* Global styles for the injected HTML */
  :global(.announcement-link) {
    color: var(--color-primary, #aadbf7);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
    margin: 0 4px;
  }

  :global(.announcement-link:hover) {
    color: #fff;
    border-bottom-color: #fff;
  }

  .nav-btn,
  .close-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .nav-btn:hover,
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
  }

  .action-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .action-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  .divider {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 4px;
  }

  @media (max-width: 600px) {
    .announcement-bar {
      padding: 0.5rem;
      flex-wrap: wrap;
    }

    .content {
      order: 1;
      width: 100%;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    .controls.left {
      order: 2;
      width: auto;
    }

    .controls.right {
      order: 3;
      flex: 1;
    }
  }
</style>
