// Persistent Python Bot Service
import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

	initPromise = new Promise((resolve, reject) => {
		const options = {
			mode: 'text',
			pythonPath: 'python',
			pythonOptions: ['-u'], // Unbuffered output
			scriptPath: __dirname
		};

		try {
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
					console.error('[Bot Service] Error parsing message:', error, message);
				}
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
			pythonShell.on('close', () => {
				console.log('[Bot Service] Python process closed');
				shutdownPythonShell();
			});

			// Timeout initialization after 10 seconds
			setTimeout(() => {
				if (isInitializing) {
					isInitializing = false;
					const error = new Error('Python initialization timeout');
					shutdownPythonShell();
					reject(error);
				}
			}, 10000);

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
		}, 5000);

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
