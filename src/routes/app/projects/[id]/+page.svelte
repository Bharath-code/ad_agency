<script lang="ts">
import { ArrowLeft, Plus, Settings, Trash2 } from 'lucide-svelte';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { api } from '$convex/_generated/api';
import type { Doc, Id } from '$convex/_generated/dataModel';
import RecommendedFixes from '$lib/components/dashboard/RecommendedFixes.svelte';
import TopMisses from '$lib/components/dashboard/TopMisses.svelte';
import TopWins from '$lib/components/dashboard/TopWins.svelte';
import VisibilityScore from '$lib/components/dashboard/VisibilityScore.svelte';
import CompetitorList from '$lib/components/project/CompetitorList.svelte';
import ScanButton from '$lib/components/project/ScanButton.svelte';

import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Modal from '$lib/components/ui/modal.svelte';
import Spinner from '$lib/components/ui/spinner.svelte';
import { convex, convexUser } from '$lib/stores/auth';
import { toasts } from '$lib/stores/toast';

type ProjectView = Pick<
	Doc<'projects'>,
	'_id' | 'name' | 'industry' | 'createdAt' | 'description' | 'lastScanAt'
>;

type CompetitorView = Pick<Doc<'competitors'>, '_id' | 'name' | 'url'> & {
	mentionScore?: number;
};

type DashboardSummary = {
	visibilityScore: number;
	totalQueries: number;
	primaryMentions: number;
	secondaryMentions: number;
	topWins: Array<{
		query: string;
		context: string;
		confidence: 'high' | 'medium' | 'low';
	}>;
	topMisses: Array<{
		query: string;
		competitorMentioned?: string;
		reasons: string[];
	}>;
	recommendedFixes: Array<{
		query: string;
		positioningFix?: string;
		contentSuggestion?: string;
		messagingFix?: string;
	}>;
};

// State
let isLoading = $state(true);
let project = $state<ProjectView | null>(null);
let competitors = $state<CompetitorView[]>([]);
let dashboardData = $state<DashboardSummary | null>(null);
let scanStatus = $state<'idle' | 'scanning' | 'success' | 'error'>('idle');
let showAddCompetitor = $state(false);
let newCompetitorName = $state('');
let newCompetitorUrl = $state('');
let showDeleteConfirm = $state(false);

const projectId = $derived($page.params.id as Id<'projects'>);

onMount(() => {
	loadProject();
});

async function loadProject() {
	try {
		const [projectData, competitorData, summary] = await Promise.all([
			convex.query(api.projects.get, { projectId }).catch(() => null),
			convex.query(api.competitors.listByProject, { projectId }).catch(() => []),
			convex.query(api.results.getDashboardSummary, { projectId }).catch(() => null),
		]);

		if (!projectData) {
			if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
				project = {
					_id: projectId,
					name: 'Sandbox Project',
					industry: 'Software',
					createdAt: Date.now(),
					description: 'A mock project for UI testing.',
				};
				competitors = [
					{ _id: 'c1' as Id<'competitors'>, name: 'Competitor A', url: 'https://a.com' },
					{ _id: 'c2' as Id<'competitors'>, name: 'Competitor B', url: 'https://b.com' },
				];
				dashboardData = {
					visibilityScore: 68,
					totalQueries: 40,
					primaryMentions: 18,
					secondaryMentions: 9,
					topWins: [
						{
							query: 'best ai agency',
							context: 'Brand appears in primary recommendation.',
							confidence: 'high' as const,
						},
					],
					topMisses: [
						{
							query: 'ad agency automation',
							competitorMentioned: 'Competitor A',
							reasons: ['More proof-based messaging', 'Broader integration support'],
						},
					],
					recommendedFixes: [
						{
							query: 'ad agency automation',
							positioningFix: 'Clarify your core value in hero messaging.',
							contentSuggestion: 'Publish a dedicated use-case landing page.',
							messagingFix: 'Add measurable outcomes to above-the-fold copy.',
						},
					],
				};
			} else {
				goto('/app/projects');
				return;
			}
		} else {
			project = projectData;
			competitors = competitorData;
			dashboardData = summary;
		}
	} catch (error) {
		console.error('Failed to load project:', error);
		if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
			project = {
				_id: projectId,
				name: 'Sandbox Project',
				industry: 'Software',
				createdAt: Date.now(),
				description: 'A mock project for UI testing.',
			};
		}
	} finally {
		isLoading = false;
	}
}

