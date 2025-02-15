/** @type {import('./$types').LayoutServerLoad} */
export function load({ cookies }) {
	const username = cookies.get("username") ?? "";
	const email = cookies.get("email") ?? "";
	const verified = cookies.get("verified") ?? true;

	return { username, email, verified };
}