import { register_user } from '$auth/register';
import { UserAuth } from '$models/UserAuth';
import {login_user} from '$auth/login';
import { fail, redirect } from '@sveltejs/kit';
import { cookie_options } from '$utils/dbUtil';
import { createVerificationToken } from '$auth/verify';
import { sendVerificationEmail } from '$auth/mailer';
import { verifyCaptchaFromFormData } from '$utils/captchaUtil';

import { authenticate } from '$utils/authenticate.js';

export function load({ cookies }) {
    const auth = authenticate(cookies.get('auth-token'));
    if (auth) {
        throw redirect(303, '/profile');
    }
}


/** @satisfies {import('./$types').Actions} */
export const actions = {
    default: async ({request, getClientAddress}) => {
        const data = await request.formData();
        const username = data.get('username');
		const email = data.get('email');
		const password = data.get('password');
        const confirmPass = data.get('confirmPassword');

        const captchaResult = await verifyCaptchaFromFormData(data, getClientAddress());
        if (!captchaResult.success) {
            return fail(400, {
                error: captchaResult.error || 'Captcha verification failed. Please try again.',
                email,
                username
            });
        }

		const { error } = await register_user(username, email, password, confirmPass);

		if (error) {
			return fail(400, { error, email, username });
		}

        try {
            const limit = 20; // minutes
            const user = await UserAuth.findOne({email});
            const token = await createVerificationToken(user, limit);

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