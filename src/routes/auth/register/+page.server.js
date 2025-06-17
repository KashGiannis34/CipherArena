import { register_user } from '$db/auth/register';
import { UserAuth } from '$db/models/UserAuth';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { createVerificationToken } from '$db/auth/verify';
import { sendVerificationEmail } from '$db/auth/mailer';
import { authenticate } from '$dbutils/authenticate.js';

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
			return fail(400, { error, roomId: data.get("roomId"), email, username });
		}

        try {
            const limit = 20; // minutes
            const user = await UserAuth.findOne({
            email: { $regex: `^${email}$`, $options: 'i' }
            });
            // Generate verification token
            const token = await createVerificationToken(user, limit);

            // Send verification email
            await sendVerificationEmail(email, token, limit);
        } catch (err) {
            console.error("Error sending verification email:", err);
        } finally {
            redirect(303, (data.get("roomId") ? "/auth/login"+"?roomId="+data.get("roomId") : '/'));
        }
    }
};