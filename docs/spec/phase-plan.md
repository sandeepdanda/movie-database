# Not Another Rewatch - Phase Plan

## What I'm Building

A movie app that helps you actually find something to watch. You can search by title, describe a mood ("something dark with plot twists"), or chat with it like a friend who's seen everything. You can rate movies, save a watchlist, and see stats on what you've been watching.

The whole point: stop opening Netflix and scrolling for 45 minutes before giving up and picking Friends again.

## Why I Picked This Stack

React + TypeScript on the front, Java + Spring Boot on the back, DynamoDB underneath. Same stack my team uses at work, so every hour I spend on this makes me better at my day job too.

| Layer | What I Used | Why |
|-------|-------------|-----|
| Frontend | React 18, TypeScript, Vite, Tailwind, Framer Motion | Fast, typed, animated |
| Backend | Java 21, Spring Boot 3.5 | Work stack, virtual threads |
| Database | DynamoDB (2 tables, 3 GSIs) | Single-table design practice |
| AI | sentence-transformers (local, free) | No API bills |
| Infra | Docker Compose + LocalStack | Runs on my laptop |
| CI | GitHub Actions | Free, simple |

The AI runs on my CPU. No OpenAI key, no Pinecone, no monthly bills. Embeddings are 384 dimensions, the model is 80MB, and it works.

---

## Phase 1: Setup and Database Design ✅

Got the monorepo going: backend, frontend, etl, infra. Docker Compose fires up LocalStack with DynamoDB, the Spring Boot server, and the React dev server all at once.

The interesting part was designing the DynamoDB schema. Two tables:
- **MovieCatalog** holds everything about movies - the movie itself, cast, crew, genres, all in one table using different sort keys
- **UserActivity** holds user stuff - watchlist, ratings, diary entries

Three GSIs to support different ways people look things up: by genre, by popularity, and reverse lookups from user to movie.

**What I learned:** DynamoDB single-table design. You design around the queries, not around the data. Very different from SQL.

---

## Phase 2: Loading the Data ✅

Took 45K movies from a Kaggle dataset and wrote them into DynamoDB. The Python ETL script transforms each movie into about 17 different DynamoDB items - one for the movie itself, one per cast member, one per crew member, plus reverse indexes so you can query "all movies with this actor."

Ended up with 758K items in the database from 45K movies. That's what denormalization looks like in practice.

**Gotchas I hit:**
- LocalStack is slow. Full load takes about 2 hours. Had to run it with `nohup`.
- Batch writes are capped at 25 items. If two items in the same batch have the same key, the whole batch fails. Had to dedupe within each batch.
- Pandas returning a Series vs a dict in the transform broke cast parsing until I fixed it.

**What I learned:** Batch writes, throughput limits, why denormalization means writing the same data 5 different ways.

---

## Phase 3: The Java API ✅

Built the REST endpoints that serve movie data from DynamoDB. Used the Enhanced Client from AWS SDK v2 with `@DynamoDbBean` classes.

Endpoints I shipped:
- `GET /movies/{id}` - movie details with cast, crew, genres (one query on the partition key)
- `GET /movies?genre=X` - filter by genre (GSI1 query)
- `GET /movies?decade=X` - filter by decade (GSI1 query)
- `GET /movies?sort=rating` - sorted lists (GSI2 query)
- `GET /persons/{id}` - filmography for an actor/director
- `GET /genres` - list all genres

Added Caffeine cache in front of hot data - 30 minute TTL, 10K entries. Helps a lot on repeated movie detail lookups.

**Deferred:** cursor pagination, Swagger docs, and proper unit tests. Will come back in Phase 3b.

**Gotcha:** The Enhanced Client defaults to lowercase attribute names. I had `PK` in my table but the bean was looking for `pk`. Silent failure until I traced it.

**What I learned:** Spring Boot REST patterns, AWS SDK v2, how the Enhanced Client maps objects to DynamoDB.

---

## Phase 4: The Frontend ✅

React + TypeScript + Tailwind + TanStack Query. Built the main pages:
- Home page with a grid of top rated movies
- Movie detail page with overview, cast, crew, stats
- Browse page with genre chips and decade filters
- Person page with filmography

Then pulled in real posters from TMDB. The Python script (`enrich_posters.py`) fetches poster URLs and adds them to DynamoDB. Replaced all the colored placeholder boxes with actual movie posters.

