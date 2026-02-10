<script lang="ts">
import { ArrowLeft, Plus, Trash2 } from 'lucide-svelte';
import { goto } from '$app/navigation';
import { api } from '$convex/_generated/api';
import * as Button from '$lib/components/ui/button/index.js';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Spinner from '$lib/components/ui/spinner.svelte';
import { convex, convexUser } from '$lib/stores/auth';

let name = $state('');
let description = $state('');
let industry = $state('');
let competitors = $state<{ name: string; url: string }[]>([{ name: '', url: '' }]);
let isSubmitting = $state(false);
let error = $state<string | null>(null);

function addCompetitor() {
	competitors = [...competitors, { name: '', url: '' }];
}

function removeCompetitor(index: number) {
	competitors = competitors.filter((_, i) => i !== index);
}

async function handleSubmit(e: Event) {
	e.preventDefault();
	error = null;

	const user = $convexUser;
	if (!user) {
		error = 'Not authenticated';
		return;
	}

	isSubmitting = true;

	try {
		// Filter out empty competitors
		const validCompetitors = competitors
			.filter((c) => c.name.trim())
			.map((c) => ({
				name: c.name.trim(),
				url: c.url.trim() || undefined,
			}));

		await convex.mutation(api.projects.create, {
			name: name.trim(),
			description: description.trim(),
			industry: industry.trim(),
			competitors: validCompetitors,
		});

		goto('/app/projects');
	} catch (err) {
		console.error('Failed to create project:', err);
		error = 'Failed to create project. Please try again.';
	} finally {
		isSubmitting = false;
	}
}
</script>

<div class="new-project-page">
    <a href="/app/projects" class="back-link">
        <ArrowLeft size={18} />
        Back to Projects
    </a>

    <div class="form-container">
        <header class="form-header">
            <h1>Create New Project</h1>
            <p class="subtitle">Set up your brand for AI visibility tracking</p>
        </header>

        {#if error}
            <div class="error-banner">{error}</div>
        {/if}

        <form onsubmit={handleSubmit} class="project-form">
            <section class="form-section">
                <h2 class="text-xl font-bold mb-4">Product Details</h2>
                <div class="grid gap-4">
                    <div class="space-y-2">
                        <Label for="product-name">Product Name</Label>
                        <Input
                            id="product-name"
                            name="name"
                            placeholder="e.g., My SaaS Product"
                            bind:value={name}
                            required
                        />
                    </div>
                    <div class="space-y-2">
                        <Label for="description">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Short description of what your product does"
                            bind:value={description}
                            required
                        />
                        <p class="text-xs text-muted-foreground">
                            This helps AI understand your product positioning
                        </p>
                    </div>
                    <div class="space-y-2">
                        <Label for="industry">Industry</Label>
                        <Input
                            id="industry"
                            name="industry"
                            placeholder="e.g., Productivity Software, Marketing Tools"
                            bind:value={industry}
                            required
                        />
                    </div>
                </div>
            </section>

            <section class="form-section">
                <div class="section-header">
                    <h2>Competitors</h2>
                    <button
                        type="button"
                        class="btn-saas btn-saas-secondary btn-sm"
                        onclick={addCompetitor}
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
                <p class="section-hint">
                    Add 2-5 competitors you want to compare against
                </p>

                <div class="competitors-list">
                    {#each competitors as competitor, i}
                        <div class="competitor-row">
                            <div class="space-y-2">
                                <Label for="comp-name-{i}"
                                    >Competitor {i + 1}</Label
                                >
                                <Input
                                    id="comp-name-{i}"
                                    name="competitor-{i}"
                                    placeholder="Competitor name"
                                    bind:value={competitor.name}
                                    required={i === 0}
                                />
                            </div>
                            <div class="space-y-2">
                                <Label for="comp-url-{i}"
                                    >Website (optional)</Label
                                >
                                <Input
                                    id="comp-url-{i}"
                                    name="competitor-url-{i}"
                                    type="url"
                                    placeholder="https://..."
                                    bind:value={competitor.url}
                                />
                            </div>
                            {#if competitors.length > 1}
                                <button
                                    type="button"
                                    class="remove-btn"
                                    onclick={() => removeCompetitor(i)}
                                    aria-label="Remove competitor"
                                >
                                    <Trash2 size={18} />
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>

            <div class="form-actions">
                <a href="/app/projects" class="btn-saas btn-saas-secondary"
                    >Cancel</a
                >
                <button
                    type="submit"
                    class="btn-saas btn-saas-primary submit-btn"
                    disabled={isSubmitting}
                >
                    {#if isSubmitting}
                        <Spinner size="sm" />
                        Creating...
                    {:else}
                        Create Project
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    .new-project-page {
        padding: var(--space-8);
        max-width: 700px;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm);
        margin-bottom: var(--space-6);
        transition: color 0.15s ease;
    }

    .back-link:hover {
        color: var(--text-primary);
    }

    .form-container {
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-md);
        padding: var(--space-8);
    }

    .form-header {
        margin-bottom: var(--space-8);
    }

    .form-header h1 {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-1);
    }

    .subtitle {
        color: var(--text-secondary);
    }

    .error-banner {
        background: #fee2e2;
        color: #991b1b;
        padding: var(--space-4);
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-6);
        font-size: var(--text-sm);
    }

    .project-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-8);
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .form-section h2 {
        font-size: var(--text-lg);
        font-weight: 600;
        margin: 0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .section-hint {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-top: calc(-1 * var(--space-2));
    }

    .btn-sm {
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-sm);
    }

    .competitors-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .competitor-row {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: var(--space-4);
        align-items: flex-end;
    }

    .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .remove-btn:hover {
        background: #fee2e2;
        color: #991b1b;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-4);
        padding-top: var(--space-6);
        border-top: var(--border-soft);
    }

    .submit-btn {
        min-width: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
    }

    @media (max-width: 640px) {
        .competitor-row {
            grid-template-columns: 1fr;
        }

        .remove-btn {
            justify-self: flex-end;
        }
    }
</style>
