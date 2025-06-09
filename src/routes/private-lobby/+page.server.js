import { error } from '@sveltejs/kit';
import { authenticate } from '$db/auth/authenticate';
import { Cookies } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export async function load({cookies}) {
    const auth = authenticate(cookies.get("auth-token"));
    if (!auth) {
        throw error(401, {
            message: 'You must be logged in to access the lobby'
        });
    }
}