async function runScan() {
	scanStatus = 'scanning';
	try {
		const result = await convex.action(api.scans.runScan, { projectId });
		scanStatus = 'success';
		toasts.success(`Scan completed! Analyzed ${result.resultsCount} queries.`);
		const summary = await convex.query(api.results.getDashboardSummary, { projectId });
		dashboardData = summary;
		setTimeout(() => {
			scanStatus = 'idle';
		}, 3000);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error('Scan failed:', error);
		scanStatus = 'error';
		toasts.error(
			message.includes('limit')
				? 'Scan limit reached. Upgrade your plan for more scans.'
				: `Scan failed: ${message}`,
		);
		setTimeout(() => {
			scanStatus = 'idle';
		}, 3000);
	}
}

async function addCompetitor() {
	if (!newCompetitorName.trim()) return;

	try {
		await convex.mutation(api.competitors.add, {
			projectId,
			name: newCompetitorName.trim(),
			url: newCompetitorUrl.trim() || undefined,
		});
		// Reload competitors
		const competitorData = await convex.query(api.competitors.listByProject, { projectId });
		competitors = competitorData;
		// Reset form
		newCompetitorName = '';
		newCompetitorUrl = '';
		showAddCompetitor = false;
	} catch (error) {
		console.error('Failed to add competitor:', error);
	}
}

async function removeCompetitor(competitorId: string) {
	try {
		await convex.mutation(api.competitors.remove, {
			competitorId: competitorId as Id<'competitors'>,
		});
		competitors = competitors.filter((c) => c._id !== competitorId);
	} catch (error) {
		console.error('Failed to remove competitor:', error);
	}
}

async function deleteProject() {
	try {
		await convex.mutation(api.projects.remove, { projectId });
		goto('/app/projects');
	} catch (error) {
		console.error('Failed to delete project:', error);
	}
}

function formatDate(timestamp: number): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	}).format(new Date(timestamp));
}
</script>

