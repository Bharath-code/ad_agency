<script lang="ts">
    import {
        ArrowLeft,
        ArrowRight,
        Building2,
        Check,
        CheckCircle2,
        Package,
        Plus,
        Sparkles,
        Target,
        Trash2,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { api } from "$convex/_generated/api";
    import * as Button from "$lib/components/ui/button/index.js";
    import Input from "$lib/components/ui/input.svelte";
    import Label from "$lib/components/ui/label.svelte";
    import Spinner from "$lib/components/ui/spinner.svelte";
    import { convex, convexUser } from "$lib/stores/auth";

    let currentStep = $state(1);
    let name = $state("");
    let description = $state("");
    let industry = $state("");
    let competitors = $state<{ name: string; url: string }[]>([
        { name: "", url: "" },
    ]);
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);

    const totalSteps = 3;

    // Validation helpers
    const canProceedToStep2 = $derived(
        name.trim().length > 0 &&
            description.trim().length > 0 &&
            industry.trim().length > 0,
    );
    const validCompetitors = $derived(
        competitors.filter((c) => c.name.trim().length > 0),
    );
    const canProceedToStep3 = $derived(validCompetitors.length > 0);

    function nextStep() {
        if (currentStep < totalSteps) currentStep++;
    }

    function prevStep() {
        if (currentStep > 1) currentStep--;
    }

    function addCompetitor() {
        competitors = [...competitors, { name: "", url: "" }];
    }

    function removeCompetitor(index: number) {
        competitors = competitors.filter((_, i) => i !== index);
        if (competitors.length === 0) {
            competitors = [{ name: "", url: "" }];
        }
    }

    async function handleSubmit() {
        error = null;

        const user = $convexUser;
        if (!user) {
            if (import.meta.env.VITE_BYPASS_AUTH === "true") {
                goto("/app/dashboard");
                return;
            }
            error = "Not authenticated";
            return;
        }

        isSubmitting = true;

        try {
            const finalCompetitors = competitors
                .filter((c) => c.name.trim())
                .map((c) => ({
                    name: c.name.trim(),
                    url: c.url.trim() || undefined,
                }));

            await convex.mutation(api.projects.create, {
                name: name.trim(),
                description: description.trim(),
                industry: industry.trim(),
                competitors: finalCompetitors,
            });

            goto("/app/dashboard");
        } catch (err) {
            console.error("Failed to create project:", err);
            error = "Failed to create project. Please try again.";
            isSubmitting = false;
        }
    }
</script>

