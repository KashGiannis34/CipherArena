import { UserAuth } from '$models/UserAuth';
import {login_user} from '$auth/login';
import { fail, error } from '@sveltejs/kit';
import { cookie_options } from '$utils/dbUtil';
import { joinGame } from '$game/joinGame';

import { redirect } from '@sveltejs/kit';
import { authenticate } from '$utils/authenticate.js';

export function load({ cookies }) {
  const auth = authenticate(cookies.get('auth-token'));
  if (auth) {
    throw redirect(303, '/profile');
  }
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
    default: async ({cookies, request}) => {
        const data = await request.formData();

        const email = data.get("email");
        const password = data.get("password");

        const user_data = await login_user(email, password);

        if ("error" in user_data) {
            return fail(400, { email, error: user_data.error, roomId: data.get("roomId") });
        } else {
            const { token, user } = user_data;

            cookies.set("auth-token", token, cookie_options);
            cookies.set("email", user.email, cookie_options);
            cookies.set("username", user.username, cookie_options);
            cookies.set("verified", user.verified, cookie_options);

            redirect(303, '/game-lobby/'+data.get("roomId"));
        }
    }
};