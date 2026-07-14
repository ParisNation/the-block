# The Block — Paris Humphrey Jr.

## How to Run

From the repo root:

```bash
docker compose up -d
cd backend/TheBlock.Api
dotnet ef database update
dotnet run
```

The first run automatically seeds the database with the full 200-vehicle
dataset from `data/vehicles.json`. This only happens once — subsequent
runs detect existing data and skip seeding.

The API runs at `http://localhost:5148`. Swagger UI is at
`http://localhost:5148/swagger`.

In a second terminal:

```bash
cd frontend/the-block-web
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

No local PostgreSQL installation is required — Docker Compose handles it.

## Time Spent

Roughly 12–14 hours of focused build time across two days, broken into
sessions around other responsibilities. This went well past the suggested
3–4 hour window — a deliberate choice, not an oversight. I used the extra
time as hands-on learning on PostgreSQL and a fresh TypeScript/React setup,
and I wanted a build I could speak to in real depth during the walkthrough
rather than one that just cleared the bar. Every architectural decision
below was reasoned through deliberately, not defaulted to.

## Assumptions and Scope

- No authentication or user accounts, per the challenge's stated
  assumptions. Bidder identity is a plain name captured at bid time.
- No seller workflows, checkout, or payment processing.
- Auction timestamps are treated loosely, consistent with the README's own
  note that they're synthetic scheduling data.
- Filtering and search are entirely client-side against the full loaded
  inventory (200 records) rather than backend query parameters — a
  deliberate scope decision at this data size (see Notable Decisions).
- Buy Now price is surfaced on both the inventory card and the vehicle
  detail page, including a button that opens a modal — but the modal is
  currently a visual placeholder with no real purchase action behind it.
  I'd either wire it to a genuine "buy now ends the auction" flow or pull
  it entirely with more time, rather than leave a button that implies
  functionality it doesn't have.

## Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router
- **Backend:** ASP.NET Core (.NET 10), Entity Framework Core
- **Database:** PostgreSQL, via Docker Compose

## What I Built

A full-stack prototype covering the complete buyer experience: browse and
search 200 real vehicles, filter by seven different dimensions
simultaneously, drill into a full vehicle detail view, and place a real
bid that validates against the current price and persists to a live
database — with the displayed price updating immediately on success, no
page refresh required.

The inventory grid uses real card layouts, not plain text rows — a 16:9
thumbnail pulled from each vehicle's first image, a condition grade badge
overlaid on the photo, title and trim, spec chips for odometer, engine,
transmission, and drivetrain, and a price row that switches its own label
between "Current Bid" and "Starting Bid" depending on whether the vehicle
has any bids yet. A live "Showing X of Y vehicles" count sits above the
grid, and there's a proper empty state when a filter combination returns
nothing.

The bid input on the detail page is a real currency field rather than a
bare number box — a pinned `$` prefix, live comma formatting as you type,
and digit-stripping on change so the underlying value stays a clean
number for the API call while still displaying like a price.

Reserve price and Buy Now price are surfaced on both the inventory card
and the vehicle detail page, including a Buy Now button that opens a
modal — though the modal itself is currently a visual placeholder rather
than a wired purchase flow (see Assumptions and Scope).

I chose a full-stack build over the frontend-only option the challenge
explicitly allows, since the role I'm interviewing for is full-stack .NET,
and this was the strongest way to demonstrate that directly rather than
just describe it.

## Notable Decisions

**Single-project backend structure instead of full Clean Architecture
project separation.** I've used a four-project Clean Architecture split
(Domain/Application/Infrastructure/API as separate class libraries) on a
prior personal project. For this challenge's scope, I used folder-level
separation of concerns within a single project instead — the same
philosophy (Domain has no dependencies, business logic separated from EF
Core specifics), without the ceremony of multiple project references for a
domain this size.

**No MediatR / CQRS.** The core operations here (browse, get by id, place
a bid) don't have enough independent complexity to justify command/query
separation. The one place I considered it — bid placement — has three
loosely related concerns stacked together (validation, the write itself,
concurrency handling), which is exactly the shape MediatR's pipeline
behaviors are built for. I made a deliberate call to keep it as a single,
readable service method given the time box, and would introduce MediatR
here specifically if this were a longer-lived system.

**`damage_notes` and `images` stored as native Postgres arrays, not
separate tables.** Both are only ever consumed as a bundle alongside their
parent vehicle — never filtered or queried independently. A native array
column avoids an unnecessary join for data that's always read and
displayed together.

**Filtering happens entirely client-side**, not via backend query
parameters. At 200 records, shipping the full dataset once and filtering
in memory is effectively free performance-wise, and it avoids writing the
same filtering logic twice (once in LINQ, once in JavaScript) for a
dataset this size. At real production scale this would move server-side.

**Order-independent, mutually reactive filters.** Rather than forcing a
strict Make → Model → Body Style hierarchy, every filter's available
options are computed from whatever the *other* currently-selected filters
allow — so a buyer can start their search from any dimension (say, Body
Style or Engine) without needing to pick a Make first. I considered a
simpler strict cascade first and deliberately moved away from it, since it
makes an assumption about buyer behavior that isn't necessarily true.

**Visual direction pulled from OpenLane's actual site**, not approximated.
I pulled the real brand color variables directly from OpenLane's live
production CSS (`--openlane-blue: #0061FF` and the surrounding palette,
spacing scale, and typography scale) and wired them into Tailwind as a
custom `@theme` rather than guessing at a close-enough stock color.

