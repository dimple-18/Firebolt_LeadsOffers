// src/routes/webhook.js
import express from "express";
import { logAuditEvent } from "../utils/auditLogger.js";

const router = express.Router();

// Placeholder webhook endpoint
// Later you can point Base44 / any external service to this URL
router.post("/incoming", async (req, res) => {
  try {
    const { eventType, entityType, entityId, userId, data } = req.body || {};

    // Store everything we got into audit logs
    await logAuditEvent({
      userId: userId || null,
      action: eventType || "unknown_webhook_event",
      entityType: entityType || null,
      entityId: entityId || null,
      payload: data || req.body,
      source: "webhook",
    });

    // For now just reply OK
    res.status(200).json({ ok: true, message: "Webhook received (placeholder)" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ ok: false, error: "Webhook handler failed" });
  }
});

export default router;
