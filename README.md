# The Block — OpenLane Coding Challenge

A prototype buyer-side vehicle auction platform. Browse inventory, filter
and search across seven dimensions, view full vehicle detail, and place
bids in real time against a live PostgreSQL database.

## Stack

- **Backend:** ASP.NET Core (.NET 10), Entity Framework Core, PostgreSQL
- **Frontend:** React + Vite + TypeScript, Tailwind CSS, React Router
- **Infra:** Docker Compose (Postgres only — no local Postgres install
  required)

## How to Run

### 1. Start Postgres

From the repo root:

```bash
docker compose up -d
```

This spins up a Postgres 16 container on port 5432 with the credentials
the API already expects. No local Postgres installation needed.

### 2. Start the backend API

```bash
cd backend/TheBlock.Api
dotnet ef database update
dotnet run
```

The first run automatically seeds the database with the full 200-vehicle
dataset from `data/vehicles.json`. This only happens once — subsequent
runs detect existing data and skip seeding.

The API is available at `http://localhost:5148`. Swagger UI is at
`http://localhost:5148/swagger`.

### 3. Start the frontend

In a new terminal:

```bash
cd frontend/the-block-web
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

## What I Built

- A full backend: EF Core entity modeling, PostgreSQL persistence, a
  service layer with real bid validation logic, and three REST endpoints
  (browse, detail, place bid)
- A React frontend covering the full Core Requirements: inventory
  browsing, a detailed vehicle view (specs, condition, damage notes,
  dealership, photos), and a working bid flow with live state updates
- A search and filter system that goes beyond the minimum bar — free text
  search plus five cascading, order-independent dropdown filters (Make,
  Model, Body Style, Engine, Trim) and four range filters (min/max price,
  min/max year), all computed client-side against the loaded inventory

See `SUBMISSION.md` for the full write-up of decisions, trade-offs, and
what I'd do with more time.