## Testing

Manually tested end to end throughout the build: seeding against a fresh
database, every filter combination (including combining multiple dropdowns
and ranges simultaneously), successful and rejected bid submissions, and
confirming the displayed price updates immediately after a successful bid
without a page refresh. Also did a full clean clone-and-run pass following
my own README instructions exactly, to confirm the setup genuinely works
from zero with no undocumented manual steps.

## A Real Problem I Ran Into

Getting `AuctionStart` correctly persisted to Postgres turned into a
genuinely instructive, three-layer debugging chain:

1. .NET's `DateTimeOffset`, deserialized from a timestamp string with no
   explicit offset, silently picked up my machine's local time zone
   offset — which Postgres's `timestamp with time zone` column flatly
   rejected unless it was exactly UTC.
2. I switched the property to a plain `DateTime` and generated a new
   migration — but the migration silently didn't alter the actual column
   type, because a stale migration file from earlier in the build was
   still in the project and conflicting with what I expected the schema
   to already be.
3. Once I found and removed the stale migration and regenerated cleanly,
   the column type was finally correct — but Postgres then rejected the
   values for the opposite reason: my seeding code was explicitly stamping
   dates as `DateTimeKind.Utc`, and a `timestamp without time zone` column
   specifically wants `DateTimeKind.Unspecified`.

Each fix was correct for the state of the system at that moment, and each
one revealed the next problem underneath it. Working through it taught me
more about how Npgsql and Postgres actually interpret .NET's date/time
kinds than any part of the build that went smoothly on the first try.

## What I'd Do With More Time

- Extend the reactive filter logic so price and year ranges also narrow
  the categorical dropdown options, not just the final results — right
  now those two range filters correctly narrow what's *shown*, but don't
  yet feed back into what's *offered* in the Make/Model/Body
  Style/Engine/Trim dropdowns.
- Finish the Buy Now flow properly — either a real "this ends the
  auction" action, or remove the button entirely rather than leave a
  non-functional modal in place.
- A "hot" or "trending" indicator based on bid velocity — how many bids a
  vehicle has received and how quickly they're coming in relative to
  other vehicles, not just a raw bid count. That's a more honest signal
  of real buyer interest than total bids alone, and it's the kind of
  detail that makes an auction feel alive rather than static.
- Similar vehicles / pairings on the detail page — surfacing other
  inventory with comparable specs (same body style, similar price band,
  same make) so a buyer who isn't sold on one listing has an obvious next
  place to look instead of navigating back to the full grid.
- A proper `Bid` history table recording every individual bid, rather than
  mutating `CurrentBid`/`BidCount` directly on the vehicle. This would
  also be the real data source behind the bid-velocity idea above, rather
  than inferring it from a single counter.
- Introduce MediatR specifically around bid placement, isolating
  validation, the write, and concurrency retry logic into separate,
  independently testable pipeline steps.
- Real image assets instead of placeholder URLs from the seed data.
- A countdown to `auctionStart`, normalized relative to "now" as the
  dataset guidance suggests.