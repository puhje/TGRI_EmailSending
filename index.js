const express = require('express');

const app = express();
app.use(express.json());

// API key auth
const API_KEY = process.env.API_KEY || 'tomodachi-smtp-2026';

// Brevo API key
const BREVO_API_KEY = process.env.BREVO_API_KEY || 'xsmtpsib-b1714fdbc35a09bcd5928800173a96a0a93ea0458c61292684cc2bf7951547a5-h4HD5ZLQjwAzy9Ku';

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
    // Parse comma-separated recipients into Brevo's format
    const toAddresses = to.split(',').map(email => ({ email: email.trim() }));

    const payload = {
      sender: {
        name: 'TGRI Information',
        email: 'info@tomodachiinc.com'
      },
      to: toAddresses,
      subject: subject,
      htmlContent: htmlBody
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Email sent via Brevo to ${to}, messageId: ${data.messageId}`);
      res.json({ success: true, messageId: data.messageId });
    } else {
      console.error(`Brevo API error: ${JSON.stringify(data)}`);
      res.status(500).json({ error: data.message || 'Brevo API error' });
    }

  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SMTP API running on port ${PORT}`);
});
