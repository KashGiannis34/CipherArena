<script>
    import { cubicOut } from "svelte/easing";
    import Container from "./Container.svelte";

    let {children, visibility, onExit} = $props();

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

</script>

{#if visibility}
    <div class='background' onclick={onExit} onkeydown={() => {}} role="button" tabindex=-1 in:fade out:fade></div>
    <div class='modal' in:zoom out:zoom>
        <div class='innerModal'>
            <i class="fa-solid fa-xmark" onclick={onExit} onkeydown={() => {}} role="button" tabindex=0></i>
            {@render children?.()}
            <button class='button' onclick={onExit}>Ok</button>
        </div>
    </div>
{/if}

<style>
    @import '$lib/css/Button.css';
    /* --paddingTop=25px --maxWidth=min(50vw,300px) --bgcolor="#e4e0ff" --color="black" */

    .innerModal {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 25px 30px 10px 30px;
        background-color: #e4e0ff;
        color: black;
        max-width: min(50vw,300px);
        max-height: min(30vw, 200px);
        border-radius: 10px;
    }

    .button {
        width: 100%;
        margin-top: 10px;
        padding: 10px;
        font-size: 1.2rem;
        font-weight: bold;
    }

    .background {
        position: fixed;
        z-index: 15;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
    }

    .modal {
        max-height: min(30vw, 200px);
        max-width: min(50vw,300px);
        display: flex;
        justify-content: center;
        z-index: 20;
        top: 30%;
        left: 50%;
        transform: translate(-50%, 0);
        filter: drop-shadow(0 0 20px #333);
        transition: transform 0.3s ease-in, opacity 0.3s ease;
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