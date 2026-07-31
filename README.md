<h1 align="center">🍽️ VINCI Restaurant</h1>

<p align="center">
  <b>Enterprise-grade restaurant ordering platform</b><br/>
  Luxury &nbsp;•&nbsp; Modern &nbsp;•&nbsp; Production-ready &nbsp;•&nbsp; MERN
</p>

<p align="center">
  <img alt="Node" src="https://img.shields.io/badge/Node-%E2%89%A518-339933?logo=node.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

---

## Overview

VINCI is a full-stack restaurant ordering SaaS covering the entire lifecycle:
browsing a rich menu, customising meals, cart & checkout, payments, live order
tracking, reservations, reviews & loyalty — plus admin, kitchen and delivery
operations dashboards.

The codebase is organised as a **monorepo**:

```
vinci-restaurant/
├── server/        # Node.js + Express + MongoDB REST API
├── client/        # React 19 + Vite + Redux Toolkit SPA
├── docs/          # Architecture, API & deployment guides
├── .github/       # CI/CD workflows
└── docker-compose.yml
```

## ✨ Feature highlights

| Domain | Capabilities |
| --- | --- |
| **Auth** | JWT access + refresh tokens, httpOnly cookies, email verification, password reset, RBAC (customer/staff/kitchen/delivery/manager/admin), account lockout, token revocation |
| **Menu** | Nested categories, rich products (sizes, extras, nutrition, allergens, tags), full-text search, filtering, sorting, pagination |
| **Cart & Checkout** | Server-side cart, coupons, tax/delivery/tip calculation, transactional stock-safe checkout, loyalty points |
| **Orders** | Status lifecycle with audit history, cancellation, driver assignment, email + in-app notifications |
| **Reservations** | Guest & member table booking with approval workflow |
| **Reviews** | Verified-purchase reviews, ratings aggregation, moderation & replies |
| **Admin** | KPI dashboard, revenue/sales aggregation reports, user & coupon management, review moderation |
| **Security** | Helmet, CORS, rate limiting, Mongo sanitize, XSS clean, HPP, bcrypt, validated env |
| **DevEx** | Swagger/OpenAPI docs, Zod validation, Jest + Supertest tests, ESLint/Prettier, Docker, GitHub Actions CI, seed data |

## 🚀 Quick start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas) — or use Docker Compose

### 1. Backend
```bash
cd server
cp .env.example .env        # then edit secrets
npm install
npm run seed                # optional: demo data + admin account
npm run dev                 # http://localhost:5000  (docs at /docs)
```

### 2. Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### 3. Docker (everything at once)
```bash
docker-compose up --build
```

### Demo accounts (after seeding)
| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@vinci.test` | `Admin123!` |
| Kitchen | `kitchen@vinci.test` | `Kitchen123!` |
| Delivery | `driver@vinci.test` | `Driver123!` |
| Customer | `customer@vinci.test` | `Customer123!` |

## 📚 Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [API reference](docs/API.md) — interactive Swagger UI at `GET /docs`
- [Deployment guide](docs/DEPLOYMENT.md)

## 🧪 Testing
```bash
cd server && npm test        # Jest + Supertest (in-memory MongoDB)
```

## 📄 License
[MIT](LICENSE) © 2026 VINCI Restaurant
