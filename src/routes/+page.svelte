<script lang="ts">
import {
	ArrowRight,
	Check,
	ChevronDown,
	Eye,
	FileText,
	Globe,
	TrendingUp,
	Users,
} from 'lucide-svelte';
import Footer from '$lib/components/layout/Footer.svelte';
import Navbar from '$lib/components/layout/Navbar.svelte';
import { Badge } from '$lib/components/ui/badge/index.js';
import * as Button from '$lib/components/ui/button/index.js';
import * as Card from '$lib/components/ui/card/index.js';
import ScrollReveal from '$lib/components/ui/scroll-reveal.svelte';

let url = $state('');

const aiModels = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot', 'Grok'];

const heroBullets = [
	'Track your AI share of voice across high-intent prompts.',
	'See why assistants rank competitors above you.',
	'Get a weekly fix list tied to messaging, docs, and product pages.',
];

const painPoints = [
	{
		icon: Eye,
		title: 'Invisible distribution',
		desc: "AI assistants are a new referral source, but you can't see how they describe you.",
	},
	{
		icon: Users,
		title: 'Losing high-intent traffic',
		desc: 'When buyers ask for the best tool, competitors get named first.',
	},
	{
		icon: TrendingUp,
		title: 'No clear fix path',
		desc: "Even if you spot the miss, you don't know which changes move rankings.",
	},
];

const howItWorks = [
	{
		step: '01',
		title: 'Add your product',
		desc: 'Share your site, positioning, and top competitors.',
	},
	{
		step: '02',
		title: 'Scan AI intent',
		desc: 'Run high-intent queries across major AI assistants.',
	},
	{
		step: '03',
		title: 'Ship the fixes',
		desc: 'Get a prioritized report with wins, misses, and next actions.',
	},
];

const features = [
	{
		icon: Eye,
		title: 'AI Share of Voice',
		desc: 'Measure how often you appear and where you rank across high-intent queries.',
		stat: '30+',
		statLabel: 'intents tracked',
	},
	{
		icon: Users,
		title: 'Recommendation Reasons',
		desc: 'See the phrasing assistants use and why competitors get picked.',
		stat: 'Top 3',
		statLabel: 'reason drivers',
	},
	{
		icon: FileText,
		title: 'Fix Impact Plan',
		desc: 'Prioritized changes across messaging, docs, and pages to move rankings.',
		stat: 'Weekly',
		statLabel: 'action plan',
	},
];

const pricing = [
	{
		name: 'Starter',
		price: '$0',
		desc: 'Baseline scan for one product',
		feats: ['1 project', '30 intent queries', 'Snapshot report', 'Email summary'],
		cta: 'Run Free Scan',
		featured: false,
	},
	{
		name: 'Growth',
		price: '$79',
		period: '/mo',
		desc: 'For B2B SaaS teams optimizing acquisition',
		feats: [
			'Unlimited scans',
			'Weekly visibility report',
			'Competitor tracking',
			'Fix impact plan',
			'Email support',
		],
		cta: 'Start Free Trial',
		featured: true,
	},
	{
		name: 'Scale',
		price: '$199',
		period: '/mo',
		desc: 'For multi-product teams and agencies',
		feats: ['Everything in Growth', '5 projects', 'Daily monitoring', 'API access', 'Slack alerts'],
		cta: 'Start Free Trial',
		featured: false,
	},
];

const faqs = [
	{
		q: 'What is AI Visibility Intelligence?',
		a: 'Get a measurement of how AI assistants describe and rank your product across high-intent prompts, translated into a prioritized fix plan.',
	},
	{
		q: 'How do you gather the data?',
		a: 'Each scan runs a curated library of prompts across major assistants and captures responses. Outputs are never influenced or manipulated.',
	},
	{
		q: 'How long does a scan take?',
		a: 'Most scans complete in under 2 minutes. Scheduled scans run automatically based on your plan.',
	},
	{
		q: 'What changes do you recommend?',
		a: 'Typically messaging, positioning, product pages, and docs. You get clear guidance on what to change and why it improves rankings.',
	},
	{
		q: 'Can agencies use this for clients?',
		a: 'Yes. The Scale plan supports multiple projects with client-ready reporting.',
	},
	{
		q: 'Will AI-generated content hurt my SEO?',
		a: 'No. Our recommendations focus on strategic messaging, positioning, and product clarity—not keyword stuffing. The fixes improve how AI assistants understand and recommend you, which aligns with what search engines reward: clear, helpful content.',
	},
	{
		q: 'How is this different from using AI writing tools?',
		a: 'AI writing tools help you create content. AVI tells you what to change so AI assistants actually recommend you. We identify the specific gaps causing you to be overlooked—not just what to say, but why competitors get picked over you.',
	},
];

let openFaq = $state<number | null>(null);
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

<Navbar />

