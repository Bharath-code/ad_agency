<script lang="ts">
import { Plus } from 'lucide-svelte';
import { onMount } from 'svelte';
import { api } from '$convex/_generated/api';
import type { Id } from '$convex/_generated/dataModel';
import CompetitorBattle from '$lib/components/dashboard/CompetitorBattle.svelte';
import RecommendedFixes from '$lib/components/dashboard/RecommendedFixes.svelte';
import ResponseTranscript from '$lib/components/dashboard/ResponseTranscript.svelte';
import TopMisses from '$lib/components/dashboard/TopMisses.svelte';
import TopWins from '$lib/components/dashboard/TopWins.svelte';
import VisibilityScore from '$lib/components/dashboard/VisibilityScore.svelte';
import * as Button from '$lib/components/ui/button/index.js';
import EmptyState from '$lib/components/ui/empty-state.svelte';
import Spinner from '$lib/components/ui/spinner.svelte';
import { convex, convexUser, isAuthenticated } from '$lib/stores/auth';

type ProjectItem = {
	_id: Id<'projects'>;
	name: string;
	description?: string;
	industry?: string;
	lastScanAt?: number;
	visibilityScore?: number;
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
	project?: {
		lastScanAt?: number;
	} | null;
};

type CompetitorComparison = {
	totalQueries: number;
	brand: {
		primaryMentions: number;
		secondaryMentions: number;
		notMentioned: number;
		winRate: number;
	};
	competitors: Array<{
		name: string;
		wins: number;
		winRate: number;
		topReasons: string[];
		queriesWon: string[];
	}>;
};

type TranscriptResult = {
	queryText: string;
	position: 'primary' | 'secondary' | 'not_mentioned';
	confidence: 'high' | 'medium' | 'low';
	rawResponse?: string;
	createdAt: number;
};

// State
let isDataLoading = $state(true);
let projects = $state<ProjectItem[]>([]);
let dashboardData = $state<DashboardSummary | null>(null);
let competitorData = $state<CompetitorComparison | null>(null);
let transcriptData = $state<TranscriptResult[]>([]);
let isScanning = $state(false);

onMount(() => {
	// Subscribe to user and load data
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

		// Load dashboard for first project
		if (userProjects.length > 0) {
			await loadDashboard(userProjects[0]._id);
		} else if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
			// Mock project for sandbox mode
			projects = [{ _id: 'mock-project' as Id<'projects'>, name: 'Sandbox Project' }];
			await loadDashboard('mock-project' as Id<'projects'>);
		}
	} catch (error) {
		console.error('Failed to load projects:', error);
		if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
			projects = [{ _id: 'mock-project' as Id<'projects'>, name: 'Sandbox Project' }];
			await loadDashboard('mock-project' as Id<'projects'>);
		}
	} finally {
		isDataLoading = false;
	}
}
async function loadDashboard(projectId: Id<'projects'>) {
	try {
		// Load all data in parallel
		const [summary, competitors, transcripts] = await Promise.all([
			convex.query(api.results.getDashboardSummary, { projectId }),
			convex.query(api.results.getCompetitorComparison, {
				projectId,
			}),
			convex.query(api.results.getResultsWithTranscripts, {
				projectId,
			}),
		]);

		dashboardData = summary;
		competitorData = competitors;
		transcriptData = transcripts;
	} catch (error) {
		console.warn('Failed to load dashboard from Convex - using mock data for UI testing:', error);

		// Mock data fallback for UI testing
		dashboardData = {
			visibilityScore: 47,
			totalQueries: 50,
			primaryMentions: 12,
			secondaryMentions: 11,
			topWins: [
				{
					query: 'best ad agency tools',
					context: 'Brand appears in top recommendation list.',
					confidence: 'high',
				},
				{
					query: 'ai visibility platform',
					context: 'Brand appears as strong alternative.',
					confidence: 'medium',
				},
			],
			topMisses: [
				{
					query: 'competitor analysis ai',
					competitorMentioned: 'AdTechPro',
					reasons: ['More comparison-focused content', 'Stronger social proof'],
				},
			],
			recommendedFixes: [
				{
					query: 'competitor analysis ai',
					positioningFix: 'Clarify differentiation in first fold messaging.',
					contentSuggestion: 'Ship a feature-comparison page with evidence.',
					messagingFix: 'Use outcome-first proof points in copy.',
				},
				{
					query: 'best ad agency tools',
					positioningFix: 'Lead with unique signal quality approach.',
					contentSuggestion: 'Add two measurable case studies.',
					messagingFix: 'Tighten headline to value + audience.',
				},
			],
			project: { lastScanAt: Date.now() },
		};
		competitorData = {
			totalQueries: 50,
			brand: {
				primaryMentions: 12,
				secondaryMentions: 11,
				notMentioned: 27,
				winRate: 46,
			},
			competitors: [
				{
					name: 'AdTechPro',
					wins: 20,
					winRate: 40,
					topReasons: ['Broader integrations', 'More enterprise references'],
					queriesWon: ['competitor analysis ai', 'agency automation software'],
				},
				{
					name: 'VisibilityFlow',
					wins: 7,
					winRate: 14,
					topReasons: ['Lower pricing signal'],
					queriesWon: ['cheap visibility tools'],
				},
			],
		};
		transcriptData = [
			{
				queryText: 'What is AVI?',
				position: 'secondary',
				confidence: 'medium',
				rawResponse: '{"summary":"AVI is a professional visibility tool."}',
				createdAt: Date.now(),
			},
		];
	}
}

