<script>
  import { onMount } from "svelte";
  import Container from "$lib/Components/General/Container.svelte";

  let {data} = $props();
</script>

<svelte:head>
  <title>Resend Verification</title>
</svelte:head>

<Container>
  <h1>{data['sent'] ? "Success!" : "Error"}</h1>
  <p>{data['message']}</p>
  <a class="button" href="/profile" onclick={() => {window.location.href="/profile";}}>Go to Home</a>
</Container>

<style>
  @import '$lib/css/Button.css';
  .button {
      text-decoration: none;
  }

  p {
    text-align: center;
  }
</style>