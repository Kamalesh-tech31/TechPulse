import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'abinavm2907@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Trado';

export async function sendEmail(toEmail: string, subject: string, htmlContent: string): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('[Brevo Config] Missing BREVO_API_KEY. Simulating email send to:', toEmail);
    console.log('[Brevo Sim] Subject:', subject);
    console.log('[Brevo Sim] Content:', htmlContent);
    return true;
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Brevo Error] HTTP error response:', errText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Brevo Error] Failed to send email:', error);
    return false;
  }
}
