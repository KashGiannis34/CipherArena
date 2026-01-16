import { start_mongo } from "$services/mongo.js";
import { globalLimiter, getLimiterForRoute } from "$lib/server/rateLimiter.js";
import { error } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	await start_mongo();
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const { pathname } = event.url;

	if (
		pathname.startsWith('/_app') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/api/health') ||
		pathname.endsWith('.svg') ||
		pathname.endsWith('.png') ||
		pathname.endsWith('.jpg') ||
		pathname.endsWith('.css') ||
		pathname.endsWith('.js')
	) {
		return resolve(event);
	}

	const globalStatus = await globalLimiter.check(event);
	if (globalStatus.limited) {
		return new Response(
			`Too many requests. Please try again after ${globalStatus.retryAfter} seconds.`,
			{
				status: 429,
				headers: { 'Retry-After': globalStatus.retryAfter.toString() }
			}
		);
	}

	if (event.request.method === 'POST') {
		const routeLimiter = getLimiterForRoute(pathname);
		if (routeLimiter) {
			const isLimited = await routeLimiter.limiter.isLimited(event);
			if (isLimited) {
				throw error(429, `Too many requests to ${routeLimiter.name} endpoint. Please slow down.`);
			}
		}
	}

	return resolve(event);
}
