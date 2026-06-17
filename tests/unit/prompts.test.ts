import { describe, expect, it } from 'vitest';
import { fillIntentQueryTemplate } from '../../convex/lib/constants';
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

    it('omits the product context block when no url or use case is provided', () => {
        const prompt = getBrandVisibilityPrompt('best CRM', 'Acme', 'A CRM');
        expect(prompt).not.toContain('Product context:');
    });

    it('injects sanitized url and use case when provided', () => {
        const prompt = getBrandVisibilityPrompt('best CRM', 'Acme', 'A CRM', {
            url: 'https://acme.com',
            useCase: 'managing "sales" pipelines',
        });

        expect(prompt).toContain('Product context:');
        expect(prompt).toContain('https://acme.com');
        expect(prompt).toContain("managing 'sales' pipelines");
    });

    it('includes only the use case line when url is absent', () => {
        const prompt = getBrandVisibilityPrompt('best CRM', 'Acme', 'A CRM', {
            useCase: 'sales automation',
        });
        expect(prompt).toContain('Primary use case: sales automation');
        expect(prompt).not.toContain('Website:');
    });
});

describe('fillIntentQueryTemplate', () => {
    const vars = {
        product: 'Acme',
        industry: 'CRM',
        useCase: 'managing sales pipelines',
        competitor: 'Salesforce',
    };

    it('substitutes every placeholder', () => {
        expect(fillIntentQueryTemplate('{PRODUCT} vs {COMPETITOR}', vars)).toBe('Acme vs Salesforce');
        expect(fillIntentQueryTemplate('Best {INDUSTRY} tool', vars)).toBe('Best CRM tool');
        expect(fillIntentQueryTemplate('Best tool for {USE_CASE}', vars)).toBe(
            'Best tool for managing sales pipelines',
        );
    });

    it('replaces all occurrences of a repeated placeholder', () => {
        expect(fillIntentQueryTemplate('{PRODUCT} {PRODUCT}', vars)).toBe('Acme Acme');
    });

    it('leaves text without placeholders unchanged', () => {
        expect(fillIntentQueryTemplate('no placeholders here', vars)).toBe('no placeholders here');
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
