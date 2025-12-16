<!-- src/lib/components/LoadingOverlay.svelte -->
<div class="loading-overlay">
    <div class="spinner"></div>
</div>

<style>
    .loading-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.298);
        z-index: 1;
        padding: 5vw;
        text-align: center;
        box-sizing: border-box;
    }

    .spinner {
        width: 12vw;
        height: 12vw;
        max-width: 60px;
        max-height: 60px;
        border: 5px solid var(--color-neutral-300);
        border-top: 5px solid var(--color-blue-mid);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
