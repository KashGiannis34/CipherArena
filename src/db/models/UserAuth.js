import mongoose from "mongoose";

const UserAuthSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
}, { collection: 'users_auth' });

export const UserAuth = mongoose.model("UserAuth", UserAuthSchema);