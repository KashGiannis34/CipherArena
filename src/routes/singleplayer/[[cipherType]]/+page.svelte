<script>
    import Cipher from "$lib/Components/Game/Cipher.svelte";
    import Options from "$lib/Components/Game/Options.svelte";

    let { data } = $props();

    let options = $state({'Auto Focus':true});

</script>

<div class="mainContainer">
    <Options bind:options={options}/>
    {#if Object.keys(data.props)[0] == 'error'}
        <p>There was an error in retrieving the quote.</p>
    {:else}
        <Cipher quote={data['props']['quote']} hash={data['props']['hash']}
        cipherType={data['props']['cipherType']} autoFocus={options['Auto Focus']}
        k={data['props']['k']}/>
    {/if}
</div>

<style>
    .mainContainer {
        display: flex;
        flex-direction: column; /* Stack items vertically */
        justify-content: flex-start; /* Center items within the container */
        align-items: center; /* Align items horizontally */
        min-height: 100vh;
        gap: 24px;
        padding: 24px;
        width: 100%;
        margin: 0 auto;
    }
</style>