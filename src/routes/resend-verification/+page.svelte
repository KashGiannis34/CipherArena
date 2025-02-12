<script>
    import { onMount } from "svelte";
    import Container from "$lib/Components/General/Container.svelte";

    let {data} = $props();
  </script>

  <Container>
    <h1>{data['sent'] ? "Success!" : "Error"}</h1>
    <p>{data['message']}</p>
    <a class="button" href="/home" onclick={() => {window.location.href="/home";}}>Go to Home</a>
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