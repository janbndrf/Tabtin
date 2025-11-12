// PocketBase URL configuration
//
// Environment-specific behavior:
//
// LOCAL DEVELOPMENT:
// - Client-side: Uses window.location.origin (http://localhost:5173)
//   Vite proxy forwards /api/* and /_/* to PocketBase at localhost:8090
// - Server-side: Uses http://127.0.0.1:8090 directly
//
// MOBILE TESTING:
// - Set PUBLIC_POCKETBASE_URL=http://YOUR_LOCAL_IP:8090 in .env
// - This overrides all defaults for direct backend access
//
// PRODUCTION (Docker):
// - Client-side: Uses window.location.origin (nginx proxies to backend)
// - Server-side: Uses http://backend:8090 (Docker service name)
//   Set PUBLIC_POCKETBASE_URL=http://backend:8090 in production .env

export const POCKETBASE_URL = (() => {
	// If PUBLIC_POCKETBASE_URL is explicitly set, use it (mobile testing, production)
	if (import.meta.env.PUBLIC_POCKETBASE_URL) {
		return import.meta.env.PUBLIC_POCKETBASE_URL;
	}

	// Client-side (browser): Use current origin
	// In dev, Vite proxy handles forwarding to PocketBase
	// In prod, nginx handles forwarding to PocketBase
	if (typeof window !== 'undefined') {
		return window.location.origin;
	}

	// Server-side: Direct connection to PocketBase
	// Docker: backend:8090 (service name)
	// Local dev: 127.0.0.1:8090
	const isDocker = process.env.DOCKER_ENV === 'true' || process.env.HOSTNAME?.includes('sveltekit');
	return isDocker ? 'http://backend:8090' : 'http://127.0.0.1:8090';
})();
