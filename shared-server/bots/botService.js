/**
 * Bot Service - Communicates with Python code bot server
 */

import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_DIR = path.resolve(process.cwd(), 'shared-server/bots');

// State
let shell = null;
let initPromise = null;
let reqId = 0;
const pending = new Map();
let stats = { requests: 0, startTime: Date.now(), lastActive: Date.now(), poolSize: 4 };

/**
 * Get or create the Python process
 */
function getShell() {
	if (shell) return Promise.resolve(shell);
	if (initPromise) return initPromise;

	initPromise = new Promise((resolve, reject) => {
		const py = new PythonShell('codebusters_bot_server.py', {
			mode: 'text',
			pythonPath: process.env.PYTHON_PATH || (process.env.NODE_ENV === 'production' ? 'python3' : 'python'),
			pythonOptions: ['-u', '-O'],
			scriptPath: SCRIPT_DIR,
			env: { ...process.env, BOT_POOL_SIZE: process.env.BOT_POOL_SIZE || '4' }
		});

		py.on('message', (msg) => {
			try {
				const res = JSON.parse(msg);
				if (res.type === 'ready') {
					stats.poolSize = res.data?.poolSize || 4;
					shell = py;
					initPromise = null;
					resolve(py);
				} else if (res.id && pending.has(res.id)) {
					pending.get(res.id).resolve(res.data);
					pending.delete(res.id);
				}
			} catch (e) { console.error('[Bot] Parse error:', e.message); }
		});

		py.on('stderr', (d) => console.error('[Bot][py]', d));
		py.on('error', (e) => { cleanup(); reject(e); });
		py.on('close', () => cleanup());

		setTimeout(() => { if (!shell) { cleanup(); reject(new Error('Init timeout')); } }, 15000);
	});

	return initPromise;
}

function cleanup() {
	if (shell) try { shell.end(); } catch {}
	shell = null;
	initPromise = null;
	pending.forEach(p => p.reject(new Error('Process closed')));
	pending.clear();
}

async function send(action, data) {
	stats.lastActive = Date.now();
	stats.requests++;

	const py = await getShell();
	const id = ++reqId;

	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(id);
			reject(new Error('Timeout'));
		}, 10000);

		pending.set(id, {
			resolve: (v) => { clearTimeout(timer); resolve(v); },
			reject: (e) => { clearTimeout(timer); reject(e); }
		});

		py.send(JSON.stringify({ action, id, ...data }));
	});
}

// Auto shutdown after 30 min inactivity
setInterval(() => {
	if (shell && Date.now() - stats.lastActive > 30 * 60 * 1000) {
		console.log('[Bot] Shutting down (inactive)');
		cleanup();
	}
}, 5 * 60 * 1000);

// Public API
export const generateProblem = (problemType, decimals) => send('generate', { problemType, decimals });
export const checkAnswer = (problemType, problemData, userAnswer) => send('check', { problemType, problemData, userAnswer });
export const getStats = () => ({
	uptime: Math.floor((Date.now() - stats.startTime) / 1000),
	requests: stats.requests,
	poolSize: stats.poolSize,
	isActive: !!shell,
	pending: pending.size
});

process.on('SIGTERM', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(0); });
