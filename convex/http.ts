import { httpRouter } from 'convex/server';
import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { parseWebhookEvent, verifyWebhookSignature } from './lib/dodo';

const http = httpRouter();

/**
 * DodoPayments Webhook Handler
 */
http.route({
	path: '/webhook/dodo',
	method: 'POST',
	handler: httpAction(async (ctx, request) => {
		const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
		if (!webhookSecret) {
			console.error('DODO_WEBHOOK_SECRET is not configured');
			return new Response('Webhook misconfigured', { status: 500 });
		}

		const bodyText = await request.text();

		const signatureHeader =
			request.headers.get('x-dodo-signature') ?? request.headers.get('webhook-signature') ?? '';

		const isValidSignature = await verifyWebhookSignature(bodyText, signatureHeader, webhookSecret);
		if (!isValidSignature) {
			return new Response('Invalid signature', { status: 401 });
		}

		let event: ReturnType<typeof parseWebhookEvent>;
		try {
			event = parseWebhookEvent(bodyText);
		} catch {
			return new Response('Invalid JSON', { status: 400 });
		}

		const eventType = event.type;
		const data = event.data;
		const customerEmail = data?.customer?.email ?? data?.customer_email;

		if (!customerEmail) {
			console.error('No customer email in webhook payload');
			return new Response('Missing email', { status: 400 });
		}

		await ctx.runMutation(internal.payments.handleWebhook, {
			eventType: eventType || 'unknown',
			subscriptionId: data?.subscription_id,
			customerEmail: customerEmail,
			planId: data?.product_id ?? data?.plan_id,
			status: data?.status,
			currentPeriodEnd: data?.current_period_end
				? new Date(data.current_period_end).getTime()
				: undefined,
		});

		return new Response('Webhook processed', { status: 200 });
	}),
});

export default http;
