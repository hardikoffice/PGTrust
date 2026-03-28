# Minimum Viable Product (MVP) Technical Document

**Product Name:** PG Trust  
**Document Purpose:** Serve as the definitive, consolidated technical blueprint for the V1 MVP implementation. This outlines the exact technical requirements, constraints, and architecture necessary to launch PG Trust.

---

## 1. Executive Technical Summary

PG Trust is a two-sided marketplace (Tenants & Owners) built around a central mathematical "Trust Score Engine." The system enables PG Owners to vet prospective tenants efficiently while allowing tenants to build a verified reputation.

**MVP Scope Limitation:** The MVP will strictly focus on Identity Verification, PG Discovery, the Booking Request state machine, and the mathematical computation of the Trust Score via generic feedback.

---

## 2. Infrastructure & Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS. Deployed on **Vercel**.
- **Backend:** FastAPI (Python 3.11+), Pydantic for schema validation. Deployed on **Render**.
- **Database:** PostgreSQL (Cloud-managed via **Neon**). ORM: SQLAlchemy.
- **Authentication:** Custom JWT-based stateless authentication. Passwords hashed via Bcrypt.
- **Media Storage:** Cloudinary (or standard AWS S3) for storing Tenant Government IDs and Property Images.

---

## 3. Core Database Entities (Schema Highlights)

1. **`users`**: Base authentication table (`email`, `password_hash`, `role`).
2. **`tenants`**: Extension of users (`trust_score` [Default: 500], `verification_status`).
3. **`owners`**: Extension of users mapping to multiple listings.
4. **`pg_listings`**: Active properties (`location`, `rent`, JSON array of `amenities`).
5. **`requests`**: The booking lifecycle state machine (`PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`).
6. **`feedback`**: The quantitative post-stay metrics mapping an Owner's evaluation of a Tenant.

---

## 4. Key Algorithmic Component: The Trust Engine

The core differentiator of PG Trust is the automated reliability scaling engine.

### 4.1 Evaluation Vectors
When a stay is marked `COMPLETED`, the Owner submits a `feedback` payload rating the tenant on four vectors (0-100 scale):
1. **Payment History:** 40% weight.
2. **Behavior Rating:** 25% weight.
3. **Property Condition:** 20% weight.
4. **Stability:** 15% weight.

### 4.2 Algorithm Steps
1. **Raw Score Output:** Calculate the weighted average of the submitted vectors, generating a base percentile (`S_raw`).
2. **Global Integration:** Append `S_raw` to the Tenant's historical data using a Simple Moving Average (`S_global`).
3. **Scaling:** The baseline metric (`S_global`) dictates the ultimate offset on the 600-point spread.
   `Trust Score = 300 + (S_global * 6)`
4. **Result:** A dynamic integer ranging from **300 (High Risk)** to **900 (Excellent)** appended to the `tenants` schema.

---

## 5. Security Protocols & Constraints

- **Stateless Authorization:** All endpoints outside of `/auth/register` and `/auth/login` require a valid JWT passed in the `Authorization: Bearer` header.
- **Role-Based Access Control (RBAC):** 
  - Tenants cannot access `POST /pg/create` or `PATCH /requests/{id}`.
  - Owners cannot access `POST /tenant/verify` or `POST /requests/create`.
- **SQL Injection Prevention:** Absolute reliance on SQLAlchemy's parameterized queries. No raw SQL concatenations.
- **CORS Mitigation:** The FastAPI backend is hard-restricted to only map and accept origins from the deployed Vercel frontend domain.

---

## 6. MVP Out-of-Scope Definitions
To ensure rapid deployment, these features are forcefully excluded from V1:
- In-App payment gateways (Stripe/Razorpay) for rent collection.
- Automated API-based KYC checks (Admins override document status manually).
- In-System chat interfaces (Owners receive Tenant phone numbers upon Request Acceptance).
- Tenant-assigned ratings against PG Owners.
