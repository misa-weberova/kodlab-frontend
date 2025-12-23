# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Architecture

React 18 + Vite + TypeScript frontend for KodLab educational platform.

### Tech Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript (strict mode)
- **Routing**: React Router v7
- **Styling**: Plain CSS (App.css)

### Project Structure
```
src/
├── api/          # API client functions
├── context/      # React contexts (AuthContext)
├── pages/        # Page components
├── App.tsx       # Routes and layout
└── main.tsx      # Entry point
```

### Key Patterns
- **Auth**: JWT stored in localStorage, AuthContext provides user state
- **API**: Fetch-based, errors thrown with Czech messages
- **Routes**: Czech URLs (/prihlaseni, /registrace)

### Environment Variables
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080)

## Product Context

See `../kodlab-backend/CLAUDE.md` for full product context.

**Key reminders:**
- All UI text must be in Czech
- Target users: kids 10-15, teachers with low technical skills
- Keep UX extremely simple
- MVP-focused: don't over-engineer