<div class="project-detail">
    {#if isLoading}
        <div class="loading-container">
            <Spinner size="lg" />
            <p>Loading project...</p>
        </div>
    {:else if project}
        <header class="page-header">
            <div class="header-left">
                <a href="/app/projects" class="back-link">
                    <ArrowLeft size={18} />
                    Projects
                </a>
                <h1>{project.name}</h1>
                <p class="project-meta">
                    {project.industry} • Created {formatDate(project.createdAt)}
                </p>
            </div>
            <div class="header-actions">
                <button
                    class="btn-saas btn-saas-secondary"
                    onclick={() => (showDeleteConfirm = true)}
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </header>

        <div class="project-grid">
            <!-- Left Column: Score + Scan -->
            <div class="main-column">
	                <section class="score-section">
	                    <VisibilityScore
	                        score={dashboardData?.visibilityScore ?? 0}
	                        confidence={(dashboardData?.visibilityScore ?? 0) > 50
	                            ? "high"
	                            : (dashboardData?.visibilityScore ?? 0) > 25
	                              ? "medium"
	                              : "low"}
                        queriesMatched={(dashboardData?.primaryMentions ?? 0) +
                            (dashboardData?.secondaryMentions ?? 0)}
                        totalQueries={dashboardData?.totalQueries ?? 30}
                    />
                    <div class="scan-container">
                        <ScanButton
                            status={scanStatus}
                            lastScanAt={project.lastScanAt}
                            onscan={runScan}
                        />
                    </div>
                </section>

                {#if dashboardData}
                    <div class="insights-grid">
                        <TopWins wins={dashboardData.topWins ?? []} />
                        <TopMisses misses={dashboardData.topMisses ?? []} />
                    </div>
                    <RecommendedFixes
                        fixes={dashboardData.recommendedFixes ?? []}
                    />
                {/if}
            </div>

            <!-- Right Column: Competitors -->
            <aside class="sidebar-column">
                <CompetitorList
                    {competitors}
                    onAdd={() => (showAddCompetitor = true)}
                    onRemove={removeCompetitor}
                />

                <div class="project-info">
                    <h3>About</h3>
                    <p>{project.description}</p>
                </div>
            </aside>
        </div>
    {/if}
</div>

<!-- Add Competitor Modal -->
<Modal
    open={showAddCompetitor}
    onclose={() => (showAddCompetitor = false)}
    title="Add Competitor"
>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            addCompetitor();
        }}
        class="add-form"
    >
        <div class="space-y-2">
            <Label for="comp-name">Competitor Name</Label>
            <Input
                id="comp-name"
                name="competitor-name"
                placeholder="e.g., Competitor Inc"
                bind:value={newCompetitorName}
                required
            />
        </div>
        <div class="space-y-2">
            <Label for="comp-url">Website (optional)</Label>
            <Input
                id="comp-url"
                name="competitor-url"
                type="url"
                placeholder="https://..."
                bind:value={newCompetitorUrl}
            />
        </div>
        <div class="modal-actions">
            <button
                type="button"
                class="btn-saas btn-saas-secondary"
                onclick={() => (showAddCompetitor = false)}
            >
                Cancel
            </button>
            <button type="submit" class="btn-saas btn-saas-primary">
                Add Competitor
            </button>
        </div>
    </form>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal
    open={showDeleteConfirm}
    onclose={() => (showDeleteConfirm = false)}
    title="Delete Project"
>
    <div class="delete-confirm">
        <p>Are you sure you want to delete <strong>{project?.name}</strong>?</p>
        <p class="warning">
            This action cannot be undone. All scan history will be lost.
        </p>
        <div class="modal-actions">
            <button
                class="btn-saas btn-saas-secondary"
                onclick={() => (showDeleteConfirm = false)}
            >
                Cancel
            </button>
            <button class="btn-saas btn-danger" onclick={deleteProject}>
                Delete Project
            </button>
        </div>
    </div>
</Modal>

<style>
    .project-detail {
        padding: var(--space-8);
        max-width: 1400px;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: var(--space-4);
        color: var(--text-secondary);
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-8);
    }

    .header-left {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm);
        margin-bottom: var(--space-2);
        transition: color 0.15s ease;
    }

    .back-link:hover {
        color: var(--color-brand);
    }

    .page-header h1 {
        font-size: var(--text-2xl);
        margin: 0;
    }

    .project-meta {
        color: var(--text-muted);
        font-size: var(--text-sm);
    }

    .header-actions {
        display: flex;
        gap: var(--space-3);
    }

    .project-grid {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: var(--space-6);
    }

    .main-column {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .score-section {
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-md);
    }

    .scan-container {
        padding: var(--space-6);
        border-top: var(--border-soft);
        display: flex;
        justify-content: center;
    }

    .insights-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-6);
    }

    .sidebar-column {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .project-info {
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-md);
        padding: var(--space-6);
    }

    .project-info h3 {
        font-size: var(--text-base);
        font-weight: 600;
        margin: 0 0 var(--space-2);
    }

    .project-info p {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        line-height: 1.6;
        margin: 0;
    }

    .add-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        margin-top: var(--space-4);
    }

    .delete-confirm p {
        margin: 0 0 var(--space-2);
    }

    .delete-confirm .warning {
        color: var(--text-muted);
        font-size: var(--text-sm);
    }

    .btn-danger {
        background: #dc2626;
        color: white;
        border: none;
    }

    .btn-danger:hover {
        background: #b91c1c;
    }

    @media (max-width: 1024px) {
        .project-grid {
            grid-template-columns: 1fr;
        }

        .sidebar-column {
            order: -1;
        }
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            gap: var(--space-4);
        }

        .insights-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
