<script>
	import { goto } from '$app/navigation';
	import { generateSeo } from '$lib/util/generateSEO';

	const seo = generateSeo({
		title: 'Cipher Arena: Multiplayer Cryptogram Battles',
		description:
			'Battle opponents solving classic cryptograms in real-time. Compete across multiple cipher types, climb the leaderboard, and unlock badges.',
		url: 'https://cipher-arena.fly.dev/',
		image: 'https://cipher-arena.fly.dev/landing-page/hero-mock.webp'
	});

	export function animateOnScroll(node) {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						node.classList.add('visible');
						observer.unobserve(node);
					}
				});
			},
			{ threshold: 0.15 }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<svelte:head>
	{@html seo}
</svelte:head>

<div class="landing">
	<div class="container">
		<header class="section hero-section animatable" use:animateOnScroll>
			<div class="hero">Welcome to Cipher Arena</div>
			<div class="subhero">Crack codes with friends. Train, compete, and climb the ranks.</div>
			<div class="hero-cta">
				<button class="play-now-button" onclick={() => goto('/singleplayer/Aristocrat')}>
					Play now
				</button>
				</div>
			<div class="image-container hero-image-container">
				<img src="/landing-page/hero-mock.webp" alt="Cipher Arena Dashboard" />
			</div>
		</header>

		<section class="section showcase animatable" use:animateOnScroll>
			<div class="showcase-inner">
				<div class="copy">
					<h2>Why Cipher Arena?</h2>
					<ul class="feature-cards">
						<li>
							<h3>Learn by playing</h3>
							<p>Master classic ciphers with fast, rewarding feedback.</p>
						</li>
						<li>
							<h3>Practice for Codebusters</h3>
							<p>Sharpen speed and accuracy with targeted drills.</p>
						</li>
						<li>
							<h3>Multiplayer battles</h3>
							<p>Race real opponents in live matches with ranked stats.</p>
						</li>
					</ul>
				</div>
				<div class="visual">
					<div class="floating-card">
						<img src="/landing-page/cipher-solved.webp" alt="Cipher solved preview" />
					</div>
				</div>
			</div>
		</section>

		<section class="section showcase alt animatable" use:animateOnScroll>
			<div class="showcase-inner">
				<div class="visual">
					<div class="floating-card">
						<img src="/landing-page/leaderboard.webp" alt="Leaderboard preview" />
					</div>
				</div>
				<div class="copy">
					<h2>Compete and Climb</h2>
					<ul class="feature-list">
						<li>
							<h3>Cipher Battles</h3>
							<p>Live, real-time matches with transparent progress.</p>
						</li>
						<li>
							<h3>Matchmaking</h3>
							<p>Join public games or host private lobbies instantly.</p>
						</li>
						<li>
							<h3>Leaderboards</h3>
							<p>Climb by cipher type and track improvement over time.</p>
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
							<p>Endless solo drills with built-in tools and tables.</p>
						</li>
						<li>
							<h3>Cipher Variety</h3>
							<p>From Aristocrats to Porta, new types added regularly.</p>
						</li>
						<li>
							<h3>Stats & Profiles</h3>
							<p>Unlock badges, visualize times, and personalize your profile.</p>
						</li>
					</ul>
				</div>
				<div class="visual">
					<div class="floating-card">
						<img src="/landing-page/profile-stats.webp" alt="Stats preview" />
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
			<div class="cta-buttons">
				<button class="button" onclick={() => goto('/account/register')}>Get started</button>
				<button class="button secondary" onclick={() => goto('/singleplayer/Aristocrat')}
					>Try it out</button
				>
			</div>
		</section>
	</div>
</div>

