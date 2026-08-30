# 🐘 Morya — Real-World Ganpati Pandal Exploration Game

**Find Bappa. Explore. Compete. Share.**

Morya is a mobile-first, location-based Ganpati pandal exploration game built for Ganesh Chaturthi. Inspired by the exploration mechanics of Pokémon GO and the social nature of Instagram, it turns pandal-hopping into a city-wide adventure — instead of searching for pandals online, users go outside, discover Bappa with GPS-verified check-ins, capture moments, and help the community map grow.

```
📍 Discover → 🚶 Explore → 🛕 Reach Pandal → 📸 Capture → ✨ Score → 👥 Compete → 🔎 Find the Next Bappa
```

---

## What's live today

### 📍 GPS-Verified Discovery
Nearby pandals appear as "fogged" signals on the map and reveal themselves as you approach. A discovery is only awarded once you're server-verified within the check-in radius — it can't be claimed by tapping a button from home.

### 🗺️ Interactive Map
A Leaflet-based map showing nearby and Famous Pandals, your live position, distance to each pandal, and turn-by-turn walking directions to a chosen destination (via OSRM road routing, with a straight-line fallback).

### 🛕 Famous Pandals
A curated list of well-known pandals per city, filterable and browsable independent of proximity.

### ➕ Community Pandal Submissions
Anyone can submit a pandal that isn't on the map yet (name, photo, GPS location, details). Submissions go to **admin moderation** before they become visible to everyone. An approved submission earns the contributor the **Pandal Pioneer** achievement.

### 📸 Bappa Lens
A community photography showcase. Users upload photos after a verified visit; photos go through moderation before appearing publicly, and the community can vote on favorites.

### 🎯 Daily Quests
Dynamic, location-aware objectives (e.g. "discover 2 nearby pandals," "visit after 7 PM") that refresh and reward points on completion.

### 🔥 Streaks
A day-over-day exploration streak, tracked per user, to encourage returning throughout the festival rather than a single visit.

### 👥 Squads
Create or join a squad with a shareable code and see how your group stacks up against each other.

### 🌎 Leaderboards
Global, city, and squad-scoped rankings based on unique pandals discovered.

### 🐭 Mushak Maharaj
A small companion character with contextual reactions to discoveries, quests, and milestones — a light personality layer, not a chatbot.

### 🔐 Anonymous, No-Signup Identity
No email or password. Opening the app generates a persistent anonymous identity (device UUID + server-issued session token) and you're exploring within seconds. Private device identifiers are never exposed publicly.

### 🛡️ Admin Moderation
A password-protected admin dashboard for reviewing and approving/rejecting submitted pandals and photos, backed by signed, expiring server-side sessions.

---

## 🚧 In progress — the next milestone

These are designed and actively being built, not yet shipped:

| Feature | What it'll do |
|---|---|
| **Formal XP & Levels** | Turn the existing points system into a centralized, transparent XP ledger with ~10–15 named levels (e.g. *Darshan Hunter → Morya Scout*) |
| **Custom Badge Collection** | Purpose-designed festival badges (not generic emoji) with rarity tiers, replacing/extending today's achievement list |
| **Darshan Tours** | Multi-pandal route planning — select several pandals, get an optimized visiting order and a real walking route |
| **Social Sharing** | Optional WhatsApp sharing and generated Instagram Story–ready cards (9:16) for discoveries, badges, and completed tours — original photos are never modified |

Until these ship, don't take the marketing copy for them at face value — this README will be updated as each lands.

---

## 🎨 Design Philosophy

*Indian Tradition × Modern Gen-Z UI × Game Mechanics*

Warm cream, soft peach, saffron, terracotta, muted gold, warm brown, and soft green, with mandala/rangoli-inspired detailing, smooth motion, and game-style feedback. The goal: **festive and premium, not childish.**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Maps | Leaflet + React-Leaflet, CartoDB tiles |
| Routing | OSRM road-network walking directions with a haversine fallback |
| Database | Prisma 7 (driver adapters) over SQLite locally / hosted libSQL (e.g. Turso) in production |
| Identity | Anonymous device UUID + server-issued opaque session tokens (not JWT) |
| Image Storage | Provider-agnostic abstraction — local filesystem in dev, S3-compatible storage in production |
| Deployment | Vercel |

---

## 🚀 Getting Started

### 1. Clone
```bash
git clone https://github.com/rushikeshmalgan/Morya.git
cd Morya
```

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Fill in the values you need — see `.env.example` for what's required locally vs. only in production (production database, image storage, and admin credentials).

### 4. Generate the Prisma client
```bash
npm run db:generate
```

### 5. Set up the database
```bash
npm run db:migrate
```

### 6. Seed development data
```bash
npm run db:seed
```
Seeds real-world pandals across Pune, Mumbai, Nashik, and Nagpur, plus starter quests and achievements.

### 7. Run it
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — best viewed on a mobile device or with your browser's device toolbar open.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Run database migrations (`prisma migrate dev`) |
| `npm run db:seed` | Seed pandals, quests, and achievements |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset and re-seed the local database |
| `npm run setup` | Generate client + migrate + seed in one step |

---

## 🌱 The Bigger Idea

Morya is meant to be a community-powered festival discovery network, not just a static list of pandals:

```
User A finds a pandal → submits it → community/admin verifies it →
it goes public → User B discovers it → captures a photo →
photo enters Bappa Lens → User B shares it → User C joins Morya
```

The more people explore, the better the map gets for everyone.

---

🐘 **Ganpati Bappa Morya!** Built with ❤️ for Ganesh Chaturthi.
