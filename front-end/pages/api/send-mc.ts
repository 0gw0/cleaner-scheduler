/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRequestBody {
  to: string;
  subject: string;
  pdfData?: string;
  filename?: string;
  from: string;
}

interface CreateEmailResponse {
  id: string;
  status: string;
  [key: string]: string | number | boolean | object;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
  details?: {
    to?: boolean;
    subject?: boolean;
    pdfData?: boolean;
    filename?: boolean;
    from?: boolean;
    providedEmail?: string;
    [key: string]: boolean | string | undefined;
  } | string | Partial<CreateEmailResponse>;
}

export default async function handler(
  req: NextApiRequest & { body: EmailRequestBody },
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not defined');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Missing API key'
    });
  }

  try {
    const { to, subject, pdfData, filename, from } = req.body;

    // Validate inputs
    if (!to || !subject || !from) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          to: !to,
          subject: !subject,
          from: !from
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        error: 'Invalid email format',
        details: { providedEmail: to }
      });
    }

    // Log attempt (remove in production)
    console.log('Attempting to send email to:', to);
    console.log('Using API key starting with:', process.env.RESEND_API_KEY?.substring(0, 5));

    const emailData: {
      from: string;
      to: string[];
      subject: string;
      html: string;
      attachments?: { filename: string; content: Buffer }[];
    } = {
      from: 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>MC for ${from}</h2>
          <p>Please find ${from} worker's MC for ${subject}.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      `
    };

    if (pdfData && filename) {
      emailData.attachments = [
        {
          filename: filename,
          content: Buffer.from(pdfData, 'base64')
        }
      ];
    }

    const data = await resend.emails.send(emailData);

    console.log('Email sent successfully:', data);
    res.status(200).json({ success: true, details: data as unknown as Partial<CreateEmailResponse> });
  } catch (error: any) {
    console.error('Detailed error:', error);
    res.status(500).json({
      error: 'Error sending email',
      details: error.message || 'Unknown error occurred'
    });
  }
}