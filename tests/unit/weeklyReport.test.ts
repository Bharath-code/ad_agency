import { describe, expect, it } from 'vitest';
import {
    buildWeeklyReport,
    diffCompetitorMentions,
    type PreviousReportInput,
    selectTopFixes,
    type WeeklyReportSummaryInput,
} from '../../convex/lib/weeklyReport';

function summary(overrides: Partial<WeeklyReportSummaryInput> = {}): WeeklyReportSummaryInput {
    return {
        visibilityScore: 62,
        topWins: [{ query: 'best ad agency tools' }, { query: 'top marketing platforms' }],
        topMisses: [
            { query: 'alternatives to X', competitorMentioned: 'AdTechPro' },
            { query: 'cheapest ad tool', competitorMentioned: 'RivalCo' },
        ],
        recommendedFixes: [
            { positioningFix: 'Lead with ROI proof' },
            { contentSuggestion: 'Publish a comparison page' },
            { messagingFix: 'Name the integration' },
        ],
        ...overrides,
    };
}

describe('selectTopFixes', () => {
    it('takes the first non-empty fix per row, capped at the limit', () => {
        const fixes = selectTopFixes([
            { positioningFix: 'A', contentSuggestion: 'ignored' },
            { contentSuggestion: 'B' },
            { messagingFix: 'C' },
            { positioningFix: 'D' },
        ]);
        expect(fixes).toEqual(['A', 'B', 'C']);
    });

    it('skips rows with no usable fix (undefined or whitespace)', () => {
        const fixes = selectTopFixes([{ positioningFix: '   ' }, {}, { contentSuggestion: 'real' }]);
        expect(fixes).toEqual(['real']);
    });

    it('honors a custom limit', () => {
        const fixes = selectTopFixes([{ positioningFix: 'A' }, { positioningFix: 'B' }], 1);
        expect(fixes).toEqual(['A']);
    });
});

describe('diffCompetitorMentions', () => {
    it('returns competitors not seen in the previous report', () => {
        const result = diffCompetitorMentions(
            [
                { query: 'q1', competitorMentioned: 'AdTechPro' },
                { query: 'q2', competitorMentioned: 'NewRival' },
            ],
            ['AdTechPro'],
        );
        expect(result).toEqual(['NewRival']);
    });

    it('dedups case-insensitively and preserves the first spelling', () => {
        const result = diffCompetitorMentions(
            [
                { query: 'q1', competitorMentioned: 'NewRival' },
                { query: 'q2', competitorMentioned: 'newrival' },
            ],
            [],
        );
        expect(result).toEqual(['NewRival']);
    });

    it('treats previous mentions case-insensitively', () => {
        const result = diffCompetitorMentions(
            [{ query: 'q1', competitorMentioned: 'AdTechPro' }],
            ['adtechpro'],
        );
        expect(result).toEqual([]);
    });

    it('ignores misses with no competitor', () => {
        const result = diffCompetitorMentions([{ query: 'q1' }, { query: 'q2', competitorMentioned: '  ' }], []);
        expect(result).toEqual([]);
    });
});

describe('buildWeeklyReport', () => {
    it('computes score movement against the previous report', () => {
        const report = buildWeeklyReport(summary({ visibilityScore: 70 }), {
            currentScore: 55,
            newCompetitorMentions: [],
        });
        expect(report.previousScore).toBe(55);
        expect(report.currentScore).toBe(70);
        expect(report.scoreChange).toBe(15);
    });

    it('treats a missing previous report as a baseline of zero', () => {
        const report = buildWeeklyReport(summary({ visibilityScore: 40 }), null);
        expect(report.previousScore).toBe(0);
        expect(report.scoreChange).toBe(40);
    });

    it('reports a negative score change when visibility drops', () => {
        const report = buildWeeklyReport(summary({ visibilityScore: 30 }), {
            currentScore: 50,
            newCompetitorMentions: [],
        });
        expect(report.scoreChange).toBe(-20);
    });

    it('surfaces query strings and top 3 fixes', () => {
        const report = buildWeeklyReport(summary(), null);
        expect(report.topWins).toEqual(['best ad agency tools', 'top marketing platforms']);
        expect(report.topMisses).toEqual(['alternatives to X', 'cheapest ad tool']);
        expect(report.topFixes).toEqual([
            'Lead with ROI proof',
            'Publish a comparison page',
            'Name the integration',
        ]);
    });

    it('flags only competitors new since the previous report', () => {
        const previous: PreviousReportInput = {
            currentScore: 60,
            newCompetitorMentions: ['AdTechPro'],
        };
        const report = buildWeeklyReport(summary(), previous);
        expect(report.newCompetitorMentions).toEqual(['RivalCo']);
    });
});
