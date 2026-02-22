import { describe, expect, it } from 'vitest';
import {
    getBrandVisibilityPrompt,
    getCompetitorAdvantagePrompt,
    getPositioningFixPrompt,
    sanitizePromptInput,
} from '../../convex/lib/prompts';

describe('sanitizePromptInput', () => {
    it('trims whitespace', () => {
        expect(sanitizePromptInput('   hello world   ')).toBe('hello world');
    });

    it('strips control characters', () => {
        // Include some non-printable characters like \x00, \x08, etc.
        const input = 'hello\x00 world\x08!';
        expect(sanitizePromptInput(input)).toBe('hello world!');
    });

    it('normalizes various types of quotes to single quotes', () => {
        const input = 'This has "double", `backticks`, and \'single\' quotes.';
        expect(sanitizePromptInput(input)).toBe("This has 'double', 'backticks', and 'single' quotes.");
    });

    it('truncates input to maximum length', () => {
        const input = 'a'.repeat(300);
        const sanitized = sanitizePromptInput(input, 200);
        expect(sanitized.length).toBe(200);
        expect(sanitized).toBe('a'.repeat(200));
    });

    it('uses default 200 character limit if no maxLength is provided', () => {
        const input = 'b'.repeat(300);
        const sanitized = sanitizePromptInput(input);
        expect(sanitized.length).toBe(200);
    });
});

describe('getBrandVisibilityPrompt', () => {
    it('injects sanitized query, product name, and description into the prompt', () => {
        const query = 'best "CRM" in \x002024';
        const name = 'Sal`es`force';
        const desc = 'A "leading" CRM tool';

        const prompt = getBrandVisibilityPrompt(query, name, desc);

        expect(prompt).toContain("best 'CRM' in 2024");
        expect(prompt).toContain("Sal'es'force");
        expect(prompt).toContain("A 'leading' CRM tool");

        // Ensure standard instructions are intact
        expect(prompt).toContain('"mentioned": true/false');
        expect(prompt).toContain('"position": "primary" | "secondary" | "not_mentioned"');
    });
});

describe('getCompetitorAdvantagePrompt', () => {
    it('injects sanitized query, name, and competitors', () => {
        const query = 'best issue \x0Btrackers';
        const name = 'J"i"r\'a\'';
        const competitors = ['Line`ar`', 'Gi"t"Hub'];

        const prompt = getCompetitorAdvantagePrompt(query, name, competitors);

        expect(prompt).toContain("best issue trackers");
        expect(prompt).toContain("J'i'r'a'");
        expect(prompt).toContain("Line'ar', Gi't'Hub");

        expect(prompt).toContain('"winner": "Name of the competitor you would recommend"');
        expect(prompt).toContain('"reasons": [');
    });
});

describe('getPositioningFixPrompt', () => {
    it('injects sanitized variables and formats reasons as a numbered list', () => {
        const query = 'e-commerce p"latforms"';
        const name = 'S\x00h\x00o\x00p\x00ify';
        const desc = 'Store `builder`';
        const winner = 'Woocommerc"e"';
        const reasons = ['Free "open" source', 'Self-host\'ed\'', 'No `monthly` fees'];

        const prompt = getPositioningFixPrompt(query, name, desc, winner, reasons);

        expect(prompt).toContain("e-commerce p'latforms'");
        expect(prompt).toContain('Shopify');
        expect(prompt).toContain("Store 'builder'");
        expect(prompt).toContain("Woocommerc'e'");

        expect(prompt).toContain("1. Free 'open' source");
        expect(prompt).toContain("2. Self-host'ed'");
        expect(prompt).toContain("3. No 'monthly' fees");

        expect(prompt).toContain('"positioningFix"');
        expect(prompt).toContain('"contentSuggestion"');
        expect(prompt).toContain('"messagingFix"');
    });
});
