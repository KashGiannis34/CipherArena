import mongoose from 'mongoose';

const WordSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    length: { type: Number, required: true },
  },
  { collection: 'words' }
);

WordSchema.index({ length: 1 });

export const Word = mongoose.models.Word || mongoose.model('Word', WordSchema);
