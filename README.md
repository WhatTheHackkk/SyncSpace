# SyncSpace 🚀
> Lean, fast, college-exclusive matchmaking platform helping students find teammates for hackathons and tech events without social friction.

---

## ⚡ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Lucide Icons.
* **Backend:** Node.js, Express.js, Cors, dotenv, Nodemailer.
* **Database:** MongoDB (via Mongoose) with automatic embedded MongoDB fallback for instant zero-config testing.

---

## 📂 Project Architecture

```
SyncSpace/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation, cohort switcher, branding
│   │   │   ├── PostCard.jsx    # Event details, skills chips, "Count Me In" button
│   │   │   ├── Modal.jsx       # Confirmation pop-up & Nodemailer POST trigger
│   │   │   └── CreatePostModal.jsx # Publish new teammate requests
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global mock auth & semester switcher
│   │   ├── pages/
│   │   │   └── Feed.jsx        # Semester-filtered feed & live search
│   │   ├── services/
│   │   │   └── api.js          # Central Axios configuration
│   │   ├── App.jsx             # React Router setup
│   │   ├── index.css           # Tailwind directives & design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js          # Dev proxy to port 5000
│
├── server/                     # Express & MongoDB Backend
│   ├── models/
│   │   ├── User.js             # name, collegeEmail (unique), semester
│   │   ├── Event.js            # eventName, organizingClub, eligibleSemesters, deadlineDate, points
│   │   └── Post.js             # posterId, eventId, isSpecificRoleNeeded, requestedSkills
│   ├── routes/
│   │   ├── feed.js             # GET /api/feed/:userSemester (strictly filters by eligibleSemesters)
│   │   └── join.js             # POST /api/join (Nodemailer email dispatch to poster)
│   ├── db.js                   # MongoDB connection manager (Local / Atlas / Embedded fallback)
│   ├── seed.js                 # Seed script for dummy users, events, and posts
│   └── server.js               # Express application entrypoint
│
└── package.json                # Root monorepo scripts
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In /server
cd server
npm install

# In /client
cd ../client
npm install
```

### 2. Seed Database
Populate the database with test events, students with different cohorts, and posts:
```bash
cd server
npm run seed
```

### 3. Run Application
In one terminal, start the backend API:
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

In a second terminal, start the frontend:
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🧪 MVP Verification

1. **Semester-Filtered Feed:**
   * **Alex Rivera (`Sem 4`):** Automatically views events matching `Sem 4` (e.g. *HackPulse 2026*, *CodeClash*, *Campus Algorithm Marathon*). Events not eligible for `Sem 4` (e.g. *Senior Capstone Hack*) are strictly excluded.
   * **Priya Sharma (`Sem 6`):** Clicking the cohort switcher in the top navigation dynamically updates the feed to show events eligible for `Sem 6` (*HackPulse 2026*, *Senior Capstone Hack*), filtering out junior events.

2. **Matchmaking & Nodemailer Trigger:**
   * Clicking the **"Count Me In!"** button on any post triggers the confirmation modal.
   * Confirming fires a `POST` to `/api/join` with `postId`, `requesterEmail`, and `posterEmail`.
   * Nodemailer dispatches the standard campus matchmaking notification:
     > *"A student wants to team up with you for [Event Name]! Check their profile."*
   * An Ethereal sandbox link is returned in development to preview the styled email in one click.
