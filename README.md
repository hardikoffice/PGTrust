# PG Trust (Local MVP)

This workspace contains a runnable local MVP based on the provided specification docs.

## Prerequisites
- Node.js (already used by the frontend)
- Python 3.11+ (you have Python installed)
- (Optional) Docker Desktop if you want Postgres containers

## Run locally (no Docker required)

### Backend (FastAPI)

```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Notes:
- By default the backend uses **SQLite** at `backend/pgtrust.db` so it runs immediately.
- If you want Postgres instead, set `DATABASE_URL` (see `backend/.env.example`).

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Run locally (Docker + Postgres)

```bash
docker compose up --build
```

Then open:
- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`
- Backend docs: `http://localhost:8000/docs`

## MVP flow to test
- Sign up -> Login -> choose role
- **Tenant**
  - Go to Profile -> upload ID -> (dev) "Mark verified"
  - Search PGs -> Request
  - Requests page shows status
- **Owner**
  - Create a property
  - Requests -> accept (2s friction) -> mark completed
  - Feedback -> submit ratings -> updates tenant trust score

## Config
- Frontend API base: `frontend/.env.local.example`
- Backend envs: `backend/.env.example`

