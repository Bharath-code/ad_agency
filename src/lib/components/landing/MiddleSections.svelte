<script lang="ts">
import { FileSearch, GitCompareArrows, ListChecks } from 'lucide-svelte';

const assistants = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot', 'Grok'];

const problems = [
	{
		k: '01',
		title: 'A discovery channel you can’t see',
		desc: 'Buyers ask assistants for recommendations before they ever reach your site. You have no visibility into what those answers say.',
	},
	{
		k: '02',
		title: 'Competitors become the default',
		desc: 'When someone asks for "the best tool", a competitor gets named first — and you’re left out of the shortlist entirely.',
	},
	{
		k: '03',
		title: 'No idea what to fix',
		desc: 'Even when you spot a miss, you don’t know whether it’s positioning, proof, or a missing page that’s costing you.',
	},
];

const steps = [
	{
		icon: FileSearch,
		title: 'Profile your product',
		desc: 'Add your site, positioning, and the competitors you actually lose to.',
	},
	{
		icon: GitCompareArrows,
		title: 'Scan buyer prompts',
		desc: 'We run 30 high-intent prompts across the major assistants, several times each.',
	},
	{
		icon: ListChecks,
		title: 'Ship the fixes',
		desc: 'Get a prioritized list of positioning, content, and proof changes — with the evidence behind each.',
	},
];

const features = [
	{
		stat: '30+',
		statLabel: 'buyer prompts',
		title: 'Recommendation share',
		desc: 'See exactly which prompts recommend you, a competitor, or no one — with position and confidence for every run.',
	},
	{
		stat: 'Top 3',
		statLabel: 'reasons',
		title: 'Why competitors win',
		desc: 'We extract the repeated reasons assistants prefer competitors, grouped into themes you can act on.',
	},
	{
		stat: 'Raw',
		statLabel: 'transcripts',
		title: 'Evidence, not vibes',
		desc: 'Every claim links to the raw model response, run count, and date. No black box, no fake precision.',
	},
];
</script>

<!-- TRUST BAND -->
<section class="band">
	<div class="container band-inner">
		<span class="band-label">Answers analyzed across</span>
		<div class="band-list">
			{#each assistants as a}
				<span class="band-item">{a}</span>
			{/each}
		</div>
	</div>
</section>

<!-- PROBLEM -->
<section class="section-spacing">
	<div class="container">
		<div class="head">
			<span class="eyebrow">The shift</span>
			<h2 class="h2">AI is the first stop for buyers now.</h2>
			<p class="lede">
				The buying journey starts in a chat window. If assistants don’t recommend
				you, you’re out of the conversation before it begins.
			</p>
		</div>

		<div class="problem-grid">
			{#each problems as p}
				<article class="problem">
					<span class="problem-k">{p.k}</span>
					<h3 class="problem-title">{p.title}</h3>
					<p class="problem-desc">{p.desc}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- HOW IT WORKS -->
<section id="how" class="section-spacing how">
	<div class="container">
		<div class="head">
			<span class="eyebrow">How it works</span>
			<h2 class="h2">From guesswork to a clear plan in three steps.</h2>
		</div>

		<ol class="steps">
			{#each steps as s, i}
				<li class="step">
					<div class="step-top">
						<span class="step-num">{(i + 1).toString().padStart(2, '0')}</span>
						<span class="step-icon"><s.icon size={18} aria-hidden="true" /></span>
					</div>
					<h3 class="step-title">{s.title}</h3>
					<p class="step-desc">{s.desc}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>

<!-- FEATURES -->
<section class="section-spacing">
	<div class="container">
		<div class="head">
			<span class="eyebrow">What you get</span>
			<h2 class="h2">Diagnostics, not another vanity score.</h2>
			<p class="lede">
				Most tools hand you a number. PromptLens hands you the reason you lost and
				the fix to win it back.
			</p>
		</div>

		<div class="feature-grid">
			{#each features as f}
				<article class="feature">
					<div class="feature-stat">
						<span class="feature-num">{f.stat}</span>
						<span class="feature-statlabel">{f.statLabel}</span>
					</div>
					<h3 class="feature-title">{f.title}</h3>
					<p class="feature-desc">{f.desc}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	/* ── Trust band ── */
	.band {
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
	}
	.band-inner {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding-top: 1.5rem;
		padding-bottom: 1.5rem;
		flex-wrap: wrap;
	}
	.band-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-slate-400);
		flex: none;
	}
	.band-list {
		display: flex;
		flex-wrap: wrap;
		gap: 1.75rem;
	}
	.band-item {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--color-slate-600);
	}

	/* ── Shared heads ── */
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

	/* ── Problem ── */
	.problem-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0;
		border-top: 1px solid var(--color-border);
	}
	.problem {
		padding: 2rem 2rem 2rem 0;
		border-right: 1px solid var(--color-border);
	}
	.problem:last-child {
		border-right: none;
		padding-right: 0;
	}
	.problem:not(:first-child) {
		padding-left: 2rem;
	}
	.problem-k {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--color-primary);
		letter-spacing: 0.05em;
	}
	.problem-title {
		font-family: var(--font-sans);
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin: 0.9rem 0 0;
		color: var(--color-foreground);
	}
	.problem-desc {
		margin: 0.6rem 0 0;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--color-muted-foreground);
	}

	/* ── How it works ── */
	.how {
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2.5rem;
		counter-reset: step;
	}
	.step-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
	}
	.step-num {
		font-family: var(--font-mono);
		font-size: 1.4rem;
		font-weight: 500;
		color: var(--color-slate-300);
	}
	.step-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background: var(--color-accent);
		color: var(--color-primary);
	}
	.step-title {
		font-family: var(--font-sans);
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin: 1.2rem 0 0;
		color: var(--color-foreground);
	}
	.step-desc {
		margin: 0.55rem 0 0;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--color-muted-foreground);
	}

	/* ── Features ── */
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-surface);
	}
	.feature {
		padding: 2rem;
		border-right: 1px solid var(--color-border);
	}
	.feature:last-child {
		border-right: none;
	}
	.feature-stat {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding-bottom: 1.25rem;
		margin-bottom: 1.25rem;
		border-bottom: 1px solid var(--color-border);
	}
	.feature-num {
		font-family: var(--font-mono);
		font-size: 1.6rem;
		font-weight: 600;
		color: var(--color-primary);
	}
	.feature-statlabel {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-slate-400);
	}
	.feature-title {
		font-family: var(--font-sans);
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin: 0;
		color: var(--color-foreground);
	}
	.feature-desc {
		margin: 0.55rem 0 0;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--color-muted-foreground);
	}

	@media (max-width: 860px) {
		.problem-grid,
		.steps,
		.feature-grid {
			grid-template-columns: 1fr;
		}
		.problem {
			padding: 1.5rem 0;
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}
		.problem:not(:first-child) {
			padding-left: 0;
		}
		.feature {
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}
		.feature:last-child {
			border-bottom: none;
		}
	}
</style>
