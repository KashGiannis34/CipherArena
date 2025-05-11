<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { fade } from 'svelte/transition';

    let {data} = $props();
</script>

<div transition:fade style="all:inherit; padding:0 !important;">
    <Auth login={true} toggleAvailable={false} roomId={data.roomId}/>
</div>