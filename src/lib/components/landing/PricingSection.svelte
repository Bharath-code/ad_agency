<script lang="ts">
import { ArrowRight, Check, ChevronDown } from 'lucide-svelte';

interface PricingPlan {
	name: string;
	price: string;
	period?: string;
	desc: string;
	feats: string[];
	cta: string;
	featured: boolean;
}

interface Faq {
	q: string;
	a: string;
}

const pricing: PricingPlan[] = [
	{
		name: 'Starter',
		price: '$0',
		desc: 'A baseline diagnostic for one product.',
		feats: ['1 project', '30 buyer prompts', 'Snapshot report', 'Email summary'],
		cta: 'Run free diagnostic',
		featured: false,
	},
	{
		name: 'Growth',
		price: '$79',
		period: '/mo',
		desc: 'For B2B SaaS teams optimizing acquisition.',
		feats: [
			'Unlimited scans',
			'Weekly visibility report',
			'Competitor win/loss tracking',
			'Prioritized fix plan',
			'Raw transcripts & evidence',
		],
		cta: 'Start free trial',
		featured: true,
	},
	{
		name: 'Scale',
		price: '$199',
		period: '/mo',
		desc: 'For multi-product teams and agencies.',
		feats: ['Everything in Growth', '5 projects', 'Daily monitoring', 'Client-ready reports', 'Slack alerts'],
		cta: 'Start free trial',
		featured: false,
	},
];

const faqs: Faq[] = [
	{
		q: 'What is PromptLens?',
		a: 'PromptLens is an AI recommendation diagnostics tool. It scans the buyer prompts your customers ask AI assistants, shows which competitors get recommended instead of you, explains why, and turns each miss into a prioritized fix.',
	},
	{
		q: 'How do you gather the data?',
		a: 'Each scan runs a curated library of buyer prompts across major assistants, multiple times each, and captures the raw responses. Outputs are never influenced or manipulated.',
	},
	{
		q: 'How long does a scan take?',
		a: 'Most scans complete in under two minutes. On paid plans, scans run automatically on a schedule.',
	},
	{
		q: 'Can you guarantee AI will recommend me?',
		a: 'No — and we never claim to. AI answers vary. We measure observed recommendation patterns over repeated runs and identify the positioning, proof, and content gaps that improve your odds.',
	},
	{
		q: 'How is this different from AI writing tools?',
		a: 'Writing tools help you produce content. PromptLens tells you what to change so assistants actually recommend you — the specific gaps causing you to be overlooked, not just what to say.',
	},
	{
		q: 'Can agencies use this for clients?',
		a: 'Yes. The Scale plan supports multiple projects with client-ready reporting.',
	},
];

let openFaq = $state<number | null>(0);
</script>

