# MusicRecommender — Frontend

React-based client application for the MusicRecommender system. Provides the user interface for onboarding, browsing recommendations, submitting feedback, and connecting external music services.

## Tech Stack

- **React 18**
- **Vite** — build tool
- **Tailwind CSS** — styling
- **JWT** — authentication (access + refresh tokens)

## Features

- User registration and login with JWT authentication
- Interactive onboarding flow (cold-start preference selection)
- Dynamic recommendation display (Top Picks + More Recommendations)
- LIKE / Don't Like feedback mechanism with real-time profile updates
- Spotify OAuth 2.0 integration with CSRF protection
- Recommendation explainability display (matched tags, similar tracks, strategy)
- Lazy-loaded Spotify embed player with skeleton placeholder
- Protected and public-only route guarding
- Responsive design (mobile + desktop)

## Quick Start

### 1. Clone

```bash
git clone https://github.com/K4Nu/MusicRecommenderFrontend.git
cd MusicRecommenderFrontend
```

### 2. Environment

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_LOGIN_URL` — backend login endpoint
- `VITE_REGISTER_URL` — backend registration endpoint
- `VITE_AUTH_URL` — backend auth endpoint
- `VITE_SPOTIFY_CLIENT_ID` — Spotify app client ID
- `VITE_SPOTIFY_REDIRECT_URL` — Spotify OAuth redirect URL
- `VITE_SPOTIFY_CALLBACK_URL` — frontend callback endpoint

### 3. Install & Run

```bash
npm install
npm run dev
```

App available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login, Register forms
│   ├── layout/         # Navigation, Layout wrappers
│   ├── Spotify/        # Spotify OAuth callback handler
│   └── Youtube/        # YouTube integration components
├── contexts/
│   └── AuthContext.jsx  # Global auth state (JWT management)
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Onboarding.jsx   # Cold-start preference selection
│   ├── Index.jsx         # Main recommendation view
│   └── Settings.jsx
└── utils/
    └── Auth.js           # Token operations, OAuth helpers
```

## Requirements

- Node.js 18+
- Running backend API at `http://localhost:8000`

## License

This project was developed as an engineering thesis at the University of Silesia.