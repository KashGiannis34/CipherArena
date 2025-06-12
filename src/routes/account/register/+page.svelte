<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { onMount } from 'svelte';

    let {form} = $props();
</script>

<div style="all:inherit; padding:0 !important;">
    <Auth login={false} toggleAvailable={true} form={form}/>
</div>