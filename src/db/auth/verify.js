import crypto from "crypto";
import { VerificationToken } from "$db/models/VerificationToken"; // Ensure you have a VerificationToken model
import { UserAuth } from "$db/models/UserAuth";

export async function createVerificationToken(user) {
    if (!user) {
        throw new Error("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 20);
    const now = new Date();

    // Delete any existing verification tokens for this user
    try {
        await VerificationToken.deleteMany({ userId: user._id, expires: {$lt: now} });
    } catch (err) {
        return err.toString();
    }

    const verifyToken = new VerificationToken({
        userId: user._id,
		token: token,
		expires: expires,
	});

	try {
		await verifyToken.save();
		return token;
	} catch (err) {
		return err.toString();
	}
}