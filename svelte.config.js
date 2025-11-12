import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		alias: {
			$lib: "src/lib",
			$paraglide: "src/lib/paraglide",
		},
		adapter: adapter({
			out: 'build',
		}),
		csrf: {
			checkOrigin: false,
		},
	},
};

export default config;
