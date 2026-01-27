<script>
  import { goto } from "$app/navigation";
  import { PUBLIC_APP_URL } from "$env/static/public";
  import Seo from "$lib/Components/General/Seo.svelte";
  import Leaderboard from "$lib/Components/General/Leaderboard.svelte";
  import ProfileStats from "$lib/Components/General/ProfileStats.svelte";
  import { onMount } from "svelte";
  import LandingPageCipher from "$lib/Components/Game/LandingPageCipher.svelte";
  import BadgeDisplay from "$lib/Components/Game/BadgeDisplay.svelte";
  import ProgressDisplay from "$lib/Components/Game/ProgressDisplay.svelte";

  let { data } = $props();

  let username = data["username"] || "HelloKitty34";
  let userCount = data["userCount"] || 0;
  let players = $state([{ username, connected: false }]);
  let progressMap = $state({ [username]: 0 });

  onMount(() => {
    let connectTimeoutId;

    connectTimeoutId = setTimeout(() => {
      players = [{ username, connected: true }];
    }, 400);

    if (window.innerWidth <= 768) {
      // After 750ms, set the progress to 100%
      setTimeout(() => {
        onProgressUpdate(100);
      }, 750);
    }

    return () => {
      clearTimeout(connectTimeoutId);
    };
  });

  function onProgressUpdate(percent) {
    progressMap[username] = percent;
  }

  const unlockedBadges = [
    "elo_aristocrat_1500",
    "elo_caesar_1400",
    "wins_total_50",
    "wins_aristocrat_50",
    "elo_total_1300",
    "games_played_100",
    "games_played_34",
    "wins_total_34",
    "elo_aristocrat_1340",
    "fast_solver_10s",
    "under_30s_25x",
    "under_60s_50x",
    "under_34s_34x_aristocrat",
    "close_call_59",
    "slow_grinder",
    "prime_times_under_60",
  ];

  let mockStats = {
    All: {
      elo: 1405,
      wins: 485,
      losses: 120,
      averageSolveTime: 0.98,
      bestSolveTime: 12,
    },
    Aristocrat: {
      elo: 1550,
      wins: 150,
      losses: 30,
      averageSolveTime: 0.75,
      bestSolveTime: 15,
    },
    Xenocrypt: {
      elo: 1450,
      wins: 50,
      losses: 15,
      averageSolveTime: 0.9,
      bestSolveTime: 25,
    },
    Patristocrat: {
      elo: 1480,
      wins: 75,
      losses: 20,
      averageSolveTime: 0.85,
      bestSolveTime: 22,
    },
    Porta: {
      elo: 1350,
      wins: 30,
      losses: 10,
      averageSolveTime: 1.2,
      bestSolveTime: 45,
    },
    Atbash: {
      elo: 1250,
      wins: 25,
      losses: 5,
      averageSolveTime: 0.5,
      bestSolveTime: 12,
    },
    Caesar: {
      elo: 1300,
      wins: 40,
      losses: 10,
      averageSolveTime: 0.6,
      bestSolveTime: 14,
    },
    Affine: {
      elo: 1420,
      wins: 35,
      losses: 8,
      averageSolveTime: 1.1,
      bestSolveTime: 38,
    },
    Baconian: {
      elo: 1380,
      wins: 20,
      losses: 5,
      averageSolveTime: 1.5,
      bestSolveTime: 60,
    },
    Nihilist: {
      elo: 1450,
      wins: 25,
      losses: 7,
      averageSolveTime: 1.3,
      bestSolveTime: 55,
    },
    Checkerboard: {
      elo: 1400,
      wins: 15,
      losses: 5,
      averageSolveTime: 1.4,
      bestSolveTime: 65,
    },
    Hill: {
      elo: 1425,
      wins: 20,
      losses: 5,
      averageSolveTime: 1.6,
      bestSolveTime: 70,
    },
  };

  export function animateOnScroll(node) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add("visible");
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  }
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<Seo
  title="Cipher Arena: Multiplayer Cryptogram Battles"
  description="Battle opponents solving classic cryptograms in real-time. Compete across multiple cipher types, climb the leaderboard, and unlock badges."
  url={PUBLIC_APP_URL}
  image={`${PUBLIC_APP_URL}/landing-page/hero-mock.webp`}
