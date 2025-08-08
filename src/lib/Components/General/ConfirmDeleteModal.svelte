<script>
    import { cubicOut } from 'svelte/easing';
    import { portal } from '$lib/util/portal.js';

    let { visible, username, onClose } = $props();

    let typed = $state('');
    let matches = $derived(typed === username);

    function zoom(node, { duration = 300 }) {
      return {
        duration,
        css: t => {
          const eased = cubicOut(t);
          return `
            transform: scale(${eased});
          `;
        }
      };
    }

    function fade(node, { duration = 250 }) {
      return {
        duration,
        css: t => `opacity: ${cubicOut(t)};`
      };
    }
  </script>

  {#if visible}
    <div use:portal class="overlay" onclick={onClose} onkeydown={() => {}} role="button" tabindex="0" in:fade out:fade>
      <div class="content" onclick={e => e.stopPropagation()} onkeydown={() => {}} role="dialog" aria-modal="true" tabindex="-1" in:zoom out:zoom>
        <h3>Confirm account deletion</h3>
        <p class="desc">
          This action is permanent and cannot be undone.
          To confirm, type your username <strong>@{username}</strong>.
        </p>

        <form method="POST" action="?/deleteAccount" class="form">
          <label for="confirm-username">Type your username</label>
          <input
            id="confirm-username"
            name="confirm-username"
            type="text"
            placeholder={username}
            bind:value={typed}
            autocomplete="off"
            required
          />

          <div class="actions">
            <button type="button" class="secondary" onclick={onClose}>Cancel</button>
            <button type="submit" class="danger" disabled={!matches} aria-disabled={!matches}>
              Delete account
            </button>
          </div>
        </form>
        <p class="hint">You must type the exact username to enable deletion.</p>
      </div>
    </div>
  {/if}

  <style>
    .overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
    }

    .content {
      width: min(92vw, 520px);
      padding: 18px 18px 14px 18px;
      border-radius: 16px;
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0.04) 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      color: white;
      max-height: 90vh;
      overflow: auto;
      position: relative;
      will-change: transform, opacity;
      transform-origin: center center;
    }

    h3 {
      margin: 0 0 6px 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .desc {
      margin: 0 0 12px 0;
      color: #d7dbea;
      opacity: 0.95;
      font-size: 0.95rem;
    }

    .form {
      display: grid;
      gap: 8px;
    }

    label {
      font-weight: 600;
    }

    input[type="text"] {
      padding: 0.7rem 0.85rem;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(0, 0, 0, 0.25);
      color: white;
      transition: border-color 0.2s ease, background 0.2s ease;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: rgba(148,131,255,0.7);
      background: rgba(0,0,0,0.35);
    }

    .actions {
      margin-top: 6px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .secondary {
      background: rgba(255,255,255,0.08);
      color: white;
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 10px;
      padding: 0.6rem 0.9rem;
      cursor: pointer;
      transition: filter 0.2s ease, transform 0.08s ease, box-shadow 0.2s ease;
    }
    .secondary:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.25); }
    .secondary:active { transform: translateY(0); filter: brightness(1.0); }
    .secondary:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(180, 172, 255, 0.6); }

    .danger {
      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0.6rem 0.9rem;
      cursor: pointer;
      transition: filter 0.2s ease, transform 0.08s ease, opacity 0.2s ease, box-shadow 0.2s ease;
    }
    .danger[disabled], .danger[aria-disabled="true"] {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .danger:hover:not([disabled]) { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,0,0,0.3); }
    .danger:active:not([disabled]) { transform: translateY(0); }
    .danger:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(255, 109, 109, 0.6); }

    .hint {
      margin: 8px 0 0 0;
      font-size: 0.85rem;
      color: #d7dbea;
      opacity: 0.8;
    }
  </style>