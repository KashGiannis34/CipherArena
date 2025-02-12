<script>
    import {login} from "$lib/Components/General/Info.svelte.js";

    let isMenuOpen = $state(false);
    let {authenticated, verified} = $props();

    function toggleMenu() {
      isMenuOpen = !isMenuOpen;
    }

    function updateStorage(newVal) {
        sessionStorage.setItem('login', JSON.stringify(newVal));
        login.val = newVal;
    }
</script>

<nav>
    <div class="logo unselectable" onclick={() => {updateStorage(true); window.location.href="/";}} onkeydown={() => {}} tabindex=-1 role="button">CipherArena</div>
    <div class={"menu-icon unselectable"} onclick={toggleMenu} onkeydown={() => {}} tabindex=-1 role="button">
      ☰
    </div>
    <div class="links {isMenuOpen ? 'open' : ''}">
      {#if !authenticated}
        <a href="/singleplayer" class="unselectable">Singleplayer</a>
        <a href="/" onclick={() => {updateStorage(true)}} class="unselectable">Login</a>
        <a href="/" onclick={() => {updateStorage(false)}} class="unselectable main">Sign up</a>
      {:else}
        {#if verified=="false"}
            <button onclick={() => {window.location.href = '/resend-verification'}} onkeydown={() => {}} class="unselectable main">Verify Account</button>
        {/if}
        <a href="/home" class="unselectable">Home</a>
        <a href="/singleplayer" class="unselectable">Singleplayer</a>
        <form action="/logout" method="POST">
            <button class="unselectable">Logout</button>
        </form>
      {/if}
    </div>
</nav>

<style>
    .unselectable {
        -moz-user-select: -moz-none;
        -khtml-user-select: none;
        -webkit-user-select: none;

        -ms-user-select: none;
        user-select: none;
    }
    nav {
        z-index: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #6a11cb, #2575fc); /* Gradient complementing container */
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8); /* Deeper shadow for contrast */
    }

    .logo {
        font-size: 1.8rem;
        font-weight: bold;
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); /* Subtle text shadow */
    }

    .links {
        z-index: 10;
        display: flex;
        gap: 0.5rem;
    }

    .links a {
        text-decoration: none;
        color: #ffffff; /* White text for links */
        font-size: 1rem;
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        transition: background 0.3s ease, color 0.3s ease;
    }

    .links button {
        text-decoration: none;
        color: #ffffff; /* White text for links */
        font-size: 1rem;
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        border: 0px;
        transition: background 0.3s ease, color 0.3s ease;
    }

    .links button:active {
        scale: 97%;
    }

    .main {
        background: rgba(228, 236, 255, 0.49) !important;
        color: #243f84 !important;
    }

    .main:hover {
        background: rgba(251, 252, 255, 0.568) !important;
        color: #3156b2 !important;
    }

    .links a:hover {
        background: rgba(255, 255, 255, 0.2); /* Soft hover highlight */
        color: #c2d3ff; /* Slightly lighter text on hover */
    }

    .links a:active {
        scale: 97%;
    }

    form {
        margin: 0;
        padding: 0;
    }

    .links form button {
        text-decoration: none;
        color: #ffffff;
        background-color: transparent;
        border-color: transparent;
        font-size: 1rem;
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        border-width: 0px;
        transition: background 0.3s ease, color 0.3s ease;
    }

    .links form button:hover {
        background: rgba(255, 255, 255, 0.2); /* Soft hover highlight */
        color: #c2d3ff; /* Slightly lighter text on hover */
    }

    .links form button:active {
        scale: 97%;
    }

    .menu-icon {
        display: none;
        font-size: 1.8rem;
        cursor: pointer;
        color: #ffffff;
        border-radius: 5px;
        padding: 3px;
    }

    .menu-icon:hover {
        background: rgba(255, 255, 255, 0.2); /* Soft hover highlight */
        color: #c2d3ff; /* Slightly lighter text on hover */
    }

    .menu-icon:active {
        scale: 97%;
    }

    @media (max-width: 768px) {
        .links {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 60px;
            right: 10px;
            background: linear-gradient(135deg, #2d33a7, #1a23c7a0); /* Match navbar */
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
        }

        .links.open {
            display: flex;
        }

        .menu-icon {
            display: block;
        }
    }
  </style>