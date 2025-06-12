import { cipherTypes } from "../shared-utils/CipherTypes.js";
import mongoose from "mongoose";

const CipherStatsSchema = new mongoose.Schema({
  elo: { type: Number, default: 1000 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  averageSolveTime: { type: Number, default: null },
  bestSolveTime: { type: Number, default: null },
  solveTimes: {
    type: [{
      time: { type: Number, required: true },
      length: { type: Number, required: true }
    }],
    default: []
  }
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
					elo: 1000,
					wins: 0,
					losses: 0,
          solveTimes: [],
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
  },
  profilePicture: {
    type: String,
    default: 'default'
  }
}, { collection: 'users_game' });

export const UserGame = mongoose.models.UserGame || mongoose.model("UserGame", UserGameSchema);