<div class="wizard-container">
    <div class="wizard-sidebar hidden md:flex">
        <div class="sidebar-content">
            <div class="brand">
                <Sparkles class="text-brand w-6 h-6 mb-2" />
                <h2
                    class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600"
                >
                    Visibility Setup
                </h2>
                <p class="text-sm text-slate-500 mt-2">
                    Configure your product for accurate AI tracking
                </p>
            </div>

            <div class="steps-tracker">
                <div class="tracker-step {currentStep >= 1 ? 'active' : ''}">
                    <div class="step-icon">
                        {#if currentStep > 1}
                            <CheckCircle2 class="w-5 h-5 text-brand" />
                        {:else}
                            <Package class="w-4 h-4" />
                        {/if}
                    </div>
                    <div class="step-details">
                        <span class="step-name">Product Basics</span>
                        <span class="step-desc"
                            >Name, category, and what it does</span
                        >
                    </div>
                </div>

                <div class="tracker-step {currentStep >= 2 ? 'active' : ''}">
                    <div class="step-icon">
                        {#if currentStep > 2}
                            <CheckCircle2 class="w-5 h-5 text-brand" />
                        {:else}
                            <Target class="w-4 h-4" />
                        {/if}
                    </div>
                    <div class="step-details">
                        <span class="step-name">Competitors</span>
                        <span class="step-desc">Who you want to outrank</span>
                    </div>
                </div>

                <div class="tracker-step {currentStep >= 3 ? 'active' : ''}">
                    <div class="step-icon">
                        <Building2 class="w-4 h-4" />
                    </div>
                    <div class="step-details">
                        <span class="step-name">Review</span>
                        <span class="step-desc">Finalize and launch scan</span>
                    </div>
                </div>
            </div>

            <div class="mt-auto pt-8 border-t border-slate-100">
                <a href="/app/projects" class="back-link">
                    <ArrowLeft size={16} /> Cancel setup
                </a>
            </div>
        </div>
    </div>

    <div class="wizard-main">
        <div class="main-content">
            <!-- Mobile Tracker -->
            <div class="mobile-tracker md:hidden mb-8">
                <span
                    class="text-sm font-semibold text-brand tracking-wider uppercase"
                    >Step {currentStep} of {totalSteps}</span
                >
                <div class="flex gap-2 mt-2">
                    <div
                        class="h-1 flex-1 rounded-full {currentStep >= 1
                            ? 'bg-brand'
                            : 'bg-slate-200'}"
                    ></div>
                    <div
                        class="h-1 flex-1 rounded-full {currentStep >= 2
                            ? 'bg-brand'
                            : 'bg-slate-200'}"
                    ></div>
                    <div
                        class="h-1 flex-1 rounded-full {currentStep >= 3
                            ? 'bg-brand'
                            : 'bg-slate-200'}"
                    ></div>
                </div>
            </div>

            {#if error}
                <div class="error-banner mb-6">{error}</div>
            {/if}

            {#if currentStep === 1}
                <div
                    class="wizard-step animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div class="step-header">
                        <h1>Tell us about your product</h1>
                        <p>
                            This context helps the AI evaluate relevance and
                            positioning accuracy.
                        </p>
                    </div>

                    <div class="form-grid">
                        <div class="space-y-3">
                            <Label
                                for="product-name"
                                class="font-medium text-slate-700"
                                >Product Name</Label
                            >
                            <Input
                                id="product-name"
                                placeholder="e.g. AcmeFlow"
                                bind:value={name}
                                class="h-12 text-lg px-4 bg-slate-50/50 border-slate-200 focus:bg-white"
                                autofocus
                            />
                        </div>

                        <div class="space-y-3">
                            <Label
                                for="industry"
                                class="font-medium text-slate-700"
                                >Category / Industry</Label
                            >
                            <Input
                                id="industry"
                                placeholder="e.g. CRM, DevOps Tool, Email Marketing"
                                bind:value={industry}
                                class="h-12 text-lg px-4 bg-slate-50/50 border-slate-200 focus:bg-white"
                            />
                        </div>

                        <div class="space-y-3">
                            <Label
                                for="description"
                                class="font-medium text-slate-700"
                                >One-sentence Pitch</Label
                            >
                            <textarea
                                id="description"
                                placeholder="AcmeFlow helps engineering teams ship faster by automating code reviews."
                                bind:value={description}
                                class="flex w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none transition-colors"
                            ></textarea>
                            <p class="text-xs text-slate-500">
                                Keep it clear and outcome-focused. Avoid
                                marketing fluff.
                            </p>
                        </div>
                    </div>
                </div>
            {/if}

            {#if currentStep === 2}
                <div
                    class="wizard-step animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div class="step-header">
                        <h1>Who are your main rivals?</h1>
                        <p>
                            We'll track how often AI recommends them instead of
                            you, and why.
                        </p>
                    </div>

                    <div class="competitors-list">
                        {#each competitors as competitor, i}
                            <div class="competitor-card group relative">
                                <div
                                    class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-center"
                                >
                                    <div class="space-y-2">
                                        <Label
                                            for="comp-name-{i}"
                                            class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                            >Competitor Name</Label
                                        >
                                        <Input
                                            id="comp-name-{i}"
                                            placeholder="e.g. Competitor X"
                                            bind:value={competitor.name}
                                            class="bg-white"
                                        />
                                    </div>
                                    <div class="space-y-2">
                                        <Label
                                            for="comp-url-{i}"
                                            class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                            >Website (Optional)</Label
                                        >
                                        <Input
                                            id="comp-url-{i}"
                                            type="url"
                                            placeholder="https://..."
                                            bind:value={competitor.url}
                                            class="bg-white text-slate-500"
                                        />
                                    </div>
                                    <div class="pt-6 md:pt-6">
                                        <button
                                            type="button"
                                            class="h-10 w-10 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                                            onclick={() => removeCompetitor(i)}
                                            title="Remove competitor"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {/each}

                        {#if competitors.length < 5}
                            <button
                                type="button"
                                class="add-competitor-btn mt-2"
                                onclick={addCompetitor}
                            >
                                <div class="icon-wrap">
                                    <Plus size={16} />
                                </div>
                                <span class="font-medium"
                                    >Add another competitor</span
                                >
                            </button>
                        {/if}
                    </div>
                </div>
            {/if}

            {#if currentStep === 3}
                <div
                    class="wizard-step animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div class="step-header">
                        <h1>Ready to Track Visibility</h1>
                        <p>
                            Review your configuration before we launch the
                            initial AI scan.
                        </p>
                    </div>

                    <div class="review-card">
                        <div class="review-section">
                            <h3 class="review-label">Product</h3>
                            <div
                                class="review-data flex items-center justify-between"
                            >
                                <div>
                                    <p class="font-bold text-lg text-slate-900">
                                        {name}
                                    </p>
                                    <p class="text-slate-500">{industry}</p>
                                </div>
                                <button
                                    class="text-sm text-brand font-medium hover:underline"
                                    onclick={() => (currentStep = 1)}
                                    >Edit</button
                                >
                            </div>
                            <p
                                class="mt-3 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100 text-sm"
                            >
                                {description}
                            </p>
                        </div>

                        <div class="h-px bg-slate-100 w-full my-6"></div>

                        <div class="review-section">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="review-label m-0">
                                    Tracking {validCompetitors.length} Competitors
                                </h3>
                                <button
                                    class="text-sm text-brand font-medium hover:underline"
                                    onclick={() => (currentStep = 2)}
                                    >Edit</button
                                >
                            </div>
                            <div class="flex flex-wrap gap-2">
                                {#each validCompetitors as comp}
                                    <div
                                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-sm font-medium text-slate-700"
                                    >
                                        {comp.name}
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>

                    <div
                        class="scan-preview mt-8 bg-brand/5 border border-brand/20 p-5 rounded-xl"
                    >
                        <div class="flex items-start gap-4">
                            <div
                                class="bg-brand text-white p-2 rounded-lg mt-0.5"
                            >
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900 mb-1">
                                    First Scan Incoming
                                </h4>
                                <p
                                    class="text-sm text-slate-600 leading-relaxed"
                                >
                                    Creating this project will automatically
                                    trigger your first AI visibility scan across
                                    30+ high-intent queries. This usually takes
                                    about 2 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Wizard Footer Nav -->
            <div class="wizard-footer">
                {#if currentStep > 1}
                    <Button.Root
                        variant="outline"
                        class="h-12 px-6"
                        onclick={prevStep}
                    >
                        Back
                    </Button.Root>
                {:else}
                    <div></div>
                    <!-- Spacing -->
                {/if}

                {#if currentStep < totalSteps}
                    <Button.Root
                        variant="brand"
                        class="h-12 px-8 shadow-sm"
                        onclick={nextStep}
                        disabled={currentStep === 1
                            ? !canProceedToStep2
                            : !canProceedToStep3}
                    >
                        Continue <ArrowRight size={16} class="ml-2" />
                    </Button.Root>
                {:else}
                    <Button.Root
                        variant="brand"
                        class="h-12 px-8 shadow-md shadow-brand/20"
                        onclick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {#if isSubmitting}
                            <Spinner size="sm" class="mr-2 text-white" />
                            Creating Project...
                        {:else}
                            <Check size={18} class="mr-2" />
                            Finish & Scan
                        {/if}
                    </Button.Root>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .wizard-container {
        display: flex;
        min-height: calc(100vh - 64px);
        background-color: var(--color-slate-50);
    }

    .wizard-sidebar {
        width: 320px;
        background-color: white;
        border-right: 1px solid var(--color-slate-200);
        padding: 2.5rem 2rem;
        flex-direction: column;
    }

    .sidebar-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: sticky;
        top: 2.5rem;
    }

    .brand {
        margin-bottom: 3rem;
    }

    .steps-tracker {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        position: relative;
    }

    .steps-tracker::before {
        content: "";
        position: absolute;
        top: 24px;
        bottom: 24px;
        left: 15px;
        width: 2px;
        background-color: var(--color-slate-100);
        z-index: 0;
    }

    .tracker-step {
        display: flex;
        gap: 1rem;
        position: relative;
        z-index: 1;
        opacity: 0.5;
        transition: opacity 0.3s;
    }

    .tracker-step.active {
        opacity: 1;
    }

    .step-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: white;
        border: 2px solid var(--color-slate-200);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-slate-400);
        transition: all 0.3s;
    }

    .tracker-step.active .step-icon {
        border-color: var(--color-brand);
        color: var(--color-brand);
        background-color: #fff;
        box-shadow: 0 0 0 4px rgba(var(--color-brand-rgb), 0.1);
    }

    .step-details {
        display: flex;
        flex-direction: column;
    }

    .step-name {
        font-weight: 600;
        color: var(--color-slate-900);
        font-size: 0.95rem;
    }

    .step-desc {
        font-size: 0.8rem;
        color: var(--color-slate-500);
    }

    .wizard-main {
        flex: 1;
        display: flex;
        justify-content: center;
        padding: 2rem 1rem 6rem;
    }

    .main-content {
        width: 100%;
        max-width: 600px;
        margin-top: 2rem;
    }

    .step-header {
        margin-bottom: 2.5rem;
    }

    .step-header h1 {
        font-size: 2rem;
        font-weight: 800;
        color: var(--color-slate-900);
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }

    .step-header p {
        font-size: 1.125rem;
        color: var(--color-slate-500);
    }

    .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .competitor-card {
        background: var(--color-slate-50);
        border: 1px solid var(--color-slate-200);
        border-radius: 0.75rem;
        padding: 1.25rem;
        transition:
            border-color 0.2s,
            background-color 0.2s;
    }

    .competitor-card:focus-within {
        border-color: var(--color-slate-300);
        background: var(--color-slate-100);
    }

    .competitors-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .add-competitor-btn {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        border: 2px dashed var(--color-slate-200);
        border-radius: 0.75rem;
        background: transparent;
        color: var(--color-slate-500);
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
    }

    .add-competitor-btn:hover {
        border-color: var(--color-brand);
        color: var(--color-brand);
        background: rgba(var(--color-brand-rgb), 0.02);
    }

    .add-competitor-btn .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: var(--color-slate-100);
        transition: background-color 0.2s;
    }

    .add-competitor-btn:hover .icon-wrap {
        background: rgba(var(--color-brand-rgb), 0.1);
        color: var(--color-brand);
    }

    .review-card {
        background: white;
        border: 1px solid var(--color-slate-200);
        border-radius: 1rem;
        padding: 2rem;
        box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.02),
            0 2px 4px -1px rgba(0, 0, 0, 0.02);
    }

    .review-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-slate-400);
        margin-bottom: 0.5rem;
    }

    .wizard-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 3rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--color-slate-200);
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-slate-500);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        transition: color 0.15s ease;
    }

    .back-link:hover {
        color: var(--color-slate-900);
    }

    .error-banner {
        background: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        border: 1px solid #fca5a5;
    }
</style>
