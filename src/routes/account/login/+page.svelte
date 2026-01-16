<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { PUBLIC_APP_URL } from '$env/static/public';
    import Seo from '$lib/Components/General/Seo.svelte';

    let {form} = $props();
</script>

<Seo
    title="Login: Cipher Arena"
    description="Log in to your Cipher Arena account to join multiplayer battles, track stats, and unlock new badges."
    url={`${PUBLIC_APP_URL}/account/login`}
    image={`${PUBLIC_APP_URL}/landing-page/pfp-badges.webp`}
/>

<div style="all:inherit; padding:0 !important;">
    <Auth login={true} toggleAvailable={true} form={form}/>
</div>