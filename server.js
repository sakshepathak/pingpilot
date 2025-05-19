require('dotenv').config();
const express = require('express');
const path = require('path');                   // <-- add path module
const connectDB = require('./config/db');
const Notification = require('./models/Notification');
const sendEmail = require('./utils/mailer');

const app = express();
connectDB();

app.use(express.json()); // Parse JSON bodies

// Serve static frontend files (index.html, CSS, JS) from project root folder
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));



// Explicitly serve index.html on the root route (GET /)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// POST /notifications - Send a notification and email if type is email
app.post('/notifications', async (req, res) => {
  try {
    const { userId, type, message } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'userId, type, and message are required' });
    }

    if (!['email', 'sms', 'in-app'].includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const notification = new Notification({ userId, type, message });

    // Save to DB
    await notification.save();

    // Send email if type is 'email'
    if (type === 'email') {
      try {
        await sendEmail(userId, 'New Notification', message);
        notification.status = 'sent';
        await notification.save();
        console.log(`Email sent to ${userId}`);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        notification.status = 'failed';
        await notification.save();
      }
    }

    res.status(201).json({ message: 'Notification created', notification });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /users/:id/notifications - Get notifications for a user
app.get('/users/:id/notifications', async (req, res) => {
  try {
    const userId = req.params.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
