<p align="center">
  <h1 align="center">🎬 Not Another Rewatch</h1>
  <p align="center">
    <em>Because you've seen The Office enough times.</em>
    <br/>
    <strong>AI-powered movie discovery that actually gets you.</strong>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/DynamoDB-Single_Table-4053D6?logo=amazondynamodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Semantic_Search-FF6F61" />
</p>

---

## 🤔 The Problem

Every night, same ritual. Open Netflix. Scroll for 45 minutes. Pick The Office again. Food gets cold. Dreams die quietly.

## 💡 The Solution

An app where you say *"dark crime thriller with plot twists"* and it actually understands what you mean. Not keyword matching. Not "because you watched Breaking Bad, here's a cooking show." Real, semantic understanding of movie vibes.

---

## ✨ What You Can Do

| | Feature | How It Works |
|---|---------|-------------|
| 🔍 | **Semantic Search** | "movies about existential dread in space" → Interstellar #1 |
| 💬 | **AI Chat** | Streaming recommendations with clickable poster cards |
| ⭐ | **Rate & Track** | 5-star ratings, watchlist, personal stats dashboard |
| 🧠 | **Similar Movies** | Every movie page shows AI-picked recommendations |
| 🌙 | **Dark/Light Mode** | Because your eyes matter at 2am |
| ⌨️ | **Keyboard First** | Press `/` to search from anywhere |

---

## 🏗️ How It's Built

```mermaid
graph LR
    subgraph 🖥️ Frontend
        React[React + TypeScript + Vite]
    end

    subgraph ⚙️ Backend
        API[Spring Boot 3.5 / Java 21]
        Auth[Spring Security + JWT]
    end

    subgraph 💾 Data
        DDB[(DynamoDB<br/>Single-Table Design)]
        Vec[In-Memory<br/>Vector Store]
    end

    subgraph 🧠 AI
        Embed[sentence-transformers<br/>all-MiniLM-L6-v2]
    end

    React -->|REST + SSE| API
    API --> DDB
    API --> Vec
    API --> Embed
    API --> Auth
```

> **Zero paid APIs.** The entire AI pipeline runs locally on CPU. No OpenAI key, no cloud ML service, no surprise bills.

---

## 🚀 Get It Running

```bash
git clone https://github.com/sandeepdanda/not-another-rewatch.git
cd not-another-rewatch

# 1. Fire up DynamoDB
cd infra/docker && docker compose up -d && cd ../..

# 2. Load movies (posters + embeddings included)
cd etl && pip install -r requirements.txt && ./setup.sh && cd ..

# 3. Start the brains (terminal 1)
cd etl && python embedding_server.py

# 4. Start the backend (terminal 2)
cd backend && ./gradlew bootRun

# 5. Start the frontend (terminal 3)
cd frontend && npm install && npm run dev
```

Open **localhost:5173** → search "movies about time travel" → enjoy.

**You'll need:** Docker, Node 18+, Java 21 ([mise](https://mise.jdx.dev/) handles this), Python 3.10+

---

## 🧩 Project Structure

```
not-another-rewatch/
├── 🖥️  frontend/       React 18 + TypeScript + Tailwind
├── ⚙️  backend/        Spring Boot 3.5 + Spring Security
├── 🐍  etl/            Data pipeline + embedding server
├── 🐳  infra/docker/   Docker Compose + LocalStack
├── 📋  docs/           Phase plan + design decisions
├── 📚  learning/       TIL entries (yes, I track what I learn)
└── 📊  data/           Pre-computed movie embeddings
```

---

## 🎯 Design Philosophy

**1. DynamoDB single-table design** — One query, one movie, all its data. Cast, crew, genres, everything. No JOINs, no N+1 problems.

**2. AI that doesn't cost money** — sentence-transformers runs on your CPU. 384 dimensions, 80MB model, zero API calls. The same model embeds both movies and your search queries.

**3. Break gracefully** — Embedding server down? Falls back to title search. No auth token? Browse freely. Every feature degrades, nothing crashes.

**4. Stream everything** — Chat responses arrive word-by-word via SSE. Swap in Groq or OpenAI later with a one-line change.

---

## 📈 The Journey

Built in 11 phases, from empty repo to full-stack app. Every phase documented in [phase-plan.md](docs/spec/phase-plan.md).

```
Phase  1 ✅  Project Setup & DynamoDB Design
Phase  2 ✅  ETL Pipeline (45K movies → DynamoDB)
Phase  3 ✅  Java REST API
Phase  4 ✅  React Frontend + TMDB Posters
Phase  5 ✅  Title Search
Phase  6 ✅  Semantic Search (free local AI)
Phase  7 ✅  AI Chat + Similar Movies
Phase  8 ✅  Auth + Watchlist + Ratings
Phase  9 ✅  Stats Dashboard + UI Polish
Phase 10 ✅  Testing
Phase 11 ✅  CI/CD + Docker + README
```

---

## 🔮 What's Next

- [ ] Real LLM in chat (Groq free tier → Llama 3)
- [ ] Full 45K movie embeddings
- [ ] Letterboxd CSV import
- [ ] Cloud deploy (Render + Vercel)
- [ ] Demo GIF in this README

---

<p align="center">
  <em>Made with ❤️ and an mass amount of caffeine</em>
  <br/>
  <em>No movies were rewatched in the making of this app 🍿</em>
</p>
