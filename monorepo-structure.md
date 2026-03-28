# Monorepo Structure

**Product Name:** PG Trust  
**Document Purpose:** Define the file and directory architecture for the PG Trust Monorepo, encompassing both the Next.js Frontend and the FastAPI Backend.

---

## 1. High-Level Folder Structure

The repository is divided into two primary applications (`frontend` and `backend`) living side-by-side in a monorepo setup.

```text
pg-trust/
├── frontend/               # Next.js Application
├── backend/                # FastAPI Application
├── database/               # Migration scripts & Seeds
├── docs/                   # All Markdown requirement documents
├── .gitignore
├── README.md
└── docker-compose.yml      # For local orchestration
```

---

## 2. Frontend Directory (Next.js App Router)

The frontend is structured around the App Router paradigm, incorporating feature-based modularity for scalable React components.

```text
frontend/
├── public/                 # Static assets (images, fonts, manifesting)
├── src/
│   ├── app/                # App Router Layouts and Pages
│   │   ├── (auth)/         # Auth Group: Login, Signup
│   │   ├── tenant/         # Tenant Zone: Dashboard, Profile, Search
│   │   ├── owner/          # Owner Zone: Dashboard, Listings, Requests
│   │   ├── layout.tsx      # Root Layout
│   │   └── page.tsx        # Landing Page
│   │
│   ├── components/         # Reusable UI Components
│   │   ├── ui/             # Baseline atoms (Buttons, Inputs, Modals)
│   │   ├── layout/         # Navigation, Headers, Footers
│   │   └── features/       # Complex widgets (Trust Score Gauge)
│   │
│   ├── lib/                # Utilities and API clients
│   │   ├── api.ts          # Axios / Fetch instance configurations
│   │   └── utils.ts        # Helper functions (e.g., date formatting)
│   │
│   ├── hooks/              # Custom React Hooks
│   │   └── useAuth.ts      # Authentication state hook
│   │
│   ├── store/              # Global State (Zustand or Context API)
│   └── types/              # TypeScript Interfaces and Types
│
├── tailwind.config.ts      # Tailwind CSS Theme and Config
├── tsconfig.json           # TypeScript configuration
├── package.json
└── next.config.mjs         # Next.js configurations
```

---

## 3. Backend Directory (FastAPI)

The backend follows a modular, controller-service-repository (or equivalent controller-router) pattern for high maintainability.

```text
backend/
├── app/
│   ├── main.py             # FastAPI App instance and central router
│   ├── core/               # App-wide settings and security
│   │   ├── config.py       # Environment variables loading
│   │   ├── security.py     # Hashing and JWT logic
│   │   └── database.py     # SQLAlchemy Engine and Session maker
│   │
│   ├── models/             # SQLAlchemy ORM Models (Database Tables)
│   │   ├── user.py
│   │   ├── property.py
│   │   └── feedback.py
│   │
│   ├── schemas/            # Pydantic Models (Validation & Serialization)
│   │   ├── user_schema.py
│   │   ├── pg_schema.py
│   │   └── request_schema.py
│   │
│   ├── api/                # Route Controllers
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── tenant.py
│   │   │   ├── owner.py
│   │   │   └── properties.py
│   │
│   ├── services/           # Core Business Logic
│   │   ├── trust_engine.py # Algorithms for Trust Score computation
│   │   └── auth_service.py # Login/Signup orchestration
│   │
│   └── utils/              # Helper functions
│
├── tests/                  # Pytest Unit and Integration tests
├── alembic/                # Database Migrations folder
├── alembic.ini             # Alembic configuration
├── requirements.txt        # Python dependencies
└── Dockerfile              # Containerization instructions
```

---

## 4. Shared Resources & Operations

### 4.1 Database Migrations (`database/`)
While `alembic` resides within the backend, raw schema SQL files, seeds (mock data for development), and ERD diagrams will be tracked here.

### 4.2 Local Development Environment
The root `docker-compose.yml` provides an orchestrated spin-up for the developer:
- A local **PostgreSQL** container.
- The **FastAPI** server container.
- The **Next.js** dev server container.
This ensures parity across developmental machines before deploying to Vercel/Render.
