# Civic Bridge AI

**Civic Bridge AI** is a full-stack crisis support and stability-planning platform. It helps people turn a complex situation into a clear, manageable plan by assessing immediate risks, identifying priorities, generating actionable roadmap tasks, matching civic resources, and tracking progress over time.

The platform combines a responsive Next.js application with an authenticated Express API, Supabase persistence, Firebase Authentication, and configurable AI providers. Its goal is not to replace emergency services or professional advice, but to help users organize information, understand their options, and take practical next steps.

## Live Application

Visit the deployed application: **[https://civic-bridge-ai.vercel.app](https://civic-bridge-ai.vercel.app/)**

> **Important:** Civic Bridge AI provides informational planning assistance. It is not an emergency service and does not provide legal, medical, financial, or mental-health advice. Anyone in immediate danger should contact the appropriate local emergency service or qualified professional.

## Table of Contents

- [What the Platform Does](#what-the-platform-does)
- [Features](#features)
- [Typical User Journey](#typical-user-journey)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Supabase Setup](#supabase-setup)
- [Running the Application](#running-the-application)
- [Available Commands](#available-commands)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security and Privacy](#security-and-privacy)
- [Troubleshooting](#troubleshooting)
- [Further Documentation](#further-documentation)

## What the Platform Does

A user can describe a difficult situation involving concerns such as housing, income, healthcare, essential needs, time pressure, or personal safety. Civic Bridge AI then helps organize that information into:

- A stability score and structured risk assessment.
- A safety screening for potentially urgent circumstances.
- A prioritized list of concerns with explanations.
- A step-by-step recovery roadmap.
- Relevant support-resource recommendations.
- Decision simulations showing possible consequences.
- A persistent case history with reassessments and progress tracking.

Each case becomes a private working space where the user can update tasks, record resource contact attempts, add timeline notes, review changes, and continue planning.

## Features

### Authentication and account access

- Email and password registration and sign-in with Firebase Authentication.
- Google sign-in support.
- Password-reset email flow.
- Protected application routes and automatic sign-in redirects.
- Firebase ID-token verification on every protected API request.
- Automatic synchronization of authenticated Firebase users into Supabase.

### Guided crisis assessment

- Structured intake for the user's situation and primary concerns.
- Support for housing, income, healthcare, essential-needs, safety, time-pressure, and social-support context.
- Emergency-oriented safety screening before normal analysis continues.
- AI-generated stability score from `0` to `100`.
- Housing, income, healthcare, and overall risk levels.
- Plain-language summary of the user's current stability picture.

### Case management

- Automatic case creation from an initial assessment.
- Private, user-owned case workspaces.
- Case list with pagination, filtering, sorting, status, and archive support.
- Case statuses including active, urgent, stable, resolved, and archived.
- Editable case titles and statuses.
- Initial and latest stability scores for easier comparison.
- Ownership checks on case-scoped data and actions.

### Dashboard and priorities

- Current-case overview.
- Stability score and domain-specific risk cards.
- AI-generated priorities with reasoning and confidence information.
- Urgent tasks, tasks due today, overdue tasks, blocked tasks, and recommended next actions.
- Roadmap and completion summaries.

### Interactive recovery roadmap

- AI-generated tasks grouped by suggested time horizon.
- Task states: not started, in progress, completed, and blocked.
- Due dates, user notes, and outcome recording.
- Daily-action view for immediate next steps.
- Completion and workload metrics.

### Reassessment and progress tracking

- Follow-up assessments attached to an existing case.
- Comparison of previous and current stability scores.
- Comparison of housing, income, healthcare, and overall risk levels.
- Change summaries explaining how the situation has evolved.
- Progress screen combining roadmap completion, reassessments, and resource activity.

### Decision simulation

- Users can describe a possible decision before acting on it.
- AI-assisted simulation of potential housing, income, and health impacts.
- Overall consequence summary and recommended next action.
- Saved simulation history within the relevant case.

### Civic resources and application support

- AI-assisted matching against resources stored in Supabase.
- Recommendations include relevance, priority, category, eligibility, and contact information when available.
- Resource interaction tracking with saved, contacted, waiting, completed, and rejected states.
- Follow-up dates, response notes, and application reference tracking.
- Eligibility likelihood guidance, missing-information prompts, and document suggestions.
- Application assistance including checklists, email drafts, phone scripts, request letters, and questions to ask.

### Case timeline

- Chronological case activity history.
- Events connected to assessments, roadmap tasks, and resource interactions.
- User-created timeline notes.
- Paginated timeline loading.

### User experience and reliability

- Public landing, registration, login, and password-recovery pages.
- Responsive desktop sidebar and mobile navigation.
- Loading, error, empty, and unauthorized states.
- Toast notifications and confirmation dialogs.
- Typed API contracts and a shared authenticated API client.
- Request timeout handling and production rate limiting.
- Automated frontend and backend test suites.

## Typical User Journey

1. The user creates an account or signs in through Firebase.
2. The frontend sends the Firebase ID token to the API, which verifies it and synchronizes the user profile.
3. The user starts a new case and completes the guided intake.
4. The API performs safety screening and, when appropriate, runs the AI assessment workflow.
5. The assessment creates a case, risk analysis, priorities, and roadmap tasks.
6. The dashboard highlights the stability score, major risks, urgent priorities, and immediate actions.
7. The user works through roadmap tasks, records notes and outcomes, and tracks contact with support resources.
8. The user can simulate a decision, request eligibility or application guidance, and add timeline notes.
9. Later reassessments show whether stability and risk levels have improved or worsened.

## Technology Stack

### Frontend

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 with App Router |
| UI runtime | React 19 |
| Language | TypeScript with strict checking |
| Styling | Tailwind CSS 4 and CSS design tokens |
| Authentication | Firebase Web SDK |
| Animation | Framer Motion |
| Icons | Lucide React |
| Feedback | React Hot Toast and SweetAlert2 |
| Testing | Vitest, Testing Library, jest-dom, and jsdom |

### Backend

| Area | Technology |
| --- | --- |
| Runtime | Node.js 22 |
| Framework | Express 5 |
| Authentication | Firebase Admin SDK |
| Database | Supabase PostgreSQL |
| AI providers | Google Gemini or Groq |
| Validation | Domain-specific Express validators |
| Testing | Vitest and Supertest |
| Development server | Nodemon |

### Deployment

- Both applications include Vercel configuration.
- The frontend deploys as a Next.js project.
- The Express backend exposes a Vercel serverless entry point through `server/api/index.js`.

## System Architecture

```text
User's browser
  |
  |-- Next.js frontend
  |     |-- Public and protected App Router pages
  |     |-- Firebase Web Authentication
  |     |-- Case workspace and UI state providers
  |     `-- Typed service modules
  |
  |   Authorization: Bearer <Firebase ID token>
  v
Express API
  |-- CORS, JSON limits, authentication, and rate limiting
  |-- Routes and request validators
  |-- Controllers and domain services
  |-- Ownership checks
  |-- AI orchestration and response normalization
  `-- Repository layer
        |
        `-- Supabase PostgreSQL

Express API ---> Firebase Admin (token verification)
Express API ---> Gemini or Groq (AI-assisted workflows)
```

The browser does not receive Supabase service credentials, Firebase Admin credentials, or AI-provider keys. Privileged operations stay in the backend.

## Repository Structure

```text
CivicBridgeAI/
|-- client/                       # Next.js frontend
|   |-- app/                      # Routes, layouts, and global styles
|   |-- assets/                   # Logos and landing images
|   |-- components/               # Feature and shared UI components
|   |-- hooks/                    # Authentication and workspace hooks
|   |-- lib/                      # API client, Firebase, flags, utilities
|   |-- providers/                # Global React providers
|   |-- services/                 # Typed API service modules
|   |-- tests/                    # Frontend tests
|   `-- types/                    # API and domain contracts
|-- server/                       # Express backend
|   |-- api/                      # Vercel serverless entry point
|   |-- scripts/                  # Firebase credential helper
|   |-- src/
|   |   |-- config/               # Firebase, Supabase, AI, features
|   |   |-- controllers/          # HTTP request handlers
|   |   |-- middleware/           # Auth, CORS, and rate limiting
|   |   |-- prompts/              # Structured AI prompts
|   |   |-- repositories/         # Supabase data access
|   |   |-- routes/               # API route definitions
|   |   |-- services/             # Domain and AI workflows
|   |   |-- utils/                # Errors and AI normalization
|   |   `-- validators/           # Request validation
|   |-- supabase/                 # Schema, seed, and migrations
|   `-- tests/                    # Backend tests
|-- .gitignore
`-- README.md
```

## Prerequisites

Install and configure the following before running the complete application:

- Node.js 22.x.
- npm.
- A Firebase project with a registered Web application.
- Firebase Authentication with Email/Password enabled; enable Google for Google sign-in.
- A Firebase Admin service-account credential for the backend.
- A Supabase project.
- A Gemini API key or Groq API key.

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd CivicBridgeAI
```

### 2. Install dependencies

The repository contains separate frontend and backend packages:

```bash
cd client
npm install

cd ../server
npm install
```

Use `npm ci` instead of `npm install` in CI or when an exact lockfile installation is preferred.

### 3. Create environment files

PowerShell:

```powershell
Copy-Item client/.env.example client/.env.local
Copy-Item server/.env.example server/.env
```

Bash:

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

Fill in both files using the sections below.

### 4. Configure Firebase and Supabase

Use the same Firebase project for the web client and Firebase Admin backend. Initialize the Supabase schema and migrations before starting the API.

### 5. Start both applications

Run the backend and frontend in separate terminals. See [Running the Application](#running-the-application).

## Environment Variables

### Frontend: `client/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_web_app_id
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL including `/api`; defaults to `http://localhost:5000/api` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web application ID |

These values are included in the browser bundle. Firebase web configuration identifies the public Firebase project and is not an Admin credential. Never place server secrets in a `NEXT_PUBLIC_*` variable.

### Backend: `server/.env`

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
FIREBASE_ADMIN_CREDENTIAL_BASE64=your_base64_encoded_service_account_json
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Local API port; defaults to `5000` |
| `CLIENT_ORIGIN` | Yes | Allowed frontend origin; comma-separate multiple origins |
| `FIREBASE_ADMIN_CREDENTIAL_BASE64` | Yes | Base64-encoded Firebase Admin service-account JSON |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Privileged server-side Supabase key |
| `AI_PROVIDER` | No | `gemini` by default, or `groq` |
| `GEMINI_API_KEY` | For Gemini | Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model; defaults to `gemini-2.5-flash` |
| `GROQ_API_KEY` | For Groq | Groq API key |
| `GROQ_MODEL` | No | Groq model; defaults to `llama-3.3-70b-versatile` |

Restart the affected development server after changing environment variables.

## Firebase Setup

### Web client

1. Open Firebase Console and select the project.
2. Register a Web application under **Project settings > General**.
3. Copy the web configuration into `client/.env.local`.
4. Enable **Email/Password** under **Authentication > Sign-in method**.
5. Enable **Google** if Google sign-in should be available.
6. Add `localhost` and deployed frontend domains to the authorized-domain list when needed.

### Admin backend

1. Open **Project settings > Service accounts**.
2. Generate a new private key.
3. Keep the downloaded JSON outside version control.
4. For the provided helper, place it temporarily at `server/serviceAccountKey.json`.
5. Encode it from `server/`:

```bash
npm run encode:firebase-admin
```

6. Put the generated Base64 value in `FIREBASE_ADMIN_CREDENTIAL_BASE64`.
7. Remove unnecessary local copies of the credential after configuring the environment.

`serviceAccountKey.json` is ignored by Git, but it is still a highly sensitive credential and must never be shared or committed.

## Supabase Setup

1. Create a Supabase project.
2. Open the project's SQL Editor.
3. Run `server/supabase/schema.sql` to create the base tables.
4. Run the forward `.sql` migration files in numeric order from
   `server/supabase/migrations/`. The two `005` files add different features,
   so apply both before `006`; do not run files ending in `.rollback.sql`.
5. Run `server/supabase/seed.sql` if development resource data is needed.
6. Add the project URL and service-role key to `server/.env`.

The data model includes:

- `users`
- `cases`
- `assessments`
- `risk_assessments`
- `priorities`
- `roadmaps`
- `simulations`
- `resources`
- `resource_interactions`
- `timeline_events`

Rollback scripts are provided for migrations where supported. Review them carefully before use because rollbacks may remove data.

## Running the Application

### Start the backend

```bash
cd server
npm run dev
```

The API starts at [http://localhost:5000](http://localhost:5000), with application endpoints under `/api`.

### Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend's shared API client automatically obtains the current Firebase ID token and sends it as:

```http
Authorization: Bearer <firebase-id-token>
```

## Available Commands

### Frontend commands

Run from `client/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Serve a completed production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run strict TypeScript checking |
| `npm test` | Run frontend tests once |

### Backend commands

Run from `server/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start Express with Nodemon |
| `npm start` | Start the Express server with Node.js |
| `npm test` | Run backend tests once |
| `npm run encode:firebase-admin` | Encode the local service-account JSON for an environment variable |

## API Overview

Base URL for local development:

```text
http://localhost:5000/api
```

All application endpoints require a valid Firebase bearer token.

| Method and path | Purpose |
| --- | --- |
| `GET /users/me` | Return the Firebase identity and synchronized database user |
| `POST /assessments/safety-screening` | Screen intake text for urgent safety concerns |
| `POST /assessments` | Create a case assessment, risks, priorities, and roadmap |
| `GET /dashboard/summary` | Return the active-case and daily-task summary |
| `GET /cases` | List the authenticated user's cases |
| `GET /cases/:caseId` | Return a complete case workspace |
| `PATCH /cases/:caseId` | Update a case title or status |
| `GET /cases/:caseId/reassessments` | List case reassessments |
| `POST /cases/:caseId/reassessments` | Create a reassessment and comparison |
| `GET /cases/:caseId/timeline` | List timeline events |
| `POST /cases/:caseId/timeline-notes` | Add a user timeline note |
| `GET /cases/:caseId/simulations` | List decision simulations |
| `POST /simulations` | Generate and save a decision simulation |
| `GET /priorities/:assessmentId` | Return saved assessment priorities |
| `GET /roadmaps/:assessmentId` | Return saved roadmap tasks |
| `PATCH /roadmaps/:roadmapId` | Update task status, due date, note, or outcome |
| `POST /resources/recommend` | Match civic resources to an assessment |
| `GET /cases/:caseId/resource-interactions` | List tracked resource activity |
| `POST /cases/:caseId/resource-interactions` | Begin tracking a resource |
| `PATCH /resource-interactions/:interactionId` | Update resource-contact progress |
| `POST /cases/:caseId/resources/:resourceId/eligibility` | Estimate eligibility and required information |
| `POST /cases/:caseId/resources/:resourceId/application-assistance` | Generate application-support material |

Successful domain responses generally use this shape:

```json
{
  "success": true,
  "data": {}
}
```

Errors generally include `success: false` and a human-readable `message`. Validation, authentication, ownership, provider, and database failures are handled by the backend.

## Testing

The repository has independent frontend and backend Vitest suites.

### Frontend

```bash
cd client
npm run lint
npm run typecheck
npm test
npm run build
```

Frontend coverage includes route protection, API-client behavior, workspace state, case screens, roadmap interactions, daily actions, progress, navigation, and settings.

### Backend

```bash
cd server
npm test
```

Backend coverage includes authentication middleware, validators, assessment contracts, case linking, ownership, dashboard behavior, roadmap progress, reassessments, eligibility, simulations, AI normalization/execution, and provider configuration.

## Deployment

### Frontend on Vercel

1. Create a Vercel project with `client` as the root directory.
2. Add all frontend environment variables.
3. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL including `/api`.
4. Deploy and add the resulting domain to Firebase Authentication's authorized domains.

### Backend on Vercel

1. Create a separate Vercel project with `server` as the root directory.
2. Add all backend environment variables.
3. Set `CLIENT_ORIGIN` to the deployed frontend origin.
4. Deploy the server and verify its root URL reports that the API is running.

For multiple permitted frontends, `CLIENT_ORIGIN` accepts comma-separated origins. Production requests are rate-limited to 120 requests per minute per client by the in-memory middleware.

Because `NEXT_PUBLIC_*` variables are embedded during the frontend build, changing them requires a new frontend deployment.

## Security and Privacy

- Firebase Admin credentials, Supabase service-role keys, and AI-provider keys belong only on the backend.
- Never commit `.env`, `.env.local`, `serviceAccountKey.json`, or decoded credentials.
- Treat `NEXT_PUBLIC_*` values as visible to every frontend user.
- The backend verifies Firebase tokens and synchronizes users before protected operations.
- Ownership services prevent users from accessing another user's cases and assessment-scoped data.
- The API limits JSON bodies to `250 KB`.
- Production deployments enable request rate limiting.
- Configure exact allowed origins through `CLIENT_ORIGIN`.
- Use HTTPS for frontend and backend deployments.
- Avoid logging authentication tokens or sensitive case descriptions.
- Keep server-side validation and ownership checks even when the frontend already validates input.
- Review AI-generated recommendations before relying on them; outputs can be incomplete or incorrect.

## Troubleshooting

### Firebase sign-in is unavailable

- Confirm every frontend Firebase variable is present in `client/.env.local`.
- Confirm the relevant sign-in providers are enabled.
- Confirm the current hostname is authorized in Firebase.
- Restart the frontend after changing environment variables.

### The backend fails during startup

- Confirm `server/.env` exists.
- Verify `FIREBASE_ADMIN_CREDENTIAL_BASE64` decodes to valid service-account JSON.
- Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Confirm the selected AI provider has a corresponding API key.

### Authentication succeeds but API requests return `401`

- Ensure the frontend and backend use the same Firebase project.
- Confirm the backend's Admin credential is current.
- Confirm the frontend API URL points to the intended server and includes `/api`.

### The browser reports a CORS error

- Set `CLIENT_ORIGIN` to the exact frontend origin, including protocol and port.
- Restart the backend after changing it.
- For multiple origins, separate values with commas and do not add path segments.

### Assessments or AI tools fail

- Confirm `AI_PROVIDER` is `gemini` or `groq`.
- Configure the matching provider API key and model.
- Check provider quotas, model access, and backend logs.
- Verify the Supabase schema and migrations were applied successfully.

### API requests time out

The frontend aborts API requests after 20 seconds. Check AI-provider latency, database connectivity, backend logs, and deployment timeout limits.

## Further Documentation

- [Frontend documentation](client/README.md)
- [Backend documentation](server/README.md)
- [Frontend environment template](client/.env.example)
- [Backend environment template](server/.env.example)
- [Supabase base schema](server/supabase/schema.sql)
- [Supabase seed data](server/supabase/seed.sql)
