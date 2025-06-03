<script>
	let { children, style } = $props();
</script>

<div class="Container" style={style}>
    {@render children?.()}
</div>

<style>
    .Container {
        position: relative;
        display: flex;
        flex-direction: var(--flexDir, column);
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        min-width: var(--minWidth, 90vw);
        max-width: var(--maxWidth, 90vw);
        padding: 20px;
        border-radius: 20px;

        background: rgba(255, 255, 255, 0.05);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.37),
            inset 0 0 0.5px rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, 0.18);

        color: var(--color, #ffffff);
        text-align: left;
        padding-top: var(--paddingTop, 20px);
        margin-bottom: 24px;
        flex-shrink: 0;
    }
</style>