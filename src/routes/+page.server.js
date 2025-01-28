import { register_user } from '$db/auth/register';
import {login_user} from '$db/auth/login';
import { fail } from '@sveltejs/kit';
import { Cookies } from "@sveltejs/kit";
import { cookie_options } from '$db/dbUtil';
import { redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
    login: async ({cookies, request}) => {
        const data = await request.formData();

		const email = data.get("email");
		const password = data.get("password");

        const user_data = await login_user(email, password);
        console.log(user_data);


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

            return redirect(303, '/home');
		}
    },
    register: async ({request}) => {
        const data = await request.formData();
        const username = data.get('username');
		const email = data.get('email');
		const password = data.get('password');
        const confirmPass = data.get('confirmPassword');

		const { error } = await register_user(username, email, password, confirmPass);

		if (error) {
			return fail(400, { error });
		} else {
			const message = "Registration successful! You can now login.";
			return { message };
		}
    }
};