// Persistent Python Bot Service
import { PythonShell } from 'python-shell';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// In production, SvelteKit bundles this file under build/server; __dirname won't be /app/db.
// Use the project root (CWD) to point Python at the real db directory which we copy into the image.
const ROOT_DIR = process.cwd();
const SCRIPT_DIR = path.resolve(ROOT_DIR, 'db');

let pythonShell = null;
let isInitializing = false;
let initPromise = null;
let requestId = 0;
let pendingRequests = new Map();
let requestCount = 0;
let startTime = Date.now();
let lastActivityTime = Date.now();

// Auto-restart after 30 minutes of inactivity
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

function checkInactivity() {
	if (pythonShell && Date.now() - lastActivityTime > INACTIVITY_TIMEOUT) {
		console.log('[Bot Service] Shutting down due to inactivity');
		shutdownPythonShell();
	}
}

// Check for inactivity every 5 minutes
setInterval(checkInactivity, 5 * 60 * 1000);

function shutdownPythonShell() {
	if (pythonShell) {
		try {
			pythonShell.end();
		} catch (error) {
			console.error('[Bot Service] Error ending Python shell:', error);
		}
		pythonShell = null;
		isInitializing = false;
		initPromise = null;
		pendingRequests.clear();
	}
}

async function initPythonShell() {
	if (pythonShell) {
		return pythonShell;
	}

	if (isInitializing && initPromise) {
		return initPromise;
	}

	isInitializing = true;
	console.log('[Bot Service] Initializing Python shell...');
	console.log(`[Bot Service] JS __dirname=${__dirname}, CWD=${ROOT_DIR}, scriptDir=${SCRIPT_DIR}`);

	initPromise = new Promise((resolve, reject) => {
		const scriptFile = path.join(SCRIPT_DIR, 'codebusters_bot_server.py');
		if (!fs.existsSync(scriptFile)) {
			const msg = `[Bot Service] Python server script not found at ${scriptFile}. Check that the 'db' folder is included in the image and scriptPath is correct.`;
			console.error(msg);
			isInitializing = false;
			return reject(new Error(msg));
		}
		const options = {
			mode: 'text',
			pythonPath: process.env.PYTHON_PATH || (process.env.NODE_ENV === 'production' ? 'python3' : 'python'),
			pythonOptions: ['-u'], // Unbuffered output
			scriptPath: SCRIPT_DIR
		};

		try {
			console.log(`[Bot Service] Spawning Python: ${options.pythonPath} scriptPath=${options.scriptPath}`);
			pythonShell = new PythonShell('codebusters_bot_server.py', options);

			// Handle incoming messages
			pythonShell.on('message', (message) => {
				try {
					const response = JSON.parse(message);

					if (response.type === 'ready') {
						console.log('[Bot Service] Python process ready');
						isInitializing = false;
						resolve(pythonShell);
						return;
					}

					// Handle responses to requests
					const requestId = response.id;
					if (requestId && pendingRequests.has(requestId)) {
						const { resolve: resolveRequest } = pendingRequests.get(requestId);
						pendingRequests.delete(requestId);
						resolveRequest(response.data);
					}
				} catch (error) {
					console.error('[Bot Service] Error parsing message from Python:', error?.message || error, '\nRaw:', message);
				}
			});

			// Show Python stderr for debugging (e.g., missing files, import errors)
			pythonShell.on('stderr', (data) => {
				console.error('[Bot Service][stderr]', data);
			});

			// Handle errors
			pythonShell.on('error', (error) => {
				console.error('[Bot Service] Python shell error:', error);

				// Reject all pending requests
				pendingRequests.forEach(({ reject }) => {
					reject(new Error('Python process error: ' + error.message));
				});
				pendingRequests.clear();

				// Clean up
				shutdownPythonShell();

				if (isInitializing) {
					isInitializing = false;
					reject(error);
				}
			});

			// Handle process exit
			pythonShell.on('close', (code, signal) => {
				console.log(`[Bot Service] Python process closed (code=${code}, signal=${signal})`);
				shutdownPythonShell();
			});

			// Timeout initialization after 15 seconds
			setTimeout(() => {
				if (isInitializing) {
					isInitializing = false;
					const error = new Error('Python initialization timeout');
					shutdownPythonShell();
					reject(error);
				}
			}, 15000);

		} catch (error) {
			isInitializing = false;
			shutdownPythonShell();
			reject(error);
		}
	});

	return initPromise;
}

async function sendRequest(action, data) {
	lastActivityTime = Date.now();
	requestCount++;

	const shell = await initPythonShell();
	const id = ++requestId;

	return new Promise((resolve, reject) => {
		// Store the promise callbacks
		pendingRequests.set(id, { resolve, reject });

		// Set timeout for this specific request
		const timeout = setTimeout(() => {
			if (pendingRequests.has(id)) {
				pendingRequests.delete(id);
				reject(new Error('Request timeout'));
			}
		}, 8000);

		// Clear timeout when resolved
		const originalResolve = resolve;
		const wrappedResolve = (value) => {
			clearTimeout(timeout);
			originalResolve(value);
		};

		const originalReject = reject;
		const wrappedReject = (error) => {
			clearTimeout(timeout);
			originalReject(error);
		};

		pendingRequests.set(id, { resolve: wrappedResolve, reject: wrappedReject });

		// Send the request
		const request = JSON.stringify({ action, id, ...data });
		try {
			shell.send(request);
		} catch (error) {
			pendingRequests.delete(id);
			clearTimeout(timeout);
			reject(error);
		}
	});
}

export async function generateProblem(problemType, decimals) {
	try {
		const result = await sendRequest('generate', { problemType, decimals });
		return result;
	} catch (error) {
		console.error('[Bot Service] Generate error:', error);
		throw error;
	}
}

export async function checkAnswer(problemType, problemData, userAnswer) {
	try {
		const result = await sendRequest('check', { problemType, problemData, userAnswer });
		return result;
	} catch (error) {
		console.error('[Bot Service] Check error:', error);
		throw error;
	}
}

export function getStats() {
	const uptime = Math.floor((Date.now() - startTime) / 1000);
	const inactiveFor = Math.floor((Date.now() - lastActivityTime) / 1000);

	return {
		uptime,
		requests: requestCount,
		requestsPerSecond: requestCount / uptime,
		isActive: !!pythonShell,
		isInitializing,
		pendingRequests: pendingRequests.size,
		inactiveFor
	};
}

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('[Bot Service] Shutting down...');
	shutdownPythonShell();
});

process.on('SIGINT', () => {
	console.log('[Bot Service] Shutting down...');
	shutdownPythonShell();
	process.exit(0);
});
