# Code & Bourbon

The frontend website for http://codeandbourbon.com

My hope is that I only start the site and then help out with updates, it should be owned by our community. I'm also hoping to run it completely free so it's currently hosted with Github Pages and the backend runs on Render.com and the database is inside a free MongoDB cluster.

### Development

The site is made in React and built with Vite (TanStack Start). If you'd like to collaborate, please create a branch, push your changes, and open a merge request.

### Setup

1. Install dependencies with **pnpm**: `pnpm install` (requires [pnpm](https://pnpm.io/)).
2. Copy `.env.example` to `.env` and fill in the values. Required env vars:
   - `VITE_APP_URL` – App base URL (e.g. `http://localhost:3000` in dev).
   - `BETTER_AUTH_SECRET` – At least 32 characters (e.g. `openssl rand -base64 32`).
   - `BETTER_AUTH_URL` – Same as `VITE_APP_URL` in dev; production URL in prod.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – From Google Cloud Console (OAuth 2.0).
   - `MONGO_URI` – MongoDB connection string.
3. In Google Cloud Console, set the redirect URI to `{BETTER_AUTH_URL}/api/auth/callback/google`.
4. Run `pnpm dev`. The app will throw on startup if required server env vars are missing.