async function runScan() {
	if (!projects.length || isScanning) return;

	isScanning = true;
	try {
		await convex.action(api.scans.runScan, {
			projectId: projects[0]._id,
		});
		// Reload dashboard after scan
		await loadDashboard(projects[0]._id);
	} catch (error) {
		console.error('Scan failed:', error);
		alert('Scan failed. Check console for details.');
	} finally {
		isScanning = false;
	}
}
</script>

<div class="dashboard">
    <header class="dashboard-header">
        <div>
            <h1>Dashboard</h1>
            <p class="subtitle">
                Track your brand's visibility in AI assistant responses
            </p>
        </div>
        <Button.Root variant="brand" href="/app/projects/new">
            <Plus size={18} class="mr-2" />
            New Project
        </Button.Root>
    </header>

    {#if isDataLoading}
        <div class="loading-container">
            <Spinner size="lg" />
            <p>Loading your data...</p>
        </div>
    {:else if projects.length === 0}
        <div class="empty-container">
            <EmptyState
                title="No projects yet"
                description="Create your first project to start tracking your AI visibility."
                actionLabel="Create Project"
                onaction={() => (window.location.href = "/app/projects/new")}
            />
        </div>
    {:else if dashboardData}
        <div class="dashboard-grid">
            <div class="score-card">
                <VisibilityScore
                    score={dashboardData.visibilityScore ?? 0}
                    confidence={dashboardData.visibilityScore > 50
                        ? "high"
                        : dashboardData.visibilityScore > 25
                          ? "medium"
                          : "low"}
                    queriesMatched={dashboardData.primaryMentions +
                        dashboardData.secondaryMentions}
                    totalQueries={dashboardData.totalQueries}
                />
                <div class="scan-actions">
                    <button
                        class="btn-saas btn-saas-primary"
                        onclick={runScan}
                        disabled={isScanning}
                    >
                        {isScanning ? "Scanning..." : "Run New Scan"}
                    </button>
                    <p class="scan-note">
                        {dashboardData.project?.lastScanAt
                            ? `Last scan: ${new Date(dashboardData.project.lastScanAt).toLocaleDateString()}`
                            : "Never scanned"}
                    </p>
                </div>
            </div>

            <!-- New: Competitor Battle Section -->
            {#if competitorData}
                <div class="battle-section">
                    <CompetitorBattle data={competitorData} />
                </div>
            {/if}

            <div class="insights-grid">
                <TopWins wins={dashboardData.topWins ?? []} />
                <TopMisses misses={dashboardData.topMisses ?? []} />
            </div>

            <div class="fixes-section">
                <RecommendedFixes
                    fixes={dashboardData.recommendedFixes ?? []}
                />
            </div>

            <!-- New: Response Transcripts Section -->
            {#if transcriptData.length > 0}
                <div class="transcripts-section">
                    <ResponseTranscript data={transcriptData} />
                </div>
            {/if}
        </div>
    {:else}
        <div class="empty-container">
            <EmptyState
                title="Run your first scan"
                description="Click 'Run New Scan' to analyze your visibility."
                actionLabel="Run Scan"
                onaction={runScan}
            />
        </div>
    {/if}
</div>

<style>
    .dashboard {
        padding: var(--space-8);
        max-width: 1200px;
    }

    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-8);
    }

    .dashboard-header h1 {
        font-size: var(--text-3xl);
        margin-bottom: var(--space-1);
    }

    .subtitle {
        color: var(--text-secondary);
    }

    .loading-container,
    .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: var(--space-4);
        color: var(--text-secondary);
    }

    .dashboard-grid {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .score-card {
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-md);
    }

    .scan-actions {
        padding: var(--space-6);
        border-top: var(--border-soft);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-4);
    }

    .scan-note {
        font-size: var(--text-sm);
        color: var(--text-muted);
    }

    .insights-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-6);
    }

    @media (max-width: 768px) {
        .dashboard-header {
            flex-direction: column;
            gap: var(--space-4);
        }

        .insights-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
