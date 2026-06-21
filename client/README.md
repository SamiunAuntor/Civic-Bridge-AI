# Civic Bridge AI Frontend

The frontend for **Civic Bridge AI**, an AI-assisted crisis support and stability-planning platform. It gives authenticated users a private workspace where they can describe a difficult situation, receive a structured risk assessment, organize priorities, follow a recovery roadmap, track support resources, simulate decisions, and monitor progress over time.

This application is built with the Next.js App Router and communicates with the Civic Bridge AI Express API. Firebase Authentication manages user identity; the backend verifies each Firebase ID token and stores application data in Supabase.

> Civic Bridge AI provides planning assistance, not emergency, legal, medical, or financial advice. Urgent situations should always be directed to the appropriate local emergency or professional service.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [How the Frontend Fits Together](#how-the-frontend-fits-together)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Firebase Authentication Setup](#firebase-authentication-setup)
- [Installation and Local Development](#installation-and-local-development)
- [Available Scripts](#available-scripts)
- [Backend API Integration](#backend-api-integration)
- [State and Data Flow](#state-and-data-flow)
- [Styling and UI](#styling-and-ui)
- [Testing and Quality Checks](#testing-and-quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Development Guidelines](#development-guidelines)

## Features

### Public experience

- Responsive product landing page with platform overview, process, security information, FAQ, and calls to action.
- Email and password registration and sign-in.
- Google sign-in through Firebase Authentication.
- Password-reset email flow.
- Friendly authentication errors and loading states.

### Authenticated workspace

- Protected application routes with automatic redirection to sign-in.
- Dashboard with the current case, stability score, risk summaries, urgent priorities, and roadmap preview.
- Guided case intake covering the user's situation and core stability concerns.
- Safety screening before the normal AI assessment flow continues.
- AI-assisted analysis across housing, income, healthcare, and overall risk.
- Case history with status, archive state, sorting, filtering, and pagination support.
- Detailed case workspace containing the current assessment, priorities, roadmap, simulations, resources, and timeline.
- Interactive roadmap tasks with progress status, due dates, notes, and outcomes.
- Reassessments that compare the latest stability picture with previous assessments.
- Decision simulations for exploring possible housing, income, and health effects.
- Recommended civic resources and resource-interaction tracking.
- Eligibility guidance and application-assistance content for tracked resources.
- Progress metrics based on roadmap completion, reassessments, and resource activity.
- Account settings and sign-out controls.
- Responsive desktop sidebar and mobile navigation.
- Application-level loading, empty, error, unauthorized, toast, and confirmation states.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 with App Router |
| Language | TypeScript with strict type checking |
| UI | React 19 |
| Styling | Tailwind CSS 4 and CSS design tokens |
| Authentication | Firebase Authentication |
| Animation | Framer Motion |
| Icons | Lucide React |
| Theme support | next-themes |
| Feedback | React Hot Toast and SweetAlert2 |
| Validation | Zod |
| Testing | Vitest, Testing Library, jest-dom, and jsdom |
| Linting | ESLint with Next.js and TypeScript rules |
| Deployment | Vercel-ready configuration |

## How the Frontend Fits Together

```text
Browser
  |
  |-- Firebase Authentication
  |     Creates a session and supplies a Firebase ID token
  |
  `-- Next.js frontend
        |
        |-- App Router pages and layouts
        |-- React providers for auth, case workspace, theme, and feedback
        |-- Typed service modules
        |
        `-- Authorization: Bearer <Firebase ID token>
              |
              `-- Express API
                    |-- Firebase Admin token verification
                    |-- Supabase persistence
                    `-- AI-assisted analysis and planning
```

The browser never connects directly to Supabase or the AI provider. Authenticated application operations go through the backend API.

## Project Structure

```text
client/
|-- app/                         # App Router pages, layouts, and global styles
|   |-- (protected)/             # Routes guarded by Firebase authentication
|   |   |-- assessments/new/     # Guided intake and assessment creation
|   |   |-- cases/               # Case list and case detail workspaces
|   |   |-- dashboard/           # Current-case overview
|   |   |-- progress/            # Cross-feature progress metrics
|   |   |-- resources/           # Redirect into selected case workspace
|   |   |-- roadmap/             # Redirect into selected case workspace
|   |   `-- settings/            # User account settings
|   |-- forgot-password/         # Password recovery
|   |-- login/                   # Sign-in page
|   |-- register/                # Account creation
|   |-- unauthorized/            # Access error page
|   |-- error.tsx                # Global route error boundary
|   |-- layout.tsx               # Root metadata, fonts, and providers
|   `-- page.tsx                 # Public landing page
|-- assets/                      # Logos and landing-page images
|-- components/                  # Feature and reusable UI components
|   |-- assessment/
|   |-- auth/
|   |-- cases/
|   |-- dashboard/
|   |-- landing/
|   |-- layout/
|   |-- roadmap/
|   `-- ui/
|-- hooks/                       # Auth and assessment workspace hooks
|-- lib/                         # Firebase, API client, feature flags, utilities
|-- providers/                   # Global React context providers
|-- services/                    # Typed backend API operations by domain
|-- tests/                       # Vitest and Testing Library test suite
|-- types/                       # API and domain TypeScript contracts
|-- .env.example                 # Public runtime configuration template
|-- eslint.config.mjs
|-- next.config.ts
|-- tsconfig.json
|-- vercel.json
`-- vitest.config.mjs
```

The `@/` TypeScript alias points to the root of `client/`. For example, `@/services/case-service` resolves to `client/services/case-service.ts`.

## Application Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Marketing landing page |
| `/login` | Public | Email/password or Google sign-in |
| `/register` | Public | Create a Firebase account |
| `/forgot-password` | Public | Request a Firebase password-reset email |
| `/unauthorized` | Public | Display an access-denied state |
| `/dashboard` | Protected | Current case, stability, risks, priorities, and tasks |
| `/assessments/new` | Protected | Start a guided case assessment |
| `/cases` | Protected | Browse and manage case history |
| `/cases/[caseId]` | Protected | Open the full case workspace |
| `/progress` | Protected | Review roadmap, reassessment, and resource metrics |
| `/settings` | Protected | Review account information and sign out |
| `/roadmap` | Protected | Redirect to the selected case workspace or case list |
| `/resources` | Protected | Redirect to the selected case workspace or case list |

Protected routes live under `app/(protected)`. The route group does not affect the URL. Its layout waits for Firebase to resolve the session, redirects unauthenticated users to `/login?next=<requested-route>`, and renders the shared application shell for authenticated users.

## Prerequisites

Before starting the frontend, install or configure:

- Node.js 22.x, matching the repository backend runtime.
- npm, which is used by the committed `package-lock.json`.
- A Firebase project with Authentication enabled.
- A running Civic Bridge AI backend, locally or at a deployed URL.
- The backend's Supabase, Firebase Admin, and AI provider configuration. See [`../server/README.md`](../server/README.md) for server setup.

## Environment Variables

Create a local environment file from the provided template:

```bash
cd client
cp .env.example .env.local
```

On PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

Then populate `client/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_web_app_id
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Recommended | Backend base URL including `/api`. Defaults to `http://localhost:5000/api`. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Web API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase authentication domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket from the web app config. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase web application ID. |

All variables use the `NEXT_PUBLIC_` prefix because Firebase's web configuration and the API URL must be available in the browser bundle. They identify public client resources; they are not server secrets. Never place Firebase Admin credentials, a Supabase service-role key, or an AI provider key in this file.

Restart the Next.js development server after changing environment variables.

## Firebase Authentication Setup

The frontend and backend must use the same Firebase project.

1. Open the Firebase Console and create or select the project used by the backend.
2. Under **Project settings > General**, register a Web application if one does not already exist.
3. Copy the web app configuration values into `client/.env.local`.
4. Open **Authentication > Sign-in method**.
5. Enable **Email/Password**.
6. Enable **Google** if Google sign-in should be available.
7. Add local and deployed hostnames to **Authentication > Settings > Authorized domains** when required.
8. Configure Firebase Admin for the same project in `server/`; the API uses it to verify frontend ID tokens.

If any Firebase web configuration value is empty, `lib/firebase.ts` intentionally leaves Firebase uninitialized. Public content remains available, while authentication actions are disabled and protected pages show an unavailable state.

## Installation and Local Development

### 1. Install frontend dependencies

```bash
cd client
npm install
```

For reproducible CI-style installation from the lockfile, use `npm ci` instead.

### 2. Configure the environment

Create `client/.env.local` as described above.

### 3. Start the backend

In a second terminal:

```bash
cd server
npm install
npm run dev
```

The default backend address is `http://localhost:5000`, with API routes under `/api`.

### 4. Start the frontend

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Next.js updates the page as source files change.

## Available Scripts

Run these commands from `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve a previously generated production build |
| `npm run lint` | Run ESLint across the frontend |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run the Vitest suite once |

A typical pre-commit check is:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Backend API Integration

Domain-specific functions in `services/` call the shared client in `lib/api-client.ts`. The API client:

- Reads `NEXT_PUBLIC_API_BASE_URL`.
- Retrieves the current user's Firebase ID token.
- Adds `Authorization: Bearer <token>` and JSON content headers.
- Disables browser fetch caching for application data.
- Aborts requests after 20 seconds.
- Parses JSON or text responses.
- Normalizes failed responses into `ApiError` with an HTTP status and payload.

The frontend currently consumes these API areas:

| Domain | Operations |
| --- | --- |
| User | Load the authenticated database profile |
| Assessments | Run safety screening and create an initial assessment |
| Cases | List, filter, load, rename, and update case status |
| Dashboard | Load the current case and task summary |
| Priorities | Load saved priorities for an assessment |
| Roadmap | Load and update roadmap tasks |
| Reassessments | Create and list follow-up assessments |
| Simulations | Create decision simulations and load case simulations |
| Resources | Generate recommendations from situation and risk data |
| Resource interactions | Track contact status and request eligibility/application help |
| Timeline | Load case activity and add user notes |

The client assumes the API uses a success envelope such as:

```json
{
  "success": true,
  "data": {}
}
```

Most failures are expected to include a human-readable `message`. Authentication or ownership failures commonly return `401` or `403`; validation failures commonly return `422`.

## State and Data Flow

Global providers are composed in `providers/app-providers.tsx`:

1. `ThemeProvider` initializes the visual theme.
2. `AuthProvider` observes Firebase session changes and loads the corresponding backend user profile.
3. `AssessmentWorkspaceProvider` keeps the selected case and its assessment workspace available across protected screens.
4. `FeedbackProvider` hosts application notifications and confirmation feedback.

The main case flow is:

1. A user submits the guided assessment form.
2. The frontend requests a safety screening.
3. When normal assessment can continue, the API creates the assessment and associated case.
4. The backend returns risk analysis, priorities, and roadmap tasks.
5. The frontend selects the case and exposes it through the assessment workspace context.
6. Dashboard and case screens render the workspace and request additional case-specific data as needed.

Feature availability is centralized in `lib/features.ts`. These flags currently enable case history, daily actions, emergency screening, eligibility assistance, reassessment, resource interactions, task progress, and timeline functionality.

## Styling and UI

- Tailwind CSS 4 is imported through `app/globals.css`.
- Shared colors, surfaces, typography, borders, and shadows are represented as CSS variables and Tailwind theme tokens.
- Inter is the body font and Atkinson Hyperlegible is the heading font through `next/font`.
- Reusable primitives live in `components/ui/`.
- Feature components are grouped by product domain rather than by page alone.
- Layout components provide the responsive sidebar, mobile navigation, header, and account menu.
- Static images are imported from `assets/` and optimized by Next.js.

When adding UI, prefer existing tokens and shared primitives before introducing new one-off styles.

## Testing and Quality Checks

Vitest runs in a jsdom environment. `vitest.setup.ts` installs jest-dom matchers, and the `@/` alias is configured to match TypeScript and Next.js resolution.

The test suite currently covers:

- Authenticated route protection and navigation visibility.
- API client token, request, response, timeout, and error behavior.
- Assessment workspace persistence and selection behavior.
- Cases list and case detail rendering.
- Interactive roadmap task behavior.
- Daily actions and progress metrics.
- Settings-page behavior.

Run the suite:

```bash
npm test
```

Run the other static checks separately:

```bash
npm run lint
npm run typecheck
```

Tests are stored in `tests/` and generally use Testing Library to assert behavior from the user's perspective. New user-facing flows should include loading, success, empty, and failure coverage where applicable.

## Deployment

The frontend includes `vercel.json` with the framework set to Next.js.

### Deploy to Vercel

1. Create a Vercel project from this repository.
2. Set the project's **Root Directory** to `client`.
3. Keep the detected framework preset as **Next.js**.
4. Add every variable from `client/.env.example` in the Vercel project settings.
5. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL, including `/api`.
6. Deploy the project.
7. Add the deployed frontend domain to Firebase Authentication's authorized domains.
8. Ensure the backend CORS configuration permits the deployed frontend origin.

Before deployment, verify locally:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Because `NEXT_PUBLIC_*` values are embedded into the client build, changing them requires a new deployment.

## Troubleshooting

### Sign-in is unavailable

- Confirm all six Firebase variables are present in `.env.local`.
- Confirm Email/Password or Google is enabled in Firebase Authentication.
- Restart `npm run dev` after editing environment variables.
- Check that the current hostname is authorized by Firebase.

### Sign-in works, but API calls return `401`

- Confirm the frontend and Firebase Admin backend use the same Firebase project.
- Confirm `NEXT_PUBLIC_API_BASE_URL` points to the expected backend and includes `/api`.
- Check that the backend service-account configuration is valid.

### Requests fail with a network or CORS error

- Confirm the Express server is running on port `5000`, or update the API base URL.
- Confirm the URL protocol and hostname are correct.
- Add the frontend origin to the backend CORS configuration.
- In production, avoid mixing an HTTPS frontend with an HTTP backend.

### Requests time out

The shared API client aborts after 20 seconds. Check backend logs, database connectivity, and AI-provider response time before increasing the frontend timeout.

### A protected page keeps redirecting to sign-in

- Wait for Firebase to finish restoring the session.
- Check the browser console for Firebase initialization errors.
- Confirm cookies/storage are not being blocked for the site.
- Sign out and sign in again to refresh the Firebase session.

### The production build fails while loading fonts

The root layout uses Google fonts through `next/font`. The first production build may require network access so Next.js can obtain font assets.

## Security Notes

- Treat all `NEXT_PUBLIC_*` values as visible to users.
- Never add `serviceAccountKey.json`, Firebase Admin JSON, `SUPABASE_SERVICE_ROLE_KEY`, or AI keys to the frontend.
- Do not call privileged Supabase operations directly from browser components.
- Keep authorization and resource ownership enforcement on the backend; route protection in React is only a user-experience layer.
- Continue validating all assessment, roadmap, simulation, resource, and timeline inputs on the server.
- Avoid logging Firebase ID tokens or sensitive case descriptions.
- Use HTTPS for both frontend and backend in production.
- Review crisis-related copy carefully and preserve the distinction between planning support and professional or emergency advice.

## Development Guidelines

- Keep route-level files focused on composition; place substantial behavior in feature components, hooks, providers, or services.
- Add backend calls through `services/` instead of calling `fetch` directly from components.
- Reuse `apiClient` so authentication, timeouts, response parsing, and errors remain consistent.
- Define shared request, response, and domain contracts in `types/`.
- Use the `@/` alias for internal imports.
- Preserve strict TypeScript checks and avoid untyped API payloads.
- Add or update tests alongside behavior changes.
- Keep secrets and machine-specific values in ignored environment files.

For backend architecture, database setup, and API implementation details, see [`../server/README.md`](../server/README.md).
