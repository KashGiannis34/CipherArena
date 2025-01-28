import { start_mongo } from "$db/mongo";
import { authenticate } from "$db/auth/authenticate";
import { redirect } from "@sveltejs/kit";


export const handle = async ({ event, resolve }) => {
	const is_protected = event.url.pathname.startsWith("/home")

	const auth = authenticate(event.cookies);

	if (is_protected && !auth) {
		throw redirect(308, "/");
	}

	if (auth && event.url.pathname=='/') {
		throw redirect(303, "/home");
	}

	await start_mongo();
	const response = await resolve(event);

	return response;
};
