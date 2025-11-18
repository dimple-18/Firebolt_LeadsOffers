// backend/index.js

// ----------------- Core setup
require("dotenv").config(); // loads .env if present

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// ----------------- Firebase Admin (server-side)
const admin = require("firebase-admin");

// Service account JSON (keep this file gitignored!)
let serviceAccount;
try {
  serviceAccount = require("./config/serviceAccountKey.json");
} catch {
  console.warn(
    "⚠️ serviceAccountKey.json not found. Make sure GOOGLE_APPLICATION_CREDENTIALS is set, or add backend/config/serviceAccountKey.json"
  );
}

if (!admin.apps.length) {
  admin.initializeApp(
    serviceAccount
      ? { credential: admin.credential.cert(serviceAccount) }
      : { credential: admin.credential.applicationDefault() }
  );
}

const db = admin.firestore();

// ----------------- Optional Cloudinary
let cloudinary = null;
try {
  cloudinary = require("cloudinary").v2;
  cloudinary.config({ secure: true }); // will read CLOUDINARY_URL if present
} catch {
  /* cloudinary is optional */
}

// ----------------- App + middleware
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Multer: save temp files to ./uploads (easier to send to Cloudinary)
const upload = multer({ dest: path.join(__dirname, "uploads") });

// ----------------- Public routes
app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API is up" });
});

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "home page" });
});

// Silences Chrome/DevTools probe (returns 204 No Content)
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).end();
});

// ----------------- Auth middleware (verify Firebase ID token)
function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json({ ok: false, error: "Missing Bearer token" });
  }

  const idToken = match[1];

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decoded) => {
      req.user = decoded; // { uid, email, ... }
      next();
    })
    .catch((err) => {
      console.error("verifyIdToken error:", err?.message || err);
      res.status(401).json({ ok: false, error: "Invalid or expired token" });
    });
}

// ----------------- Admin-only middleware
async function verifyAdmin(req, res, next) {
  try {
    const uid = req.user.uid;

    const snap = await db.collection("users").doc(uid).get();
    const data = snap.data();

    if (!data || data.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Admin access only" });
    }

    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    return res.status(500).json({ ok: false, error: "Admin check failed" });
  }
}

// ===== ADMIN TEST ROUTE =====
app.get("/admin/test", verifyFirebaseToken, verifyAdmin, (req, res) => {
  res.json({ ok: true, message: "Admin access granted!" });
});

// ===== ADMIN SUMMARY ROUTE =====
// GET /admin/summary -> counts for dashboard cards
app.get("/admin/summary", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const usersSnap = await db.collection("users").get();
    const offersSnap = await db.collection("offers").get();

    const usersCount = usersSnap.size;
    const offersCount = offersSnap.size;

    let acceptedCount = 0;
    let declinedCount = 0;
    let pendingCount = 0;

    offersSnap.forEach((docSnap) => {
      const status = (docSnap.data().status || "pending").toLowerCase();
      if (status === "accepted") acceptedCount++;
      else if (status === "declined") declinedCount++;
      else pendingCount++;
    });

    res.json({
      ok: true,
      stats: {
        usersCount,
        offersCount,
        acceptedCount,
        declinedCount,
        pendingCount,
      },
    });
  } catch (err) {
    console.error("GET /admin/summary error:", err);
    res.status(500).json({ ok: false, error: "Failed to load admin summary" });
  }
});

// ===== ADMIN USERS LIST ROUTE =====
// GET /admin/users -> list all users from Firestore "users" collection
app.get("/admin/users", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const snap = await db.collection("users").get();

    const users = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || "",
        displayName: data.displayName || "",
        role: data.role || "user",
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });

    // ===== ADMIN: UPDATE USER ROLE =====

    // ===== ADMIN OFFERS & LEADS API (B15) =====

