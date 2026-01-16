<script>
    import Leaderboard from '$lib/Components/General/Leaderboard.svelte';
    import { PUBLIC_APP_URL } from '$env/static/public';
    import Seo from '$lib/Components/General/Seo.svelte';
</script>

<Seo
    title="Leaderboard: Cipher Arena"
    description="See the top cryptogram solvers across all cipher types. Track your rank and aim for the top spot on Cipher Arena."
    url={`${PUBLIC_APP_URL}/leaderboard`}
    image={`${PUBLIC_APP_URL}/landing-page/leaderboard.webp`}
/>

<h1>Cipher Arena Leaderboard</h1>
<Leaderboard />

<style>
    h1 {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>
