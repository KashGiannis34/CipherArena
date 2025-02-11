import {mongoose} from 'mongoose';

const QuoteSchema = new mongoose.Schema({
    author: { type: String, required: true },
    text: { type: String, required: true },
    length: {type: Number, required: true}
}, { collection: 'quotes' });

export const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);