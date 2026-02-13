/**
 * Convex + Clerk Auth Store for SvelteKit
 *
 * This store handles authentication state and Convex integration.
 * Clerk is initialized dynamically to avoid TypeScript and SSR issues.
 */

import { ConvexClient } from 'convex/browser';
import { writable } from 'svelte/store';
import { api } from '$convex/_generated/api';
import type { Id } from '$convex/_generated/dataModel';

// Types
export type User = {
	_id: Id<'users'>;
	email: string;
	name?: string;
	avatarUrl?: string;
	plan: 'free' | 'indie' | 'startup';
	scansUsed: number;
	createdAt: number;
};

// Stores
export const isLoading = writable(true);
export const isAuthenticated = writable(false);
export const convexUser = writable<User | null>(null);

// Convex client
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL as string;
export const convex = new ConvexClient(convexUrl || 'https://placeholder.convex.cloud');

// Clerk instance holder
let clerkInstance: unknown = null;

/**
 * Initialize auth
 */
export async function initAuth(): Promise<void> {
	const clerkPubKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string;
	const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

	if (bypassAuth) {
		console.warn('Auth Sandbox Mode active - providing mock session');

		// Provide mock user for testing
		convexUser.set({
			_id: 'mock-user-id' as Id<'users'>,
			email: 'sandbox@example.com',
			name: 'Sandbox User',
			plan: 'startup',
			scansUsed: 0,
			createdAt: Date.now(),
		});
		isAuthenticated.set(true);
		isLoading.set(false);
		return;
	}

	if (!clerkPubKey) {
		console.error(
			'PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Authentication is disabled until it is configured.',
		);
		convexUser.set(null);
		isAuthenticated.set(false);
		isLoading.set(false);
		return;
	}

	try {
		// Dynamic import to avoid SSR and type issues
		const ClerkModule = await import('@clerk/clerk-js');
		const ClerkClass = (ClerkModule.default || ClerkModule.Clerk) as unknown;

		if (ClerkClass) {
			clerkInstance = new (ClerkClass as new (key: string) => unknown)(clerkPubKey);
			await (clerkInstance as { load: () => Promise<void> }).load();

			// Set up auth listener
			(
				clerkInstance as {
					addListener: (cb: (r: { session?: unknown; user?: unknown }) => void) => void;
				}
			).addListener((resources) => {
				if (resources.session && resources.user) {
					isAuthenticated.set(true);
					setupConvexAuth(resources.session);
				} else {
					isAuthenticated.set(false);
					convexUser.set(null);
				}
			});
		}
	} catch (error) {
		console.error('Failed to initialize Clerk:', error);
	}

	isLoading.set(false);
}

/**
 * Set up Convex auth and sync user
 */
async function setupConvexAuth(session: unknown): Promise<void> {
	try {
		convex.setAuth(async () => {
			const token = await (
				session as { getToken: (opts: { template: string }) => Promise<string | null> }
			).getToken({ template: 'convex' });
			return token;
		});

		await convex.mutation(api.users.createOrGetUser, {});
		const user = await convex.query(api.users.getCurrentUser, {});
		convexUser.set(user as User | null);
	} catch (error) {
		console.error('Failed to sync Convex user:', error);
	}
}

/**
 * Sign in with Clerk
 */
export function signIn(): void {
	if (clerkInstance) {
		(clerkInstance as { openSignIn: () => void }).openSignIn();
	} else {
		console.warn('Clerk not initialized');
	}
}

/**
 * Sign up with Clerk
 */
export function signUp(): void {
	if (clerkInstance) {
		(clerkInstance as { openSignUp: () => void }).openSignUp();
	} else {
		console.warn('Clerk not initialized');
	}
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
	if (clerkInstance) {
		await (clerkInstance as { signOut: () => Promise<void> }).signOut();
	}
	convexUser.set(null);
	isAuthenticated.set(false);
}
