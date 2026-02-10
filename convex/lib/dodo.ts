/**
 * DodoPayments client wrapper for Convex actions
 */

const DODO_API_KEY = process.env.DODO_API_KEY;

interface CheckoutSessionParams {
	customerEmail: string;
	customerName?: string;
	productId: string;
	successUrl: string;
	cancelUrl: string;
}

interface CheckoutSessionResponse {
	checkout_url: string;
	session_id: string;
}

export interface WebhookEvent {
	type:
		| 'subscription.created'
		| 'subscription.updated'
		| 'subscription.cancelled'
		| 'payment.succeeded'
		| 'payment.failed';
	data: {
		subscription_id?: string;
		customer_email?: string;
		customer?: {
			email?: string;
		};
		plan_id?: string;
		product_id?: string;
		status?: string;
		current_period_end?: number | string;
	};
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
	params: CheckoutSessionParams,
): Promise<CheckoutSessionResponse> {
	if (!DODO_API_KEY) {
		throw new Error('DODO_API_KEY not configured');
	}

	const response = await fetch('https://api.dodopayments.com/checkout/sessions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${DODO_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			customer: {
				email: params.customerEmail,
				name: params.customerName,
			},
			product_cart: [
				{
					product_id: params.productId,
					quantity: 1,
				},
			],
			success_url: params.successUrl,
			cancel_url: params.cancelUrl,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`DodoPayments error: ${error}`);
	}

	return response.json();
}

/**
 * Verify webhook signature
 */
function normalizeSignatures(headerValue: string): string[] {
	return headerValue
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean)
		.flatMap((part) => {
			if (!part.includes('=')) return [part.toLowerCase()];

			const [prefix, rawValue] = part.split('=', 2);
			const normalizedPrefix = prefix.toLowerCase();
			if (
				normalizedPrefix === 'sha256' ||
				normalizedPrefix === 'v1' ||
				normalizedPrefix === 'signature'
			) {
				return [rawValue.toLowerCase()];
			}
			return [part.toLowerCase()];
		});
}

function timingSafeCompare(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	let mismatch = 0;
	for (let i = 0; i < a.length; i++) {
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return mismatch === 0;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);

	const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	return Array.from(new Uint8Array(signatureBytes))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

export async function verifyWebhookSignature(
	payload: string,
	signature: string,
	secret: string,
): Promise<boolean> {
	if (!signature || !secret) {
		return false;
	}

	const expectedSignature = await hmacSha256Hex(secret, payload);
	const candidateSignatures = normalizeSignatures(signature);

	return candidateSignatures.some((candidate) => timingSafeCompare(candidate, expectedSignature));
}

/**
 * Parse webhook event
 */
export function parseWebhookEvent(payload: string): WebhookEvent {
	return JSON.parse(payload);
}

/**
 * Product IDs - set these in DodoPayments dashboard
 */
export const PRODUCT_IDS = {
	indie: process.env.DODO_INDIE_PRODUCT_ID || 'prod_indie',
	startup: process.env.DODO_STARTUP_PRODUCT_ID || 'prod_startup',
} as const;

/**
 * Plan limits
 */
export const PLAN_LIMITS = {
	free: { scans: 5, competitors: 2, queries: 10 },
	indie: { scans: 100, competitors: 3, queries: 30 },
	startup: { scans: -1, competitors: 10, queries: 100 }, // -1 = unlimited
} as const;
