import mongoose from 'mongoose';

const MONGO_URI = "test";
const QuoteSchema = new mongoose.Schema({
    author: { type: String, required: true },
    text: { type: String, required: true }
}, { collection: 'quotes' });

const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);

async function testConnection() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "cipher_arena"
    });
    console.log('MongoDB connected');

    const quotes = await Quote.find({});
    console.log('Items from DB:', quotes);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

testConnection();