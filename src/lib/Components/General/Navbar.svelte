<script>
    import { goto } from "$app/navigation";

    let isMenuOpen = $state(false);
    let isMenuClosing = $state(false);
    let {authenticated, verified} = $props();

    function toggleMenu() {
        if (isMenuOpen) {
            isMenuClosing = true;
            setTimeout(() => {
                isMenuOpen = false;
                isMenuClosing = false;
            }, 200);
        } else {
            isMenuOpen = true;
        }
    }

    async function navigate(path) {
        isMenuOpen = false;
        try {
            await goto(path);
        } catch (_) {}
    }
</script>

<nav>
    <div class="nav-container">
        <div class="nav-left">
            <div class="logo"
                onclick={() => navigate('/')}
                onkeydown={() => {}}
                tabindex=-1
                role="button">
                <img
                    src="/logo.png"
                    alt="CipherArena"
                    class="logo-img"
                    width="32"
                    height="32"
                    loading="eager"
                    decoding="sync"
                />
            </div>
            {#if authenticated}
                <div class="nav-links desktop-only">
                    <button class="nav-link"
                        onclick={() => navigate('/profile')}>Home</button>
                    <button class="nav-link"
                    onclick={() => navigate('/leaderboard')}>Leaderboard</button>
                    <button class="nav-link"
                        onclick={() => navigate('/singleplayer/Aristocrat')}>Play Solo</button>
                    <button class="nav-link"
                        onclick={() => navigate('/private-lobby')}>Private</button>
                    <button class="nav-link"
                        onclick={() => navigate('/public-lobby')}>Public</button>
                </div>
            {/if}
        </div>

        <div class="menu-icon" onclick={toggleMenu} onkeydown={() => {}} tabindex=-1 role="button">
            <span></span>
            <span></span>
            <span></span>
        </div>

        <div class="nav-right {isMenuOpen ? 'open' : ''} {isMenuClosing ? 'closing' : ''}">
            {#if !authenticated}
                <button class="nav-link"
                onclick={() => navigate('/singleplayer/Aristocrat')}>Try it out</button>
                <button class="nav-link"
                onclick={() => navigate('/leaderboard')}>Leaderboard</button>
                <div class="auth-buttons">
                    <button class="nav-link login" onclick={() => navigate('/account/login')}>Login</button>
                    <button class="nav-link signup" onclick={() => navigate('/account/register')}>Sign up</button>
                </div>
            {:else}
                <div class="mobile-nav-links">
                    <button class="nav-link"
                        onclick={() => navigate('/profile')}>Home</button>
                    <button class="nav-link"
                    onclick={() => navigate('/leaderboard')}>Leaderboard</button>
                    <button class="nav-link"
                        onclick={() => navigate('/singleplayer')}>Play Solo</button>
                    <button class="nav-link"
                        onclick={() => navigate('/private-lobby')}>Private</button>
                    <button class="nav-link"
                        onclick={() => navigate('/public-lobby')}>Public</button>
                </div>
                {#if verified=="false"}
                    <button onclick={() => navigate('/resend-verification')} class="verify-btn">Verify Account</button>
                {/if}
                <form method="POST" action="/logout">
                    <button class="nav-link logout">Logout</button>
                </form>
            {/if}
        </div>
    </div>
</nav>

<style>
    nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        padding: 0.5rem 0;
        transform: translateZ(0);
        will-change: transform;
        height: 60px;
        contain: layout size;
    }

    .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        contain: layout style;
    }

    .nav-left {
        display: flex;
        align-items: center;
        gap: 2rem;
        height: 100%;
    }

    .logo {
        position: relative;
        cursor: pointer;
        padding: 1.25rem;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        width: 32px;
        contain: strict;
        background: transparent;
    }

    .logo:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .logo-img {
        display: block;
        height: 32px;
        width: 32px;
        object-fit: contain;
        filter: brightness(1.1);
        transition: all 0.2s;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
    }

    .logo:hover .logo-img {
        filter: brightness(1.2);
    }

    .nav-links {
        display: flex;
        gap: 0.5rem;
        height: 100%;
        align-items: center;
    }

    .nav-link {
        color: white !important;
        text-decoration: none;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: background-color 0.2s ease-out;
        background: transparent;
        border: none;
        cursor: pointer;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        contain: content;
        -webkit-appearance: none;
        appearance: none;
    }

    .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .nav-right {
        display: flex;
        align-items: center;
        gap: 1rem;
        height: 100%;
    }

    .auth-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .login {
        border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .signup {
        background: white;
        color: #6a11cb !important;
        font-weight: 600;
    }

    .verify-btn {
        background: white;
        color: #6a11cb !important;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease-out;
    }

    .logout {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .menu-icon {
        display: none;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
        padding: 0.5rem;
    }

    .menu-icon span {
        display: block;
        width: 24px;
        height: 2px;
        background: white;
        transition: all 0.3s;
    }

    .desktop-only {
        display: flex;
    }

    .mobile-nav-links {
        display: none;
    }

    @media (max-width: 850px) {
        .desktop-only {
            display: none;
        }

        .menu-icon {
            display: flex;
        }

        .nav-right {
            display: none;
            position: fixed;
            top: 60px;
            right: 1rem;
            background: linear-gradient(135deg, #2575fc77, #6b11cb77);
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            flex-direction: column;
            align-items: stretch;
            min-width: 200px;
            max-width: calc(100vw - 2rem);
            gap: 0.5rem;
            transform: translateZ(0);
            will-change: transform, opacity;
            backdrop-filter: blur(10px);
            z-index: 1000;
            height: auto;
            overflow: hidden;
            contain: content;
        }

        .nav-right.open {
            display: flex;
            animation: slideIn 0.2s ease-out forwards;
        }

        .nav-right.closing {
            display: flex;
            animation: slideOut 0.2s ease-out forwards;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }

        .mobile-nav-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
        }

        .mobile-nav-links .nav-link {
            width: 100%;
            text-align: center;
            padding: 0.8rem 1rem;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .mobile-nav-links .nav-link:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }

        .auth-buttons {
            flex-direction: column;
            width: 100%;
            align-items: stretch;
            gap: 0.5rem;
        }

        .auth-buttons .nav-link,
        .logout,
        .verify-btn {
            width: 100%;
            text-align: center;
            justify-content: center;
            display: flex;
            align-items: center;
            padding: 0.8rem 1rem;
            margin: 0;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .nav-link.login {
            background: rgba(255, 255, 255, 0.1);
        }

        .nav-link.login:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }

        .nav-link.signup,
        .verify-btn {
            background: white;
            color: #6a11cb !important;
        }

        .nav-link.signup:hover,
        .verify-btn:hover {
            background: #f0f0f0;
            transform: translateY(-1px);
        }

        .logout {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logout:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }

        form {
            width: 100%;
            margin: 0;
        }
    }

    @media (max-width: 380px) {
        .nav-right {
            right: 0.5rem;
            left: 0.5rem;
            width: auto;
            min-width: unset;
            max-width: unset;
        }
    }
</style>