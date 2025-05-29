<script>
	import { goto } from '$app/navigation';
  	import LoadingOverlay from '$lib/Components/General/LoadingOverlay.svelte';
  	import { fade } from 'svelte/transition';
	import { broadcastTabEvent } from '$lib/util/crossTabEvents.js';
  	import { onMount } from 'svelte';

	let { data } = $props();
	let showJoinGameButton = $state(false);
	let feedback = $state('');
	let authenticating = $state(false);

	function handleLoginRedirect() {
		goto(`/auth/login?roomId=${data.gameId}`);
	}

	function handleRegisterRedirect() {
		goto(`/auth/register?roomId=${data.gameId}`);
	}

	async function leaveGame() {
		authenticating = true;
        const res = await fetch('/api/leave-current-game', { method: 'POST', body: JSON.stringify({ gameId: data.gameId }) });
        const data = await res.json();

        if (data.success) {
			showJoinGameButton = true;
			feedback = "You left your previous game. Now join this game.";

        } else {
            feedback = data.message;
        }

        if (data.disconnectSocket) {
            broadcastTabEvent('leave-game', { gameId: data.gameId });
        }
		authenticating = false;
    }

	async function joinGame() {
        let res = null;
        try {
            authenticating = true;
            feedback = '';
            const response = await fetch('/api/join-game', {
                method: 'POST',
                body: JSON.stringify({ roomCode: data.gameId }),
                headers: {
                    'content-type': 'application/json'
                }
            });

            res = await response.json();
            authenticating = false;

            if (res.success) {
                window.location.href = window.location.href;
            } else {
                feedback = res.message;
            }
        } catch (error) {
            feedback = error.toString();
        }
		authenticating = false;
    }
</script>

{#if authenticating}
    <LoadingOverlay />
{/if}

{#if data.action === 'login'}
	<div class="page">
		<div class="card">
			<h1 class="title">You're about to join a game</h1>
			<p class="subtitle">Log in or register to continue</p>
			<div class="buttons">
				<button class="btn login" onclick={handleLoginRedirect}>Log In</button>
				<button class="btn register" onclick={handleRegisterRedirect}>Register</button>
			</div>
			{#if feedback}
				<p style="color: white;">{feedback}</p>
			{/if}
		</div>
	</div>
{:else if data.action === 'leaveGame'}
	<div class="page">
		<div class="card">
			<h1 class="title">You're in a different game</h1>
			<p class="subtitle">Leave your current game before joining this one.</p>
			<div class="buttons">
				{#if showJoinGameButton}
					<button class="btn login" onclick={joinGame}>Join Game</button>
				{:else}
					<button class="btn login" onclick={leaveGame}>Leave Game</button>
				{/if}
			</div>
			{#if feedback}
				<p style="color: white;">{feedback}</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.page {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;
		padding: 1rem;
		box-sizing: border-box;
	}

	.card {
		background: linear-gradient(135deg, #6a11cb, #2575fc);
		width: 100%;
        top: -25%;
		max-width: 90vw;
		max-height: 90vh;
		padding: clamp(1.5rem, 5vw, 3rem);
		border-radius: 1.5rem;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
		text-align: center;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
	}

	.title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		color: white;
		margin: 0;
	}

	.subtitle {
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		color: #ffffffb0;
		margin: 0;
	}

	.buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 400px;
	}

	@media (min-width: 640px) {
		.buttons {
			flex-direction: row;
		}
	}

	.btn {
		flex: 1;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.login {
		background-color: #7555ff;
		color: white;
	}

	.register {
		background: rgb(238, 221, 255);
		color: #7555ff;
		border: 2px solid #703cff;
	}
</style>
