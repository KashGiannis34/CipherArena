<script>
    import Container from "../General/Container.svelte";
    import Cipherdown from "../General/Cipherdown.svelte";

    let {options, onOptionChange} = $props();
    function handleClick(event) {
        onOptionChange(event.srcElement.id);
        sessionStorage.setItem("options", JSON.stringify(options));
    }
</script>

    <Container --flexDir="row" >
        <Cipherdown/>
        {#each Object.entries(options) as [option, value]}
            <div class="option checkbox">
                <input type="checkbox" id={option} checked={options[option]} name={option} onchange={handleClick}/>
                <label for={option}>{option}</label>
            </div>
        {/each}
    </Container>

<style>
    @import "$lib/css/Checkbox.css";

    .option {
        display: flex;
        flex-direction: row;
        justify-content: flex-start; /* Center items within the container */
        align-items: center; /* Align items horizontally */
        gap: 5px;
        margin-left: 5vw;
    }
</style>
