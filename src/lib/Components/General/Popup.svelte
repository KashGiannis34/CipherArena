<script>
    import { cubicOut } from "svelte/easing";
    import Container from "./Container.svelte";
    import { portal } from '$lib/util/portal.js';

    let {children, visibility, onExit} = $props();

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

    function fade(node, {duration = 300}) {
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
    <div use:portal class='overlay' onclick={onExit} onkeydown={() => {}} role="button" tabindex="0" in:fade out:fade>
        <div class='modal-content' onclick={e => e.stopPropagation()} onkeydown={() => {}} role="dialog" aria-modal="true" tabindex="-1" in:zoom out:zoom>
            <i class="close-btn fa-solid fa-xmark" onclick={onExit} onkeydown={() => {}} role="button" tabindex="0"></i>
            {@render children?.()}
            <button class='button' type="button" onclick={onExit}>Ok</button>
        </div>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px;
    }
    .modal-content {
        background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.08));
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(20px);
        color: white;
        border-radius: 16px;
        padding: 24px 24px 16px 24px;
        width: min(92vw, 520px);
        max-height: 90vh;
        overflow: auto;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        will-change: transform, opacity;
        transform-origin: center center;
    }

    .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 1.25rem;
        cursor: pointer;
        color: var(--color-neutral-200);
        transition: transform 0.08s ease, color 0.2s ease;
    }
    .close-btn:hover { color: var(--text-primary); transform: scale(1.05); }
    .close-btn:active { transform: scale(0.95); }

    .button {
        align-self: center;
        background: var(--gradient-primary-hover);
        color: var(--text-primary);
        border: none;
        max-width: 50%;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        transition: filter 0.2s ease, transform 0.08s ease, box-shadow 0.2s ease;
    }

    .button:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,0,0,0.3); }
    .button:active { transform: translateY(0); }
    .button:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(130, 169, 255, 0.6); }
</style>