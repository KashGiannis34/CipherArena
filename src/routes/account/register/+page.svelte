<script>
    import Auth from '$lib/Components/General/Auth.svelte';
    import { generateSeo } from '$lib/util/generateSEO.js';
    import { onMount } from 'svelte';

    let {form} = $props();

    const seo = generateSeo({
    title: 'Register: Cipher Arena',
    description: 'Create your Cipher Arena account and start competing in real-time cryptogram battles. Track your stats and climb the leaderboard.',
    url: 'https://cipher-arena.fly.dev/account/register',
    image: 'https://cipher-arena.fly.dev/landing-page/pfp-badges.png'
    });
</script>

<svelte:head>{@html seo}</svelte:head>

<div style="all:inherit; padding:0 !important;">
    <Auth login={false} toggleAvailable={true} form={form}/>
</div>