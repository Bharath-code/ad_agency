/**
 * HTML email templates.
 *
 * Colors mirror the "Editorial Intelligence" design system (src/app.css): warm
 * paper background, warm ink text, a single deep-evergreen accent. Evergreen
 * signals a win / recommended action; amber signals a competitor win / miss.
 * Emails can't read CSS tokens, so the hexes are inlined to match the tokens.
 */

const PAPER = '#faf9f5';
const INK = '#1c1b16';
const MUTED = '#6e695d';
const HAIRLINE = '#e7e3d8';
const EVERGREEN = '#0c5d4d';
const EVERGREEN_LIGHT = '#138a72';
const EVERGREEN_TINT = '#ebf3ef';
const AMBER = '#b5731c';
const AMBER_TINT = '#f6ecd9';
const HEADER_GRADIENT = `linear-gradient(135deg, ${EVERGREEN} 0%, ${EVERGREEN_LIGHT} 100%)`;

interface WeeklyReportData {
	projectName: string;
	previousScore: number;
	currentScore: number;
	scoreChange: number;
	topWins: string[];
	topMisses: string[];
	topFixes: string[];
	dashboardUrl: string;
}

export function weeklyReportTemplate(data: WeeklyReportData): string {
	const up = data.scoreChange >= 0;
	const scoreColor = up ? EVERGREEN : AMBER;
	const scoreArrow = up ? '↑' : '↓';

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Weekly Visibility Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: ${INK}; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: ${HEADER_GRADIENT}; color: white; padding: 32px; border-radius: 12px 12px 0 0;">
		<h1 style="margin: 0 0 8px; font-size: 24px;">Weekly Visibility Report</h1>
		<p style="margin: 0; opacity: 0.9;">${data.projectName}</p>
	</div>

	<div style="background: ${PAPER}; padding: 32px; border: 1px solid ${HAIRLINE}; border-top: none;">
		<!-- Score Section -->
		<div style="text-align: center; margin-bottom: 32px;">
			<div style="font-size: 64px; font-weight: 700; color: ${INK};">${data.currentScore}</div>
			<div style="font-size: 14px; color: ${MUTED};">Visibility Score</div>
			<div style="display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; background: ${up ? EVERGREEN_TINT : AMBER_TINT}; color: ${scoreColor};">
				${scoreArrow} ${Math.abs(data.scoreChange)} from last week
			</div>
		</div>

		<!-- Wins -->
		${
			data.topWins.length > 0
				? `
		<div style="margin-bottom: 24px;">
			<h2 style="font-size: 16px; margin: 0 0 12px; color: ${INK};">🎯 Top Wins</h2>
			${data.topWins
				.map(
					(win) => `
				<div style="padding: 12px; background: ${EVERGREEN_TINT}; border-radius: 8px; margin-bottom: 8px; font-size: 14px;">
					✓ ${win}
				</div>
			`,
				)
				.join('')}
		</div>
		`
				: ''
		}

		<!-- Misses -->
		${
			data.topMisses.length > 0
				? `
		<div style="margin-bottom: 24px;">
			<h2 style="font-size: 16px; margin: 0 0 12px; color: ${INK};">⚠️ Missed Opportunities</h2>
			${data.topMisses
				.map(
					(miss) => `
				<div style="padding: 12px; background: ${AMBER_TINT}; border-radius: 8px; margin-bottom: 8px; font-size: 14px;">
					✗ ${miss}
				</div>
			`,
				)
				.join('')}
		</div>
		`
				: ''
		}

		<!-- Fixes -->
		${
			data.topFixes.length > 0
				? `
		<div style="margin-bottom: 24px;">
			<h2 style="font-size: 16px; margin: 0 0 12px; color: ${INK};">💡 Recommended Actions</h2>
			${data.topFixes
				.map(
					(fix, i) => `
				<div style="padding: 12px; background: white; border: 1px solid ${HAIRLINE}; border-radius: 8px; margin-bottom: 8px; font-size: 14px;">
					${i + 1}. ${fix}
				</div>
			`,
				)
				.join('')}
		</div>
		`
				: ''
		}

		<!-- CTA -->
		<div style="text-align: center; margin-top: 32px;">
			<a href="${data.dashboardUrl}" style="display: inline-block; background: ${EVERGREEN}; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Full Report</a>
		</div>
	</div>

	<div style="padding: 24px; text-align: center; color: ${MUTED}; font-size: 12px;">
		<p style="margin: 0 0 8px;">PromptLens</p>
		<p style="margin: 0;">You're receiving this because you have weekly reports enabled.</p>
	</div>
</body>
</html>
`;
}

export function welcomeEmailTemplate(name: string, dashboardUrl: string): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: ${INK}; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: ${HEADER_GRADIENT}; color: white; padding: 32px; border-radius: 12px 12px 0 0;">
		<h1 style="margin: 0;">Welcome to PromptLens!</h1>
	</div>

	<div style="background: ${PAPER}; padding: 32px; border: 1px solid ${HAIRLINE}; border-top: none;">
		<p>Hi ${name || 'there'},</p>
		<p>Thanks for signing up! You're now ready to see how AI assistants recommend your product.</p>

		<h2 style="font-size: 18px; margin: 24px 0 12px;">Next Steps:</h2>
		<ol style="padding-left: 20px;">
			<li style="margin-bottom: 8px;"><strong>Create your first project</strong> — Add your product and competitors</li>
			<li style="margin-bottom: 8px;"><strong>Run your first scan</strong> — See your visibility score</li>
			<li style="margin-bottom: 8px;"><strong>Get actionable fixes</strong> — Improve your positioning</li>
		</ol>

		<div style="text-align: center; margin-top: 32px;">
			<a href="${dashboardUrl}" style="display: inline-block; background: ${EVERGREEN}; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
		</div>
	</div>

	<div style="padding: 24px; text-align: center; color: ${MUTED}; font-size: 12px;">
		<p style="margin: 0;">PromptLens</p>
	</div>
</body>
</html>
`;
}
