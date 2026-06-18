import { describe, expect, it } from 'vitest';
import {
    buildClientReport,
    buildShareToken,
    type ClientReportInput,
    escapeHtml,
    isReportAccessible,
    renderReportHtml,
} from '../../convex/lib/clientReport';

function input(overrides: Partial<ClientReportInput> = {}): ClientReportInput {
    return {
        branding: { reportTitle: 'Q2 Visibility', projectName: 'Acme', agencyName: 'BrightOps' },
        options: { includeEvidence: true, includeActions: true },
        score: {
            visibilityScore: 64,
            totalQueries: 30,
            primaryMentions: 12,
            secondaryMentions: 6,
            notMentioned: 12,
        },
        competitorWins: [{ competitor: 'RivalCo', wins: 4, reasons: ['Cheaper', 'More integrations'] }],
        evidence: [
            {
                query: 'best ad agency tools',
                position: 'not_mentioned',
                competitorMentioned: 'RivalCo',
                context: 'Competitors dominate this query.',
            },
        ],
        actions: [{ title: 'Add ROI proof to hero', type: 'positioning', status: 'planned' }],
        generatedAt: Date.UTC(2026, 5, 18),
        ...overrides,
    };
}

describe('buildClientReport', () => {
    it('passes through score and competitor wins with branding', () => {
        const report = buildClientReport(input());
        expect(report.reportTitle).toBe('Q2 Visibility');
        expect(report.agencyName).toBe('BrightOps');
        expect(report.score.visibilityScore).toBe(64);
        expect(report.competitorWins).toHaveLength(1);
    });

    it('omits evidence when includeEvidence is false', () => {
        const report = buildClientReport(
            input({ options: { includeEvidence: false, includeActions: true } }),
        );
        expect(report.evidence).toEqual([]);
        expect(report.actions).toHaveLength(1);
    });

    it('omits actions when includeActions is false', () => {
        const report = buildClientReport(
            input({ options: { includeEvidence: true, includeActions: false } }),
        );
        expect(report.actions).toEqual([]);
        expect(report.evidence).toHaveLength(1);
    });
});

describe('isReportAccessible', () => {
    const now = 1_000;
    it('allows a live, non-revoked link', () => {
        expect(isReportAccessible({ revoked: false }, now)).toBe(true);
    });
    it('blocks a revoked link', () => {
        expect(isReportAccessible({ revoked: true }, now)).toBe(false);
    });
    it('blocks an expired link', () => {
        expect(isReportAccessible({ revoked: false, expiresAt: 500 }, now)).toBe(false);
    });
    it('allows a not-yet-expired link', () => {
        expect(isReportAccessible({ revoked: false, expiresAt: 2_000 }, now)).toBe(true);
    });
    it('treats expiry exactly at now as expired', () => {
        expect(isReportAccessible({ revoked: false, expiresAt: now }, now)).toBe(false);
    });
});

describe('buildShareToken', () => {
    it('hex-encodes bytes deterministically', () => {
        expect(buildShareToken([0, 15, 255, 16])).toBe('000fff10');
    });
    it('produces 2 hex chars per byte', () => {
        const token = buildShareToken(new Uint8Array(16));
        expect(token).toHaveLength(32);
        expect(token).toMatch(/^[0-9a-f]+$/);
    });
});

describe('escapeHtml', () => {
    it('escapes markup-significant characters', () => {
        expect(escapeHtml('<script>"x"&\'')).toBe('&lt;script&gt;&quot;x&quot;&amp;&#39;');
    });
});

describe('renderReportHtml', () => {
    it('is a self-contained HTML document with branding and sections', () => {
        const html = renderReportHtml(buildClientReport(input()));
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('BrightOps');
        expect(html).toContain('Q2 Visibility');
        expect(html).toContain('AI visibility score');
        expect(html).toContain('Competitor wins');
        expect(html).toContain('RivalCo');
        expect(html).toContain('Recommended actions');
    });

    it('escapes injected markup in report text', () => {
        const html = renderReportHtml(
            buildClientReport(
                input({ branding: { reportTitle: '<img src=x>', projectName: 'Acme' } }),
            ),
        );
        expect(html).not.toContain('<img src=x>');
        expect(html).toContain('&lt;img src=x&gt;');
    });

    it('falls back to PromptLens branding when no agency name', () => {
        const html = renderReportHtml(
            buildClientReport(input({ branding: { reportTitle: 'R', projectName: 'P' } })),
        );
        expect(html).toContain('>PromptLens</div>');
    });

    it('drops omitted sections', () => {
        const html = renderReportHtml(
            buildClientReport(
                input({ options: { includeEvidence: false, includeActions: false } }),
            ),
        );
        expect(html).not.toContain('Recommended actions');
        expect(html).toContain('Competitor wins');
    });
});
