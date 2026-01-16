<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { PUBLIC_APP_URL } from '$env/static/public';
    import Seo from '$lib/Components/General/Seo.svelte';

    let {form} = $props();
</script>

<Seo
    title="Register: Cipher Arena"
    description="Create your Cipher Arena account and start competing in real-time cryptogram battles. Track your stats and climb the leaderboard."
    url={`${PUBLIC_APP_URL}/account/register`}
    image={`${PUBLIC_APP_URL}/landing-page/pfp-badges.webp`}
/>

<div style="all:inherit; padding:0 !important;">
    <Auth login={false} toggleAvailable={true} form={form}/>
</div>