import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRequestBody {
	to: string;
	subject: string;
	pdfData: string;
	filename: string;
}

interface CreateEmailResponse {
	id: string;
	status: string;
	[key: string]: string | number | boolean | object;
}

interface ApiResponse {
	success?: boolean;
	error?: string;
	details?:
		| {
				to?: boolean;
				subject?: boolean;
				pdfData?: boolean;
				filename?: boolean;
				providedEmail?: string;
				[key: string]: boolean | string | undefined;
		  }
		| string
		| CreateEmailResponse;
}

// Define a custom error type for better error handling
class EmailError extends Error {
	constructor(
		message: string,
		public code?: string,
		public statusCode: number = 500
	) {
		super(message);
		this.name = 'EmailError';
	}
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
			details: 'Missing API key',
		});
	}

	try {
		const { to, subject, pdfData, filename } = req.body;

		// Validate inputs
		if (!to || !subject || !pdfData || !filename) {
			return res.status(400).json({
				error: 'Missing required fields',
				details: {
					to: !to,
					subject: !subject,
					pdfData: !pdfData,
					filename: !filename,
				},
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(to)) {
			return res.status(400).json({
				error: 'Invalid email format',
				details: { providedEmail: to },
			});
		}

		// Log attempt (remove in production)
		console.log('Attempting to send email to:', to);
		console.log(
			'Using API key starting with:',
			process.env.RESEND_API_KEY?.substring(0, 5)
		);

		const data = await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: [to],
			subject: subject,
			html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Payroll Report</h2>
          <p>Please find attached your payroll report for ${subject}.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      `,
			attachments: [
				{
					filename: filename,
					content: Buffer.from(pdfData, 'base64'),
				},
			],
		});

		console.log('Email sent successfully:', data);
		res.status(200).json({ success: true, details: data });
	} catch (error) {
		console.error('Detailed error:', error);

		if (error instanceof EmailError) {
			return res.status(error.statusCode).json({
				error: 'Error sending email',
				details: error.message,
			});
		}

		// Handle unknown errors
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error occurred';
		res.status(500).json({
			error: 'Error sending email',
			details: errorMessage,
		});
	}
}
