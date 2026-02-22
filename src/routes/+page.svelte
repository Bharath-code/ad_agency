<script lang="ts">
    import Footer from "$lib/components/layout/Footer.svelte";
    import Navbar from "$lib/components/layout/Navbar.svelte";
    import HeroSection from "$lib/components/landing/HeroSection.svelte";
    import MiddleSections from "$lib/components/landing/MiddleSections.svelte";
    import PricingSection from "$lib/components/landing/PricingSection.svelte";
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

<Navbar />

<main id="main-content">
    <HeroSection />
    <MiddleSections />
    <PricingSection />
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
        background: radial-gradient(
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
