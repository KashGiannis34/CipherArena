import { UserAuth } from '$db/models/UserAuth';
import {login_user} from '$db/auth/login';
import { fail, error } from '@sveltejs/kit';
import { Cookies } from "@sveltejs/kit";
import { cookie_options } from '$db/dbUtil';
import { joinGame } from '$db/joinGame';

/** @satisfies {import('./$types').Actions} */
export const actions = {
    login: async ({cookies, request}) => {
        const data = await request.formData();

        const email = data.get("email");
        const password = data.get("password");

        if (!email || !password) {
            throw error(400, {
                message: 'Email and password are required'
            });
        }

        const user_data = await login_user(email, password);

        if ("error" in user_data) {
            return fail(400, { email, error: user_data.error });
        } else {
            const { token, user } = user_data;

            cookies.set("auth-token", token, {
                httpOnly: true,
                secure: true,
                path: "/",
                maxAge: 60 * 60 * 24,
            });

            cookies.set("auth-token", token, cookie_options);
            cookies.set("email", user.email, cookie_options);
            cookies.set("username", user.username, cookie_options);
            cookies.set("verified", user.verified, cookie_options);

            return {redirect: ('/game-lobby/'+data.get("roomId"))};
        }
    }
};