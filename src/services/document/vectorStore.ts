import { DocumentChunk } from '../../types/document';

/**
 * In-Memory Vector & TF-IDF Retrieval Engine for Grounded Legal RAG.
 * Unicode-aware: Preserves Kannada script (\u0C80-\u0CFF), Devanagari, and Indian legal multilingual terms.
 */

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
}

export class InMemoryVectorStore {
  private chunks: DocumentChunk[] = [];
  private tfidfMap: Map<string, Map<string, number>> = new Map(); // chunkId -> (term -> weight)

  constructor(chunks: DocumentChunk[]) {
    this.chunks = chunks;
    this.buildIndex();
  }

  private buildIndex(): void {
    for (const chunk of this.chunks) {
      const terms = tokenize(chunk.text);
      const termFreq = new Map<string, number>();

      for (const term of terms) {
        termFreq.set(term, (termFreq.get(term) || 0) + 1);
      }

      // Normalize frequency
      const weights = new Map<string, number>();
      const totalTerms = Math.max(1, terms.length);
      for (const [term, count] of termFreq.entries()) {
        weights.set(term, count / totalTerms);
      }
      this.tfidfMap.set(chunk.id, weights);
    }
  }

  public search(query: string, topK: number = 3): RetrievalResult[] {
    const queryTerms = tokenize(query);
    if (queryTerms.length === 0 || this.chunks.length === 0) {
      return [];
    }

    const scores: { chunk: DocumentChunk; score: number }[] = [];

    for (const chunk of this.chunks) {
      const chunkWeights = this.tfidfMap.get(chunk.id);
      if (!chunkWeights) continue;

      let score = 0;
      for (const qTerm of queryTerms) {
        if (chunkWeights.has(qTerm)) {
          score += chunkWeights.get(qTerm)! * 2.0;
        }
      }

      // Boost section header match
      if (chunk.sectionHeader) {
        const headerTerms = tokenize(chunk.sectionHeader);
        for (const qTerm of queryTerms) {
          if (headerTerms.includes(qTerm)) {
            score += 1.5;
          }
        }
      }

      // Keyword match boost for exact terms appearing in chunk text
      const chunkLower = chunk.text.toLowerCase();
      for (const qTerm of queryTerms) {
        if (qTerm.length > 2 && chunkLower.includes(qTerm)) {
          score += 0.5;
        }
      }

      if (score > 0) {
        scores.push({ chunk, score });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }
}

/**
 * Unicode-aware tokenizer supporting English, Kannada (\u0C80-\u0CFF), and mixed-language text.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];

  // Unicode NFC normalization
  const normalized = text.normalize('NFC').toLowerCase();

  // Extract terms matching Latin letters, Numbers, or Kannada/Indic scripts (\u0C80-\u0CFF)
  const tokens = normalized.match(/[\p{L}\p{N}\u0C80-\u0CFF]+/gu) || [];

  return tokens.filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'you', 'are', 'not', 'have', 'from',
  'shall', 'will', 'may', 'any', 'all', 'been', 'which', 'such', 'other', 'were'
]);
