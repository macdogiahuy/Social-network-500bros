# Deployment Guide: Render and Vercel

This document outlines the configurations and steps required to deploy the **Frontend (Vercel)** and **Backend (Render)** for `500-bros-social-network`.

## Changes Made for Production
1. **Frontend API Resolution:** 
   - `bento-social-next/src/global-config.ts` was updated to read API URLs securely from `NEXT_PUBLIC_API_URL` instead of relying on `window.location.hostname === 'localhost'`. This ensures it connects gracefully to the Render backend when deployed.
   - `bento-social-next/next.config.mjs` was updated with `remotePatterns` to allow optimized image loading from `**.onrender.com`.

2. **Backend Configuration:**
   - The express app binds to `0.0.0.0` and correctly consumes the dynamic `PORT` assigned by Render via `process.env.PORT`.
   - A health check endpoint is natively available at `/ping`.
   - Added `render.yaml` as an automatic Blueprint configuration to deploy the microservice easily.

3. **Deploy Config Files Added:**
   - `render.yaml` - Backend configuration blueprint.
   - `bento-social-next/.env.production.example` - Example Environment variables needed on Vercel.

## 🚀 Steps to Deploy

### 1. Backend (Render)
You can deploy the backend using the Render interface by connecting your GitHub repo:
- **Service Name:** `bento-microservices`
- **Root Directory:** `bento-microservices-express`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`

**Environment Variables Required:**
- `NODE_ENV`: `production`
- `DATABASE_URL`: Add your MySQL connection string (e.g., Aiven, PlanetScale, or a custom VPS database).
- `REDIS_URL`: Add your Redis connection string (e.g., Upstash, or Render Managed Redis).
- `JWT_SECRET_KEY`: Set to a strong random string.
- `CDN_URL`: `https://YOUR-APP-NAME.onrender.com/uploads` (Important: Read Risk note below).
- **Service URLs:** The services communicate via `localhost` internally, so these defaults are safe:
  - `VERIFY_TOKEN_URL`: `http://127.0.0.1:8080/v1/rpc/introspect`
  - `POST_SERVICE_URL`, `USER_SERVICE_URL`, etc.: `http://127.0.0.1:8080/v1`

### 2. Frontend (Vercel)
- Create a new project on Vercel and connect your GitHub repo.
- **Root Directory:** `bento-social-next`
- Vercel automatically detects Next.js build and start commands (`npm run build`, `npm start`).

**Environment Variables Required:**
- `NEXT_PUBLIC_API_URL`: Set to your Render backend URL (e.g., `https://bento-microservices.onrender.com`).

---

## ⚠️ Important Risks & Notes
**Local File Uploads:** 
The backend currently uses local file uploads (storing files in the `/uploads` folder). 
> **Render's Free/Standard Web Services use an Ephemeral File System.** This means that every time the app restarts or redeploys, all uploaded avatars and images will be permanently erased.
_Solution:_ Either attach a Render Persistent Disk to the `/uploads` directory in your Render dashboard, or refactor the codebase to upload directly to S3/Cloudinary.
