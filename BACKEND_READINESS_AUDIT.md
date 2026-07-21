# VINVERSE Publication Website Backend Readiness Audit

Audit date: 2026-06-21  
Project: `vinverse`  
Stack observed: Next.js 16.2.9, React 19.2.4, TypeScript strict mode, Tailwind CSS 4, Zustand, Framer Motion, Sonner

## Verdict

Backend-ready status: **Not fully backend-ready yet.**

The frontend has a strong visual and route foundation, but it is currently closer to a complete frontend prototype than a backend-connected application. You can begin backend planning immediately, but before a real backend can be connected cleanly, the project needs:

1. Production build/type/lint blockers fixed.
2. Mock data replaced with typed backend-facing contracts.
3. Authentication and authorization designed for customer and admin roles.
4. Real persistence for products, books, authors, inquiries, orders, settings, and user profiles.
5. Payment, webhook, inventory, shipping, and email flows defined.
6. Route protection and server-side validation added.

In short: the UI is broad and useful, but the backend boundary is still mostly absent.

## Commands Run

| Check | Result |
| --- | --- |
| `npm.cmd run lint` | Failed with 35 errors and 40 warnings. |
| `npm.cmd run build` | Failed. First run also had restricted Google Fonts network fetches. After network was allowed, it still failed on invalid Lucide exports. |
| `npx.cmd tsc --noEmit --pretty false` | Failed with TypeScript errors. |

## Critical Build And Type Blockers

These should be fixed before treating the frontend as stable enough for backend integration.

1. `src/app/admin/authors/[id]/page.tsx:4` imports `Instagram` and `Twitter` from `lucide-react`, but this installed package version does not export them. Production build fails here.
2. `src/app/admin/products/[id]/page.tsx:171` uses `Plus`, but `Plus` is not imported. TypeScript fails.
3. `src/components/admin/Topbar.tsx:10` uses `pathname.split('/').pop()` in a way TypeScript considers possibly `undefined`.
4. `src/components/ui/product-card-2.tsx` has Framer Motion typing errors around motion props and variants.
5. `src/components/ui/timeline-animation.tsx:46-49` creates a motion component during render, which React lint flags as `react-hooks/static-components`.
6. `src/app/order-success/page.tsx:13` generates an order number using `Math.random()` during render, which React lint flags as an impure render.
7. `src/app/cart/page.tsx:14`, `src/app/checkout/page.tsx:51`, `src/app/order-success/page.tsx:16`, `src/components/layout/Navbar.tsx:19`, and `src/components/ui/liquid-glass-button.tsx:316` synchronously set state inside effects, which React 19 lint flags.
8. Many admin table renderers use `any`, especially `src/app/admin/orders/page.tsx` and `src/components/admin/DataTable.tsx`.
9. Several text nodes fail `react/no-unescaped-entities`.
10. Multiple `<img>` usages should be reviewed for `next/image`, especially store/cart/checkout/product cards.

## Next.js 16 Compatibility Notes

The repo's agent instructions correctly warn that this is not older Next.js. I checked the local Next.js 16 docs before writing this audit.

Relevant findings:

1. App Router pages/layouts are Server Components by default.
2. Client Components should be kept as narrow as possible because `"use client"` pulls imports into the client bundle.
3. Route Handlers live in `app/**/route.ts` and should be used for client-facing backend endpoints when Server Actions are not a good fit.
4. Server Actions are valid for form mutations but must validate auth/authorization internally.
5. Dynamic route params in the local docs are typed as promises, for example `params: Promise<{ slug: string }>`. Current dynamic pages use synchronous `{ params: { id: string } }`. This may become a type/build issue after earlier blockers are fixed.
6. Auth checks should happen close to data access. Do not rely only on layout/client UI restrictions.

## Current Route Inventory

Public routes:

