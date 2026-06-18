<script lang="ts">
import { ArrowLeft, Plus, Settings, Trash2 } from 'lucide-svelte';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { api } from '$convex/_generated/api';
import type { Doc, Id } from '$convex/_generated/dataModel';
import type { PromptEvidence } from '$convex/lib/evidence';
import EvidenceModal from '$lib/components/dashboard/EvidenceModal.svelte';
import RecommendedFixes from '$lib/components/dashboard/RecommendedFixes.svelte';
import TopMisses from '$lib/components/dashboard/TopMisses.svelte';
import TopWins from '$lib/components/dashboard/TopWins.svelte';
import VisibilityScore from '$lib/components/dashboard/VisibilityScore.svelte';
import ClientReportPanel from '$lib/components/project/ClientReportPanel.svelte';
import CompetitorList from '$lib/components/project/CompetitorList.svelte';
import ScanButton from '$lib/components/project/ScanButton.svelte';
import { hasFeature } from '$convex/lib/entitlements';

import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Modal from '$lib/components/ui/modal.svelte';
import Spinner from '$lib/components/ui/spinner.svelte';
import { validateProjectUrl } from '$convex/lib/utils';
import { convex, convexUser } from '$lib/stores/auth';
import { toasts } from '$lib/stores/toast';

