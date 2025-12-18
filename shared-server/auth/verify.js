import crypto from "crypto";
import { VerificationToken } from "../models/VerificationToken.js";
import { UserAuth } from "../models/UserAuth.js";

export async function createVerificationToken(user, limit, mode = "create") {
    if (!user) {
        throw new Error("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * limit);
    const now = new Date();

    // Delete any existing verification tokens for this user for that specific mode
    try {
        await VerificationToken.deleteMany({ userId: user._id, expires: {$lte: now}, mode: mode });
    } catch (err) {
        return err.toString();
    }

    const verifyToken = new VerificationToken({
        userId: user._id,
		token: token,
		expires: expires,
        mode: mode
	});

	try {
		await verifyToken.save();
		return token;
	} catch (err) {
		return err.toString();
	}
}
