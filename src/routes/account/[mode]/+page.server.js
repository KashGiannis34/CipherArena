import { register_user } from '$db/auth/register';
import { UserAuth } from '$db/models/UserAuth';
import {login_user} from '$db/auth/login';
import { error, fail } from '@sveltejs/kit';
import { Cookies } from "@sveltejs/kit";
import { cookie_options } from '$db/dbUtil';
import { createVerificationToken } from '$db/auth/verify';
import { sendVerificationEmail } from '$db/auth/mailer';

import { redirect } from '@sveltejs/kit';
import { authenticate } from '$db/auth/authenticate.js';

export function load({ params, cookies }) {
    const auth = authenticate(cookies.get('auth-token'));
    if (auth) {
        throw redirect(303, '/profile');
    }

    const mode = params.mode;

    if (mode !== 'login' && mode !== 'register') {
        throw error(404, 'Invalid account mode');
    }

    return { login: mode === 'login' };
}


/** @satisfies {import('./$types').Actions} */
export const actions = {
    login: async ({cookies, request}) => {
        const data = await request.formData();

		const email = data.get("email");
		const password = data.get("password");

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

            return {redirect: "/profile"};
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
		}

        try {
            const limit = 20; // minutes
            const user = await UserAuth.findOne({email});
            // Generate verification token
            const token = await createVerificationToken(user, limit);

            // Send verification email
            await sendVerificationEmail(email, token, limit);

            return {
                message: "Registration successful! Check " + email + " to verify your account before logging in. Check your inbox and spam folder."
            };
        } catch (err) {
            console.error("Error sending verification email:", err);
            return fail(500, { error: "Registration successful, but failed to send verification email. Please try again later." });
        }
    }
};