# Product Requirements Document (PRD)

**Product Name:** PG Trust  
**Version:** 2.0 (Detailed Engineering PRD)  
**Type:** Full-Stack Web Application  

---

## 1. Executive Summary
PG Trust is a web-based platform designed to solve trust issues in the current Paying Guest (PG) accommodation ecosystem. In the existing model, landlords lack a standardized way to evaluate potential tenants, and reliable tenants lack a verifiable credibility history when applying. 

To solve this, PG Trust introduces a **Trust Score (300–900)** that acts as a reliability metric for tenants. By recording tenant behavioral data, payment history, and property condition upkeep, PG Trust builds a transparent and accountable ecosystem for both parties.

**Key Value Propositions:**
- Enables landlords to make data-driven, risk-free decisions.
- Allows tenants to build and leverage a verified reputation.
- Significantly reduces fraud, disputes, and conflicts within the rental space.

## 2. Product Goals

### Primary Goals
1. **Verified Tenant Identity:** Create a robust and verified identity system for tenants.
2. **Trust Scoring Engine:** Build a dynamic trust scoring algorithm based on real-world rental interactions.
3. **Discovery & Booking:** Enable seamless PG discovery and streamline booking requests.
4. **Actionable Insights:** Provide landlords with historical data and insights on potential tenants.

### Secondary Goals
1. **Improve Transparency:** Bring standard accountability to the rental ecosystem.
2. **Conflict Surface Reduction:** Reduce disputes between tenants and property owners through documented feedback.
3. **Future Extensibility:** Enable future financial integrations, such as alternative credit scoring systems based on rental history.

## 3. User Personas & Roles

### 3.1 Tenant (Primary User)
- Registers on the platform and verifies their identity.
- Builds a positive Trust Score over time through timely payments and good behavior.
- Searches for PG accommodations, applies, and manages their rental lifecycle.

### 3.2 Owner / Landlord
- Lists their PG properties with relevant details and amenities.
- Reviews incoming tenant requests complete with their Trust Score and rental history.
- Approves/rejects applications and provides post-stay feedback that influences the tenant's Trust Score.

## 4. User Journeys & Flows

**Onboarding & Core Flow:**
1. User visits the landing page.
2. User signs up / logs in to the platform.
3. User selects their primary role (Tenant or Owner).

**Tenant Journey:**
- Completes identity verification (Govt. ID) $\rightarrow$ Receives an initial Trust Score (500) $\rightarrow$ Searches for a PG $\rightarrow$ Sends a booking request $\rightarrow$ Receives acceptance or rejection from the owner.

**Owner Journey:**
- Creates a PG listing $\rightarrow$ Receives requests from prospective tenants $\rightarrow$ Evaluates requests using the tenant's Trust Score + stay history $\rightarrow$ Accepts or rejects the tenant $\rightarrow$ Provides feedback after the tenant's stay concludes.

## 5. Technology Stack & Architecture

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS (Vercel Deployment)
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy ORM, Pydantic (Render Deployment)
- **Database:** PostgreSQL on Neon Cloud
- **Authentication:** JWT-based stateless authentication

## 6. Functional Requirements & Modules

### 6.1 Authentication, Authorization & Role Management
- **Security:** Password hashing via bcrypt, JWT tokens for session management, enforced expiry, HTTPS-only mode.
- **Endpoints:** `/auth/signup`, `/auth/login`, `/user/set-role`.
- **Logic:** Single unified authentication backend with role-based UI and authorization logic.

### 6.2 Tenant Module & Verification
- **Tenant Profile:** Full name, phone number, date of birth, address, Govt. ID proof (file upload), verification status, and dynamic Trust Score.
- **Initial States:** The profile is unverified initially $\rightarrow$ Admin/Automated system reviews uploaded ID $\rightarrow$ Status changes to verified.
- **Dashboard:** Tracks their requests, search PGs, and displays their real-time Trust Score.
- **Future Enhancements:** OCR-based ID validation, automated external API KYC.

### 6.3 Trust Score Engine (Core Component)
The Trust Score engine calculates tenant reliability, scaling linearly from 300 to 900 (defaults to 500 for a new tenant).

**Scoring Components:**
1. **Payment History (40% Weighting):** Tracks rent payment discipline.
2. **Behavior Rating (25% Weighting):** Evaluated and contributed by the landlord.
3. **Property Condition (20% Weighting):** Metrics representing property damage/maintenance.
4. **Stability (15% Weighting):** Longevity in a single stay representing stability.

**Calculation Logic:**
Each component is normalized from 0-100.
Final Score = (0.40 × Payment) + (0.25 × Behavior) + (0.20 × Property) + (0.15 × Stability) -> Scaled to 300-900.

**Interpretation Scale:**
- Excellent: 750–900
- Good: 650–750
- Average: 500–650
- Risky: <500

### 6.4 Owner Module, PG Listing & Request System
- **PG Listings:** Name, Location, Rent, Amenities, Images, Description.
- **Owner Dashboard:** Manages listings, views all tenant requests, examines the tenant's Trust Score + history before accepting or rejecting, and leaves behavioral feedback upon checkout.
- **Request Flow:** When a tenant clicks "Request PG", the request goes into `Pending`. The owner is notified and can flip the state to `Accepted` or `Rejected`.

### 6.5 Search & Discovery System
- Enable tenants to efficiently discover PG properties.
- **Filters:** Location, Budget, Amenities, Gender preference.
- **Performance:** Implements pagination and query-based filtering in PostgreSQL.

## 7. Database Design (Simplified)

**Tables:**
- `users`
- `tenants`
- `owners`
- `pg_listings`
- `requests`
- `feedback`
- `trust_scores`

**Relationships:**
- 1 User $\rightarrow$ 1 Role
- 1 Owner $\rightarrow$ Many PGs
- 1 Tenant $\rightarrow$ Many Requests

## 8. Non-Functional Requirements (NFRs)

### 8.1 UI/UX Guidelines
- Minimalist user interface.
- Theme: White + Yellow.
- Fully responsive layout focusing on mobile users.

### 8.2 Security & Compliance
- Ensure input validation against SQL injections and XSS.
- Restrict file uploads for government ID.
- Role-based Access Control (RBAC) securely governed via standard APIs.

### 8.3 Performance
- API response times must remain < 300ms.
- Lazy load images and optimize Database queries.

## 9. Testing & Success Metrics

**Testing Strategy:**
- Comprehensive unit tests (Backend).
- Dedicated API testing methodologies.
- Complete user flow validation spanning both Owner and Tenant journeys.

**Success KPIs:**
- Number of active verified users on the platform.
- Total PG listings established.
- Request-to-Booking success rate.
- Trust Score reliability metrics and low conflict rates.

## 10. MVP Scope
- Secure Authentication system and unified Role System.
- Basic Tenant verification.
- Active PG listings framework mapped to the search logic.
- Request system matching tenants to owners.
- The fundamental 300-900 numerical Trust Score computation model.

## 11. Roadmap & Future Scope
- AI-driven fraud detection in uploaded KYC documents.
- Payment gateway integrations for in-app rent payment tracking.
- Bi-directional rating systems (allowing tenants to rate property owners).
- Dedicated native mobile applications (iOS/Android) for landlords and tenants.
