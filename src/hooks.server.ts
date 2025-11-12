import { POCKETBASE_URL } from '$lib/config/pocketbase';
import PocketBase from 'pocketbase';
import type { Handle } from '@sveltejs/kit';
import { startWorker } from '$lib/server/queue';

// Start the background worker on server startup
let workerStarted = false;
if (!workerStarted) {
	startWorker()
		.then(() => {
			console.log('[Queue] Background worker started successfully');
			workerStarted = true;
		})
		.catch((error) => {
			console.error('[Queue] Failed to start background worker:', error);
		});
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(POCKETBASE_URL);

	// Load the auth cookie into the PocketBase instance
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	// Verify and refresh the auth token if it's valid
	try {
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
		}
	} catch (_) {
		// Clear auth store if refresh fails (token expired or invalid)
		event.locals.pb.authStore.clear();
	}

	// Debug logging
	console.log('[Auth Debug] Path:', event.url.pathname);
	console.log('[Auth Debug] Cookie:', event.request.headers.get('cookie'));
	console.log('[Auth Debug] Auth valid:', event.locals.pb.authStore.isValid);
	console.log('[Auth Debug] Auth token:', event.locals.pb.authStore.token);
	console.log('[Auth Debug] Auth model:', event.locals.pb.authStore.model);

	const response = await resolve(event);

	// Sync the auth state back to cookies
	const pbCookie = event.locals.pb.authStore.exportToCookie({ httpOnly: false });

	// Only set the cookie if it's not empty
	if (pbCookie) {
		response.headers.append('set-cookie', pbCookie);
	}

	return response;
};
