Pastebin-Lite

A simple Pastebin-like web application where users can create text pastes and share a link to view them.
Pastes can optionally expire after a time limit (TTL) or after a certain number of views.

This project is built to be compatible with serverless platforms and pass automated grading tests.

🚀 Features

Create a text paste

Generate a shareable URL

View a paste via HTML page

Fetch paste via API (JSON)

Optional constraints:

Time-based expiry (TTL)

View-count limit

Deterministic time support for testing

Persistent storage (serverless-safe)

🛠 Tech Stack

Framework: Next.js (App Router)

Runtime: Node.js

Database: Redis (Upstash)

Deployment: Vercel

📦 Persistence Layer

This application uses Upstash Redis as the persistence layer.

Why Redis?

Works reliably in serverless environments

Survives across requests and cold starts

Supports atomic counters (view limits)

Simple TTL handling

No migrations required

Each paste is stored as a Redis hash with metadata such as content, expiry time, and view count.

📡 API Routes
Health Check
GET /api/healthz


Response:

{ "ok": true }

Create a Paste
POST /api/pastes


Request body:

{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}


Response:

{
  "id": "string",
  "url": "https://your-app.vercel.app/p/<id>"
}

Fetch a Paste (API)
GET /api/pastes/:id


Response:

{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}


Unavailable pastes return HTTP 404.

View a Paste (HTML)
GET /p/:id


Returns HTML page with paste content

Paste content is rendered safely

Returns 404 if paste is unavailable

⏱ Deterministic Time Testing

If the environment variable below is set:

TEST_MODE=1


Then the request header:

x-test-now-ms: <milliseconds since epoch>


is used as the current time only for expiry logic.
If the header is absent, system time is used.

▶️ Running Locally
1. Install dependencies
npm install

2. Create .env.local
UPSTASH_REDIS_REST_URL=<your_upstash_redis_url>
UPSTASH_REDIS_REST_TOKEN=<your_upstash_redis_token>
TEST_MODE=0

3. Start the dev server
npm run dev


Open:

http://localhost:3000

🌐 Deployment

The app is designed to be deployed on Vercel.

Steps:

Push the repository to GitHub

Import the project in Vercel

Add environment variables in Vercel dashboard

Deploy

No manual migrations or shell access required.

🧠 Design Decisions

Redis used instead of in-memory storage to support serverless execution

View counts are incremented atomically to prevent race conditions

All unavailable cases return HTTP 404 for consistency

Paste content is rendered without executing scripts for safety

URLs are generated dynamically without hardcoded hosts
