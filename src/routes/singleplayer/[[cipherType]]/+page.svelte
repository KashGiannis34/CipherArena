<script>
    import Container from "$lib/Components/General/Container.svelte";
    import Cipher from "$lib/Components/Game/Cipher.svelte";
    import Options from "$lib/Components/Game/Options.svelte";
    import Popup from "$lib/Components/General/Popup.svelte";
    import {fade} from "svelte/transition";
    import { onMount } from "svelte";
    let { data } = $props();
    let mounted = $state(false);
    let visibility=$state(false);
    let feedbackMessage=$state('');
    let options = $state({'AutoFocus':false, 'AutoSwitch':false});

    function onAttempt(message, solved) {
        feedbackMessage = message;
        toggle(solved);
    }

    function newProblem() {
        window.location.reload();
    }

    function toggle(solved) {
        if (visibility && solved && options['AutoSwitch']) {
            newProblem();
        }
        visibility = !visibility;
    }

    function onOptionChange(option) {
        options[option] = !options[option];
        sessionStorage.setItem("options", JSON.stringify(options));
    }

    onMount(() => {
        options = sessionStorage.getItem('options') ? JSON.parse(sessionStorage.getItem('options')) : {'AutoFocus':true, 'AutoSwitch':false};
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
            params={data['props']['params']} keys={JSON.parse(data['props']['keys'])}
            onAttempt={onAttempt} mode="singleplayer" newProblem={newProblem}/>

            <Popup visibility={visibility} onExit={toggle}>
                {@html feedbackMessage}
            </Popup>
        {/if}
    </div>
{/if}