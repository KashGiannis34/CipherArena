import mongoose from 'mongoose';

const SpanishQuoteSchema = new mongoose.Schema({
    author: { type: String, required: true },
    text: { type: String, required: true },
    length: {type: Number, required: true}
}, { collection: 'spanish_quotes' });

export const SpanishQuote = mongoose.models.SpanishQuote || mongoose.model('SpanishQuote', SpanishQuoteSchema);