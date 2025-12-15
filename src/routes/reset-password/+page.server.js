import { fail } from '@sveltejs/kit';
import { UserAuth } from '$db/models/UserAuth';
import { VerificationToken } from '$db/models/VerificationToken';
import pkg from 'argon2';
import { verify_password } from '$db/auth/register';
const argon2 = pkg;

const TOKEN_EXPIRATION_MINUTES = 20;

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const token = data.get('token');

    if (!token || typeof token !== 'string') {
        return fail(400, { error: 'Invalid or missing reset token.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        return fail(400, { error: 'Password must be at least 6 characters.' });
    }

    if (password !== confirmPassword) {
        return fail(400, { error: 'Passwords do not match.' });
    }

    try {
        const tokenDoc = await VerificationToken.findOne({ token, mode: 'reset' });
        if (!tokenDoc || tokenDoc.mode !== 'reset') {
        return fail(400, { error: 'Reset link is invalid or expired.' });
        }

        const now = new Date();
        const createdAt = new Date(tokenDoc.createdAt);
        const ageMinutes = (now - createdAt) / 1000 / 60;

        if (ageMinutes > TOKEN_EXPIRATION_MINUTES) {
            await tokenDoc.deleteOne();
            return fail(400, { error: 'Reset link has expired.' });
        }

        const user = await UserAuth.findById(tokenDoc.userId);
        if (!user) {
            return fail(400, { error: 'User not found.' });
        }

        const password_error = verify_password(password, confirmPassword);
        if (password_error) return { error: password_error };

        const hashed_password = await argon2.hash(password);

        user.password = hashed_password;
        await user.save();
        await tokenDoc.deleteOne();

        return { message: 'Password successfully reset! You may now log in.' };
    } catch (err) {
        console.error('Password reset error:', err);
        return fail(500, { error: 'An error occurred. Please try again.' });
    }
  }
};