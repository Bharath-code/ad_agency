/**
 * HTML email templates
 */

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
	const scoreColor = data.scoreChange >= 0 ? '#16a34a' : '#dc2626';
	const scoreArrow = data.scoreChange >= 0 ? '↑' : '↓';

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Weekly Visibility Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181b; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); color: white; padding: 32px; border-radius: 12px 12px 0 0;">
		<h1 style="margin: 0 0 8px; font-size: 24px;">Weekly Visibility Report</h1>
		<p style="margin: 0; opacity: 0.9;">${data.projectName}</p>
	</div>

	<div style="background: #fafafa; padding: 32px; border: 1px solid #e4e4e7; border-top: none;">
		<!-- Score Section -->
		<div style="text-align: center; margin-bottom: 32px;">
			<div style="font-size: 64px; font-weight: 700; color: #18181b;">${data.currentScore}</div>
			<div style="font-size: 14px; color: #71717a;">Visibility Score</div>
			<div style="display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; background: ${data.scoreChange >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${scoreColor};">
				${scoreArrow} ${Math.abs(data.scoreChange)} from last week
			</div>
		</div>

		<!-- Wins -->
		${
			data.topWins.length > 0
				? `
		<div style="margin-bottom: 24px;">
			<h2 style="font-size: 16px; margin: 0 0 12px; color: #18181b;">🎯 Top Wins</h2>
			${data.topWins
				.map(
					(win) => `
				<div style="padding: 12px; background: #dcfce7; border-radius: 8px; margin-bottom: 8px; font-size: 14px;">
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
			<h2 style="font-size: 16px; margin: 0 0 12px; color: #18181b;">⚠️ Missed Opportunities</h2>
			${data.topMisses
				.map(
					(miss) => `
				<div style="padding: 12px; background: #fee2e2; border-radius: 8px; margin-bottom: 8px; font-size: 14px;">
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
			<h2 style="font-size: 16px; margin: 0 0 12px; color: #18181b;">💡 Recommended Actions</h2>
			${data.topFixes
				.map(
					(fix, i) => `
				<div style="padding: 12px; background: white; border: 1px solid #e4e4e7; border-radius: 8px; margin-bottom: 8px; font-size: 14px;">
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
			<a href="${data.dashboardUrl}" style="display: inline-block; background: #ea580c; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Full Report</a>
		</div>
	</div>

	<div style="padding: 24px; text-align: center; color: #71717a; font-size: 12px;">
		<p style="margin: 0 0 8px;">AI Visibility Intelligence</p>
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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181b; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); color: white; padding: 32px; border-radius: 12px 12px 0 0;">
		<h1 style="margin: 0;">Welcome to AI Visibility Intelligence!</h1>
	</div>

	<div style="background: #fafafa; padding: 32px; border: 1px solid #e4e4e7; border-top: none;">
		<p>Hi ${name || 'there'},</p>
		<p>Thanks for signing up! You're now ready to see how AI assistants recommend your product.</p>
		
		<h2 style="font-size: 18px; margin: 24px 0 12px;">Next Steps:</h2>
		<ol style="padding-left: 20px;">
			<li style="margin-bottom: 8px;"><strong>Create your first project</strong> — Add your product and competitors</li>
			<li style="margin-bottom: 8px;"><strong>Run your first scan</strong> — See your visibility score</li>
			<li style="margin-bottom: 8px;"><strong>Get actionable fixes</strong> — Improve your positioning</li>
		</ol>

		<div style="text-align: center; margin-top: 32px;">
			<a href="${dashboardUrl}" style="display: inline-block; background: #ea580c; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
		</div>
	</div>

	<div style="padding: 24px; text-align: center; color: #71717a; font-size: 12px;">
		<p style="margin: 0;">AI Visibility Intelligence</p>
	</div>
</body>
</html>
`;
}
