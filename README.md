<div align="center">

# Salmax Backend API

**The engine behind Salmax Suppliers** — authentication, product & inventory management, lead capture, sales analytics, and secure admin operations.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-lightgrey?style=for-the-badge)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [What This API Powers](#what-this-api-powers)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Seeding](#database-seeding)
- [Security](#security)
- [Roles](#roles)
- [Author](#author)

---

## About the Project

Salmax Backend is the server-side foundation for Salmax Suppliers, a boutique-style retail operation that needs reliable catalog management, stock control, order tracking, lead capture, and sales reporting. This API powers both the storefront experience and the admin dashboard with secure, role-based access.

---

## What This API Powers

This backend serves the business operations behind Salmax, including:

- Product browsing and category-based filtering
- Inventory tracking by size and quantity
- Order creation and status updates
- Sales reporting and customer history analytics
- Lead capture from customer inquiries
- Secure admin workflows for managing products and orders

---

## Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT access tokens with refresh token support
- Secure, HTTP-only cookie handling
- Password hashing with bcrypt
- Role-based authorization on protected admin routes

### 📦 Product Management

- Full product CRUD operations
- Archive and restore products
- Category-based filtering and product lookup
- Low-stock monitoring

### 📊 Inventory Management

- Real-time stock tracking by size
- Stock validation to prevent overselling
- Inventory-safe stock increase and decrease operations

### 🖼️ Image Management

- Cloudinary integration for product photos
- Upload and delete product images
- Stores image URLs and public IDs

### 📥 Lead Tracking

- Capture customer leads with product context
- View all leads from the admin side

### 💰 Sales & Orders

- Create and manage customer orders
- Track order status transitions
- Generate permanent sales records when orders are delivered
- Deliver analytics for top products, revenue trends, and customer history

### 🛠️ Development Utilities

- Database seeding with sample data
- API documentation
- Developer-friendly scripts

---

## Tech Stack

| Layer         | Technology                    |
| ------------- | ----------------------------- |
| Runtime       | Node.js                       |
| Framework     | Express.js                    |
| Database      | MongoDB Atlas, Mongoose       |
| Auth          | JWT, bcrypt                   |
| Media Storage | Cloudinary, Multer            |
| Tooling       | Nodemon, Git, GitHub, Postman |

---

## Project Structure

```text
src/
├── app.js
├── server.js
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── utils/

seed/
├── seed.js
├── seeder.js
└── README.md

docs/
├── API-ENDPOINTS.md
└── ARCHITECTURE.md
```

---

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
cd salmax-backend
```

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Run in production mode:

```bash
npm start
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3500
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## API Documentation

Full endpoint documentation is available in [docs/API-ENDPOINTS.md](docs/API-ENDPOINTS.md), covering:

- Authentication routes
- Product routes
- Category routes
- Order routes
- Sales and analytics routes
- Dashboard routes
- Lead routes
- Upload routes

---

## Database Seeding

> ⚠️ Development environments only.

```bash
npm run seed
```

This script populates the database with sample categories, products, and an admin user for local development.

---

## Security

- Password hashing with bcrypt
- JWT authentication with refresh token support
- Secure, HTTP-only cookie handling
- Role-based access control
- Protected admin routes
- Input validation and schema-based database validation

---

## Roles

| Role      | Permissions                                                                                |
| --------- | ------------------------------------------------------------------------------------------ |
| **User**  | Standard authenticated access                                                              |
| **Admin** | Manage products, upload images, monitor analytics, access dashboard and inventory features |

---

## Author

**Churchill**
Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-Churchillcodes-181717?style=for-the-badge&logo=github)](https://github.com/Churchillcodes)
