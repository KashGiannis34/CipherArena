<div class="Container">
    <slot></slot>
</div>

<style>
    .Container {
        display: flex;
        flex-direction: column; /* Stack items vertically */
        justify-content: flex-start; /* Center items within the container */
        align-items: center; /* Align items horizontally */
        width: 100%;
        min-width: var(--minWidth, none);
        max-width: var(--maxWidth, 90vw);
        padding: 20px;
        border-radius: 15px;
        background: var(--bgcolor, linear-gradient(135deg, #6a11cb, #2575fc));
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        color: var(--color, #ffffff);
        text-align: left;
        padding-top: var(--paddingTop, 20px);
    }
</style>