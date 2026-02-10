<script lang="ts">
import { Check, Crown, Loader2, Zap } from 'lucide-svelte';
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { api } from '$convex/_generated/api';
import * as Badge from '$lib/components/ui/badge/index.js';
import Spinner from '$lib/components/ui/spinner.svelte';
import { convex } from '$lib/stores/auth';

type SubscriptionDetails = {
	status: string;
};

type BillingSubscription = {
	plan: 'free' | 'indie' | 'startup';
	subscription: SubscriptionDetails | null;
	limits: {
		scans: number;
		competitors: number;
		queries: number;
	};
	scansUsed: number;
	canScan: boolean;
};

// State
let isLoading = $state(true);
let subscription = $state<BillingSubscription | null>(null);
let isUpgrading = $state<string | null>(null);

// Check for success/cancel from URL
const success = $derived($page.url.searchParams.get('success') === 'true');
const canceled = $derived($page.url.searchParams.get('canceled') === 'true');

onMount(() => {
	loadSubscription();
});

async function loadSubscription() {
	try {
		const data = await convex.query(api.payments.getSubscription, {});
		subscription = data;
	} catch (error) {
		console.error('Failed to load subscription:', error);
	} finally {
		isLoading = false;
	}
}

async function handleUpgrade(plan: 'indie' | 'startup') {
	isUpgrading = plan;
	try {
		const result = await convex.action(api.payments.createCheckout, {
			plan,
		});
		// Redirect to checkout
		window.location.href = result.checkoutUrl;
	} catch (error) {
		console.error('Failed to create checkout:', error);
		isUpgrading = null;
	}
}

async function handleCancel() {
	if (!confirm('Are you sure you want to cancel your subscription?')) {
		return;
	}

	try {
		await convex.action(api.payments.cancelSubscription, {});
		await loadSubscription();
	} catch (error) {
		console.error('Failed to cancel subscription:', error);
	}
}

const plans = [
	{
		id: 'free',
		name: 'Free',
		price: '$0',
		period: 'forever',
		features: ['5 scans total', '2 competitors', '10 intent queries', 'Basic dashboard'],
	},
	{
		id: 'indie',
		name: 'Indie',
		price: '$49',
		period: '/month',
		featured: true,
		features: [
			'100 scans/month',
			'3 competitors',
			'30 intent queries',
			'Weekly reports',
			'Email support',
		],
	},
	{
		id: 'startup',
		name: 'Startup',
		price: '$149',
		period: '/month',
		features: [
			'Unlimited scans',
			'10 competitors',
			'100 intent queries',
			'Weekly reports',
			'Priority support',
			'Team access (soon)',
		],
	},
];
</script>

