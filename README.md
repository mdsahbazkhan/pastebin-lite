# Pastebin-Lite

Pastebin-Lite is a simple Pastebin-like web application where users can create text pastes and share a link to view them.  
Each paste can optionally expire after a time limit (TTL) or after a specified number of views.

This project is built to work correctly on serverless platforms and is designed to pass automated grading tests.

---

## 🚀 Features

- Create a text paste
- Generate a shareable URL
- View a paste via an HTML page
- Fetch paste via API (JSON)
- Optional constraints:
  - Time-based expiry (TTL)
  - View-count limit
- Deterministic time support for automated testing
- Persistent storage compatible with serverless environments

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Runtime:** Node.js
- **Database:** Redis (Upstash)
- **Deployment:** Vercel

---

## 📦 Persistence Layer

This application uses **Upstash Redis** as the persistence layer.

### Why Redis?

- Works reliably in serverless environments
- Persists data across requests and cold starts
- Supports atomic operations (view counters)
- Simple and efficient TTL handling
- No database migrations required

Each paste is stored as a Redis hash containing:
- Paste content
- Creation timestamp
- Expiry timestamp (if any)
- Maximum allowed views (if any)
- Current view count

---

## 📡 API Routes

### Health Check

GET /api/healthz


**Response**
```json
{
  "ok": true
}
```

Create a Paste
```POST /api/pastes```

Request Body

```{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```
Rules

content is required and must be a non-empty string

ttl_seconds is optional and must be an integer ≥ 1

max_views is optional and must be an integer ≥ 1
Response

```{
  "id": "string",
  "url": "https://your-app.vercel.app/p/<id>"
}
```

Invalid input returns a 4xx status code with a JSON error response.

Fetch a Paste (API)
GET /api/pastes/:id


Response

```{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

remaining_views is null if views are unlimited

expires_at is null if no TTL is set

If the paste does not exist, is expired, or has exceeded its view limit, the API returns HTTP 404.

View a Paste (HTML)
```GET /p/:id```


Returns an HTML page containing the paste content

Paste content is rendered safely (no script execution)

Returns HTTP 404 if the paste is unavailable

⏱ Deterministic Time Testing

For automated testing, deterministic expiry logic is supported.

If the following environment variable is set:

```TEST_MODE=1```


Then the request header:

```x-test-now-ms: <milliseconds since epoch>```


is treated as the current time only for expiry logic.

If the header is absent, the real system time is used.

▶️ Running Locally
1. Install dependencies
```npm install```

2. Create .env.local
```UPSTASH_REDIS_REST_URL=<your_upstash_redis_url>
UPSTASH_REDIS_REST_TOKEN=<your_upstash_redis_token>
TEST_MODE=0
```

3. Start the development server
```npm run dev```


Open in your browser:

```http://localhost:3000```

🌐 Deployment

This application is designed to be deployed on Vercel.

Deployment Steps

Push the repository to GitHub

Import the project into Vercel

Add environment variables in the Vercel dashboard

Deploy the application

No manual database migrations or shell access are required.

🧠 Design Decisions

Redis is used instead of in-memory storage to ensure persistence in serverless environments

View counts are incremented atomically to avoid race conditions

All unavailable cases consistently return HTTP 404

Paste content is rendered safely without executing scripts

URLs are generated dynamically without hardcoded hosts
