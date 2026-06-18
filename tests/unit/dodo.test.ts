import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
    deriveWebhookEventId,
    parseWebhookEvent,
    verifyWebhookSignature,
    type WebhookEvent,
} from '../../convex/lib/dodo';

const SECRET = 'whsec_test_secret';

function sign(payload: string, secret = SECRET): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
}

describe('verifyWebhookSignature', () => {
    const payload = JSON.stringify({ type: 'payment.succeeded', data: { customer_email: 'a@b.co' } });

    it('accepts a correct bare hex signature', async () => {
        const sig = sign(payload);
        await expect(verifyWebhookSignature(payload, sig, SECRET)).resolves.toBe(true);
    });

    it('accepts a prefixed signature (sha256=, v1=, signature=)', async () => {
        const sig = sign(payload);
        for (const prefix of ['sha256', 'v1', 'signature']) {
            await expect(verifyWebhookSignature(payload, `${prefix}=${sig}`, SECRET)).resolves.toBe(
                true,
            );
        }
    });

    it('accepts a comma-separated list containing the valid signature', async () => {
        const sig = sign(payload);
        const header = `t=123, v1=${sig}`;
        await expect(verifyWebhookSignature(payload, header, SECRET)).resolves.toBe(true);
    });

    it('rejects a tampered payload', async () => {
        const sig = sign(payload);
        const tampered = payload.replace('a@b.co', 'attacker@evil.co');
        await expect(verifyWebhookSignature(tampered, sig, SECRET)).resolves.toBe(false);
    });

    it('rejects a signature made with the wrong secret', async () => {
        const sig = sign(payload, 'wrong_secret');
        await expect(verifyWebhookSignature(payload, sig, SECRET)).resolves.toBe(false);
    });

    it('rejects a signature of the wrong length (no length-leak crash)', async () => {
        await expect(verifyWebhookSignature(payload, 'deadbeef', SECRET)).resolves.toBe(false);
    });

    it('rejects empty signature or empty secret', async () => {
        const sig = sign(payload);
        await expect(verifyWebhookSignature(payload, '', SECRET)).resolves.toBe(false);
        await expect(verifyWebhookSignature(payload, sig, '')).resolves.toBe(false);
    });

    it('is case-insensitive on the hex digest', async () => {
        const sig = sign(payload).toUpperCase();
        await expect(verifyWebhookSignature(payload, sig, SECRET)).resolves.toBe(true);
    });
});

describe('parseWebhookEvent', () => {
    it('parses a well-formed event', () => {
        const evt = parseWebhookEvent(
            JSON.stringify({ type: 'subscription.created', data: { plan_id: 'prod_growth' } }),
        );
        expect(evt.type).toBe('subscription.created');
        expect(evt.data.plan_id).toBe('prod_growth');
    });

    it('throws on missing type', () => {
        expect(() => parseWebhookEvent(JSON.stringify({ data: {} }))).toThrow(/type/);
    });

    it('throws on missing data', () => {
        expect(() => parseWebhookEvent(JSON.stringify({ type: 'payment.failed' }))).toThrow(/data/);
    });

    it('throws on non-object payload', () => {
        expect(() => parseWebhookEvent(JSON.stringify('nope'))).toThrow();
    });

    it('throws on invalid JSON', () => {
        expect(() => parseWebhookEvent('{not json')).toThrow();
    });
});

describe('deriveWebhookEventId (idempotency key)', () => {
    it('prefers the provider event id', () => {
        const evt: WebhookEvent = {
            id: 'evt_123',
            event_id: 'evt_other',
            type: 'subscription.created',
            data: { subscription_id: 'sub_1' },
        };
        expect(deriveWebhookEventId(evt)).toBe('evt_123');
    });

    it('falls back to event_id when id is absent', () => {
        const evt: WebhookEvent = {
            event_id: 'evt_fallback',
            type: 'payment.succeeded',
            data: {},
        };
        expect(deriveWebhookEventId(evt)).toBe('evt_fallback');
    });

    it('produces a stable key for retries of the same id-less event', () => {
        const make = (): WebhookEvent => ({
            type: 'subscription.updated',
            data: { subscription_id: 'sub_9', status: 'active' },
        });
        // Same logical event delivered twice -> identical key -> de-duplicated.
        expect(deriveWebhookEventId(make())).toBe(deriveWebhookEventId(make()));
        expect(deriveWebhookEventId(make())).toBe('subscription.updated:sub_9:active');
    });

    it('distinguishes a status change on the same subscription', () => {
        const active: WebhookEvent = {
            type: 'subscription.updated',
            data: { subscription_id: 'sub_9', status: 'active' },
        };
        const canceled: WebhookEvent = {
            type: 'subscription.updated',
            data: { subscription_id: 'sub_9', status: 'canceled' },
        };
        expect(deriveWebhookEventId(active)).not.toBe(deriveWebhookEventId(canceled));
    });

    it('falls back to email + period when there is no subscription id', () => {
        const evt: WebhookEvent = {
            type: 'payment.succeeded',
            data: { customer_email: 'a@b.co', current_period_end: 1700 },
        };
        expect(deriveWebhookEventId(evt)).toBe('payment.succeeded:a@b.co:1700');
    });

    it('distinguishes different customers on the same event type', () => {
        const a: WebhookEvent = { type: 'payment.failed', data: { customer_email: 'a@b.co' } };
        const b: WebhookEvent = { type: 'payment.failed', data: { customer_email: 'c@d.co' } };
        expect(deriveWebhookEventId(a)).not.toBe(deriveWebhookEventId(b));
    });
});
