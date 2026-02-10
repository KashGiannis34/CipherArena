<script>
  import { onMount, onDestroy } from "svelte";

  let { startTime, solved, finalTime = null } = $props();

  let now = $state(Date.now() / 1000);
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      if (!solved) {
        now = Date.now() / 1000;
      }
    }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  let elapsed = $derived(
    finalTime !== null ? finalTime : Math.max(0, Math.floor(now - startTime)),
  );

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
</script>

<div class="timer">
  <span class="time">{formatTime(elapsed)}</span>
</div>

<style>
  .timer {
    position: absolute;
    top: 15px;
    right: 20px;
    padding: 6px 12px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    z-index: 10;
    pointer-events: none;
  }

  .time {
    color: var(--text-primary);
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
</style>
