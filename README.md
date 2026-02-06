# Cipher Arena

Visit Site: [https://cipherarena.com](https://cipherarena.com)

Cipher Arena is a fast-paced multiplayer web app where players compete in real-time to solve cryptograms. Built with SvelteKit and Socket.IO, the platform supports classic cipher types like Aristocrat, Patristocrat, Caesar, Affine, Porta, Baconian, etc. The website also tracks rankings, stats, and speed-based achievements.

![Game Preview](https://cipherarena.com/landing-page/hero-mock.webp)

## Features

- **Multiplayer Battles**: Compete against other players solving ciphers with in real time with opponent progress tracking
- **Ranked Elo System**: ELO ratings with dynamic updates after every match
- **Achievements and Badges**: Unlock unique badges and personal milestones
- **Secure Auth**: JWT authentication with reCAPTCHA protection
- **Live Lobby System**: Discover and join public lobbies with real time player lists and cipher metadata
- **Leaderboards**: Filter by various performance metrics (ELO, win %, best time, avg time per char, etc)

## Tech Stack

- **Frontend**: SvelteKit
- **Backend**: Node.js, Socket.IO, MongoDB (via Mongoose)
- **Deployment**: Fly.io
- **Auth and Storage**: JWT, AWS S3 for profile pictures
- **Other Service/Library Integrations**: Redis, Nodemailer, Google Analytics, reCAPTCHA, Chart.js, Sharp, Argon2, Sveltestrap, Nanoid

## Cipher Types Supported

| Cipher       | Description                      |
| ------------ | -------------------------------- |
| Aristocrat   | Substitution cipher with spaces  |
| Patristocrat | Substitution cipher with spacing |
| Caesar       | Classic letter-shifting cipher   |
| Affine       | Linear transformation cipher     |
| Porta        | Polyalphabetic cipher with table |
| Baconian     | Binary-style encoding with rules |
| Atbash       | Letter reversal substitution     |
| Nihilist     | Numeric key cipher               |
| Xenocrypt    | Spanish Substitution cipher      |
| Hill         | Matrix algebra based cipher      |
| Checkerboard | Polybius square based cipher     |

## Game Mechanics

- Rematches require **unanimous consent**. the game won't restart unless all players agree.
- **Live progress mapping** shows how much of the cipher each player has solved.
- Hosts can kick inactive players before the game starts.
- Socket reconnection is handled cleanly with session preservation and stale socket cleanup.
