import { cipherTypes } from "../../lib/util/CipherTypes.js";
import mongoose from "mongoose";

const CipherStatsSchema = new mongoose.Schema({
	elo: { type: Number, default: 1200 },
	wins: { type: Number, default: 0 },
	losses: { type: Number, default: 0 }
}, { _id: false });

const statsShape = {};
const allTypes = [...Object.keys(cipherTypes), 'All'];
for (const type of allTypes) {
	statsShape[type] = { type: CipherStatsSchema, default: () => ({}) };
}

const UserGameSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  stats: {
		type: statsShape,
		default: () => {
			const initial = {};
			for (const type of Object.keys(cipherTypes)) {
				initial[type] = {
					elo: 1200,
					wins: 0,
					losses: 0
				};
			}
			return initial;
		}
	},
  currentSocketId: {
    type: String,
    default: null
  },
  currentGame: {
    type: String,
    ref: 'Game',
    default: null
  }
}, { collection: 'users_game' });

export const UserGame = mongoose.models.UserGame || mongoose.model("UserGame", UserGameSchema);