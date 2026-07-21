# Frontend Authentication Integration Guide

This document outlines the frontend authentication architecture implemented for VINVERSE and the required backend integration points for Phase 3.

## Architecture Overview

The frontend authentication system uses a React Context (`AuthProvider`) to manage the global authentication state. It provides secure role-based routing, local token storage, and dedicated user interfaces for both Customers and Administrators.

### Key Components

1. **`AuthProvider` (`src/components/auth/AuthProvider.tsx`)**
   * Manages global `user`, `isAuthenticated`, and `isLoading` states.
   * Provides `login`, `register`, and `logout` functions.
   * Automatically attempts to restore session on mount via `checkAuth()`.

2. **`ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`)**
   * Wraps sensitive layouts/pages.
   * Redirects unauthenticated users to the appropriate login page.
   * Enforces role-based access (`ADMIN` vs `CUSTOMER`).

3. **`authService` (`src/lib/auth/authService.ts`)**
   * The API service layer containing standard `fetch` signatures.
   * Currently acts as a structural placeholder pointing to `/api/v1/auth/*`.

4. **`TokenStorage` (`src/lib/auth/token.ts`)**
   * Abstraction for storing/retrieving the JWT from `localStorage`.
   * Future-proofed if token strategy changes (e.g., to cookies).

## Routing & Flow

### Customer Flow
* **Registration:** `POST /api/v1/auth/register` via `/register`
* **Login:** `POST /api/v1/auth/login` via `/login`
* **Redirection:** Upon successful authentication as a `CUSTOMER`, the user is redirected to `/account`.
* **Protection:** Any access to `/account/*` without a valid session redirects to `/login`.

### Admin Flow
* **Login:** `POST /api/v1/auth/login` via the dedicated `/admin/login` secure portal.
* **Redirection:** Upon successful authentication as an `ADMIN`, the user is redirected to `/admin`.
* **Protection:** Any access to `/admin/*` without a valid session redirects to `/admin/login`. No dashboard UI is rendered prior to authentication.

## Backend Requirements (Phase 3)

The backend must implement the following endpoints to activate the frontend UI:

### 1. `POST /api/v1/auth/login`
**Payload:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response (200 OK):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "ADMIN" // or "CUSTOMER"
  }
}
```

### 2. `POST /api/v1/auth/register`
**Payload:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response (201 Created):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

### 3. `GET /api/v1/auth/me`
**Headers:**
`Authorization: Bearer <jwt_token>`

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

## Next Steps for Integration
1. Remove backend proxy logic or ensure standard CORS if backend is hosted separately.
2. The `authService.ts` currently throws errors since the API is unreachable. Once the backend endpoints are live, the frontend forms will automatically function without UI changes.
3. Replace local storage token strategy with HTTP-only cookies if required by backend security policies.
