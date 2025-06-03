<script>
    import Navbar from "$lib/Components/General/Navbar.svelte";
    import { page } from '$app/stores';

    let {data, children} = $props();
</script>

<div id="modals"></div>
<div class="app-container">
    <div class="navbar-space">
        <Navbar authenticated={!!data.username && !!data.email} verified={data.verified}/>
    </div>
    <div class="main-container">
        {@render children?.()}
    </div>
</div>

<style>
    .app-container {
        min-height: 100vh;
        overflow-x: hidden;
        background: linear-gradient(to right, #000428, #000046);
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
        padding-top: 76px; /* navbar height (60px) + extra padding (16px) */
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
</style>