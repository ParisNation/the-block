# The Block — Paris Humphrey Jr.

## How to Run

From the repo root:

```bash
docker compose up -d
cd backend/TheBlock.Api
dotnet ef database update
dotnet run
```

The first run seeds the database with the full 200-vehicle dataset from
`data/vehicles.json`. This happens once. Subsequent runs detect existing data
and skip seeding.

The API runs at `http://localhost:5148`. Swagger UI is at
`http://localhost:5148/swagger`.

In a second terminal:

```bash
cd frontend/the-block-web
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

No local PostgreSQL installation is required. Docker Compose handles it.

## Time Spent

Roughly 12 to 14 hours of focused build time across two days, in sessions
around other responsibilities. That is well past the suggested 3 to 4 hour
window, and it was a deliberate choice rather than an oversight. I used the
extra time as hands-on learning on PostgreSQL and a fresh TypeScript and
React setup, and I wanted a build I could speak to in real depth during the
walkthrough rather than one that just cleared the bar. Every decision below
was reasoned through, not defaulted to.

## Assumptions and Scope

- No authentication or user accounts, per the challenge's stated assumptions.
  Bidder identity is a plain name captured at bid time.
- No seller workflows, checkout, or payment processing.
- Auction timestamps are treated loosely, consistent with the brief's note
  that they are synthetic scheduling data.
- Filtering and search run entirely client-side against the full loaded
  inventory of 200 records rather than backend query parameters. A deliberate
  call at this data size, explained below.
- Buy Now is surfaced as a filter, a card indicator, and a detail-page action
  with a confirmation modal. The modal states the price and says plainly that
  checkout, payment, and transport are handled outside this prototype. That is
  a scope boundary, not an unfinished feature. The challenge excludes checkout
  and payments, so building a purchase endpoint would have been scope creep on
  exactly the axis the rubric grades.

## Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router
- **Backend:** ASP.NET Core (.NET 10), Entity Framework Core
- **Database:** PostgreSQL, via Docker Compose

## What I Built

A full-stack prototype covering the complete buyer experience: browse and
search 200 vehicles, filter across eleven dimensions at once, drill into a
full detail view, and place a bid that validates server-side and persists to a
live database, with the displayed price updating immediately on success and no
page refresh.

**The filter rail.** Free text search, six cascading dropdowns (Make, Model,
Body Style, Engine, Trim, Province), four range filters (min and max price,
min and max year), a Buy Now toggle, and Clear All. A live "Showing X of 200"
count sits above the grid, with a proper empty state when a combination
returns nothing.

**Province filtering exists** because transport is the largest hidden cost in
wholesale and the inventory spans six provinces. **Buy Now is a boolean
toggle, not a facet**, and sits deliberately outside the cascade. Roughly 18%
of lots carry a Buy Now price, and it is the only instant-purchase path in the
app. A buyer who wants a car today had no way to find those.

**The inventory grid uses real cards**, not text rows. A 16:9 thumbnail, a
condition grade badge, a title status flag, spec chips for odometer, engine,
transmission and drivetrain, a price row that switches its own label between
Current Bid and Starting Bid, bid count, Buy Now price where present, and the
selling dealership with its city and province.

**Condition grade is color coded** on a four-step scale. It is the first
number a wholesale buyer looks at, and a flat badge made a 1.5 and a 4.9 read
identically.

**Title status is surfaced everywhere.** The dataset carries clean, rebuilt
and salvage titles. A salvage car is priced on a completely different basis
than a clean one, and rendering them the same way is misleading in a way that
costs a buyer real money. Non-clean titles are flagged in red on the card and
again on the detail page.

**Reserve is shown as status, never as an amount.** Reserve Met, Reserve Not
Met, or No Reserve. Real auctions hide the number. Exposing it lets a buyer
snipe the floor and turns an auction into a fixed-price sale with extra steps.
A null reserve renders as No Reserve, meaning the lot sells to the highest
bidder regardless.

**The bid flow runs through a modal** with a success confirmation. The confirm
button disables while the request is in flight so a double click cannot fire
two bids, and the vehicle is re-fetched only on success, so the number on
screen is what the server has rather than what the user typed. The bid input
is a real currency field: a pinned dollar sign, live comma formatting as you
type, and digit-stripping on change so the underlying value stays a clean
number for the API while still displaying like a price.

**The detail spec sheet** carries VIN, both colors, and fuel type alongside
the basics. Wholesale buyers run history reports off the VIN, so it renders in
monospace, readable character by character.

I chose a full-stack build over the frontend-only option the challenge
explicitly allows. The role is full-stack .NET, and more to the point, bids
are money. A real auction cannot let the client decide whether a bid is valid.
Bid validation lives on the server, which is a product decision before it is
an architectural one.

## Notable Decisions

**Single-project backend instead of a four-project Clean Architecture split.**
I have used the full Domain/Application/Infrastructure/API class library split
on a prior project. For this scope I used folder-level separation inside a
single project instead. Same philosophy, Domain has no dependencies and
business logic stays out of EF Core specifics, without the ceremony of
multiple project references for a domain this size.

**No MediatR or CQRS.** Browse, get by id, and place a bid do not have enough
independent complexity to justify command and query separation. The one place
I considered it is bid placement, which stacks three loosely related concerns
together: validation, the write, and concurrency handling. That is exactly the
shape MediatR's pipeline behaviors are built for. I kept it as a single
readable service method given the time box, and would introduce MediatR
specifically there if this were a longer-lived system.

**`damage_notes` and `images` stored as native Postgres arrays, not separate
tables.** Both are only ever consumed as a bundle alongside their parent
vehicle, never filtered or queried independently. A native array column avoids
an unnecessary join for data that is always read and displayed together.

**Filtering happens client-side**, not via backend query parameters. At 200
records, shipping the dataset once and filtering in memory is effectively free,
and it avoids writing the same filtering logic twice, once in LINQ and once in
JavaScript. At real production scale this moves server-side.

**Order-independent, mutually reactive filters.** Rather than forcing a strict
Make to Model to Body Style hierarchy, each filter's available options are
computed from whatever the other currently-selected filters allow. A buyer can
start from any dimension, say Body Style or Engine, without picking a Make
first. I built a simpler strict cascade first and deliberately moved away from
it, because it makes an assumption about buyer behavior that is not
necessarily true, and it lets a buyer dead-end into an empty result set just by
choosing filters in the wrong order.

**Reserve status without the reserve number.** The data has the reserve price
and it would have been trivial to render it. I deliberately did not, for the
reason above.

**Buy Now as a toggle, not a facet.** Every other dropdown narrows against the
others. Buy Now is a yes or no on a field that is null 82% of the time, so
folding it into the cascade would destabilize the dropdown option lists for no
gain. A small call, but it is the right shape for the data.

**Visual direction pulled from OpenLane's actual site**, not approximated. I
took the real brand variables straight from OpenLane's production CSS
(`--openlane-blue: #0061FF` and the surrounding palette, spacing scale, type
scale, and the 999px pill button radius) and wired them into Tailwind as a
custom `@theme` rather than guessing at a close-enough stock color.

