<script>
    import { cubicOut } from "svelte/easing";
    import Container from "./Container.svelte";
    let {children, visibility=$bindable(), exit} = $props();

    function zoom(node, { duration = 300 }) {
        return {
            duration,
            css: t => {
                const eased = cubicOut(t); // Apply easing
                return `
                    transform: scale(${eased});
                    opacity: ${eased};
                `;
            }
        };
    }

</script>

{#if visibility}
    <div class='background' onclick={() => {exit();}} onkeydown={() => {}}></div>
    <div class='modal' in:zoom out:zoom>
        <Container --paddingTop=25px --maxWidth=min(50vw,300px) --bgcolor="#e4e0ff" --color="black">
            <i class="fa-solid fa-xmark" onclick={() => {exit();}} onkeydown={() => {}}></i>
            {@render children?.()}
            <button class='button' onclick={() => {exit();}}>Ok</button>
        </Container>
    </div>
{/if}

<style>
    @import '$lib/css/Button.css';

    .button {
        padding: 10px 20px;
        margin-bottom: 0px;
    }

    .background {
        position: fixed;
        z-index: 99;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
    }

    .modal {
        z-index: 100;
        position: fixed;
        top: 30%;
        filter: drop-shadow(0 0 20px #333);
    }

    .modal {
        transition: transform 0.3s ease-in, opacity 0.3s ease;
    }

    i {
        position: absolute;
        top: 10px;
        right: 13px;
        padding-left: 5px;
    }

    i:hover {
        cursor: pointer;
    }

    i:active {
        scale: 90%;
    }
</style>