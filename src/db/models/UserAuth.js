import mongoose from "mongoose";

const UserAuthSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    lastVerificationRequest: { type: Date },
    currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },
}, { collection: 'users_auth' });

export const UserAuth = mongoose.models.UserAuth || mongoose.model("UserAuth", UserAuthSchema);