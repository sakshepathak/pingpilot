// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// POST /api/notifications - Create a notification
router.post('/', async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'userId, type, and message are required' });
    }

    if (!['email', 'sms', 'in-app'].includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const notification = await Notification.create({ userId, type, message });
    console.log(`📢 Sent ${type} to user ${userId}`);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/notifications/users/:id - Get user notifications
router.get('/users/:id', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
