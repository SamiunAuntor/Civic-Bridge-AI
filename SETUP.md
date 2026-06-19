# CivicBridgeAI Setup Guide

## 1. Prerequisites

- Windows with Command Prompt or PowerShell
- Node.js 20 or newer recommended
- npm 10 or newer recommended
- A Firebase project
- A Supabase project with the required tables
- A Gemini API key

## 2. Repository Structure

```txt
CivicBridgeAI/
|-- server/   # Express backend
`-- client/   # Next.js frontend
```

Note: this repository currently uses `client/`, not `frontend/`.

## 3. Backend Environment Setup

The backend reads these variables:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Setup:

```bat
cd server
copy .env.example .env
```

Then fill in the real values in `server/.env`.

## 4. Frontend Environment Setup

The frontend reads these variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Setup:

```bat
cd client
copy .env.example .env.local
```

Then fill in the real Firebase client values in `client/.env.local`.

## 5. Firebase Admin Setup

The backend does not use Firebase Admin environment variables. It directly imports a local JSON credential file:

```txt
server/serviceAccountKey.json
```

Create the real file from the template:

```txt
server/serviceAccountKey.example.json
```

Get the real service-account JSON from:

Firebase Console -> Project settings -> Service accounts -> Generate new private key

Important:

- Keep `server/serviceAccountKey.json` local only
- Never place this file in the frontend
- Never commit it to Git

## 6. Firebase Client Setup

Get the client values from:

Firebase Console -> Project settings -> General -> Your apps -> Web app -> SDK setup and configuration

Copy those values into `client/.env.local`.

The frontend initializes Firebase in:

```txt
client/lib/firebase.ts
```

## 7. Firebase Authentication Provider Setup

The current frontend code supports:

- Email/password
- Google sign-in

Enable both in:

Firebase Console -> Authentication -> Sign-in method

The frontend Firebase project should match the Firebase project whose service-account JSON is used by the backend. Otherwise the backend may reject the ID tokens issued by the frontend project.

Authentication flow:

1. The frontend signs in with Firebase Client SDK
2. The frontend gets the Firebase ID token
3. The frontend sends `Authorization: Bearer <firebase-id-token>`
4. The backend verifies the token with Firebase Admin
5. The backend synchronizes the user into Supabase

## 8. Supabase Setup

The backend expects these tables:

- `users`
- `assessments`
- `risk_assessments`
- `priorities`
- `roadmaps`
- `simulations`
- `resources`

This repository does not contain migrations, schema files, or SQL setup scripts for Supabase.

You will need the teammate/backend developer to provide:

- The table creation SQL or migrations
- Column types and constraints
- Foreign keys
- Seed data requirements for `resources`
- Any required row-level security or policy setup

## 9. Gemini API Setup

Create a Gemini API key and place it in:

```txt
server/.env
```

Variable:

```env
GEMINI_API_KEY=your-gemini-api-key
```

The backend uses model `gemini-2.5-flash`.

## 10. Install Dependencies

Backend:

```bat
cd server
npm.cmd install
```

Frontend:

```bat
cd client
npm.cmd install
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`.

## 11. Run Backend And Frontend

Open two terminals.

Terminal 1, backend:

```bat
cd D:\Other Projects\CivicBridgeAI\server
npm.cmd run dev
```

Terminal 2, frontend:

```bat
cd D:\Other Projects\CivicBridgeAI\client
npm.cmd run dev
```

Recommended startup order:

1. Start the backend
2. Start the frontend
3. Sign in through Firebase on the frontend
4. Confirm `/api/users/me` works through the authenticated frontend flow

## 12. Local Development URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API base URL: `http://localhost:5000/api`
- Current-user endpoint: `http://localhost:5000/api/users/me`

There is no dedicated health endpoint in the current backend.

## 13. How To Confirm Each Integration

Firebase authentication:

- Sign in with email/password or Google on the frontend
- Open the dashboard
- Confirm the frontend successfully bootstraps `/api/users/me`

Supabase connection:

- After Firebase sign-in, the backend should verify the token and sync the user into the `users` table
- A successful `/api/users/me` response is the safest current confirmation path

Gemini connection:

- Submit an assessment from the frontend or call `POST /api/assessments`
- This requires valid Firebase auth, Supabase tables, and Gemini credentials

## 14. Common Errors And Solutions

`Cannot find module 'dotenv'` or `Cannot find module 'express'`

- Run `npm.cmd install` in the relevant app directory

`Firebase client variables are missing`

- Fill in `client/.env.local` using the values from the Firebase web app config

`Cannot find module '../../serviceAccountKey.json'`

- Create `server/serviceAccountKey.json` from the real Firebase service-account download

`Unauthorized`

- Confirm the frontend and backend are using the same Firebase project
- Confirm Firebase Authentication providers are enabled
- Confirm the request sends `Authorization: Bearer <firebase-id-token>`

Supabase errors

- Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Confirm the expected tables exist

Assessment creation fails even with valid setup

- There is a known backend blocker in the assessment flow from the earlier audit

## 15. Secret Management Warnings

- Never commit `server/.env`
- Never commit `server/serviceAccountKey.json`
- Never place `SUPABASE_SERVICE_ROLE_KEY` in the frontend
- Never place `GEMINI_API_KEY` in the frontend
- Never expose Firebase Admin credentials through `NEXT_PUBLIC_*`

## 16. Missing Information To Request From A Teammate

- Full Supabase schema or SQL migrations
- Required seed data for the `resources` table
- Any production Firebase project details if they differ from local development
- Any deployment-specific environment variables or hostnames
