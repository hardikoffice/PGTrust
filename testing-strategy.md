# Comprehensive Testing Strategy

**Product Name:** PG Trust  
**Document Purpose:** Outline the testing methodologies, frameworks, and QA processes required to ensure the reliability and security of the PG Trust platform before MVP launch.

---

## 1. Testing Pyramid Overview

The testing scope is divided into three tiers:
1. **Unit Testing:** Validating isolated functions (Backend Algorithms, Frontend Hooks).
2. **Integration & API Testing:** Validating that the DB, Backend, and Frontend interact correctly.
3. **End-to-End (E2E) Testing:** Validating complete user journeys from a browser perspective.

---

## 2. Backend Testing (FastAPI & PostgreSQL)

**Framework:** `pytest` + `pytest-asyncio` + `httpx`

### 2.1 Unit Tests
- **Trust Score Engine:** Supply mocked historic `feedback` data to the `trust_engine` service and assert that the mathematical outputs correctly map to the 300-900 scale. Edge cases (Zero history, 100/100 history, severe penalty history) must be fully covered.
- **Model Validation:** Ensure Pydantic schemas correctly reject invalid data (e.g., negative rent limits, invalid email structures).

### 2.2 Integration (API) Tests
- **Database Seeding:** Utilize an in-memory SQLite database or a temporary isolated PostgreSQL instance for testing.
- **Testing Endpoints:**
  - Create a test user via `/auth/signup`.
  - Authenticate the test user via `/auth/login` to secure a test JWT.
  - Attempt to hit an Owner-only route (`/pg/create`) with a Tenant JWT and assert a `403 Forbidden` response (RBAC verification).
  - Test the full CRUD lifecycle of a PG listing.

---

## 3. Frontend Testing (Next.js)

**Frameworks:** `Jest` + `React Testing Library`

### 3.1 Component & Unit Tests
- **UI Components:** Render baseline atoms (Buttons, Custom Form Inputs) and assert they correctly display passed props.
- **Trust Score Gauge Widget:** Ensure the visual component changes color (Red/Yellow/Green) appropriately based on the numeric value prop passed to it.
- **Custom Hooks:** Test authentication hooks targeting local storage for JWTs.

---

## 4. End-to-End (E2E) Testing

**Framework:** `Playwright` (preferred) or `Cypress`.

### 4.1 Critical Test Flows
These exact user journeys must pass via automated Chromium/Webkit/Firefox browsers before any deployment to production:
1. **Tenant Booking Flow:**
   - Go to Homepage -> Sign Up -> Select 'Tenant'.
   - Navigate to 'Search PGs' -> Select PG -> Click 'Request'.
   - Assert popup confirmation and status mapped to `Pending`.
2. **Owner Acceptance & Feedback Flow:**
   - Log in as 'Owner'.
   - View pending request -> Click 'Accept'.
   - Fast forward (mocked time/state) to post-stay -> Submit Feedback Form.
   - Assert success banner appears.

---

## 5. Security & QA Constraints

### 5.1 Security Testing
- **JWT Integrity:** Tamper with a JWT payload manually and attempt a request; assert that FastAPI immediately drops it.
- **XSS & SQLi:** Input basic HTML scripts and SQL injection strings into PG Creation and Feedback forms to ensure they are adequately sanitized by Pydantic and SQLAlchemy parameterization.

### 5.2 Performance Benchmarking
- Utilize specific endpoints requiring high database read availability (e.g., `GET /pg/search`). Run rapid sequential requests and verify responses stay < 300ms. 

---

## 6. Continuous Deployment QA
- The `main` branch will absolutely fail to build on Vercel or deploy to Render if the `.github/workflows/ci.yml` pipeline (housing `pytest` and `npm run lint/test`) does not return a clean passing state.
