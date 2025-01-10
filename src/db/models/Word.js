import {mongoose} from 'mongoose';

const WordSchema = new mongoose.Schema({
    text: { type: String, required: true },
    length: { type: Number, required: true }
}, { collection: 'words' });

export const Word = mongoose.model('Word', WordSchema);