**Deferred:** skeleton loading states, dark mode, more responsive polish. All came later.

**What I learned:** TanStack Query is fantastic for API calls. It handles caching, loading states, and refetching without me writing any of it.

---

## Phase 5: Search ✅

Simple title search first. When the server starts, it loads all movie metadata into memory (~5MB for 45K movies). Users type, the server does a `contains` match sorted by popularity.

Added a debounced search bar in the header - waits 300ms after you stop typing, then shows a dropdown with posters, titles, years, ratings. Click one and you go straight to the movie page.

**Why in-memory instead of DynamoDB?** DynamoDB scans are slow and expensive. Loading everything into memory at startup is way faster for the size of dataset I have. Phase 6 replaces this with vector search anyway.

**What I learned:** Debouncing in React, when to use in-memory indexes vs hitting the database every time.

---

## Phase 6: Semantic Search ✅

This is where it gets fun. "Movies about loneliness in space" should return Interstellar, not nothing.

How it works:
1. Python script generates embeddings for every movie (title + overview → 384-dim vector). Uses sentence-transformers all-MiniLM-L6-v2. Free, local, runs on CPU.
2. Spring Boot loads all those vectors into memory at startup
3. When a user searches, a separate Python server embeds their query into a vector
4. Java does cosine similarity between the query vector and every movie vector
5. Returns the top matches

**Why two processes?** I tried Spring AI with ONNX first. Failed because my Amazon Linux 2 box has GLIBC 2.26 and ONNX needs 2.27+. So I spun up a tiny Python HTTP server on port 8081 that just embeds queries. Java calls it over HTTP.

Results are good: "space exploration" → Interstellar #1, "dark crime thriller" → Dark Knight #1.

**What I learned:** Embeddings, cosine similarity, why GLIBC versions matter, when to use PyTorch vs ONNX.

---

## Phase 7: Chat with an AI Sommelier ✅

Built a chat endpoint that streams responses word-by-word using Server-Sent Events (SSE).

How it works (RAG pipeline):
1. User types a message
2. Embed the message into a vector
3. Do semantic search for relevant movies
4. Build a response using the matches

Right now there's no LLM - it's template-based. That was intentional. The plumbing for real LLM calls is all there (SSE streaming, message formatting), so swapping in Groq or OpenAI later is a one-line change.

The frontend shows messages appearing word-by-word, plus clickable movie poster cards in the chat. Suggested prompts on empty state so people know what to ask.

**Why no LLM yet?** Ollama won't run on my box (GLIBC again). Groq has a free tier but I wanted to ship the UX first. When I'm ready, it's drop-in.

---

## Phase 8: Accounts, Watchlist, Ratings ✅

Added user accounts with Spring Security and JWT. Register, login, stay logged in for 7 days. Passwords hashed with BCrypt.

Watchlist: click a button on any movie to save it. Ratings: 5 stars on the detail page.

User data lives in the UserActivity table:
- `USER#<id>, #PROFILE` for the account itself
- `USER#<id>, WATCHLIST#<movieId>` for watchlist items
- `USER#<id>, RATING#<movieId>` for ratings
- GSI3 for email lookups

The frontend stores the JWT in localStorage and attaches it to API calls via a context. Navigation swaps between "Sign In" and the username depending on auth state.

**What I learned:** Spring Security filter chain, JWT basics, how to wire auth context through React with hooks.

---

## Phase 9: Stats and Polish ✅

Built a stats page: total ratings, average rating, watchlist count, genre breakdown in a bar chart. Aggregates everything server-side from the user's ratings and watchlist.

Also ran a polish pass:
- Dark/light mode toggle (☀️/🌙)
- Loading spinners instead of "Loading..." text
- Toast notifications when you add to watchlist or rate something
- Fixed all the frontend routes (had a mix of `/movies/` and `/movie/` - standardized to singular)

**Deferred:** AI taste profile (generate a vector from your ratings, find movies close to it), Letterboxd CSV import.

---

## Phase 10: Tests ✅

Backend tests with JUnit 5 and Mockito. Covered the movie service, auth controller, JWT utilities. Happy paths and a few failure cases.

Frontend tests deferred. I know I should do them but I wanted to ship the visual phases first.

---

## Phase 11: CI/CD and Docker ✅

