# CampusConnect AI — AI Interview Simulator & Campus Lost and Found Portal

**CampusConnect AI** is a modern, production-grade full-stack web platform built for college students. It pairs an **Adaptive AI Interview Simulator** with an **Intelligent Campus Lost & Found Registry** to accelerate student career readiness and ensure campus security and belonging recovery.

---

## 🌟 Major Modules & Core Capabilities

### Module 1 — AI Interview Simulator
- **Student Profile Analysis:** Analyzes candidate target job role, skills inventory, experience level, and difficulty.
- **Adaptive Question Generation:** Asks one personalized question at a time using Google's `@google/genai` (Gemini 3.8 Flash).
- **Intelligent Follow-Up Questions:** Automatically probes deeper into specific projects and frameworks mentioned in answers, or asks simplifying clarifying questions when answers lack depth.
- **Multi-Track Support:** Technical Engineering, HR / Culture Fit, Behavioral (STAR method), Coding Architecture, Aptitude, and Mixed Comprehensive interviews.
- **Speech & Audio Integration:**
  - Browser Speech Recognition (Web Speech API) with live pulse status.
  - Browser Text-to-Speech (speechSynthesis) to speak interviewer questions naturally.
- **Multi-Dimension Answer Evaluation:**
  - Technical Knowledge (25%)
  - Communication (20%)
  - Clarity (15%)
  - Confidence (15%)
  - Relevance (15%)
  - Problem Solving (10%)
- **Readiness Tier Scoring:** Circular score gauge, benchmark comparison (Excellent, Very Good, Good, Needs Improvement, Needs More Practice).
- **Exemplary AI Improved Answer:** Side-by-side comparison illustrating a benchmark response with quantified metrics.
- **Session History & Analytics:** Full question-by-question breakdown, feedback logs, and retry workflows.

---

### Module 2 — Campus Lost & Found Portal
- **Report Lost Belongings:** Report items with name, category, description, photo upload & preview, location, date, time, color, brand, unique identifiers, and contact preference.
- **Report Found Items:** Register found belongings with verification identifiers.
- **Multimodal AI Match Engine:** Intelligently evaluates similarity across:
  - Item Type & Category (30%)
  - Description Overlap (20%)
  - Campus Location Proximity (20%)
  - Date Proximity (10%)
  - Brand & Color (10%)
  - Unique Identifiers & Stickers (10%)
- **Automated Notifications:** Immediate high-match alerts (e.g. 94% Confidence) sent to student owners.
- **Privacy-Preserving Contact:** Secure in-app messaging between finder and owner without exposing personal phone numbers or addresses.
- **Moderator & Admin Controls:** Role-based approval, marking returned/resolved, and dispute handling.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 19 (SPA with Vite)
- **Styling:** Tailwind CSS v4 with modern SaaS design, responsive cards, and micro-interactions
- **Icons:** Lucide React
- **Animations:** Motion & Canvas-Confetti
- **Audio APIs:** Web Speech API (SpeechRecognition) & Web SpeechSynthesis (TTS)

### Backend
- **Runtime:** Node.js with Express
- **AI Service:** `@google/genai` SDK (`gemini-3.8-flash`) with telemetry headers and safe fallback mode
- **Authentication:** JWT (JSON Web Tokens) with 7-day expiration & bcrypt password hashing
- **Data Persistence:** Database engine pre-seeded with 10 demo users, 10 lost items, 10 found items, 5 completed interviews, and 10 notifications.

---

## 🔑 Demo Credentials

For quick evaluation, use the one-click demo role switcher in the top bar, or log in with:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Student** | `alex.rivera@campusconnect.edu` | `campus1234` | Alex Rivera (3rd Year CSE) |
| **Student 2** | `priya.sharma@campusconnect.edu` | `campus1234` | Priya Sharma (3rd Year ECE) |
| **Moderator** | `moderator@campusconnect.edu` | `campus1234` | Marcus Chen (Student Council) |
| **Admin** | `admin@campusconnect.edu` | `admin1234` | Dr. Elena Vance (Campus Dean) |

