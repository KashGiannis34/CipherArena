import mongoose from "mongoose";

const UserGameSchema = new mongoose.Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAuth',
      required: true
    },
    username: {
      type: String, required: true,
      unique: true,
    },
    elo: {
      type: Number,
      default: 1200
    },
    currentSocketId: {
      type: String,
      default: null
    },
    currentGame: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: null
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    }
}, { collection: 'users_game' });

export const UserGame = mongoose.models.UserGame || mongoose.model("UserGame", UserGameSchema);