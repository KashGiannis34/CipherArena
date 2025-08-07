import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import {webSocketServer} from './ws/webSocketPluginVite.js';
import * as dotenv from 'dotenv';
import compression from 'vite-plugin-compression';

dotenv.config();

export default defineConfig({
	server: {
		port: process.env.PORT,
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..'],
        },
	},
	preview: {
		port: process.env.PORT
	},
	plugins: [
		sveltekit(), 
		webSocketServer,
		compression({
			algorithm: 'gzip',
			deleteOriginalAssets: false
		}),
		compression({
			algorithm: 'brotliCompress',
			ext: '.br',
			deleteOriginalAssets: false
		})
	],
	build: {
		target: 'esnext',
		minify: 'terser',
		cssMinify: true,
		rollupOptions: {
			external: ['mongoose', 'argon2', 'jsonwebtoken', 'mongodb', 'nanoid'],
			output: {
				manualChunks: {
					sveltestrap: ['@sveltestrap/sveltestrap'],
					icons: ['svelte-confetti']
				}
			}
		},
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		}
	},
	optimizeDeps: {
		include: ['chart.js', '@sveltestrap/sveltestrap', 'svelte-confetti']
	}
});