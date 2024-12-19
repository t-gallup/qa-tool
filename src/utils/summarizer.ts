import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

// Cache for storing summaries
const summaryCache = new LRUCache({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 60 * 24, // 24 hour TTL
});

// Generate hash for text content
const generateHash = (text: string): string => {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex');
};

// Extract key sentences based on importance indicators
const extractKeyContent = (text: string): string[] => {
  const keyPhrases = [
    'conclusion',
    'results show',
    'we found',
    'demonstrates',
    'in summary',
    'findings indicate',
    'study shows',
    'abstract',
    'objective',
    'methodology'
  ];

  // Split into sentences (basic implementation)
  const sentences = text.split(/[.!?]\s+/);
  
  // Score each sentence based on various factors
  const scoredSentences = sentences.map(sentence => ({
    text: sentence,
    score: scoreForImportance(sentence, keyPhrases)
  }));

  // Sort by score and take top sentences
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.text);
};

// Score sentence importance based on multiple factors
const scoreForImportance = (sentence: string, keyPhrases: string[]): number => {
  const lowerSentence = sentence.toLowerCase();
  let score = 0;

  // Key phrase presence
  score += keyPhrases.reduce((sum, phrase) => 
    sum + (lowerSentence.includes(phrase) ? 2 : 0), 0
  );

  // Length factor (prefer medium-length sentences)
  const words = sentence.split(/\s+/).length;
  if (words >= 10 && words <= 30) score += 1;

  // Contains numbers (likely statistical findings)
  if (/\d+/.test(sentence)) score += 1;

  // Contains quotes
  if (/"[^"]+"/.test(sentence)) score += 1;

  return score;
};

export const generateQuickSummary = async (text: string): Promise<{ summary: string[], hash: string }> => {
  const hash = generateHash(text);
  
  // Check cache first
  const cached = summaryCache.get(hash);
  if (cached) {
    return { summary: cached as string[], hash };
  }

  // Generate new summary
  const summary = extractKeyContent(text);
  
  // Cache the result
  summaryCache.set(hash, summary);

  return { summary, hash };
};
