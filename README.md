# 🐘 BAPPA MODE (Morya) — Real-World Ganpati Pandal Exploration Game

> **"Find Bappa. Explore. Compete."**

**Bappa Mode** is a mobile-first real-world exploration web game built for **Ganesh Chaturthi**. Inspired by the gameplay loop of Pokémon GO, it turns city exploration into an interactive treasure hunt for Ganpati pandals with live proximity detection, photography showcase, dynamic daily quests, squad challenges, and soft leaderboards.

---

## 🎮 Core Game Loop

```
📍 See Bappa nearby → 🚶 Go there → 📸 Capture → 🐘 Unlock → 🏆 Score → 📸 Share → 👥 Challenge friends → 🔎 Find next Bappa
```

1. **Fog of Discovery**: Pandals within 2km appear as mysterious signals with distance. Approaching reveals pandal identity, and entering 150m unlocks the discovery trigger.
2. **Anonymous Instant Identity**: No login required. Users get a server-verified unique identity (e.g. `BAPPA EXPLORER #4821`).
3. **Bappa Lens**: Crowdsourced pandal photography showcase with category voting.
4. **Squads & Leaderboards**: Compete with friends using custom `MORYA-XXXX` squad codes or view global/city leaderboards.
5. **Daily Quests & Achievements**: Dynamic objectives based on nearby pandals and night darshan milestones.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Database & ORM**: SQLite (via LibSQL driver adapter) & Prisma 7
- **Maps**: Leaflet + CartoDB Dark Matter tiles (zero API key dependency)
- **Animations**: Framer Motion
- **Styling**: TailwindCSS 4 + Custom Traditional Indian Gold/Saffron Design System
- **Identity & Auth**: JOSE JWT Session Tokens + Anonymous persistent UUID device identity

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/rushikeshmalgan/Morya.git
cd Morya
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Setup Database & Seed
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```
*Seeds 50 real-world Pandals across Pune, Mumbai, Nashik, and Nagpur.*

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile device or browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed 50 pandals, quests & achievements |
| `npm run db:reset` | Reset and re-seed database |

---

## 🐘 Ganpati Bappa Morya!
Built with ❤️ for the Ganesh Chaturthi festival.
