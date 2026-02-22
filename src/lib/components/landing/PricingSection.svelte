<script lang="ts">
    import { Check, ChevronDown } from "lucide-svelte";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Button from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import ScrollReveal from "$lib/components/ui/scroll-reveal.svelte";
    import { ArrowRight, FileText } from "lucide-svelte";

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
            name: "Starter",
            price: "$0",
            desc: "Baseline scan for one product",
            feats: [
                "1 project",
                "30 intent queries",
                "Snapshot report",
                "Email summary",
            ],
            cta: "Run Free Scan",
            featured: false,
        },
        {
            name: "Growth",
            price: "$79",
            period: "/mo",
            desc: "For B2B SaaS teams optimizing acquisition",
            feats: [
                "Unlimited scans",
                "Weekly visibility report",
                "Competitor tracking",
                "Fix impact plan",
                "Email support",
            ],
            cta: "Start Free Trial",
            featured: true,
        },
        {
            name: "Scale",
            price: "$199",
            period: "/mo",
            desc: "For multi-product teams and agencies",
            feats: [
                "Everything in Growth",
                "5 projects",
                "Daily monitoring",
                "API access",
                "Slack alerts",
            ],
            cta: "Start Free Trial",
            featured: false,
        },
    ];

    const faqs: Faq[] = [
        {
            q: "What is AI Visibility Intelligence?",
            a: "Get a measurement of how AI assistants describe and rank your product across high-intent prompts, translated into a prioritized fix plan.",
        },
        {
            q: "How do you gather the data?",
            a: "Each scan runs a curated library of prompts across major assistants and captures responses. Outputs are never influenced or manipulated.",
        },
        {
            q: "How long does a scan take?",
            a: "Most scans complete in under 2 minutes. Scheduled scans run automatically based on your plan.",
        },
        {
            q: "What changes do you recommend?",
            a: "Typically messaging, positioning, product pages, and docs. You get clear guidance on what to change and why it improves rankings.",
        },
        {
            q: "Can agencies use this for clients?",
            a: "Yes. The Scale plan supports multiple projects with client-ready reporting.",
        },
        {
            q: "Will AI-generated content hurt my SEO?",
            a: "No. Our recommendations focus on strategic messaging, positioning, and product clarity—not keyword stuffing. The fixes improve how AI assistants understand and recommend you, which aligns with what search engines reward: clear, helpful content.",
        },
        {
            q: "How is this different from using AI writing tools?",
            a: "AI writing tools help you create content. AVI tells you what to change so AI assistants actually recommend you. We identify the specific gaps causing you to be overlooked—not just what to say, but why competitors get picked over you.",
        },
    ];

    let openFaq = $state<number | null>(null);
</script>

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
                                <span class="text-4xl font-bold tracking-tight"
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
                                variant={plan.featured ? "brand" : "outline"}
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
                            onclick={() => (openFaq = openFaq === i ? null : i)}
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
                    Turn AI visibility into qualified pipeline with a free scan
                    today.
                </p>
                <div class="cta-actions mt-10">
                    <Button.Root
                        variant="brand"
                        class="cta-btn-primary h-12 px-10 text-lg shadow-xl shadow-brand/20"
                        href="/login"
                    >
                        Run Free Scan
                        <ArrowRight size={20} class="ml-2" aria-hidden="true" />
                    </Button.Root>
                    <Button.Root
                        variant="outline"
                        class="cta-btn-secondary h-12 px-8 text-lg"
                        href="#pricing"
                    >
                        <FileText size={20} class="mr-2" aria-hidden="true" />
                        View Sample Report
                    </Button.Root>
                </div>
                <p class="cta-disclaimer">
                    Base analysis on observable patterns in AI answers. Outputs
                    are never influenced, controlled, or manipulated.
                </p>
            </div>
        </ScrollReveal>
    </div>
</section>
