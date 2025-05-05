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
        flex-direction: var(--flexDir, column); /* Stack items vertically */
        flex-wrap: wrap;
        justify-content: center; /* Center items within the container */
        align-items: center; /* Align items horizontally */
        min-width: var(--minWidth, 90vw);
        max-width: var(--maxWidth, 90vw);
        padding: 20px;
        border-radius: 15px;
        background: var(--bgcolor, linear-gradient(135deg, #6a11cb, #2575fc));
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        color: var(--color, #ffffff);
        text-align: left;
        padding-top: var(--paddingTop, 20px);
        margin-bottom: 24px;

        flex-shrink: 0;
    }
</style>