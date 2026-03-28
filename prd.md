## PRODUCT REQUIREMENTS DOCUMENT (PRD)

Product Name: PG Trust
Version: 2.0 (Detailed Engineering PRD)
Type: Full-Stack Web Application

---

1. PRODUCT OVERVIEW

---

PG Trust is a web-based platform designed to solve trust issues in the PG (Paying Guest) accommodation ecosystem.

Currently, landlords have no standardized way to evaluate tenants, and tenants also lack credibility when applying for PGs. PG Trust introduces a "Trust Score" (range: 300–900) which acts like a reliability score for tenants.

The system records tenant behavior, payment history, and property condition to build a transparent ecosystem.

Key Value Proposition:

* Landlords can make data-driven decisions
* Tenants build a verified reputation
* Reduces fraud and conflicts

---

2. PRODUCT GOALS

---

Primary Goals:

1. Create a verified tenant identity system
2. Build a dynamic trust scoring engine
3. Enable easy PG discovery and booking requests
4. Provide landlords with actionable tenant insights

Secondary Goals:

1. Improve rental ecosystem transparency
2. Reduce disputes between tenants and owners
3. Enable future financial integrations (credit systems)

---

3. USER TYPES AND ROLES

---

3.1 Tenant (Primary User)

* Registers and verifies identity
* Builds a trust score over time
* Searches and applies for PG accommodations

3.2 Owner (Landlord)

* Lists PG properties
* Reviews tenant requests
* Provides feedback after tenant stays

---

4. USER FLOW (HIGH LEVEL)

---

Step 1: User visits landing page
Step 2: User signs up / logs in
Step 3: User selects role (Tenant / Owner)

Tenant Flow:
→ Completes verification
→ Gets initial trust score
→ Searches PG
→ Sends request
→ Gets accepted/rejected

Owner Flow:
→ Lists PG
→ Receives tenant requests
→ Views trust score + history
→ Accepts/rejects tenant
→ Gives feedback after stay

---

5. TECH STACK (MANDATORY)

---

Frontend:

* Next.js (App Router for scalability)
* TypeScript (type safety)
* Tailwind CSS (fast UI development)

Backend:

* FastAPI (high-performance APIs)
* Python 3.11+
* SQLAlchemy ORM
* Pydantic (data validation)

Database:

* PostgreSQL (Neon cloud DB)

Authentication:

* JWT-based authentication (stateless)

Deployment:

* Frontend → Vercel
* Backend → Render
* DB → Neon

---

6. AUTHENTICATION & AUTHORIZATION

---

Purpose:
Secure access control and user identity management.

Features:

* Email/password signup
* Login system
* JWT token generation
* Role-based authorization

Flow:

1. User signs up → account created
2. User logs in → receives JWT tokens
3. Tokens used in all protected API requests

Endpoints:

POST /auth/signup
Creates a new user account

POST /auth/login
Authenticates user and returns tokens

Security Considerations:

* Password must be hashed using bcrypt
* JWT expiry should be enforced
* Use HTTPS only

---

7. ROLE MANAGEMENT

---

Purpose:
Allow users to choose their role after login.

Why:
Same user system supports both tenants and owners.

Endpoint:
POST /user/set-role

Logic:

* Role is stored in database
* UI changes based on role

---

8. TENANT MODULE (DETAILED)

---

8.1 Tenant Profile

Purpose:
Store all personal and verification data.

Fields:

* Full name
* Phone number
* Date of birth
* Address
* Government ID proof (file upload)
* Verification status
* Trust score

Behavior:

* Initially unverified
* After document upload → pending verification
* After approval → verified

---

8.2 Tenant Verification

Purpose:
Ensure authenticity of tenant identity.

Process:

1. User uploads ID (Aadhaar/PAN)
2. File stored securely
3. Admin or automated system verifies
4. Status updated

Future Scope:

* OCR-based ID validation
* API-based KYC verification

