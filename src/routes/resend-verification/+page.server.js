import { VerificationToken } from '$db/models/VerificationToken';
import { UserAuth } from '$db/models/UserAuth';
import { createVerificationToken } from '$db/auth/verify';
import { sendVerificationEmail } from '$db/auth/mailer';
import { Cookies } from "@sveltejs/kit";

const RATE_LIMIT_MINUTES = 0;
const EXPIRE_LIMIT_MINUTES = 20;

/** @type {import('./$types').PageLoad} */
export async function load({cookies}) {
    try {
        // Find the user in MongoDB
        const user = await UserAuth.findOne({ username: cookies.get("username") });
        if (!user) return { message: "User not found.", sent: false };

        // Check if user is already verified
        if (user.verified) return { message: "User already verified.", sent: false };

        // Enforce rate limit
        const now = new Date();
        if (user.lastVerificationRequest) {
            const timeDiff = (now - user.lastVerificationRequest) / 1000 / 60; // Convert ms to minutes
            if (timeDiff < RATE_LIMIT_MINUTES) {
                return { message: `In order to prevent spam-sending verification emails, we have not sent another email. Please wait ${Math.ceil(RATE_LIMIT_MINUTES - timeDiff)} ${(Math.ceil(RATE_LIMIT_MINUTES - timeDiff)) == 1 ? "minute":"minutes"} before trying again.`, sent: false};
            }
        }

        // Generate new verification token
        const token = await createVerificationToken(user, EXPIRE_LIMIT_MINUTES);

        // Send email
        await sendVerificationEmail(user.email, token, EXPIRE_LIMIT_MINUTES);

        // Update last verification request timestamp
        user.lastVerificationRequest = now;
        await user.save();

        return { message: "Verification email resent to " + user.email + ". Check your inbox and spam folder.", sent: true };
    } catch (error) {
        console.error("Error in resend verification:", error);
        return { message: "Internal server error.", sent: false };
    }
}