// POST /admin/offers  -> create a new offer for a user
app.post("/admin/offers", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, title, description, expiresAt } = req.body || {};

    if (!userId || !title) {
      return res.status(400).json({
        ok: false,
        error: "userId and title are required",
      });
    }

    // Optional: check that the target user actually exists (Firebase Admin)
    try {
      await admin.auth().getUser(userId);
    } catch (err) {
      return res.status(400).json({
        ok: false,
        error: "Target user does not exist in Firebase Auth",
      });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    const docData = {
      userId,
      title,
      description: description || "",
      status: "pending",              // default when created
      createdAt: now,
      updatedAt: now,
      createdBy: req.user.uid,        // which admin created it
    };

    // If an expiry date is provided, store as plain string for now
    if (expiresAt) {
      docData.expiresAt = expiresAt;
    }

    const ref = await db.collection("offers").add(docData);

    return res.json({
      ok: true,
      id: ref.id,
      offer: { id: ref.id, ...docData },
    });
  } catch (err) {
    console.error("POST /admin/offers error:", err);
    res.status(500).json({ ok: false, error: "Failed to create offer" });
  }
});

// GET /admin/leads  -> list leads (for future lead tracking)
app.get("/admin/leads", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const snap = await db
      .collection("leads")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const leads = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    res.json({ ok: true, leads });
  } catch (err) {
    console.error("GET /admin/leads error:", err);
    res.status(500).json({ ok: false, error: "Failed to load leads" });
  }
});

// POST /admin/offers/:id/accept -> admin-side acceptOffer
app.post(
  "/admin/offers/:id/accept",
  verifyFirebaseToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const offerId = req.params.id;

      const ref = db.collection("offers").doc(offerId);
      const snap = await ref.get();

      if (!snap.exists) {
        return res.status(404).json({ ok: false, error: "Offer not found" });
      }

      await ref.update({
        status: "accepted",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        adminAcceptedBy: req.user.uid,
        adminAcceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ ok: true, id: offerId, status: "accepted" });
    } catch (err) {
      console.error("POST /admin/offers/:id/accept error:", err);
      res.status(500).json({ ok: false, error: "Failed to accept offer" });
    }
  }
);


// POST /admin/users/:id/role  { role: "admin" | "user" }
app.post(
  "/admin/users/:id/role",
  verifyFirebaseToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;

      if (role !== "admin" && role !== "user") {
        return res
          .status(400)
          .json({ ok: false, error: "role must be 'admin' or 'user'" });
      }

      const docRef = db.collection("users").doc(userId);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ ok: false, error: "User not found" });
      }

      await docRef.set(
        {
          role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return res.json({ ok: true, id: userId, role });
    } catch (err) {
      console.error("POST /admin/users/:id/role error:", err);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to update user role" });
    }
  }
);


    res.json({ ok: true, users });
  } catch (err) {
    console.error("GET /admin/users error:", err);
    res.status(500).json({ ok: false, error: "Failed to load users" });
  }
});

// ===== ADMIN: GET ALL OFFERS =====
// GET /admin/offers -> list ALL offers in Firestore
app.get("/admin/offers", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const snap = await db
      .collection("offers")
      .orderBy("createdAt", "desc")
      .get();

    const offers = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        userId: d.userId || "",
        title: d.title || "",
        description: d.description || "",
        status: d.status || "pending",
        createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
        updatedAt: d.updatedAt ? d.updatedAt.toDate().toISOString() : null,
      };
    });

    res.json({ ok: true, offers });
  } catch (err) {
    console.error("GET /admin/offers error:", err);
    res.status(500).json({ ok: false, error: "Failed to load offers" });
  }
});

// ===== ADMIN: CREATE OFFER =====
// POST /admin/offers -> create a new offer for a user
app.post("/admin/offers", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, title, description, status } = req.body;

    if (!userId || !title) {
      return res
        .status(400)
        .json({ ok: false, error: "userId and title are required" });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    const ref = await db.collection("offers").add({
      userId,
      title,
      description: description || "",
      status: status || "pending",
      createdAt: now,
      updatedAt: now,
    });

    res.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("POST /admin/offers error:", err);
    res.status(500).json({ ok: false, error: "Failed to create offer" });
  }
});


// ===== PROFILE API =====

// GET /profile  → read profile for logged-in user
app.get("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    const docRef = db.collection("users").doc(uid);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.json({
        ok: true,
        profile: {
          uid,
          email: req.user.email || "",
          displayName: req.user.name || "",
        },
      });
    }

    const data = snap.data();

    return res.json({
  ok: true,
  profile: {
    uid,
    email: data.email || req.user.email || "",
    displayName: data.displayName || req.user.name || "",
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    kycLogoUrl: data.kycLogoUrl || null, // 🔥 NEW
  },
});

  } catch (err) {
    console.error("GET /profile error:", err);
    res.status(500).json({ ok: false, error: "Failed to load profile" });
  }
});

