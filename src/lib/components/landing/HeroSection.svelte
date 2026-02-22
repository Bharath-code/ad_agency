<script lang="ts">
import {
	ArrowRight,
	Check,
	Globe,
} from 'lucide-svelte';
import { Badge } from '$lib/components/ui/badge/index.js';
import * as Button from '$lib/components/ui/button/index.js';
import ScrollReveal from '$lib/components/ui/scroll-reveal.svelte';

let url = $state('');

const heroBullets = [
	'Track your AI share of voice across high-intent prompts.',
	'See why assistants rank competitors above you.',
	'Get a weekly fix list tied to messaging, docs, and product pages.',
];
</script>

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
                            AI VISIBILITY SCAN - TRACKING 6 MAJOR ASSISTANTS
                        </Badge>
                    </div>

                    <h1 class="hero-title">
                        Own Your Position in
                        <span class="text-gradient">AI Recommendations</span>
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
                                    id="website-url"
                                    autocomplete="off"
                                    spellcheck="false"
                                    placeholder="https://yourproduct.com…"
                                    aria-label="Your product URL"
                                    class="scan-input"
                                    onkeydown={(e) => e.key === 'Enter' && document.querySelector<HTMLAnchorElement>('.scan-btn')?.click()}
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
                                    >Results in 2 minutes.</span
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
                            <span class="proof-label">High-intent prompts</span>
                            <span class="proof-desc">Queries buyers actually ask.</span>
                        </div>
                        <div class="proof-card">
                            <span class="proof-value">6</span>
                            <span class="proof-label">AI assistants</span>
                            <span class="proof-desc">ChatGPT, Claude, Gemini, and more.</span>
                        </div>
                        <div class="proof-card">
                            <span class="proof-value">3</span>
                            <span class="proof-label">Priority fixes</span>
                            <span class="proof-desc">Actionable changes per report.</span>
                        </div>
                    </div>
                </div>

                <div class="hero-visual">
                    <div class="signal-card">
                        <div class="signal-header">
                            <div>
                                <span class="signal-kicker">Sample visibility report</span>
                                <span class="signal-title">AI Recommendation Snapshot</span>
                            </div>
                            <Badge variant="secondary" class="signal-badge">Live</Badge>
                        </div>
                        <div class="signal-score">
                            <div class="score-ring">
                                <span class="score-num">63</span>
                                <span class="score-unit">/100</span>
                            </div>
                            <div class="score-copy">
                                <span class="signal-score-label">Visibility score</span>
                                <span class="signal-score-trend">+18% in 30 days</span>
                            </div>
                        </div>
                        <div class="signal-bars">
                            <div class="signal-bar">
                                <span>Mentions</span>
                                <div class="bar-track"><div class="bar-fill" style="--bar: 63%"></div></div>
                                <span class="bar-value">19/30</span>
                            </div>
                            <div class="signal-bar">
                                <span>Top position</span>
                                <div class="bar-track"><div class="bar-fill" style="--bar: 54%"></div></div>
                                <span class="bar-value">#2</span>
                            </div>
                            <div class="signal-bar">
                                <span>Missed intents</span>
                                <div class="bar-track"><div class="bar-fill" style="--bar: 37%"></div></div>
                                <span class="bar-value">11</span>
                            </div>
                        </div>
                        <div class="signal-callout">
                            Top fix: Add a Who It's For section and pricing comparison.
                        </div>
                    </div>
                    <div class="signal-stack">
                        <div class="stack-card">
                            <span class="stack-label">Competitors tracked</span>
                            <span class="stack-value">5 brands</span>
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
