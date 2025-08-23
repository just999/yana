import { link } from 'fs';

import data from '@/data/analytics';
import { formatError } from '@/lib/utils';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: 'tommydewa08@resend.dev',
    to: email,
    subject: '2FA Code',
    html: `        
        <p>Your 2FA code: ${token}</p>
      `,
  });
};