## Testing

Manually tested end to end throughout the build: seeding against a fresh
database, filter combinations including multiple dropdowns and ranges at once,
successful and rejected bid submissions, and confirming the displayed price
updates immediately after a successful bid with no page refresh. I also did a
full clean clone-and-run pass following my own README exactly, to confirm the
setup works from zero with no undocumented manual steps.

## A Real Problem I Ran Into

Getting `AuctionStart` correctly persisted to Postgres turned into a
three-layer debugging chain, and it taught me more than any part of the build
that worked the first time.

1. .NET's `DateTimeOffset`, deserialized from a timestamp string with no
   explicit offset, silently picked up my machine's local time zone offset.
   Postgres's `timestamp with time zone` column flatly rejected it unless it
   was exactly UTC.
2. I switched the property to a plain `DateTime` and generated a new migration,
   but the migration silently did not alter the actual column type, because a
   stale migration file from earlier in the build was still in the project and
   conflicting with what I assumed the schema already was.
3. Once I found and removed the stale migration and regenerated cleanly, the
   column type was finally correct, and Postgres then rejected the values for
   the opposite reason. My seeding code was explicitly stamping dates as
   `DateTimeKind.Utc`, and a `timestamp without time zone` column specifically
   wants `DateTimeKind.Unspecified`.

Each fix was correct for the state of the system at that moment, and each one
revealed the next problem underneath it.

## What I'd Do With More Time

- Extend the reactive filter logic so price and year ranges also narrow the
  categorical dropdown options, not just the final results. Right now those two
  correctly narrow what is shown, but do not yet feed back into what is offered
  in the Make, Model, Body Style, Engine, Trim, and Province dropdowns.
- Wire Buy Now to a real endpoint that closes the lot. The frontend and the
  domain both already support it. The only thing missing is a decision about
  what "sold" means in a system with no checkout.
- A proper `Bid` history table recording every individual bid, rather than
  mutating `CurrentBid` and `BidCount` directly on the vehicle.
- A hot or trending indicator based on bid velocity, how many bids a vehicle
  has taken and how fast they are arriving relative to other lots, rather than
  a raw count. That is a more honest signal of real buyer interest, and the bid
  history table above is the data source it would need.
- Similar vehicles on the detail page, surfacing other inventory with
  comparable specs so a buyer who is not sold on one listing has an obvious
  next place to look instead of navigating back to the full grid.
- MediatR around bid placement specifically, isolating validation, the write,
  and concurrency retry into independently testable pipeline steps.
- Real image assets instead of the placeholder URLs in the seed data.
- A countdown to `auctionStart`, normalized relative to now as the dataset
  guidance suggests.