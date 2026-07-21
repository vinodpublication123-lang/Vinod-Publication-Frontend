# VINVERSE Publication & Ecommerce Platform - Backend Handover

## SECTION 1: PROJECT OVERVIEW

**Project Purpose:** VINVERSE is a premium literary and e-commerce platform dedicated to publishing books, selling related merchandise, and managing authors. The platform serves as a unified destination for readers to explore literature and a storefront for exclusive apparel.

**Business Goals:**
- Establish a high-end, cinematic web presence for the VINVERSE publication brand.
- Seamlessly integrate an e-commerce storefront for books and premium apparel.
- Streamline the process for new authors to submit publishing inquiries.
- Provide a robust, self-hosted admin dashboard for complete inventory, order, and author management without relying on third-party SaaS limits.

**Publication Website Objectives:**
- Showcase the cinematic and immersive aesthetic of the publishing house.
- Feature published authors and interactive book galleries.
- Capture leads through a polished manuscript submission process.

**Ecommerce Objectives:**
- Create a persistent cart and seamless checkout experience.
- Support a flattened product structure utilizing a unified "Sizes" inventory model.
- Display premium product imagery with clear pricing and stock indicators.

**Customer Flows:**
- **Browsing:** Customers explore the cinematic landing page, viewing authors, book excerpts, and the storefront.
- **Shopping:** Customers add merchandise or apparel sizes to a persistent cart and complete checkout.
- **Account:** Customers log in to track orders, view digital products, and manage their profile.
- **Inquiries:** Authors submit their manuscripts through a structured "Publish With Us" form.

**Admin Flows:**
- **Inventory:** Admins manage flattened size variants, stock tracking, and multi-tier pricing.
- **Orders:** Admins process orders, update fulfillment statuses, and inject tracking links.
- **Curation:** Admins manage Author profiles, Book metadata, and promotional QR song links.

---

## SECTION 2: CURRENT FRONTEND STATUS

**Current Completion Status:** Frontend development is functionally complete for phase one. The UI/UX is locked in, the responsive design is finalized, and all complex client-side state management (cart, size selection, animated UI) is implemented.
**Build Status:** Passes `npm run build` with zero errors.
**TypeScript Status:** Strict. Passes `npx tsc` with zero errors.
**Lint Status:** Clean.
**Production Readiness Status:** Ready for deployment to a static/Vercel environment.
**Backend Readiness Status:** Ready for immediate API integration. All dynamic components use standardized state structures and dummy data that map directly to future API payloads.

**Frontend Modules Implemented:**
- Framer Motion animation engine
- Global Zustand Stores (Cart)
- E-commerce UI
- Admin Dashboard (Data tables, hierarchical product builder)
- Secure Account Portal
- Semantic Phosphor icon StatusBadge system
- Cinematic Video Preloader (Next.js 15+ Promise/Params Compatible)

---

## SECTION 3: PUBLIC WEBSITE STRUCTURE

**Home:** Cinematic entry point featuring an auto-playing hero video loop.
**About Us:** Narrative section detailing the VINVERSE vision.
**Services:** Sparkled grid displaying core offerings (Editing, Cover Design).
**Publishing Packages:** Tiered cards showing available publishing models.
**Publishing Process:** Step-by-step timeline of manuscript to publication.
**Published Books:** Horizontal scrollable carousel of the library.
**Authors:** Profile cards for signed authors.
**Store:** Unified grid for Merchandise and Apparel with quick-add functionality.
**Publish With Us:** Dedicated lead-generation form for author submissions.
**Contact:** Standard communication form.
**Footer:** Site navigation and legal links.

---

## SECTION 4: STORE STRUCTURE

