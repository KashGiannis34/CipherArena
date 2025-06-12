import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import * as dotenv from 'dotenv';

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
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			external: ['mongoose', 'argon2', 'jsonwebtoken', 'mongodb', 'nanoid']
		}
	}
});