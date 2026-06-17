import { describe, expect, it } from 'vitest';
import {
    aggregateAcrossModels,
    consensusFromRuns,
    deriveConfidence,
    type ModelVisibility,
    type Position,
} from '../../convex/lib/consensus';
import type { BrandVisibilityResponse } from '../../convex/lib/llm/types';

function run(
    position: Position,
    mentioned = position !== 'not_mentioned',
): BrandVisibilityResponse {
    return { position, mentioned, context: `ctx-${position}`, confidence: 'high' };
}

function model(overrides: Partial<ModelVisibility> = {}): ModelVisibility {
    return {
        model: 'openai',
        mentioned: true,
        position: 'primary',
        context: 'ctx',
        runCount: 3,
        successfulRuns: 3,
        consensusRatio: 1,
        confidence: 'high',
        failed: false,
        ...overrides,
    };
}

describe('deriveConfidence', () => {
    it('is high when all runs succeed and fully agree', () => {
        expect(deriveConfidence(3, 3, 1)).toBe('high');
    });

    it('is medium when agreement is partial', () => {
        // completion 1.0 * consensus 0.67 = 0.67 -> medium
        expect(deriveConfidence(3, 3, 2 / 3)).toBe('medium');
    });

    it('is low when agreement is weak', () => {
        expect(deriveConfidence(3, 3, 0.5)).toBe('low');
    });

    it('drops to low when completion is poor even with perfect agreement', () => {
        // half the planned runs failed -> 0.5 completion caps it at low
        expect(deriveConfidence(6, 3, 1)).toBe('low');
    });

    it('is low for zero successful or zero planned runs', () => {
        expect(deriveConfidence(3, 0, 1)).toBe('low');
        expect(deriveConfidence(0, 0, 0)).toBe('low');
    });
});

describe('consensusFromRuns', () => {
    it('collapses agreeing runs into a high-confidence verdict', () => {
        const result = consensusFromRuns('openai', 3, [
            run('primary'),
            run('primary'),
            run('primary'),
        ]);
        expect(result.position).toBe('primary');
        expect(result.successfulRuns).toBe(3);
        expect(result.consensusRatio).toBe(1);
        expect(result.confidence).toBe('high');
        expect(result.failed).toBe(false);
    });

    it('lowers confidence when runs disagree', () => {
        const result = consensusFromRuns('openai', 3, [
            run('primary'),
            run('secondary'),
            run('not_mentioned'),
        ]);
        // 1/3 agreement -> low
        expect(result.consensusRatio).toBeCloseTo(1 / 3);
        expect(result.confidence).toBe('low');
    });

    it('ignores failed runs but counts them against completion', () => {
        const result = consensusFromRuns('openai', 3, [run('primary'), run('primary'), null]);
        expect(result.successfulRuns).toBe(2);
        expect(result.consensusRatio).toBe(1);
        // completion 2/3 * consensus 1 = 0.67 -> medium
        expect(result.confidence).toBe('medium');
        expect(result.failed).toBe(false);
    });

    it('marks the model failed when every run fails', () => {
        const result = consensusFromRuns('claude', 3, [null, null, null]);
        expect(result.failed).toBe(true);
        expect(result.successfulRuns).toBe(0);
        expect(result.position).toBe('not_mentioned');
        expect(result.confidence).toBe('low');
    });

    it('uses context from a run matching the consensus position', () => {
        const result = consensusFromRuns('openai', 3, [
            run('secondary'),
            run('primary'),
            run('primary'),
        ]);
        expect(result.position).toBe('primary');
        expect(result.context).toBe('ctx-primary');
    });
});

describe('aggregateAcrossModels', () => {
    it('reaches high confidence when models agree', () => {
        const agg = aggregateAcrossModels([
            model({ model: 'openai', position: 'primary' }),
            model({ model: 'claude', position: 'primary' }),
        ]);
        expect(agg.position).toBe('primary');
        expect(agg.consensusRatio).toBe(1);
        expect(agg.runCount).toBe(6);
        expect(agg.successfulRuns).toBe(6);
        expect(agg.succeededModels).toEqual(['openai', 'claude']);
        expect(agg.failedModels).toEqual([]);
        expect(agg.confidence).toBe('high');
    });

    it('produces low confidence when models disagree', () => {
        const agg = aggregateAcrossModels([
            model({ model: 'openai', position: 'primary' }),
            model({ model: 'claude', position: 'not_mentioned', mentioned: false }),
        ]);
        // models split 1/1 -> consensus 0.5 -> low
        expect(agg.consensusRatio).toBe(0.5);
        expect(agg.confidence).toBe('low');
    });

    it('keeps results when one provider fails entirely', () => {
        const agg = aggregateAcrossModels([
            model({ model: 'openai', position: 'primary' }),
            model({
                model: 'claude',
                position: 'not_mentioned',
                mentioned: false,
                successfulRuns: 0,
                consensusRatio: 0,
                confidence: 'low',
                failed: true,
            }),
        ]);
        // surviving model decides the position
        expect(agg.position).toBe('primary');
        expect(agg.succeededModels).toEqual(['openai']);
        expect(agg.failedModels).toEqual(['claude']);
        // only 3 of 6 planned runs landed -> confidence drops to low
        expect(agg.runCount).toBe(6);
        expect(agg.successfulRuns).toBe(3);
        expect(agg.confidence).toBe('low');
    });

    it('returns a safe empty verdict when all providers fail', () => {
        const agg = aggregateAcrossModels([
            model({ model: 'openai', failed: true, successfulRuns: 0 }),
            model({ model: 'claude', failed: true, successfulRuns: 0 }),
        ]);
        expect(agg.position).toBe('not_mentioned');
        expect(agg.succeededModels).toEqual([]);
        expect(agg.failedModels).toEqual(['openai', 'claude']);
        expect(agg.confidence).toBe('low');
    });
});
