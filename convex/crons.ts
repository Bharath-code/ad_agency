import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Schedule weekly reports for Mondays at 9am UTC
crons.weekly(
	'send-weekly-reports',
	{ hourUTC: 9, minuteUTC: 0, dayOfWeek: 'monday' },
	internal.emails.processAllWeeklyReports,
);

export default crons;