/>

<div class="landing">
  <div class="container">
    <ProgressDisplay {username} {players} {progressMap} />

    <header class="section hero-section animatable" use:animateOnScroll>
      <div class="hero">Welcome to Cipher Arena</div>
      <div class="subhero">
        Crack codes with friends. Train, compete, and climb the ranks.
      </div>
      <div class="hero-cta">
        <button
          class="play-now-button"
          onclick={() => goto("/singleplayer/Aristocrat")}
        >
          Play now
        </button>
      </div>
      <div class="cipher-container">
        <div class="desktop-only">
          <LandingPageCipher {onProgressUpdate} />
        </div>
        <div class="mobile-only">
          <img
            src="/landing-page/hero-mock.webp"
            alt="Cipher example"
            class="static-image"
          />
        </div>
      </div>
    </header>

    <section class="section showcase animatable" use:animateOnScroll>
      <div class="showcase-inner">
        <div class="copy">
          <h2>Why Cipher Arena?</h2>
          <ul class="feature-cards">
            <li>
              <h3>Learn by Playing</h3>
              <p>Master classic ciphers with fast, rewarding feedback.</p>
            </li>
            <li>
              <h3>Practice for Codebusters</h3>
              <p>
                Imrpove speed and accuracy with drills for every cipher type.
              </p>
            </li>
            <li>
              <h3>Multiplayer Battles</h3>
              <p>Race real opponents in live matches with ranked stats.</p>
            </li>
          </ul>
        </div>

        <div class="badges-wrapper animate-stats-float interactive-container">
          <div class="desktop-only">
            <BadgeDisplay
              unlockedBadgeIds={unlockedBadges}
              isOwnProfile={true}
              stats={{}}
              singleStats={{}}
            />
          </div>
          <div class="mobile-only">
            <img
              src="/landing-page/pfp-badges.webp"
              alt="User badges"
              class="static-image"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="section showcase alt animatable" use:animateOnScroll>
      <div class="showcase-inner">
        <div class="visual">
          <div class="interactive-container">
            <div class="desktop-only">
              <Leaderboard count={10} simple={true} />
            </div>
            <div class="mobile-only">
              <img
                src="/landing-page/leaderboard.webp"
                alt="Leaderboard"
                class="static-image"
              />
            </div>
          </div>
        </div>
        <div class="copy">
          <h2>Climb the Ranks</h2>
          <ul class="feature-list">
            <li>
              <h3>Cipher Battles</h3>
              <p>Live matches with progress bars and confetti at the end!</p>
            </li>
            <li>
              <h3>Matchmaking</h3>
              <p>Join public games or host private lobbies instantly.</p>
            </li>
            <li>
              <h3>Leaderboards</h3>
              <p>Search by cipher type and track different stats.</p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section showcase animatable" use:animateOnScroll>
      <div class="showcase-inner">
        <div class="copy">
          <h2>Master the Craft</h2>
          <ul class="feature-list">
            <li>
              <h3>Practice Mode</h3>
              <p>Endless solo problems with tools and tables built in.</p>
            </li>
            <li>
              <h3>Cipher Variety</h3>
              <p>From Aristocrats to Portas, new types added regularly.</p>
            </li>
            <li>
              <h3>Stats and Profiles</h3>
              <p>
                Unlock badges, visualize stats, and personalize your profile.
              </p>
            </li>
          </ul>
        </div>
        <div class="visual">
          <div class="interactive-container">
            <div class="desktop-only">
              <ProfileStats stats={mockStats} singleStats={{}} simple={true} />
            </div>
            <div class="mobile-only">
              <img
                src="/landing-page/profile-stats.webp"
                alt="Profile statistics"
                class="static-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section register-section animatable" use:animateOnScroll>
      <h2>Join the Arena</h2>
      <div class="logo-container">
        <img src="/logo.png" alt="Cipher Arena Logo" class="animated-logo" />
      </div>
      <p style="font-size: 1.2rem; margin-bottom: 1rem;">
        Become a Cipher Master. Start solving today.
      </p>
      {#if userCount > 0}
        <div class="user-count-container">
          <div class="online-indicator"></div>
          <span>{userCount.toLocaleString()} registered solvers</span>
        </div>
      {/if}
      <div class="cta-buttons">
        <button class="button" onclick={() => goto("/account/register")}
          >Get started</button
        >
        <button
          class="button secondary"
          onclick={() => goto("/singleplayer/Aristocrat")}>Try it out</button
        >
      </div>
    </section>
  </div>
</div>

<style>
  .user-count-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-size: 1rem;
    color: var(--text-muted);
    animation: fadeIn 1s ease 0.5s both;
  }

  .online-indicator {
    width: 12px;
    height: 12px;
    background-color: var(--color-success);
    border-radius: 50%;
    border: 1px solid var(--glass-border-strong);
    box-shadow:
      0 0 10px var(--color-success),
      0 0 20px var(--color-success);
    animation: pulse 2s infinite ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  .cipher-container {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    max-width: 100%;
    padding-bottom: 1rem;
  }

  .animate-stats-float {
    animation: statsFloat 0.8s cubic-bezier(0.23, 1, 0.32, 1) 1s both;
  }

  .play-now-button {
    position: relative;
    z-index: 1;
    padding: 1rem 2.5rem;
    border: none;
    border-radius: 50px;
    background-color: var(--color-blue-dark);
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  }

  .play-now-button::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 250%;
    height: 250%;
    z-index: -2;
    background: var(--gradient-conic);
    transform: translate(-50%, -50%);
    animation: rotate-gradient 6s linear infinite;
  }

  .play-now-button::after {
    content: "";
    position: absolute;
    z-index: -1;
    left: 2px;
    top: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    background: var(--color-bg-card);
    border-radius: 48px;
  }

  .play-now-button:hover {
    transform: scale(1.05) translateY(-3px);
    box-shadow: 0 10px 25px var(--color-bg-dark);
    color: var(--text-primary);
  }

  .play-now-button:active {
    transform: scale(1.02) translateY(0);
    box-shadow: 0 5px 15px var(--color-bg-darker);
  }

  @keyframes rotate-gradient {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  .landing {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background: transparent;
  }

  .container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 1.25rem;
    overflow: hidden;
  }

  .section {
    margin: 0.75rem auto;
    padding: 3rem 2.5rem;
    background: var(--glass-bg);
    box-shadow: var(--glass-shadow);
    border-radius: 2rem;
    color: var(--text-primary);
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .hero-section {
    padding: 5rem 2.5rem;
  }

  .hero {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
    background: var(--gradient-hero);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: text-glow 2s ease-in-out infinite alternate;
  }

  .subhero {
    font-size: 1.28rem;
    line-height: 1.65;
    margin-bottom: 1.4rem;
    color: rgba(255, 255, 255, 0.86);
  }
  .hero-cta {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }

  .section h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    position: relative;
    z-index: 1;
  }

  .showcase .showcase-inner {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 2rem;
    align-items: center;
    text-align: left;
  }

  .showcase.alt .showcase-inner {
    grid-template-columns: 0.9fr 1.1fr;
  }

  .copy p {
    color: rgba(255, 255, 255, 0.86);
  }

  .feature-cards,
  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.9rem;
  }

  .feature-cards li,
  .feature-list li {
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1rem;
    background: rgba(20, 22, 30, 0.45);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      border-color 0.25s ease;
    transform: translateY(0px) scale(1);
  }

  .feature-cards li:hover,
  .feature-list li:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.45);
    border-color: rgba(120, 119, 198, 0.5);
  }

  .feature-cards h3,
  .feature-list h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
  }

  .feature-cards p,
  .feature-list p {
    margin: 0;
    color: rgba(220, 228, 255, 0.88);
  }

  .visual {
    display: flex;
    justify-content: center;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .button {
    transition: all 0.3s ease;
    transform: perspective(1000px) rotateX(2deg);
  }

  .cta-buttons .button {
    min-width: 180px;
    padding: 0.85rem 1.75rem;
    font-size: 1.05rem;
    border-radius: 999px;
  }
  .cta-buttons .button.secondary {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--text-muted);
    box-shadow: none;
  }
  .cta-buttons .button.secondary:hover {
    background: var(--glass-bg);
  }

  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem auto;
    perspective: 1200px;
  }

  .animated-logo {
    width: 180px;
    height: auto;
    filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.2));
    animation: glide 10s ease-in-out infinite;
    transition:
      transform 0.4s ease,
      filter 0.4s ease;
    position: relative;
  }

  .animated-logo::before {
    content: "";
    position: absolute;
    top: -20px;
    left: -20px;
    width: calc(100% + 40px);
    height: calc(100% + 40px);
    background: radial-gradient(
      circle,
      rgba(120, 119, 198, 0.2),
      transparent 70%
    );
    border-radius: 50%;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .animated-logo:hover {
    transform: scale(1.08) rotateY(5deg);
    filter: drop-shadow(0 12px 30px rgba(78, 205, 196, 0.4));
  }

  .animated-logo:hover::before {
    opacity: 1;
  }

  @keyframes glide {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(2px, -3px) rotate(0.3deg);
    }
    50% {
      transform: translate(-2px, 2px) rotate(-0.3deg);
    }
    75% {
      transform: translate(3px, -1px) rotate(0.2deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }

  .animatable {
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 600ms ease,
      transform 600ms ease;
  }

  :global(.animatable.visible) {
    opacity: 1;
    transform: translateY(0);
  }

  .interactive-container {
    width: 100%;
    max-width: 1100px;
    margin: 2rem auto;
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    transform: perspective(1000px) rotateX(2deg);
  }

  .interactive-container:hover {
    transform: translateY(-10px) scale(1.02);
  }

  @keyframes text-glow {
    from {
      text-shadow:
        0 0 4px var(--text-primary),
        0 0 6px var(--color-purple-glow),
        0 0 12px var(--color-purple-glow);
    }
    to {
      text-shadow:
        0 0 6px var(--text-primary),
        0 0 8px var(--color-purple-glow-light),
        0 0 16px var(--color-purple-glow-light);
    }
  }

  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }

  .static-image {
    width: 100%;
    height: auto;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 900px) {
    .showcase .showcase-inner,
    .showcase.alt .showcase-inner {
      grid-template-columns: 1fr;
      gap: 2.5rem;
      text-align: center;
    }

    .showcase.alt .copy {
      grid-row: 1;
    }
    .showcase.alt .visual {
      grid-row: 2;
    }
  }

  @media (max-width: 768px) {
    .desktop-only {
      display: none;
    }

    .mobile-only {
      display: block;
    }

    .container {
      padding: 1rem;
    }

    .section {
      padding: 2.5rem 1.5rem;
    }

    .hero-section {
      padding: 3rem 1.5rem;
    }

    .hero {
      font-size: clamp(2.2rem, 10vw, 2.8rem);
    }

    .subhero {
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .section h2 {
      font-size: 2rem;
    }

    .play-now-button {
      padding: 0.9rem 2rem;
      font-size: 1.1rem;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .cta-buttons .button {
      width: 100%;
      max-width: 300px;
    }
  }
</style>
