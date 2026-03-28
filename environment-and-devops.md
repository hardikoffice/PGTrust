# Environment & DevOps Setup

**Product Name:** PG Trust  
**Document Purpose:** Define the local development setup, environment variable structuring, production deployment strategies, and Continuous Integration/Continuous Deployment (CI/CD) pipelines.

---

## 1. Local Development Environment

We utilize a hybrid containerized approach for local testing to ensure exact parity with production environments without causing dependency hell.

### 1.1 Docker Composability
A root `docker-compose.yml` ties the ecosystem together.
- **Frontend Container:** Runs the Next.js development server (`npm run dev`) on port `3000`.
- **Backend Container:** Runs the FastAPI uvicorn worker (`uvicorn app.main:app --reload`) on port `8000`.
- **Database Container:** Runs a local instance of PostgreSQL `15+` mapped to port `5432`.

### 1.2 Local Spin-up Commands
```bash
# Clone repository
git clone https://github.com/organization/pg-trust.git

# Spin up all containers in attached or detached mode
docker-compose up --build
```

---

## 2. Environment Variables (.env)

Strict management of environment variables separates dev data from production data.

### 2.1 Frontend `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_NODE_ENV=development
```

### 2.2 Backend `.env`
```env
# Server
PORT=8000
ENVIRONMENT=development

# Security
SECRET_KEY=your_super_secret_jwt_signature_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440 # 24 Hours

# Database (Neon / Local)
DATABASE_URL=postgresql://user:password@localhost:5432/pgtrust_dev

# Third-Party (Optional MVP Storage)
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 3. Hosting & Production Deployment

### 3.1 Frontend -> Vercel
- **Connection:** The Next.js `frontend` directory is connected as a project on Vercel linked to the GitHub repository.
- **Trigger:** Automatic deployments trigger on commits merged to the `main` branch.
- **Advantages:** Edge-caching for static PG listings and zero-downtime Server-Side Rendered (SSR) pages.

### 3.2 Backend -> Render
- **Connection:** The `backend` directory is deployed as a "Web Service" using Render's native Python runtime (Python 3.11).
- **Trigger:** Automatic deployment upon `main` branch updates.
- **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
- **Start Command:** `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`
- **Advantages:** Scalable stateless instances behind an automated load balancer.

### 3.3 Database -> Neon (Serverless Postgres)
- **Architecture:** Fully managed, highly-available PostgreSQL instance.
- **Branching:** Neon supports data branching. The `main` branch is connected to production data. A `dev` data branch is provisioned for staging tests.
- **Connection Pooling:** Built-in connection pooling is enabled specifically to handle multiple serverless connections from Render.

---

## 4. Continuous Integration (CI) / Git Workflow

### 4.1 Branching Strategy (Trunk-Based)
- `main` -> Protected branch; represents production.
- `feature/*` -> New features and fixes. Merged into `main` via Pull Requests.

### 4.2 GitHub Actions Pipeline
To maintain code quality, a `.github/workflows/ci.yml` pipeline triggers on every Pull Request to `main`.

**Frontend Checks:**
1. `npm run lint` (ESLint & Prettier)
2. `npm run build` (Ensures the Next.js app builds cleanly)

**Backend Checks:**
1. `flake8` or `ruff` formatting checks.
2. `pytest` executes unit and integration tests against a temporary test database.

*Deployment is inherently handled by Vercel and Render upon successful PR merge.*
