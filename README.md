# OneDigest

A full-stack newsletter  platform that consolidates all your opted-in newsletter subscriptions into a single, organized daily digest email at a time/frequency of the user's choosing. The full newsletter will be separated by categories of the user's interests.

## How It Works

1. **Register** — a unique ingest email is generated (e.g. `a3f8b2c1@onedigest.com`)
2. **Forward newsletters** to that ingest email
3. **Auto-subscribe** — the first email from a newsletter automatically creates a subscription
4. **Browse** a catalog of newsletters (scraped from Substack, Beehiiv) and subscribe manually
5. **Configure** your preferred delivery time and timezone in Settings
6. **Receive** a single daily digest email with all newsletters grouped by category

## Key Features

- **Inbound email processing** — SendGrid Inbound Parse webhook receives forwarded emails, auto-categorizes them using keyword-based scoring across 16 categories (Technology, Finance, Health, etc.), and stores them
- **Daily digest delivery** — A BullMQ background worker compiles unread emails into a styled HTML digest and sends it via SendGrid at each user's configured delivery time
- **Newsletter catalog** — Scrapers pull newsletters from Substack and Beehiiv to seed a browsable, searchable catalog with category filtering
- **Subscription management** — Dashboard lets users toggle subscriptions on/off or remove them
- **Dark mode** — Theme toggle with Tailwind dark mode support

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Database | PostgreSQL 17 via Prisma 7 ORM |
| Auth | NextAuth.js v4 (credentials provider, JWT sessions, bcrypt) |
| Email | SendGrid (inbound parse + outbound delivery) |
| Job Queue | BullMQ + Redis 7 |
| Scraping | Cheerio (HTML parsing for Substack/Beehiiv) |
| Infrastructure | Docker Compose (PostgreSQL + Redis containers) |

## Architecture

```
User forwards email
       |
SendGrid Inbound Parse --> POST /api/inbound
       |
  Store in DB (InboundEmail table)
  Auto-categorize & auto-subscribe
       |
Background Worker (BullMQ, every 60s)
  --> checks delivery time per user
  --> compiles unread emails by category
  --> sends styled HTML digest via SendGrid
```

### Database Schema

5 main tables: **User**, **Newsletter**, **Subscription**, **InboundEmail**, and **DigestLog**.

### Project Structure

```
src/
  app/              # Next.js App Router pages & API routes
    api/
      auth/         # Registration & NextAuth endpoints
      inbound/      # SendGrid webhook for incoming emails
      newsletters/  # Newsletter catalog API
      subscriptions/# Subscription management API
      settings/     # User settings API
    dashboard/      # User subscription management page
    browse/         # Newsletter catalog browser page
    settings/       # User preferences page
  components/       # React components (Navbar, NewsletterCard, etc.)
  lib/              # Core logic (auth, prisma, categorize, email)
  workers/          # Background digest sender worker
prisma/
  schema.prisma     # Database schema
  seed.ts           # Database seeding script
  scrapers/         # Substack & Beehiiv scrapers
scripts/            # Utility & test scripts
```

## Getting Started

### Prerequisites

- Node.js
- Docker (for PostgreSQL and Redis)
- SendGrid account (API key + Inbound Parse configured)

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Start the database and Redis services:

```bash
docker compose up -d
```

3. Set up your environment variables (see `.env.example`):

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5433/digesthub"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="digest@yourdomain.com"
```

4. Run database migrations and seed:

```bash
npm run db:migrate
npm run db:seed
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

6. In a separate terminal, start the digest worker:

```bash
npm run worker:digest
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run worker:digest` | Run the background digest worker |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the newsletter catalog |
| `npm run test:inbound` | Simulate an inbound email |
| `npm run test:app` | Run integration tests |

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
