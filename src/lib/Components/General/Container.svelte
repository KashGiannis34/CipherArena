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

		/* background: rgba(20, 22, 30, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1); */
		border-radius: 2rem;
        background: rgba(255, 255, 255, 0.06);
        box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.1);

        color: var(--color, #ffffff);
        text-align: left;
        padding-top: var(--paddingTop, 20px);
        margin-bottom: 24px;
        flex-shrink: 0;
    }
</style>