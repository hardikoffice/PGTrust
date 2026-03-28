# PG Trust: Deployment Guide (Vercel + Render + Neon)

Follow these steps to deploy your platform using the Vercel (Frontend), Render (Backend), and Neon (Database) stack.

## Step 1: Database Setup (Neon)
1.  Go to [Neon.tech](https://neon.tech/) and create a new project.
2.  In the **Dashboard**, find your **Connection String**.
3.  Ensure the mode is set to **Pooled** (important for serverless/highly scalable apps).
4.  Copy the URL. It will looks like:
    `postgres://[user]:[password]@[hostname]/neondb?sslmode=require`

## Step 2: Backend Deployment (Render)
1.  Sign up at [Render.com](https://render.com/) and click **New** > **Web Service**.
2.  Connect your GitHub repository.
3.  Set the following:
    -   **Root Directory:** `backend`
    -   **Environment:** `Python`
    -   **Build Command:** `pip install -r requirements.txt`
    -   **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4.  Click **Advanced** and add these **Environment Variables**:
    -   `DATABASE_URL`: Paste your Neon connection string here.
    -   `SECRET_KEY`: A random secure string.
    -   `CORS_ORIGINS`: `https://your-app.vercel.app` (You will update this once Vercel gives you an URL).
    -   `ENVIRONMENT`: `production`

## Step 3: Frontend Deployment (Vercel)
1.  Go to [Vercel](https://vercel.com/) and import your project.
2.  Set **Root Directory** to `frontend`.
3.  Add the **Environment Variable**:
    -   `NEXT_PUBLIC_API_URL`: Your Render Web Service URL (e.g., `https://pg-trust-backend.onrender.com`).
4.  Click **Deploy**.

## Final Step: Link Everything
1.  Once Vercel finishes, copy your production URL (e.g., `https://pg-trust-demo.vercel.app`).
2.  Go back to **Railway** > **Variables** and update `CORS_ORIGINS` with this Vercel URL.
3.  This ensures your backend allows requests specifically from your live website.

---

### Important Maintenance Notes:
-   **Database Auto-Sync**: The backend is configured to automatically create tables on its first startup.
-   **Image Uploads**: By default, images are saved to local disk in the `uploads/` folder. For a permanent production solution, consider using Supabase Storage or AWS S3 in the future, as Railway/Render disks are cleared on every redeploy.