GitHub Actions workflow that runs on every push: backend build + tests, frontend build, in parallel. Takes about 3 minutes.

Backend Dockerfile is multi-stage - Corretto 21 Alpine base, gradle build in one stage, slim runtime in the next. Image is small.

README got a rewrite with architecture diagram (Mermaid), features table, and a copy-paste "get it running" section.

**Deferred:** actual cloud deploy (Render/Vercel), AWS CDK for the DynamoDB tables.

---

## Phases 12-17: Visual Redesign ✅

Halfway through I decided the app looked like every other movie grid clone. So I did a full visual rebuild inspired by restaurant menus and wine bar vibes. The phase names got thematic: The Cookbook, The Tasting Menu, The Chef's Table, The Kitchen, The Wine List, The Reservation.

**Phase 12 - The Cookbook** (visual identity): Playfair Display for headings, Inter for body. Deep navy base, warm amber accents, soft cream text. Installed Framer Motion for page transitions and physics.

**Phase 13 - The Tasting Menu** (home + browse): Full-width hero on the home page. Staff Picks carousel. Mood tiles that trigger pre-built semantic searches. Masonry grid on browse with genre pills and a decade scrubber. Cards tilt on hover based on mouse position.

**Phase 14 - The Chef's Table** (movie detail): Editorial magazine layout. Parallax background poster. Sticky floating action bar for watchlist/rate/share. Genre-colored tags. Drop cap on the overview. Stars that fill with a pour animation when you rate.

**Phase 15 - The Kitchen** (chat redesign): Dark ambient gradient background that slowly shifts. Typewriter effect on messages (faster on common words, natural rhythm). Movie recs slide in as horizontal tasting cards. A mood dial at the top lets you set the vibe before chatting.

**Phase 16 - The Wine List** (stats + profile): "Your Year in Movies" intro. Numbers count up from zero. Animated donut chart for genre breakdown. Achievement badges - First Taste, Connoisseur, Sommelier. Confetti when you unlock one.

**Phase 17 - The Reservation** (auth redesign): Split screen login. Rotating movie poster collage on the left, form on the right. Floating labels. Empty states with personality - "Your watchlist is emptier than a theater on a Tuesday afternoon. Let's fix that."

**Deferred in this batch:** onboarding flow for new users, radar chart for taste profile, profile page.

---

## Timeline

| Phase | What | Status |
|-------|------|--------|
| 1 | Setup + DDB design | ✅ |
| 2 | ETL to DynamoDB | ✅ |
| 3 | Java API | ✅ |
| 4 | React frontend + posters | ✅ |
| 5 | Title search | ✅ |
| 6 | Semantic search | ✅ |
| 7 | AI chat | ✅ |
| 8 | Auth + watchlist + ratings | ✅ |
| 9 | Stats + polish | ✅ |
| 10 | Tests | ✅ |
| 11 | CI + Docker | ✅ |
| 12 | Visual identity | ✅ |
| 13 | Home + browse redesign | ✅ |
| 14 | Movie detail redesign | ✅ |
| 15 | Chat redesign | ✅ |
| 16 | Stats redesign | ✅ |
| 17 | Auth redesign | ✅ |

About 19 weeks total at evening/weekend pace.

---

## What's Left

Deferred items I want to come back to:
- Cursor pagination on the movies endpoint
- OpenAPI/Swagger docs
- Frontend tests (Vitest + Playwright)
- Cloud deploy (Render + Vercel)
- AWS CDK for the DynamoDB tables
- Embed the full 45K dataset (only embedded 10 test movies so far)
- Real LLM in chat (swap template for Groq)
- Onboarding flow for new users
- Letterboxd CSV import
- AI taste profile

---

## What the Finished App Does

Open it and you can:
- Browse 45K+ movies with real posters and cast info
- Search by title or by mood ("heist movies with dark humor")
- Chat with an AI movie expert
- See similar movies on every detail page
- Sign up, rate movies, save a watchlist
- See your stats: genre breakdown, rating distribution
- Unlock achievement badges

And if someone's looking at the GitHub:
- Clean Spring Boot + React architecture (not a tutorial copy)
- DynamoDB single-table design
- Local AI that actually works (no API bills)
- Test suite
- Docker one-liner setup
- CI pipeline
- Architecture diagram in the README
