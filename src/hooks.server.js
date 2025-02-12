import { start_mongo } from "$db/mongo";
import { authenticate } from "$db/auth/authenticate";
import { redirect } from "@sveltejs/kit";


/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	await start_mongo();
}

export const handle = async ({ event, resolve }) => {
	const is_protected = event.url.pathname.startsWith("/home") || event.url.pathname.startsWith("/game");

	const auth = authenticate(event.cookies);
	if (is_protected && !auth) {
		throw redirect(308, "/");
	}

	if (auth && event.url.pathname=='/') {
		throw redirect(308, "/home");
	}

	const response = await resolve(event);

	return response;
};
