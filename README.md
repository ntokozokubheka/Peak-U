# Peak U

A student support app that treats students like athletes: a **form score**, **today's training** checklist with points, a **Study Lab** with a Coach AI, a **Season** view with benchmarks and an exam calculator, and **captains** (student mentors).

**Stack:** React (Vite) + Node.js (Express) + PostgreSQL. Almost everything is plain JavaScript. The maths lives in small pure functions in `server/src/logic/`, with tests.

> **Status, honestly:** the maths logic has 11 passing tests and every server file passes a syntax check. The full app (install, database, browser) has **not** been run end to end by the person who wrote it, so expect a small fix or two on first run. Paste any error text back into Claude and it will be quick to fix.

## Quick start (about 5 minutes)

You need Node 18+ and a Postgres database (Docker is the easiest).

```bash
docker compose up -d                 # starts Postgres (or use any Postgres)
cp 
```server/.env.example server/.env   # then edit if needed
npm run install:all
npm run db:setup                     # creates tables + demo data
npm run dev                          # server :4000, React :5173

Open http://localhost:5173 and log in with **demo@peaku.test / demo1234**.

**No Anthropic key?** Study Lab still works and returns clearly labelled sample answers (demo mode). Add `ANTHROPIC_API_KEY` to `server/.env` for real coaching.

## Where to change things

| I want to change... | Edit this |
|---|---|
| Colours, fonts, shapes | `client/src/styles.css` (variables at the top) |
| Menu and pages | `client/src/App.jsx` and `client/src/pages/` |
| Form score weights, thresholds, labels | `server/src/logic/formScore.js` |
| Points cap, streak rule | `server/src/logic/points.js` |
| The 12 daily items and their points | `server/db/seed.js` (habits list) |
| Default target and pass mark | `server/src/routes/season.js` |
| Exam calculator, course mark | `server/src/logic/examNeeded.js` |
| How captains are ranked | `server/src/logic/captainMatch.js` |
| How the Coach AI behaves | `server/prompts/coach.md` |
| AI model | `ANTHROPIC_MODEL` in `server/.env` |
| Demo students, modules, marks | `server/db/seed.js` (then `npm run db:reset`) |
| Add a new API feature | new file in `server/src/routes/`, mount it in `server/src/index.js` |

## How it fits together

```
React (client/)  --/api-->  Express (server/src/routes)  -->  PostgreSQL
                                   |--> logic/  (pure maths, tested)
                                   |--> ai/coach.js --> Claude API (key stays on the server)
```

- `routes/` take requests and run SQL. `services/scoreData.js` gathers numbers for the score. `logic/` does the maths and knows nothing about the database.
- The server also serves the built React app in production, so **one service hosts everything**.

## Hosting for your demo

Easiest: one **Render** web service plus a Postgres database (a `render.yaml` blueprint is included; check Render's current free-tier limits). Railway, Fly.io and others work the same way.

1. Push this folder to GitHub.
2. Create a web service. **Build:** `npm run install:all && npm run build`. **Start:** `npm start`.
3. Create a Postgres database and set these environment variables on the service: `DATABASE_URL`, `DATABASE_SSL=true`, `JWT_SECRET` (long random text), `NODE_ENV=production`, and optionally `ANTHROPIC_API_KEY`.
4. Load the tables once, from your computer, using the database's external connection string:
   `DATABASE_URL="postgres://..." DATABASE_SSL=true npm run db:setup`
5. Open the service URL.

Neon or Supabase also give free Postgres; paste their connection string into `DATABASE_URL`.

**Before sharing publicly:** the seed creates a demo account with a known password. Remove it or change the password, never commit `.env`, and keep `JWT_SECRET` private.

## Tests

```bash
npm test
```

Covers the form score (including the worked example 77.8 → 78), labels, missing and paused pillars, the exam calculator, benchmarks, the points cap, streaks and captain ranking.

## API summary

All routes except auth need `Authorization: Bearer <token>`.

`POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` · `GET /api/score` · `GET /api/habits/today` · `POST /api/habits/:id/toggle` · `GET /api/habits/summary` · `POST /api/checkins` · `GET /api/season` · `POST /api/season/target` · `POST /api/season/exam-needed` · `GET /api/captains?moduleId=&level=` · `GET /api/captains/:id/slots` · `POST /api/captains/book` · `POST /api/study/scan` · `POST /api/study/similar` · `POST /api/study/paper` · `GET /api/study/modules`

## Known limits (good next steps)

- **Designed but not built yet:** Community board, Calendar optimizer, Applications and Pathways trackers, Start Pack PDF, Department portal, payments, notifications. Each fits the same pattern: a table in `schema.sql`, a file in `routes/`, a page in `pages/`.
- Captain bookings are free-only in this starter. Plug Stripe or Paystack into `routes/captains.js` where marked.
- Peer comparison (cohort median) is not included, to protect student wellbeing; add it opt-in with groups of 10 or more.
- The AI daily limit is stored in memory and resets on restart. Use the database or Redis in production.
- Add row-level checks and an audit log before real student data goes in. Follow the privacy rules that apply to you (for South Africa, POPIA).
- Study Lab's coach is told not to write students' work, but no prompt is a guarantee. Review outputs.
