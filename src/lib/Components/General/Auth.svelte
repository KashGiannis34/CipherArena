<script>
    import { fade } from "svelte/transition";
    import Container from "./Container.svelte";
    import { enhance } from "$app/forms";

    let {login, toggleLogin, form} = $props();
    let authenticating = $state(false);
    let handleAuth = $state(false);
    let username = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPass = $state("");

    function handleAuthFinish() {
        $state.snapshot("handleauth: "+handleAuth);
        $state.snapshot("authenticating: "+authenticating);
        authenticating = false;
        if (!login && form?.message) {
            login = true;
            sessionStorage.setItem('login', JSON.stringify(true));
            username = "";
            email = "";
            password = "";
            confirmPass = "";
        }
        handleAuth = true;
    }

    $effect(() => {
        if (!handleAuth && (form?.message || form?.error)) {
            handleAuthFinish();
        }
    })
</script>

{#key login}
    <div in:fade out:fade style="all: inherit;">
        <Container --maxWidth=min(80vw,600px)>
            <form method="POST" action={"?/"+(login ? "login":"register")} use:enhance>
                <h1>{login ? "Login":"Sign Up"}</h1>

                {#if !login}
                    <label>
                        <i class="fas fa-user"></i>
                        <input bind:value={username} name="username" type="username" placeholder="Username" />
                    </label>
                {/if}

                <label>
                    <i class="fas fa-envelope"></i>
                    <input bind:value={email} name="email" type="email" placeholder="Email" />
                </label>
                <label>
                    <i class="fas fa-unlock"></i>
                    <input bind:value={password} name="password" type="password" placeholder="Password" />
                </label>

                {#if !login}
                    <label>
                        <i class="fas fa-lock"></i>
                        <input bind:value={confirmPass} name="confirmPassword" type="confirmPassword" placeholder="Confirm Password" />
                    </label>
                {/if}

                <button type="submit" class="button" onclick={() => {authenticating=true; handleAuth=false;}}>
                    {#if authenticating}
                        <i class="fa-solid fa-spinner spin"></i>
                    {:else if !login}
                        Register
                    {:else}
                        Login
                    {/if}
                </button>

                {#if form?.error}
                    <p style="color: coral;">{form.error}</p>
                {:else if form?.message}
                    <p style="color: #41c899;">{form.message}</p>
                {/if}
            </form>
            <div class="options">
                <p>Or</p>
                {#if !login}
                    <div>
                        <p>Already have an account?</p>
                        <p onclick={() => {toggleLogin()}} onkeydown={() => {}}>Login</p>
                    </div>
                {:else}
                    <div>
                        <p>Don't have an account?</p>
                        <p onclick={() => {toggleLogin()}} onkeydown={() => {}}>Register</p>
                    </div>
                {/if}
            </div>
        </Container>
    </div>
{/key}

<style>
    @import "$lib/css/Button";
    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 15px;
        align-items: center;
    }

    form,
    .options {
        width: min(60vw, 400px);
        max-width: 100%;
        margin: 0 auto;
    }

    h1 {
        text-align: center;
        font-size: 2rem;
        font-weight: 700;
    }

    form label {
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(218, 218, 255, 0.606);
        margin: 0;
        width: min(100%, 350px);
        transition: 0.9 ease !important;
    }

    form label input {
        width: 100%;
        border: none;
        background: transparent !important;
        filter: none !important;
        color: white;
        padding: 8px 10px;
    }

    form label i {
        margin-right: 3px;
    }

    form input::placeholder {
        color: rgba(235, 219, 255, 0.538);
    }

    form input:focus {
        border: none;
        outline: none;
    }

    form label:focus-within {
        border-color: rgb(179, 179, 255);
    }

    form label:focus-within i {
        color: rgb(179, 179, 255);
        font-size: larger;
    }

    .spin {
        animation: spin 2s infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        } to {
            transform: rotate(360deg);
        }
    }

    .options{
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
        content:"";
        top: 50%;
        tranform: translateY(-50%);
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

    .options div p:last-of-type {
        color: rgb(93, 239, 255);
        cursor: pointer;
        transition: 0.5s ease;
    }

    .options div p:last-of-type:hover {
        color: rgba(68, 202, 255, 0.562);
        cursor: pointer;
    }

    .options div p:last-of-type:active {
        font-size: 95%;
    }
</style>