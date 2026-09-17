import { ScheduleItem, Guest } from '../types';

export interface EmailConfigStatus {
  configured: boolean;
  provider: 'resend' | 'smtp' | 'unconfigured';
  senderEmail: string;
  hasResend: boolean;
  hasSmtp: boolean;
}

export interface SendEmailResult {
  success: boolean;
  configured: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  hint?: string;
  mailtoUrl?: string;
  recipientsCount?: number;
}

export async function checkEmailConfigStatus(): Promise<EmailConfigStatus> {
  try {
    const res = await fetch('/api/email-config-status');
    if (!res.ok) throw new Error('Status request failed');
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      provider: 'unconfigured',
      senderEmail: 'onboarding@resend.dev',
      hasResend: false,
      hasSmtp: false,
    };
  }
}

export function generateEmailPlainText(
  event: ScheduleItem,
  guestName: string = 'Honored Guest',
  personalNote?: string
): string {
  const dateTimeStr = event.isDateTBA
    ? 'Date & Time To Be Announced'
    : `${event.formattedDate} at ${event.startTime || '4:00 PM'}`;

  return `Dear ${guestName},

We are writing to share an important schedule update for our wedding celebration.

Event: ${event.name}
Updated Schedule: ${dateTimeStr}
Location: ${event.venue || 'Wedding Venue'}
Format: ${event.format === 'in_person' ? 'In-person' : 'Hybrid'}

${personalNote ? `Personal Note from the Couple:\n"${personalNote}"\n\n` : ''}
Please check our wedding website for directions, dress code, and details.

With love,
Sarah & Michael`;
}

export function generateEmailHtml(
  event: ScheduleItem,
  guestName: string = 'Honored Guest',
  personalNote?: string
): string {
  const dateTimeStr = event.isDateTBA
    ? 'Date & Time To Be Announced'
    : `${event.formattedDate} at ${event.startTime || '4:00 PM'}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wedding Schedule Update: ${event.name}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F7F4; margin: 0; padding: 24px; color: #2D2D2D;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #E6E4DF; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <div style="background-color: #1c1917; padding: 28px 24px; text-align: center; color: #ffffff;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #d6d3d1;">Wedding Celebration Schedule Update</p>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Sarah & Michael</h1>
    </div>

    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; margin: 0 0 16px 0; color: #44403c;">Dear <strong>${guestName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #57534e;">
        We have updated the timeline for <strong>${event.name}</strong>. Please note the latest details below to ensure you have the correct time for our celebrations.
      </p>

      <div style="background-color: #FDFCFB; border: 1px solid #E7E5E4; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <div style="font-size: 16px; font-weight: 700; color: #1c1917; margin-bottom: 10px;">${event.name}</div>
        <div style="font-size: 14px; color: #292524; margin-bottom: 6px;">📅 <strong>Date &amp; Time:</strong> ${dateTimeStr}</div>
        <div style="font-size: 14px; color: #292524; margin-bottom: 6px;">📍 <strong>Venue:</strong> ${event.venue || 'Wedding Venue'}</div>
        <div style="font-size: 13px; color: #78716c;">⏰ <strong>Timezone:</strong> ${event.timezone || 'GMT+05:30'}</div>
      </div>

      ${
        personalNote
          ? `<div style="background-color: #fefce8; border-left: 4px solid #ca8a04; padding: 14px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #854d0e;">Note from Sarah &amp; Michael:</p>
              <p style="margin: 0; font-size: 13px; color: #713f12; font-style: italic;">"${personalNote}"</p>
            </div>`
          : ''
      }

      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="https://ais-pre-t5rclddmo7fcswl5yukg2f-498240461373.asia-southeast1.run.app" style="display: inline-block; background-color: #1c1917; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
          View Full Wedding Schedule &amp; RSVP
        </a>
      </div>

      <p style="font-size: 12px; color: #a8a29e; text-align: center; margin: 24px 0 0 0;">
        Sent with love to celebrate our special day. If you have questions, reach out anytime!
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendScheduleEmail(params: {
  to: string | string[];
  event: ScheduleItem;
  guestName?: string;
  personalNote?: string;
}): Promise<SendEmailResult> {
  const { to, event, guestName = 'Honored Guest', personalNote } = params;
  const html = generateEmailHtml(event, guestName, personalNote);
  const text = generateEmailPlainText(event, guestName, personalNote);
  const subject = `Schedule Update: ${event.name} — Sarah & Michael`;

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
        guestName,
        eventName: event.name,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    // Fallback if network or server error
    const cleanTo = Array.isArray(to) ? to.join(',') : to;
    const mailtoUrl = `mailto:${cleanTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return {
      success: false,
      configured: false,
      provider: 'none',
      error: err.message || 'Failed to reach backend server',
      hint: 'You can launch your email client directly using the mailto link.',
      mailtoUrl,
    };
  }
}
