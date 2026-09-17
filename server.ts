import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Check Email Provider Configuration Status
  app.get('/api/email-config-status', (req, res) => {
    const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0);
    const hasSmtp = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    res.json({
      configured: hasResend || hasSmtp,
      provider: hasResend ? 'resend' : hasSmtp ? 'smtp' : 'unconfigured',
      senderEmail: process.env.EMAIL_FROM || 'Wedding Updates <onboarding@resend.dev>',
      hasResend,
      hasSmtp,
    });
  });

  // API Route: Send Real Email Dispatch
  app.post('/api/send-email', async (req, res) => {
    const { to, subject, html, text, guestName, eventName } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email ("to") is required.' });
    }

    const recipients = Array.isArray(to) ? to : [to];
    const emailSubject = subject || `Wedding Schedule Update: ${eventName || 'Important Details'}`;
    const emailFrom = process.env.EMAIL_FROM || 'Wedding Updates <onboarding@resend.dev>';

    // 1. Check for Resend API Key
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY.trim());

        const result = await resend.emails.send({
          from: emailFrom,
          to: recipients,
          subject: emailSubject,
          html: html || `<p>${text || 'Schedule update from the wedding couple.'}</p>`,
          text: text || 'Please check your wedding schedule update online.',
        });

        if (result.error) {
          console.error('[Resend Error]:', result.error);
          return res.status(500).json({
            success: false,
            provider: 'resend',
            configured: true,
            error: result.error.message || 'Resend delivery failed.',
          });
        }

        return res.json({
          success: true,
          provider: 'resend',
          configured: true,
          messageId: result.data?.id,
          recipientsCount: recipients.length,
          recipients,
        });
      } catch (err: any) {
        console.error('[Resend Send Error]:', err);
        return res.status(500).json({
          success: false,
          provider: 'resend',
          configured: true,
          error: err.message || 'Failed to dispatch email via Resend.',
        });
      }
    }

    // 2. Check for SMTP credentials
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = await import('nodemailer');
        const port = Number(process.env.SMTP_PORT) || 587;
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port,
          secure: port === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from: emailFrom,
          to: recipients.join(', '),
          subject: emailSubject,
          html: html || `<p>${text || 'Schedule update from the wedding couple.'}</p>`,
          text: text || 'Please check your wedding schedule update online.',
        });

        return res.json({
          success: true,
          provider: 'smtp',
          configured: true,
          messageId: info.messageId,
          recipientsCount: recipients.length,
          recipients,
        });
      } catch (err: any) {
        console.error('[SMTP Send Error]:', err);
        return res.status(500).json({
          success: false,
          provider: 'smtp',
          configured: true,
          error: err.message || 'Failed to dispatch email via SMTP.',
        });
      }
    }

    // 3. No external email credentials configured yet
    // Generate mailto link so the user can send it right from their mail client immediately
    const cleanBody = text || 'We have an update to our wedding schedule. Please check the website for details.';
    const mailtoUrl = `mailto:${recipients.join(',')}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(cleanBody)}`;

    return res.status(200).json({
      success: false,
      configured: false,
      provider: 'none',
      error: 'NO_CREDENTIALS',
      message: 'No email service API key (RESEND_API_KEY) or SMTP credentials are configured in .env / Settings.',
      hint: 'Configure RESEND_API_KEY in Settings to send live emails automatically across the internet, or click "Open in Mail Client" to send immediately from your personal email client.',
      mailtoUrl,
      recipients,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
