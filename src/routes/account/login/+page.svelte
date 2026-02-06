<script>
  import Auth from "$lib/Components/General/Auth.svelte";
  import { generateSeo } from "$lib/util/generateSEO.js";
  import { onMount } from "svelte";

  let { form } = $props();

  const seo = generateSeo({
    title: "Login: Cipher Arena",
    description:
      "Log in to your Cipher Arena account to join multiplayer battles, track stats, and unlock new badges.",
    url: "https://cipherarena.com/account/login",
    image: "https://cipherarena.com/landing-page/pfp-badges.webp",
  });
</script>

<svelte:head>{@html seo}</svelte:head>

<div style="all:inherit; padding:0 !important;">
  <Auth login={true} toggleAvailable={true} {form} />
</div>
