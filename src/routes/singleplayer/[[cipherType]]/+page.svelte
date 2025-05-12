<script>
	import Container from "$lib/Components/General/Container.svelte";
	import Cipher from "$lib/Components/Game/Cipher.svelte";
	import Options from "$lib/Components/Game/Options.svelte";
	import Popup from "$lib/Components/General/Popup.svelte";
	import LoadingOverlay from "$lib/Components/General/LoadingOverlay.svelte";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";

	let { data } = $props();
	let mounted = $state(false);
	let visibility = $state(false);
	let feedbackMessage = $state('');
	let options = $state({ 'AutoFocus': false, 'AutoSwitch': false });
	let quoteData = $state(null);
	let loading = $state(true);
	let error = $state(null);
    let solved = false;

	let params = {
		K: "-1",
		Solve: "Decode",
		cipherType: data.props.cipherType
	};

	async function fetchQuote() {
		try {
			const res = await fetch('/api/generate-quote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(params)
			});
			const result = await res.json();
			if (result.error) throw new Error(result.error);
			quoteData = result;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}

		console.log("quoteData", $state.snapshot(quoteData));
		console.log("params", $state.snapshot(params));
		console.log("options", $state.snapshot(options));
	}

	function onAttempt(message, solvedState) {
        solved = solvedState;
		feedbackMessage = message;
		toggle();
	}

	function newProblem() {
		window.location.reload();
	}

	function toggle() {
		if (visibility && solved && options['AutoSwitch']) {
			newProblem();
		}
		visibility = !visibility;
	}

	function onOptionChange(option) {
		options[option] = !options[option];
		sessionStorage.setItem("options", JSON.stringify(options));
	}

	onMount(() => {
		// Get options
		options = sessionStorage.getItem('options')
			? JSON.parse(sessionStorage.getItem('options'))
			: { 'AutoFocus': true, 'AutoSwitch': false };

		// Read URLSearchParams
		const searchParams = new URLSearchParams(window.location.search);
		params.K = searchParams.get('K') || "-1";
		params.Solve = searchParams.get('Solve') || "Decode";
		params.cipherType = data.props.cipherType;

		// Generate quote
		fetchQuote();
		mounted = true;
	});
</script>

{#if !mounted || loading}
	<LoadingOverlay />
{:else if error}
	<p style="color: red; padding: 1rem;">Error: {error}</p>
{:else}
	<div transition:fade>
		<Container --flexDir="row" style="gap: 3vw;">
			<Options options={options} onOptionChange={onOptionChange} cipherType={params.cipherType} />
		</Container>

		<Cipher
			quote={quoteData.quote}
			hash={quoteData.id}
			cipherType={params.cipherType}
			autoFocus={options.AutoFocus}
			params={params}
			keys={quoteData.keys}
			onAttempt={onAttempt}
			mode="singleplayer"
			{newProblem}
		/>

		<Popup {visibility} onExit={toggle}>
			{@html feedbackMessage}
		</Popup>
	</div>
{/if}