type ProjectView = Pick<
	Doc<'projects'>,
	| '_id'
	| 'name'
	| 'industry'
	| 'createdAt'
	| 'description'
	| 'lastScanAt'
	| 'url'
	| 'primaryUseCase'
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
		queryId: string;
		query: string;
		context: string;
		confidence: 'high' | 'medium' | 'low';
	}>;
	topMisses: Array<{
		queryId: string;
		query: string;
		competitorMentioned?: string;
		reasons: string[];
	}>;
	recommendedFixes: Array<{
		queryId: string;
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
let evidenceData = $state<PromptEvidence[]>([]);
let selectedEvidence = $state<PromptEvidence | null>(null);
let scanStatus = $state<'idle' | 'scanning' | 'success' | 'error'>('idle');

function openEvidence(queryId: string) {
	const match = evidenceData.find((e) => e.queryId === queryId);
	if (match) {
		selectedEvidence = match;
	} else {
		toasts.error('No evidence available for this prompt yet.');
	}
}
let showAddCompetitor = $state(false);
let newCompetitorName = $state('');
let newCompetitorUrl = $state('');
let showDeleteConfirm = $state(false);

// Edit profile modal
let showEditProfile = $state(false);
let editName = $state('');
let editDescription = $state('');
let editIndustry = $state('');
let editUrl = $state('');
let editUseCase = $state('');
let isSavingProfile = $state(false);

const editUrlError = $derived(
	editUrl.trim().length > 0 && !validateProjectUrl(editUrl).valid
		? 'Enter a valid website URL (e.g. https://acme.com)'
		: null,
);

const projectId = $derived($page.params.id as Id<'projects'>);
const clientReportsEntitled = $derived(
	$convexUser ? hasFeature($convexUser.plan, 'clientReports') : false,
);

onMount(() => {
	loadProject();
});

async function loadProject() {
	try {
		const [projectData, competitorData, summary, evidence] = await Promise.all([
			convex.query(api.projects.get, { projectId }).catch(() => null),
			convex.query(api.competitors.listByProject, { projectId }).catch(() => []),
			convex.query(api.results.getDashboardSummary, { projectId }).catch(() => null),
			convex.query(api.results.getEvidence, { projectId }).catch(() => []),
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
							queryId: 'mock-win-1',
							query: 'best ai agency',
							context: 'Brand appears in primary recommendation.',
							confidence: 'high' as const,
						},
					],
					topMisses: [
						{
							queryId: 'mock-miss-1',
							query: 'ad agency automation',
							competitorMentioned: 'Competitor A',
							reasons: ['More proof-based messaging', 'Broader integration support'],
						},
					],
					recommendedFixes: [
						{
							queryId: 'mock-miss-1',
							query: 'ad agency automation',
							positioningFix: 'Clarify your core value in hero messaging.',
							contentSuggestion: 'Publish a dedicated use-case landing page.',
							messagingFix: 'Add measurable outcomes to above-the-fold copy.',
						},
					],
				};
				evidenceData = [
					{
						queryId: 'mock-win-1',
						queryText: 'best ai agency',
						scanId: 'mock-scan',
						model: 'consensus',
						position: 'primary',
						mentioned: true,
						context: 'Brand appears in primary recommendation.',
						confidence: 'high',
						runCount: 6,
						successfulRuns: 6,
						consensusRatio: 1,
						models: [],
						competitorReasons: [],
						fixes: {},
						createdAt: Date.now(),
					},
					{
						queryId: 'mock-miss-1',
						queryText: 'ad agency automation',
						scanId: 'mock-scan',
						model: 'consensus',
						position: 'not_mentioned',
						mentioned: false,
						context: 'Competitors dominate this query.',
						confidence: 'medium',
						runCount: 6,
						successfulRuns: 5,
						consensusRatio: 0.8,
						models: [],
						competitorMentioned: 'Competitor A',
						competitorReasons: [
							'More proof-based messaging',
							'Broader integration support',
						],
						fixes: {
							positioningFix: 'Clarify your core value in hero messaging.',
							contentSuggestion: 'Publish a dedicated use-case landing page.',
							messagingFix: 'Add measurable outcomes to above-the-fold copy.',
						},
						createdAt: Date.now(),
					},
				];
			} else {
				goto('/app/projects');
				return;
			}
		} else {
			project = projectData;
			competitors = competitorData;
			dashboardData = summary;
			evidenceData = evidence;
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
		const [summary, evidence] = await Promise.all([
			convex.query(api.results.getDashboardSummary, { projectId }),
			convex.query(api.results.getEvidence, { projectId }),
		]);
		dashboardData = summary;
		evidenceData = evidence;
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

function openEditProfile() {
	if (!project) return;
	editName = project.name;
	editDescription = project.description;
	editIndustry = project.industry;
	editUrl = project.url ?? '';
	editUseCase = project.primaryUseCase ?? '';
	showEditProfile = true;
}

async function saveProfile() {
	if (!project || editUrlError) return;
	isSavingProfile = true;
	try {
		await convex.mutation(api.projects.update, {
			projectId,
			name: editName.trim(),
			description: editDescription.trim(),
			industry: editIndustry.trim(),
			url: editUrl.trim(),
			primaryUseCase: editUseCase.trim(),
		});
		project = {
			...project,
			name: editName.trim(),
			description: editDescription.trim(),
			industry: editIndustry.trim(),
			url: editUrl.trim() || undefined,
			primaryUseCase: editUseCase.trim() || undefined,
		};
		showEditProfile = false;
		toasts.success('Project profile updated.');
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to update project';
		toasts.error(message);
	} finally {
		isSavingProfile = false;
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
                    onclick={openEditProfile}
                >
                    <Settings size={16} />
                    Edit profile
                </button>
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
                        <TopWins wins={dashboardData.topWins ?? []} onSelect={openEvidence} />
                        <TopMisses misses={dashboardData.topMisses ?? []} onSelect={openEvidence} />
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
                    {#if project.url}
                        <dl class="profile-meta">
                            <dt>Website</dt>
                            <dd>
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer">{project.url}</a
                                >
                            </dd>
                        </dl>
                    {/if}
                    {#if project.primaryUseCase}
                        <dl class="profile-meta">
                            <dt>Primary use case</dt>
                            <dd>{project.primaryUseCase}</dd>
                        </dl>
                    {/if}
                </div>

                <ClientReportPanel {projectId} entitled={clientReportsEntitled} />
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

<!-- Edit Profile Modal -->
<Modal
    open={showEditProfile}
    onclose={() => (showEditProfile = false)}
    title="Edit Project Profile"
>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            saveProfile();
        }}
        class="add-form"
    >
        <div class="space-y-2">
            <Label for="edit-name">Product Name</Label>
            <Input id="edit-name" bind:value={editName} required />
        </div>
        <div class="space-y-2">
            <Label for="edit-industry">Category / Industry</Label>
            <Input id="edit-industry" bind:value={editIndustry} required />
        </div>
        <div class="space-y-2">
            <Label for="edit-description">One-sentence Pitch</Label>
            <Input id="edit-description" bind:value={editDescription} required />
        </div>
        <div class="space-y-2">
            <Label for="edit-url">Website (optional)</Label>
            <Input
                id="edit-url"
                type="url"
                placeholder="https://acme.com"
                bind:value={editUrl}
            />
            {#if editUrlError}
                <p class="field-error">{editUrlError}</p>
            {/if}
        </div>
        <div class="space-y-2">
            <Label for="edit-use-case">Primary use case (optional)</Label>
            <Input
                id="edit-use-case"
                placeholder="e.g. automating code reviews"
                bind:value={editUseCase}
            />
        </div>
        <div class="modal-actions">
            <button
                type="button"
                class="btn-saas btn-saas-secondary"
                onclick={() => (showEditProfile = false)}
            >
                Cancel
            </button>
            <button
                type="submit"
                class="btn-saas btn-saas-primary"
                disabled={isSavingProfile || editUrlError !== null}
            >
                {#if isSavingProfile}
                    <Spinner size="sm" class="mr-2" />
                    Saving...
                {:else}
                    Save Changes
                {/if}
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

<EvidenceModal
    evidence={selectedEvidence}
    onClose={() => (selectedEvidence = null)}
/>

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

    .profile-meta {
        margin: var(--space-4) 0 0;
        padding-top: var(--space-4);
        border-top: var(--border-soft);
    }

    .profile-meta dt {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin-bottom: var(--space-1);
    }

    .profile-meta dd {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        word-break: break-word;
    }

    .profile-meta dd a {
        color: var(--color-brand);
        text-decoration: none;
    }

    .profile-meta dd a:hover {
        text-decoration: underline;
    }

    .field-error {
        color: #dc2626;
        font-size: var(--text-sm);
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
