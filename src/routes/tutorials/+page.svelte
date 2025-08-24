<script>
    import { onMount } from 'svelte';
    import { generateSeo } from '$lib/util/generateSEO';

    const seo = generateSeo({
        title: 'Cipher Arena Tutorials',
        description: 'Learn how to solve ciphers like the Aristocrat, K1/K2, and Porta with step-by-step video guides.',
        url: 'https://cipher-arena.fly.dev/tutorials',
        image: 'https://cipher-arena.fly.dev/landing-page/hero-mock.webp'
    });

    const tutorials = [
        {
            title: 'How to Solve An Aristocrat',
            description: 'Master the basics of frequency analysis and pattern recognition to crack standard Aristocrat ciphers.',
            url: 'https://youtu.be/WHcxEUolCxM',
            status: 'available',
            links: [
                { text: 'Practice Aristocrat', url: '/singleplayer/Aristocrat' }
            ]
        },
        {
            title: 'How to Solve A K1/K2 Aristocrat',
            description: 'Learn the keyword alphabet system (K1/K2) and tackle this variation of the Aristocrat.',
            url: 'https://youtu.be/CA7E1RDCZjQ',
            status: 'available',
            links: [
                { text: 'Practice K1', url: '/singleplayer/Aristocrat?K=1' },
                { text: 'Practice K2', url: '/singleplayer/Aristocrat?K=2' }
            ]
        },
        {
            title: 'How to Solve A Porta',
            description: 'Two different methods to solve the Porta cipher. One with a table, and one with a math formula.',
            url: 'https://youtu.be/Ihx_XfL7XsQ',
            status: 'available',
            links: [
                { text: 'Practice Porta', url: '/singleplayer/Porta' }
            ]
        },
        {
            title: 'Solve Checkerboard Cipher',
            description: 'An introduction to the only new cipher added in the 2025-26 Scioly Codebusters Season.',
            url: 'https://youtu.be/vTFrUYghq-k',
            status: 'available',
            links: [{ text: 'Practice Checkerboard', url: '/singleplayer/Checkerboard' }]
        },
        {
            title: 'How to Solve a Hill Cipher',
            description: 'Dive into the world of matrix multiplication and modular arithmetic to conquer the Hill cipher.',
            status: 'coming-soon',
            links: []
        },
        {
            title: 'How to Solve a Nihilist Cipher',
            description: 'Learn to use a Polybius square and to tackle the nihilist cipher.',
            status: 'coming-soon',
            links: []
        },
        {
            title: 'How to Solve a Baconian',
            description: 'Learn some tips and tricks to help you solve the Baconian cipher quicker.',
            status: 'coming-soon',
            links: []
        },
        {
            title: 'How to Solve an Affine Cipher',
            description: 'A guide to solving this monoalphabetic substitution cipher quickly using modular arithmetic.',
            status: 'coming-soon',
            links: []
        }
    ];

    export function animateOnScroll(node) {
        if (typeof window === 'undefined') return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    node.classList.add('visible');
                    observer.unobserve(node);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(node);
        return {
            destroy() {
                if (observer) observer.disconnect();
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
            <div class="hero">Cipher Tutorials</div>
            <div class="subhero">Master the art of codebreaking using video guides.</div>
        </header>

        <section class="section animatable" use:animateOnScroll>
            <h2>Video Guides</h2>
            <div class="tutorial-grid">
                {#each tutorials as tutorial, i}
                    <div
                        class="tutorial-card {tutorial.status}"
                        use:animateOnScroll
                        style="transition-delay: {i * 100}ms;"
                    >
                        {#if tutorial.status === 'coming-soon'}
                            <div class="status-badge">Coming Soon</div>
                        {/if}

                        <h3>{tutorial.title}</h3>
                        <p>{tutorial.description}</p>

                        <div class="card-footer">
                            {#if tutorial.status === 'available'}
                                <a href={tutorial.url} target="_blank" rel="noopener noreferrer" class="watch-button">
                                    Watch on YouTube
                                </a>
                            {/if}

                            {#if tutorial.links && tutorial.links.length > 0}
                                <div class="practice-buttons-container">
                                    {#each tutorial.links as link}
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" class="practice-button">
                                            {link.text}
                                        </a>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    </div>
</div>

<style>
    .tutorial-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }

    .tutorial-card {
        background: rgba(20, 22, 30, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1rem;
        padding: 2rem;
        text-align: left;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        position: relative;
    }

    .tutorial-card.available:hover {
        transform: translateY(-10px) scale(1.03);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.45);
        border-color: rgba(120, 119, 198, 0.5);
    }

    /* Style for 'Coming Soon' cards */
    .tutorial-card.coming-soon {
        opacity: 0.6;
        background: rgba(10, 12, 20, 0.4); /* Darker background */
    }

    .status-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background-color: rgba(255, 107, 107, 0.8);
        color: white;
        padding: 0.25rem 0.6rem;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .tutorial-card h3 {
        font-size: 1.5rem;
        color: #fff;
        margin: 0 0 0.75rem 0;
    }

    .tutorial-card p {
        color: rgba(220, 228, 255, 0.88);
        line-height: 1.6;
        flex-grow: 1; /* Pushes the footer to the bottom */
    }

    .card-footer {
        margin-top: 1.5rem;
    }

    .watch-button {
        display: block; /* Make it a block to fill width */
        width: 100%;
        padding: 0.75rem 1.5rem;
        border-radius: 50px;
        background-color: #4ecdc4;
        color: #1a1c24;
        font-weight: 600;
        text-align: center;
        text-decoration: none;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }

    .watch-button:hover {
        background-color: transparent;
        color: #4ecdc4;
        border-color: #4ecdc4;
        transform: scale(1.02);
        box-shadow: 0 5px 15px rgba(78, 205, 196, 0.2);
    }

    .practice-buttons-container {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.75rem;
    }

    .practice-button {
        flex: 1; /* Each button takes equal space */
        display: inline-block;
        padding: 0.6rem 1rem;
        border-radius: 50px;
        background: transparent;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.5);
        font-weight: 500;
        text-align: center;
        text-decoration: none;
        transition: all 0.3s ease;
    }

    .practice-button:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #fff;
    }

    /* --- COPIED STYLES (Ensure all original styles are here) --- */
    .landing { position: relative; min-height: 100vh; overflow: hidden; background: transparent; }
    .container { max-width: 1440px; margin: 0 auto; padding: 1.25rem; overflow-x: hidden; }
    .section { margin: 0.75rem auto; padding: 3rem 2.5rem; background: rgba(20, 22, 30, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(18px); border-radius: 2rem; color: white; text-align: center; position: relative; overflow: hidden; transition: all 0.3s ease; }
    .hero-section { padding: 5rem 2.5rem; border: 1px solid rgba(255, 255, 255, 0.12); }
    .hero { font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 900; margin-bottom: 1rem; letter-spacing: -0.02em; background: linear-gradient(135deg, #ffffff, #cfd8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: text-glow 2s ease-in-out infinite alternate; }
    .subhero { font-size: 1.28rem; line-height: 1.65; margin-bottom: 1.4rem; color: rgba(255, 255, 255, 0.86); }
    .section h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; color: #fff; position: relative; z-index: 1; }
    .animatable { opacity: 0; transform: translateY(30px); transition: opacity 600ms ease, transform 600ms ease; }
    :global(.animatable.visible) { opacity: 1; transform: translateY(0); }
    @keyframes text-glow { from { text-shadow: 0 0 4px #fff, 0 0 6px #6a5acd, 0 0 12px #6a5acd; } to { text-shadow: 0 0 6px #fff, 0 0 8px #836fff, 0 0 16px #836fff; } }
    .section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 2rem; border: 2px solid transparent; background: linear-gradient(90deg, #4ecdc4, #7877c6, #ff6b6b, #7877c6, #4ecdc4) border-box; background-size: 200% auto; mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0); -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0); -webkit-mask-composite: destination-out; mask-composite: exclude; opacity: 0; transition: opacity 0.4s ease-in-out; }
    .section:hover::before { opacity: 1; animation: move-gradient-border 4s ease-in-out infinite; }
    @keyframes move-gradient-border { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

    @media (max-width: 768px) {
        .container { padding: 1rem; }
        .section { padding: 2.5rem 1.5rem; }
        .hero-section { padding: 3rem 1.5rem; }
        .hero { font-size: clamp(2.2rem, 10vw, 2.8rem); }
        .subhero { font-size: 1.1rem; }
        .section h2 { font-size: 2rem; }
        .tutorial-grid { grid-template-columns: 1fr; }
    }
</style>