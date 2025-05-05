import mongoose from "mongoose";
// remember: ref true
const VerificationTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'UserAuth'},
  token: { type: String, required: true },
  expires: { type: Date, required: true },
}, { collection: 'verify_token' });

export const VerificationToken = mongoose.models.VerificationToken || mongoose.model("VerificationToken", VerificationTokenSchema);