<div class="billing-page">
    <header class="page-header">
        <h1>Billing</h1>
        <p>Manage your subscription and billing details</p>
    </header>

    {#if success}
        <div class="alert alert-success">
            <Check size={20} />
            <span>Payment successful! Your subscription is now active.</span>
        </div>
    {/if}

    {#if canceled}
        <div class="alert alert-warning">
            <span>Payment was canceled. You can try again anytime.</span>
        </div>
    {/if}

    {#if isLoading}
        <div class="loading-container">
            <Spinner size="lg" />
        </div>
    {:else}
        <!-- Current Plan -->
        <section class="current-plan">
            <h2>Current Plan</h2>
            <div class="plan-info">
                <div class="plan-details">
                    <span class="plan-name">{subscription?.plan || "Free"}</span
                    >
                    {#if subscription?.subscription?.status === "active"}
                        <Badge.Root variant="success">Active</Badge.Root>
                    {/if}
                </div>
                <div class="plan-usage">
                    <span
                        >Scans used: {subscription?.scansUsed || 0} / {subscription
                            ?.limits?.scans === -1
                            ? "∞"
                            : subscription?.limits?.scans || 5}</span
                    >
                </div>
                {#if subscription?.plan !== "free" && subscription?.subscription}
                    <button class="btn-link" onclick={handleCancel}
                        >Cancel subscription</button
                    >
                {/if}
            </div>
        </section>

        <!-- Pricing Cards -->
        <section class="pricing-section">
            <h2>Plans</h2>
            <div class="pricing-grid">
                {#each plans as plan}
                    <div
                        class="pricing-card"
                        class:featured={plan.featured}
                        class:current={subscription?.plan === plan.id}
                    >
                        {#if plan.featured}
                            <div class="featured-badge">Most Popular</div>
                        {/if}
                        {#if subscription?.plan === plan.id}
                            <div class="current-badge">Current Plan</div>
                        {/if}

                        <div class="plan-header">
                            {#if plan.id === "indie"}
                                <Zap size={24} class="plan-icon" />
                            {:else if plan.id === "startup"}
                                <Crown size={24} class="plan-icon" />
                            {/if}
                            <h3>{plan.name}</h3>
                        </div>

                        <div class="plan-price">
                            <span class="price">{plan.price}</span>
                            <span class="period">{plan.period}</span>
                        </div>

                        <ul class="plan-features">
                            {#each plan.features as feature}
                                <li>
                                    <Check size={16} />
                                    {feature}
                                </li>
                            {/each}
                        </ul>

                        {#if plan.id !== "free" && subscription?.plan !== plan.id}
                            <button
                                class="btn-saas btn-saas-primary"
                                onclick={() =>
                                    handleUpgrade(
                                        plan.id as "indie" | "startup",
                                    )}
                                disabled={isUpgrading !== null}
                            >
                                {#if isUpgrading === plan.id}
                                    <Loader2 size={16} class="spin" />
                                    Processing...
                                {:else}
                                    {subscription?.plan === "free"
                                        ? "Upgrade"
                                        : "Switch"} to {plan.name}
                                {/if}
                            </button>
                        {:else if plan.id === "free"}
                            <button
                                class="btn-saas btn-saas-secondary"
                                disabled
                            >
                                Free Forever
                            </button>
                        {:else}
                            <button
                                class="btn-saas btn-saas-secondary"
                                disabled
                            >
                                Current Plan
                            </button>
                        {/if}
                    </div>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    .billing-page {
        padding: var(--space-8);
        max-width: 1200px;
    }

    .page-header {
        margin-bottom: var(--space-8);
    }

    .page-header h1 {
        font-size: var(--text-2xl);
        margin: 0 0 var(--space-2);
    }

    .page-header p {
        color: var(--text-secondary);
        margin: 0;
    }

    .alert {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-6);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-6);
    }

    .alert-success {
        background: #dcfce7;
        color: #166534;
    }

    .alert-warning {
        background: #fef3c7;
        color: #92400e;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        padding: var(--space-12);
    }

    .current-plan {
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-md);
        padding: var(--space-6);
        margin-bottom: var(--space-8);
    }

    .current-plan h2 {
        font-size: var(--text-lg);
        margin: 0 0 var(--space-4);
    }

    .plan-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .plan-details {
        display: flex;
        align-items: center;
        gap: var(--space-3);
    }

    .plan-name {
        font-size: var(--text-xl);
        font-weight: 600;
        text-transform: capitalize;
    }

    .plan-usage {
        color: var(--text-secondary);
        font-size: var(--text-sm);
    }

    .btn-link {
        background: none;
        border: none;
        color: var(--text-muted);
        text-decoration: underline;
        cursor: pointer;
        font-size: var(--text-sm);
        padding: 0;
        align-self: flex-start;
    }

    .btn-link:hover {
        color: #dc2626;
    }

    .pricing-section h2 {
        font-size: var(--text-lg);
        margin: 0 0 var(--space-6);
    }

    .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-6);
    }

    .pricing-card {
        position: relative;
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
    }

    .pricing-card.featured {
        border: 2px solid var(--color-brand);
    }

    .pricing-card.current {
        background: var(--bg-secondary);
    }

    .featured-badge,
    .current-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: 600;
    }

    .featured-badge {
        background: var(--color-brand);
        color: white;
    }

    .current-badge {
        background: var(--bg-secondary);
        border: var(--border-base);
    }

    .plan-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-4);
    }

    .plan-header h3 {
        font-size: var(--text-xl);
        margin: 0;
    }

    :global(.plan-icon) {
        color: var(--color-brand);
    }

    .plan-price {
        margin-bottom: var(--space-4);
    }

    .price {
        font-size: var(--text-3xl);
        font-weight: 700;
    }

    .period {
        color: var(--text-muted);
        font-size: var(--text-sm);
    }

    .plan-features {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--space-6);
        flex: 1;
    }

    .plan-features li {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
    }

    .plan-features li :global(svg) {
        color: #16a34a;
    }

    :global(.spin) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
