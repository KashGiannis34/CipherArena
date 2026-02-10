<script>
  import Container from "$lib/Components/General/Container.svelte";
  import Cipher from "$lib/Components/Game/Cipher.svelte";
  import Options from "$lib/Components/Game/Options.svelte";
  import Popup from "$lib/Components/General/Popup.svelte";
  import LoadingOverlay from "$lib/Components/General/LoadingOverlay.svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { generateSeo } from "$lib/util/generateSEO.js";

  let { data } = $props();
  let mounted = $state(false);
  let visibility = $state(false);
  let feedbackMessage = $state("");
  let options = $state({ AutoFocus: false, AutoSwitch: false });
  let quoteData = $state(null);
  let loading = $state(true);
  let error = $state(null);
  let solved = false;

  let params = {
    K: "-1",
    Solve: "Decode",
    cipherType: data.props.cipherType,
  };

  async function checkQuote(i, hash, cipherType, keys, solve, startTime) {
    let solved = false;
    let time = 0;
    try {
      time = Number((Date.now() / 1000 - startTime).toFixed(3));
      const response = await fetch("/api/validate-quote", {
        method: "POST",
        body: JSON.stringify({
          input: i,
          id: hash,
          cipherType: cipherType,
          keys: keys,
          solveTime: time,
          solve: params.Solve,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      const answer = await response.json();
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      const strTime =
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0");
      if (answer) {
        feedbackMessage =
          "Congratulations! The cipher was solved in " + strTime + "!";
        solved = true;
      } else {
        feedbackMessage =
          "Sorry, your answer isn't correct. Giannis hopes you get it on the next try!";
      }
    } catch (error) {
      feedbackMessage = "An error occurred while checking the quote.";
    }
    time = Math.floor(time);
    return { feedbackMessage, solved, time };
  }

  async function fetchQuote() {
    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      quoteData = result;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function onSolved(answer) {
    solved = answer.solved;
    feedbackMessage = answer.feedbackMessage;
    toggle();
  }

  function newProblem() {
    window.location.reload();
  }

  function toggle() {
    if (visibility && solved && options["AutoSwitch"]) {
      newProblem();
    }
    visibility = !visibility;
  }

  function onOptionChange(option) {
    options[option] = !options[option];
    sessionStorage.setItem("options", JSON.stringify(options));
  }

  onMount(async () => {
    options = sessionStorage.getItem("options")
      ? JSON.parse(sessionStorage.getItem("options"))
      : { AutoFocus: true, AutoSwitch: false };

    const searchParams = new URLSearchParams(window.location.search);
    params.K = searchParams.get("K") || "-1";
    params.Solve = searchParams.get("Solve") || "Decode";
    params.cipherType = data.props.cipherType;

    await fetchQuote();
    mounted = true;
  });

  const seo = generateSeo({
    title: `Singleplayer ${params.cipherType}: Cipher Arena`,
    description: `Practice solving ${params.cipherType} cryptograms solo to sharpen your skills before entering multiplayer battles.`,
    url: `https://cipherarena.com/singleplayer/${params.cipherType}`,
    image: "https://cipherarena.com/landing-page/cipher-solved.webp",
  });
</script>

<svelte:head>{@html seo}</svelte:head>

{#if !mounted || loading}
  <LoadingOverlay />
{:else if error}
  <p style="color: red; padding: 1rem;">Error: {error}</p>
{:else}
  <div transition:fade>
    <Container --flexDir="row" style="gap: 3vw;">
      <Options {options} {onOptionChange} cipherType={params.cipherType} />
    </Container>

    <Cipher
      quote={quoteData.quote}
      hash={quoteData.id}
      cipherType={params.cipherType}
      autoFocus={options.AutoFocus}
      {params}
      keys={quoteData.keys}
      {onSolved}
      mode="singleplayer"
      {newProblem}
      fetchAnswerStatus={checkQuote}
      autoSwitch={options.AutoSwitch}
    />

    <Popup {visibility} onExit={toggle}>
      {@html feedbackMessage}
    </Popup>
  </div>
{/if}
