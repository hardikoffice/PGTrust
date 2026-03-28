# Database Schema Design

**Product Name:** PG Trust  
**Document Purpose:** Define the entity-relationship model and database schema for the PostgreSQL database (Neon Cloud).

---

## 1. Entity-Relationship (ER) Overview

The core entities revolve around **Users** (Tenants and Owners), **Properties** (PG Listings), **Requests** (Bookings), and **Feedback** (for Trust Score evaluation).

- **`users`**: Base table for all platform authentication operations.
- **`tenants`** & **`owners`**: Specialized user tables holding role-specific data linked via foreign keys to `users.id`.
- **`pg_listings`**: Properties managed by owners.
- **`requests`**: A mapping table connecting a tenant's booking application to a specific PG listing.
- **`feedback`**: Data submitted by an owner against a tenant's completed stay.
- **`trust_scores`**: Can either be a column in `tenants` or a discrete table for historical tracking. For robustness, we will track the current score in `tenants` and historical evaluations in `feedback`.

---

## 2. Table Definitions

### 2.1 `users`
**Purpose:** Handles authentication, generic profile data, and role assignments.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique user identifier |
| `email` | VARCHAR(255) | Unique, Not Null | User's email address |
| `password_hash` | VARCHAR(255) | Not Null | Bcrypt hashed password |
| `full_name` | VARCHAR(100) | Not Null | User's full legal name |
| `phone_number` | VARCHAR(20) | Unique | Contact number |
| `role` | ENUM | Not Null | `TENANT`, `OWNER`, `UNASSIGNED` |
| `created_at` | TIMESTAMP | Default NOW() | Account creation date |
| `updated_at` | TIMESTAMP | Default NOW() | Account update date |

### 2.2 `tenants`
**Purpose:** Stores tenant-specific information and Trust Score.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | PK, FK(users.id) | Links to the main user account |
| `date_of_birth` | DATE | | Tenant's DOB |
| `address` | TEXT | | Permanent address |
| `id_proof_url` | VARCHAR(500) | | URL to uploaded Gov ID (S3/Cloudinary) |
| `verification_status` | ENUM | Default 'UNVERIFIED'| `UNVERIFIED`, `PENDING`, `VERIFIED` |
| `trust_score` | INTEGER | Default 500 | Current trust score (300-900) |

### 2.3 `owners`
**Purpose:** Stores owner-specific information (can be expanded later for business details).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | PK, FK(users.id) | Links to the main user account |
| `business_name` | VARCHAR(150) | | Optional legal business name |
| `verified_owner` | BOOLEAN | Default FALSE | Verified status of the owner |

### 2.4 `pg_listings`
**Purpose:** Stores details about the PG properties listed by owners.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique property identifier |
| `owner_id` | UUID | FK(owners.user_id) | The owner of the property |
| `name` | VARCHAR(150) | Not Null | Name of the PG |
| `location` | VARCHAR(255) | Not Null, Indexed | General address/area |
| `rent` | DECIMAL(10,2) | Not Null, Indexed | Monthly rent amount |
| `amenities` | JSONB | | Array of amenities (WiFi, AC, Meals) |
| `images` | JSONB | | Array of image URLs |
| `description` | TEXT | | Detailed property description |
| `gender_preference` | ENUM | | `MALE`, `FEMALE`, `ANY` |
| `created_at` | TIMESTAMP | Default NOW() | Listing creation date |
| `active` | BOOLEAN | Default TRUE | Is the listing currently available? |

### 2.5 `requests`
**Purpose:** Manages the lifecycle of a tenant applying for a PG.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique request identifier |
| `tenant_id` | UUID | FK(tenants.user_id) | The tenant making the request |
| `pg_id` | UUID | FK(pg_listings.id) | The PG being requested |
| `status` | ENUM | Default 'PENDING' | `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED` |
| `request_date` | TIMESTAMP | Default NOW() | When the request was sent |
| `decision_date` | TIMESTAMP | | When the owner accepted/rejected |
| `move_in_date` | DATE | Not Null | Proposed move-in date |
| `move_out_date` | DATE | | Actual move-out date (set when status=COMPLETED) |

### 2.6 `feedback`
**Purpose:** Captures post-stay evaluation from the owner to recalculate the tenant's Trust Score.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique feedback identifier |
| `request_id` | UUID | FK(requests.id), UNQ| Ensures 1 feedback per completed stay |
| `owner_id` | UUID | FK(owners.user_id) | The owner providing feedback |
| `tenant_id` | UUID | FK(tenants.user_id) | The tenant being evaluated |
| `payment_rating` | INTEGER | Check (0-100) | 40% Weight: Rent payment discipline |
| `behavior_rating` | INTEGER | Check (0-100) | 25% Weight: Tenant conduct |
| `property_rating` | INTEGER | Check (0-100) | 20% Weight: Condition of property |
| `stability_rating` | INTEGER | Check (0-100) | 15% Weight: Based on length of stay |
| `comments` | TEXT | | Optional written review |
| `created_at` | TIMESTAMP | Default NOW() | Date feedback was submitted |

---

## 3. Key Relationships & Indexing Strategy

- **`tenants`** and **`owners`** maintain a strictly **1-to-1** relationship with `users` via the PK/FK `user_id`. This prevents ID duplication.
- **`pg_listings.owner_id`** represents a **1-to-Many** relationship (1 Owner -> N Listings).
- **`requests`** acts as a complex join table enabling a **Many-to-Many** relationship between `tenants` and `pg_listings`, encapsulating the stay workflow.
- **`feedback`** maintains a **1-to-1** relationship with `requests` (only one review per completed booking). 
- To boost search performance, **B-Tree indexes** should be applied on `pg_listings.location` and `pg_listings.rent`. 
- GIN indexes can be applied to `pg_listings.amenities` (JSONB) to allow rapid filtering.
