# CivicBridgeAI Backend

Backend API for **CivicBridgeAI**, an AI-assisted civic support platform that analyzes a user's crisis situation, estimates risk, generates priorities, and creates an actionable recovery roadmap.

The server is built with **Node.js**, **Express**, **Firebase Admin**, **Supabase**, and **Google Gemini**.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Supabase Setup](#supabase-setup)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [AI Workflow](#ai-workflow)
- [Database Tables](#database-tables)
- [Error Format](#error-format)
- [Development Notes](#development-notes)

## Features

- Firebase ID token authentication.
- Automatic user synchronization into Supabase.
- Crisis situation analysis using Gemini.
- Risk assessment persistence.
- AI-generated priority recommendations.
- AI-generated recovery roadmap tasks.
- Protected user profile endpoint.
- Layered architecture with routes, controllers, services, repositories, prompts, and config modules.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Auth:** Firebase Admin SDK
- **Database:** Supabase
- **AI Provider:** Google Generative AI SDK
- **Model:** `gemini-2.5-flash`
- **Dev Server:** Nodemon

## Project Structure

```txt
server/
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- config/
|   |   |-- firebase.js
|   |   |-- gemini.js
|   |   `-- supabase.js
|   |-- controllers/
|   |   |-- assessment.controller.js
|   |   `-- roadmap.controller.js
|   |-- middleware/
|   |   `-- auth.middleware.js
|   |-- prompts/
|   |   |-- priority.prompt.js
|   |   |-- roadmap.prompt.js
|   |   |-- simulation.prompt.js
|   |   `-- situation-analysis.prompt.js
|   |-- repositories/
|   |   |-- assessment.repository.js
|   |   |-- priority.repository.js
|   |   |-- risk.repository.js
|   |   |-- roadmap.repository.js
|   |   `-- user.repository.js
|   |-- routes/
|   |   |-- assessment.routes.js
|   |   |-- roadmap.routes.js
|   |   |-- test.routes.js
|   |   `-- user.routes.js
|   `-- services/
|       |-- ai/
|       |   |-- consequence-simulator.service.js
|       |   |-- priority-engine.service.js
|       |   |-- roadmap-generator.service.js
|       |   `-- situation-analysis.service.js
|       |-- assessment.service.js
|       |-- risk.service.js
|       |-- roadmap.service.js
|       `-- user.service.js
|-- .env
|-- package.json
|-- package-lock.json
`-- serviceAccountKey.json
```

## Prerequisites

Before running the backend, make sure you have:

- Node.js installed.
- A Firebase project with Authentication enabled.
- A Firebase service account key.
- A Supabase project.
- A Google Gemini API key.

## Environment Variables

Create a `.env` file inside the `server/` directory.

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Variable Details

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port used by the Express server. Defaults to `5000`. |
| `SUPABASE_URL` | Yes | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key used by the backend. Keep this secret. |
| `GEMINI_API_KEY` | Yes | API key for Google Gemini requests. |

> Do not expose `.env`, `SUPABASE_SERVICE_ROLE_KEY`, or `serviceAccountKey.json` in frontend code or public repositories.

## Firebase Setup

The backend uses Firebase Admin to verify client ID tokens.

1. Open Firebase Console.
2. Go to **Project Settings**.
3. Open **Service Accounts**.
4. Generate a new private key.
5. Save the downloaded JSON file as:

```txt
server/serviceAccountKey.json
```

The Firebase config is loaded from `src/config/firebase.js`.

## Supabase Setup

The backend uses Supabase as the persistence layer. The current repositories expect these tables:

- `users`
- `assessments`
- `risk_assessments`
- `priorities`
- `roadmaps`

The server connects to Supabase through `src/config/supabase.js` using the service role key.

## Installation

From the `server/` directory, install dependencies:

```bash
npm install
```

## Running the Server

### Development

```bash
npm run dev
```

This starts the server with Nodemon.

### Production

```bash
npm start
```

By default, the server runs on:

```txt
http://localhost:5000
```

## Authentication

Protected endpoints require a Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer <firebase_id_token>
```

The auth middleware:

1. Reads the bearer token from the request header.
2. Verifies it with Firebase Admin.
3. Syncs the Firebase user into the Supabase `users` table.
4. Attaches the decoded Firebase user to `req.user`.
5. Attaches the database user record to `req.dbUser`.

If authentication fails, the server returns `401 Unauthorized`.

## API Endpoints

Base URL:

```txt
http://localhost:5000/api
```

### Get Current User

Returns the authenticated Firebase user and the synced Supabase user.

```http
GET /api/users/me
```

#### Headers

```http
Authorization: Bearer <firebase_id_token>
```

#### Success Response

```json
{
  "success": true,
  "firebaseUser": {
    "uid": "firebase-user-id",
    "email": "user@example.com"
  },
  "databaseUser": {
    "id": "supabase-user-id",
    "firebase_uid": "firebase-user-id",
    "email": "user@example.com",
    "name": ""
  }
}
```

### Create Assessment

Analyzes a user's situation, stores the assessment, creates a risk record, generates priorities, and creates a roadmap.

```http
POST /api/assessments
```

#### Headers

```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "situation": "I lost my job, rent is due next week, and I do not have health insurance."
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "assessment-id",
      "user_id": "user-id",
      "situation_text": "I lost my job...",
      "stability_score": 42
    },
    "analysis": {
      "stabilityScore": 42,
      "housingRisk": "HIGH",
      "incomeRisk": "HIGH",
      "healthcareRisk": "MEDIUM",
      "overallRisk": "HIGH",
      "summary": "The user is facing immediate income and housing instability."
    },
    "priorities": {
      "priorities": [
        {
          "order": 1,
          "title": "Secure emergency housing support",
          "reasoning": "Rent is due soon and housing risk is high.",
          "confidence": 95
        }
      ]
    },
    "roadmap": {
      "roadmap": [
        {
          "timeline": "TODAY",
          "task": "Contact local emergency rental assistance programs."
        }
      ]
    }
  }
}
```

### Get Roadmap by Assessment

Returns saved roadmap tasks for a specific assessment.

```http
GET /api/roadmaps/:assessmentId
```

#### Headers

```http
Authorization: Bearer <firebase_id_token>
```

#### URL Parameters

| Parameter | Description |
| --- | --- |
| `assessmentId` | Supabase assessment ID. |

#### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "roadmap-task-id",
      "assessment_id": "assessment-id",
      "timeline": "TODAY",
      "task": "Apply for emergency housing support"
    }
  ]
}
```

## AI Workflow

When a client creates an assessment, the backend runs this pipeline:

1. `assessment.controller.js` receives the authenticated request.
2. `assessment.service.js` sends the situation to Gemini for analysis.
3. `situation-analysis.service.js` uses `situation-analysis.prompt.js`.
4. The assessment is saved to the `assessments` table.
5. Risk data is saved to the `risk_assessments` table.
6. `priority-engine.service.js` generates the top priorities.
7. `roadmap-generator.service.js` generates roadmap tasks.
8. Roadmap tasks are saved to the `roadmaps` table.
9. The full assessment result is returned to the client.

### Expected AI JSON Formats

#### Situation Analysis

```json
{
  "stabilityScore": 50,
  "housingRisk": "LOW|MEDIUM|HIGH",
  "incomeRisk": "LOW|MEDIUM|HIGH",
  "healthcareRisk": "LOW|MEDIUM|HIGH",
  "overallRisk": "LOW|MEDIUM|HIGH",
  "summary": "brief summary"
}
```

#### Priorities

```json
{
  "priorities": [
    {
      "order": 1,
      "title": "Priority title",
      "reasoning": "Why this matters",
      "confidence": 95
    }
  ]
}
```

#### Roadmap

```json
{
  "roadmap": [
    {
      "timeline": "TODAY",
      "task": "Apply for emergency housing support"
    }
  ]
}
```

#### Decision Simulation

The codebase includes a decision simulation service and prompt, although no route currently exposes it.

```json
{
  "housingImpact": "Expected housing effect",
  "incomeImpact": "Expected income effect",
  "healthImpact": "Expected health effect",
  "summary": "Overall consequence summary"
}
```

## Database Tables

The exact schema may vary, but the current code expects at least the following columns.

### `users`

| Column | Purpose |
| --- | --- |
| `id` | Primary user ID used by Supabase. |
| `firebase_uid` | Firebase Authentication UID. |
| `email` | User email from Firebase. |
| `name` | User display name, if available. |

### `assessments`

| Column | Purpose |
| --- | --- |
| `id` | Primary assessment ID. |
| `user_id` | References the Supabase user. |
| `situation_text` | Original situation submitted by the user. |
| `stability_score` | Numeric stability score returned by Gemini. |

### `risk_assessments`

| Column | Purpose |
| --- | --- |
| `id` | Primary risk assessment ID. |
| `assessment_id` | References the assessment. |
| `housing_risk` | Housing risk level. |
| `income_risk` | Income risk level. |
| `healthcare_risk` | Healthcare risk level. |
| `overall_risk` | Overall crisis risk level. |

### `priorities`

| Column | Purpose |
| --- | --- |
| `id` | Primary priority ID. |
| `assessment_id` | Suggested reference to the assessment. |
| `order` | Priority order. |
| `title` | Priority title. |
| `reasoning` | Explanation for the priority. |
| `confidence` | AI confidence score. |

> Note: the current assessment flow generates priorities but does not currently persist them through `priority.repository.js`.

### `roadmaps`

| Column | Purpose |
| --- | --- |
| `id` | Primary roadmap task ID. |
| `assessment_id` | References the assessment. |
| `timeline` | Suggested timeline, such as `TODAY` or `THIS_WEEK`. |
| `task` | Actionable task text. |

## Error Format

Most errors follow this response shape:

```json
{
  "success": false,
  "message": "Error message"
}
```

Common status codes:

| Status | Meaning |
| --- | --- |
| `201` | Assessment created successfully. |
| `200` | Request completed successfully. |
| `401` | Missing, invalid, or expired Firebase token. |
| `500` | Server, database, or AI provider error. |

## Development Notes

- `src/app.js` registers the active API routes.
- `src/server.js` loads environment variables and starts the HTTP server.
- `src/middleware/auth.middleware.js` protects routes and syncs users.
- `src/config/gemini.js` configures the Gemini model.
- AI services strip Markdown code fences before parsing JSON.
- `src/routes/test.routes.js` exists but is not currently mounted in `src/app.js`.
- There is currently no automated test script configured in `package.json`.

## Useful Commands

```bash
npm install
npm run dev
npm start
```

## Security Checklist

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Keep `serviceAccountKey.json` out of Git.
- Validate user input before expanding public usage.
- Add rate limiting before production deployment.
- Add stricter CORS configuration for production domains.
- Consider adding ownership checks so users can only access their own assessments and roadmaps.
