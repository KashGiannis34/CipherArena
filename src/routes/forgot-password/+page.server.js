import { json, fail } from '@sveltejs/kit';
import { UserAuth } from '$models/UserAuth';
import { createVerificationToken } from '$auth/verify';
import { sendPasswordResetEmail } from '$auth/mailer';

const RATE_LIMIT_MINUTES = 5;
const EXPIRE_LIMIT_MINUTES = 20;

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get("email");

    if (!email || typeof email !== "string") {
      return fail(400, { error: "Please enter a valid email address." });
    }

    try {
      const user = await UserAuth.findOne({ email });

      if (user) {
        const now = new Date();

        if (user.lastPasswordResetRequest) {
          const minutesSinceLast = (now - user.lastPasswordResetRequest) / 1000 / 60;
          if (minutesSinceLast < RATE_LIMIT_MINUTES) {
            return fail(429, {
              error: `You can only request a password reset every ${RATE_LIMIT_MINUTES} minute(s). Please wait  ${Math.ceil(RATE_LIMIT_MINUTES - minutesSinceLast)} minute(s) before trying again.`
            });
          }
        }

        const token = await createVerificationToken(user, EXPIRE_LIMIT_MINUTES, "reset");
        await sendPasswordResetEmail(email, token, EXPIRE_LIMIT_MINUTES);

        user.lastPasswordResetRequest = now;
        await user.save();
      }

      return {
        message: "If an account exists for that email, a reset link has been sent."
      };
    } catch (err) {
      console.error("Error sending password reset email:", err);
      return fail(500, { error: "Something went wrong. Please try again later." });
    }
  }
};