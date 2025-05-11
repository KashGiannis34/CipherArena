<script>
    import Container from "$lib/Components/General/Container.svelte";
    import Cipher from "$lib/Components/Game/Cipher.svelte";
    import Options from "$lib/Components/Game/Options.svelte";
    import {fade} from "svelte/transition";
    import { onMount } from "svelte";
    let { data } = $props();
    let mounted = $state(false);

    let options = $state({'AutoFocus':false, 'AutoSwitch':false});
    function onOptionChange(option) {
        options[option] = !options[option];
        sessionStorage.setItem("options", JSON.stringify(options));
    }

    onMount(() => {
        options = sessionStorage.getItem('options') ? JSON.parse(sessionStorage.getItem('options')) : {'AutoFocus':true, 'AutoSwitch':false, 'Test':false};
        mounted = true;
    })
</script>

{#if mounted || Object.keys(data.props)[0] == 'error'}
    <div transition:fade>
        <Container --flexDir="row" style="gap: 3vw;">
            <Options options={options} onOptionChange={onOptionChange} cipherType={data['props']['cipherType']}/>
        </Container>

        {#if Object.keys(data.props)[0] == 'error'}
            <p>There was an error in retrieving the quote.</p>
        {:else}
            <Cipher quote={data['props']['quote']} hash={data['props']['hash']}
            cipherType={data['props']['cipherType']} autoFocus={options['AutoFocus']}
            autoSwitch={options['AutoSwitch']} params={data['props']['params']} keys={JSON.parse(data['props']['keys'])}/>
        {/if}
    </div>
{/if}