// POST /profile  → update displayName (and Firestore)
app.post("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { displayName } = req.body;

    if (!displayName || typeof displayName !== "string") {
      return res
        .status(400)
        .json({ ok: false, error: "displayName is required" });
    }

    try {
      await admin.auth().updateUser(uid, { displayName });
    } catch (err) {
      console.warn("updateUser warning:", err?.message || err);
    }

    const docRef = db.collection("users").doc(uid);
    await docRef.set(
      {
        displayName,
        email: req.user.email || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({ ok: true, message: "Profile updated" });
  } catch (err) {
    console.error("POST /profile error:", err);
    res.status(500).json({ ok: false, error: "Failed to update profile" });
  }
});

// ===== OFFERS API =====

// GET /offers  → list offers for logged-in user
app.get("/offers", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    const snap = await db
      .collection("offers")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const offers = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ ok: true, offers });
  } catch (err) {
    console.error("GET /offers error:", err);
    res.status(500).json({ ok: false, error: "Failed to load offers" });
  }
});

// POST /offers/:id/accept  → mark offer as accepted
app.post("/offers/:id/accept", verifyFirebaseToken, async (req, res) => {
  try {
    const offerId = req.params.id;
    const uid = req.user.uid;

    const ref = db.collection("offers").doc(offerId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, error: "Offer not found" });
    }

    const data = snap.data();
    if (data.userId !== uid) {
      return res.status(403).json({ ok: false, error: "Not your offer" });
    }

    await ref.update({
      status: "accepted",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ ok: true, id: offerId, status: "accepted" });
  } catch (err) {
    console.error("POST /offers/:id/accept error:", err);
    res.status(500).json({ ok: false, error: "Failed to accept offer" });
  }
});

// POST /offers/:id/decline  → mark offer as declined
app.post("/offers/:id/decline", verifyFirebaseToken, async (req, res) => {
  try {
    const offerId = req.params.id;
    const uid = req.user.uid;

    const ref = db.collection("offers").doc(offerId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, error: "Offer not found" });
    }

    const data = snap.data();
    if (data.userId !== uid) {
      return res.status(403).json({ ok: false, error: "Not your offer" });
    }

    await ref.update({
      status: "declined",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ ok: true, id: offerId, status: "declined" });
  } catch (err) {
    console.error("POST /offers/:id/decline error:", err);
    res.status(500).json({ ok: false, error: "Failed to decline offer" });
  }
});

// ===== UPLOADS API =====
app.get("/uploads", verifyFirebaseToken, async (req, res) => {
  res.json({ ok: true, uid: req.user.uid, uploads: [] });
});

// Upload file -> Cloudinary -> save to Firestore
app.post(
  "/upload",
  verifyFirebaseToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ ok: false, error: "No file provided" });
      }

      // If Cloudinary is configured, upload the temp file there
      let uploaded = null;
      if (cloudinary && process.env.CLOUDINARY_URL) {
        uploaded = await cloudinary.uploader.upload(req.file.path, {
          folder: `firebolt/${req.user.uid}`,
        });
      }

      // Clean up the temp file
      fs.unlink(req.file.path, () => {});

      // 🔥 NEW: save logo URL into Firestore user doc (if Cloudinary worked)
      if (uploaded) {
        const userDocRef = db.collection("users").doc(req.user.uid);
        await userDocRef.set(
          {
            kycLogoUrl: uploaded.secure_url,
            kycLogoPublicId: uploaded.public_id,
            kycUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      return res.json({
        ok: true,
        uploadedBy: req.user.uid,
        file: {
          originalName: req.file.originalname,
          size: req.file.size,
          mime: req.file.mimetype,
        },
        cloudinary: uploaded
          ? {
              url: uploaded.secure_url,
              public_id: uploaded.public_id,
              bytes: uploaded.bytes,
              format: uploaded.format,
            }
          : null,
      });
    } catch (err) {
      console.error("upload error:", err);
      return res.status(500).json({ ok: false, error: "Upload failed" });
    }
  }
);


// ----------------- Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