---

8.3 Tenant Dashboard

Features:

* View trust score
* View verification status
* Search PGs
* Track requests

---

9. TRUST SCORE ENGINE (CORE SYSTEM)

---

Purpose:
Quantify tenant reliability numerically.

Score Range:

* Minimum: 300 (high risk)
* Maximum: 900 (highly trusted)

Default Score:

* 500 (neutral)

---

9.1 Scoring Components

1. Payment History (Weight: 40%)

* Tracks rent payment behavior
* Most important factor

2. Behavior Rating (Weight: 25%)

* Given by landlords
* Reflects discipline and conduct

3. Property Condition (Weight: 20%)

* Measures damage to property

4. Stability (Weight: 15%)

* Measures how long tenant stays in one PG

---

9.2 Calculation Logic

Each component is normalized to 0–100.

Final Score =
(0.40 × Payment) +
(0.25 × Behavior) +
(0.20 × Property) +
(0.15 × Stability)

Then scaled to 300–900.

---

9.3 Score Update Trigger

Score is recalculated when:

* Feedback is submitted
* Payment record updated
* Tenant completes a stay

---

9.4 Score Interpretation

750–900 → Excellent
650–750 → Good
500–650 → Average
<500 → Risky

---

10. OWNER MODULE (DETAILED)

---

10.1 PG Listing

Purpose:
Allow landlords to publish PGs.

Fields:

* Name
* Location
* Rent
* Amenities
* Images
* Description

---

10.2 Owner Dashboard

Features:

* Manage listings
* View tenant requests
* Accept/reject tenants
* Submit feedback

---

10.3 Tenant Evaluation

Owner can see:

* Trust score
* Past behavior
* Stay history

---

11. SEARCH & DISCOVERY

---

Purpose:
Help tenants find suitable PGs.

Filters:

* Location
* Budget
* Amenities
* Gender preference

Implementation:

* Query-based filtering
* Pagination for performance

---

12. REQUEST SYSTEM

---

Purpose:
Enable tenant-owner interaction.

Flow:

1. Tenant clicks "Request PG"
2. Request stored in DB
3. Owner receives notification
4. Owner accepts/rejects

Statuses:

* Pending
* Accepted
* Rejected

---

13. FEEDBACK SYSTEM

---

Purpose:
Collect data for trust score.

Given by:

* Owner after tenant stay

Inputs:

* Behavior rating
* Property condition
* Payment status

Effect:
Triggers trust score update

---

14. DATABASE DESIGN (SIMPLIFIED)

---

Tables:

* users
* tenants
* owners
* pg_listings
* requests
* feedback
* trust_scores

Relationships:

* One user → one role
* One owner → many PGs
* One tenant → many requests

---

15. FRONTEND DESIGN

---

Pages:

* Landing page
* Login/signup
* Role selection
* Tenant dashboard
* Owner dashboard

Design Guidelines:

* Minimal UI
* White + Yellow theme
* Responsive layout

---

16. SECURITY

---

* Password hashing
* JWT authentication
* Role-based access control
* Input validation
* File upload restrictions

---

17. PERFORMANCE

---

* API response time < 300ms
* Use pagination
* Optimize DB queries
* Lazy loading images

---

18. MVP SCOPE

---

Must include:

* Authentication
* Role system
* Tenant verification
* PG listing
* Request system
* Basic trust score

---

19. FUTURE ENHANCEMENTS

---

* AI-based fraud detection
* Payment gateway integration
* Owner rating system
* Mobile application

---

20. TESTING STRATEGY

---

* Unit tests (backend)
* API testing
* UI testing
* User flow validation

---

21. SUCCESS METRICS

---

* Number of verified users
* PG listings created
* Request success rate
* Trust score reliability

---
---

"You are a senior full-stack engineer. Build this system step by step using modular architecture. Follow best practices, ensure scalability, and write production-ready code."

---

## END OF DOCUMENT
