/**
 * LLM Prompt Templates for AI Visibility Analysis
 *
 * These prompts are locked for MVP to ensure consistency.
 * Low temperature (0.3) for deterministic outputs.
 */

/**
 * Sanitize user-supplied input before injecting into prompts.
 * Prevents prompt injection and excessive token usage.
 */
export function sanitizePromptInput(input: string, maxLength = 200): string {
	return input
		.replace(/[\x00-\x1F\x7F]/g, '') // strip control characters
		.replace(/["""''`]/g, "'") // normalize quotes
		.trim()
		.slice(0, maxLength);
}

export const SYSTEM_PROMPT = `You are an AI assistant analyzing how AI assistants (like yourself) respond to user queries about software products.

Your task is to objectively analyze whether a specific product would be mentioned in response to a given query, and why.

IMPORTANT: 
- Be objective and honest
- Base your analysis on what you would actually recommend
- Consider brand positioning, features, and market presence`;

/**
 * Step 1: Brand Visibility Prompt
 * Determines if the brand would be mentioned for a given intent query
 */
export function getBrandVisibilityPrompt(
	query: string,
	productName: string,
	productDescription: string,
): string {
	const q = sanitizePromptInput(query);
	const name = sanitizePromptInput(productName, 100);
	const desc = sanitizePromptInput(productDescription, 500);

	return `Given this user query: "${q}"

Would you mention or recommend "${name}" (${desc})?

Respond in this exact JSON format:
{
  "mentioned": true/false,
  "position": "primary" | "secondary" | "not_mentioned",
  "context": "One sentence explaining why you would/wouldn't mention this product",
  "confidence": "high" | "medium" | "low"
}

- "primary" = You would recommend this as a top choice
- "secondary" = You would mention it as an option but not the main recommendation
- "not_mentioned" = You would not mention this product

Be honest and objective.`;
}

/**
 * Step 2: Competitor Advantage Prompt
 * When brand is NOT mentioned, explain why competitors win
 */
export function getCompetitorAdvantagePrompt(
	query: string,
	productName: string,
	competitors: string[],
): string {
	const q = sanitizePromptInput(query);
	const name = sanitizePromptInput(productName, 100);
	const safeCompetitors = competitors.map((c) => sanitizePromptInput(c, 100));

	return `For this user query: "${q}"

You did NOT recommend "${name}". Instead, you would recommend one of these competitors: ${safeCompetitors.join(', ')}.

Explain why:

Respond in this exact JSON format:
{
  "winner": "Name of the competitor you would recommend",
  "reasons": [
    "Reason 1 (positioning/messaging advantage)",
    "Reason 2 (feature/clarity advantage)",
    "Reason 3 (specificity/relevance advantage)"
  ]
}

Be specific about what makes the competitor's positioning better for this query.`;
}

/**
 * Step 3: Positioning Fix Prompt
 * Suggest concrete fixes for the brand to improve AI visibility
 */
export function getPositioningFixPrompt(
	query: string,
	productName: string,
	productDescription: string,
	competitorWinner: string,
	competitorReasons: string[],
): string {
	const q = sanitizePromptInput(query);
	const name = sanitizePromptInput(productName, 100);
	const desc = sanitizePromptInput(productDescription, 500);
	const winner = sanitizePromptInput(competitorWinner, 100);
	const safeReasons = competitorReasons.map((r) => sanitizePromptInput(r));

	return `For the query: "${q}"

${name} (${desc}) is NOT being recommended.
Instead, "${winner}" is preferred because:
${safeReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Suggest ONE concrete fix in each category:

Respond in this exact JSON format:
{
  "positioningFix": "One specific change to how the product is positioned/described",
  "contentSuggestion": "One specific piece of content to create (blog post, comparison page, etc.)",
  "messagingFix": "One specific change to the product's messaging/tagline"
}

Keep suggestions actionable and specific.`;
}

/**
 * Configuration for LLM calls
 */
export const LLM_CONFIG = {
	temperature: 0.3, // Low for consistency
	maxTokens: 500,
	model: 'gpt-4o-mini', // Default model
} as const;

