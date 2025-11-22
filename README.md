🚀 Firebolt — Leads & Offers Platform
A full-stack system built with React + Node + Firebase for managing users, offers, and leads.
Includes an Admin Panel, secure APIs, Firestore rules, and E2E tests.

📌 Features
    🔐 Auth & User Management:
        → Firebase Email/Password login
        → Google Sign-In
        → Protected routes
        → Admin role support
        → Display name setup during registration

🎁 Offers System
    User Side:
        → Users can view offers assigned to them
        → Accept or decline offers
        → Activity tracked with timestamps

   Admin Side:
        → Create offers for any user
        → Mark offers as accepted
        → View all offers
        → Track offer KPIs

🧲 Leads System
    Create / edit / delete admin-created leads
    Filter, view and manage all leads
    Dashboard KPI tracking
    Audit log entries for each action

🛡 Security
    Firestore rules block unauthorized access
    Admin-only access for sensitive paths
    Token-based backend verification
    Fully tested using the Firestore emulator

🧱 Project Structure
    Firebolt_LeadsOffers/
│
├── backend/
│   ├── index.js                # Express backend + admin APIs
│   ├── routes/
│   │   ├── webhook.js          # Webhook + API routes
│   │   └── ...other routes
│   └── config/
│       ├── serviceAccountKey.json
│       └── ...other config
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Topbar.jsx
│       │   ├── AuthStatus.jsx
│       │   ├── KyCUpload.jsx
│       │   └── ...other components
│       ├── contexts/
│       │   └── AuthContext.jsx
│       ├── lib/
│       │   ├── authedFetch.js
│       │   └── firebase.js
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Reset.jsx
│           ├── Dashboard.jsx
│           ├── Profile.jsx
│           ├── Offers.jsx
│           ├── Admin.jsx
│           ├── AdminUsers.jsx
│           ├── AdminOffers.jsx
│           └── AdminLeads.jsx
│
├── firestore.rules             # Firestore security rules
├── firebase.json               # Firebase config & emulators
│
├── firestore-rules-tests/
│   ├── package.json
│   ├── rules.test.js           # Firestore rules unit tests
│   └── ...node_modules
│
├── tests/
│   ├── e2e-happy-path.spec.js  # Playwright E2E tests
│   └── ...test config
│
├── test-results/               # Playwright output snapshots
│
├── .firebaserc
├── .gitignore
├── .gitmodules
├── .firebase.json
├── firestore-debug.log
├── firestore.rules
├── playwright.config.js
└── README.md

🛠 Tech Stack
    Frontend
        → React + Vite
        → Tailwind CSS
        → React Router
        → Firebase Auth (client SDK)


Backend
    → Node.js + Express
    → Firebase Admin SDK
    → Cloudinary (optional)
    → Multer file handling

Database
    → Firestore
    → Firestore Security Rules

Testing
    → Firestore Emulator
    → Playwright E2E
    → Jest (rules testing)

🔐 Environment Variables
    frontend/.env
        VITE_FIREBASE_API_KEY=
        VITE_FIREBASE_AUTH_DOMAIN=
        VITE_FIREBASE_PROJECT_ID=
        VITE_FIREBASE_STORAGE_BUCKET=
        VITE_FIREBASE_MESSAGING_SENDER_ID=
        VITE_FIREBASE_APP_ID=

# Backend URL
VITE_BACKEND_URL=http://localhost:5001

🧑‍💻 Local Development Setup
    1️⃣ Install Frontend
        cd frontend
        npm install
        npm run dev
runs at:
👉 http://localhost:5173


2️⃣ Install Backend
    cd backend
    npm install
    node index.js

runs at:
👉 http://localhost:5001


