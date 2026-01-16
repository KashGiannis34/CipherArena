import { RateLimiter, RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';
import { env } from '$env/dynamic/private';

const RATE_LIMITER_SECRET = env.RATE_LIMITER_SECRET;

export const globalLimiter = new RetryAfterRateLimiter({
	IP: [100, 'm'],
	IPUA: [60, 'm']
});

export const authLimiter = new RateLimiter({
	IP: [10, 'm'],
	IPUA: [5, 'm'],
	cookie: {
		name: 'auth-limiter',
		secret: RATE_LIMITER_SECRET,
		rate: [5, 'm'],
		preflight: true
	}
});

export const emailLimiter = new RateLimiter({
	IP: [3, 'm'],
	IPUA: [2, 'm']
});

export const gameCreationLimiter = new RateLimiter({
	IP: [10, 'm'],
	IPUA: [5, 'm']
});

export const apiLimiter = new RateLimiter({
	IP: [30, 'm'],
	IPUA: [20, 'm']
});

export function getLimiterForRoute(pathname) {
	if (
		pathname.startsWith('/auth/login') ||
		pathname.startsWith('/auth/register') ||
		pathname.startsWith('/account/login') ||
		pathname.startsWith('/account/register')
	) {
		return { limiter: authLimiter, name: 'auth' };
	}

	if (
		pathname.startsWith('/forgot-password') ||
		pathname.startsWith('/resend-verification')
	) {
		return { limiter: emailLimiter, name: 'email' };
	}

	if (pathname.startsWith('/api/create-game')) {
		return { limiter: gameCreationLimiter, name: 'game-creation' };
	}

	if (pathname.startsWith('/api/')) {
		return { limiter: apiLimiter, name: 'api' };
	}

	return null;
}