**Store Page:** Category tabs filtering a masonry-style grid.
**Product Cards:** Display image, title, category, pricing, and "Add to Cart".
**Product Details:** Expanding modal/page revealing descriptions and size selectors.
**Categories:** Segment products by 'Merchandise', 'Apparel', etc.
**Search:** Client-side filtering of store inventory.
**Cart:** Global slide-out drawer utilizing Zustand.
**Checkout:** Multi-step flow capturing address and payment method.
**Order Success:** Confirmation page displaying the Order ID and next steps.

---

## SECTION 5: CUSTOMER ACCOUNT SYSTEM

**Login:** Authentication form with JWT token expectation.
**Register:** Account creation form.
**Forgot Password:** Password reset flow trigger.
**Account Dashboard:** Landing portal showing recent activity.
**Profile:** Read-only view of user data.
**Edit Profile:** Management of display name and email.
**My Orders:** Table listing historical orders.
**Order Details:** Granular view of purchased items.
**Tracking:** Dynamic rendering of tracking links if shipped.

---

## SECTION 6: ADMIN DASHBOARD

**Dashboard:** High-level metrics and recent activity.
**Products:** Master table of all store inventory.
**Books:** Specialized dashboard for editing, updating, and managing literary inventory (Creation is unified into Products).
**Authors:** Dashboard for editing, updating, and managing author profiles (Creation is unified into Products).
**Orders:** Fulfillment center for viewing and updating orders, featuring a dedicated "Contact & Address" column for rapid shipping coordination.
**Inquiries:** Inbox for "Publish With Us" submissions.
**Settings:** Global configuration for shipping, tax, and site metadata.

---

## SECTION 7: PRODUCT MANAGEMENT SYSTEM

**Add Product / Edit Product:** Massive form utilizing a complex tabbed interface.
**Delete Product:** Safety modal confirmation before deletion.
**Inventory:** Global stock tracking toggles.
**Pricing:** Regular Price and Sale Price logic.
**Categories:** Assignment of product types.
**Images:** Support for URL-based or uploaded imagery.
**Sizes (CRITICAL):** Implements a flat list for size management. Colors and other variations are handled by creating separate products instead of nested variants.
- **Sizes Array:** e.g., "Small", "Medium", "Large".
**Stock Handling:** Each size has its own independent stock level. A master `trackStock` boolean determines if stock should be checked at all.
**Sale Price Support:** If Sale Price exists, Regular Price is slashed out.
**Image URL Support:** Direct input field for remote image hosting.

**Example Payload Structure (Unified Creation):**
*Note: When creating a product in the "Books" category, the payload will include nested `author` and `book` objects. The backend API is expected to parse this single payload and simultaneously create/update the Product, the associated Book metadata, and the associated Author profile in their respective database tables.*

```json
{
  "product": {
    "name": "The Cosmic Journey",
    "category": "Books",
    "sku": "BK-COS-01",
    "status": "active",
    "shortDescription": "A poetic journey.",
    "description": "Full details..."
  },
  "pricing": {
    "price": 499,
    "currency": "₹",
    "tax": "5"
  },
  "inventory": {
    "trackStock": true,
    "stock": 50,
    "lowStockThreshold": 10,
    "outOfStockBehaviour": "stop",
    "sizes": []
  },
  "author": {
    "name": "Vinod Naraen",
    "shortBio": "Award-winning poet.",
    "fullBio": "Extensive biography...",
    "status": "active"
  },
  "book": {
    "genre": "Poetry",
    "publicationDate": "2023-10-25",
    "enableQR": true,
    "qrSongTitle": "Cosmic Theme",
    "qrSongUrl": "https://spotify.com/..."
  }
}
```

---

## SECTION 8: BOOK MANAGEMENT SYSTEM

**Books CRUD:** Standard creation and editing logic (Status dropdowns removed).
**Book Metadata:** Title, Blurb, ISBN, Page Count.
**Book Covers:** Specialized portrait imagery management.
**Author Linking:** Many-to-One relationship selection.
**QR Song Support:** Unique VINVERSE feature with interactive toggle support.
**Song URL Handling:** Backend must receive a standard URL (Spotify/Apple), convert it to a scannable QR image asset, and store the reference.

