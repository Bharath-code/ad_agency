import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	// Users table
	users: defineTable({
		email: v.string(),
		name: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		plan: v.union(v.literal('free'), v.literal('indie'), v.literal('startup')),
		scansUsed: v.number(), // For free tier limit (5 scans)
		createdAt: v.number(),
	})
		.index('by_email', ['email'])
		.index('by_plan', ['plan']),

	// Projects table
	projects: defineTable({
		userId: v.id('users'),
		name: v.string(),
		description: v.string(),
		industry: v.string(),
		createdAt: v.number(),
		lastScanAt: v.optional(v.number()),
		visibilityScore: v.optional(v.number()),
	}).index('by_user', ['userId']),

	// Competitors table
	competitors: defineTable({
		projectId: v.id('projects'),
		name: v.string(),
		url: v.optional(v.string()),
	}).index('by_project', ['projectId']),

	// Intent Queries table (30 fixed queries per project)
	intentQueries: defineTable({
		projectId: v.id('projects'),
		query: v.string(),
		category: v.string(), // 'best_tools', 'alternatives', 'comparisons', etc.
		isActive: v.boolean(),
	}).index('by_project', ['projectId']),

	// Scan Results table
	results: defineTable({
		projectId: v.id('projects'),
		queryId: v.id('intentQueries'),
		scanId: v.string(), // Groups results from same scan

		// Model tracking (for multi-model support)
		model: v.optional(v.string()), // 'openai', 'claude', 'gemini', 'perplexity'

		// Visibility data
		mentioned: v.boolean(),
		position: v.union(v.literal('primary'), v.literal('secondary'), v.literal('not_mentioned')),
		context: v.string(),
		confidence: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),

		// Raw LLM response (for transcripts feature)
		rawResponse: v.optional(v.string()),

		// Competitor data (if not mentioned)
		competitorMentioned: v.optional(v.string()),
		competitorReasons: v.optional(v.array(v.string())),

		// Recommendations
		positioningFix: v.optional(v.string()),
		contentSuggestion: v.optional(v.string()),
		messagingFix: v.optional(v.string()),

		createdAt: v.number(),
	})
		.index('by_project', ['projectId'])
		.index('by_scan', ['scanId'])
		.index('by_project_and_scan', ['projectId', 'scanId'])
		.index('by_project_createdAt', ['projectId', 'createdAt']),

	// Weekly Reports table
	weeklyReports: defineTable({
		projectId: v.id('projects'),
		userId: v.id('users'),

		previousScore: v.number(),
		currentScore: v.number(),
		scoreChange: v.number(),

		newCompetitorMentions: v.array(v.string()),
		topFixes: v.array(v.string()),

		emailSentAt: v.optional(v.number()),
		createdAt: v.number(),
	}).index('by_project', ['projectId']),

	// Subscriptions table (DodoPayments)
	subscriptions: defineTable({
		userId: v.id('users'),
		dodoSubscriptionId: v.string(),
		plan: v.union(v.literal('indie'), v.literal('startup')),
		status: v.union(v.literal('active'), v.literal('canceled'), v.literal('past_due')),
		currentPeriodEnd: v.number(),
		createdAt: v.number(),
	}).index('by_user', ['userId']),

	// LLM Response Cache
	llmCache: defineTable({
		cacheKey: v.string(),
		value: v.string(),
		createdAt: v.number(),
		ttlSeconds: v.number(),
	}).index('by_key', ['cacheKey']),
});
