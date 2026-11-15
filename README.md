# Agent Skill Radar

**Agent Skill Radar** is a production-ready AI Agent Skill Intelligence, Discovery, Static Security Auditing (SAST), Ranking, and Recommendation Platform.

It automatically discovers, parses, scores, security-audits, and recommends AI Agent Skills (`SKILL.md` manifests and compatible skill packages) across:
- **GitHub Repositories & GitHub Search API** (`filename:SKILL.md`, `topic:agent-skills`)
- **skills.sh** (`vercel-labs/agent-skills` & ecosystem directory)
- **Anthropic Official Skills** (`anthropics/skills`)
- **Antigravity Awesome Skills** (`sickn33/antigravity-awesome-skills`)
- **Full-Stack Three.js Skills** (`full-stack-skills/threejs-skills`)
- **OpenClaw Skill Ecosystem** (`openclaw/skills`)
- **Dynamic Custom Repositories** added via the UI or REST API

---

## 1. Architecture & Monorepo Structure

```text
agent-skill-radar/
├── packages/
│   └── shared/                        # Shared TypeScript types, weighted scoring formulas, S/A/B/C/D tier logic
│       └── src/
│           ├── index.ts
│           └── index.spec.ts          # Unit tests for scoring & tier calculation
├── apps/
│   ├── backend/                       # NestJS REST API, Discovery Engine, AI Analyzer, Static Security Scanner
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # 14 normalized PostgreSQL models with indexes & constraints
│   │   │   └── migrations/            # SQL database migrations
│   │   └── src/
│   │       ├── analyzer/              # Weighted AI Skill Analyzer (Verified Evidence vs AI Inference)
│   │       ├── security/              # Zero-Execution Static Security Scanner (9 rule categories)
│   │       ├── discovery/             # 13-Step Scheduled & Manual Daily Discovery Engine
│   │       ├── recommendations/       # 8-Track Recommendation & Stack Synergy Engine
│   │       ├── database/              # Persistence & seed service
│   │       ├── api/                   # REST API Controller (/api/*)
│   │       └── radar.spec.ts          # Backend unit & integration test suite
│   └── frontend/                      # Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts
│       └── src/
│           ├── app/                   # 12-Page Dark Intelligence Dashboard interface
│           ├── components/            # Reusable SkillCard, SkillDetailView, Badges
│           └── lib/                   # Typed API client
├── docker-compose.yml                 # PostgreSQL 16 + Redis 7 + Backend + Frontend stack
├── .env.example                       # Complete environment variable template
└── package.json                       # Workspace scripts
```

---

## 2. Features & 12 Application Views

1. **Overview Dashboard**: Real-time KPIs (total skills, new today, S-tier count, security warnings), Recharts discovery activity & category distribution charts, and date range filters (`Today`, `Last 7 Days`, `Last 30 Days`, `Custom Date`).
2. **Daily Discoveries**: Automated daily executive briefing report and newly discovered/updated skill manifests.
3. **Trending Skills**: Momentum leaderboard combining GitHub star velocity and Skill Intelligence Score.
4. **Skill Explorer**: Full-text search, category filter, agent compatibility filter, ranking tier (`S/A/B/C/D`) filter, discovery date filter, and sorting by Score, Popularity, or Latest Updates.
5. **Skill Details**: Deep inspection view with 6-dimension score breakdown, explicit separation of **Verified Evidence** (`VERIFIED_EVIDENCE`) vs **AI Inference** (`AI_INFERENCE`), live `SKILL.md` preview & re-analyzer sandbox, version history, and verified installation command copy.
6. **Skill Comparison**: Side-by-side matrix comparing 2–4 skills across all 6 weighted dimensions with an automated winner recommendation.
7. **AI Recommendations**: Curated recommendations across 8 specialized tracks (*Coding Agents*, *Autonomous Agents*, *Browser Automation*, *Research Agents*, *DevOps*, *3D Development*, *Backend Development*, *Security Analysis*).
8. **Security Analysis**: Zero-execution static SAST command center detecting remote shell pipes, credential harvesting, hardcoded API keys, destructive filesystem ops, unauthorized network exfiltration, obfuscated payloads, prompt injection, and unexpected binary executables.
9. **Repository Explorer**: Inspect tracked repositories and dynamically scan any `owner/repository` on GitHub.
10. **Saved Skills**: Bookmark skills into workspace folders.
11. **Scan History**: Full audit logs of the 13-step discovery workflow, job retries, and rate-limit telemetry.
12. **Settings**: Configure LLM provider (`heuristic`, `openai`, `anthropic`, `gemini`), cron frequency, rate limits, and discovery sources.

---

## 3. Quick Start (Local Development)

### Prerequisites
- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- *(Optional)* **Docker & Docker Compose** for containerized PostgreSQL 16 & Redis 7

### Step 1: Configure Environment
```bash
cp .env.example .env
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Shared Package & Backend, and Seed Data
```bash
npm run build --workspace=packages/shared
npm run build --workspace=apps/backend
npm run db:seed
```

### Step 4: Run Unit & Integration Tests
```bash
npm test
```

### Step 5: Start Backend & Frontend Servers
```bash
# Terminal 1: Start NestJS Backend on http://localhost:4000
npm run dev:backend

# Terminal 2: Start Next.js Frontend on http://localhost:3000
npm run dev:frontend
```

Open **http://localhost:3000** in your browser.

---

## 4. Docker Compose Deployment

To run the full stack with PostgreSQL 16, Redis 7, NestJS Backend, and Next.js Frontend in containers:

```bash
docker compose up --build -d
```

---

## 5. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Overview metrics, charts, trending, top-rated, security warnings (`?range=today\|7d\|30d\|custom`) |
| `GET` | `/api/skills` | Paginated skill explorer with search, category, agent, ranking, date, and sort filters |
| `GET` | `/api/skills/trending` | Trending skills ranked by momentum index |
| `GET` | `/api/skills/daily` | Daily discoveries and latest daily executive report |
| `GET` | `/api/skills/ranking` | Skills grouped by S / A / B / C / D tier |
| `GET` | `/api/skills/search?q=` | Full-text search across skill manifests and repositories |
| `GET` | `/api/skills/:id` | Full skill details, versions, and related skills |
| `GET` | `/api/skills/:id/analysis` | Structured AI Skill Analysis report (Verified Evidence vs AI Inference) |
| `GET` | `/api/skills/:id/security` | Static security audit report and line-level findings |
| `POST` | `/api/skills/:id/analyze` | Re-run AI & Static Security analysis on a skill manifest |
| `POST` | `/api/skills/compare` | Compare 2–4 skills side by side across all 6 weighted dimensions |
| `POST` | `/api/discovery/scan` | Trigger manual, incremental, or custom GitHub repo discovery scan |
| `GET` | `/api/discovery/history` | Scan execution logs, job status, and configured sources |
| `GET` | `/api/recommendations` | 8-track AI skill recommendations & saved stack synergies |
| `GET` | `/api/reports/daily` | Daily intelligence reports |
