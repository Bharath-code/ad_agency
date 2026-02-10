/**
 * LLM Prompt Templates for AI Visibility Analysis
 *
 * These prompts are locked for MVP to ensure consistency.
 * Low temperature (0.3) for deterministic outputs.
 */

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
	return `Given this user query: "${query}"

Would you mention or recommend "${productName}" (${productDescription})?

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
	return `For this user query: "${query}"

You did NOT recommend "${productName}". Instead, you would recommend one of these competitors: ${competitors.join(', ')}.

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
	return `For the query: "${query}"

${productName} (${productDescription}) is NOT being recommended.
Instead, "${competitorWinner}" is preferred because:
${competitorReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

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
