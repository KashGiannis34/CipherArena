<script>
	import "$lib/css/StrapBtn.css";
	import { goto } from '$app/navigation';
  	import LoadingOverlay from '$lib/Components/General/LoadingOverlay.svelte';
  	import { fade } from 'svelte/transition';
	import { broadcastTabEvent } from '$lib/util/crossTabEvents.js';
  	import { onMount } from 'svelte';
  	import Container from "$lib/Components/General/Container.svelte";
	import { leaveCurrentGame, joinGame } from '$lib/util/gameApi.js';

	let { data } = $props();
	let showJoinGameButton = $state(false);
	let authenticating = $state(false);
	let feedback = $state('');

	function handleLoginRedirect() {
		goto(`/auth/login?roomId=${data.gameId}`);
	}

	function handleRegisterRedirect() {
		goto(`/auth/register?roomId=${data.gameId}`);
	}

	async function handleLeaveGame() {
		authenticating = true;
        const result = await leaveCurrentGame();

        if (result.success) {
			showJoinGameButton = true;
			feedback = "You left your previous game. Now join this game.";
        } else {
            feedback = result.data?.message ?? 'Failed to leave game';
        }
		authenticating = false;
    }

	async function handleJoinGame() {
        authenticating = true;
        feedback = '';
        const result = await joinGame(data.gameId);
        authenticating = false;

        if (result.success) {
            window.location.href = window.location.href;
        } else {
            feedback = result.data?.message ?? 'Failed to join game';
        }
    }
</script>

<svelte:head>
  <title>Game Lobby</title>
</svelte:head>

{#if authenticating}
    <LoadingOverlay />
{/if}

{#if data.action === 'login'}
	<div class="page">
		<Container --minWidth=none --maxWidth=min(90vw,1000px)>
			<div class="lobby-auth-wrapper">
				<h1 class="title">You're about to join a game</h1>
				<p class="subtitle">Log in or register to continue</p>
				<div class="buttons">
					<button class="btn login" onclick={handleLoginRedirect}>Log In</button>
					<button class="btn register" onclick={handleRegisterRedirect}>Register</button>
				</div>
			</div>
		</Container>
	</div>
{:else if data.action === 'leaveGame'}
	<div class="page">
		<Container --minWidth=none --maxWidth=min(90vw,1000px)>
			<div class="lobby-auth-wrapper">
				<h1 class="title">You're in a different game</h1>
				<p class="subtitle">Leave your current game before joining this one.</p>
				<div class="buttons">
					{#if showJoinGameButton}
						<button class="btn login" onclick={handleJoinGame}>Join Game</button>
					{:else}
						<button class="btn login" onclick={handleLeaveGame}>Leave Game</button>
					{/if}
				</div>
				{#if feedback}
					<p class="info">{feedback}</p>
				{/if}
			</div>
		</Container>
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

	.lobby-auth-wrapper {
		width: 100%;
		padding: 2rem 2.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.title {
		font-size: 2rem;
		font-weight: 800;
		text-align: center;
		color: white;
		margin: 0;
	}

	.subtitle {
		font-size: 1.05rem;
		color: var(--text-secondary);
		text-align: center;
		margin: 0;
	}

	.buttons {
		display: flex;
		gap: 1.25rem;
		justify-content: center;
		width: 100%;
		max-width: 100%;
	}

	@media (max-width: 500px) {
		.buttons {
			flex-direction: column;
		}
	}

	.btn {
		flex: 1;
		padding: 0.85rem 1.8rem;
		font-size: 1rem;
		font-weight: 700;
		border-radius: 0.85rem;
		background: transparent;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.25);
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.btn:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.login {
		background: var(--color-purple-bright);
		color: var(--text-primary);
	}

	.register {
		background: var(--glass-bg);
		color: var(--color-purple-soft);
		border: 1px solid var(--color-purple-border);
	}

	.info {
		text-align: center;
		color: var(--color-info);
		font-size: 0.95rem;
		margin-top: 0.5rem;
	}
</style>