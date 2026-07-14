# V-Mentor

Mentor discovery & booking platform — backend API.

Layout:

```
V-Mentor/
├─ src/
│  ├─ shared/       # Shared enums, types and zod DTOs
│  ├─ common/       # Errors, JWT, HTTP helpers
│  ├─ config/       # env, db, cors, logger
│  ├─ db/           # SQL scripts + migrate runner
│  ├─ middleware/   # auth, rbac, validation, errors
│  ├─ modules/      # Feature modules (auth, users)
│  └─ server.ts     # Express entrypoint
├─ package.json
└─ tsconfig.json
```

## Tech stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **API:** Express
- **Database:** PostgreSQL 13+
- **Auth:** JWT (access + refresh) with bcrypt password hashing
- **Validation:** zod

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (includes npm)
- [PostgreSQL](https://www.postgresql.org/) 13 or newer, running locally
- `git`

## Setup

### 1. Clone and install

```bash
git clone https://github.com/sudhan-33/V-Mentor.git
cd V-Mentor
npm install
```

> **Windows / PowerShell:** if you see a "running scripts is disabled" error, either
> run commands as `npm.cmd ...`, or enable scripts once with
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

### 2. Create the database

Create a PostgreSQL database (and a role, if you don't already have one):

```sql
CREATE DATABASE vmentor;
-- optional dedicated role:
CREATE ROLE vmentor LOGIN PASSWORD 'vmentor';
ALTER DATABASE vmentor OWNER TO vmentor;
```

### 3. Configure environment

Create a `.env` file in the **repository root** with the following variables:

```env
# Database
DATABASE_URL=protocol://username:password@host:port/database_name

# API server
API_PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Auth / JWT
JWT_ACCESS_SECRET=<random-secret>
JWT_REFRESH_SECRET=<random-secret>
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
BCRYPT_ROUNDS=10

# Google OAuth (optional / future)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Generate strong JWT secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The API validates these on startup and exits with a clear message if any are missing or invalid.

### 4. Apply the database schema

Runs the committed, idempotent SQL scripts in `src/db/sql`:

```bash
npm run db:migrate
```

### 5. Start the API

```bash
npm run dev:api
```

The API runs at `http://localhost:4000/api/v1` (watch mode — restarts on changes).
Verify with `GET http://localhost:4000/api/v1/health`.

## Scripts (run from the repo root)

| Command | Description |
|---|---|
| `npm run dev` | Start the API in watch mode (alias: `dev:api`) |
| `npm run db:migrate` | Apply the SQL scripts (idempotent) |
| `npm run build` | Compile to `dist/` |
| `npm run start` | Run the compiled server (`dist/server.js`) |
| `npm run typecheck` | Type-check without emitting |

## API endpoints

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/auth/register` | — | Register a student or mentor |
| POST | `/auth/login` | — | Email + password login |
| POST | `/auth/refresh` | — | Rotate refresh token |
| POST | `/auth/logout` | Bearer | Revoke refresh tokens |
| GET | `/auth/me` | Bearer | Current authenticated user |

**Register** body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Passw0rd!",
  "role": "student"
}
```

`role` must be `student` or `mentor` (`admin` is not self-registerable). Successful
`register`/`login`/`refresh` responses return `{ user, tokens: { accessToken, refreshToken } }`.
Send `Authorization: Bearer <accessToken>` on protected routes.

## Response format

```jsonc
// success
{ "success": true, "data": { ... } }

// error
{ "success": false, "error": { "code": "…", "message": "…", "details": {} } }
```
