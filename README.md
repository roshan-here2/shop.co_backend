# E-Commerce Backend API

Node.js + Express + MongoDB Atlas backend for the full-stack e-commerce system.

## Requirements

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

## Installation

```bash
cd ecommerce-backend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
ADMIN_SECRET_PASSWORD=secret123
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
NODE_ENV=development
```

**Never commit the real `.env` file.**

## Seed Database

```bash
npm run seed
```

Creates:
- Admin: `admin@shop.co` / `secret123`
- Demo user: `demo@shop.co` / `password123`
- Sample products (clothing + electronics)

## Start Server

```bash
npm start
# or
npm run dev
```

API runs at `http://localhost:5000`

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | - | Register |
| POST | /api/auth/login | - | Login |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/products | - | List products |
| GET | /api/products/:id | - | Single product |
| POST | /api/cart/add | JWT | Add to cart |
| POST | /api/orders | JWT | Create order |
| GET | /api/orders/my-orders | JWT | User orders |
| POST | /api/admin/login | - | Secret password → JWT |
| GET | /api/admin/dashboard | Admin | Stats |
| GET | /api/admin/products | Admin | All products |
| GET | /api/admin/orders | Admin | All orders |
| PUT | /api/admin/orders/:id/status | Admin | Update status |
| GET | /api/admin/users | Admin | All users |

## Security

- Passwords hashed with bcrypt
- JWT authentication
- Admin routes require `role: admin`
- Prices and stock validated on server
- CORS restricted to frontend URLs

## Deployment

Deploy to Render, Railway, or any Node host. Set environment variables in the host dashboard. Point `CLIENT_URL` and `ADMIN_URL` to production frontend URLs.
