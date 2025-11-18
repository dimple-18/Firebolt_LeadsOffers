// src/utils/auditLogger.js
import { db } from "../lib/firebase.js"; // adjust path to your firebase admin init
import { Timestamp } from "firebase-admin/firestore";

export async function logAuditEvent({ 
  userId = null,
  action,
  entityType = null,   // e.g. "offer", "lead"
  entityId = null,
  payload = {},
  source = "api",      // "api" | "webhook" | "admin"
}) {
  const doc = {
    userId,
    action,
    entityType,
    entityId,
    payload,
    source,
    createdAt: Timestamp.now(),
  };

  await db.collection("auditLogs").add(doc);
}
