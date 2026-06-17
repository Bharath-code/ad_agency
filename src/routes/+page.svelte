<script lang="ts">
import Footer from '$lib/components/layout/Footer.svelte';
import Navbar from '$lib/components/layout/Navbar.svelte';
import HeroSection from '$lib/components/landing/HeroSection.svelte';
import MiddleSections from '$lib/components/landing/MiddleSections.svelte';
import PricingSection from '$lib/components/landing/PricingSection.svelte';
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

	.skip-link {
		position: absolute;
		left: -999px;
		top: 1rem;
		background: var(--color-foreground);
		color: var(--color-background);
		padding: 0.75rem 1.25rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: none;
		z-index: 200;
	}
	.skip-link:focus {
		left: 1rem;
	}
</style>
