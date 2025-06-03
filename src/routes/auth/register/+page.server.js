import { register_user } from '$db/auth/register';
import { UserAuth } from '$db/models/UserAuth';
import { fail } from '@sveltejs/kit';
import { Cookies } from "@sveltejs/kit";
import { redirect } from '@sveltejs/kit';
import { createVerificationToken } from '$db/auth/verify';
import { sendVerificationEmail } from '$db/auth/mailer';
import { authenticate } from '$db/auth/authenticate.js';

export function load({ cookies }) {
  const auth = authenticate(cookies.get('auth-token'));
  if (auth) {
    throw redirect(303, '/profile');
  }
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
    register: async ({request, url}) => {
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
                message: "",
                redirect: (data.get("roomId") ? "/auth/login"+"?roomId="+data.get("roomId") : '/')
            };
        } catch (err) {
            console.error("Error sending verification email:", err);
            return fail(500, { error: "Registration successful, but failed to send verification email." });
        }
    }
};