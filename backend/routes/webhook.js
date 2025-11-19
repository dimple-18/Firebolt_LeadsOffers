// backend/routes/webhook.js
const express = require('express');
const router = express.Router();

// ⬇️ adjust this path if your firebase-admin init file is in a different place
// const admin = require('../lib/firebase.js'); 
const admin = require("firebase-admin");
const db = admin.firestore();


function verifyWebhookSecret(req, res, next) {
  const incoming = req.header('x-webhook-secret');
  const expected = process.env.WEBHOOK_SECRET;

  if (!expected) {
    console.warn('⚠️ WEBHOOK_SECRET is not set. Skipping verification in dev.');
    return next();
  }

  if (incoming !== expected) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  next();
}

// POST /webhook  (index.js will mount this router on /webhook)
router.post('/', verifyWebhookSecret, async (req, res) => {
  try {
    const payload = req.body || {};

    // Build a simple audit log entry
    const logEntry = {
      source: 'webhook',
      eventType: payload.type || 'UNKNOWN',
      status: 'received',
      payload,
      headers: {
        'user-agent': req.headers['user-agent'] || null,
      },
      ip: req.ip,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('auditLogs').add(logEntry);

    return res.json({ ok: true, message: 'Webhook received (placeholder)', id: 'stored' });
  } catch (err) {
    console.error('Error handling webhook:', err);
    return res.status(500).json({ error: 'Internal webhook error' });
  }
});

module.exports = router;
