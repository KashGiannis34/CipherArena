<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    let {data} = $props();
</script>

<div style="all:inherit; padding:0 !important;">
    <Auth login={false} toggleAvailable={false} roomId={data.roomId}/>
</div>