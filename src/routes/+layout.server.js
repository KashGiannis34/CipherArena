/** @type {import('./$types').LayoutServerLoad} */
export function load({ cookies }) {
	const username = cookies.get("username") ?? "";
	const email = cookies.get("email") ?? "";

	return { username, email };
}