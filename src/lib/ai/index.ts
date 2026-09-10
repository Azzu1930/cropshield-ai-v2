import type { AIService } from './ai-service.interface';
import { RuleBasedAIService } from './rule-based-service';
import { GeminiAIService } from './gemini-service';

export * from './ai-service.interface';
export * from './rule-based-service';
export * from './gemini-service';

export function getAIService(): AIService {
  const provider = (process.env.AI_PROVIDER || 'rule-based').toLowerCase();
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    return new GeminiAIService();
  }
  return new RuleBasedAIService();
}
