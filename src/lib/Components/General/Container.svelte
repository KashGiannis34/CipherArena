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

		border-radius: 2rem;
        background: var(--glass-bg);
        box-shadow: var(--glass-shadow);

        color: var(--color, var(--text-primary));
        text-align: left;
        padding-top: var(--paddingTop, 20px);
        margin-bottom: 24px;
        flex-shrink: 0;
    }
</style>