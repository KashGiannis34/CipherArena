<script>
    import Leaderboard from '$lib/Components/General/Leaderboard.svelte';
    import { generateSeo } from '$lib/util/generateSEO';

    const seo = generateSeo({
    title: 'Leaderboard — Cipher Arena',
    description: 'See the top cryptogram solvers across all cipher types. Track your rank and aim for the top spot on Cipher Arena.',
    url: 'https://cipher-arena.fly.dev/leaderboard',
    image: 'https://cipher-arena.fly.dev/landing-page/leaderboard.png'
    });
</script>

<svelte:head>{@html seo}</svelte:head>

<h1>Cipher Arena Leaderboard</h1>
<Leaderboard />

<style>
    h1 {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>
