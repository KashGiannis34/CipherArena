import { VerificationToken } from '$db/models/VerificationToken';
import { UserAuth } from '$db/models/UserAuth';
import { Cookies } from "@sveltejs/kit";
import { cookie_options } from '$db/dbUtil';

/** @type {import('./$types').PageLoad} */
export async function load({params, url, cookies}) {
    const token = url.searchParams.get("token");

    if (!token) {
        return { message: "Invalid Verification Link.", isSuccess: false };
    }

    try {
        if (!token) return { message: "Invalid or missing token.", isSuccess: false };

        // Find the token in the database
        const verificationToken = await VerificationToken.findOne({ token });
        if (!verificationToken) return { message: "Invalid or expired token.", isSuccess: false };

        // Check if token is expired
        if (new Date() > verificationToken.expires) {
            await VerificationToken.deleteOne({ _id: verificationToken._id }); // Clean up expired token
            return { message: "Verification link has expired. Please request a new one.", isSuccess: false };
        }

        // Find the user and mark as verified
        const user = await UserAuth.findById(verificationToken.userId);
        if (!user) return { message: "User Not Found.", isSuccess: false };

        user.verified = true;
        cookies.set("verified", true, cookie_options);
        await user.save();

        // Delete the used verification token
        await VerificationToken.deleteOne({ _id: verificationToken._id });
        return { message: "Email successfully verified! You can now log in.", isSuccess: true }
    } catch (error) {
        console.error("Error verifying email:", error);
        return { message: "Internal Server Error.", isSuccess: false };
    }
}