<script lang="ts">
import { ArrowRight } from 'lucide-svelte';

const assistants = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];
</script>

<section class="hero">
	<div class="container hero-grid">
		<div class="hero-copy">
			<span class="eyebrow fade" style="--d: 0ms">AI Recommendation Diagnostics</span>

			<h1 class="hero-title fade" style="--d: 60ms">
				See why AI recommends
				<em>competitors</em>, not you.
			</h1>

			<p class="hero-sub fade" style="--d: 120ms">
				When buyers ask ChatGPT and Claude for tools like yours, PromptLens shows
				which competitors get recommended, the exact reasons they win, and what to
				ship next to win those prompts back.
			</p>

			<div class="hero-cta fade" style="--d: 180ms">
				<a class="btn-primary" href="/login">
					Run a free diagnostic
					<ArrowRight size={17} aria-hidden="true" />
				</a>
				<a class="btn-ghost" href="#how">See how it works</a>
			</div>

			<div class="hero-trust fade" style="--d: 240ms">
				<span>No credit card</span>
				<span class="dot"></span>
				<span>30 buyer prompts</span>
				<span class="dot"></span>
				<span>Results in ~2 min</span>
			</div>

			<div class="hero-scan fade" style="--d: 300ms">
				<span class="scan-label">Scanning</span>
				{#each assistants as a}
					<span class="scan-chip">{a}</span>
				{/each}
			</div>
		</div>

		<aside class="hero-card fade" style="--d: 220ms" aria-label="Example diagnostic">
			<header class="dc-head">
				<span class="dc-kicker">Buyer prompt</span>
				<span class="dc-meta">3 runs · GPT-4o + Claude</span>
			</header>

			<p class="dc-prompt">"What's the best AI visibility tool for a B2B SaaS startup?"</p>

			<div class="dc-verdict">
				<div class="dc-row miss">
					<span class="dc-tag">Recommended</span>
					<span class="dc-name">Profound</span>
					<span class="dc-conf">high confidence</span>
				</div>
				<div class="dc-row you">
					<span class="dc-tag">Your brand</span>
					<span class="dc-name">Not mentioned</span>
					<span class="dc-conf">0 / 3 runs</span>
				</div>
			</div>

			<div class="dc-why">
				<span class="dc-why-label">Why they win</span>
				<ul>
					<li>Clear "for B2B SaaS" positioning on the homepage.</li>
					<li>A dedicated comparison page the model can cite.</li>
				</ul>
			</div>

			<footer class="dc-fix">
				<span class="dc-fix-dot"></span>
				<span><strong>Top fix:</strong> publish a "PromptLens vs Profound" page and add a who-it's-for line.</span>
			</footer>
		</aside>
	</div>
</section>

<style>
	.hero {
		padding-top: clamp(3.5rem, 8vw, 6.5rem);
		padding-bottom: clamp(3.5rem, 8vw, 6rem);
	}

	.hero-grid {
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: clamp(2.5rem, 6vw, 5rem);
		align-items: center;
	}

	/* ── Copy ── */
	.hero-title {
		font-size: clamp(2.6rem, 5.4vw, 4rem);
		line-height: 1.02;
		font-weight: 500;
		margin: 1.4rem 0 0;
		color: var(--color-foreground);
	}
	.hero-title em {
		font-style: italic;
		color: var(--color-primary);
	}

	.hero-sub {
		margin: 1.5rem 0 0;
		max-width: 34rem;
		font-size: 1.08rem;
		line-height: 1.6;
		color: var(--color-muted-foreground);
	}

	.hero-cta {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-primary);
		color: var(--color-primary-foreground);
		font-weight: 600;
		font-size: 0.95rem;
		padding: 0.8rem 1.4rem;
		border-radius: var(--radius-full);
		text-decoration: none;
		transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
		box-shadow: 0 1px 2px rgba(12, 93, 77, 0.25);
	}
	.btn-primary:hover {
		background: var(--color-brand-dark);
		transform: translateY(-1px);
		box-shadow: 0 8px 22px -10px rgba(12, 93, 77, 0.6);
	}

	.btn-ghost {
		font-weight: 500;
		font-size: 0.95rem;
		color: var(--color-foreground);
		text-decoration: none;
		border-bottom: 1px solid var(--color-slate-300);
		padding-bottom: 2px;
		transition: border-color 0.15s ease, color 0.15s ease;
	}
	.btn-ghost:hover {
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.hero-trust {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: var(--color-muted-foreground);
	}
	.hero-trust .dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--color-slate-400);
	}

	.hero-scan {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2.25rem;
		flex-wrap: wrap;
	}
	.scan-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-slate-400);
		margin-right: 0.25rem;
	}
	.scan-chip {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-slate-600);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		padding: 0.3rem 0.7rem;
		border-radius: var(--radius-full);
	}

	/* ── Diagnostic card ── */
	.hero-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1.5rem 1.6rem;
		box-shadow: var(--shadow-raised);
	}

	.dc-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.dc-kicker {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-primary);
	}
	.dc-meta {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-slate-400);
	}

	.dc-prompt {
		font-family: var(--font-display);
		font-size: 1.18rem;
		line-height: 1.35;
		color: var(--color-foreground);
		margin: 0.8rem 0 1.4rem;
	}

	.dc-verdict {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem 1.1rem;
		border-radius: var(--radius-md);
		background: var(--color-slate-50);
		border: 1px solid var(--color-border);
	}
	.dc-row {
		display: grid;
		grid-template-columns: 5.5rem 1fr auto;
		align-items: baseline;
		gap: 0.75rem;
	}
	.dc-tag {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-slate-500);
	}
	.dc-name {
		font-weight: 600;
		font-size: 0.98rem;
		color: var(--color-foreground);
	}
	.dc-row.miss .dc-name {
		color: var(--color-signal-miss);
	}
	.dc-row.you .dc-name {
		color: var(--color-slate-500);
		font-weight: 500;
	}
	.dc-conf {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-slate-400);
	}

	.dc-why {
		margin-top: 1.2rem;
	}
	.dc-why-label {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-slate-400);
	}
	.dc-why ul {
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.dc-why li {
		position: relative;
		padding-left: 1.1rem;
		font-size: 0.9rem;
		line-height: 1.45;
		color: var(--color-slate-600);
	}
	.dc-why li::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-signal-miss);
	}

	.dc-fix {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		margin-top: 1.3rem;
		padding-top: 1.1rem;
		border-top: 1px solid var(--color-border);
		font-size: 0.9rem;
		line-height: 1.45;
		color: var(--color-slate-700);
	}
	.dc-fix strong {
		color: var(--color-primary);
		font-weight: 600;
	}
	.dc-fix-dot {
		flex: none;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-top: 0.4em;
		background: var(--color-primary);
		box-shadow: 0 0 0 4px var(--color-accent);
	}

	/* ── Entrance ── */
	.fade {
		opacity: 0;
		transform: translateY(12px);
		animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: var(--d, 0ms);
	}
	@keyframes rise {
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.fade {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	@media (max-width: 900px) {
		.hero-grid {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
		.hero-card {
			order: 2;
		}
	}
</style>
