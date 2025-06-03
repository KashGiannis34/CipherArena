<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { onMount } from 'svelte';
    import {login} from '$lib/Components/General/Info.svelte.js';

    let {data, form} = $props();
</script>

<div style="all:inherit; padding:0 !important;">
    <Auth login={data.login} toggleAvailable={true}/>
</div>