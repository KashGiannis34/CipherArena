# Cipher Arena

[![LIVE](https://img.shields.io/badge/visit-live-green?style=for-the-badge&logo=vercel)](https://cipher-arena.fly.dev)

Cipher Arena is a fast-paced multiplayer web app where players compete in real-time to solve cryptograms. Built with SvelteKit and Socket.IO, the platform supports classic cipher types like Aristocrat, Patristocrat, Caesar, Affine, Porta, and even Baconian — all while tracking rankings, stats, and speed-based achievements.

![Game Preview](https://cipher-arena.fly.dev/landing-page/hero-mock.png)

## Features

- **Multiplayer Battles** – Go head-to-head solving ciphers with real-time progress tracking.
- **Ranked Elo System** – Per-cipher Glicko-2 ratings with dynamic updates after every match.
- **Achievements & Badges** – Unlock unique badges based on obscure solve conditions and personal milestones (including nods to #34).
- **Secure Auth** – JWT-based login with email-first autofill and profile picture cropping.
- **Live Lobby System** – Discover and join public lobbies with real-time player lists and cipher metadata.
- **Leaderboards** – Filter by cipher type and performance metric (Elo, win %, best time, etc.).
- **Glassmorphic UI** – Responsive and animated UI built with Svelte 5 and runes.

## 🛠 Tech Stack

- **Frontend**: SvelteKit
- **Backend**: Node.js, Socket.IO, MongoDB (via Mongoose)
- **Deployment**: Fly.io (with custom EC2 proxy to access MongoDB Atlas)
- **Auth & Storage**: JWT, AWS S3 for profile pictures

## Cipher Types Supported

| Cipher         | Description                        |
|----------------|------------------------------------|
| Aristocrat     | Substitution cipher with spaces    |
| Patristocrat   | Substitution cipher with spacing   |
| Caesar         | Classic letter-shifting cipher     |
| Affine         | Linear transformation cipher       |
| Porta          | Polyalphabetic cipher with table   |
| Baconian       | Binary-style encoding with rules   |
| Atbash         | Letter reversal substitution       |
| Nihilist       | Numeric key cipher                 |
| Xenocrypt      | Spanish Substitution cipher        |

## Game Mechanics

- Rematches require **unanimous consent** — the game won't restart unless all players agree.
- **Live progress mapping** shows how much of the cipher each player has solved.
- Hosts can kick inactive players before the game starts.
- Socket reconnection is handled cleanly with session preservation and stale socket cleanup.