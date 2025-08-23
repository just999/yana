import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `http://localhost:3000/reset-password?token=${token}`;

  return resend.emails.send({
    from: 'tommydewa08@resend.dev',
    to: email,
    subject: 'reset your password',
    html: `
        <h1>You have requested reset password</h1>
        <p>Click the link below to you  request reset password</p>
        <a href="${link}">Reset Password</a>
      `,
  });
}
