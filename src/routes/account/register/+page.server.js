import { register_user } from '$db/auth/register';
import { UserAuth } from '$db/models/UserAuth';
import {login_user} from '$db/auth/login';
import { fail, redirect } from '@sveltejs/kit';
import { cookie_options } from '$dbutils/dbUtil';
import { createVerificationToken } from '$db/auth/verify';
import { sendVerificationEmail } from '$db/auth/mailer';
import { verifyCaptchaFromFormData } from '$dbutils/captchaUtil';

import { authenticate } from '$dbutils/authenticate.js';

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

        // Verify captcha
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