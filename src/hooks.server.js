import { start_mongo } from "$db/mongo.js";


/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	await start_mongo();
}
