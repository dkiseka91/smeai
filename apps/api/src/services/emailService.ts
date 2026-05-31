import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'noreply@aelevate.co.ug';

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your AElevate account',
    html: `<p>Hi ${name},</p><p>Click <a href="${url}">here</a> to verify your email.</p><p>Link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your AElevate password',
    html: `<p>Hi ${name},</p><p>Click <a href="${url}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
}

export async function sendPaymentFailedEmail(email: string, name: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Action required: Payment failed',
    html: `<p>Hi ${name},</p><p>Your recent payment failed. Please update your payment method at <a href="${process.env.FRONTEND_URL}/settings">Account Settings</a>.</p>`,
  });
}
