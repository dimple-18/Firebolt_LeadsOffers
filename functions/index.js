// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin inside Functions environment
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * B17: onOfferCreate
 * Trigger: whenever a new doc is created in "offers" collection.
 * Goal:
 *  - Clean up title/description (trim + max length)
 *  - Force status to a safe value (default "pending")
 *  - Ensure createdAt / updatedAt are server timestamps
 */
exports.onOfferCreate = functions.firestore
  .document("offers/{offerId}")
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};
    const updates = {};

    // --- Sanitize title ---
    if (typeof data.title === "string") {
      const cleanTitle = data.title.trim().slice(0, 120); // max 120 chars
      if (cleanTitle !== data.title) {
        updates.title = cleanTitle;
      }
    }

    // --- Sanitize description ---
    if (typeof data.description === "string") {
      const cleanDesc = data.description.trim().slice(0, 1000); // max 1000 chars
      if (cleanDesc !== data.description) {
        updates.description = cleanDesc;
      }
    }

    // --- Enforce valid status ---
    const validStatuses = ["pending", "accepted", "declined"];
    if (!data.status || !validStatuses.includes(data.status)) {
      updates.status = "pending";
    }

    // --- Timestamps ---
    // If createdAt missing, set it
    if (!data.createdAt) {
      updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Always set updatedAt on create
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // --- Apply updates if there is anything to change ---
    if (Object.keys(updates).length > 0) {
      await snap.ref.set(updates, { merge: true });
    }

    return null;
  });
