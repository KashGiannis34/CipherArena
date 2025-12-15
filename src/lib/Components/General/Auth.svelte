<script>
  import { fade } from "svelte/transition";
  import Container from "./Container.svelte";

  let { login, roomId, toggleAvailable, form } = $props();
  let authenticating = $state(false);
  let captchaToken = $state(null);

  let email = $state(form?.email || "");
  let username = $state(form?.username || "");
  let password = $state(form?.password || "");
  let confirmPassword = $state(form?.confirmPassword || "");

  function captchaAction(node) {
    let widgetId = null;

    const loadScript = () => {
      if (window.grecaptcha) {
        renderCaptcha();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderCaptcha();
      };
      script.onerror = () => {
        node.innerHTML = `<p
        style="text-align: center;
        padding: 8px 12px;
        border-radius: 8px;
        width: fit-content;
        margin: 0 auto;
        font-size: 0.95rem;
        background-color: rgba(255, 100, 100, 0.15);
        color: #ff7f7f;">
        Failed to load captcha. Please refresh the page.</p>`;
      };
      document.head.appendChild(script);
    };

    const renderCaptcha = () => {
      if (!window.grecaptcha || !window.grecaptcha.render) {
        setTimeout(renderCaptcha, 100);
        return;
      }

      try {
        widgetId = window.grecaptcha.render(node, {
          sitekey: '6Le2c-orAAAAAHq_sikutvgX-LdsCMybbgLgGv3q',
          callback: (token) => {
            captchaToken = token;
          },
          'expired-callback': () => {
            captchaToken = null;
          }
        });
      } catch (err) {
        console.error('reCAPTCHA render error:', err);
      }
    };

    loadScript();

    return {
      destroy() {
        if (widgetId !== null && window.grecaptcha) {
          try {
            window.grecaptcha.reset(widgetId);
          } catch (err) {
            console.error('Failed to reset captcha:', err);
          }
        }
      }
    };
  }

  function handleSubmit(event) {
    if (!login && !captchaToken) {
      event.preventDefault();
      alert('Please complete the captcha verification');
      return false;
    }
    authenticating = true;
  }
</script>

{#key login}
  <div in:fade out:fade style="all: inherit;">
    <Container --minWidth=none --maxWidth=min(80vw,600px)>
      <form method="POST" onsubmit={handleSubmit}>
        <h1>{login ? "Login" : "Sign Up"}</h1>

        <label>
          <i class="fas fa-envelope"></i>
          <input
            name="email"
            type="email"
            placeholder="Email"
            bind:value={email}
            required
          />
        </label>

        {#if !login}
          <label>
            <i class="fas fa-user"></i>
            <input
              name="username"
              type="text"
              placeholder="Username"
              bind:value={username}
              required
            />
          </label>
        {/if}

        {#if roomId}
          <input type="hidden" name="roomId" value={roomId} />
        {/if}

        <label>
          <i class="fas fa-unlock"></i>
          <input
            name="password"
            type="password"
            placeholder="Password"
            bind:value={password}
            required
          />
        </label>

        {#if !login}
          <label>
            <i class="fas fa-lock"></i>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              bind:value={confirmPassword}
              required
            />
          </label>

          <!-- Captcha for registration only -->
          <div class="captcha-wrapper">
            <div use:captchaAction></div>
            <input type="hidden" name="captchaToken" value={captchaToken || ""} />
          </div>
        {/if}

        {#if form?.error}
          <p class='error' transition:fade>{form.error}</p>
        {:else if form?.message}
          <p class='message' transition:fade>{form.message}</p>
        {/if}

        {#if login}
          <div class="forgot-password">
            <a href="/forgot-password" target="_blank" rel="noopener noreferrer">Forgot Password?</a>
          </div>
        {/if}

        <button type="submit" class="button">
          {#if authenticating}
            <i class="fa-solid fa-spinner spin"></i>
          {:else if !login}
            Register
          {:else}
            Login
          {/if}
        </button>
      </form>

      {#if toggleAvailable}
        <div class="options">
          <p>Or</p>
          {#if !login}
            <div>
              <p>Already have an account?</p>
              <a href="/account/login">Login</a>
            </div>
          {:else}
            <div>
              <p>Don't have an account?</p>
              <a href="/account/register">Register</a>
            </div>
          {/if}
        </div>
      {/if}
    </Container>
  </div>
{/key}

<style>
  @import "$lib/css/Button.css";

  .forgot-password {
    width: 100%;
    text-align: right;
    padding-right: 10px;
    margin-top: -10px;
  }

  .forgot-password a {
    font-size: 0.9rem;
    color: rgba(93, 239, 255, 0.85);
    text-decoration: none;
    transition: 0.3s ease;
  }

  .forgot-password a:hover {
    color: rgba(68, 202, 255, 0.562);
    cursor: pointer;
  }

  p {
    text-align: center;
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

  h1 {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
  }

  form label {
    display: flex;
    align-items: center;
    width: min(100%, 350px);
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(218, 218, 255, 0.2);
    transition: border 0.3s ease, background 0.3s ease;
  }

  form label:focus-within {
    border-color: rgb(141, 191, 255);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 10px rgba(141, 191, 255, 0.3);
  }

  form label i {
    color: #ffffffaa;
    margin-right: 6px;
  }

  form label:focus-within i {
    color: rgb(141, 191, 255);
    font-size: larger;
  }

  input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active{
    -webkit-background-clip: text;
    -webkit-text-fill-color: #ffffff;
    transition: background-color 5000s ease-in-out 0s;
    box-shadow: inset 0 0 20px 20px #534e8529;
    caret-color: white !important;
}

  form label input {
    width: 100%;
    border: none;
    background: transparent;
    color: white;
    padding: 8px 10px;
  }

  form input::placeholder {
    color: rgba(235, 219, 255, 0.538);
  }

  form input:focus {
    outline: none;
  }

  button.button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px 18px;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  button.button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  button.button:active {
    transform: scale(0.97);
  }

  .spin {
    animation: spin 2s infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .options {
    padding: 14px 0;
    overflow: hidden;
    font-size: 0.9rem;
    flex-direction: column;
    gap: 4px;
  }

  .options > p {
    position: relative;
    text-align: center;
    width: fit-content;
    margin: 0 auto;
    padding: 8px;
    padding-bottom: 10px;
  }

  .options > p::after,
  .options > p::before {
    position: absolute;
    content: "";
    top: 50%;
    width: 100vw;
    height: 1.5px;
    background: white;
  }

  .options > p::after {
    right: 100%;
  }

  .options > p::before {
    left: 100%;
  }

  .options div {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .options div a {
    position: relative;
    text-align: center;
    width: fit-content;
    margin: 0;
    padding-bottom: 16px;
    color: rgb(93, 239, 255);
    cursor: pointer;
    transition: 0.5s ease;
    text-decoration: none;
  }

  .options div a:hover {
    color: rgba(68, 202, 255, 0.562);
    cursor: pointer;
  }

  .options div a:active {
    font-size: 95%;
  }

  .error,
  .message {
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

  .captcha-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 78px;
  }
</style>
