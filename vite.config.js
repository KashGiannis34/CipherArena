import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import {webSocketServer} from './ws/webSocketPluginVite.js';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	server: {
        port: 3000
    },
    preview: {
        port: 5173
    },
	plugins: [sveltekit(), webSocketServer]
});
