# UI/UX Requirements

**Product Name:** PG Trust  
**Document Purpose:** Define the design language, component behavior, accessibility standards, and overall user experience logic for the PG Trust web application.

---

## 1. Design Language & Theme

**Theme:** Clean, modern, minimalist utility.
- **Primary Colors:** 
  - **Yellow/Gold:** Used to highlight the Trust Score identity and primary call-to-action buttons (signifying caution, trust, and premium vetting).
  - **White/Off-White:** Backgrounds for clean content readability.
  - **Slate Grid/Charcoal:** Text and secondary elements.
- **Typography:** 
  - Inter or Roboto (Sans-Serif) for high legibility on mobile devices.
- **Component Styling:**
  - Soft rounded corners (e.g., `rounded-lg` in Tailwind).
  - Subtle shadows on active cards to establish a Z-index hierarchy without clutter.

---

## 2. Core Layout Logic

The application will follow a **Mobile-First Responsive Design** paradigm, as the majority of Tenants and Owners will access the platform via their phones.

### 2.1 Navigation Structure
- **Mobile:** Bottom navigation bar containing icons for [Home/Dashboard], [Search], [Requests], and [Profile].
- **Desktop:** Left-aligned collapsible sidebar or top navigation header holding the same core routing links.

### 2.2 Global Dashboard Container
- All authenticated pages (Dashboard, Search, Requests) should be wrapped in a consistent authenticated layout shell preventing UI jumpiness between page loads.

---

## 3. Crucial Component UX Definition

### 3.1 The Trust Score Widget
The central defining element of the platform.
- **Visuals:** A semicircular or circular gauge component.
- **Color Mapping:**
  - 300 - 499: Red (High Risk)
  - 500 - 649: Yellow/Amber (Average)
  - 650 - 749: Light Green (Good)
  - 750 - 900: Dark Green/Gold (Excellent)
- **Animation:** The gauge should fluidly animate from `0` to the actual score on page load to grant a dynamic, "calculated" feel.

### 3.2 Property Listing Density
- **Search Page (Tenants):** Listings should be displayed as infinite-scroll cards. Each card must prominently feature an image carousel, PG Name, Rent Price, and 3 primary amenity icons.
- **Owner Dashboard (Owners):** Listings should be displayed in a compact table or list format maximizing operational efficiency (showing active tenants, pending requests).

### 3.3 PG Request/Acceptance State
- **Tenant Output:** Requests should be clearly color-coded (`PENDING` = Gray, `ACCEPTED` = Green, `REJECTED` = Red).
- **Owner Input:** The acceptance modal must force the Owner to review the Tenant's Trust Score before the "Accept" button enables itself (a 2-second deliberate friction point ensures they actually checked the score).

### 3.4 Feedback Submission Form
- Since Owners are busy, the post-stay feedback form must be frictionless.
- Use distinct **Slider components (0-100)** or **5-Star clicking systems** mapping to the respective factors (Payment, Behavior, Property, Stability) rather than text inputs.

---

## 4. Interaction States & Transitions

1. **Loading States:** Implementation of gray animated skeleton loaders (`animate-pulse` in Tailwind) instead of generic spinners for complex data pages (like PG Search or Dashboard loading).
2. **Empty States:** Clear, illustrative empty states with a direct Call-To-Action (e.g., "You haven't requested any PGs yet. [Click here to start searching]").
3. **Destructive Actions:** Any deletion (e.g., deleting a PG listing from the owner portal) requires a red confirmation modal with a typed confirmation to prevent accidental data loss.
4. **Toast Notifications:** Ephemeral toast notifications in the bottom-right (Desktop) or top behavior (Mobile) for immediate feedback on form submissions (e.g., "Feedback Submitted", "Request Sent").

---

## 5. Accessibility (a11y) Constraints

- **Contrast Ratios:** All text must meet WCAG AA standards (4.5:1 contrast against backgrounds).
- **Semantics:** Strict usage of semantic HTML (`<main>`, `<nav>`, `<article>`) for screen reader compatibility.
- **Focus States:** Every interactable element (buttons, inputs) must display a clear focus ring (using Tailwind's `focus:ring` utility) for keyboard navigation.
