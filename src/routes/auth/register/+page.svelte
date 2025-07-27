<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    let {data, form} = $props();
</script>

<svelte:head>
  <title>Register</title>
</svelte:head>

<div style="all:inherit; padding:0 !important;">
    <Auth login={false} toggleAvailable={false} roomId={data.roomId || form?.roomId} form={form}/>
</div>