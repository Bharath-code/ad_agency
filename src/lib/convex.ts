import { ConvexClient } from 'convex/browser';

// Create a Convex client for the frontend
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL as string;

if (!convexUrl) {
	console.warn('PUBLIC_CONVEX_URL not set. Convex features will not work.');
}

export const convex = new ConvexClient(convexUrl || 'https://placeholder.convex.cloud');

// Types will be available after running `npx convex dev`
// Re-export from convex/_generated when available
