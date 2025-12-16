<script>
  import Container from '$lib/Components/General/Container.svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';

  let { form } = $props();

  let password = $state('');
  let confirmPassword = $state('');
  let submitting = $state(false);
</script>

<svelte:head>
  <title>Reset Password</title>
</svelte:head>

<Container --minWidth=none --maxWidth=min(80vw,600px)>
  <form method="POST">
    <h1>Reset Password</h1>

    <label>
      <i class="fas fa-unlock"></i>
      <input name="password" bind:value={password} type="password" placeholder="New password" required minlength="6" />
    </label>

    <label>
      <i class="fas fa-lock"></i>
      <input name="confirmPassword" bind:value={confirmPassword} type="password" placeholder="Confirm password" required />
    </label>

    <input type="hidden" name="token" value={$page.url.searchParams.get('token')} />

    {#if form?.error}
      <p class="error" transition:fade>{form?.error}</p>
    {:else if form?.message}
      <p class="message" transition:fade>{form?.message}</p>
    {/if}

    <button type="submit" class="button" disabled={submitting}>
      {#if submitting}
        <i class="fa-solid fa-spinner spin"></i>
      {:else}
        Reset Password
      {/if}
    </button>

    <div class="options">
      <p>Done resetting?</p>
      <a href="/account/login">Back to Login</a>
    </div>
  </form>
</Container>

<style>
  @import "$lib/css/Button.css";

  input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active{
        -webkit-background-clip: text;
        -webkit-text-fill-color: var(--text-primary);
        transition: background-color 5000s ease-in-out 0s;
        box-shadow: inset 0 0 20px 20px rgba(83, 78, 133, 0.16);
        caret-color: var(--text-primary) !important;
    }

  h1 {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
  }

  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
    align-items: center;
    width: min(60vw, 400px);
    max-width: 100%;
    margin: 0 auto;
    padding: 30px;
  }

  label {
    display: flex;
    align-items: center;
    width: min(100%, 350px);
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(218, 218, 255, 0.2);
  }

  label:focus-within {
    border-color: var(--color-link-light);
    background: var(--glass-bg);
    box-shadow: 0 0 10px var(--color-link-muted);
  }

  label i {
    color: var(--text-muted);
    margin-right: 6px;
  }

  label:focus-within i {
    color: var(--color-link-light);
    font-size: larger;
  }

  input {
    width: 100%;
    border: none;
    background: transparent;
    color: white;
    padding: 8px 10px;
  }

  input::placeholder {
    color: rgba(235, 219, 255, 0.538);
  }

  input:focus {
    outline: none;
  }

  .button {
    background: var(--glass-bg-hover);
    border: 1px solid var(--glass-border-strong);
    padding: 10px 18px;
    border-radius: 12px;
    color: var(--text-primary);
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .button:hover {
    background: var(--glass-bg-active);
  }

  .button:active {
    transform: scale(0.97);
  }

  .error, .message {
    text-align: center;
    padding: 8px 12px;
    border-radius: 8px;
    width: fit-content;
    margin: 0 auto;
    font-size: 0.95rem;
  }

  .error {
    background-color: var(--color-error-bg);
    color: var(--color-error);
  }

  .message {
    background-color: rgba(0, 255, 200, 0.1);
    color: var(--color-info);
  }

  .options {
    text-align: center;
    font-size: 0.9rem;
    margin-top: 10px;
  }

  .options a {
    color: var(--color-accent-light);
    text-decoration: none;
    transition: 0.3s ease;
  }

  .options a:hover {
    color: var(--color-accent-muted);
  }
</style>