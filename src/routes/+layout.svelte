<script>
    import Navbar from "$lib/Components/General/Navbar.svelte";
    import { page } from '$app/stores';
    import { fade } from "svelte/transition";
    import { io } from 'socket.io-client'

    const socket = io()

    socket.on('eventFromServer', (message) => {
        console.log(message)
    })

    let {data, children} = $props();
</script>

<div style="overflow-x: hidden;">
    <Navbar authenticated={!!data.username && !!data.email} verified={data.verified}/>
    <div class="mainContainer">
        {@render children?.()}
    </div>
</div>

<style>
    .mainContainer {
        min-height: 100vh;
        background: linear-gradient(to right, #000428, #000046);
        color: white;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;

        justify-content: flex-start;
        align-items: center;
        width: 100vw;
        /* margin: 0 auto; */
    }
</style>