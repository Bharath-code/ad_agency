<script lang="ts">
	import { ChevronDown, Plus, Download, Lock } from "lucide-svelte";
	import { onMount } from "svelte";
	import { api } from "$convex/_generated/api";
	import type { Id } from "$convex/_generated/dataModel";
	import type { PromptEvidence } from "$convex/lib/evidence";
	import type {
		ActionQueueView,
		ActionStatus,
		ActionType,
	} from "$convex/lib/actionQueue";
	import ActionQueue from "$lib/components/dashboard/ActionQueue.svelte";
	import CompetitorWinLoss from "$lib/components/dashboard/CompetitorWinLoss.svelte";
	import EvidenceModal from "$lib/components/dashboard/EvidenceModal.svelte";
	import RecommendedFixes from "$lib/components/dashboard/RecommendedFixes.svelte";
	import ResponseTranscript from "$lib/components/dashboard/ResponseTranscript.svelte";
	import TopMisses from "$lib/components/dashboard/TopMisses.svelte";
	import TopWins from "$lib/components/dashboard/TopWins.svelte";
	import VisibilityScore from "$lib/components/dashboard/VisibilityScore.svelte";
	import ModelComparison from "$lib/components/dashboard/ModelComparison.svelte";
	import * as Button from "$lib/components/ui/button/index.js";
	import EmptyState from "$lib/components/ui/empty-state.svelte";
	import Spinner from "$lib/components/ui/spinner.svelte";
	import { convex, convexUser } from "$lib/stores/auth";
	import DashboardSkeleton from "$lib/components/dashboard/DashboardSkeleton.svelte";
	import { toasts } from "$lib/stores/toast";

	type ProjectItem = {
		_id: Id<"projects">;
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
			queryId: string;
			query: string;
			context: string;
			confidence: "high" | "medium" | "low";
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
		project?: {
			lastScanAt?: number;
		} | null;
	};

	type CompetitorWinLossData = {
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
			reasons: Array<{
				reason: string;
				count: number;
				queryIds: string[];
			}>;
			prompts: Array<{ queryId: string; query: string }>;
		}>;
	};

	type TranscriptResult = {
		queryText: string;
		position: "primary" | "secondary" | "not_mentioned";
		confidence: "high" | "medium" | "low";
		model?: string;
		rawResponse?: string;
		createdAt: number;
	};

	type ModelComparisonData = Array<{
		model: string;
		scanId: string;
		visibilityScore: number;
		totalQueries: number;
		primaryMentions: number;
		secondaryMentions: number;
		notMentioned: number;
		lastScanAt: number;
	}>;

	// State
	let isDataLoading = $state(true);
	let projects = $state<ProjectItem[]>([]);
	let selectedProjectId = $state<Id<"projects"> | null>(null);
	let dashboardData = $state<DashboardSummary | null>(null);
	let competitorData = $state<CompetitorWinLossData | null>(null);
	let transcriptData = $state<TranscriptResult[]>([]);
	let transcriptEntitled = $state(true);
	let modelComparisonData = $state<ModelComparisonData>([]);
	let evidenceData = $state<PromptEvidence[]>([]);
	let actionQueueData = $state<ActionQueueView | null>(null);
	let selectedEvidence = $state<PromptEvidence | null>(null);
	let selectedModelToScan = $state<string>("all");

	function openEvidence(queryId: string) {
		const match = evidenceData.find((e) => e.queryId === queryId);
		if (match) {
			selectedEvidence = match;
		} else {
			toasts.error("No evidence available for this prompt yet.");
		}
	}
	let isScanning = $state(false);
	let dashboardError = $state<string | null>(null);

	let scanStartTime = $state<number | null>(null);
	let scannedCount = $state<number>(0);
	const estimatedQueries = $derived(dashboardData?.totalQueries || 30);
	let scanPollInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		// Subscribe to user and load data
		const unsubUser = convexUser.subscribe(async (user) => {
			if (user) {
				await loadProjects(user._id);
			}
		});

		return () => unsubUser();
	});

	const BYPASS = import.meta.env.VITE_BYPASS_AUTH === "true";

	// In sandbox/bypass mode, don't let a dead backend hang the UI forever —
	// time out so the mock-data fallback can render.
	function withTimeout<T>(p: Promise<T>, ms = 2000): Promise<T> {
		if (!BYPASS) return p;
		return Promise.race([
			p,
			new Promise<T>((_, reject) =>
				setTimeout(() => reject(new Error("sandbox timeout")), ms),
			),
		]);
	}

	async function loadProjects(_userId: unknown) {
		try {
			const userProjects = await withTimeout(convex.query(api.projects.list, {}));
			projects = userProjects;

			if (userProjects.length > 0) {
				selectedProjectId = userProjects[0]._id;
				await loadDashboard(userProjects[0]._id);
				await loadDashboard(userProjects[0]._id);
			} else if (import.meta.env.VITE_BYPASS_AUTH === "true") {
				// Mock project for sandbox mode
				projects = [
					{
						_id: "mock-project" as Id<"projects">,
						name: "Sandbox Project",
					},
				];
				await loadDashboard("mock-project" as Id<"projects">);
			}
		} catch (error) {
			console.error("Failed to load projects:", error);
			if (import.meta.env.VITE_BYPASS_AUTH === "true") {
				projects = [
					{
						_id: "mock-project" as Id<"projects">,
						name: "Sandbox Project",
					},
				];
				await loadDashboard("mock-project" as Id<"projects">);
			}
		} finally {
			isDataLoading = false;
		}
	}
	async function loadDashboard(projectId: Id<"projects">) {
		try {
			// Load all data in parallel
			const [summary, competitors, transcripts, comparisons, evidence, actions] =
				await withTimeout(
					Promise.all([
						convex.query(api.results.getDashboardSummary, {
							projectId,
						}),
						convex.query(api.results.getCompetitorWinLoss, {
							projectId,
						}),
						convex.query(api.results.getResultsWithTranscripts, {
							projectId,
						}),
						convex.query(api.results.getModelComparison, {
							projectId,
						}),
						convex.query(api.results.getEvidence, {
							projectId,
						}),
						convex.query(api.actionItems.list, {
							projectId,
						}),
					]),
				);

			dashboardData = summary;
			competitorData = competitors;
			transcriptData = transcripts.results;
			transcriptEntitled = transcripts.entitled;
			modelComparisonData = comparisons;
			evidenceData = evidence;
			actionQueueData = actions;
			dashboardError = null;
		} catch (error) {
			if (import.meta.env.VITE_BYPASS_AUTH === "true") {
				console.warn(
					"Failed to load dashboard from Convex - using mock data for UI testing:",
					error,
				);

				// Mock data fallback for UI testing
				dashboardData = {
					visibilityScore: 47,
					totalQueries: 50,
					primaryMentions: 12,
					secondaryMentions: 11,
					topWins: [
						{
							queryId: "mock-win-1",
							query: "best ad agency tools",
							context:
								"Brand appears in top recommendation list.",
							confidence: "high",
						},
						{
							queryId: "mock-win-2",
							query: "ai visibility platform",
							context: "Brand appears as strong alternative.",
							confidence: "medium",
						},
					],
					topMisses: [
						{
							queryId: "mock-miss-1",
							query: "competitor analysis ai",
							competitorMentioned: "AdTechPro",
							reasons: [
								"More comparison-focused content",
								"Stronger social proof",
							],
						},
					],
					recommendedFixes: [
						{
							queryId: "mock-miss-1",
							query: "competitor analysis ai",
							positioningFix:
								"Clarify differentiation in first fold messaging.",
							contentSuggestion:
								"Ship a feature-comparison page with evidence.",
							messagingFix:
								"Use outcome-first proof points in copy.",
						},
						{
							queryId: "mock-win-1",
							query: "best ad agency tools",
							positioningFix:
								"Lead with unique signal quality approach.",
							contentSuggestion:
								"Add two measurable case studies.",
							messagingFix:
								"Tighten headline to value + audience.",
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
							name: "AdTechPro",
							wins: 20,
							winRate: 40,
							reasons: [
								{
									reason: "Broader integrations",
									count: 3,
									queryIds: ["mock-miss-1"],
								},
								{
									reason: "More enterprise references",
									count: 1,
									queryIds: ["mock-miss-1"],
								},
							],
							prompts: [
								{
									queryId: "mock-miss-1",
									query: "competitor analysis ai",
								},
							],
						},
						{
							name: "VisibilityFlow",
							wins: 7,
							winRate: 14,
							reasons: [
								{
									reason: "Lower pricing signal",
									count: 2,
									queryIds: ["mock-miss-1"],
								},
							],
							prompts: [
								{
									queryId: "mock-miss-1",
									query: "cheap visibility tools",
								},
							],
						},
					],
				};
				transcriptData = [
					{
						queryText: "What is PromptLens?",
						position: "secondary",
						confidence: "medium",
						rawResponse:
							'{"summary":"PromptLens is an AI recommendation diagnostics tool."}',
						createdAt: Date.now(),
					},
				];
				evidenceData = [
					{
						queryId: "mock-win-1",
						queryText: "best ad agency tools",
						scanId: "mock-scan",
						model: "consensus",
						position: "primary",
						mentioned: true,
						context: "Brand appears in top recommendation list.",
						confidence: "high",
						runCount: 6,
						successfulRuns: 6,
						consensusRatio: 1,
						models: [
							{
								model: "openai",
								position: "primary",
								mentioned: true,
								runCount: 3,
								successfulRuns: 3,
								consensusRatio: 1,
								confidence: "high",
							},
							{
								model: "claude",
								position: "primary",
								mentioned: true,
								runCount: 3,
								successfulRuns: 3,
								consensusRatio: 1,
								confidence: "high",
							},
						],
						competitorReasons: [],
						fixes: {},
						createdAt: Date.now(),
					},
					{
						queryId: "mock-miss-1",
						queryText: "competitor analysis ai",
						scanId: "mock-scan",
						model: "consensus",
						position: "not_mentioned",
						mentioned: false,
						context: "Competitors dominate this query.",
						confidence: "medium",
						runCount: 6,
						successfulRuns: 5,
						consensusRatio: 0.8,
						models: [
							{
								model: "openai",
								position: "not_mentioned",
								mentioned: false,
								runCount: 3,
								successfulRuns: 3,
								consensusRatio: 1,
								confidence: "high",
							},
							{
								model: "claude",
								position: "secondary",
								mentioned: true,
								runCount: 3,
								successfulRuns: 2,
								consensusRatio: 0.5,
								confidence: "low",
							},
						],
						competitorMentioned: "AdTechPro",
						competitorReasons: [
							"More comparison-focused content",
							"Stronger social proof",
						],
						fixes: {
							positioningFix:
								"Clarify differentiation in first fold messaging.",
							contentSuggestion:
								"Ship a feature-comparison page with evidence.",
							messagingFix: "Use outcome-first proof points in copy.",
						},
						createdAt: Date.now(),
					},
				];
				actionQueueData = {
					items: [
						{
							_id: "mock-action-1",
							queryId: "mock-miss-1",
							type: "comparison",
							title: "Comparison: competitor analysis ai",
							status: "shipped",
							baselinePosition: "not_mentioned",
							baselineScanId: "old-scan",
							baselineConfidence: "high",
							competitorAtCreation: "AdTechPro",
							createdAt: Date.now(),
							updatedAt: Date.now(),
							shippedAt: Date.now(),
							queryText: "competitor analysis ai",
							currentPosition: "secondary",
							movement: {
								from: "not_mentioned",
								to: "secondary",
								direction: "improved",
								delta: 1,
							},
							priorityScore: 6,
						},
						{
							_id: "mock-action-2",
							queryId: "mock-win-1",
							type: "positioning",
							title: "Positioning: best ad agency tools",
							status: "planned",
							baselinePosition: "not_mentioned",
							baselineConfidence: "medium",
							createdAt: Date.now(),
							updatedAt: Date.now(),
							queryText: "best ad agency tools",
							currentPosition: null,
							movement: {
								from: "not_mentioned",
								to: null,
								direction: "pending",
								delta: 0,
							},
							priorityScore: 4,
						},
					],
					topPriority: [
						{
							_id: "mock-action-2",
							queryId: "mock-win-1",
							type: "positioning",
							title: "Positioning: best ad agency tools",
							status: "planned",
							baselinePosition: "not_mentioned",
							baselineConfidence: "medium",
							createdAt: Date.now(),
							updatedAt: Date.now(),
							queryText: "best ad agency tools",
							currentPosition: null,
							movement: {
								from: "not_mentioned",
								to: null,
								direction: "pending",
								delta: 0,
							},
							priorityScore: 4,
						},
					],
					counts: { planned: 1, shipped: 1, ignored: 0, archived: 0 },
				};
				dashboardError = null;
			} else {
				console.error("Failed to load dashboard from Convex:", error);
				dashboardData = null;
				competitorData = null;
				transcriptData = [];
				modelComparisonData = [];
				evidenceData = [];
				actionQueueData = null;
				dashboardError =
					"Unable to load dashboard data. Check backend connectivity and try again.";
			}
		}
	}

	async function runScan() {
		if (!selectedProjectId || isScanning) return;

		isScanning = true;
		scanStartTime = Date.now();
		scannedCount = 0;

		scanPollInterval = setInterval(async () => {
			if (!selectedProjectId || !scanStartTime) return;
			try {
				const count = await convex.query(api.results.getRecentCount, {
					projectId: selectedProjectId,
					since: scanStartTime,
				});
				scannedCount = count;
			} catch (e) {
				// Ignore polling errors
			}
		}, 2000);

		try {
			const result = await convex.action(api.scans.runScan, {
				projectId: selectedProjectId,
				model:
					selectedModelToScan === "all"
						? undefined
						: selectedModelToScan,
			});
			toasts.success(
				`Scan completed! Analyzed ${result.resultsCount} queries across ${result.models.join(", ")}.`,
			);
			if (result.failedModels && result.failedModels.length > 0) {
				toasts.error(
					`${result.failedModels.join(", ")} returned no results — showing the other models.`,
				);
			}
			await loadDashboard(selectedProjectId);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Scan failed:", error);
			toasts.error(
				message.includes("limit")
					? "Scan limit reached. Upgrade your plan for more scans."
					: `Scan failed: ${message}`,
			);
		} finally {
			isScanning = false;
			scanStartTime = null;
			if (scanPollInterval) clearInterval(scanPollInterval);
		}
	}

	function selectProject(projectId: Id<"projects">) {
		selectedProjectId = projectId;
		loadDashboard(projectId);
	}

	function handleProjectChange(e: Event) {
		const target = e.currentTarget as HTMLSelectElement;
		selectProject(target.value as Id<"projects">);
	}

	async function reloadActionQueue() {
		if (!selectedProjectId) return;
		try {
			actionQueueData = await convex.query(api.actionItems.list, {
				projectId: selectedProjectId,
			});
		} catch (error) {
			console.error("Failed to reload action queue:", error);
		}
	}

	async function createAction(input: {
		queryId: string;
		type: ActionType;
		title: string;
		detail?: string;
	}) {
		if (!selectedProjectId) return;
		try {
			await convex.mutation(api.actionItems.create, {
				projectId: selectedProjectId,
				queryId: input.queryId as Id<"intentQueries">,
				type: input.type,
				title: input.title,
				detail: input.detail,
			});
			toasts.success("Action added to your queue.");
			await reloadActionQueue();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			toasts.error(`Could not add action: ${message}`);
		}
	}

	async function updateActionStatus(actionId: string, status: ActionStatus) {
		try {
			await convex.mutation(api.actionItems.updateStatus, {
				actionId: actionId as Id<"actionItems">,
				status,
			});
			await reloadActionQueue();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			toasts.error(`Could not update action: ${message}`);
		}
	}

	function downloadCSV() {
		if (!transcriptData || transcriptData.length === 0) {
			toasts.error("No scan data available to export.");
			return;
		}

		const headers = ["Query", "Position", "Confidence", "Date"];
		const rows = transcriptData.map((t: TranscriptResult) => [
			t.queryText.replace(/"/g, '""'),
			t.position,
			t.confidence,
			new Date(t.createdAt).toISOString(),
		]);

		const csvContent = [
			headers.join(","),
			...rows.map(
				(row: string[]) => `"${row[0]}",${row[1]},${row[2]},${row[3]}`,
			),
		].join("\n");

		const blob = new Blob([csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		const projectName =
			projects.find((p: ProjectItem) => p._id === selectedProjectId)
				?.name || "project";
		link.setAttribute(
			"download",
			`${projectName.replace(/\s+/g, "-").toLowerCase()}-visibility-scan.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		toasts.success("Report exported to CSV.");
	}
</script>

<div class="dashboard">
	<header class="dashboard-header">
		<div class="header-content">
			{#if projects.length > 1}
				<select
					class="project-selector"
					value={selectedProjectId ?? ""}
					onchange={handleProjectChange}
				>
					{#each projects as project}
						<option value={project._id}>{project.name}</option>
					{/each}
				</select>
			{:else}
				<h1>Dashboard</h1>
			{/if}
			<p class="subtitle">
				Track your brand's visibility in AI assistant responses
			</p>
		</div>
		<div class="flex items-center gap-3">
			{#if !isDataLoading && transcriptData.length > 0}
				<Button.Root
					variant="outline"
					class="bg-white"
					onclick={downloadCSV}
				>
					<Download size={18} class="mr-2" />
					Export CSV
				</Button.Root>
			{/if}
			<Button.Root variant="brand" href="/app/projects/new">
				<Plus size={18} class="mr-2" />
				New Project
			</Button.Root>
		</div>
	</header>

	{#if isScanning && scanStartTime !== null}
		<div class="mb-6 animate-in fade-in slide-in-from-top-2">
			<div
				class="bg-white border border-brand/20 p-5 rounded-xl shadow-sm"
			>
				<div class="flex items-center justify-between mb-2">
					<div class="flex items-center gap-3">
						<Spinner size="sm" class="text-brand" />
						<span class="font-medium text-slate-900"
							>AI is analyzing search intent...</span
						>
					</div>
					<span class="text-sm font-bold text-brand"
						>{scannedCount} of {estimatedQueries} queries</span
					>
				</div>
				<div
					class="w-full bg-slate-100 h-2 rounded-full overflow-hidden"
				>
					<div
						class="bg-brand h-full rounded-full transition-all duration-500 ease-out"
						style="width: {Math.min(
							100,
							Math.max(
								5,
								(scannedCount / estimatedQueries) * 100,
							),
						)}%"
					></div>
				</div>
				<p class="text-xs text-slate-500 mt-3">
					This typically takes 1-2 minutes to complete. We run {estimatedQueries}
					advanced queries across LLMs.
				</p>
			</div>
		</div>
	{/if}

	{#if isDataLoading}
		<div class="loading-container">
			<DashboardSkeleton />
		</div>
	{:else if dashboardError}
		<div class="empty-container">
			<EmptyState
				title="Dashboard unavailable"
				description={dashboardError}
				actionLabel="Retry"
				onaction={() => {
					if (projects.length > 0) {
						void loadDashboard(projects[0]._id);
					}
				}}
			/>
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
					<div class="flex items-center gap-3">
						<select
							class="bg-white border border-slate-200 text-sm rounded-md px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
							bind:value={selectedModelToScan}
						>
							<option value="all">All Models</option>
							<option value="openai">OpenAI</option>
							<option value="claude">Claude</option>
						</select>
						<button
							class="btn-saas btn-saas-primary"
							onclick={runScan}
							disabled={isScanning}
						>
							{isScanning ? "Scanning..." : "Run New Scan"}
						</button>
					</div>
					<p class="scan-note">
						{dashboardData.project?.lastScanAt
							? `Last scan: ${new Date(dashboardData.project.lastScanAt).toLocaleDateString()}`
							: "Never scanned"}
					</p>
				</div>
			</div>

			<!-- New: Model Comparison Section -->
			{#if modelComparisonData && modelComparisonData.length > 0}
				<div class="model-comparison-section">
					<ModelComparison comparisons={modelComparisonData} />
				</div>
			{/if}

			<!-- Competitor Win/Loss Section (Phase 6) -->
			<div class="battle-section">
				<CompetitorWinLoss
					data={competitorData}
					onSelectEvidence={openEvidence}
				/>
			</div>

			<!-- Action Queue Section (Phase 7) -->
			<div class="action-section">
				<ActionQueue
					data={actionQueueData}
					onUpdateStatus={updateActionStatus}
					onSelectEvidence={openEvidence}
				/>
			</div>

			<div class="insights-grid">
				<TopWins wins={dashboardData.topWins ?? []} onSelect={openEvidence} />
				<TopMisses misses={dashboardData.topMisses ?? []} onSelect={openEvidence} />
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
			{:else if !transcriptEntitled}
				<div class="transcripts-section">
					<div class="transcript-lock">
						<Lock size={18} aria-hidden="true" />
						<div class="transcript-lock-copy">
							<h3>Raw transcripts are a paid feature</h3>
							<p>
								Upgrade to Starter or higher to inspect the exact AI responses behind every
								verdict — the evidence you can show clients.
							</p>
						</div>
						<a class="transcript-lock-cta" href="/app/billing">View plans</a>
					</div>
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

<EvidenceModal
	evidence={selectedEvidence}
	onClose={() => (selectedEvidence = null)}
	onCreateAction={createAction}
/>

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

	.header-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.dashboard-header h1 {
		font-size: var(--text-3xl);
		margin: 0;
	}

	.project-selector {
		font-size: var(--text-2xl);
		font-weight: 700;
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
		margin: 0;
	}

	.project-selector:hover {
		color: var(--color-brand);
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

	.transcript-lock {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-6);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.transcript-lock :global(svg) {
		color: var(--color-primary);
		flex: none;
	}

	.transcript-lock-copy {
		flex: 1;
	}

	.transcript-lock-copy h3 {
		margin: 0 0 var(--space-1);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-foreground);
	}

	.transcript-lock-copy p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-muted-foreground);
	}

	.transcript-lock-cta {
		flex: none;
		font-size: var(--text-sm);
		font-weight: 600;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-full);
		text-decoration: none;
		background: var(--color-primary);
		color: var(--color-primary-foreground);
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