<style>
	.play-now-button {
		position: relative;
		z-index: 1;
		padding: 1rem 2.5rem;
		border: none;
		border-radius: 50px;
		background-color: #1a1c24;
		color: #ffffff;
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		cursor: pointer;
		overflow: hidden;
		transition: all 0.3s ease;
		transform: scale(1);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
	}

	/* This pseudo-element creates the rotating gradient background */
	.play-now-button::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 250%; /* Large size to ensure the gradient covers the area when rotating */
		height: 250%;
		z-index: -2; /* Sit behind the button's main background */
		background: conic-gradient(
			from 0deg,
			#4ecdc4, /* Teal */
			#7877c6, /* Purple */
			#ff6b6b, /* Reddish-pink */
			#4ecdc4 /* Loop back to Teal */
		);
		transform: translate(-50%, -50%);
		animation: rotate-gradient 6s linear infinite;
	}

	/* This pseudo-element creates the inner dark background, revealing the ::before as a border */
	.play-now-button::after {
		content: '';
		position: absolute;
		z-index: -1; /* Sit on top of the gradient but behind the text */
		left: 2px;
		top: 2px;
		width: calc(100% - 4px);
		height: calc(100% - 4px);
		background: #1a1c24; /* Same dark base to create the border effect */
		border-radius: 48px; /* Slightly smaller radius than the parent */
	}

	.play-now-button:hover {
		transform: scale(1.05) translateY(-3px);
		box-shadow: 0 10px 25px rgba(78, 205, 196, 0.3); /* Glow with the teal color on hover */
		color: #fff;
	}

	.play-now-button:active {
		transform: scale(1.02) translateY(0); /* Simulates pressing the button down */
		box-shadow: 0 5px 15px rgba(120, 119, 198, 0.25); /* Less glow on press */
	}

	@keyframes rotate-gradient {
		from {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}
	/* ▲▲▲ END NEW BUTTON STYLES ▲▲▲ */

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
	}

	.section {
		margin: 0.75rem auto;
		padding: 3rem 2.5rem;
		background: rgba(20, 22, 30, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(18px);
		border-radius: 2rem;
		color: white;
		text-align: center;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.hero-section {
		padding: 5rem 2.5rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.hero {
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 900;
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, #ffffff, #cfd8ff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subhero {
		font-size: 1.28rem;
		line-height: 1.65;
		margin-bottom: 1.4rem;
		color: rgba(255, 255, 255, 0.86);
	}
	.hero-cta {
		margin-top: 2rem; /* Added more space for the bigger button */
		display: flex;
		justify-content: center;
	}

	.section h2 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		color: #fff;
		position: relative;
		z-index: 1;
	}

	/* Narrative showcases */
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
	@media (max-width: 900px) {
		.showcase .showcase-inner,
		.showcase.alt .showcase-inner {
			grid-template-columns: 1fr;
			text-align: left;
		}
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
		backdrop-filter: blur(10px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}
	.feature-cards li:hover,
	.feature-list li:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 44px rgba(0, 0, 0, 0.45);
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
	.floating-card {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 1rem;
		overflow: hidden;
		box-shadow:
			0 24px 56px rgba(0, 0, 0, 0.45),
			0 0 0 1px rgba(255, 255, 255, 0.06);
		transform: perspective(1000px) rotateX(1deg);
		transition:
			transform 0.35s ease,
			box-shadow 0.35s ease;
	}
	.floating-card:hover {
		transform: perspective(1000px) rotateX(0deg) translateY(-10px);
		box-shadow:
			0 36px 80px rgba(0, 0, 0, 0.55),
			0 0 0 1px rgba(255, 255, 255, 0.12);
	}
	.floating-card img {
		display: block;
		width: 100%;
		height: auto;
	}

	.register-section {
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.cta-buttons .button {
		min-width: 180px;
		padding: 0.85rem 1.75rem;
		font-size: 1.05rem;
		border-radius: 999px;
	}
	.cta-buttons .button.secondary {
		background: transparent;
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.5);
		box-shadow: none;
	}
	.cta-buttons .button.secondary:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	@media (max-width: 768px) {
		.hero {
			font-size: 2.5rem;
		}

		.section {
			margin: 0.5rem auto;
			padding: 2rem 1.5rem;
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}

		.cta-buttons .button {
			width: 100%;
			max-width: 280px;
		}
	}

	.image-container {
		width: 100%;
		max-width: 1100px;
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
		background: linear-gradient(
			135deg,
			rgba(120, 119, 198, 0.05) 0%,
			transparent 50%,
			rgba(78, 205, 196, 0.05) 100%
		);
		z-index: 1;
		pointer-events: none;
	}

	.image-container:hover {
		transform: translateY(-10px) scale(1.02);
		box-shadow:
			0 40px 90px rgba(0, 0, 0, 0.55),
			0 0 0 1px rgba(255, 255, 255, 0.24),
			0 0 60px rgba(120, 119, 198, 0.35);
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

	.hero-image-container {
		max-width: 1200px;
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
		transition:
			transform 0.4s ease,
			filter 0.4s ease;
		position: relative;
	}

	.animated-logo::before {
		content: '';
		position: absolute;
		top: -20px;
		left: -20px;
		width: calc(100% + 40px);
		height: calc(100% + 40px);
		background: radial-gradient(circle, rgba(120, 119, 198, 0.2), transparent 70%);
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
</style>