---

## 📂 Project Structure

```text
campusconnect-ai/
├── index.html                  # HTML entry point with Plus Jakarta Sans & meta tags
├── metadata.json               # Applet capabilities & metadata
├── package.json                # Project dependencies & fullstack start script
├── server.ts                   # Express server mounting Vite middlewares & API routes
│
├── server/
│   ├── aiService.ts            # Gemini 3.8 Flash SDK integration & adaptive fallback
│   ├── db.ts                   # Database engine with 10 users, 20 items, interviews & notifs
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication & role-based authorization
│   └── routes/
│       ├── auth.ts             # Registration, login, logout, switch-demo
│       ├── users.ts            # Profile endpoints
│       ├── interviews.ts       # Questions, follow-ups, answer grading, completion
│       ├── items.ts            # Lost & Found listings CRUD, report, contact
│       ├── matches.ts          # AI matching matrix & score calculation
│       ├── notifications.ts    # User notifications
│       └── admin.ts            # Administration metrics, moderation & disputes
│
└── src/
    ├── App.tsx                 # Root component & page router
    ├── index.css               # Global Tailwind CSS imports
    ├── main.tsx                # React DOM mount point
    ├── types/
    │   └── index.ts            # TypeScript interfaces
    ├── context/
    │   ├── AuthContext.tsx     # Authentication state & role switching
    │   └── ToastContext.tsx    # Toast notification engine
    ├── services/
    │   └── api.ts              # REST API client with Bearer token headers
    ├── components/
    │   ├── Navbar.tsx          # Navigation, notification bell, profile dropdown
    │   └── Footer.tsx          # Responsive footer & campus emergency contacts
    └── pages/
        ├── LandingPage.tsx     # Hero banner, feature showcases, metrics
        ├── LoginPage.tsx       # Auth login & instant demo switches
        ├── RegisterPage.tsx    # Student registration form
        ├── StudentDashboard.tsx# Metrics, readiness breakdown, quick cards
        ├── ProfilePage.tsx     # Profile & skill settings
        ├── NotificationsPage.tsx # Notification center
        ├── interview/
        │   ├── InterviewSetupPage.tsx   # Config role, skills, type, difficulty
        │   ├── InterviewSessionPage.tsx # Interactive room with voice & evaluation
        │   ├── InterviewResultPage.tsx  # Circular gauge, 6 metrics, feedback report
        │   └── InterviewHistoryPage.tsx # Sessions table & modal breakdown
        ├── lostfound/
        │   ├── LostFoundDashboard.tsx   # Listings search & category filters
        │   ├── ReportItemPage.tsx       # Lost & found submission form
        │   ├── ItemDetailPage.tsx       # Detail view, AI match list & contact modal
        │   └── MatchesPage.tsx          # 6-dimension AI match matrix
        └── admin/
            └── AdminDashboard.tsx       # Platform analytics, users, disputes
```

---

## 🚀 Running the Application

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Create or verify `.env`:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=campusconnect_super_secret_jwt_key
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Summary

- `POST /api/auth/register` — Create student account
- `POST /api/auth/login` — Sign in with email & password
- `POST /api/auth/switch-demo` — Instant demo role switch
- `POST /api/interviews/start` — Initiate mock session with AI question 1
- `POST /api/interviews/evaluate` — Evaluate answer across 6 dimensions
- `POST /api/interviews/followup` — Generate dynamic adaptive follow-up
- `POST /api/interviews/complete` — Finalize session & readiness report
- `GET /api/items` — Filter & search campus listings
- `POST /api/items/lost` — Report lost item & auto-check matches
- `POST /api/items/found` — Report found item
- `GET /api/matches/items/:id/matches` — AI similarity score & explanation
- `POST /api/items/:id/contact` — Secure private messaging
- `GET /api/admin/statistics` — Campus metrics & dispute oversight
