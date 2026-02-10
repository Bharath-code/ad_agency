<script lang="ts">
import { ExternalLink, Plus } from 'lucide-svelte';
import { onMount } from 'svelte';
import { api } from '$convex/_generated/api';
import type { Doc } from '$convex/_generated/dataModel';
import * as Badge from '$lib/components/ui/badge/index.js';
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

async function loadProjects(_userId: unknown) {
	try {
		const userProjects = await convex.query(api.projects.list, {});
		projects = userProjects;
	} catch (error) {
		console.error('Failed to load projects:', error);
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
            <p class="subtitle">Manage your AI visibility tracking projects</p>
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
                <a href="/app/projects/{project._id}" class="project-card">
                    <div class="card-header">
                        <h3 class="project-name">{project.name}</h3>
                        <Badge.Root
                            variant={project.visibilityScore !== undefined
                                ? project.visibilityScore > 50
                                    ? "success"
                                    : project.visibilityScore > 25
                                      ? "warning"
                                      : "error"
                                : "default"}
                        >
                            {project.visibilityScore ?? "—"}%
                        </Badge.Root>
                    </div>
                    <p class="project-description">{project.description}</p>
                    <div class="project-meta">
                        <span class="meta-item">
                            <strong>{project.industry}</strong>
                        </span>
                    </div>
                    <div class="card-footer">
                        <span class="last-scan">
                            Last scan: {project.lastScanAt
                                ? formatDate(project.lastScanAt)
                                : "Never"}
                        </span>
                        <ExternalLink size={16} class="arrow-icon" />
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
        border-color: var(--color-brand);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-2);
    }

    .project-name {
        font-size: var(--text-lg);
        font-weight: 600;
        margin: 0;
    }

    .project-description {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        margin-bottom: var(--space-4);
        line-height: 1.5;
    }

    .project-meta {
        display: flex;
        gap: var(--space-4);
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-bottom: var(--space-4);
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
