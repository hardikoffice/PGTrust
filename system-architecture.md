# System Architecture Document

**Product Name:** PG Trust  
**Document Purpose:** Provide a high-level overview of the system architecture, infrastructure design, data flow, and deployment strategy for PG Trust.

---

## 1. High-Level Architecture Overview

PG Trust follows a modern, decoupled Client-Server architecture. The ecosystem is split into three main tiers:
1. **Presentation Tier (Frontend):** A responsive, client-facing web application built with Next.js and Tailwind CSS.
2. **Application Tier (Backend):** A high-performance RESTful API service built with FastAPI (Python) serving core business logic, authentication, and the Trust Score Engine.
3. **Data Tier (Database):** A scalable PostgreSQL database managed via Neon cloud, utilizing SQLAlchemy ORM for data abstraction.

---

## 2. Technology Stack & Infrastructure

- **Frontend Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Backend Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy with Pydantic for data validation and serialization
- **Database:** PostgreSQL (Neon Cloud DB)
- **Authentication:** Stateless JWT (JSON Web Tokens) with Bcrypt password hashing
- **Deployment & Hosting:**
  - Frontend: Vercel (Edge network, CI/CD)
  - Backend: Render (Managed Python runtime environment)
  - Database: Neon (Serverless Postgres)

---

## 3. Core System Components

### 3.1 Frontend Client (Next.js)
- **Routing:** App Router for optimized static and dynamic rendering.
- **State Management:** React Context / Zustand (or similar) for managing global states like user session, role, and UI themes.
- **API Communication:** Axios or native Fetch API configured with request interceptors to automatically attach JWT authorization headers.

### 3.2 Backend API (FastAPI)
The backend is structured modularly:
- **Auth Module:** Handles Registration, Login, and JWT generation/validation.
- **User/Role Module:** Manages role assignment (Tenant vs. Owner) and profile data.
- **Property (PG) Module:** Handles CRUD operations for PG listings and search filtering.
- **Request Module:** Manages the lifecycle of a Tenant's booking request (Pending, Accepted, Rejected).
- **Feedback & Trust Engine:** Ingests owner feedback, executes the Trust Score calculation algorithm, and updates the Tenant's profile score asynchronously.

### 3.3 Relational Database (PostgreSQL / Neon)
The database focuses on strict referential integrity and optimized indexing for search queries.

**Key Entities:**
- `users`: Core identity credentials (id, email, hashed_password, role_id).
- `tenants`: Extends `users`, holding verification status, ID document links, and `trust_score`.
- `owners`: Extends `users`.
- `pg_listings`: Property details linked to `owners`.
- `requests`: Link table between `tenants` and `pg_listings` with status flags.
- `feedback`: Evaluation metrics tied to a completed `request`.

---

## 4. System Data Flow Diagrams

### 4.1 Authentication & Request Flow
1. **Client** sends `POST /auth/login` with Email/Password.
2. **Backend Auth Module** validates credentials against the **Database**.
3. **Backend** generates a `JWT` and returns it to the **Client**.
4. **Client** stores the `JWT` (Local Storage / HttpOnly Cookie).
5. **Client** initiates a protected API call (e.g., `POST /requests/create`) passing the `JWT` in the Authorization header.
6. **Backend** middleware validates the `JWT`, extracts User ID, and processes the request.

### 4.2 Trust Score Update Flow
1. **Owner** submits post-stay feedback via the Frontend.
2. **Backend API** receives the payload (behavior, property condition, payment history).
3. Payload is validated and saved to the `feedback` table.
4. **Trust Engine Service** is triggered (synchronously or via background task).
5. The service fetches historical averages and newly submitted values.
6. Execution of formula: `(0.40 * Payment) + (0.25 * Behavior) + (0.20 * Property) + (0.15 * Stability)`.
7. The Tenant's `trust_score` metric is recalculated and updated in the `tenants` table.

---

## 5. Security Architecture

1. **Authentication:** Stateless JWTs eliminate server-side session sweeping. Tokens have strict Expiry Times (e.g., Access Token 15m, Refresh Token 7d).
2. **Password Security:** All passwords are computationally hashed using Bcrypt before touching the database.
3. **Role-Based Access Control (RBAC):** Backend route decorators enforce permissions (e.g., only an Owner can hit `POST /pg/create`).
4. **Data Protection:** All external traffic is enforced over TLS/HTTPS.
5. **CORS Configuration:** FastAPI backend strictly configures Cross-Origin Resource Sharing to only accept requests from the Vercel-hosted frontend domain.

---

## 6. Scalability & Performance Considerations

- **Serverless PostgreSQL:** Utilizing Neon allows the database layer to automatically scale compute based on demand, eliminating cold-start latency for background reads.
- **CDN Caching:** Next.js deployed on Vercel leverages edge caching for static assets and public landing pages.
- **Stateless Architecture:** The FastAPI backend holds no local state, allowing Render to seamlessly horizontally scale identical instances behind a load balancer as traffic increases.
- **Database Indexing:** B-Tree indexing applied to `Location`, `Rent`, and `Amenities` columns on the `pg_listings` table for sub-300ms search pagination.
