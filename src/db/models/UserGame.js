import { cipherTypes } from "../../lib/util/CipherTypes.js";
import mongoose from "mongoose";

const defaultEloRatings = Object.fromEntries(
  Object.keys(cipherTypes).map(type => [type, 1200])
);

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
    eloRatings: {
      type: Object,
      default: defaultEloRatings
    },
    currentSocketId: {
      type: String,
      default: null
    },
    currentGame: {
      type: String,
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