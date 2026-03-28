# PG Trust: Deployment Guide (Vercel + Railway + Supabase)

Follow these steps to deploy your platform to the web using the recommended modern PaaS stack.

## Step 1: Database Setup (Supabase)
1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Go to **Project Settings** > **Database**.
3.  Find the **Connection String** section and copy the **URI**. It should look like:
    `postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres`
    *   *Note: Replace `[YOUR-PASSWORD]` with your actual database password.*

## Step 2: Backend Deployment (Railway)
1.  Sign up at [Railway.app](https://railway.app/) and create a **New Project**.
2.  Select **Deploy from GitHub repo** and choose the `PG Trust` repository.
3.  Go to the **Variables** tab and add the following:
    -   `DATABASE_URL`: The URI you copied from Supabase.
    -   `SECRET_KEY`: A long random string (e.g., used for JWT).
    -   `CORS_ORIGINS`: `https://your-app.vercel.app` (You will update this once Vercel gives you an URL).
    -   `ENVIRONMENT`: `production`
4.  Go to the **Settings** tab:
    -   Check that the **Start Command** is: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
    -   Railway will automatically detect your `backend` folder if you set the **Root Directory** to `backend`.

## Step 3: Frontend Deployment (Vercel)
1.  Go to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
2.  Import your GitHub repository.
3.  In the **Project Settings**:
    -   Set **Root Directory** to `frontend`.
    -   The Framework Preset should automatically be **Next.js**.
4.  Expand the **Environment Variables** section and add:
    -   `NEXT_PUBLIC_API_URL`: Your Railway backend URL (e.g., `https://backend-production-xxx.up.railway.app`).
5.  Click **Deploy**.

## Final Step: Link Everything
1.  Once Vercel finishes, copy your production URL (e.g., `https://pg-trust-demo.vercel.app`).
2.  Go back to **Railway** > **Variables** and update `CORS_ORIGINS` with this Vercel URL.
3.  This ensures your backend allows requests specifically from your live website.

---

### Important Maintenance Notes:
-   **Database Auto-Sync**: The backend is configured to automatically create tables on its first startup.
-   **Image Uploads**: By default, images are saved to local disk in the `uploads/` folder. For a permanent production solution, consider using Supabase Storage or AWS S3 in the future, as Railway/Render disks are cleared on every redeploy.
