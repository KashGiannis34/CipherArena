<!-- Custom error page for the entire application -->
<script>
    import { page } from '$app/stores';
</script>

<div class="error-container">
    <div class="error-content">
        <h1 class="error-code">{$page.status}</h1>
        <h2 class="error-title">{$page.error?.message || 'Something went wrong'}</h2>

        <p class="error-message">
            {#if $page.status === 404}
                The page you're looking for doesn't exist.
            {:else if $page.status === 403}
                You don't have permission to access this page.
            {:else if $page.status === 401}
                Please log in to access this page.
            {:else}
                An unexpected error occurred. Please try again later.
            {/if}
        </p>

        <div class="button-group">
            <a href="/" class="button">Go Home</a>
            <button class="button secondary" onclick={() => history.back()}>Go Back</button>
        </div>
    </div>
</div>

<style>
    .error-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        padding: 4rem 2rem;
        color: white;
    }

    .error-content {
        text-align: center;
        max-width: 600px;
        padding: 3rem;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba(117, 85, 255, 0.1) 0%, rgba(117, 85, 255, 0.05) 100%);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(117, 85, 255, 0.2);
    }

    .error-code {
        font-size: 5rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #7555ff 0%, #a992ff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: none;
    }

    .error-title {
        font-size: 1.75rem;
        margin: 1rem 0;
        color: #a992ff;
        font-weight: 600;
    }

    .error-message {
        margin: 1.5rem 0;
        color: #cccccc;
        font-size: 1.1rem;
        line-height: 1.5;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2.5rem;
    }

    .button {
        padding: 0.75rem 1.75rem;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
        font-size: 1rem;
    }

    .button:not(.secondary) {
        background: linear-gradient(135deg, #7555ff 0%, #6344ee 100%);
        color: white;
    }

    .button.secondary {
        background: transparent;
        border: 2px solid #7555ff;
        color: #7555ff;
    }

    .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(117, 85, 255, 0.2);
    }

    .button.secondary:hover {
        background: rgba(117, 85, 255, 0.1);
    }

    @media (max-width: 600px) {
        .error-container {
            padding: 2rem 1rem;
        }

        .error-content {
            padding: 2rem 1.5rem;
        }

        .button-group {
            flex-direction: column;
        }

        .error-code {
            font-size: 4rem;
        }

        .error-title {
            font-size: 1.5rem;
        }

        .error-message {
            font-size: 1rem;
        }
    }
</style>