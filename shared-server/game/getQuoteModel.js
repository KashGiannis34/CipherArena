import { Quote } from '../models/Quote.js';
import { SpanishQuote } from '../models/SpanishQuote.js';

/**
 * Returns the appropriate quote model based on cipher type.
 * @param {string} cipherType - The type of cipher (e.g., "Aristocrat", "Xenocrypt").
 * @returns {mongoose.Model} - The correct Mongoose model to query.
 */
export function getQuoteModel(cipherType) {
  return cipherType === 'Xenocrypt' ? SpanishQuote : Quote;
}
