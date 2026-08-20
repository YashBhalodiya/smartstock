# Smart Inventory & Automated Restock Management System - Backend

Modular Monolithic Node.js + Express REST API backend service powered by PostgreSQL, Prisma, Redis, BullMQ, and Nodemailer.

## Directory Structure

```text
backend/
├── prisma/
│   └── schema.prisma        # Prisma Database Schema
├── src/
│   ├── config/              # Environment & Service configurations (DB, Redis, Email)
│   ├── middleware/          # Express Middlewares (Auth, Error Handling, Validation)
│   ├── modules/             # Business Logic Modules (Modular Monolith Architecture)
│   │   ├── auth/            # JWT & Authentication
│   │   ├── users/           # User Management
│   │   ├── categories/      # Product Categories
│   │   ├── suppliers/       # Supplier Profiles
│   │   ├── products/        # Product Catalog
│   │   ├── sales/           # POS Billing & Sales Transactions
│   │   ├── inventory/       # Stock Control & History Ledger
│   │   ├── restock/         # Automated & Manual Restock Orders
│   │   ├── notifications/   # System & Low Stock Alerts
│   │   └── dashboard/       # Summary & Analytics
│   ├── jobs/                # Background Queue Workers (BullMQ Email Jobs)
│   ├── utils/               # Helper utilities & custom loggers
│   ├── app.js               # Express application setup
│   └── server.js            # Server entry point
├── .env                     # Local environment variables
├── .env.example             # Example environment variables template
└── package.json
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in database credentials and secrets:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Health Check
```text
GET http://localhost:5000/api/health
```
