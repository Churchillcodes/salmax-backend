# Salmax Backend API Endpoints

## Base URL

- Local development: http://localhost:3500

## Authentication

### Register a new user

- Method: POST
- Path: /auth/register
- Body:
  ```json
  {
    "username": "admin",
    "email": "admin@salmax.com",
    "password": "securepassword"
  }
  ```
- Response: `201 Created`

### Login

- Method: POST
- Path: /auth/login
- Body:
  ```json
  {
    "username": "admin",
    "password": "securepassword"
  }
  ```
- Response: `200 OK`
- Notes: Returns an access token and sets an HTTP-only refresh cookie.

### Refresh access token

- Method: GET
- Path: /auth/refresh
- Auth: Cookie-based refresh token
- Response: `200 OK` with a new access token

### Logout

- Method: POST
- Path: /auth/logout
- Auth: Cookie-based refresh token
- Response: `200 OK` or `204 No Content`

---

## Categories

### Get all categories

- Method: GET
- Path: /categories
- Query params:
  - `productType` (optional)
  - `group` (optional)
- Response: Array of categories

### Create category

- Method: POST
- Path: /categories
- Auth: JWT required, Admin role required
- Body:
  ```json
  {
    "name": "Loafers",
    "productType": "Shoes",
    "group": "Men"
  }
  ```

### Update category

- Method: PATCH
- Path: /categories/:id
- Auth: JWT required, Admin role required

### Delete category

- Method: DELETE
- Path: /categories/:id
- Auth: JWT required, Admin role required
- Notes: Soft deletes the category by setting it inactive.

---

## Products

### Get all products

- Method: GET
- Path: /products
- Query params:
  - `productType`
  - `group`
  - `category`
- Response: Array of active products

### Get a single product

- Method: GET
- Path: /products/:id

### Create product

- Method: POST
- Path: /products
- Auth: JWT required, Admin role required
- Body example:
  ```json
  {
    "name": "Classic Sneakers",
    "category": "64f1a2b3c4d5e6f7a8b9c0d",
    "description": "Comfortable everyday sneakers",
    "listedPrice": 2500,
    "negotiable": true,
    "sizes": [
      { "size": "42", "quantity": 10 }
    ],
    "colors": ["Black", "White"],
    "images": []
  }
  ```

### Update product

- Method: PATCH
- Path: /products/:id
- Auth: JWT required, Admin role required

### Upload product images

- Method: POST
- Path: /products/:id/images
- Auth: JWT required, Admin role required
- Form-data:
  - `images`: one or more image files

### Delete product image

- Method: DELETE
- Path: /products/:id/images/:imageId
- Auth: JWT required, Admin role required

### Get archived products

- Method: GET
- Path: /products/archived
- Auth: JWT required, Admin role required

### Restore archived product

- Method: PATCH
- Path: /products/:id/restore
- Auth: JWT required, Admin role required

### Get low-stock products

- Method: GET
- Path: /products/low-stock
- Query: `threshold` (optional)
- Auth: JWT required, Admin role required

### Increase stock

- Method: PATCH
- Path: /products/:id/increase-stock
- Auth: JWT required, Admin role required
- Body:
  ```json
  {
    "size": "42",
    "quantity": 5
  }
  ```

### Reduce stock

- Method: PATCH
- Path: /products/:id/reduce-stock
- Auth: JWT required, Admin role required
- Body:
  ```json
  {
    "size": "42",
    "quantity": 2
  }
  ```

### Delete (archive) product

- Method: DELETE
- Path: /products/:id
- Auth: JWT required, Admin role required

---

## Orders

### Get all orders

- Method: GET
- Path: /orders
- Query: `status` (optional)
- Auth: JWT required, Admin role required

### Get order by ID

- Method: GET
- Path: /orders/:id
- Auth: JWT required, Admin role required

### Create order

- Method: POST
- Path: /orders
- Auth: JWT required, Admin role required
- Body:
  ```json
  {
    "customerName": "Jane Doe",
    "customerPhone": "0712345678",
    "customerLocation": "Nairobi",
    "product": "64f1a2b3c4d5e6f7a8b9c0d",
    "size": "42",
    "quantity": 1,
    "agreedPrice": 2500,
    "notes": "Gift wrap"
  }
  ```

### Update order status

- Method: PATCH
- Path: /orders/:id/status
- Auth: JWT required, Admin role required
- Body:
  ```json
  {
    "status": "Confirmed"
  }
  ```

### Cancel order

- Method: PATCH
- Path: /orders/:id/cancel
- Auth: JWT required, Admin role required

---

## Sales

### Get all sales

- Method: GET
- Path: /sales
- Auth: JWT required, Admin role required

### Get sale by ID

- Method: GET
- Path: /sales/:id
- Auth: JWT required, Admin role required

### Top products analytics

- Method: GET
- Path: /sales/analytics/top-products
- Auth: JWT required, Admin role required

### Revenue trends analytics

- Method: GET
- Path: /sales/analytics/revenue-trends
- Auth: JWT required, Admin role required

### Sales breakdown analytics

- Method: GET
- Path: /sales/analytics/sales-breakdown
- Auth: JWT required, Admin role required

### Customer history analytics

- Method: GET
- Path: /sales/analytics/customer-history
- Query: `phone`
- Auth: JWT required, Admin role required

---

## Dashboard

### Dashboard summary

- Method: GET
- Path: /dashboard/summary
- Auth: JWT required, Admin role required

### Revenue analytics

- Method: GET
- Path: /dashboard/revenue
- Auth: JWT required, Admin role required

### Lead analytics

- Method: GET
- Path: /dashboard/leads
- Auth: JWT required, Admin role required

---

## Leads

### Create lead

- Method: POST
- Path: /leads
- Body:
  ```json
  {
    "customerName": "John Doe",
    "customerPhone": "0712345678",
    "source": "Instagram",
    "product": "64f1a2b3c4d5e6f7a8b9c0d",
    "productName": "Classic Sneakers"
  }
  ```

### Get all leads

- Method: GET
- Path: /leads
- Auth: JWT required, Admin role required

---

## Status Codes

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`
