# The Block — OpenLane Coding Challenge

A prototype buyer-side vehicle auction platform. Browse and search a
200-vehicle inventory, inspect full condition and title detail on any lot,
and place bids in real time against a live PostgreSQL database.

## Stack

- **Backend:** ASP.NET Core (.NET 10), Entity Framework Core, PostgreSQL
- **Frontend:** React + Vite + TypeScript, Tailwind CSS, React Router
- **Infra:** Docker Compose (Postgres only, no local Postgres install required)

## How to Run

### 1. Start Postgres

From the repo root:

```bash
docker compose up -d
```

This spins up a Postgres 16 container on port 5432 with the credentials the
API already expects. No local Postgres installation needed.

### 2. Start the backend API

```bash
cd backend/TheBlock.Api
dotnet ef database update
dotnet run
```

The first run seeds the database with the full 200-vehicle dataset from
`data/vehicles.json`. This happens once, subsequent runs detect existing
data and skip seeding.

The API is at `http://localhost:5148`. Swagger UI is at
`http://localhost:5148/swagger`.

### 3. Start the frontend

In a new terminal:

```bash
cd frontend/the-block-web
npm install
npm run dev
```

The app is at `http://localhost:5173`.

## What I Built

### Backend

EF Core entity modeling against the full vehicle schema, PostgreSQL
persistence, a service layer holding real bid validation, and three REST
endpoints (browse, detail, place bid). Bids are validated server side. The
client never decides whether a bid is valid, because bids are money.

### Inventory

Free text search plus a filter rail that narrows 200 vehicles down fast:

- **Six cascading dropdowns:** Make, Model, Body Style, Engine, Trim,
  Province. These are order independent. Selecting a Make narrows the Model
  list, but the Make list does not collapse to the one already selected, so
  a buyer can never dead-end into an empty result set by picking filters in
  the wrong order.
- **Four range filters:** min/max price, min/max year.
- **Buy Now toggle.** Deliberately a boolean, not a facet, and deliberately
  outside the cascade. Only about 18% of lots have a Buy Now price, and it
  is the only instant-purchase path in the app. A buyer who wants a car
  today had no way to find those.
- **Clear All Filters**, plus a live "showing X of 200" count.

Cards carry the four specs that qualify or disqualify a lot at a glance
(odometer, engine, transmission, drivetrain), a **color-coded condition
grade** badge, a **title status** flag, the current or starting bid, bid
count, Buy Now price where present, and the selling dealership with its
city and province.

### Vehicle detail

Full spec sheet including VIN, both colors, and fuel type. Condition report,
damage notes, selling dealership, lot number, photos.

Auction state is surfaced as **reserve status**, never the reserve amount.
Real auctions hide the number. Showing it lets a buyer snipe the floor and
kills the bidding dynamic. A null reserve renders as "No Reserve", meaning
it sells to the highest bidder regardless.

Bidding runs through a confirmation modal with a success state. The confirm
button disables while the request is in flight so a double click cannot fire
two bids, and the vehicle is re-fetched only on success, so the number on
screen is what the server has rather than what the user typed.

Buy Now opens a confirmation modal that states the price and where the
boundary is. Checkout, payment, and transport are explicitly out of scope
per the challenge brief.

### Product decisions worth naming

**Title status is surfaced everywhere.** The dataset carries clean, rebuilt,
and salvage titles. A salvage-title car is priced on a completely different
basis than a clean one, and rendering them identically would be misleading
in a way that costs a buyer real money. Non-clean titles are flagged in red
on the card and again on the detail page.

**Condition grade is color coded.** It is the first number a wholesale buyer
looks at, and a flat badge made a 1.5 and a 4.9 read the same.

**Province filtering exists** because transport cost is the largest hidden
cost in wholesale, and the inventory spans six provinces.

### Styling

The palette, spacing scale, type scale, and radii are OpenLane's real design
tokens, pulled from production CSS and wired into the Tailwind theme rather
than approximated with stock Tailwind colors. The 999px pill radius on
buttons is OpenLane's signature and is matched exactly.

Layout is responsive: single column with filters stacked on mobile, filter
rail beside a three-up grid on desktop.

## Scope

Built against the Core Requirements, not past them. No authentication, no
checkout, no payments, no seller tooling, per the brief.

See `SUBMISSION.md` for the full write-up of trade-offs and what I would do
with more time.