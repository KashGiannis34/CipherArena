<script>
  import "$lib/css/StrapBtn.css";
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';

  let whyImages = [
    { src: '/landing-page/cipher-solved.png', alt: 'Cipher Solved' },
    { src: '/landing-page/aristo.png', alt: 'Aristocrat' },
    { src: '/landing-page/atbash.png', alt: 'Atbash' },
    { src: '/landing-page/baconian.png', alt: 'Baconian' },
    { src: '/landing-page/nihilist-2.png', alt: 'Nihilist' },
    { src: '/landing-page/caesar.png', alt: 'Caesar' },
    { src: '/landing-page/porta.png', alt: 'Porta' },
  ];

  let featureImages = [
    { src: '/landing-page/pfp-badges.png', alt: 'User Achievements' },
    { src: '/landing-page/public-lobby.png', alt: 'Public Lobby' },
    { src: '/landing-page/profile-stats.png', alt: 'Stats' },
    { src: '/landing-page/profile-histogram.png', alt: 'Histogram' },
    { src: '/landing-page/leaderboard.png', alt: 'Leaderboard' },
    { src: '/landing-page/waiting-room.png', alt: 'Waiting Room' },
  ];
</script>

<div class="container">
  <div class="section hero-section" in:fade>
    <div class="hero">Welcome to Cipher Arena</div>
    <div class="subhero">Crack codes. Train your brain. Compete with friends.</div>
    <div class="subhero"><a href="/account/register" target="_blank" rel="noopener noreferrer" class="profile-link">Create an account</a> to play multiplayer</div>
    <div class="image-container hero-image-container">
      <img src="/landing-page/hero-mock.png" alt="Cipher Arena Dashboard" />
    </div>
  </div>

  <div class="section" in:fade>
    <h2>Why Cipher Arena?</h2>
    <div class="image-grid">
      {#each whyImages as image}
        <div class="grid-item">
          <img src={image.src} alt={image.alt} />
        </div>
      {/each}
    </div>

    <ul class="why-list">
      <li>🎯 Learn cryptography the fun way</li>
      <li>🏆 Practice for Codebusters (Science Olympiad)</li>
      <li>🧠 Boost logic and deduction skills</li>
      <li>👾 Multiplayer, real-time cipher battles</li>
    </ul>
  </div>

  <div class="section" in:fade>
    <h2>Core Features</h2>
    <div class="image-grid feature-grid">
      {#each featureImages as image}
        <div class="grid-item">
          <img src={image.src} alt={image.alt} />
        </div>
      {/each}
    </div>

    <div class="features">
      <div class="feature">
        <h3>⚔️ Cipher Battles</h3>
        <ul>
          <li>Face off in real-time multiplayer matches</li>
          <li>Live progress tracking, rematch voting, and ranked stats updates</li>
        </ul>
      </div>

      <div class="feature">
        <h3>🧠 Practice Mode</h3>
        <ul>
          <li>Infinite solo drills for a variety of cipher types</li>
          <li>Various tables and tools to assist in solving</li>
        </ul>
      </div>

      <div class="feature">
        <h3>🔐 Cipher Variety</h3>
        <ul>
          <li>Play Aristocrats, Patristocrats, Caesar, Baconian, Porta, and more</li>
          <li>New ciphers added regularly</li>
        </ul>
      </div>

      <div class="feature">
        <h3>📊 Stats & Profiles</h3>
        <ul>
          <li>Unlock cool looking badges based on stats</li>
          <li>Customize your profile and avatar</li>
        </ul>
      </div>

      <div class="feature">
        <h3>🌐 Matchmaking Lobby</h3>
        <ul>
          <li>Join or host public and private games instantly</li>
          <li>View and edit match settings</li>
        </ul>
      </div>

      <div class="feature">
        <h3>🏆 Leaderboards</h3>
        <ul>
          <li>See top solvers by cipher and various metrics</li>
          <li>Compete for rankings and improve your standing</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="section register-section" in:fade>
    <h2>Join the Arena</h2>
    <div class="logo-container">
      <img src="/logo.png" alt="Cipher Arena Logo" class="animated-logo" />
    </div>
    <p style="font-size: 1.2rem; margin-bottom: 1rem;">Become a Cipher Master. Start solving today.</p>
    <div class="cta-buttons">
      <button class="btn register-btn" on:click={() => goto('/account/register')}>Register</button>
      <button class="btn try-btn" on:click={() => goto('/singleplayer/Aristocrat')}>Try it Out</button>
    </div>
  </div>
</div>

<style>
  .image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
}

.grid-item {
  flex: 1 1 calc(40% - 2rem); /* ~2 per row on large, ~1 on small */
  max-width: 480px;
  min-width: 280px;
  display: block;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease;
}

.grid-item:hover {
  transform: scale(1.02);
}

.grid-item img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  border-radius: 1rem;
}

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .section {
    margin: 0.75rem auto;
    padding: 3rem 2.5rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border-radius: 2rem;
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .hero-section {
    background: linear-gradient(135deg,
      rgba(120, 119, 198, 0.2) 0%,
      rgba(255, 107, 107, 0.1) 50%,
      rgba(78, 205, 196, 0.2) 100%
    );
    padding: 4rem 2.5rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .hero {
    font-size: 4rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #4ec5cd, #6177f0, #563af2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(180, 78, 205, 0.5);
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from { filter: brightness(1); }
    to { filter: brightness(1.2); }
  }

  .subhero {
    font-size: 1.4rem;
    margin-bottom: 2.5rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 300;
    letter-spacing: 0.5px;
  }

  .section h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #fff;
    position: relative;
    z-index: 1;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .feature {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 2rem 1.5rem;
    border-radius: 1.5rem;
    backdrop-filter: blur(10px);
    text-align: left;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .feature::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4e9ecd, #4459a0, #7b68ee);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .feature:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(125, 78, 205, 0.4);
  }

  .feature:hover::before {
    transform: scaleX(1);
  }

  .feature h3 {
    margin-bottom: 1rem;
    color: #fff;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .feature ul {
    padding-left: 1.25rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  .feature ul li {
    margin-bottom: 0.5rem;
  }

  .why-list {
    text-align: left;
    max-width: 600px;
    margin: 2rem auto;
  }

  .why-list li {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    border-left: 4px solid rgba(127, 78, 205, 0.6);
    transition: all 0.3s ease;
  }

  .why-list li:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(10px);
    border-left-color: rgb(148, 78, 205);
  }

  .register-section {
    background: linear-gradient(135deg,
      rgba(78, 205, 196, 0.15) 0%,
      rgba(120, 119, 198, 0.15) 100%
    );
    border: 2px solid rgba(78, 167, 205, 0.3);
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 1rem 3rem;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 2rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    min-width: 160px;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  .btn:hover::before {
    left: 100%;
  }

  .btn:active {
    transform: translateY(-1px) scale(1.02);
  }

  .register-btn {
    background: linear-gradient(135deg, #4e63cd, #4f44a0);
    color: white;
    box-shadow: 0 10px 30px rgba(78, 93, 205, 0.3);
  }

  .register-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 20px 40px rgba(68, 84, 204, 0.4);
  }

  .try-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
  }

  .try-btn:hover {
    transform: translateY(-3px) scale(1.05);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 20px 40px rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    .hero {
      font-size: 2.5rem;
    }

    .section {
      margin: 0.5rem auto;
      padding: 2rem 1.5rem;
    }

    .features {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .btn {
      width: 100%;
      max-width: 250px;
    }
  }

  .image-container {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  background: linear-gradient(135deg, rgba(120, 119, 198, 0.1), rgba(78, 205, 196, 0.1));
  }

  .image-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(120, 119, 198, 0.05) 0%,
      transparent 50%,
      rgba(78, 205, 196, 0.05) 100%
  );
  z-index: 1;
  pointer-events: none;
  }

  .image-container:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.2),
      0 0 50px rgba(120, 119, 198, 0.3);
  }

  .image-container img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0.25rem;
  object-fit: cover;
  object-position: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 0;
  }

  /* For hero/main game interface images specifically */
  .hero-image-container {
  max-width: 900px;
  margin: 3rem auto;
  transform: perspective(1000px) rotateX(2deg);
  transition: all 0.4s ease;
  }

  .hero-image-container:hover {
  transform: perspective(1000px) rotateX(0deg) translateY(-10px);
  }

  .hero-image-container::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 10%;
  right: 10%;
  height: 20px;
  background: linear-gradient(ellipse, rgba(120, 119, 198, 0.3) 0%, transparent 70%);
  filter: blur(10px);
  z-index: -1;
  }

  @media (max-width: 768px) {
  .image-container {
      max-width: 100%;
      margin: 1.5rem auto;
      border-radius: 0.25rem;
  }

  .hero-image-container {
      transform: none;
      margin: 2rem auto;
  }

  .hero-image-container:hover {
      transform: translateY(-5px) scale(1.01);
  }
  }

  @media (max-width: 480px) {
  .image-container {
      margin: 1rem auto;
      border-radius: 0.25rem;
  }

  .image-container img {
      border-radius: 0.25rem;
  }
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
    transition: transform 0.4s ease, filter 0.4s ease;
    position: relative;
  }

  .animated-logo::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    width: calc(100% + 40px);
    height: calc(100% + 40px);
    background: radial-gradient(circle, rgba(120,119,198,0.2), transparent 70%);
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
</style>