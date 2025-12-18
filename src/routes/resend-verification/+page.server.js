import { UserAuth } from '$models/UserAuth';
import { createVerificationToken } from '$auth/verify';
import { sendVerificationEmail } from '$auth/mailer';

const RATE_LIMIT_MINUTES = 5;
const EXPIRE_LIMIT_MINUTES = 20;

/** @type {import('./$types').PageLoad} */
export async function load({cookies}) {
    try {
        const user = await UserAuth.findOne({ username: cookies.get("username") });
        if (!user) return { message: "User not found.", sent: false };

        if (user.verified) return { message: "User already verified.", sent: false };

        const now = new Date();
        if (user.lastVerificationRequest) {
            const timeDiff = (now - user.lastVerificationRequest) / 1000 / 60;
            if (timeDiff < RATE_LIMIT_MINUTES) {
                return { message: `In order to prevent spam-sending verification emails, we have not sent another email. Please wait ${Math.ceil(RATE_LIMIT_MINUTES - timeDiff)} ${(Math.ceil(RATE_LIMIT_MINUTES - timeDiff)) == 1 ? "minute":"minutes"} before trying again.`, sent: false};
            }
        }

        const token = await createVerificationToken(user, EXPIRE_LIMIT_MINUTES);

        await sendVerificationEmail(user.email, token, EXPIRE_LIMIT_MINUTES);

        user.lastVerificationRequest = now;
        await user.save();

        return { message: "Verification email resent to " + user.email + ". Check your inbox and spam folder.", sent: true };
    } catch (error) {
        console.error("Error in resend verification:", error);
        return { message: "Internal server error.", sent: false };
    }
}