<!-- PRICING -->
<section id="pricing" class="section-spacing">
	<div class="container">
		<div class="head">
			<span class="eyebrow">Pricing</span>
			<h2 class="h2">Start free. Upgrade when it pays for itself.</h2>
			<p class="lede">
				One recovered buyer-intent prompt can be worth more than a year of the plan.
				Begin with a free diagnostic — no card required.
			</p>
		</div>

		<div class="plans">
			{#each pricing as plan}
				<article class="plan" class:featured={plan.featured}>
					{#if plan.featured}
						<span class="plan-flag">Most popular</span>
					{/if}
					<div class="plan-top">
						<h3 class="plan-name">{plan.name}</h3>
						<div class="plan-price">
							<span class="plan-amount">{plan.price}</span>
							{#if plan.period}<span class="plan-period">{plan.period}</span>{/if}
						</div>
						<p class="plan-desc">{plan.desc}</p>
					</div>
					<ul class="plan-feats">
						{#each plan.feats as feat}
							<li><Check size={15} aria-hidden="true" /><span>{feat}</span></li>
						{/each}
					</ul>
					<a class="plan-cta" class:primary={plan.featured} href="/login">
						{plan.cta}
						<ArrowRight size={16} aria-hidden="true" />
					</a>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- FAQ -->
<section id="faq" class="section-spacing faq-section">
	<div class="container faq-wrap">
		<div class="faq-head">
			<span class="eyebrow">FAQ</span>
			<h2 class="h2">Questions, answered.</h2>
		</div>

		<div class="faq-list">
			{#each faqs as faq, i}
				<div class="faq-item" class:open={openFaq === i}>
					<button
						class="faq-q"
						aria-expanded={openFaq === i}
						onclick={() => (openFaq = openFaq === i ? null : i)}
					>
						<span>{faq.q}</span>
						<ChevronDown class="faq-chevron" size={18} aria-hidden="true" />
					</button>
					{#if openFaq === i}
						<p class="faq-a">{faq.a}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CLOSING CTA -->
<section class="cta-band">
	<div class="container cta-inner">
		<h2 class="cta-title">See your AI competitor report.</h2>
		<p class="cta-sub">Run a free diagnostic and find out which prompts your competitors are winning.</p>
		<a class="cta-btn" href="/login">
			Run a free diagnostic
			<ArrowRight size={17} aria-hidden="true" />
		</a>
	</div>
</section>

<style>
	.head {
		max-width: 38rem;
		margin-bottom: 3.5rem;
	}
	.h2 {
		font-size: clamp(1.9rem, 3.6vw, 2.8rem);
		line-height: 1.1;
		margin: 1rem 0 0;
		color: var(--color-foreground);
	}
	.lede {
		margin: 1.1rem 0 0;
		font-size: 1.05rem;
		line-height: 1.6;
		color: var(--color-muted-foreground);
	}

	/* ── Plans ── */
	.plans {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
	}
	.plan {
		position: relative;
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1.75rem;
	}
	.plan.featured {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-card);
	}
	.plan-flag {
		position: absolute;
		top: -0.7rem;
		left: 1.75rem;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background: var(--color-primary);
		color: var(--color-primary-foreground);
		padding: 0.3rem 0.7rem;
		border-radius: var(--radius-full);
	}
	.plan-name {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-slate-500);
		margin: 0;
	}
	.plan-price {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		margin: 0.9rem 0 0;
	}
	.plan-amount {
		font-family: var(--font-display);
		font-size: 2.6rem;
		font-weight: 500;
		letter-spacing: -0.02em;
		color: var(--color-foreground);
	}
	.plan-period {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		color: var(--color-slate-400);
	}
	.plan-desc {
		margin: 0.5rem 0 0;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--color-muted-foreground);
		min-height: 2.7rem;
	}
	.plan-feats {
		list-style: none;
		margin: 1.5rem 0;
		padding: 1.5rem 0 0;
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		flex: 1;
	}
	.plan-feats li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.92rem;
		color: var(--color-slate-700);
	}
	.plan-feats :global(svg) {
		color: var(--color-primary);
		flex: none;
	}
	.plan-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.92rem;
		font-weight: 600;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-full);
		text-decoration: none;
		border: 1px solid var(--color-input);
		color: var(--color-foreground);
		background: var(--color-surface);
		transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
	}
	.plan-cta:hover {
		border-color: var(--color-foreground);
		transform: translateY(-1px);
	}
	.plan-cta.primary {
		background: var(--color-primary);
		color: var(--color-primary-foreground);
		border-color: var(--color-primary);
		box-shadow: 0 1px 2px rgba(12, 93, 77, 0.25);
	}
	.plan-cta.primary:hover {
		background: var(--color-brand-dark);
		box-shadow: 0 8px 22px -10px rgba(12, 93, 77, 0.6);
	}

	/* ── FAQ ── */
	.faq-section {
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
	}
	.faq-wrap {
		display: grid;
		grid-template-columns: 0.8fr 1.2fr;
		gap: 3.5rem;
		align-items: start;
	}
	.faq-list {
		border-top: 1px solid var(--color-border);
	}
	.faq-item {
		border-bottom: 1px solid var(--color-border);
	}
	.faq-q {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		padding: 1.3rem 0;
		font-family: var(--font-sans);
		font-size: 1.02rem;
		font-weight: 600;
		color: var(--color-foreground);
	}
	.faq-q :global(.faq-chevron) {
		flex: none;
		color: var(--color-slate-400);
		transition: transform 0.2s ease;
	}
	.faq-item.open .faq-q :global(.faq-chevron) {
		transform: rotate(180deg);
		color: var(--color-primary);
	}
	.faq-a {
		margin: 0;
		padding: 0 0 1.4rem;
		max-width: 38rem;
		font-size: 0.97rem;
		line-height: 1.6;
		color: var(--color-muted-foreground);
	}

	/* ── Closing CTA ── */
	.cta-band {
		background: var(--color-foreground);
		color: var(--color-background);
		border-top: 1px solid var(--color-border);
	}
	.cta-inner {
		text-align: center;
		padding-top: clamp(4rem, 9vw, 6.5rem);
		padding-bottom: clamp(4rem, 9vw, 6.5rem);
	}
	.cta-title {
		font-size: clamp(2rem, 4.5vw, 3.2rem);
		line-height: 1.05;
		color: var(--color-background);
		margin: 0;
	}
	.cta-sub {
		margin: 1.1rem auto 0;
		max-width: 32rem;
		font-size: 1.05rem;
		line-height: 1.55;
		color: #c9c4b6;
	}
	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
		background: var(--color-brand-light);
		color: #06241d;
		font-weight: 600;
		font-size: 0.98rem;
		padding: 0.85rem 1.6rem;
		border-radius: var(--radius-full);
		text-decoration: none;
		transition: transform 0.15s ease, background 0.15s ease;
	}
	.cta-btn:hover {
		background: #1aa589;
		transform: translateY(-1px);
	}

	@media (max-width: 860px) {
		.plans {
			grid-template-columns: 1fr;
		}
		.faq-wrap {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}
</style>
