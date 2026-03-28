# Information Architecture (IA)

**Product Name:** PG Trust  
**Document Purpose:** Define the structural design of the platform, outlining the navigation hierarchy, page structure, and user workflows.

---

## 1. High-Level Sitemap

The platform is divided into three primary zones based on user authentication and chosen role.

### 1.1 Public Zone (Unauthenticated)
- **Home / Landing Page:** Value proposition, How it Works, Testimonials.
- **Login:** Email/Password authentication.
- **Sign Up:** Account creation.
- **Legal/Footer:** Terms of Service, Privacy Policy.

### 1.2 Onboarding Flow
- **Role Selection Screen:** Prompted upon first login. User chooses between "Tenant" or "Owner".

### 1.3 Tenant Portal
- **Dashboard (`/tenant/dashboard`)**
  - Real-time Trust Score Widget (300-900 factor breakdown)
  - Verification Status Alert
  - Quick Actions (Search PGs, View Requests)
- **Profile & Verification (`/tenant/profile`)**
  - Personal Information Form
  - Document Upload (Govt. ID - Aadhaar/PAN)
  - Verification Tracker (Unverified $\rightarrow$ Pending $\rightarrow$ Verified)
- **Search & Discovery (`/tenant/search`)**
  - List/Map view of all available PG accommodations
  - Filters Engine (Location, Budget, Amenities, Gender preference)
  - PG Detail View (`/tenant/pg/[id]`)
- **My Requests (`/tenant/requests`)**
  - Booking Request Status tracking (Pending, Accepted, Rejected)
  - Active Stays

### 1.4 Owner Portal
- **Dashboard (`/owner/dashboard`)**
  - High-level overview of listed properties
  - Pending Tenant Requests counter
- **Property Management (`/owner/properties`)**
  - My Listings (Overview of all PGs)
  - Add New PG (`/owner/properties/new`) - Form: Name, Location, Rent, Amenities, Images
  - Edit PG Details (`/owner/properties/[id]/edit`)
- **Tenant Requests (`/owner/requests`)**
  - Incoming booking requests
  - Tenant Profiler View (Applicant details, Overall Trust Score, Behavioral History)
- **Feedback & Evaluation (`/owner/feedback`)**
  - Active/Past Tenants list
  - Post-stay Evaluation Form (Payment track, Behavior rating, Property upkeep)

---

## 2. Core User Workflows (Navigation Flows)

### 2.1 Tenant PG Booking Flow
`Landing Page` $\rightarrow$ `Sign Up` $\rightarrow$ `Role: Tenant` $\rightarrow$ `Profile Verification` $\rightarrow$ `Search PGs` $\rightarrow$ `View PG Details` $\rightarrow$ `Submit Booking Request` $\rightarrow$ `Wait for Owner Approval` $\rightarrow$ `Dashboard: Request Status Updated`.

### 2.2 Owner Tenant Approval Flow
`Log In` $\rightarrow$ `Dashboard` $\rightarrow$ `Tenant Requests` $\rightarrow$ `Click Request` $\rightarrow$ `Review Tenant Trust Score & History` $\rightarrow$ `Accept / Reject` $\rightarrow$ `Notification sent to Tenant`.

### 2.3 Post-Stay Trust Score Evaluation Flow
`Owner Dashboard` $\rightarrow$ `Feedback Module` $\rightarrow$ `Select Past Tenant` $\rightarrow$ `Fill Evaluation Form (Payment, Behavior, Condition)` $\rightarrow$ `Submit` $\rightarrow$ `System Calculates new Trust Score` $\rightarrow$ `Tenant Trust Score Updated Globally`.

---

## 3. Data Architecture (Key Entities & Relationships)

While strictly a database concern, understanding the entity relationship directly informs the UI structure:

- **User System:** Inherits general credentials. Branches into `Owner` or `Tenant` contexts.
- **Tenant Entity:** Owns exactly one `Trust Score` profile and multiple `Booking Requests`.
- **Owner Entity:** Owns multiple `PG Listings`.
- **PG Listing:** Receives multiple `Booking Requests`.
- **Feedback Entity:** Created by one `Owner` targeting one `Tenant`, mapped to a completed `Booking Request`. Influences the global `Trust Score` model.