| Route | Current state |
| --- | --- |
| `/` | Complete landing page shell with hero, services, books, authors, store, publish form, contact, nav, footer. Mostly local/static data. |
| `/login` | Static form UI only. Submit button is `type="button"` and does not authenticate. |
| `/register` | Static form UI only. No validation or user creation. |
| `/forgot-password` | Static form UI only. No reset request. |
| `/cart` | Client cart page using Zustand persisted storage. No backend cart or price verification. |
| `/checkout` | Client checkout form with mock auth state, dev login bypass, client validation, simulated API delay, cart clear, redirect. |
| `/order-success` | Client success page with random mock order number. |

Account routes:

| Route | Current state |
| --- | --- |
| `/account` | Hardcoded dashboard for "John". No auth guard. |
| `/account/profile` | Hardcoded profile/address. |
| `/account/profile/edit` | Static editable form. Save button has no action. |
| `/account/orders` | Hardcoded sample orders. |
| `/account/order/[id]` | Hardcoded detail page using URL id only. |

Admin routes:

| Route | Current state |
| --- | --- |
| `/admin` | Static dashboard metrics/recent items. No admin auth guard. |
| `/admin/products` | Hardcoded product table, search/filter UI state only, delete modal closes without deletion. |
| `/admin/products/new` | Rich product form and variant builder, but `handleSave` only waits and redirects. Contains TODO to connect backend. |
| `/admin/products/[id]` | Hardcoded product detail. |
| `/admin/products/[id]/edit` | Rich edit form and variants, but save only waits and redirects. Contains TODO to connect backend. |
| `/admin/books` | Hardcoded book table, QR status, delete modal only. |
| `/admin/books/new` | Static book form, cover upload UI, QR song UI. No persistence. |
| `/admin/books/[id]` | Hardcoded detail page. |
| `/admin/books/[id]/edit` | Static edit form. |
| `/admin/authors` | Hardcoded author table, delete modal only. |
| `/admin/authors/new` | Static author form. |
| `/admin/authors/[id]` | Hardcoded detail page. Currently blocks build due invalid Lucide imports. |
| `/admin/authors/[id]/edit` | Static edit form. |
| `/admin/orders` | Hardcoded order table. |
| `/admin/orders/[id]` | Hardcoded fulfillment/tracking UI. Update/save buttons have no action. |
| `/admin/inquiries` | Hardcoded inquiry table. |
| `/admin/inquiries/[id]` | Hardcoded inquiry detail, mailto reply, status select has no persistence. |
| `/admin/settings` | Static settings form for store, payment, shipping, legal policies. No persistence and fake Razorpay credentials in UI. |

Missing framework routes/files:

1. No `app/**/route.ts` API handlers.
2. No Server Action files.
3. No `proxy.ts` or middleware-style route guard.
4. No `not-found.tsx` or global 404.
5. No `global-error.tsx`.
6. No `robots.ts` or `sitemap.ts`.
7. No DAL, database client, validation schemas, or server-only modules.

## Backend Touchpoints Found

### Static/local data

1. Public books and authors are local arrays in `src/lib/data/books.ts` and `src/lib/data/authors.ts`.
2. Store products are a local `products` array in `src/components/sections/Store.tsx:14`.
3. Admin products, books, authors, inquiries, and orders are local arrays in their page files.
4. Account dashboard, profile, addresses, and orders are hardcoded.
5. Site contact/config values are hardcoded in `src/lib/config.ts`.

### Cart

The cart is a persisted Zustand store in `src/lib/store/useCartStore.ts`.

Current behavior:

1. Cart item id is derived from `name-size`, not a backend product/variant id.
2. Prices, currency, image URL, category, size, and quantity are all client-trusted.
3. Cart persists under `vinverse-cart-storage`.
4. Checkout calculates totals on the client.

Backend implication:

The backend must re-fetch products/variants/prices by id during checkout. Never trust cart price, stock, currency, or product availability from local storage.

### Checkout and payment

`src/app/checkout/page.tsx` is currently simulated:

1. `isLoggedIn` starts as `false`.
2. There is a visible dev bypass button.
3. Client-side form validation exists but no server validation.
4. Payment section says Razorpay, but no Razorpay order creation, checkout script, payment verification, or webhook exists.
5. `handlePlaceOrder` clears cart and redirects after a timeout.

