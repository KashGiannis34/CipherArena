import { start_mongo } from "$db/mongo";
import { authenticate } from "$db/auth/authenticate";
import { redirect } from "@sveltejs/kit";
import { Cookies } from "@sveltejs/kit";


/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	await start_mongo();
}

export const handle = async ({ event, resolve }) => {
	if (is_protected(event.url) || event.url.pathname=='/') {
		const auth = authenticate(event.cookies.get("auth-token"));
		if (is_protected(event.url) && !auth) {
			throw redirect(303, "/");
		}

		if (auth && event.url.pathname=='/') {
			throw redirect(303, "/home");
		}
	}

	const response = await resolve(event);

	return response;
};

function is_protected(url) {
	const protected_paths = ["/home", "/game/","/private-lobby", "/public-lobby"];
	return protected_paths.some((path) => url.pathname.startsWith(path));
}
