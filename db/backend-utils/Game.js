import mongoose from "mongoose";
import {cipherTypes} from "../shared-utils/CipherTypes.js";

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
    playerLimit: {
        type: Number,
        min: 2,
        max: 6,
        default: 2,
        required: true
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
            type: [String],
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
        validate: {
            validator: function(val) {
                return val.length <= this.playerLimit;
            },
            message: 'Game has reached its player limit.'
        }
    },
    metadata: {
        initialUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserGame' }],
        startedAt: {
            type: Date,
            default: Date.now
        },
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
            },
            solveTime: Number,
            plainText: String,
            forfeit: { type: Boolean, default: false }
        },
        default: null
    }
}, { collection: 'games' });

export const Game = mongoose.models.Game || mongoose.model("Game", GameSchema);