<script>
    import Auth from '$lib/Components/General/Auth.svelte';

    let {data} = $props();
</script>

<div style="all:inherit; padding:0 !important;">
    <Auth login={true} toggleAvailable={false} roomId={data.roomId}/>
</div>