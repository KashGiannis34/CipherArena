/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
  const username = cookies.get("username") || "HelloKitty34";

  return { username };
}
