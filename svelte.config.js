import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		// csrf: {
		// 	checkOrigin: false
		// },
		alias: {
			$server: './shared-server',
			$shared: './shared-server/shared',
			$models: './shared-server/models',
			$game: './shared-server/game',
			$auth: './shared-server/auth',
			$utils: './shared-server/utils',
			$services: './shared-server/services',
			$bots: './shared-server/bots',
		},
	},
};

export default config;