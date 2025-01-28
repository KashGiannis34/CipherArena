<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { onMount } from 'svelte';
    import {login} from '$lib/Components/General/Info.svelte.js';
    import { fade } from 'svelte/transition';

    let {data, form} = $props();
    let mounted = $state(false);


    function toggleLogin() {
        login.val = !login.val;
        sessionStorage.setItem('login', JSON.stringify(login.val));
    }

    onMount(() => {
        if (sessionStorage.getItem('login')) {
            login.val = JSON.parse(sessionStorage.getItem('login'))
        } else {
            login.val = true;
            sessionStorage.setItem('login', JSON.stringify(true));
        }

        mounted = true;
    })
</script>

{#if mounted}
    <div transition:fade style="all:inherit; padding:0 !important;">
        <Auth login={login.val} {toggleLogin} />
    </div>
{/if}