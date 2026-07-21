# Frontend ↔ Backend Contract Audit

This document provides a comprehensive audit of the Phase 2 frontend form payloads against the actual backend API schemas (`.schemas.ts`).

---

## 1. Authentication (Login / Register)

### 1.1 Login
*   **Frontend Payload** (from `AuthProvider.tsx`): `{ email: string, password: string }`
*   **Backend Schema** (`loginSchema`): `{ email: string, password: string }`
*   **Status**: ✅ **Exact Match**.

### 1.2 Register
*   **Frontend Payload** (from `authService.register`): `{ name: string, email: string, password: string }`
*   **Backend Schema** (`registerSchema`): `{ name: string, email: string, password: string, phone?: string }`
*   **Status**: ✅ **Match** (Phone is optional on the backend).

---

## 2. Account Profile & Addresses

### 2.1 Account Profile
*   **Frontend Payload**: N/A (Currently a UI mock with no `onSubmit` payload generation).
*   **Backend Schema** (`updateProfileSchema`): `{ name?: string, phone?: string }`
*   **Status**: ⚠️ **Pending Implementation**. The UI fields ("Full Name", "Phone Number") match the backend expectations, but the API integration logic needs to be written.

### 2.2 Addresses
*   **Frontend Payload**: N/A (UI mock inside `EditProfilePage`).
*   **Frontend UI Fields**: Address Line 1, Address Line 2, City, State, Pincode, Country.
*   **Backend Schema** (`createAddressSchema`): `{ fullName, phone, line1, line2, city, state, postalCode, country, isDefault }`
*   **Mismatches / Missing Fields**:
    *   **Missing in UI**: The backend requires `fullName` and `phone` specific to the address, which the UI does not provide (it only collects them globally for the profile). The UI also lacks an `isDefault` toggle.
    *   **Naming Mismatch**: UI label is "Pincode", but the backend expects `postalCode`.

---

## 3. Product Management (Creation & Editing)

### 3.1 Product Base Details
*   **Frontend Payload** (`products/new/page.tsx`):
    ```json
    {
      "product": { "name", "category", "sku", "status", "shortDescription", "description" },
      "pricing": { "price", "originalPrice", "currency", "tax" },
      "inventory": { "trackStock", "stock", "lowStockThreshold", "outOfStockBehaviour", "sizes" }
    }
    ```
*   **Backend Schema** (`createProductSchema`):
    ```json
    {
      "name", "sku", "brand", "category", "status", "price", "salePrice", "tax",
      "trackStock", "globalStock", "lowStockThreshold", "outOfStockBehavior",
      "primaryImage", "galleryImages", "sizes"
    }
    ```
*   **Critical Mismatches**:
    1.  **Structure**: Frontend uses a deeply nested object (`product`, `pricing`, `inventory`), while the backend expects a completely **flat** structure.
    2.  **Category Enum**: Frontend sends Title Case strings (`"Books"`, `"Apparel"`), but the backend strictly expects uppercase native enums (`"BOOK"`, `"APPAREL"`).
    3.  **Pricing Mapping**: 
        *   Frontend calculates `price` as the *sale price* and `originalPrice` as the *regular price*. 
        *   Backend expects `price` (regular) and `salePrice` (discounted).
    4.  **Field Naming & Spelling**:
        *   Frontend `inventory.stock` ↔ Backend `globalStock`.
        *   Frontend `inventory.outOfStockBehaviour` (British) ↔ Backend `outOfStockBehavior` (American).
        *   Frontend `pricing.currency` ↔ Not accepted by backend.
    5.  **Missing Description Fields**: The frontend sends `shortDescription` and `description` in the root payload, but the backend `baseProductSchema` **completely lacks description fields** (these only exist inside the `book` sub-schema). Apparel/Merch products cannot currently save descriptions!

### 3.2 Book Creation via Product
*   **Frontend Payload**:
    ```json
    "book": {
      "genre", "publicationDate", "enableQR", "qrSongTitle", "qrSongUrl"
    }
    ```
*   **Backend Schema** (`bookInputSchema`):
    ```json
    "book": {
      "title", "genre", "publicationDate", "shortDescription", "fullDescription",
      "coverUrl", "qrEnabled", "qrSongTitle", "qrSongUrl", "author": { ... }
    }
    ```
*   **Critical Mismatches**:
    1.  **Missing Title**: Backend `bookInputSchema` strictly requires a `title`, but the frontend does not send one (assuming the product `name` covers it).
    2.  **Author Nesting**: Frontend sends `author` and `book` as siblings in the root payload. The backend expects the `author` object to be **nested inside** the `book` object.
    3.  **Descriptions**: Backend expects `shortDescription` and `fullDescription` inside the `book` object, while frontend puts them in the root `product` object.
    4.  **Field Naming**: Frontend `enableQR` ↔ Backend `qrEnabled`.

### 3.3 Author Creation via Product
*   **Frontend Payload**: `{ "name", "shortBio", "fullBio", "status" }`
*   **Backend Schema** (`authorInputSchema`): `{ "name", "shortBio", "fullBio", "avatarUrl" }`
*   **Mismatches**:
    1.  Frontend sends an author `status` which the backend schema does not accept.
    2.  Frontend must place this object inside the `book` payload, not at the root.

---

## 4. Inquiries

*   **Frontend Payload**: N/A (Currently a UI display list, no submission form implemented).
*   **Backend Schema** (`createInquirySchema`): `{ type, name, email, phone, subject, message, metadata }`
*   **Status**: ⚠️ **Pending Implementation**. No current contract violations, but frontend form needs to adhere to this schema when built.

---

## 5. Store Settings

*   **Frontend Payload**: N/A (UI mock with hardcoded defaults, no `handleSave` payload construction).
*   **Backend Schema** (`updateSettingsSchema`): `{ storeName, supportEmail, supportPhone, currency, taxEnabled, defaultTaxRate, shippingEnabled, metadata }`
*   **Mismatches / Missing Fields**:
    *   The frontend UI correctly aligns with `storeName`, `supportEmail`, `supportPhone`, and `currency`.
    *   **Unmapped Fields**: The UI contains inputs for "Default Delivery Charge", "Free Shipping Threshold", and "Delivery Notes", but the backend schema does not have dedicated columns for these. They must be stored as a JSON object inside the `metadata` field.

---

## Summary of Action Items for Integration

To guarantee seamless Phase 3 integration, the following frontend adjustments are strictly required:
1.  **Flatten the Product Payload**: Remove `product`, `pricing`, and `inventory` wrappers.
2.  **Fix Product Field Names**: Map `stock` to `globalStock`, `outOfStockBehaviour` to `outOfStockBehavior`, and correctly map `price`/`salePrice`.
3.  **Align Book & Author Structure**: Move `author` inside the `book` object. Copy the product `name` to `book.title`. Move descriptions inside the `book` object.
4.  **Address Form Updates**: Add `fullName` and `phone` inputs to the Address creation UI.
5.  **Settings Metadata**: Ensure all shipping pricing variables in the Settings page are packaged into the `metadata` JSON object before submission.
