import { VerificationToken } from '$models/VerificationToken';
import { UserAuth } from '$models/UserAuth';
import { cookie_options } from '$utils/dbUtil';

/** @type {import('./$types').PageLoad} */
export async function load({params, url, cookies}) {
    const token = url.searchParams.get("token");

    if (!token) {
        return { message: "Invalid Verification Link.", isSuccess: false };
    }

    try {
        if (!token) return { message: "Invalid or missing token.", isSuccess: false };

        const verificationToken = await VerificationToken.findOne({ token });
        if (!verificationToken || verificationToken.mode != "create") return { message: "Invalid or expired token.", isSuccess: false };

        if (new Date() > verificationToken.expires) {
            await VerificationToken.deleteOne({ _id: verificationToken._id });
            return { message: "Verification link has expired. Please request a new one.", isSuccess: false };
        }

        const user = await UserAuth.findOne({ _id: verificationToken.userId });
        if (!user) return { message: "User Not Found.", isSuccess: false };

        user.verified = true;
        cookies.set("verified", true, cookie_options);
        await user.save();

        await VerificationToken.deleteOne({ _id: verificationToken._id });
        return { message: "Email successfully verified! You can now log in.", isSuccess: true }
    } catch (error) {
        console.error("Error verifying email:", error);
        return { message: "Internal Server Error.", isSuccess: false };
    }
}