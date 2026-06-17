import { describe, expect, it } from 'vitest';
import {
    type EvidenceResultInput,
    toEvidence,
} from '../../convex/lib/evidence';

function result(overrides: Partial<EvidenceResultInput> = {}): EvidenceResultInput {
    return {
        queryId: 'q1',
        scanId: 'scan_1',
        model: 'consensus',
        position: 'not_mentioned',
        mentioned: false,
        context: 'Not surfaced for this query.',
        confidence: 'medium',
        runCount: 6,
        successfulRuns: 5,
        consensusRatio: 0.8,
        modelResults: [
            {
                model: 'openai',
                position: 'not_mentioned',
                mentioned: false,
                runCount: 3,
                successfulRuns: 3,
                consensusRatio: 1,
                confidence: 'high',
            },
            {
                model: 'claude',
                position: 'secondary',
                mentioned: true,
                runCount: 3,
                successfulRuns: 2,
                consensusRatio: 0.5,
                confidence: 'low',
            },
        ],
        competitorMentioned: 'AdTechPro',
        competitorReasons: ['Broader integrations', 'Stronger proof'],
        positioningFix: 'Lead with signal quality.',
        contentSuggestion: 'Ship a comparison page.',
        messagingFix: 'Outcome-first headline.',
        createdAt: 1_700_000_000_000,
        ...overrides,
    };
}

describe('toEvidence', () => {
    it('maps the stored fields onto the evidence object', () => {
        const evidence = toEvidence(result(), 'best ad agency tools');
        expect(evidence.queryId).toBe('q1');
        expect(evidence.queryText).toBe('best ad agency tools');
        expect(evidence.position).toBe('not_mentioned');
        expect(evidence.confidence).toBe('medium');
        expect(evidence.models).toHaveLength(2);
        expect(evidence.competitorMentioned).toBe('AdTechPro');
        expect(evidence.competitorReasons).toEqual(['Broader integrations', 'Stronger proof']);
        expect(evidence.fixes).toEqual({
            positioningFix: 'Lead with signal quality.',
            contentSuggestion: 'Ship a comparison page.',
            messagingFix: 'Outcome-first headline.',
        });
    });

    it('never exposes internal metadata even if present on the input', () => {
        const tainted = {
            ...result(),
            rawResponse: '{"systemPrompt":"SECRET","tokenUsage":{"input":99}}',
            systemPrompt: 'You are an AI assistant...',
            tokenUsage: { input: 99, output: 42 },
        } as unknown as EvidenceResultInput;

        const evidence = toEvidence(tainted, 'q');
        const serialized = JSON.stringify(evidence);
        expect(serialized).not.toContain('SECRET');
        expect(serialized).not.toContain('systemPrompt');
        expect(serialized).not.toContain('rawResponse');
        expect(serialized).not.toContain('tokenUsage');
    });

    it('fills safe defaults for legacy rows missing multi-model fields', () => {
        const legacy = result({
            model: undefined,
            runCount: undefined,
            successfulRuns: undefined,
            consensusRatio: undefined,
            modelResults: undefined,
            competitorReasons: undefined,
            positioningFix: undefined,
            contentSuggestion: undefined,
            messagingFix: undefined,
        });
        const evidence = toEvidence(legacy, 'q');
        expect(evidence.model).toBe('unknown');
        expect(evidence.runCount).toBe(0);
        expect(evidence.consensusRatio).toBe(0);
        expect(evidence.models).toEqual([]);
        expect(evidence.competitorReasons).toEqual([]);
        expect(evidence.fixes).toEqual({
            positioningFix: undefined,
            contentSuggestion: undefined,
            messagingFix: undefined,
        });
    });
});