Required backend:

1. Create checkout session or order draft.
2. Reprice cart on server.
3. Validate stock and reserve inventory.
4. Create Razorpay order.
5. Verify payment signature.
6. Handle Razorpay webhooks idempotently.
7. Create final order and order items.
8. Send order confirmation email.
9. Redirect to a real success page by order id.

### Authentication

Login/register/forgot-password pages are currently UI-only:

1. Buttons are `type="button"`.
2. Inputs do not have names consistently.
3. No validation schemas.
4. No session/cookie handling.
5. No customer/admin route guards.
6. Logout only redirects to `/login`.

Required backend:

1. User model with roles.
2. Secure password hashing or external auth provider.
3. Session management via secure HTTP-only cookies or an auth library.
4. Forgot-password token flow.
5. Account verification if required.
6. Admin-only authorization for `/admin`.
7. Customer-only authorization for `/account` and checkout.

### Admin

Admin is visually comprehensive but currently not operational.

Required backend:

1. CRUD for products, variants, inventory, media, status.
2. CRUD for authors and books.
3. QR/song metadata for books.
4. Inquiry management: status, assignment, reply history, archive.
5. Order fulfillment: status transitions, tracking info, cancellation/refund handling.
6. Store settings: contact info, shipping rules, legal policies.
7. Payment settings should not expose secrets to the browser. Razorpay secrets must live only in environment variables/server secrets.

## Suggested Backend Architecture

Because this is a Next.js App Router app, use one of these approaches:

1. Server Actions for form mutations that originate inside React forms.
2. Route Handlers for API endpoints called by client components, payment webhooks, upload signing, and third-party integrations.
3. A server-only Data Access Layer under `src/lib/server/` or `src/server/`.
4. Shared validation schemas under `src/lib/validation/`.
5. DTO functions to return only safe fields to client components.

Recommended initial folders:

```text
src/lib/server/db.ts
src/lib/server/auth.ts
src/lib/server/dal.ts
src/lib/validation/auth.ts
src/lib/validation/product.ts
src/lib/validation/order.ts
src/app/actions/auth.ts
src/app/actions/inquiries.ts
src/app/actions/profile.ts
src/app/api/checkout/create-order/route.ts
src/app/api/checkout/verify-payment/route.ts
src/app/api/webhooks/razorpay/route.ts
src/app/api/uploads/sign/route.ts
```

## Suggested Data Model

Minimum entities:

1. `User`: id, name, email, phone, passwordHash or provider id, role, status, createdAt, updatedAt.
2. `Session` or auth-provider session records.
3. `Address`: id, userId, name, phone, address lines, city, state, pincode, country, isDefault.
4. `Author`: id, slug, name, bio, imageUrl, social links, status.
5. `Book`: id, slug, title, authorId, coverUrl, description, fullDescription, genre, publicationDate, status, hasSong, songTitle, songUrl.
6. `Product`: id, slug, name, category, brand, description, status, price, salePrice, taxRate, images, linkedBookId nullable.
7. `ProductVariantGroup`: id, productId, name.
8. `ProductVariant`: id, productId, group/options, sku, stock, lowStockThreshold, status.
9. `Cart` optional server-side: id, userId or anonymousToken, items.
10. `Order`: id, orderNumber, userId, status, paymentStatus, subtotal, shipping, tax, total, currency, shippingAddress snapshot, createdAt.
11. `OrderItem`: id, orderId, productId, variantId, nameSnapshot, priceSnapshot, quantity, tax.
12. `Payment`: id, orderId, provider, providerOrderId, providerPaymentId, signature, status, rawWebhookId.
13. `Shipment`: id, orderId, courierName, trackingNumber, trackingUrl, status.
14. `Inquiry`: id, name, email, phone, type, message, status, source, createdAt.
15. `StoreSettings`: contact info, currency, shipping charge, free shipping threshold, policy content.
16. `MediaAsset`: id, url, type, alt, ownerType, ownerId.
17. `AuditLog`: actorId, action, entityType, entityId, before/after metadata.

