import { customAlphabet } from 'nanoid';
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // avoids confusing chars
export const generateShortCode = customAlphabet(alphabet, 6);