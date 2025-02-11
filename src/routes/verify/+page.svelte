<script>
    import { onMount } from "svelte";
    import Container from "$lib/Components/General/Container.svelte";

    let {data} = $props();
  </script>

  <Container>
    <h1>{data['isSuccess'] ? "Success!" : "Error"}</h1>
    <p>{data['message']}</p>
    {#if data['isSuccess']}
      <button class="button" onclick={window.location.href = "/"}>Exit</button>
    {/if}
  </Container>

  <style>
    @import '$lib/css/Button.css';
    .button {
        text-decoration: none;
    }
</style>