## Suggested API And Action Contract

Auth:

1. `signup(formData)` Server Action.
2. `login(formData)` Server Action.
3. `logout()` Server Action.
4. `requestPasswordReset(formData)` Server Action.
5. `resetPassword(formData)` Server Action.

Public content:

1. `getPublishedBooks()`
2. `getPublishedAuthors()`
3. `getStoreProducts({ category, search })`
4. `submitInquiry(formData)`

Checkout:

1. `POST /api/checkout/create-order`
2. `POST /api/checkout/verify-payment`
3. `POST /api/webhooks/razorpay`

Account:

1. `getCurrentUserProfile()`
2. `updateProfile(formData)`
3. `getMyOrders()`
4. `getMyOrder(orderId)` with ownership check.

Admin:

1. Product CRUD.
2. Book CRUD.
3. Author CRUD.
4. Inquiry list/detail/status update.
5. Order list/detail/status/tracking update.
6. Settings read/update.
7. Upload signing or direct upload endpoint.

## Security Requirements Before Backend Goes Live

1. Add server-side auth checks to every admin route/data access function.
2. Add customer ownership checks to account orders/profile.
3. Validate every mutation with schemas.
4. Use HTTP-only secure cookies for sessions.
5. Keep Razorpay secret server-only. Do not store/display secrets in a client component.
6. Add CSRF-aware design for cookie sessions and server actions.
7. Add rate limiting for login, register, password reset, inquiry submit, checkout, and upload endpoints.
8. Verify Razorpay webhooks with signature and idempotency keys.
9. Recalculate all checkout totals server-side.
10. Reserve or decrement stock transactionally.
11. Add audit logs for admin destructive actions.
12. Sanitize rich policy/content fields before rendering if HTML/Markdown is supported.

## SEO And Production Readiness Gaps

1. Only root metadata and admin metadata exist.
2. No per-page metadata for books/products/authors.
3. No sitemap or robots.
4. No not-found page.
5. No global error boundary.
6. Google Fonts require network at build time. Consider self-hosting fonts if builds happen in restricted environments.
7. Several images use raw `<img>` instead of `next/image`.
8. Placeholder/demo external images are still present.

## Priority Plan

Phase 0: Stabilize frontend build

1. Fix invalid Lucide imports.
2. Import missing icons.
3. Fix TypeScript errors.
4. Fix lint errors that block CI.
5. Re-run `npm.cmd run lint`, `npx.cmd tsc --noEmit --pretty false`, and `npm.cmd run build`.

Phase 1: Backend foundation

1. Choose database and auth approach.
2. Add environment variables.
3. Add DAL and validation schemas.
4. Add user/session/role model.
5. Protect `/admin` and `/account`.

Phase 2: Content and store

1. Replace local books/authors/products arrays with backend reads.
2. Add admin CRUD for products, variants, inventory, books, authors.
3. Add image upload/storage.
4. Add search/filter/pagination server-side.

Phase 3: Checkout

1. Replace dev login bypass.
2. Reprice cart server-side.
3. Add Razorpay create-order and verify-payment endpoints.
4. Add webhook endpoint.
5. Persist orders and payment records.
6. Add email confirmation.

Phase 4: Account and admin operations

1. Real profile/address editing.
2. Real order history/detail pages.
3. Admin order fulfillment and tracking persistence.
4. Inquiry submit/status/reply/archive.
5. Settings persistence and policy pages.

## Final Assessment

You have completed a large amount of frontend surface area: the public website, storefront, cart, checkout UI, account area, and admin dashboard are all represented. That is a good base for backend work.

However, the code is not yet "complete backend-ready" because the backend contract does not exist, the app does not currently pass lint/type/build checks, and most data/action flows are mocks or local state. The best next move is to fix the build blockers first, then start backend implementation with auth, data models, and checkout/payment as the backbone.
