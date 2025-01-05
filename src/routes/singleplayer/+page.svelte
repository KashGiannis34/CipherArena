<script>
    import Cipher from "$lib/Components/Game/Cipher.svelte";
    import { info } from "$lib/Components/Game/CipherInfo.svelte.js";
    import Options from "$lib/Components/Game/Options.svelte";

    let cipherType = "Aristocrat";
    let options = $state({'Auto Focus':false});

</script>

<div class="mainContainer">
    <Options {options}/>
    <Cipher cipherType={cipherType} autoFocus={options['Auto Focus']}/>
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