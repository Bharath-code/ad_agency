import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const convexBaseUrl = import.meta.env.PUBLIC_CONVEX_URL;
	if (!convexBaseUrl) {
		return new Response('PUBLIC_CONVEX_URL is not configured', { status: 500 });
	}

	try {
		const payload = await request.text();
		const signature =
			request.headers.get('x-dodo-signature') ?? request.headers.get('webhook-signature') ?? '';

		const response = await fetch(`${convexBaseUrl.replace(/\/$/, '')}/webhook/dodo`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(signature ? { 'x-dodo-signature': signature } : {}),
			},
			body: payload,
		});

		const responseBody = await response.text();
		return new Response(responseBody || 'OK', { status: response.status });
	} catch (error) {
		console.error('Webhook error:', error);
		return new Response('Internal error', { status: 500 });
	}
};
