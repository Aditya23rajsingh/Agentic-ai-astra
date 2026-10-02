import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export type AIProvider = 'openai' | 'anthropic';

export function getDefaultProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'openai';
}

export const AI_MODELS = {
  openai: {
    default: 'gpt-4o',
    fast: 'gpt-4o-mini',
    reasoning: 'o1-preview',
  },
  anthropic: {
    default: 'claude-3-5-sonnet-20241022',
    fast: 'claude-3-haiku-20240307',
    reasoning: 'claude-3-opus-20240229',
  },
} as const;

export const AGENT_CONFIG = {
  maxSteps: 10,
  maxToolCallsPerStep: 3,
  stepTimeoutMs: 60000,
  totalTimeoutMs: 300000,
  maxTokensPerResponse: 4096,
  temperature: 0.7,
} as const;