---

## SECTION 9: AUTHOR MANAGEMENT SYSTEM

**Authors CRUD:** Creation of author entities.
**Biography:** Rich text or large string fields.
**Profile Image:** Avatar URL support.
**Published Books Relationship:** Expected One-to-Many back to Books.

---

## SECTION 10: ORDERS SYSTEM

**Customer Flow:**
1. Adds items to cart.
2. Submits checkout form.
3. Backend creates intent, verifies stock.
4. Payment completes, order generated.
5. Customer tracks in 'My Orders'.

**Admin Flow:**
1. Views 'Processing' order.
2. Manages packing.
3. Updates Status to 'Shipped'.
4. Adds Tracking Link.
5. Order marked 'Completed' upon delivery.

---

## SECTION 11: TRACKING SYSTEM

**Tracking URL:** Direct link to courier site.
**Tracking Number:** Alphanumeric identifier.
**Courier Name:** Logistics provider.
**Admin Updates:** Admin edits order to inject these fields.
**Customer Visibility:** Rendered conditionally on the frontend order detail view.

---

## SECTION 12: INQUIRY SYSTEM

**Publish With Us Form:** Public lead gen.
**Inquiry Types:** e.g., Publishing Request, Bulk Order.
**Inquiry Storage:** Saved in DB with "New" status.
**Inquiry Management:** Admin reads synopsis.
**Admin Actions:** Admin changes status to "Read", "Replied", or "Archived".

---

## SECTION 13: SETTINGS SYSTEM

**General Settings:** Site name, maintenance mode.
**Publication Settings:** Default ISBN prefixes.
**Contact Settings:** Support email routing.
**Payment Settings:** Gateway toggles.
**Shipping Settings:** Flat rates.
**Legal Settings:** Terms URL pointers.

---

## SECTION 14: ROUTE INVENTORY

**Public Routes:**
- `/`
- `/about`
- `/store`
- `/store/product/[id]`
- `/publish-with-us`
- `/login`
- `/register`

**Customer Routes:**
- `/cart`
- `/checkout`
- `/account`
- `/account/profile`
- `/account/orders`
- `/account/order/[id]`

