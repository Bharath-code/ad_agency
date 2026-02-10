<script lang="ts">
import { Eye, Github, Linkedin, Twitter } from 'lucide-svelte';
</script>

<footer class="footer">
    <div class="container footer-grid">
        <div class="footer-brand">
            <div class="logo">
                <div class="logo-icon">
                    <Eye size={20} aria-hidden="true" />
                </div>
                <span>AVI</span>
            </div>
            <p class="tagline">
                The intelligence layer for the AI decision era.
            </p>
            <div class="social-links">
                <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    ><Twitter size={20} aria-hidden="true" /></a
                >
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    ><Github size={20} aria-hidden="true" /></a
                >
                <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    ><Linkedin size={20} aria-hidden="true" /></a
                >
            </div>
        </div>

        <div class="footer-links">
            <div class="link-group">
                <h4>Product</h4>
                <a href="/#pricing">Pricing</a>
                <a href="https://docs.aivis.io">Documentation</a>
                <a href="/app/dashboard">Dashboard</a>
            </div>
            <div class="link-group">
                <h4>Support</h4>
                <a href="mailto:support@aivis.io">Contact</a>
                <a href="https://github.com">GitHub</a>
            </div>
            <div class="link-group">
                <h4>Legal</h4>
                <a href="/">Privacy Policy</a>
                <a href="/">Terms of Service</a>
            </div>
        </div>
    </div>
    <div class="footer-bottom container">
        <p>© 2026 AI Visibility Intelligence • Privacy • Terms • Contact</p>
        <div class="status">
            <div class="status-dot"></div>
            Systems operational
        </div>
    </div>
</footer>

<style>
    .footer {
        background: white;
        border-top: var(--border-base);
        padding: var(--space-24) 0 var(--space-12);
    }

    .footer-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: var(--space-16);
        margin-bottom: var(--space-24);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 700;
        font-size: 1.5rem;
        margin-bottom: var(--space-4);
    }

    .logo-icon {
        background: var(--color-brand);
        color: white;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
    }

    .tagline {
        color: var(--color-slate-600);
        margin-bottom: var(--space-6);
        max-width: 250px;
    }

    .social-links {
        display: flex;
        gap: 1.5rem;
        color: var(--color-slate-400);
    }

    .social-links a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border-radius: 8px;
    }

    .social-links a:hover {
        color: var(--color-brand);
    }

    .social-links a:focus-visible {
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 8px;
    }

    .footer-links {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-12);
    }

    .link-group h4 {
        margin-bottom: var(--space-6);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-slate-900);
    }

    .link-group a {
        display: block;
        color: var(--color-slate-500);
        margin-bottom: var(--space-3);
        text-decoration: none;
        font-size: 0.95rem;
    }

    .link-group a:hover {
        color: var(--color-brand);
    }

    .link-group a:focus-visible {
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 6px;
    }

    .footer-bottom {
        padding-top: var(--space-8);
        border-top: var(--border-soft);
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--color-slate-400);
        font-size: 0.875rem;
    }

    .status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-slate-600);
    }

    .status-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
    }

    @media (max-width: 768px) {
        .footer-grid {
            grid-template-columns: 1fr;
        }
        .footer-links {
            grid-template-columns: 1fr 1fr;
        }
    }
</style>
