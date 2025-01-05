<script>
    let isMenuOpen = false;

    function toggleMenu() {
      isMenuOpen = !isMenuOpen;
    }
</script>

<nav>
    <div class="logo">CipherArena</div>
    <div class="menu-icon" on:click={toggleMenu} on:keydown={() => {}}>
      ☰
    </div>
    <div class="links {isMenuOpen ? 'open' : ''}">
      <a href="/home">Home</a>
      <a href="/singleplayer">Singleplayer</a>
    </div>
</nav>

<style>
    nav {
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: linear-gradient(180deg, #2d33a7, #1a23c7e5); /* Gradient complementing container */
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8); /* Deeper shadow for contrast */
        border-bottom: 2px solid rgba(255, 255, 255, 0.2); /* Subtle border for depth */
    }

    .logo {
        font-size: 1.8rem;
        font-weight: bold;
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); /* Subtle text shadow */
    }

    .links {
        display: flex;
        gap: 1.5rem;
    }

    .links a {
        text-decoration: none;
        color: #ffffff; /* White text for links */
        font-size: 1rem;
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        transition: background 0.3s ease, color 0.3s ease;
    }

    .links a:hover {
        background: rgba(255, 255, 255, 0.2); /* Soft hover highlight */
        color: #c2d3ff; /* Slightly lighter text on hover */
    }

    .menu-icon {
        display: none;
        font-size: 1.8rem;
        cursor: pointer;
        color: #ffffff;
    }

    @media (max-width: 768px) {
        .links {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 60px;
            right: 10px;
            background: linear-gradient(135deg, #2d33a7, #1a23c7a0); /* Match navbar */
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
        }

        .links.open {
            display: flex;
        }

        .menu-icon {
            display: block;
        }
    }
  </style>