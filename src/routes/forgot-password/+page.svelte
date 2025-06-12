<script>
  import Container from '$lib/Components/General/Container.svelte';
  import { fade } from 'svelte/transition';

  let {form} = $props();

  let email = $state("");
  let sending = $state(false);
</script>

<Container --minWidth=none --maxWidth=min(80vw,600px)>
  <form method="POST">
    <h1>Forgot Password</h1>

    <label>
      <i class="fas fa-envelope"></i>
      <input bind:value={email} name="email" type="email" placeholder="Enter your email" required />
    </label>

    {#if form?.error}
      <p class="error" transition:fade>{form.error}</p>
    {:else if form?.message}
      <p class="message" transition:fade>{form.message}</p>
    {/if}

    <button type="submit" class="button">
      {#if sending}
        <i class="fa-solid fa-spinner spin"></i>
      {:else}
        Send Reset Link
      {/if}
    </button>

    <div class="options">
      <p>Remembered your password?</p>
      <a href="/account/login">Back to Login</a>
    </div>
  </form>
</Container>

<style>
  @import "$lib/css/Button.css";

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
    border-color: rgb(141, 191, 255);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 10px rgba(141, 191, 255, 0.3);
  }

  label i {
    color: #ffffffaa;
    margin-right: 6px;
  }

  label:focus-within i {
    color: rgb(141, 191, 255);
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
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px 18px;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .button:active {
    transform: scale(0.97);
  }

  .spin {
    animation: spin 2s infinite linear;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
    background-color: rgba(255, 100, 100, 0.15);
    color: #ff7f7f;
  }

  .message {
    background-color: rgba(0, 255, 200, 0.1);
    color: aquamarine;
  }

  .options {
    text-align: center;
    font-size: 0.9rem;
    margin-top: 10px;
  }

  .options a {
    color: rgb(93, 239, 255);
    text-decoration: none;
    transition: 0.3s ease;
  }

  .options a:hover {
    color: rgba(68, 202, 255, 0.562);
  }
</style>