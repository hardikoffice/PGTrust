# API Contracts

**Product Name:** PG Trust  
**Document Purpose:** Define the RESTful API structure, request/response payloads, and status codes for communication between the Next.js Frontend and FastAPI Backend.

---

## Base URL
`https://api.pgtrust.com/v1`

## Common Headers
- `Content-Type: application/json`
- `Authorization: Bearer <JWT_TOKEN>` (Required for protected routes)

---

## 1. Authentication Module

### 1.1 Sign Up
**POST** `/auth/signup`  
Registers a new user in the system.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "phone_number": "+919876543210"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully.",
  "user_id": "uuid-1234"
}
```

### 1.2 Login
**POST** `/auth/login`  
Authenticates the user and returns an access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "token_type": "bearer",
  "role": "TENANT" 
}
```

---

## 2. User & Role Management

### 2.1 Set Role
**POST** `/user/set-role`  
Assigns a core role to a newly authenticated user.

**Request Body:**
```json
{
  "role": "TENANT" // or "OWNER"
}
```

**Response (200 OK):**
```json
{
  "message": "Role updated successfully.",
  "role": "TENANT"
}
```

### 2.2 Get User Profile
**GET** `/user/profile`  
Retrieves the profile of the currently authenticated user.

**Response (200 OK):**
```json
{
  "id": "uuid-1234",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "TENANT",
  "tenant_data": {
    "verification_status": "VERIFIED",
    "trust_score": 750
  }
}
```

---

## 3. Tenant Operations

### 3.1 Upload Verification ID
**POST** `/tenant/verify`  
Uploads KYC document for verification. *(Uses `multipart/form-data`)*

**Request Payload:**
- `file`: (Binary File - PDF/JPG/PNG)
- `document_type`: "AADHAAR"

**Response (202 Accepted):**
```json
{
  "message": "Document uploaded successfully. Verification pending.",
  "status": "PENDING"
}
```

---

## 4. Property (PG) Module

### 4.1 Create PG Listing (Owner Only)
**POST** `/pg/create`

**Request Body:**
```json
{
  "name": "Sunrise PG",
  "location": "Koramangala, Bangalore",
  "rent": 12000.00,
  "amenities": ["WiFi", "AC", "Laundry"],
  "gender_preference": "MALE",
  "description": "Premium PG with high speed internet.",
  "images": ["url1.jpg", "url2.jpg"]
}
```

**Response (201 Created):**
```json
{
  "message": "PG listed successfully.",
  "pg_id": "uuid-pg-5678"
}
```

### 4.2 Search PGs (Public / Tenant)
**GET** `/pg/search`

**Query Parameters:**
- `location` (string)
- `max_rent` (integer)
- `gender` (string)
- `page` (integer, default: 1)

**Response (200 OK):**
```json
{
  "page": 1,
  "total_results": 45,
  "data": [
    {
      "id": "uuid-pg-5678",
      "name": "Sunrise PG",
      "location": "Koramangala, Bangalore",
      "rent": 12000.00,
      "amenities": ["WiFi", "AC"],
      "image": "url1.jpg"
    }
  ]
}
```

---

## 5. Booking Requests

### 5.1 Create Booking Request (Tenant Only)
**POST** `/requests/create`

**Request Body:**
```json
{
  "pg_id": "uuid-pg-5678",
  "move_in_date": "2024-06-01"
}
```

**Response (201 Created):**
```json
{
  "message": "Request sent successfully.",
  "request_id": "uuid-req-9012",
  "status": "PENDING"
}
```

### 5.2 Update Request Status (Owner Only)
**PATCH** `/requests/{request_id}/status`

**Request Body:**
```json
{
  "status": "ACCEPTED" // or "REJECTED"
}
```

**Response (200 OK):**
```json
{
  "message": "Request status updated successfully."
}
```

---

## 6. Feedback & Trust Engine

### 6.1 Submit Post-Stay Feedback (Owner Only)
**POST** `/feedback/submit`  
Submits tenant evaluation and triggers Trust Score recalculation.

**Request Body:**
```json
{
  "request_id": "uuid-req-9012",
  "payment_rating": 90,
  "behavior_rating": 85,
  "property_rating": 80,
  "stability_rating": 100,
  "comments": "Great tenant, paid on time."
}
```

**Response (200 OK):**
```json
{
  "message": "Feedback submitted successfully. Trust Score updated.",
  "new_trust_score": 810
}
```
