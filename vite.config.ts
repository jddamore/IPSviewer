import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	// const env = {...process.env, ...loadEnv(mode, process.cwd(), '')};
	process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};
	return {
		// vite config
		plugins: [sveltekit()],
		server: {
			host: true,
			port: process.env.DEV_SERVER_PORT ? process.env.DEV_SERVER_PORT : 3000
		},
		build: {
			sourcemap: process.env.DEBUG ?? false
		}
	}
});
