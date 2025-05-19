<script>
    import { fade } from "svelte/transition";
    import Container from "./Container.svelte";
    import { enhance } from "$app/forms";
    import { redirect } from "@sveltejs/kit";

    let {login, roomId, toggleLogin, toggleAvailable} = $props();
    let authenticating = $state(false);
    let username = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPass = $state("");
    let feedback = $state({});

    function clearInfo() {
        feedback = {};
        username = "";
        email = "";
        password = "";
        confirmPass = "";
    }
</script>

{#key login}
    <div in:fade out:fade style="all: inherit;">
        <Container --minWidth=none --maxWidth=min(80vw,600px)>
            <form method="POST" action={"?/"+(login ? "login":"register")} onsubmit={() => {authenticating=true; feedback={};}} use:enhance={async () => {
                return({result}) => {
                    console.log(result);
                    if (result.data?.redirect) {
                        window.location.href = result.data.redirect;
                    }

                    authenticating = false;
                    feedback = result['data'];
                    if (feedback != undefined ) {
                        if ('message' in feedback && !login) {
                            username = "";
                            email = "";
                            password = "";
                            confirmPass = "";
                            if (toggleAvailable) {
                                login = true;
                            }
                            sessionStorage.setItem('login', JSON.stringify(true));
                        }
                        if ('error' in feedback && feedback['error'].includes('MongoServerError: E11000')) {
                            if (feedback['error'].includes('email')) {
                                feedback['error'] = "There is already an account using that email.";
                            } else {
                                feedback['error'] = "There is already an account using that username.";
                            }
                        }
                    }
                }
            }}>
                <h1>{login ? "Login":"Sign Up"}</h1>

                <label>
                    <i class="fas fa-envelope"></i>
                    <input bind:value={email} name="email" type="email" placeholder="Email" autocomplete="email"/>
                </label>

                {#if !login}
                    <label>
                        <i class="fas fa-user"></i>
                        <input bind:value={username} name="username" type="username" placeholder="Username" autocomplete="username"/>
                    </label>
                {/if}

                {#if roomId}
                    <input type="hidden" name="roomId" value={roomId} />
                {/if}

                <label>
                    <i class="fas fa-unlock"></i>
                    <input bind:value={password} name="password" type="password" placeholder="Password" />
                </label>

                {#if !login}
                    <label>
                        <i class="fas fa-lock"></i>
                        <input bind:value={confirmPass} name="confirmPassword" type="password" placeholder="Confirm Password" />
                    </label>
                {/if}

                {#if feedback != undefined && 'error' in feedback}
                    <p class='error' transition:fade>{feedback['error']}</p>
                {:else if feedback != undefined && 'message' in feedback}
                    <p class='message' transition:fade>{feedback['message']}</p>
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
                            <a href="/" onclick={() => {toggleLogin(); clearInfo();}} onkeydown={() => {}} tabindex=0>Login</a>
                        </div>
                    {:else}
                        <div>
                            <p>Don't have an account?</p>
                            <a href="/" onclick={() => {toggleLogin(); clearInfo();}} onkeydown={() => {}} tabindex=0>Register</a>
                        </div>
                    {/if}
                </div>
            {/if}
        </Container>
    </div>
{/key}

<style>
    @import "$lib/css/Button.css";
    p {
      text-align: center;
    }

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

    .error {
        color: coral;
    }

    .message {
        color: aquamarine;
    }
</style>