**Admin Routes:**
- `/admin`
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`
- `/admin/orders`, `/admin/orders/[id]`
- `/admin/books`, `/admin/books/new`, `/admin/books/[id]/edit`
- `/admin/authors`, `/admin/authors/new`, `/admin/authors/[id]/edit`
- `/admin/inquiries`, `/admin/inquiries/[id]`
- `/admin/settings`

---

## SECTION 15: FRONTEND DATA CONTRACTS

**TypeScript Interfaces:**

```typescript
interface User { id: string; name: string; email: string; phone?: string; role: 'admin' | 'customer'; }
interface Address { id: string; userId: string; fullName: string; phone: string; address1: string; address2?: string; city: string; state: string; pincode: string; country: string; }
interface Product { id: string; name: string; shortDescription: string; fullDescription: string; category: string; brand: string; sku: string; status: string; price: number; salePrice?: number; tax: number; trackStock: boolean; globalStock: number; lowStockThreshold: number; outOfStockBehavior: string; primaryImage: string; galleryImages: string[]; sizes: ProductSize[]; }
interface ProductSize { id: string; name: string; stock: number; }
interface Book { id: string; title: string; authorId: string; genre: string; publicationDate: string; shortDescription: string; fullDescription: string; coverUrl: string; qrEnabled: boolean; qrSongTitle?: string; qrMusicUrl?: string; }
interface Author { id: string; name: string; shortBio: string; fullBio: string; status: 'active' | 'inactive'; avatarUrl?: string; }
interface Order { id: string; userId: string; total: number; status: string; shippingAddressId: string; trackingInfo?: TrackingInfo; items: OrderItem[]; createdAt: Date; }
interface OrderItem { productId: string; sizeName: string; quantity: number; price: number; }
interface TrackingInfo { courier: string; trackingNumber: string; trackingUrl: string; }
interface Inquiry { id: string; name: string; email: string; phone: string; type: string; message: string; status: string; createdAt: Date; }
interface StoreSettings { storeName: string; supportEmail: string; supportPhone: string; currency: string; businessAddress: string; razorpayKeyId: string; razorpayKeySecret: string; razorpayTestMode: boolean; defaultDeliveryCharge: number; freeShippingThreshold: number; deliveryNotes: string; termsConditions: string; privacyPolicy: string; refundPolicy: string; }
```

---

## SECTION 16: BACKEND REQUIREMENTS

- **Authentication:** JWT login/register.
- **Authorization:** Role-based access control.
- **Products:** Nested JSON CRUD.
- **Books:** Relational CRUD.
- **Authors:** Relational CRUD.
- **Orders:** Transactional checkout verification.
- **Tracking:** PATCH updates.
- **Settings:** Key-Value store.
- **Inquiries:** Contact form ingestion.
- **Inventory:** Atomic stock decrement.
- **Image Uploads:** S3 bucket presigned URLs.
- **QR Generation:** URL-to-Image pipeline.
- **Email Notifications:** Resend transactional emails.
- **Payments:** Razorpay webhooks.

---

## SECTION 17: DATABASE DESIGN

**Recommended PostgreSQL Schema:**
- `users` (id, email, password_hash, role)
- `addresses` (id, user_id, line1...)
- `products` (id, name, price...)
- `product_sizes` (JSONB column on `products` table recommended)
- `authors` (id, name, bio...)
- `books` (id, product_id, author_id, isbn...)
- `orders` (id, user_id, total, status...)
- `order_items` (id, order_id, product_id, quantity...)
- `shipments`/`tracking` (can be columns on `orders`)
- `inquiries` (id, name, synopsis...)
- `settings` (key, value)

---

## SECTION 18: API DESIGN

**Core Endpoints:**
- `POST /api/auth/login`
- `GET /api/products` (Filters supported)
- `POST /api/admin/products` (Accepts nested payload)
- `POST /api/checkout/create-order` (Razorpay integration)
- `POST /api/webhooks/razorpay`
- `PATCH /api/admin/orders/:id/tracking`
- `POST /api/public/inquiries`
- `GET /api/public/books`
- `GET /api/public/authors`

---

## SECTION 19: INFRASTRUCTURE PLAN

**Frontend:** Vercel (Next.js App Router).
**Backend:** AWS EC2 (Node.js/Express) or Next.js API Routes.
**Database:** PostgreSQL (AWS RDS or Supabase).
**Storage:** AWS S3.
**Authentication:** NextAuth or Custom JWT.
**Email:** Resend.
**Payments:** Razorpay.
**Hosting:** Docker Compose on EC2 / Nginx Reverse Proxy.
**CI/CD:** GitHub Actions.

---

## SECTION 20: BACKEND IMPLEMENTATION ORDER

1. **Database:** Provision PostgreSQL.
2. **Prisma:** Define schema and run migrations.
3. **Authentication:** Implement JWT & Login/Register endpoints.
4. **Roles:** Admin middleware protection.
5. **Products:** CRUD APIs with JSONB sizes handling.
6. **Authors:** CRUD APIs.
7. **Books:** Relational CRUD linking to Authors & Products.
8. **Orders:** Checkout API and Razorpay Order creation.
9. **Inventory:** Stock decrement logic during payment webhook.
10. **Tracking:** Admin endpoints to inject URLs.
11. **Uploads:** S3 Presigned URL generation.
12. **Payments:** Webhook signature verification.
13. **Emails:** Connect Resend for Order Confirmations.
14. **Deployment:** Dockerize and deploy to EC2.
