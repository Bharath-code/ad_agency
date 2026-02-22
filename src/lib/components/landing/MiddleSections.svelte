<script lang="ts">
    import {
        ArrowRight,
        Check,
        Eye,
        FileText,
        TrendingUp,
        Users,
    } from "lucide-svelte";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Button from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import ScrollReveal from "$lib/components/ui/scroll-reveal.svelte";

    const aiModels = [
        "ChatGPT",
        "Claude",
        "Gemini",
        "Perplexity",
        "Copilot",
        "Grok",
    ];

    const painPoints = [
        {
            icon: Eye,
            title: "Invisible distribution",
            desc: "AI assistants are a new referral source, but you can't see how they describe you.",
        },
        {
            icon: Users,
            title: "Losing high-intent traffic",
            desc: "When buyers ask for the best tool, competitors get named first.",
        },
        {
            icon: TrendingUp,
            title: "No clear fix path",
            desc: "Even if you spot the miss, you don't know which changes move rankings.",
        },
    ];

    const howItWorks = [
        {
            step: "01",
            title: "Add your product",
            desc: "Share your site, positioning, and top competitors.",
        },
        {
            step: "02",
            title: "Scan AI intent",
            desc: "Run high-intent queries across major AI assistants.",
        },
        {
            step: "03",
            title: "Ship the fixes",
            desc: "Get a prioritized report with wins, misses, and next actions.",
        },
    ];

    const features = [
        {
            icon: Eye,
            title: "AI Share of Voice",
            desc: "Measure how often you appear and where you rank across high-intent queries.",
            stat: "30+",
            statLabel: "intents tracked",
        },
        {
            icon: Users,
            title: "Recommendation Reasons",
            desc: "See the phrasing assistants use and why competitors get picked.",
            stat: "Top 3",
            statLabel: "reason drivers",
        },
        {
            icon: FileText,
            title: "Fix Impact Plan",
            desc: "Prioritized changes across messaging, docs, and pages to move rankings.",
            stat: "Weekly",
            statLabel: "action plan",
        },
    ];
</script>

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
                            <h3 class="pain-title">{point.title}</h3>
                            <p class="pain-desc">{point.desc}</p>
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
                        AVI monitors answers across assistants, ranks your share
                        of voice, and tells you exactly what to change.
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
                            <span
                                >Strategy-first: we tell you what matters, not
                                just what to write</span
                            >
                        </li>
                    </ul>

                    <Button.Root
                        variant="brand"
                        class="solution-cta mt-6"
                        href="#pricing"
                    >
                        View Sample Report
                        <ArrowRight size={18} class="ml-2" aria-hidden="true" />
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
                                <span class="score-trend">↑ 12% this week</span>
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
                                    <Badge variant="secondary" class="font-bold"
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
                            <p class="text-slate-500 text-lg leading-relaxed">
                                {feature.desc}
                            </p>
                        </Card.Content>
                    </Card.Root>
                </ScrollReveal>
            {/each}
        </div>
    </div>
</section>
