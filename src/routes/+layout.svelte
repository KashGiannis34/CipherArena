<script>
    import Navbar from "$lib/Components/Navbar.svelte";
    import { page } from '$app/stores'

</script>

<div class="mainContainer">
    {#if $page.url.pathname !== "/"}
        <Navbar/>
    {/if}
    <slot />
</div>

<style>
    .mainContainer {
        min-height: 100vh;
        background: linear-gradient(to right, #000428, #000046);
        color: white;
        position: relative;
        display: flex;
        flex-direction: column;
    }
</style>