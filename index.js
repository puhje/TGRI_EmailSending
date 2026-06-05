const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// API key auth
const API_KEY = process.env.API_KEY || 'tomodachi-smtp-2026';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'reginemariano.tomodachi@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'rvdb skrj puem gqva'
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'SMTP API is running' });
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
  // Check API key
  const authHeader = req.headers['x-api-key'];
  if (authHeader !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { to, subject, htmlBody } = req.body;

  // Validate required fields
  if (!to || !subject || !htmlBody) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, htmlBody' });
  }

  try {
    const info = await transporter.sendMail({
      from: '"TGRI Information" <info@tomodachiinc.com>',
      to: to,
      subject: subject,
      html: htmlBody
    });

    console.log(`Email sent: ${info.messageId} to ${to}`);
    res.json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SMTP API running on port ${PORT}`);
});
