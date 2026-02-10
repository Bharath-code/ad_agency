/**
 * Resend email client wrapper
 */
'use node';

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reports@aivis.io';

interface EmailParams {
	to: string;
	subject: string;
	html: string;
}

let resendClient: Resend | null = null;

function getClient(): Resend {
	if (!RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY not configured');
	}
	if (!resendClient) {
		resendClient = new Resend(RESEND_API_KEY);
	}
	return resendClient;
}

/**
 * Send email via Resend
 */
export async function sendEmail(params: EmailParams): Promise<{ id: string }> {
	const client = getClient();

	const result = await client.emails.send({
		from: FROM_EMAIL,
		to: params.to,
		subject: params.subject,
		html: params.html,
	});

	if (result.error) {
		throw new Error(`Resend error: ${result.error.message}`);
	}

	return { id: result.data?.id || '' };
}
