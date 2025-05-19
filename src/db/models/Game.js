import mongoose from "mongoose";
import {cipherTypes} from "../../lib/util/CipherTypes.js";

const GameSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    params: {
        cipherType: {
            type: String,
            enum: Object.keys(cipherTypes),
            required: true
        },
        K: {
            type: String,
            default: '-1'
        },
        Solve: {
            type: String,
            enum: ['Decode', 'Encode'],
            default: 'Decode'
        }
    },
    autoFocus: {
        type: Boolean,
        default: false
    },
    quote: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quote',
            required: true
        },
        encodedText: {
            type: String,
            required: true
        },
        keys: {
            type: [String],
            required: true
        }
    },
    mode: {
        type: String,
        enum: ['private', 'public', 'ranked'],
        required: true
    },
    users: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserGame'
        }],
        validate: [arrayLimit, 'Games are limited to 2 players.']
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserGame',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    state: {
        type: String,
        enum: ['waiting', 'started', 'finished'],
        default: 'waiting'
    },
    lastMatchResult: {
        type: {
            winner: String,
            players: [
            {
                username: String,
                elo: Number
            }
            ],
            eloChanges: {
            type: Map,
            of: Number
            }
        },
        default: null
    }
}, { collection: 'games' });

function arrayLimit(val) {
    return val.length <= 2;
}

export const Game = mongoose.models.Game || mongoose.model("Game", GameSchema);