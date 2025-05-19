const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
require('dotenv').config();

const sendNotification = async (req, res) => {
  const { userId, type, message } = req.body;

  if (!userId || !type || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const notification = new Notification({
      userId,
      type,
      message,
      status: 'pending'
    });

    // Handle email notifications
    if (type === 'email') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Notifier Bot" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // or dynamic recipient
        subject: '📬 New Notification',
        text: message,
      });

      notification.status = 'sent';
    } else if (type === 'sms') {
      // Placeholder for future SMS logic
      console.log(`📱 Simulated SMS sent to user ${userId}: ${message}`);
      notification.status = 'sent';
    } else if (type === 'in-app') {
      // For in-app, we just save it
      notification.status = 'sent';
    } else {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    await notification.save();
    res.status(201).json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    console.error('Error sending notification:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { sendNotification };
