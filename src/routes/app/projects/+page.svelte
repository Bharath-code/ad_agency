<script lang="ts">
import { ExternalLink, Plus } from 'lucide-svelte';
import { onMount } from 'svelte';
import { api } from '$convex/_generated/api';
import type { Doc } from '$convex/_generated/dataModel';
import EmptyState from '$lib/components/ui/empty-state.svelte';
import Spinner from '$lib/components/ui/spinner.svelte';
import { convex, convexUser } from '$lib/stores/auth';

type ProjectItem = Pick<
	Doc<'projects'>,
	'_id' | 'name' | 'description' | 'industry' | 'lastScanAt' | 'visibilityScore'
>;

// State
let isLoading = $state(true);
let projects = $state<ProjectItem[]>([]);

onMount(() => {
	const unsubUser = convexUser.subscribe(async (user) => {
		if (user) {
			await loadProjects(user._id);
		}
	});

	return () => unsubUser();
});

const BYPASS = import.meta.env.VITE_BYPASS_AUTH === 'true';

async function loadProjects(_userId: unknown) {
	try {
		const query = convex.query(api.projects.list, {});
		const userProjects = BYPASS
			? await Promise.race([
					query,
					new Promise<ProjectItem[]>((_, reject) =>
						setTimeout(() => reject(new Error('sandbox timeout')), 2000),
					),
				])
			: await query;
		projects = userProjects;
	} catch (error) {
		console.error('Failed to load projects:', error);
		if (BYPASS) {
			projects = [
				{
					_id: 'mock-1' as ProjectItem['_id'],
					name: 'Acme Analytics',
					description: 'Self-serve product analytics for B2B SaaS teams.',
					industry: 'Product analytics',
					lastScanAt: Date.now() - 2 * 86400000,
					visibilityScore: 62,
				},
				{
					_id: 'mock-2' as ProjectItem['_id'],
					name: 'Northbeam',
					description: 'Marketing attribution and incrementality measurement.',
					industry: 'Marketing attribution',
					lastScanAt: Date.now() - 6 * 86400000,
					visibilityScore: 38,
				},
			];
		}
	} finally {
		isLoading = false;
	}
}

function formatDate(timestamp: number): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(timestamp));
}
</script>

<div class="projects-page">
    <header class="page-header">
        <div>
            <h1>Projects</h1>
            <p class="subtitle">Each project tracks one product across buyer prompts.</p>
        </div>
        <a href="/app/projects/new" class="btn-saas btn-saas-primary">
            <Plus size={18} />
            New Project
        </a>
    </header>

    {#if isLoading}
        <div class="loading-container">
            <Spinner size="lg" />
            <p>Loading projects...</p>
        </div>
    {:else if projects.length === 0}
        <EmptyState
            title="No projects yet"
            description="Create your first project to start tracking your brand's visibility in AI responses."
            actionLabel="Create Project"
            onaction={() => (window.location.href = "/app/projects/new")}
        />
    {:else}
        <div class="projects-grid">
            {#each projects as project}
                {@const score = project.visibilityScore}
                <a href="/app/projects/{project._id}" class="project-card">
                    <div class="card-header">
                        <span class="project-industry">{project.industry}</span>
                        <span
                            class="score-chip"
                            class:high={score !== undefined && score > 50}
                            class:mid={score !== undefined && score > 25 && score <= 50}
                            class:low={score !== undefined && score <= 25}
                        >
                            {score ?? "—"}<span class="score-unit">%</span>
                        </span>
                    </div>
                    <h3 class="project-name">{project.name}</h3>
                    <p class="project-description">{project.description}</p>
                    <div class="card-footer">
                        <span class="last-scan">
                            Last scan {project.lastScanAt
                                ? formatDate(project.lastScanAt)
                                : "— never"}
                        </span>
                        <ExternalLink size={15} class="arrow-icon" />
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>

<style>
    .projects-page {
        padding: var(--space-8);
        max-width: 1200px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-8);
    }

    .page-header h1 {
        font-size: var(--text-3xl);
        margin-bottom: var(--space-1);
    }

    .subtitle {
        color: var(--text-secondary);
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: var(--space-4);
        color: var(--text-secondary);
    }

    .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-6);
    }

    .project-card {
        display: block;
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-md);
        padding: var(--space-6);
        text-decoration: none;
        color: inherit;
        transition: all 0.15s ease;
    }

    .project-card:hover {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-4);
    }

    .project-industry {
        font-family: var(--font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-slate-400);
    }

    .score-chip {
        font-family: var(--font-mono);
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--color-slate-500);
    }
    .score-chip .score-unit {
        font-size: 0.7rem;
        margin-left: 1px;
        color: var(--color-slate-400);
    }
    .score-chip.high {
        color: var(--color-signal-win);
    }
    .score-chip.mid {
        color: var(--color-signal-miss);
    }
    .score-chip.low {
        color: var(--color-destructive);
    }

    .project-name {
        font-family: var(--font-display);
        font-size: 1.3rem;
        font-weight: 500;
        letter-spacing: -0.01em;
        margin: 0 0 var(--space-2);
    }

    .project-description {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        margin-bottom: var(--space-6);
        line-height: 1.5;
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--space-4);
        border-top: var(--border-soft);
    }

    .last-scan {
        font-size: var(--text-sm);
        color: var(--text-muted);
    }

    :global(.arrow-icon) {
        color: var(--text-muted);
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            gap: var(--space-4);
        }

        .projects-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
