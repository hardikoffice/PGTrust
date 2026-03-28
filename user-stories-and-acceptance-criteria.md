# User Stories and Acceptance Criteria

**Product Name:** PG Trust  
**Document Purpose:** Define detailed user stories and corresponding acceptance criteria based on the Product Requirements Document (PRD).

---

## 1. Authentication & Role Management

### **User Story 1.1: User Sign Up**
**As a** prospective user (Tenant or Owner),  
**I want to** sign up using my email address and password,  
**So that** I can create a secure account on PG Trust.  

**Acceptance Criteria:**
- Given a valid email and strong password, the system must create the user account.
- The system must hash the password using `bcrypt` before storing it.
- If the email is already registered, an appropriate error message is displayed.

### **User Story 1.2: User Login**
**As a** registered user,  
**I want to** log in with my credentials,  
**So that** I can securely access my personalized dashboard.

**Acceptance Criteria:**
- Upon providing valid credentials, the system authenticates the user and generates a stateless JWT token.
- If credentials are invalid, an authentication error is shown.
- The JWT token must have a defined expiration time for security purposes.

### **User Story 1.3: Role Selection**
**As a** logged-in user with no role assigned,  
**I want to** select my primary role (Tenant or Owner),  
**So that** the platform tailors the interface and features to my needs.

**Acceptance Criteria:**
- The user is prompted to select a role on their first login.
- Once selected, the role is stored in the database and immutable for that session/account.
- The UI redirects to either the Tenant Dashboard or Owner Dashboard based on the selection.

---

## 2. Tenant Module

### **User Story 2.1: Identity Verification Upload**
**As a** Tenant,  
**I want to** upload a valid Government ID (Aadhaar or PAN) and fill in my profile details,  
**So that** the platform can verify my identity and unlock PG requests.

**Acceptance Criteria:**
- The tenant can upload images or PDFs of their ID documents securely.
- The profile verification status changes from "Unverified" to "Pending" upon successful submission.
- Once verified by the system/admin, the status changes to "Verified", allowing the tenant to send booking requests.

### **User Story 2.2: Discover & Search PGs**
**As a** verified Tenant,  
**I want to** search for PG accommodations by location, budget, amenities, and gender preferences,  
**So that** I can find a property that perfectly fits my needs.

**Acceptance Criteria:**
- The search functionality returns results matching the selected filters.
- Results are paginated for optimal performance.
- Each search result displays essential details: PG Name, rent, primary amenities, and thumbnail image.

### **User Story 2.3: PG Booking Request**
**As a** verified Tenant,  
**I want to** send a booking request to a specific PG Owner,  
**So that** I can secure my accommodation.

**Acceptance Criteria:**
- The tenant can only send a request if their identity is "Verified".
- Upon clicking "Request PG", the request state is stored as `Pending`.
- The corresponding PG Owner receives an immediate notification of the new request.
- The tenant can track the status (`Pending`, `Accepted`, `Rejected`) from their dashboard.

---

## 3. Owner Module

### **User Story 3.1: PG Listing Creation**
**As an** Owner,  
**I want to** create a PG listing with details like name, location, rent, amenities, and photos,  
**So that** tenants can discover and request to rent my property.

**Acceptance Criteria:**
- The owner can enter property details via a structured form.
- The form requires mandatory fields: Name, Location, and Rent logic.
- The listing becomes active and searchable immediately upon successful submission.

### **User Story 3.2: Tenant Evaluation & Request Processing**
**As an** Owner,  
**I want to** view incoming tenant requests along with their Trust Score and past stay history,  
**So that** I can make a data-driven decision on whether to accept or reject them.

**Acceptance Criteria:**
- The owner's dashboard displays a list of `Pending` requests.
- Selecting a request displays the requesting tenant's full profile, current **Trust Score**, and any past owner feedback.
- The owner can click "Accept" or "Reject".
- The system updates the request status and notifies the respective tenant.

### **User Story 3.3: Post-Stay Tenant Feedback**
**As an** Owner,  
**I want to** submit a feedback form evaluating a tenant’s payment history, behavior, and property upkeep after their stay,  
**So that** the platform can accurately update their Trust Score for future landlords.

**Acceptance Criteria:**
- The owner can leave feedback for any tenant who has completed a stay at their listed PG.
- The form collects discrete inputs: Behavior Rating, Property Condition metric, and Payment Record status.
- Submitting the feedback triggers the back-end **Trust Score Update Engine**.

---

## 4. Trust Score Engine (System Features)

### **User Story 4.1: Trust Score Calculation & Initialization**
**As the** Trust System,  
**I want to** compute and maintain a numerical score between 300 and 900 for every tenant,  
**So that** the platform has a standardized metric for reliability.

**Acceptance Criteria:**
- Every newly verified tenant is assigned a default neutral score of **500**.
- The score dynamically recalculates using the formula:  
  `Final Score = (0.40 × Payment) + (0.25 × Behavior) + (0.20 × Property) + (0.15 × Stability)`
- The score is updated instantly when new payment data or owner feedback is ingested into the database.
