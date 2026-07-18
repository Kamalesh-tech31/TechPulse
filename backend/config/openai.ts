import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: Groq | null = null;

export function getAIClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'xai-********************************') {
    console.warn('GROQ_API_KEY is not set or using placeholder. Running in Simulation/Fallback Mode.');
    return null;
  }
  
  // Clean spaces from key (e.g. if copy-pasted with spaces)
  const cleanedKey = key.replace(/\s+/g, '');
  
  if (!aiClient) {
    console.log('Groq Key Loaded: YES');
    aiClient = new Groq({
      apiKey: cleanedKey,
    });
  }
  return aiClient;
}
