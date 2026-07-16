# Salmax Backend Architecture

## Overview

Salmax Backend is a Node.js + Express REST API for managing an inventory-driven boutique storefront. It supports product catalog management, order processing, sales analytics, leads, and admin authentication.

## Core Goals

- Serve the storefront and admin dashboard through a single backend API
- Manage products with size-based inventory tracking
- Support order flow from pending to delivered while reserving stock
- Record completed sales for analytics
- Provide secure admin access with JWT-based authentication

---

## Technology Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens (JWT)
- File Uploads: Multer + Cloudinary
- Environment configuration: dotenv
- Development tooling: Nodemon

---

## Project Structure

```text
src/
  app.js
  server.js
  config/
    cloudinary.js
    dbConn.js
    roles_list.js
  controllers/
    authController.js
    categoryController.js
    dashboardController.js
    leadController.js
    orderController.js
    productController.js
    saleController.js
  middleware/
    logger.js
    upload.js
    verifyJWT.js
    verifyRoles.js
  models/
    Category.js
    Lead.js
    Order.js
    Product.js
    Sale.js
    User.js
  routes/
    authRoutes.js
    categoryRoutes.js
    dashboardRoutes.js
    leadRoutes.js
    orderRoutes.js
    productRoutes.js
    root.js
    saleRoutes.js
  utils/
    normalizeText.js
```

---

## Request Flow

1. A request enters the Express app from [src/app.js](../src/app.js).
2. Global middleware applies logging, JSON parsing, and cookie parsing.
3. The request is routed to the appropriate route file under [src/routes](../src/routes).
4. The route delegates to a controller in [src/controllers](../src/controllers).
5. The controller interacts with Mongoose models in [src/models](../src/models).
6. Responses are returned as JSON to the client.

---

## Main Modules

### App Entry

- [src/server.js](../src/server.js) initializes environment variables, connects to MongoDB, and starts the HTTP server.
- [src/app.js](../src/app.js) configures middleware, CORS, and mounts all route modules.

### Routing

Routes are grouped by domain:

- Authentication: [src/routes/authRoutes.js](../src/routes/authRoutes.js)
- Categories: [src/routes/categoryRoutes.js](../src/routes/categoryRoutes.js)
- Products: [src/routes/productRoutes.js](../src/routes/productRoutes.js)
- Orders: [src/routes/orderRoutes.js](../src/routes/orderRoutes.js)
- Sales: [src/routes/saleRoutes.js](../src/routes/saleRoutes.js)
- Dashboard: [src/routes/dashboardRoutes.js](../src/routes/dashboardRoutes.js)
- Leads: [src/routes/leadRoutes.js](../src/routes/leadRoutes.js)

### Controllers

Controllers contain business logic and shape the API responses.

- Authentication and authorization logic lives in [src/controllers/authController.js](../src/controllers/authController.js).
- Product catalog logic lives in [src/controllers/productController.js](../src/controllers/productController.js).
- Order and stock flow logic lives in [src/controllers/orderController.js](../src/controllers/orderController.js).
- Analytics logic lives in [src/controllers/saleController.js](../src/controllers/saleController.js) and [src/controllers/dashboardController.js](../src/controllers/dashboardController.js).

### Models

The database layer is structured around these Mongoose models:

- Product: inventory and product metadata
- Category: catalog grouping and productType metadata
- Order: customer orders and status transitions
- Sale: permanent sales records created when orders are delivered
- Lead: customer inquiries or prospects
- User: admin authentication accounts

---

## Authentication and Authorization

Authentication uses JWT access tokens and refresh tokens.

### Flow

1. User logs in through /auth/login.
2. Server returns an access token and stores a refresh token in an HTTP-only cookie.
3. Protected routes require the access token via the JWT middleware.
4. Admin-only routes also require the Admin role through role-based middleware.

### Middleware

- [src/middleware/verifyJWT.js](../src/middleware/verifyJWT.js) verifies access tokens.
- [src/middleware/verifyRoles.js](../src/middleware/verifyRoles.js) checks role authorization.

---

## Inventory and Order Model

Salmax is designed as an inventory-first system.

### Product model

- Each product has one or more size entries.
- Stock is tracked per size, not as a single total quantity.
- Products can be archived instead of deleted.

### Order model

- Orders reference a product and a specific size.
- Stock is reserved when an order is confirmed.
- Stock is returned if an order is cancelled.
- A sale record is created when an order is delivered.

---

## File Uploads

Product images are uploaded through Multer and stored with Cloudinary.

- Upload middleware: [src/middleware/upload.js](../src/middleware/upload.js)
- Cloudinary configuration: [src/config/cloudinary.js](../src/config/cloudinary.js)

---

## Error Handling Pattern

The API returns structured JSON error responses with appropriate HTTP status codes, such as:

- `400` for invalid input or bad requests
- `401`/`403` for authentication and authorization issues
- `404` for missing resources
- `409` for duplicate entries
- `500` for unexpected server failures

---

## Notes on Business Logic

- Categories are soft-deleted so existing products and orders remain valid.
- Products are archived rather than deleted to preserve reporting integrity.
- Sales analytics are built from the sale collection, which stores snapshots of order data.
- The system is intentionally optimized for a boutique inventory workflow rather than made-to-order production flow.
