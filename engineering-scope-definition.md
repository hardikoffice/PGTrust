# Engineering Scope Definition

**Product Name:** PG Trust  
**Document Purpose:** Clearly delineate what features and technical requirements are considered "In-Scope" for the Minimum Viable Product (MVP) phase, and what is explicitly "Out-of-Scope" (deferred to future versions).

---

## 1. Project Context & Objectives
The goal of the MVP is to deliver a functional, end-to-end Trust Engine for the PG ecosystem that allows owners to list properties, tenants to verify their identity and apply, and the platform to reliably compute Trust Scores based on post-stay feedback.

**Target Delivery:** Version 1.0 (MVP)

---

## 2. In-Scope: Frontend (Next.js Application)

### 2.1 Public & Onboarding
- **Landing Page:** Static marketing page explaining PG Trust.
- **Authentication Forms:** Email/Password based login and registration UI.
- **Role Selector:** UI for choosing "Tenant" or "Owner" post-signup.

### 2.2 Tenant Portal
- **Dashboard:** Display current Trust Score and Verification Status.
- **Profile Management:** Form to update personal details and upload Government ID (Aadhaar/PAN) as an image/PDF.
- **PG Discovery:** Search interface with basic filters (Location, Budget).
- **Booking Hub:** UI to send booking requests and track request status.

### 2.3 Owner Portal
- **Dashboard:** Overview of properties and pending tenant requests.
- **Property Management:** Forms to add, edit, and disable PG listings (with image upload capability).
- **Tenant Evaluation:** Interface to overview an applying tenant's Trust Score and past feedback.
- **Feedback Mechanism:** Post-stay form evaluating Payment, Behavior, and Property Condition.

---

## 3. In-Scope: Backend & Core Services (FastAPI)

### 3.1 Authentication & Security
- Standard Email/Password registration.
- JWT token generation and validation middleware.
- Role-Based Access Control (RBAC) ensuring tenants cannot access owner endpoints.

### 3.2 Data Entities & APIs
- **Users API:** CRUD operations for dynamic profiles.
- **Properties API:** Endpoints to manage and query PG listings.
- **Requests API:** Manage the state machine of a booking (Pending -> Accepted/Rejected -> Completed).

### 3.3 The Trust Engine
- Real-time calculation service triggering upon feedback submission.
- Simple Moving Average (SMA) logic merging historical feedback.
- Arithmetic scaling from the 0-100 base to the final 300-900 Trust Score.

---

## 4. In-Scope: Infrastructure & DevOps

- **Database:** Fully provisioned PostgreSQL (Neon Cloud) executing the defined schema.
- **Migrations:** Alembic configured for version-controlled database schema iterations.
- **Hosting / CI/CD:**
  - Frontend auto-deployments via Vercel (main branch tracking).
  - Backend auto-deployments via Render (main branch tracking).
- **Storage:** Basic AWS S3 or Cloudinary bucket setup for storing User IDs and PG Images safely.

---

## 5. Out-of-Scope for MVP (Deferred to v2.0+)

The following features will **not** be built during the initial MVP engineering phase to maintain velocity:

1. **In-App Payments:** Processing rent payments directly through the platform (Stripe/Razorpay integrations).
2. **AI KYC Verification:** Automatic OCR-driven validation of Government IDs. Verification will be assumed manual for v1.
3. **In-App Chat:** Real-time messaging between Owners and Tenants.
4. **Tenant-to-Owner Feedback:** Allowing tenants to rate the PG/Owner (Bi-directional rating system).
5. **Mobile Native Applications:** iOS or Android specific builds. The web application will serve mobile users via responsive design.
6. **Advanced Analytics Dashboard:** Deep demographic reporting for PG Owners.

---

## 6. Assumptions & Constraints

- The system assumes all uploaded Government IDs are physically reviewed by an admin or owner.
- MVP will support English language exclusively.
- Search queries will rely on standard PostgreSQL B-Tree indexing; complex Elasticsearch implementations are deferred.
