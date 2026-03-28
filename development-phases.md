# Development Phases

**Product Name:** PG Trust  
**Document Purpose:** Break down the engineering life cycle into structured, actionable phases to transition the platform from concept to Minimum Viable Product (MVP).

---

## Phase 1: Foundation & Setup (Weeks 1-2)

**Goal:** Establish the monorepo architecture, continuous integration (CI) environments, and provision core infrastructure.
- **Frontend:** Initialize Next.js app, configure Tailwind CSS, set up ESLint/Prettier formatting rules.
- **Backend:** Initialize FastAPI application, set up Docker container orchestration for local development.
- **Database:** Provision PostgreSQL database via Neon. Configure SQLAlchemy ORM models and Alembic migration scripts.
- **CI/CD:** Configure GitHub Actions for linting and testing. Connect main branches to Vercel (Frontend) and Render (Backend).

## Phase 2: Core Authentication & Security (Weeks 2-3)

**Goal:** Secure the application borders and deploy the foundational identity matrix.
- **API Construction:** Develop user registration, login, and JWT-issuing endpoints.
- **Frontend Pages:** Build the Landing Page, Login, and Sign Up UI components.
- **Role Assignment:** Implement the role selection logic routing users to either the Tenant Portal or Owner Dashboard post-login.
- **Middleware:** Build backend route protectors enforcing Role-Based Access Control (RBAC).

## Phase 3: Tenant Flow & Property Discovery (Weeks 4-5)

**Goal:** Build out the tenant journey up to finding and requesting a PG.
- **Tenant Profiles:** Create the UI and APIs for tenants to submit personal details and upload Government IDs (connected to S3/Cloudinary).
- **PG Search Engine:** 
  - Backend: Implement filtered paginated queries against the PG Listings table.
  - Frontend: Build the Map/List view for searching PGs with dynamic filter inputs.
- **Booking Hub:** Code the module for tenants to push 'Pending' booking requests to active properties.

## Phase 4: Owner Flow & Property Management (Weeks 5-6)

**Goal:** Enable property owners to generate inventory and react to incoming tenant requests.
- **Property Management:** Develop forms and backend endpoints for owners to create, read, update, and disable PG listings.
- **Tenant Evaluation Interface:** Build the dashboard panel allowing owners to inspect incoming requests and view tenant profiles.
- **Decision Engine:** API endpoints allowing owners to toggle request states from `Pending` to `Accepted` or `Rejected`.

## Phase 5: The Trust Score Engine (Week 7)

**Goal:** Integrate the defining mathematical algorithms into the operational workflow.
- **Feedback Forms:** Construct the post-stay evaluation forms for owners.
- **Engine Logic:** Program the FastAPI service processing the mathematical Simple Moving Average algorithms for Payment, Behavior, Property, and Stability metrics.
- **Real-Time Calculation:** Automate the dynamic translation of historic feedback entries into the persistent `300 - 900` Trust Score rating shown on tenant profiles.

## Phase 6: Polish, Testing & MVP Deployment (Week 8)

**Goal:** Validate all constraints, eradicate bugs, and push the platform to production.
- **Quality Assurance:** Execute Playwright/Cypress end-to-end tests for the standard user journeys.
- **Security Audits:** Validate that JWTs correctly expire and private tenant documents are unexposed to unauthorized users.
- **Performance Tuning:** Optimize Postgres index querying, lazy-load Next.js imagery, and measure response times to maintain API SLA constraints (< 300ms).
- **Go-Live:** Execute production database migrations and fully launch Vercel and Render environments.
