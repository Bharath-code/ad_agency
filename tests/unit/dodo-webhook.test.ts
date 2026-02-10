import { describe, expect, it } from 'vitest';
import { verifyWebhookSignature } from '../../convex/lib/dodo';

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	return Array.from(new Uint8Array(signature))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

describe('verifyWebhookSignature', () => {
	it('accepts a valid hex signature', async () => {
		const secret = 'super-secret';
		const payload = '{"type":"subscription.created"}';
		const signature = await hmacSha256Hex(secret, payload);

		const isValid = await verifyWebhookSignature(payload, signature, secret);

		expect(isValid).toBe(true);
	});

	it('accepts a prefixed signature format', async () => {
		const secret = 'super-secret';
		const payload = '{"type":"subscription.updated"}';
		const signature = await hmacSha256Hex(secret, payload);

		const isValid = await verifyWebhookSignature(payload, `sha256=${signature}`, secret);

		expect(isValid).toBe(true);
	});

	it('rejects an invalid signature', async () => {
		const isValid = await verifyWebhookSignature(
			'{"type":"subscription.cancelled"}',
			'deadbeef',
			'super-secret',
		);

		expect(isValid).toBe(false);
	});
});
