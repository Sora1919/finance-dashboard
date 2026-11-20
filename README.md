# Mintly — Personal Finance Dashboard

**Mintly** is a full-stack personal finance dashboard built with Next.js, React, TypeScript, Prisma, and MySQL. It helps users track income and expenses, manage transaction history, and understand their financial activity through a responsive dashboard.

Built as a full-stack portfolio project, Mintly focuses on authentication, secure data access, financial data management, accessibility, and a clean user experience.

## Live Demo

**Mintly v1.0.0 is live!**

[Launch Mintly](https://mintlyweb-production.up.railway.app/)

Create an account to explore the financial dashboard, manage transactions, visualize income and expenses, and export transaction history to CSV.

## Deployment Architecture

- **Application hosting:** Railway (Next.js)
- **Production database:** Railway MySQL
- **ORM:** Prisma with the MariaDB adapter
- **Authentication:** Auth.js v5
- **Rate limiting:** Upstash Redis
- **Database networking:** Railway private service network

## Project Status

**Version:** v1.0.0 — Initial Release

Mintly has been deployed successfully and its core features have been tested in the production environment.

## Features

### Authentication
- User registration and email/password login
- Password hashing with bcrypt
- Auth.js credentials authentication with JWT sessions
- Protected dashboard routes
- Redis-backed rate limiting for login and registration

### Financial Dashboard
- Current balance, total income, and total expenses
- Six-month income-versus-expense chart
- Financial overview and savings rate
- Recent transactions with edit and delete actions

### Transaction Management
- Create, view, edit, and delete transactions
- Income and expense categorization
- Transaction dates and optional descriptions
- Search by title, category, or description
- Filter by type, category, and date range
- Sort transactions and browse paginated results
- Export transaction history to CSV

### User Experience
- Responsive desktop sidebar and mobile bottom navigation
- Accessible Create, Edit, and Delete dialogs
- Form validation with helpful error messages
- Loading skeletons, empty states, and feedback messages
- Consistent buttons, inputs, and keyboard focus indicators

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide React |
| Backend | Next.js App Router and Route Handlers |
| Authentication | Auth.js v5, bcrypt |
| Database | MySQL, Prisma ORM 7, MariaDB adapter |
| Validation | Zod |
| Rate Limiting | Upstash Redis |
| Package Manager | npm |

## Getting Started

### Prerequisites

- Node.js 22 LTS or another version supported by Prisma 7
- npm
- A running MySQL database
- An Upstash Redis database

### Installation

Clone the repository:

```bash
git clone https://github.com/Sora1919/finance-dashboard.git
cd finance-dashboard
```

Install dependencies:

```bash
npm ci
```

Create a local environment configuration using `.env.example` as a template:

```bash
cp .env.example .env
```

Update `.env` with your local MySQL credentials, Auth.js secret, and Upstash Redis REST credentials.

Never commit actual environment secrets.

### Database Setup

Ensure MySQL is running and the configured database is accessible.

Apply the existing Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

### Run in Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

Register an account, sign in, and start recording transactions.

### Production Build

```bash
npm run lint
npm run build
npm run start
```

The application will run locally using the Next.js production server.

## Environment Variables

Copy `.env.example` and configure the following:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string for Prisma migrations |
| `DATABASE_HOST` | MySQL database hostname |
| `DATABASE_PORT` | MySQL database port |
| `DATABASE_USER` | Database username |
| `DATABASE_PASSWORD` | Database password |
| `DATABASE_NAME` | Database name |
| `AUTH_SECRET` | Auth.js session signing secret |
| `AUTH_TRUST_HOST` | Host-trust setting when required by the deployment |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token |

All credentials must be kept server-side and outside version control.

## Security

Mintly includes server-side validation, password hashing, authenticated API access, user-scoped transaction queries, and rate limits on authentication operations.

Financial data is associated with each authenticated user. Transaction API operations check ownership before modifying records.

Additional deployment security depends on the hosting provider, database permissions, secret management, and reverse-proxy configuration.

## Deployment

Mintly requires a Node.js-capable hosting platform, a MySQL-compatible database, and Upstash Redis.

Before deployment:

1. Configure production environment variables.
2. Use a securely configured hosted database.
3. Apply database migrations.
4. Generate Prisma Client and build the application.
5. Verify authentication, transactions, and CSV export in the deployed environment.

## Project Status

**v1.0 release preparation**

The application has passed local development and production-mode testing. Public deployment is being prepared.

## Repository

[GitHub — Sora1919/finance-dashboard](https://github.com/Sora1919/finance-dashboard)

---

Built with Next.js, TypeScript, Prisma, and MySQL.