<main id="main-content">
    <!-- HERO -->
    <section class="hero section-spacing">
        <div class="container relative z-10">
            <ScrollReveal>
                <div class="hero-grid">
                    <div class="hero-content">
                        <div class="hero-badge-container mb-8">
                            <Badge
                                variant="outline"
                                class="gap-2 rounded-full px-4 py-1.5 bg-white border-slate-200 text-slate-600 shadow-sm hover:border-brand/30"
                            >
                                <span class="badge-dot"></span>
                                AI VISIBILITY SCAN - TRACKING 6 MAJOR ASSISTANTS
                            </Badge>
                        </div>

                        <h1 class="hero-title">
                            Own Your Position in
                            <span class="text-gradient"
                                >AI Recommendations</span
                            >
                        </h1>

                        <p class="hero-subtitle">
                            AI assistants influence every buying journey. AVI
                            shows you how they describe you and what to change
                            to win more mentions.
                        </p>

                        <ul class="hero-bullets">
                            {#each heroBullets as bullet}
                                <li>
                                    <Check
                                        size={18}
                                        class="bullet-icon"
                                        aria-hidden="true"
                                    />
                                    <span>{bullet}</span>
                                </li>
                            {/each}
                        </ul>

                        <div class="hero-cta-group">
                            <div class="scan-bar-container">
                                <div class="scan-bar-glow"></div>
                                <div class="scan-bar">
                                    <Globe
                                        size={20}
                                        class="scan-icon"
                                        aria-hidden="true"
                                    />
                                    <input
                                        type="url"
                                        inputmode="url"
                                        bind:value={url}
                                        name="website"
                                        autocomplete="off"
                                        spellcheck="false"
                                        placeholder="https://yourproduct.com…"
                                        aria-label="Your product URL"
                                        class="scan-input"
                                    />
                                    <Button.Root
                                        variant="brand"
                                        class="scan-btn h-12 px-8 font-bold"
                                        href="/login"
                                    >
                                        Get Free AI Score
                                        <ArrowRight
                                            size={18}
                                            class="ml-2"
                                            aria-hidden="true"
                                        />
                                    </Button.Root>
                                </div>
                            </div>
                            <div class="hero-cta-meta">
                                <p class="hero-hint">
                                    No credit card required. <span
                                        class="text-slate-900 font-medium"
                                        >Results in 2 minutes.</span
                                    >
                                </p>
                                <a class="hero-link" href="#pricing"
                                    >View a Sample Report</a
                                >
                            </div>
                        </div>

                        <div class="hero-proof">
                            <div class="proof-card">
                                <span class="proof-value">30+</span>
                                <span class="proof-label"
                                    >High-intent prompts</span
                                >
                                <span class="proof-desc"
                                    >Queries buyers actually ask.</span
                                >
                            </div>
                            <div class="proof-card">
                                <span class="proof-value">6</span>
                                <span class="proof-label">AI assistants</span>
                                <span class="proof-desc"
                                    >ChatGPT, Claude, Gemini, and more.</span
                                >
                            </div>
                            <div class="proof-card">
                                <span class="proof-value">3</span>
                                <span class="proof-label"
                                    >Priority fixes</span
                                >
                                <span class="proof-desc"
                                    >Actionable changes per report.</span
                                >
                            </div>
                        </div>
                    </div>

                    <div class="hero-visual">
                        <div class="signal-card">
                            <div class="signal-header">
                                <div>
                                    <span class="signal-kicker"
                                        >Sample visibility report</span
                                    >
                                    <span class="signal-title"
                                        >AI Recommendation Snapshot</span
                                    >
                                </div>
                                <Badge
                                    variant="secondary"
                                    class="signal-badge"
                                    >Live</Badge
                                >
                            </div>
                            <div class="signal-score">
                                <div class="score-ring">
                                    <span class="score-num">63</span>
                                    <span class="score-unit">/100</span>
                                </div>
                                <div class="score-copy">
                                    <span class="signal-score-label"
                                        >Visibility score</span
                                    >
                                    <span class="signal-score-trend"
                                        >+18% in 30 days</span
                                    >
                                </div>
                            </div>
                            <div class="signal-bars">
                                <div class="signal-bar">
                                    <span>Mentions</span>
                                    <div class="bar-track">
                                        <div
                                            class="bar-fill"
                                            style="--bar: 63%"
                                        ></div>
                                    </div>
                                    <span class="bar-value">19/30</span>
                                </div>
                                <div class="signal-bar">
                                    <span>Top position</span>
                                    <div class="bar-track">
                                        <div
                                            class="bar-fill"
                                            style="--bar: 54%"
                                        ></div>
                                    </div>
                                    <span class="bar-value">#2</span>
                                </div>
                                <div class="signal-bar">
                                    <span>Missed intents</span>
                                    <div class="bar-track">
                                        <div
                                            class="bar-fill"
                                            style="--bar: 37%"
                                        ></div>
                                    </div>
                                    <span class="bar-value">11</span>
                                </div>
                            </div>
                            <div class="signal-callout">
                                Top fix: Add a Who It's For section and pricing
                                comparison.
                            </div>
                        </div>
                        <div class="signal-stack">
                            <div class="stack-card">
                                <span class="stack-label"
                                    >Competitors tracked</span
                                >
                                <span class="stack-value">5 brands</span>
                            </div>
                            <div class="stack-card">
                                <span class="stack-label">Next scan</span>
                                <span class="stack-value">Every Monday</span>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    </section>

    <!-- LOGO CLOUD -->
    <section class="logo-section">
        <div class="container">
            <div class="flex flex-col items-center gap-8">
                <p class="logo-label">AI ANSWERS ANALYZED ACROSS</p>
                <div class="logo-cloud">
                    {#each aiModels as model}
                        <div class="logo-badge">
                            <span class="logo-badge-dot"></span>
                            {model}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </section>

    <!-- PROBLEM -->
    <section class="problem-section section-spacing">
        <div class="container">
            <ScrollReveal>
                <div class="section-header">
                    <h2 class="section-title">
                        AI Is Now the First Stop for Buyers
                    </h2>
                    <p class="section-desc">
                        Buyers ask AI assistants for recommendations before they
                        visit your site. If you are not mentioned, you are out of
                        the conversation.
                    </p>
                </div>
            </ScrollReveal>

            <div class="pain-grid">
                {#each painPoints as point, i}
                    <ScrollReveal delay={i * 100}>
                        <Card.Root class="pain-card p-8 lg:p-12">
                            <Card.Content class="p-0">
                                <div class="pain-icon">
                                    <point.icon size={24} aria-hidden="true" />
                                </div>
                                <h3 class="pain-title">
                                    {point.title}
                                </h3>
                                <p class="pain-desc">
                                    {point.desc}
                                </p>
                            </Card.Content>
                        </Card.Root>
                    </ScrollReveal>
                {/each}
            </div>
        </div>
    </section>

    <!-- SOLUTION -->
    <section class="solution-section section-spacing">
        <div class="container relative">
            <div class="solution-decorative-glow"></div>
            <div class="solution-grid">
                <div class="solution-content">
                    <ScrollReveal>
                        <span class="section-tag">THE SOLUTION</span>
                        <h2 class="section-title">
                            Turn AI Mentions Into Measurable Growth
                        </h2>
                        <p class="section-desc">
                            AVI monitors answers across assistants, ranks your
                            share of voice, and tells you exactly what to
                            change.
                        </p>

                        <ul class="solution-list">
                            <li>
                                <Check
                                    size={20}
                                    class="check-icon"
                                    aria-hidden="true"
                                />
                                <span>Track where you rank across assistants</span>
                            </li>
                            <li>
                                <Check
                                    size={20}
                                    class="check-icon"
                                    aria-hidden="true"
                                />
                                <span>Understand why competitors get picked</span>
                            </li>
                            <li>
                                <Check
                                    size={20}
                                    class="check-icon"
                                    aria-hidden="true"
                                />
                                <span>Get a weekly fix plan that ships fast</span>
                            </li>
                            <li>
                                <Check
                                    size={20}
                                    class="check-icon"
                                    aria-hidden="true"
                                />
                                <span>Strategy-first: we tell you what matters, not just what to write</span>
                            </li>
                        </ul>

                        <Button.Root
                            variant="brand"
                            class="solution-cta mt-6"
                            href="#pricing"
                        >
                            View Sample Report
                            <ArrowRight
                                size={18}
                                class="ml-2"
                                aria-hidden="true"
                            />
                        </Button.Root>
                    </ScrollReveal>
                </div>
                <div class="solution-visual">
                    <ScrollReveal delay={200}>
                        <div class="dashboard-preview">
                            <div class="preview-header">
                                <div class="preview-dots">
                                    <span class="dot red"></span>
                                    <span class="dot yellow"></span>
                                    <span class="dot green"></span>
                                </div>
                                <span class="preview-title">AVI Dashboard</span>
                            </div>
                            <div class="preview-body">
                                <div class="preview-score">
                                    <span class="score-label"
                                        >Your Visibility Score</span
                                    >
                                    <span class="score-value">47%</span>
                                    <span class="score-trend"
                                        >↑ 12% this week</span
                                    >
                                </div>
                                <div class="preview-metrics">
                                    <div class="metric">
                                        <span class="metric-value">14/30</span>
                                        <span class="metric-label"
                                            >Queries mentioned</span
                                        >
                                    </div>
                                    <div class="metric">
                                        <span class="metric-value">3</span>
                                        <span class="metric-label"
                                            >Competitor gaps</span
                                        >
                                    </div>
                                    <div class="metric">
                                        <span class="metric-value">5</span>
                                        <span class="metric-label"
                                            >Fixes pending</span
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-section section-spacing">
        <div class="container">
            <ScrollReveal>
                <div class="section-header">
                    <span class="section-tag">HOW IT WORKS</span>
                    <h2 class="section-title">
                        From Guesswork to Clarity in 3 Simple Steps
                    </h2>
                </div>
            </ScrollReveal>

            <div class="steps-grid">
                {#each howItWorks as step, i}
                    <ScrollReveal delay={i * 150}>
                        <div class="step-card">
                            <span class="step-number">{step.step}</span>
                            <h3 class="step-title">{step.title}</h3>
                            <p class="step-desc">{step.desc}</p>
                        </div>
                    </ScrollReveal>
                {/each}
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <section class="features-section section-spacing">
        <div class="container">
            <ScrollReveal>
                <div class="section-header">
                    <span class="section-tag">FEATURES</span>
                    <h2 class="section-title">
                        Everything You Need to Win AI Visibility
                    </h2>
                </div>
            </ScrollReveal>

            <div class="features-grid">
                {#each features as feature, i}
                    <ScrollReveal delay={i * 100}>
                        <Card.Root class="feature-card h-full p-8 lg:p-12">
                            <Card.Header class="p-0">
                                <div class="flex items-center justify-between">
                                    <div
                                        class="feature-icon bg-slate-100 p-3 rounded-lg text-brand"
                                    >
                                            <feature.icon
                                                size={24}
                                                aria-hidden="true"
                                            />
                                    </div>
                                    <div class="feature-stat text-right">
                                        <Badge
                                            variant="secondary"
                                            class="font-bold"
                                            >{feature.stat}</Badge
                                        >
                                        <span
                                            class="block text-[10px] text-muted-foreground uppercase tracking-wider mt-1"
                                            >{feature.statLabel}</span
                                        >
                                    </div>
                                </div>
                                <Card.Title class="mt-8 text-2xl"
                                    >{feature.title}</Card.Title
                                >
                            </Card.Header>
                            <Card.Content class="p-0 mt-4">
                                <p
                                    class="text-slate-500 text-lg leading-relaxed"
                                >
                                    {feature.desc}
                                </p>
                            </Card.Content>
                        </Card.Root>
                    </ScrollReveal>
                {/each}
            </div>
        </div>
    </section>

    <!-- PRICING -->
    <section id="pricing" class="pricing-section section-spacing">
        <div class="container">
            <ScrollReveal>
                <div class="section-header">
                    <span class="section-tag">PRICING</span>
                    <h2 class="section-title">
                        Simple Pricing, Built for Growth Teams
                    </h2>
                    <p class="section-desc">
                        Start with a free scan. Upgrade when you're ready.
                    </p>
                </div>
            </ScrollReveal>

            <div class="pricing-grid">
                {#each pricing as plan}
                    <ScrollReveal>
                        <Card.Root
                            class="price-card relative overflow-hidden {plan.featured
                                ? 'border-brand shadow-lg'
                                : ''}"
                        >
                            {#if plan.featured}
                                <div class="absolute top-0 right-0">
                                    <Badge
                                        variant="brand"
                                        class="rounded-none rounded-bl-lg px-3 py-1"
                                        >MOST POPULAR</Badge
                                    >
                                </div>
                            {/if}
                            <Card.Header>
                                <Card.Title
                                    class="text-lg text-slate-500 font-medium"
                                    >{plan.name}</Card.Title
                                >
                                <div
                                    class="price-amount mt-4 flex items-baseline gap-1"
                                >
                                    <span
                                        class="text-4xl font-bold tracking-tight"
                                        >{plan.price}</span
                                    >
                                    {#if plan.period}
                                        <span
                                            class="text-muted-foreground text-sm font-medium"
                                            >{plan.period}</span
                                        >
                                    {/if}
                                </div>
                                <Card.Description class="mt-2"
                                    >{plan.desc}</Card.Description
                                >
                            </Card.Header>
                            <Card.Content class="grid gap-4">
                                <ul class="space-y-3">
                                    {#each plan.feats as feat}
                                        <li
                                            class="flex items-center gap-2 text-sm text-slate-600"
                                        >
                                            <Check
                                                size={16}
                                                class="text-emerald-500 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span>{feat}</span>
                                        </li>
                                    {/each}
                                </ul>
                            </Card.Content>
                            <Card.Footer>
                                <Button.Root
                                    variant={plan.featured
                                        ? "brand"
                                        : "outline"}
                                    class="w-full"
                                    href="/login"
                                >
                                    {plan.cta}
                                </Button.Root>
                            </Card.Footer>
                        </Card.Root>
                    </ScrollReveal>
                {/each}
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="faq-section section-spacing">
        <div class="container">
            <ScrollReveal>
                <div class="section-header">
                    <span class="section-tag">FAQ</span>
                    <h2 class="section-title">Answers, Clearly</h2>
                </div>
            </ScrollReveal>

            <div class="faq-list">
                {#each faqs as faq, i}
                    <ScrollReveal delay={i * 50}>
                        <div class="faq-item" class:open={openFaq === i}>
                            <button
                                class="faq-question"
                                onclick={() =>
                                    (openFaq = openFaq === i ? null : i)}
                                aria-expanded={openFaq === i}
                                aria-controls={`faq-panel-${i}`}
                            >
                                <span>{faq.q}</span>
                                <ChevronDown
                                    size={20}
                                    class="faq-chevron"
                                    aria-hidden="true"
                                />
                            </button>
                            {#if openFaq === i}
                                <div
                                    class="faq-answer"
                                    id={`faq-panel-${i}`}
                                    role="region"
                                    aria-label={faq.q}
                                >
                                    <p>{faq.a}</p>
                                </div>
                            {/if}
                        </div>
                    </ScrollReveal>
                {/each}
            </div>
        </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta section-spacing">
        <div class="container">
            <ScrollReveal>
                <div class="cta-content">
                    <h2 class="cta-title">Be the Product AI Recommends.</h2>
                    <p class="cta-desc">
                        Turn AI visibility into qualified pipeline with a free
                        scan today.
                    </p>
                    <div class="cta-actions mt-10">
                        <Button.Root
                            variant="brand"
                            class="cta-btn-primary h-12 px-10 text-lg shadow-xl shadow-brand/20"
                            href="/login"
                        >
                            Run Free Scan
                            <ArrowRight
                                size={20}
                                class="ml-2"
                                aria-hidden="true"
                            />
                        </Button.Root>
                        <Button.Root
                            variant="outline"
                            class="cta-btn-secondary h-12 px-8 text-lg"
                            href="#pricing"
                        >
                            <FileText
                                size={20}
                                class="mr-2"
                                aria-hidden="true"
                            />
                            View Sample Report
                        </Button.Root>
                    </div>
                    <p class="cta-disclaimer">
                        Base analysis on observable patterns in AI answers.
                        Outputs are never influenced, controlled, or
                        manipulated.
                    </p>
                </div>
            </ScrollReveal>
        </div>
    </section>
</main>

<Footer />

<style>
    main {
        overflow-x: hidden;
    }

    .container {
        max-width: var(--container-max-wide);
        margin: 0 auto;
        padding: 0 var(--container-px);
    }

    h1,
    h2,
    h3 {
        text-wrap: balance;
    }

    .hero-content,
    .section-header,
    .pain-card,
    .step-card,
    .feature-card,
    .faq-item,
    .cta-content {
        overflow-wrap: break-word;
    }

    .skip-link {
        position: absolute;
        left: -999px;
        top: 1rem;
        background: var(--color-slate-900);
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        text-decoration: none;
        z-index: 200;
    }

    .skip-link:focus-visible {
        left: 1.5rem;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
    }

    :global(.reveal-base) {
        opacity: 0;
        transform: translateY(24px);
        transition:
            opacity 0.6s ease,
            transform 0.6s ease;
    }

    :global(.reveal-active) {
        opacity: 1;
        transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
        :global(.reveal-base) {
            transition: none;
            transform: none;
            opacity: 1;
        }

        .badge-dot {
            animation: none;
        }

        .logo-badge,
        .pain-card,
        .feature-card,
        .price-card,
        .metric {
            transition: none !important;
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       HERO
       ═══════════════════════════════════════════════════════════════ */
    .section-spacing {
        padding: var(--spacing-section) 0;
    }

    #pricing,
    #faq {
        scroll-margin-top: 110px;
    }

    @media (max-width: 768px) {
        .section-spacing {
            padding: var(--spacing-section-mobile) 0;
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       HERO REDESIGN
       ═══════════════════════════════════════════════════════════════ */
    .hero {
        overflow: hidden;
        background:
            radial-gradient(
                1200px circle at 10% -10%,
                rgba(255, 87, 34, 0.18) 0%,
                transparent 45%
            ),
            radial-gradient(
                900px circle at 90% 10%,
                rgba(15, 23, 42, 0.08) 0%,
                transparent 45%
            ),
            linear-gradient(180deg, #ffffff 0%, #fff8f3 55%, #ffffff 100%);
    }

    .hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
        gap: var(--space-16);
        align-items: center;
    }

    .hero-content {
        max-width: 640px;
    }

    .hero-badge-container {
        display: flex;
        justify-content: flex-start;
    }

    .badge-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.2);
        }
    }

    .hero-title {
        font-size: clamp(3rem, 8vw, 6rem);
        font-family: var(--font-display);
        font-weight: 700;
        line-height: 1.05;
        letter-spacing: -0.04em;
        margin-bottom: 1.5rem;
        color: var(--color-slate-900);
        text-wrap: balance;
    }

    .text-gradient {
        background: linear-gradient(
            135deg,
            var(--color-brand) 20%,
            #ff8a65 80%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .hero-subtitle {
        font-size: clamp(1.125rem, 2vw, 1.4rem);
        color: var(--color-slate-600);
        margin: 0 0 2rem;
        line-height: 1.5;
        font-weight: 500;
    }

    .hero-bullets {
        list-style: none;
        margin: 0 0 2.75rem;
        padding: 0;
        display: grid;
        gap: 0.75rem;
        color: var(--color-slate-700);
        font-size: 1rem;
    }

    .hero-bullets li {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
    }

    .bullet-icon {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 999px;
        padding: 4px;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .hero-cta-group {
        margin-bottom: 3rem;
    }

    .scan-bar-container {
        position: relative;
        max-width: 560px;
        margin: 0;
    }

    .scan-bar-glow {
        position: absolute;
        inset: -2px;
        background: linear-gradient(135deg, var(--color-brand), #ff8a65);
        filter: blur(20px);
        opacity: 0.08;
        border-radius: 16px;
    }

    .scan-bar {
        position: relative;
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid var(--color-slate-200);
        border-radius: 14px;
        padding: 0.6rem;
        box-shadow: var(--shadow-technical);
    }

    .scan-bar:focus-within {
        border-color: var(--color-brand);
        box-shadow: var(--shadow-soft-glow);
    }

    .scan-bar :global(.scan-icon) {
        color: var(--color-slate-400);
        margin-left: 1.25rem;
    }

    .scan-input {
        flex: 1;
        border: none;
        outline: none;
        padding: 1.25rem;
        font-size: 1.125rem;
        background: transparent;
        color: var(--color-slate-900);
        font-family: var(--font-sans);
        font-weight: 500;
    }

    .hero-cta-meta {
        margin-top: var(--space-4);
        display: flex;
        align-items: center;
        gap: var(--space-6);
        flex-wrap: wrap;
    }

    .hero-hint {
        margin: 0;
        font-size: 0.95rem;
        color: var(--color-slate-500);
    }

    .hero-link {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-slate-700);
        text-decoration: none;
    }

    .hero-link:hover {
        color: var(--color-slate-900);
    }

    .hero-link:focus-visible {
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 6px;
    }

    .hero-proof {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-4);
    }

    .proof-card {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid var(--color-slate-100);
        border-radius: 14px;
        padding: var(--space-5);
        box-shadow: var(--shadow-technical);
    }

    .proof-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-slate-900);
        letter-spacing: -0.02em;
        margin-bottom: 0.35rem;
        font-variant-numeric: tabular-nums;
    }

    .proof-label {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-slate-700);
        margin-bottom: 0.25rem;
    }

    .proof-desc {
        display: block;
        font-size: 0.85rem;
        color: var(--color-slate-500);
        line-height: 1.4;
    }

    .hero-visual {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .signal-card {
        background: linear-gradient(135deg, #0b1220 0%, #121a2b 100%);
        border-radius: 24px;
        padding: var(--space-8);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 40px 90px -30px rgba(15, 23, 42, 0.7);
        color: white;
    }

    .signal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-4);
        margin-bottom: var(--space-8);
    }

    .signal-kicker {
        display: block;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: rgba(148, 163, 184, 0.8);
        margin-bottom: 0.5rem;
    }

    .signal-title {
        display: block;
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.01em;
    }

    .signal-badge {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.15);
        font-weight: 600;
    }

    .signal-score {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        margin-bottom: var(--space-8);
    }

    .score-ring {
        width: 92px;
        height: 92px;
        border-radius: 50%;
        background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 138, 101, 0.3),
            rgba(255, 87, 34, 0.9)
        );
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 10px 30px rgba(255, 87, 34, 0.3);
    }

    .score-num {
        font-size: 2rem;
        font-weight: 800;
        line-height: 1;
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
    }

    .score-unit {
        font-size: 0.75rem;
        opacity: 0.8;
        margin-top: 2px;
    }

    .score-copy {
        display: grid;
        gap: 0.35rem;
    }

    .signal-score-label {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(148, 163, 184, 0.9);
    }

    .signal-score-trend {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
        width: fit-content;
    }

    .signal-bars {
        display: grid;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
    }

    .signal-bar {
        display: grid;
        grid-template-columns: 1fr 140px auto;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.85rem;
        color: rgba(226, 232, 240, 0.9);
    }

    .bar-track {
        position: relative;
        height: 8px;
        background: rgba(148, 163, 184, 0.2);
        border-radius: 999px;
        overflow: hidden;
    }

    .bar-fill {
        position: absolute;
        inset: 0;
        width: var(--bar);
        background: linear-gradient(
            90deg,
            rgba(255, 87, 34, 0.95),
            rgba(255, 138, 101, 0.9)
        );
    }

    .bar-value {
        font-weight: 700;
        color: white;
        font-variant-numeric: tabular-nums;
    }

    .signal-callout {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        padding: var(--space-5);
        font-size: 0.9rem;
        line-height: 1.5;
        color: rgba(226, 232, 240, 0.9);
    }

    .signal-stack {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-4);
    }

    .stack-card {
        background: white;
        border-radius: 14px;
        padding: var(--space-5);
        border: 1px solid var(--color-slate-100);
        box-shadow: var(--shadow-technical);
    }

    .stack-label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--color-slate-400);
        margin-bottom: 0.5rem;
    }

    .stack-value {
        display: block;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-slate-900);
    }

    /* ═══════════════════════════════════════════════════════════════
       LOGO CLOUD (TECHNICAL CHIPS)
       ═══════════════════════════════════════════════════════════════ */
    .logo-section {
        padding: 4rem 0 var(--spacing-section);
        background: white;
        border-bottom: 1px solid var(--color-slate-50);
    }

    .logo-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2em;
        color: var(--color-slate-400);
        text-transform: uppercase;
        margin-bottom: 1.5rem;
    }

    .logo-cloud {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .logo-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--color-slate-50);
        border: 1px solid var(--color-slate-100);
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-slate-700);
        font-family: var(--font-mono);
        transition: transform 0.2s ease;
    }

    .logo-badge:hover {
        background: white;
        border-color: var(--color-slate-200);
        color: var(--color-brand);
        transform: translateY(-1px);
    }

    .logo-badge-dot {
        width: 6px;
        height: 6px;
        background: var(--color-slate-300);
        border-radius: 50%;
    }

    .logo-badge:hover .logo-badge-dot {
        background: var(--color-brand);
    }

    /* ═══════════════════════════════════════════════════════════════
       SECTIONS BASE
       ═══════════════════════════════════════════════════════════════ */
    .section-header {
        text-align: center;
        margin-bottom: 5rem;
    }

    .section-tag {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        color: var(--color-brand);
        margin-bottom: 1rem;
        text-transform: uppercase;
    }

    .section-title {
        font-size: clamp(2.5rem, 5vw, 4rem);
        font-family: var(--font-display);
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: -0.03em;
        color: var(--color-slate-900);
        margin-bottom: 1.5rem;
        text-wrap: balance;
    }

    .section-desc {
        font-size: 1.25rem;
        color: var(--color-slate-500);
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.6;
        font-weight: 400;
    }

    /* ═══════════════════════════════════════════════════════════════
       PROBLEM SECTION
       ═══════════════════════════════════════════════════════════════ */
    /* ═══════════════════════════════════════════════════════════════
       PROBLEM SECTION
       ═══════════════════════════════════════════════════════════════ */
    .problem-section {
        background: white;
        position: relative;
    }

    .pain-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-8);
    }

    .pain-card {
        text-align: left;
        padding: var(--space-10);
        border: 1px solid var(--color-slate-100) !important;
        background-color: var(--color-slate-50) !important;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
    }

    .pain-card:hover {
        transform: translateY(-4px);
        background-color: white !important;
        border-color: var(--color-brand) / 20 !important;
        box-shadow: var(--shadow-technical);
    }

    .pain-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: var(--color-brand);
        border: 1px solid var(--color-slate-100);
        border-radius: 12px;
        margin-bottom: var(--space-6);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .pain-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: var(--space-3);
        color: var(--color-slate-900);
        letter-spacing: -0.01em;
    }

    .pain-desc {
        color: var(--color-slate-500);
        line-height: 1.6;
        font-size: 1rem;
    }

    /* ═══════════════════════════════════════════════════════════════
       SOLUTION SECTION (PREMIUM)
       ═══════════════════════════════════════════════════════════════ */
    .solution-section {
        background: var(--color-slate-50);
        border-top: 1px solid var(--color-slate-100);
        border-bottom: 1px solid var(--color-slate-100);
        overflow: hidden;
    }

    .solution-decorative-glow {
        position: absolute;
        width: 600px;
        height: 600px;
        background: radial-gradient(
            circle,
            rgba(255, 87, 34, 0.05) 0%,
            transparent 70%
        );
        top: -100px;
        right: -100px;
        z-index: 0;
    }

    .solution-grid {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: var(--space-20);
        align-items: center;
    }

    .solution-list {
        list-style: none;
        margin: 2.5rem 0;
    }

    .solution-list li {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-5);
        font-size: 1.125rem;
        color: var(--color-slate-700);
        font-weight: 500;
    }

    .solution-list :global(.check-icon) {
        color: #10b981;
        flex-shrink: 0;
        padding: 4px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 6px;
    }

    .dashboard-preview {
        background: #0f172a;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.4);
        position: relative;
    }

    .preview-header {
        background: rgba(30, 41, 59, 0.8);
        backdrop-filter: blur(8px);
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .preview-dots {
        display: flex;
        gap: 0.5rem;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }

    .dot.red {
        background: #ff5f56;
    }
    .dot.yellow {
        background: #ffbd2e;
    }
    .dot.green {
        background: #27c93f;
    }

    .preview-title {
        color: var(--color-slate-400);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .preview-body {
        padding: var(--space-12);
        background: radial-gradient(
            circle at 50% 50%,
            rgba(255, 87, 34, 0.05) 0%,
            transparent 100%
        );
    }

    .preview-score {
        text-align: center;
        margin-bottom: var(--space-12);
    }

    .score-label {
        display: block;
        color: var(--color-slate-400);
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: var(--space-4);
        letter-spacing: 0.05em;
    }

    .score-value {
        display: block;
        font-size: 6rem;
        font-weight: 800;
        color: var(--color-brand);
        font-family: var(--font-mono);
        line-height: 1;
        margin-bottom: var(--space-6);
        letter-spacing: -0.05em;
        font-variant-numeric: tabular-nums;
    }

    .score-trend {
        display: inline-flex;
        align-items: center;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 700;
        border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .preview-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-6);
    }

    .metric {
        text-align: center;
        padding: var(--space-6);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        transition: transform 0.2s ease;
    }

    .metric:hover {
        transform: scale(1.05);
        background: rgba(255, 255, 255, 0.05);
    }

    .metric-value {
        display: block;
        font-size: 1.75rem;
        font-weight: 800;
        color: white;
        font-family: var(--font-mono);
        margin-bottom: 0.25rem;
        font-variant-numeric: tabular-nums;
    }

    .metric-label {
        font-size: 0.7rem;
        color: var(--color-slate-400);
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.05em;
    }

    /* ═══════════════════════════════════════════════════════════════
       HOW IT WORKS & FEATURES
       ═══════════════════════════════════════════════════════════════ */
    .how-section {
        background: white;
    }

    .steps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-12);
        position: relative;
    }

    .step-card {
        padding: var(--space-10);
        position: relative;
    }

    .step-number {
        font-family: var(--font-mono);
        font-size: 4rem; /* More impact */
        font-weight: 800;
        color: var(--color-slate-100);
        position: absolute;
        top: -2rem;
        left: 0;
        z-index: 0;
        opacity: 0.8;
    }

    .step-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-slate-900);
        margin-bottom: var(--space-4);
        position: relative;
        z-index: 1;
    }

    .step-desc {
        color: var(--color-slate-500);
        line-height: 1.6;
        position: relative;
        z-index: 1;
    }

    .feature-card {
        border: 1px solid var(--color-slate-100) !important;
        transition: transform 0.3s ease !important;
        border-radius: 12px !important;
    }

    .feature-card:hover {
        border-color: var(--color-brand) / 30 !important;
        box-shadow: var(--shadow-technical) !important;
        transform: translateY(-2px);
    }

    .feature-icon {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* ═══════════════════════════════════════════════════════════════
       PRICING REDESIGN
       ═══════════════════════════════════════════════════════════════ */
    .pricing-section {
        background: var(--color-slate-50);
        border-top: 1px solid var(--color-slate-100);
    }

    .pricing-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-8);
        max-width: 1100px;
        margin: 0 auto;
    }

    .price-card {
        padding: var(--space-4);
        border: 1px solid var(--color-slate-200) !important;
        border-radius: 16px !important;
        transition: transform 0.3s ease !important;
    }

    .price-card:hover {
        border-color: var(--color-brand) / 40 !important;
        transform: scale(1.02);
    }

    .price-card.border-brand {
        border-width: 2px !important;
        box-shadow: 0 20px 40px -10px rgba(255, 87, 34, 0.1) !important;
    }

    /* ═══════════════════════════════════════════════════════════════
       FAQ
       ═══════════════════════════════════════════════════════════════ */

    /* ═══════════════════════════════════════════════════════════════
       FAQ
       ═══════════════════════════════════════════════════════════════ */
    .faq-section {
        padding: var(--space-24) 0;
        background: var(--color-slate-50);
        border-top: 1px solid var(--color-slate-100);
    }

    .faq-list {
        max-width: 700px;
        margin: 0 auto;
    }

    .faq-item {
        background: white;
        border: 1px solid var(--color-slate-200);
        border-radius: 12px;
        margin-bottom: var(--space-4);
        overflow: hidden;
    }

    .faq-question {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-6);
        background: transparent;
        border: none;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-slate-900);
        cursor: pointer;
        text-align: left;
    }

    .faq-item.open .faq-question {
        border-bottom: 1px solid var(--color-slate-100);
    }

    .faq-item :global(.faq-chevron) {
        color: var(--color-slate-400);
        transition: transform 0.2s;
    }

    .faq-item.open :global(.faq-chevron) {
        transform: rotate(180deg);
    }

    .faq-answer {
        padding: var(--space-6);
        color: var(--color-slate-600);
        line-height: 1.6;
    }

    /* ═══════════════════════════════════════════════════════════════
       FINAL CTA
       ═══════════════════════════════════════════════════════════════ */
    .final-cta {
        padding: var(--space-24) 0;
        background: var(--color-slate-900);
        text-align: center;
    }

    .cta-content {
        max-width: 600px;
        margin: 0 auto;
    }

    .cta-title {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        font-family: var(--font-display);
        font-weight: 700;
        color: white;
        margin-bottom: 2rem;
        line-height: 1.05;
        letter-spacing: -0.04em;
        text-wrap: balance;
    }

    .cta-desc {
        font-size: 1.25rem;
        color: var(--color-slate-400);
        margin-bottom: 3.5rem;
        line-height: 1.6;
    }

    .cta-actions {
        display: flex;
        justify-content: center;
        gap: var(--space-4);
        flex-wrap: wrap;
        margin-bottom: var(--space-10);
    }

    .cta-actions :global(.cta-btn-secondary) {
        border-color: var(--color-slate-700);
        color: white;
    }

    .cta-disclaimer {
        font-size: 0.875rem;
        color: var(--color-slate-500);
        line-height: 1.6;
    }

    /* ═══════════════════════════════════════════════════════════════
       RESPONSIVE
       ═══════════════════════════════════════════════════════════════ */
    /* ═══════════════════════════════════════════════════════════════
       RESPONSIVE
       ═══════════════════════════════════════════════════════════════ */
    @media (max-width: 1024px) {
        .pain-grid,
        .steps-grid,
        .features-grid,
        .pricing-grid {
            grid-template-columns: 1fr;
            gap: var(--space-6);
        }

        .solution-grid {
            grid-template-columns: 1fr;
            gap: var(--space-12);
        }

        .hero-grid {
            grid-template-columns: 1fr;
            gap: var(--space-10);
        }

        .hero-content {
            text-align: center;
            margin: 0 auto;
        }

        .hero-badge-container {
            justify-content: center;
        }

        .hero-bullets {
            max-width: 520px;
            margin: 0 auto 2.5rem;
            text-align: left;
        }

        .hero-cta-meta {
            justify-content: center;
        }

        .hero-proof {
            grid-template-columns: 1fr;
        }

        .scan-bar-container {
            margin: 0 auto;
        }

        .logo-cloud {
            gap: 1rem;
        }

        .scan-bar {
            flex-direction: column;
            padding: var(--space-4);
            gap: 1rem;
        }

        .scan-bar :global(.scan-icon) {
            display: none;
        }

        .scan-input {
            width: 100%;
            text-align: center;
            padding: 1rem;
        }

        .scan-bar :global(.scan-btn) {
            width: 100%;
            justify-content: center;
        }

        .signal-stack {
            grid-template-columns: 1fr;
        }

        .signal-bar {
            grid-template-columns: 1fr;
            align-items: start;
        }
    }

    @media (max-width: 768px) {
        .hero-title {
            font-size: 2.75rem;
        }

        .hero-subtitle {
            font-size: 1.125rem;
        }

        .cta-actions {
            flex-direction: column;
            align-items: center;
        }

        .signal-card {
            padding: var(--space-6);
        }

        .signal-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .score-ring {
            width: 76px;
            height: 76px;
        }

        .preview-metrics {
            grid-template-columns: 1fr;
        }

        .score-value {
            font-size: 4rem;
        }
    }
</style>
