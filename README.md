# KodLab Frontend

React frontend for the KodLab educational platform.

## Requirements

- Node.js 20+ (recommended via nvm)
- npm

### Installing Node.js via nvm (recommended)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Restart terminal, then:
nvm install --lts
nvm use --lts
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Frontend runs at http://localhost:5173

> **Note:** Backend must be running at http://localhost:8080 (see `kodlab-backend/README.md`)

## Project Structure

```
src/
├── api/           # API calls (auth.ts)
├── context/       # React contexts (AuthContext)
├── pages/         # Pages
│   ├── LoginPage.tsx      # /prihlaseni
│   ├── RegisterPage.tsx   # /registrace
│   └── HomePage.tsx       # / (after login)
├── App.tsx        # Routing
├── App.css        # Styles
└── main.tsx       # Entry point
```

## Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Configuration

To connect to a different backend, create a `.env` file:

```bash
VITE_API_URL=http://localhost:8080
```

## Quick Start (both parts)

```bash
# Terminal 1 - Backend
cd kodlab-backend
docker compose up -d
mvn spring-boot:run

# Terminal 2 - Frontend
cd kodlab-frontend
npm run dev
```

Open http://localhost:5173 in your browser.
