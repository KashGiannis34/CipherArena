<script>
    import { cubicOut } from "svelte/easing";
    import Container from "./Container.svelte";

    let {children, visibility, toggle} = $props();

    function zoom(node, { duration = 300 }) {
        return {
            duration,
            css: t => {
                const eased = cubicOut(t); // Apply easing
                return `
                    transform: translate(-50%, 0%) scale(${eased});
                    opacity: ${eased};
                    top: 30%;
                    left: 50%;
                `;
            }
        };
    }

    function fade(node, {duration = 400}) {
        return {
            duration,
            css: t => {
                const eased = cubicOut(t); // Apply easing
                return `
                    opacity: ${eased};
                `;
            }
        };
    }

    function exit() {
        toggle();
    }

</script>

{#if visibility}
    <div class='background' onclick={exit} onkeydown={() => {}} in:fade out:fade></div>
    <div class='modal' in:zoom out:zoom>
        <Container --paddingTop=25px --maxWidth=min(50vw,300px) --bgcolor="#e4e0ff" --color="black">
            <i class="fa-solid fa-xmark" onclick={exit} onkeydown={() => {}}></i>
            {@render children?.()}
            <button class='button' onclick={exit}>Ok</button>
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
        z-index: 90;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
    }

    .modal {
        max-height: 200px;
        max-width: min(50vw,300px);
        display: flex;
        justify-content: center;
        z-index: 100;
        top: 30%;
        left: 50%;
        transform: translate(-50%, 0);
        filter: drop-shadow(0 0 20px #333);
        transition: transform 0.3s ease-in, opacity 0.3s ease;
    }

    .container {
        display:block;
        z-index: 100;
        min-height: 20vw;
    }

    i {
        position: absolute;
        top:5%;
        right: 5%;
    }

    i:hover {
        cursor: pointer;
    }

    i:active {
        scale: 90%;
    }
</style>