<script>
    import Container from "../Container.svelte";

    let {options} = $props();
</script>

<Container>

    {#each Object.entries(options) as [option, value]}
        <div class="option checkbox">
            <input type="checkbox" id={option} name={option} bind:checked={options[option]}/>
            <label for={option}>{option}</label>
        </div>
    {/each}
</Container>

<style>
    @import "$lib/css/Checkbox.css";

    .option {
        display: flex;
        flex-direction: row; /* Stack items vertically */
        justify-content: flex-start; /* Center items within the container */
        align-items: center; /* Align items horizontally */
        gap: 5px;
    }
</style>
