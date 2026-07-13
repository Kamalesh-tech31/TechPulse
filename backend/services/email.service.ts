import { sendEmail } from '../config/brevo';

export class EmailService {
  static async sendVerificationOTP(name: string, toEmail: string, otp: string): Promise<boolean> {
    const subject = 'Verify Your Trado Account';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; background: #070B14; color: #ffffff; padding: 20px; }
          .container { max-width: 500px; margin: auto; background: #0D1117; border: 1px solid #1f2937; border-radius: 8px; padding: 30px; text-align: center; }
          .otp { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 4px; margin: 20px 0; }
          .footer { font-size: 12px; color: #9ca3af; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 style="color: #ffffff;">Hello ${name}</h2>
          <p style="color: #d1d5db;">Your verification code is</p>
          <div class="otp">${otp}</div>
          <p style="color: #d1d5db;">This OTP is valid for 5 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #1f2937; margin: 20px 0;" />
          <p class="footer">If you didn't request this, ignore this email.</p>
        </div>
      </body>
      </html>
    `;
    return sendEmail(toEmail, subject, htmlContent);
  }

  static async sendForgotPasswordOTP(toEmail: string, otp: string): Promise<boolean> {
    const subject = 'Verify Your Trado Password Reset';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; background: #070B14; color: #ffffff; padding: 20px; }
          .container { max-width: 500px; margin: auto; background: #0D1117; border: 1px solid #1f2937; border-radius: 8px; padding: 30px; text-align: center; }
          .otp { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 4px; margin: 20px 0; }
          .footer { font-size: 12px; color: #9ca3af; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 style="color: #ffffff;">Password Reset Request</h2>
          <p style="color: #d1d5db;">Your verification code to reset password is</p>
          <div class="otp">${otp}</div>
          <p style="color: #d1d5db;">This OTP is valid for 5 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #1f2937; margin: 20px 0;" />
          <p class="footer">If you didn't request this, ignore this email.</p>
        </div>
      </body>
      </html>
    `;
    return sendEmail(toEmail, subject, htmlContent);
  }
}
