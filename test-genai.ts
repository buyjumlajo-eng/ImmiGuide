import { GoogleGenAI } from '@google/genai';
try {
  new GoogleGenAI({ apiKey: '' });
  console.log('success');
} catch (e) {
  console.error('error:', e);
}
