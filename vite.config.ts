import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	server: {
		proxy: {
			// Proxy only PocketBase-specific API paths to local PocketBase instance
			// This allows the frontend to use window.location.origin in development
			// while still connecting to PocketBase running on port 8090
			//
			// NOTE: /api/process-batch and /api/proxy-models are SvelteKit endpoints
			// and should NOT be proxied (they're handled by SvelteKit)
			'/api/collections': {
				target: 'http://127.0.0.1:8090',
				changeOrigin: true
			},
			'/api/files': {
				target: 'http://127.0.0.1:8090',
				changeOrigin: true
			},
			'/api/admins': {
				target: 'http://127.0.0.1:8090',
				changeOrigin: true
			},
			'/api/realtime': {
				target: 'http://127.0.0.1:8090',
				changeOrigin: true
			},
			'/api/health': {
				target: 'http://127.0.0.1:8090',
				changeOrigin: true
			},
			'/_': {
				target: 'http://127.0.0.1:8090',
				changeOrigin: true
			}
		}
	}
});
