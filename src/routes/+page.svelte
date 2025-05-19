<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { onMount } from 'svelte';
    import {login} from '$lib/Components/General/Info.svelte.js';

    let {data, form} = $props();


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
    })
</script>

<div style="all:inherit; padding:0 !important;">
    <Auth login={login.val} {toggleLogin} toggleAvailable={true}/>
</div>